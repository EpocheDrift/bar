(function () {
  const messagesEl = document.getElementById("chat-messages");
  const formEl = document.getElementById("chat-input-row");
  const inputEl = document.getElementById("chat-input");
  const sendEl = document.getElementById("chat-send");
  const gameOverlay = document.getElementById("game-overlay");
  const gameTitle = document.getElementById("game-title");
  const gameCopy = document.getElementById("game-copy");
  const gameClose = document.getElementById("game-close");

  const messages = [];
  let isSending = false;
  let didOpen = false;

  function scrollChat() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function displayUserText(text) {
    const bottleMatch = text.match(/^\[I notice you looking at the ([^\]]+)\.\]$/);
    if (bottleMatch) {
      return "You look at the " + bottleMatch[1] + ".";
    }
    return text;
  }

  function appendMessage(role, text) {
    const messageEl = document.createElement("p");
    messageEl.className = "chat-message " + role;
    messageEl.textContent = role === "user" ? displayUserText(text) : text;
    messagesEl.appendChild(messageEl);
    scrollChat();
    return messageEl;
  }

  function setBusy(nextBusy) {
    isSending = nextBusy;
    inputEl.disabled = nextBusy;
    sendEl.disabled = nextBusy;
  }

  async function typewriter(element, text, speedMs = 28) {
    element.textContent = "";
    for (const char of text) {
      element.textContent += char;
      scrollChat();
      await new Promise((resolve) => window.setTimeout(resolve, speedMs));
    }
  }

  async function sendMessage(userText, options) {
    const config = Object.assign({ renderUser: true, storeUser: true }, options);
    const content = (userText || "").trim();
    if (isSending || (!content && config.renderUser)) {
      return;
    }

    if (config.renderUser) {
      appendMessage("user", content);
    }
    if (config.storeUser && content) {
      messages.push({ role: "user", content });
    }

    setBusy(true);
    if (typeof window.setPhoenixState === "function") {
      window.setPhoenixState("shake");
    }

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!response.ok) {
        throw new Error("Chat request failed.");
      }

      const data = await response.json();
      const reply = data.reply || "...";
      const assistantEl = appendMessage("assistant", "");
      if (typeof window.setPhoenixState === "function") {
        window.setPhoenixState("shake_talk");
      }
      await typewriter(assistantEl, reply);
      messages.push({ role: "assistant", content: reply });

      if (data.game) {
        window.startMixingGame(data.game);
      }
    } catch (error) {
      appendMessage("assistant", "...");
    } finally {
      if (typeof window.setPhoenixState === "function") {
        window.setPhoenixState("idle");
      }
      setBusy(false);
      inputEl.focus();
    }
  }

  window.injectBottleContext = function (spiritName) {
    const spirit = String(spiritName || "").trim().toLowerCase();
    if (!spirit) {
      return;
    }
    sendMessage("[I notice you looking at the " + spirit + ".]");
  };

  window.startMixingGame =
    window.startMixingGame ||
    function (cocktail) {
      const cocktailName = String(cocktail || "this drink").trim();
      gameTitle.textContent = cocktailName;
      gameCopy.textContent = "Phoenix has decided you should prove you can make it.";
      gameOverlay.style.display = "flex";
      console.log("Mixing Game triggered:", cocktailName);
    };

  window.onBarSceneReady = function () {
    if (didOpen) {
      return;
    }
    didOpen = true;
    sendMessage("", { renderUser: false, storeUser: false });
  };

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = inputEl.value;
    inputEl.value = "";
    sendMessage(text);
  });

  gameClose.addEventListener("click", () => {
    gameOverlay.style.display = "none";
  });

  window.showStreetDialog = function (line) {
    const overlay = document.getElementById("street-dialog");
    const lineEl = document.getElementById("street-dialog-line");
    if (overlay && lineEl) {
      lineEl.textContent = line;
      overlay.style.display = "flex";
    }
  };

  window.hideStreetDialog = function () {
    const overlay = document.getElementById("street-dialog");
    if (overlay) {
      overlay.style.display = "none";
    }
  };

  window.showBarDialog = function (line) {
    const overlay = document.getElementById("bar-dialog");
    const nameEl = document.getElementById("bar-dialog-name");
    const lineEl = document.getElementById("bar-dialog-line");
    if (overlay && lineEl) {
      if (nameEl) {
        nameEl.textContent = "Phoenix";
      }
      lineEl.textContent = line;
      overlay.style.display = "block";
    }
  };

  window.hideBarDialog = function () {
    const overlay = document.getElementById("bar-dialog");
    if (overlay) {
      overlay.style.display = "none";
    }
  };

  window.PhoenixChat = {
    messages,
    sendMessage,
    typewriter,
  };
})();
