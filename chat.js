(function () {
  const speechBubbleEl = document.getElementById("speech-bubble");
  const speechTextEl   = document.getElementById("speech-text");
  const quickBubbleContainer = document.getElementById("quick-bubble-container");
  const formEl = document.getElementById("chat-panel");
  const inputEl = document.getElementById("chat-input");
  const sendEl = document.getElementById("chat-send");

  const messages = [];
  let isSending = false;
  let didOpen = false;

  function normalizeSuggestions(suggestions) {
    if (!Array.isArray(suggestions)) {
      return [];
    }
    return suggestions
      .map((suggestion) => String(suggestion || "").trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  function setQuickPillsDisabled(disabled) {
    if (!quickBubbleContainer) return;
    quickBubbleContainer.querySelectorAll(".quick-pill").forEach((pill) => {
      pill.classList.toggle("disabled", disabled);
      pill.disabled = disabled;
    });
  }

  window.setQuickBubbles = function (suggestions) {
    if (!quickBubbleContainer) return;
    const items = normalizeSuggestions(suggestions);
    quickBubbleContainer.textContent = "";

    items.forEach((suggestion) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "quick-pill";
      pill.textContent = suggestion;
      pill.disabled = isSending;
      pill.classList.toggle("disabled", isSending);
      pill.addEventListener("click", () => {
        if (isSending || pill.classList.contains("disabled")) {
          return;
        }
        pill.remove();
        inputEl.value = suggestion;
        inputEl.focus();
      });
      quickBubbleContainer.appendChild(pill);
    });
  };

  function setSpeechBubble(text) {
    if (!speechBubbleEl || !speechTextEl) return;
    speechTextEl.textContent = text;
    speechBubbleEl.style.display = "block";
  }

  function setBusy(nextBusy) {
    isSending = nextBusy;
    inputEl.disabled = nextBusy;
    sendEl.disabled = nextBusy;
    if (nextBusy) {
      setQuickPillsDisabled(true);
    }
    // pills are re-enabled only via setQuickBubbles() after Phoenix replies
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

    let pendingSuggestions = [];
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
      await typewriter(reply);
      pendingSuggestions = data.suggestions || [];

      if (data.game && typeof window.startMixingGame === "function") {
        window.startMixingGame(data.game);
      }
    } catch (error) {
      setSpeechBubble("...");
    } finally {
      setBusy(false);
      window.setQuickBubbles(pendingSuggestions);
      if (config.focusInput) {
        inputEl.focus();
      }
    }
  }

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
