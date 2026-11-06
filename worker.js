'use strict';

import { createClient } from '@supabase/supabase-js';

const ACCESS_COOKIE = 'tg_access_token';
const REFRESH_COOKIE = 'tg_refresh_token';
const COOKIE_AGE = 7 * 24 * 60 * 60;

function json(data, status = 200, cookies = []) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });

  for (const cookie of cookies) {
    headers.append('Set-Cookie', cookie);
  }

  return new Response(JSON.stringify(data), { status, headers });
}

function readCookies(request) {
  const result = {};

  for (const part of (request.headers.get('Cookie') || '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;

    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    try {
      result[name] = decodeURIComponent(value);
    } catch {
      result[name] = value;
    }
  }

  return result;
}

function makeCookie(name, value, maxAge = COOKIE_AGE) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function sessionCookies(session) {
  return [
    makeCookie(ACCESS_COOKIE, session.access_token),
    makeCookie(REFRESH_COOKIE, session.refresh_token)
  ];
}

function clearCookies() {
  return [
    makeCookie(ACCESS_COOKIE, '', 0),
    makeCookie(REFRESH_COOKIE, '', 0)
  ];
}

function getClient(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Configuração do Supabase incompleta.');
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function safeUser(user) {
  return user ? { id: user.id, email: user.email } : null;
}

async function handleAuth(request, env, path) {
  const supabase = getClient(env);

  if (path === '/api/auth/register' && request.method === 'POST') {
    const body = await readBody(request);
    const email = body?.email;
    const password = body?.password;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      password.length < 8
    ) {
      return json({
        success: false,
        message: 'Indica um email válido e uma palavra-passe com pelo menos 8 caracteres.'
      }, 400);
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: new URL('/', request.url).origin
      }
    });

    if (error) {
      return json({ success: false, message: error.message }, 400);
    }

    return json({
      success: true,
      message: 'Registo processado.',
      user: safeUser(data.user),
      sessionCreated: Boolean(data.session)
    }, 201, data.session ? sessionCookies(data.session) : []);
  }

  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await readBody(request);
    const email = body?.email;
    const password = body?.password;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return json({
        success: false,
        message: 'Email e palavra-passe são obrigatórios.'
      }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error || !data.session) {
      return json({
        success: false,
        message: 'Não foi possível iniciar sessão. Verifica os dados e confirma o email, se necessário.'
      }, 401);
    }

    return json({
      success: true,
      user: safeUser(data.user)
    }, 200, sessionCookies(data.session));
  }


  // Enviar email de recuperação de palavra-passe.
  if (path === '/api/auth/recover' && request.method === 'POST') {
    const body = await readBody(request);
    const email = body?.email;

    if (typeof email !== 'string' || !email.trim()) {
      return json({ success: false, message: 'Indica o teu email.' }, 400);
    }

    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${origin}/?auth=recovery` }
    );

    if (error) {
      return json({
        success: false,
        message: 'Não foi possível enviar o email. Tenta novamente mais tarde.'
      }, 400);
    }

    return json({
      success: true,
      message: 'Se existir uma conta com esse email, receberás instruções para recuperar o acesso.'
    });
  }

  // Reenviar confirmação de registo.
  if (path === '/api/auth/resend-confirmation' && request.method === 'POST') {
    const body = await readBody(request);
    const email = body?.email;

    if (typeof email !== 'string' || !email.trim()) {
      return json({ success: false, message: 'Indica o teu email.' }, 400);
    }

    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: origin }
    });

    if (error) {
      return json({
        success: false,
        message: 'Não foi possível reenviar. Verifica o email ou tenta mais tarde.'
      }, 400);
    }

    return json({
      success: true,
      message: 'Se a confirmação ainda estiver pendente, será enviado um novo email.'
    });
  }

  // Validar os tokens recebidos no link de recuperação e criar cookies seguros.
  if (path === '/api/auth/recovery-session' && request.method === 'POST') {
    const body = await readBody(request);
    const access_token = body?.access_token;
    const refresh_token = body?.refresh_token;

    if (
      typeof access_token !== 'string' ||
      typeof refresh_token !== 'string' ||
      !access_token ||
      !refresh_token
    ) {
      return json({ success: false, message: 'Link de recuperação inválido.' }, 400);
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({ access_token, refresh_token });

    if (sessionError || !sessionData.session) {
      return json({
        success: false,
        message: 'O link expirou ou já não é válido. Solicita outro email.'
      }, 401);
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return json({ success: false, message: 'Não foi possível validar o link.' }, 401);
    }

    return json({
      success: true,
      user: safeUser(data.user)
    }, 200, sessionCookies(sessionData.session));
  }

  // Alterar palavra-passe com sessão autenticada.
  if (path === '/api/auth/update-password' && request.method === 'POST') {
    const body = await readBody(request);
    const password = body?.password;

    if (typeof password !== 'string' || password.length < 8) {
      return json({
        success: false,
        message: 'A palavra-passe deve ter pelo menos 8 caracteres.'
      }, 400);
    }

    const cookies = readCookies(request);
    const access_token = cookies[ACCESS_COOKIE];
    const refresh_token = cookies[REFRESH_COOKIE];

    if (!access_token || !refresh_token) {
      return json({ success: false, message: 'Inicia sessão novamente.' }, 401);
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({ access_token, refresh_token });

    if (sessionError || !sessionData.session) {
      return json({ success: false, message: 'A sessão expirou. Inicia sessão novamente.' }, 401, clearCookies());
    }

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      return json({
        success: false,
        message: 'Não foi possível atualizar a palavra-passe.'
      }, 400);
    }

    return json({
      success: true,
      user: safeUser(data.user),
      message: 'Palavra-passe atualizada com sucesso.'
    }, 200, sessionCookies(sessionData.session));
  }

  if (path === '/api/auth/me' && request.method === 'GET') {
    const cookies = readCookies(request);
    const access_token = cookies[ACCESS_COOKIE];
    const refresh_token = cookies[REFRESH_COOKIE];

    if (!access_token || !refresh_token) {
      return json({
        success: false,
        message: 'Não existe uma sessão ativa.'
      }, 401, clearCookies());
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({ access_token, refresh_token });

    if (sessionError || !sessionData.session) {
      return json({
        success: false,
        message: 'A sessão expirou. Inicia sessão novamente.'
      }, 401, clearCookies());
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return json({
        success: false,
        message: 'Não foi possível validar a sessão.'
      }, 401, clearCookies());
    }

    return json({
      success: true,
      user: safeUser(data.user)
    }, 200, sessionCookies(sessionData.session));
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const cookies = readCookies(request);
    const access_token = cookies[ACCESS_COOKIE];
    const refresh_token = cookies[REFRESH_COOKIE];

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      if (!error) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    }

    return json({
      success: true,
      message: 'Sessão terminada.'
    }, 200, clearCookies());
  }

  return json({
    success: false,
    message: 'Rota ou método não encontrado.'
  }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/status' && request.method === 'GET') {
      return json({
        success: true,
        store: 'THINK GLOW',
        message: 'Servidor online'
      });
    }

    if (url.pathname.startsWith('/api/auth/')) {
      try {
        return await handleAuth(request, env, url.pathname);
      } catch (error) {
        console.error('Erro na API:', error.message);

        return json({
          success: false,
          message: 'Erro interno ao processar o pedido.'
        }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
