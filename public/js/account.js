'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const modal = $('accountModal');
  const loginForm = $('loginForm');
  const registerForm = $('registerForm');
  const resetPasswordForm = $('resetPasswordForm');
  const changePasswordForm = $('changePasswordForm');
  const accountForms = $('accountForms');
  const accountProfile = $('accountProfile');
  const accountMessage = $('accountMessage');
  const accountButton = $('accountBtn');

  if (!modal || !loginForm || !registerForm || !resetPasswordForm ||
      !changePasswordForm || !accountForms || !accountProfile ||
      !accountMessage || !accountButton) {
    console.error('THINK GLOW: elementos da conta não encontrados.');
    return;
  }

  let busy = false;
  let authenticated = false;
  let exploringAsGuest = false;
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
    ['forgotPasswordBtn', 'resendConfirmationBtn', 'skipExploreBtn'].forEach(id => {
      const button = $(id);
      if (button) button.disabled = value;
    });
  }

  function showLogin() {
    loginForm.hidden = false;
    registerForm.hidden = true;
    resetPasswordForm.hidden = true;
    $('changePasswordForm').hidden = true;
    $('showLogin').classList.add('active');
    $('showRegister').classList.remove('active');
    $('accountTitle').textContent = 'Iniciar sessão';
    $('accountForms').querySelector('.account-tabs').hidden = false;
    $('accountForms').querySelector('.account-extra-actions').hidden = false;
    message('');
  }

  function showRegister() {
    loginForm.hidden = true;
    registerForm.hidden = false;
    resetPasswordForm.hidden = true;
    $('showLogin').classList.remove('active');
    $('showRegister').classList.add('active');
    $('accountTitle').textContent = 'Criar conta';
    $('accountForms').querySelector('.account-tabs').hidden = false;
    $('accountForms').querySelector('.account-extra-actions').hidden = false;
    message('');
  }

  function showResetPassword() {
    authenticated = false;
    accountForms.hidden = false;
    accountProfile.hidden = true;
    loginForm.hidden = true;
    registerForm.hidden = true;
    resetPasswordForm.hidden = false;
    $('accountForms').querySelector('.account-tabs').hidden = true;
    $('accountForms').querySelector('.account-extra-actions').hidden = true;
    $('accountTitle').textContent = 'Criar nova palavra-passe';
    modal.classList.add('auth-gate');
    modal.hidden = false;
    document.body.classList.add('auth-required');
    message('Link validado. Escolhe uma nova palavra-passe.');
  }

  function showProfile(user) {
    authenticated = true;
    accountForms.hidden = true;
    accountProfile.hidden = false;
    $('accountTitle').textContent = 'A minha conta';
    $('accountUserEmail').textContent = user.email || '';
    $('changePasswordForm').hidden = false;
    accountButton.textContent = 'A minha conta';
    modal.classList.remove('auth-gate');
    modal.hidden = true;
    document.body.classList.remove('auth-required');
    message('Sessão autenticada com sucesso.');
  }

  function showForms(gate = true) {
    authenticated = false;
    accountForms.hidden = false;
    accountProfile.hidden = true;
    accountButton.textContent = defaultButtonText;
    modal.classList.toggle('auth-gate', gate);
    modal.hidden = !gate;
    document.body.classList.toggle('auth-required', gate);
    showLogin();
  }

  function openAccount() {
    if (!authenticated && !accountForms.hidden) showLogin();
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
    try { result = await response.json(); }
    catch { throw new Error('Resposta inválida do servidor.'); }
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Não foi possível concluir o pedido.');
    }
    return result;
  }

  window.THINKGLOW = {
    isAuthenticated: () => authenticated,
    requireAuth(callback) {
      if (authenticated) {
        if (typeof callback === 'function') callback();
        return true;
      }
      exploringAsGuest = false;
      showForms(true);
      message('Inicia sessão ou cria uma conta para continuar.');
      return false;
    }
  };

  accountButton.addEventListener('click', () => {
    openAccount();
    $('navMenu')?.classList.remove('open');
  });
  $('closeAccount').addEventListener('click', closeAccount);
  $('accountBackdrop').addEventListener('click', closeAccount);
  $('showLogin').addEventListener('click', showLogin);
  $('showRegister').addEventListener('click', showRegister);

  $('skipExploreBtn').addEventListener('click', () => {
    if (busy) return;
    exploringAsGuest = true;
    modal.hidden = true;
    modal.classList.remove('auth-gate');
    document.body.classList.remove('auth-required');
    message('Estás a explorar como visitante. Para continuar com uma encomenda, inicia sessão.');
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const email = $('loginEmail').value.trim();
    const password = $('loginPassword').value;
    setBusy(true);
    message('A iniciar sessão...');
    try {
      const result = await request('/api/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password })
      });
      showProfile(result.user);
      loginForm.reset();
      message('Bem-vindo à THINK GLOW!');
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
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
        method: 'POST', body: JSON.stringify({ email, password })
      });
      registerForm.reset();
      if (result.sessionCreated && result.user) {
        showProfile(result.user);
        message('Conta criada e sessão iniciada!');
      } else {
        showLogin();
        $('loginEmail').value = email;
        message('Registo recebido. Confirma o email na caixa de entrada ou spam antes de iniciar sessão.');
      }
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  });

  $('forgotPasswordBtn').addEventListener('click', async () => {
    if (busy) return;
    const email = $('loginEmail').value.trim() || $('registerEmail').value.trim();
    if (!email) return message('Escreve primeiro o teu email no campo Email.', true);
    setBusy(true);
    message('A enviar instruções de recuperação...');
    try {
      const result = await request('/api/auth/recover', {
        method: 'POST', body: JSON.stringify({ email })
      });
      message(result.message);
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  });

  $('resendConfirmationBtn').addEventListener('click', async () => {
    if (busy) return;
    const email = $('loginEmail').value.trim() || $('registerEmail').value.trim();
    if (!email) return message('Escreve primeiro o teu email no campo Email.', true);
    setBusy(true);
    message('A solicitar novo email de confirmação...');
    try {
      const result = await request('/api/auth/resend-confirmation', {
        method: 'POST', body: JSON.stringify({ email })
      });
      message(result.message);
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  });

  async function submitNewPassword(form, inputId) {
    if (busy) return;
    const password = $(inputId).value;
    setBusy(true);
    message('A guardar a nova palavra-passe...');
    try {
      const result = await request('/api/auth/update-password', {
        method: 'POST', body: JSON.stringify({ password })
      });
      form.reset();
      if (result.user) showProfile(result.user);
      message('Palavra-passe atualizada com sucesso.');
      history.replaceState(null, '', location.pathname + location.search);
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  }

  resetPasswordForm.addEventListener('submit', event => {
    event.preventDefault();
    submitNewPassword(resetPasswordForm, 'newPassword');
  });
  changePasswordForm.addEventListener('submit', event => {
    event.preventDefault();
    submitNewPassword(changePasswordForm, 'changePassword');
  });

  $('logoutBtn').addEventListener('click', async () => {
    if (busy) return;
    setBusy(true);
    message('A terminar sessão...');
    try {
      await request('/api/auth/logout', {
        method: 'POST', body: JSON.stringify({})
      });
      exploringAsGuest = false;
      showForms(true);
      message('A sessão foi terminada.');
    } catch (error) { message(error.message, true); }
    finally { setBusy(false); }
  });

  async function handleRecoveryLink() {
    const params = new URLSearchParams(location.hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');
    if (type !== 'recovery' || !access_token || !refresh_token) return false;

    history.replaceState(null, '', location.pathname + location.search);
    setBusy(true);
    message('A validar o link de recuperação...');
    try {
      await request('/api/auth/recovery-session', {
        method: 'POST', body: JSON.stringify({ access_token, refresh_token })
      });
      showResetPassword();
    } catch (error) {
      showForms(true);
      message(error.message, true);
    } finally { setBusy(false); }
    return true;
  }

  async function restoreSession() {
    try {
      const result = await request('/api/auth/me', { method: 'GET' });
      if (result.user) showProfile(result.user);
      else if (!exploringAsGuest) showForms(true);
    } catch {
      if (!exploringAsGuest) showForms(true);
    } finally {
      document.body.classList.remove('auth-checking');
    }
  }

  showForms(true);
  handleRecoveryLink().then(hasRecovery => {
    if (!hasRecovery) restoreSession();
    else document.body.classList.remove('auth-checking');
  });
})();
