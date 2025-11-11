// login.js — small helpers: validation + password toggle
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const userInput = document.getElementById('userInput');
  const pwInput = document.getElementById('pwInput');
  const toggleBtn = document.getElementById('togglePw');

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    if (pwInput.type === 'password') {
      pwInput.type = 'text';
      toggleBtn.textContent = 'Hide';
      toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
      pwInput.type = 'password';
      toggleBtn.textContent = 'Show';
      toggleBtn.setAttribute('aria-label', 'Show password');
    }
    pwInput.focus();
  });

  // Basic validation and credential check (username: talha, password: 123)
  const VALID_USER = 'talha';
  const VALID_PASS = '123';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = userInput.value.trim();
    const pass = pwInput.value;

    // clear previous errors
    form.querySelectorAll('.error').forEach(el => el.textContent = '');

    let ok = true;
    if (!user) {
      form.querySelectorAll('.error')[0].textContent = 'Please enter your email or username.';
      ok = false;
    }
    if (!pass) {
      form.querySelectorAll('.error')[1].textContent = 'Please enter your password.';
      ok = false;
    }

    if (!ok) return;

    const btn = document.getElementById('loginBtn');
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    setTimeout(() => {
      // credential check
      if (user.toLowerCase() === VALID_USER && pass === VALID_PASS) {
        // store simple session and go to welcome page
        sessionStorage.setItem('user', VALID_USER);
        window.location.href = 'welcome.html';
      } else {
        // show error
        form.querySelectorAll('.error')[1].textContent = 'Invalid username or password.';
        btn.textContent = 'Log in';
        btn.disabled = false;
      }
    }, 700);
  });
});
