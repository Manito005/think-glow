'use strict';

(() => {
  const $ = id => document.getElementById(id);

  const modal = $('accountModal');
  const loginForm = $('loginForm');
  const registerForm = $('registerForm');
  const accountForms = $('accountForms');
  const accountProfile = $('accountProfile');
  const accountMessage = $('accountMessage');
  const accountButton = $('accountBtn');

  if (
    !modal || !loginForm || !registerForm ||
    !accountForms || !accountProfile || !accountMessage
  ) {
    console.error('THINK GLOW: elementos da conta não encontrados.');
    return;
  }

  let busy = false;
  const defaultButtonText = accountButton.textContent;

  function message(text, isError = false) {
    accountMessage.textContent = text;
    accountMessage.style.color = isError ? '#ff8b8b' : '';
  }

  function setBusy(value) {
    busy = value;

    modal.querySelectorAll('button[type="submit"]').forEach(button => {
      button.disabled = value;
    });
  }

  function showLogin() {
    loginForm.hidden = false;
    registerForm.hidden = true;

    $('showLogin').classList.add('active');
    $('showRegister').classList.remove('active');

    $('accountTitle').textContent = 'Iniciar sessão';
    message('');
  }

  function showRegister() {
    loginForm.hidden = true;
    registerForm.hidden = false;

    $('showLogin').classList.remove('active');
    $('showRegister').classList.add('active');

    $('accountTitle').textContent = 'Criar conta';
    message('');
  }

  function showProfile(user) {
    accountForms.hidden = true;
    accountProfile.hidden = false;

    $('accountTitle').textContent = 'A minha conta';
    $('accountUserEmail').textContent = user.email || '';

    accountButton.textContent = 'A minha conta';

    modal.classList.remove('auth-gate');
    modal.hidden = true;
    document.body.classList.remove('auth-required');

    message('Sessão autenticada com sucesso.');
  }

  function showForms() {
    accountForms.hidden = false;
    accountProfile.hidden = true;

    accountButton.textContent = defaultButtonText;

    modal.classList.add('auth-gate');
    modal.hidden = false;
    document.body.classList.add('auth-required');

    showLogin();
  }

  function openAccount() {
    modal.hidden = false;
  }

  function closeAccount() {
    if (modal.classList.contains('auth-gate')) return;
    if (!busy) modal.hidden = true;
  }

  async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error('Resposta inválida do servidor.');
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || 'Não foi possível concluir o pedido.'
      );
    }

    return result;
  }

  accountButton.addEventListener('click', () => {
    openAccount();
    $('navMenu')?.classList.remove('open');
  });

  $('closeAccount').addEventListener('click', closeAccount);
  $('accountBackdrop').addEventListener('click', closeAccount);

  $('showLogin').addEventListener('click', showLogin);
  $('showRegister').addEventListener('click', showRegister);

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (busy) return;

    const email = $('loginEmail').value.trim();
    const password = $('loginPassword').value;

    setBusy(true);
    message('A iniciar sessão...');

    try {
      const result = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      showProfile(result.user);
      loginForm.reset();

      message('Bem-vindo à THINK GLOW!');
    } catch (error) {
      message(error.message, true);
    } finally {
      setBusy(false);
    }
  });

  registerForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (busy) return;

    const email = $('registerEmail').value.trim();
    const password = $('registerPassword').value;

    setBusy(true);
    message('A criar a tua conta...');

    try {
      const result = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      registerForm.reset();

      if (result.sessionCreated && result.user) {
        showProfile(result.user);
        message('Conta criada e sessão iniciada!');
      } else {
        showLogin();
        message('Registo recebido. Confirma o teu email para poderes entrar.');
      }
    } catch (error) {
      message(error.message, true);
    } finally {
      setBusy(false);
    }
  });

  $('logoutBtn').addEventListener('click', async () => {
    if (busy) return;

    setBusy(true);
    message('A terminar sessão...');

    try {
      await request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({})
      });

      showForms();
      message('A sessão foi terminada.');
    } catch (error) {
      message(error.message, true);
    } finally {
      setBusy(false);
    }
  });

  // Verificar se já existe uma sessão válida.
  async function restoreSession() {
    try {
      const result = await request('/api/auth/me', {
        method: 'GET'
      });

      if (result.user) {
        showProfile(result.user);
      } else {
        showForms();
      }
    } catch {
      showForms();
    } finally {
      document.body.classList.remove('auth-checking');
    }
  }

  showForms();
  restoreSession();
})();
