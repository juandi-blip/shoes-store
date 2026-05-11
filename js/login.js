/**
 * js/login.js
 * Shoes.Store — Login Validation Logic
 * Handles client-side authentication and session management.
 */
(function() {
  /* ─── Mock Authentication ─── */
  function validateCredentials(user, pass) {
    return user === 'admin' && pass === 'shoes2026';
  }

  const form    = document.getElementById('login-form');
  const userIn  = document.getElementById('user');
  const passIn  = document.getElementById('password');
  const errorEl = document.getElementById('login-error');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');

    // Add visual error feedback
    const card = form.closest('.card');
    if (card) {
      card.classList.add('shake');
      card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
    }
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }

  // Clear errors on user input
  userIn.addEventListener('input', clearError);
  passIn.addEventListener('input', clearError);

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const user = userIn.value.trim();
    const pass = passIn.value;

    if (!user || !pass) {
      showError('Por favor completa todos los campos.');
      return;
    }

    if (!validateCredentials(user, pass)) {
      showError('Usuario o contraseña incorrectos.');
      passIn.value = '';
      passIn.focus();
      return;
    }

    // Save session and redirect
    sessionStorage.setItem('shoesStore_loggedIn', 'true');
    sessionStorage.setItem('shoesStore_user', user);
    window.location.href = 'index.html';
  });
})();
