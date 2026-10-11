
(() => {
  const BACKEND = "https://sws-backend-seven.vercel.app";
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

// SWS authenticated community pages
(async function swsCommunityAccess() {
  const BACKEND = "https://sws-backend-seven.vercel.app";
  const token = sessionStorage.getItem("sws_token");
  const page = location.pathname.split("/").pop();

  const notice = document.getElementById("authNotice");
  const message = document.getElementById("authMessage");
  const authStatus = document.getElementById("authStatus");
  const membershipNote = document.getElementById("membershipNote");

  function showLoginRequired() {
    if (notice) {
      notice.querySelector("strong").textContent = "Discord login required";
      message.textContent = "Log in with Discord to view communities available to your account.";
    }
    if (authStatus) authStatus.textContent = "Login required";
    if (membershipNote) {
      membershipNote.textContent = "Log in with Discord to verify your KAI'S HUB membership.";
    }
  }

  if (!token) {
    showLoginRequired();
    if (page === "kaihub.html") {
      setTimeout(() => location.replace("index.html"), 1800);
    }
    return;
  }

  try {
    const endpoint = page === "servers.html" ? "/api/servers" : "/api/me";
    const response = await fetch(BACKEND + endpoint, {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store"
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      sessionStorage.removeItem("sws_token");
      sessionStorage.removeItem("sws_user");
      showLoginRequired();
      if (page === "kaihub.html") {
        setTimeout(() => location.replace("index.html"), 1800);
      }
      return;
    }

    if (page === "servers.html") {
      const servers = Array.isArray(data.servers) ? data.servers : [];
      const allowed = servers.some(server =>
        server.id === "1543790133407383634" &&
        server.path === "kaihub.html"
      );

      if (!allowed) {
        if (notice) {
          notice.querySelector("strong").textContent = "No community access";
          message.textContent = "Your account has no authorized communities.";
        }
        document.querySelectorAll(".server-card").forEach(card => card.remove());
        return;
      }

      if (notice) notice.remove();
      return;
    }

    if (page === "kaihub.html") {
      if (data.server?.id !== "1543790133407383634") {
        if (authStatus) authStatus.textContent = "Access denied";
        if (membershipNote) membershipNote.textContent = "Your account is not authorized for this community.";
        return;
      }

      if (authStatus) {
        authStatus.textContent = "Authenticated";
        authStatus.classList.remove("red");
      }
      if (membershipNote) {
        membershipNote.textContent =
          "Signed in as " + (data.user?.username || "Discord user") +
          ". Access was confirmed by the SWS backend.";
      }
    }
  } catch (error) {
    if (notice) {
      notice.querySelector("strong").textContent = "Connection error";
      message.textContent = "Could not verify your session. Check your connection and try again.";
    }
    if (authStatus) authStatus.textContent = "Unverified";
    if (membershipNote) membershipNote.textContent = "The backend could not verify your session.";
  }
})();
