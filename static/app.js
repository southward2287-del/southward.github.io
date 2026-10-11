
(() => {
  const BACKEND = "https://sws-backend-nf6o.onrender.com";
  const loader = document.getElementById("loader");
  const menuButton = document.getElementById("menuButton");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const loginButton = document.getElementById("loginButton");
  const loginNote = document.getElementById("loginNote");

  function closeMenu() {
    if (!menuButton || !sideMenu || !overlay) return;
    menuButton.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    sideMenu.classList.remove("open");
    overlay.classList.remove("show");
  }

  if (menuButton && sideMenu && overlay) {
    menuButton.addEventListener("click", () => {
      const opening = !sideMenu.classList.contains("open");
      menuButton.classList.toggle("active", opening);
      menuButton.setAttribute("aria-expanded", String(opening));
      sideMenu.classList.toggle("open", opening);
      overlay.classList.toggle("show", opening);
    });
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
  }

  if (loader) {
    window.addEventListener("load", () => {
      setTimeout(() => loader.classList.add("done"), 450);
    });
    setTimeout(() => loader.classList.add("done"), 1800);
  }

  async function exchangeLoginCode() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("login_code");
    if (!code) return;

    // Remove the one-time code from the address bar immediately.
    url.searchParams.delete("login_code");
    history.replaceState({}, "", url.pathname + url.search + url.hash);

    if (loginNote) loginNote.textContent = "Checking your Discord account…";

    try {
      const response = await fetch(`${BACKEND}/auth/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Discord login failed. Please try again.");
      }
      if (!data.token) {
        throw new Error("The server did not return a login token.");
      }

      // Session is kept in this browser tab.
      sessionStorage.setItem("sws_token", data.token);
      sessionStorage.setItem("sws_user", JSON.stringify(data.user || {}));

      if (loginNote) loginNote.textContent =
        `Logged in as ${data.user?.username || "Discord user"}.`;

      // Send the user to the server directory after successful login.
      window.location.replace("servers.html");
    } catch (error) {
      if (loginNote) loginNote.textContent = error.message;
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.style.opacity = "";
      }
    }
  }

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      if (loginNote) loginNote.textContent = "Redirecting to Discord…";
      loginButton.disabled = true;
      loginButton.style.opacity = ".65";
      window.location.href = `${BACKEND}/auth/discord`;
    });
  }

  exchangeLoginCode();
})();
