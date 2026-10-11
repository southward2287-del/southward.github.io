(() => {
  const loader = document.getElementById('loader');
  const menuButton = document.getElementById('menuButton');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const loginButton = document.getElementById('loginButton');
  const loginNote = document.getElementById('loginNote');

  function closeMenu() {
    if (!menuButton || !sideMenu || !overlay) return;
    menuButton.classList.remove('active');
    menuButton.setAttribute('aria-expanded', 'false');
    sideMenu.classList.remove('open');
    overlay.classList.remove('show');
  }

  if (menuButton && sideMenu && overlay) {
    menuButton.addEventListener('click', () => {
      const opening = !sideMenu.classList.contains('open');
      menuButton.classList.toggle('active', opening);
      menuButton.setAttribute('aria-expanded', String(opening));
      sideMenu.classList.toggle('open', opening);
      overlay.classList.toggle('show', opening);
    });
    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('done'), 450);
    });
    setTimeout(() => loader.classList.add('done'), 1800);
  }

  if (loginButton) {
    loginButton.addEventListener('click', () => {
      if (loginNote) {
        loginNote.textContent = 'Demo only: real Discord OAuth2 has not been configured. Opening the sample server directory.';
      }
      loginButton.disabled = true;
      loginButton.style.opacity = '.65';
      setTimeout(() => {
        window.location.href = 'servers.html';
      }, 650);
    });
  }
})();
