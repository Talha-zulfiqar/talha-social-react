// welcome.js — show username, handle feedback and logout
document.addEventListener('DOMContentLoaded', () => {
  const user = sessionStorage.getItem('user');
  if (!user) {
    // no session — back to login
    window.location.href = 'login.html';
    return;
  }

  const greet = document.getElementById('greet');
  const logoutBtn = document.getElementById('logoutBtn');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackText = document.getElementById('feedbackText');
  const feedbackList = document.getElementById('feedbackList');

  greet.textContent = `Hello, ${user}! Welcome back.`;

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  // load existing feedbacks from localStorage
  function loadFeedbacks() {
    const raw = localStorage.getItem('feedbacks');
    let items = [];
    try { items = raw ? JSON.parse(raw) : []; } catch { items = []; }
    feedbackList.innerHTML = '';
    if (!items.length) {
      feedbackList.innerHTML = '<p class="muted">No feedback yet.</p>';
      return;
    }
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    items.slice().reverse().forEach(f => {
      const li = document.createElement('li');
      li.style.border = '1px solid #eef6ff';
      li.style.padding = '10px';
      li.style.borderRadius = '8px';
      li.style.marginBottom = '8px';
      li.innerHTML = `<div style="font-size:13px;color:#234;margin-bottom:6px"><strong>${f.user}</strong> — <span class="muted">${new Date(f.time).toLocaleString()}</span></div><div>${escapeHtml(f.text)}</div>`;
      ul.appendChild(li);
    });
    feedbackList.appendChild(ul);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = feedbackText.value.trim();
    feedbackForm.querySelectorAll('.error').forEach(el => el.textContent = '');
    if (!text) {
      feedbackForm.querySelectorAll('.error')[0].textContent = 'Please enter feedback.';
      return;
    }

    const raw = localStorage.getItem('feedbacks');
    let items = [];
    try { items = raw ? JSON.parse(raw) : []; } catch { items = []; }
    items.push({ user, text, time: Date.now() });
    localStorage.setItem('feedbacks', JSON.stringify(items));
    feedbackText.value = '';
    loadFeedbacks();
    alert('Thanks for your feedback!');
  });

  loadFeedbacks();
});
