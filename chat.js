(function () {
  const speechBubbleEl = document.getElementById("speech-bubble");
  const speechTextEl   = document.getElementById("speech-text");
  const formEl = document.getElementById("chat-panel");
  const inputEl = document.getElementById("chat-input");
  const sendEl = document.getElementById("chat-send");
  const gameOverlay = document.getElementById("game-overlay");
  const gameTitle = document.getElementById("game-title");
  const gameCopy = document.getElementById("game-copy");
  const gameClose = document.getElementById("game-close");

  const messages = [];
  let isSending = false;
  let didOpen = false;

  function setSpeechBubble(text) {
    if (!speechBubbleEl || !speechTextEl) return;
    speechTextEl.textContent = text;
    speechBubbleEl.style.display = "block";
  }

  function setBusy(nextBusy) {
    isSending = nextBusy;
    inputEl.disabled = nextBusy;
    sendEl.disabled = nextBusy;
  }

  async function typewriter(text, speedMs = 28) {
    if (!speechBubbleEl || !speechTextEl) return;
    speechTextEl.textContent = "";
    speechBubbleEl.style.display = "block";
    for (const char of text) {
      speechTextEl.textContent += char;
      await new Promise((resolve) => window.setTimeout(resolve, speedMs));
    }
  }

  async function sendMessage(userText, options) {
    const config = Object.assign({ allowEmpty: false, focusInput: true }, options);
    const trimmedText = String(userText || "").trim();
    if (isSending || (!trimmedText && !config.allowEmpty)) {
      return;
    }

    const signal = window.consumeBottleSignal?.();
    const content = signal ? `[User is looking at the ${signal.spirit}]\n${trimmedText}` : trimmedText;

    if (content) {
      messages.push({ role: "user", content });
    }

    setBusy(true);
    setSpeechBubble("...");
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
      messages.push({ role: "assistant", content: reply });
      if (typeof window.setPhoenixState === "function") {
        window.setPhoenixState("shake_talk");
      }
      await typewriter(reply);

      if (data.game) {
        window.startMixingGame(data.game);
      }
    } catch (error) {
      setSpeechBubble("...");
    } finally {
      if (typeof window.setPhoenixState === "function") {
        window.setPhoenixState("idle");
      }
      setBusy(false);
      if (config.focusInput) {
        inputEl.focus();
      }
    }
  }

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
    sendMessage("", { allowEmpty: true, focusInput: false });
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
    sendMessage,
    typewriter,
  };
})();
