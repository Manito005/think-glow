'use strict';

const express = require('express');
const router = express.Router();
const createAuthClient = require('../config/supabase');

const ACCESS_COOKIE = 'tg_access_token';
const REFRESH_COOKIE = 'tg_refresh_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: COOKIE_MAX_AGE
};

function setAuthCookies(res, session) {
  res.cookie(ACCESS_COOKIE, session.access_token, cookieOptions);
  res.cookie(REFRESH_COOKIE, session.refresh_token, cookieOptions);
}

function clearAuthCookies(res) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };

  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
}

function getTokens(req) {
  return {
    access_token: req.cookies?.[ACCESS_COOKIE],
    refresh_token: req.cookies?.[REFRESH_COOKIE]
  };
}

// Registar cliente
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: 'Indica um email válido e uma palavra-passe com pelo menos 8 caracteres.'
      });
    }

    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (data.session) {
      setAuthCookies(res, data.session);
    }

    return res.status(201).json({
      success: true,
      message: 'Registo processado.',
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email
          }
        : null,
      sessionCreated: Boolean(data.session)
    });
  } catch (error) {
    console.error('Erro no registo:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar o registo.'
    });
  }
});

// Iniciar sessão
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email e palavra-passe são obrigatórios.'
      });
    }

    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        message: 'Não foi possível iniciar sessão. Verifica os dados e confirma o email, se necessário.'
      });
    }

    setAuthCookies(res, data.session);

    return res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro interno ao iniciar sessão.'
    });
  }
});

// Verificar e restaurar sessão
router.get('/me', async (req, res) => {
  try {
    const tokens = getTokens(req);

    if (!tokens.access_token || !tokens.refresh_token) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: 'Não existe uma sessão ativa.'
      });
    }

    const supabase = createAuthClient();

    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession(tokens);

    if (sessionError || !sessionData.session) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: 'A sessão expirou. Inicia sessão novamente.'
      });
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: 'Não foi possível validar a sessão.'
      });
    }

    // Atualiza os cookies caso o Supabase tenha renovado os tokens.
    setAuthCookies(res, sessionData.session);

    return res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar a sessão.'
    });
  }
});

// Terminar sessão
router.post('/logout', async (req, res) => {
  try {
    const tokens = getTokens(req);

    if (tokens.access_token && tokens.refresh_token) {
      const supabase = createAuthClient();

      const { error } = await supabase.auth.setSession(tokens);

      if (!error) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    }

    clearAuthCookies(res);

    return res.json({
      success: true,
      message: 'Sessão terminada.'
    });
  } catch (error) {
    console.error('Erro no logout:', error.message);

    // Mesmo em caso de falha, elimina os cookies do navegador.
    clearAuthCookies(res);

    return res.json({
      success: true,
      message: 'Sessão encerrada neste navegador.'
    });
  }
});

module.exports = router;
