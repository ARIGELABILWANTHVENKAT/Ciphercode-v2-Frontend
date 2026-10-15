const loginGate = document.getElementById('login-gate');
const mainSite = document.getElementById('main-site');
const authSubmit = document.getElementById('auth-submit');
const authName = document.getElementById('auth-name');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authMessage = document.getElementById('auth-message');
const typedSubtitle = document.getElementById('typed-subtitle');
const neo_tabs = document.querySelectorAll('.neo-tab');
const logoutBtn = document.getElementById('logout-btn');

window.addEventListener('load', () => {
  if (sessionStorage.getItem('isLoggedIn')) {
    loginGate.style.display = 'none';
    mainSite.classList.remove('main-site-hidden');
  } else {
    typeText();
  }
});

function typeText() {
  const text = "Unlock the future of security. Start your journey today.";
  typedSubtitle.textContent = "";
  let index = 0;
  function type() {
    if (index < text.length) {
      typedSubtitle.textContent += text.charAt(index);
      index++;
      setTimeout(type, 30);
    }
  }
  type();
}

neo_tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const isSignup = tab.dataset.mode === 'signup';
    neo_tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    authName.style.display = isSignup ? 'block' : 'none';
    authSubmit.textContent = isSignup ? "CREATE ACCOUNT →" : "LOGIN →";
  });
});

authSubmit.addEventListener('click', () => {
  authMessage.textContent = "AUTHENTICATING...";
  setTimeout(() => {
    sessionStorage.setItem('isLoggedIn', 'true');
    loginGate.style.transition = 'opacity 0.5s ease';
    loginGate.style.opacity = '0';
    setTimeout(() => {
      loginGate.style.display = 'none';
      mainSite.classList.remove('main-site-hidden');
    }, 500);
  }, 1000);
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('isLoggedIn');
  location.reload();
});