(function () {
  const canvas = document.getElementById("gameCanvas");
  const chatPanel = document.getElementById("chat-panel");
  const speechBubble = document.getElementById("speech-bubble");
  const quickBubble = document.getElementById("quick-bubble");
  const initKaplay = window.kaplay || window.kaboom;

  if (!canvas || !initKaplay) {
    throw new Error("Kaplay could not start.");
  }

  const k = initKaplay({
    canvas,
    width: 1024,
    height: 576,
    scale: 2,
    crisp: true,
    background: [10, 10, 15],
    global: false,
  });

  const backgroundScale = 0.5;
  const phoenixPosition = { x: 208, y: 198 };
  const phoenixScale = 0.40;
  const bottleConfigs = [
    { key: "whiskey",   spirit: "whiskey",   x: 390, y: 318, width: 135, height: 342, scale: 0.28 },
    { key: "rum",       spirit: "rum",       x: 453, y: 318, width: 124, height: 342, scale: 0.28 },
    { key: "gin",       spirit: "gin",       x: 515, y: 318, width: 122, height: 342, scale: 0.28 },
    { key: "vodka",     spirit: "vodka",     x: 577, y: 318, width: 122, height: 342, scale: 0.28 },
    { key: "tequila",   spirit: "tequila",   x: 638, y: 318, width: 128, height: 342, scale: 0.28 },
    { key: "brandy",    spirit: "brandy",    x: 700, y: 318, width: 128, height: 342, scale: 0.28 },
    { key: "cointreau", spirit: "cointreau", x: 762, y: 318, width: 162, height: 342, scale: 0.26 },
  ];
  const introScreens = [
    { type: "text", content: "YEAR: 4144", size: 28 },
    {
      type: "text",
      content:
        "Cybernetic augmentation is legal, affordable, and completely normal. Titanium spine. Chrome arms. Neural implants. Pick your upgrade.",
      size: 28,
      width: 820,
    },
    { type: "text", content: "Every procedure requires full anesthesia.", size: 28, width: 820 },
    {
      type: "text",
      content:
        "And every time you go under — your mind slips through the cracks into a place that shouldn't exist.",
      size: 28,
      width: 820,
    },
    { type: "image", sprite: "story_intro_5" },
    {
      type: "text",
      content:
        "\"Breathe normally.\"\n\"This is a standard augmentation.\"\n\"You won't feel a thing.\"\n\"Count backwards from ten.\"",
      size: 20,
      width: 820,
    },
    { type: "vignette_text", content: "Ten...",   size: 28, vignette: "closing_1" },
    { type: "vignette_text", content: "Nine...",  size: 28, vignette: "closing_2" },
    { type: "vignette_text", content: "Eight...", size: 28, vignette: "closing_3" },
    { type: "text", content: "...", size: 28 },
    { type: "text", content: "> ENTER <", size: 28 },
    { type: "vignette_image", sprite: "scene_station_blur", vignette: "closing_3" },
    { type: "black" },
    { type: "vignette_image", sprite: "scene_station_blur", vignette: "closing_3" },
    { type: "image", sprite: "gs4_bg" },
    { type: "image", sprite: "gs5_bg" },
    {
      type: "street_dialog",
      line: "What took you so long? I thought you died on the way here :)",
    },
    {
      type: "street_dialog",
      line:
        "Half the clinics here aren't exactly... licensed. Pray you don't die on the table. Because if you do – You'll be going straight to hell from here.",
      bg: "gs_dialog_speak_bg",
    },
    {
      type: "street_dialog",
      line: "Are you going to stand there all night? Follow me. I know a place.",
    },
    { type: "image", sprite: "bar_intro_1_bg" },
    { type: "bar_dialog", line: "Delighted to have you.\nNot really, but here we are." },
    {
      type: "bar_dialog",
      line:
        "This is my bar. Your consciousness is stuck here until they finish whatever they're doing to your body. Could be twenty minutes. Could be 20 years.",
      bg: "bar_dialog_speak_bg",
    },
    {
      type: "bar_dialog",
      line: "Browse around. Or talk to me. Fair warning though — I’m not known for being pleasant.",
    },
  ];
  const phoenixSprites = {
    idle: "phoenix_idle",
    idle_blink: "phoenix_idle_blink",
    shake: "phoenix_shake",
    shake_talk: "phoenix_shake_talk",
  };

  let currentScene = "intro";
  let introIndex = 0;
  let phoenixSprite = null;
  let phoenixState = "idle";
  let blinkTimeout = null;
  let blinkResetTimeout = null;
  let pendingBottleSignal = null;

  k.loadFont("VT323", "docs/Lisa/VT323-Regular.ttf");
  k.loadSprite("home", "docs/assets/BG/scene_bar_overview.png");
  k.loadSprite("bar_foreground", "docs/assets/BG/scene_bar.png");
  k.loadSprite("scene_station_blur", "docs/assets/BG/scene_station_blur.png");
  k.loadSprite("scene_station", "docs/assets/BG/scene_station.png");
  k.loadSprite("gs4_bg",             "docs/assets/BG/gs4_bg.png");
  k.loadSprite("gs5_bg",             "docs/assets/BG/gs5_bg.png");
  k.loadSprite("gs_dialog_bg",       "docs/assets/BG/gs_dialog_bg.png");
  k.loadSprite("gs_dialog_speak_bg", "docs/assets/BG/gs_dialog_speak_bg.png");
  k.loadSprite("bar_intro_1_bg",     "docs/assets/BG/bar_intro_1_bg.png");
  k.loadSprite("bar_dialog_bg",      "docs/assets/BG/bar_dialog_bg.png");
  k.loadSprite("bar_dialog_speak_bg","docs/assets/BG/bar_dialog_speak_bg.png");
  k.loadSprite("story_intro_5", "docs/assets/story_intro_5.png");
  k.loadSprite("closing_1", "docs/assets/Splash/Closing_1.png");
  k.loadSprite("closing_2", "docs/assets/Splash/Closing_2.png");
  k.loadSprite("closing_3", "docs/assets/Splash/Closing_3.png");
  k.loadSprite("phoenix_street", "docs/assets/Character/phoenix_street.png");
  k.loadSprite("phoenix_idle", "docs/assets/Character/phoenix_idle.png");
  k.loadSprite("phoenix_idle_blink", "docs/assets/Character/phoenix_idle_blink.png");
  k.loadSprite("phoenix_idle_talk", "docs/assets/Character/phoenix_idle_talk.png");
  k.loadSprite("phoenix_shake", "docs/assets/Character/phoenix_shake.png");
  k.loadSprite("phoenix_shake_blink", "docs/assets/Character/phoenix_shake_blink.png");
  k.loadSprite("phoenix_shake_talk", "docs/assets/Character/phoenix_shake_talk.png");
  k.loadSprite("gin", "docs/assets/Alcohol/gin.png");
  k.loadSprite("rum", "docs/assets/Alcohol/rum.png");
  k.loadSprite("whiskey", "docs/assets/Alcohol/whiskey.png");
  k.loadSprite("vodka", "docs/assets/Alcohol/vodka.png");
  k.loadSprite("tequila", "docs/assets/Alcohol/tequila.png");
  k.loadSprite("brandy", "docs/assets/Alcohol/brandy.png");
  k.loadSprite("cointreau", "docs/assets/Alcohol/cointreau.png");

  window.emitBottleSignal = function (spirit) {
    const normalizedSpirit = String(spirit || "").trim().toLowerCase();
    pendingBottleSignal = normalizedSpirit ? { spirit: normalizedSpirit } : null;
  };

  window.consumeBottleSignal = function () {
    const signal = pendingBottleSignal;
    pendingBottleSignal = null;
    return signal;
  };

  function setChatVisible(isVisible) {
    if (chatPanel) {
      chatPanel.style.display = isVisible ? "flex" : "none";
    }
    if (quickBubble) {
      quickBubble.style.display = isVisible ? "flex" : "none";
    }
    if (!isVisible && speechBubble) {
      speechBubble.style.display = "none";
    }
  }

  function addBackground(name, layer) {
    k.add([k.sprite(name), k.pos(0, 0), k.scale(backgroundScale), k.z(layer || 0)]);
  }

  function clearBlinkTimers() {
    window.clearTimeout(blinkTimeout);
    window.clearTimeout(blinkResetTimeout);
    blinkTimeout = null;
    blinkResetTimeout = null;
  }

  function scheduleBlink() {
    clearBlinkTimers();
    if (currentScene !== "bar" || phoenixState !== "idle") {
      return;
    }

    blinkTimeout = window.setTimeout(() => {
      if (currentScene !== "bar" || phoenixState !== "idle") {
        return;
      }
      window.setPhoenixState("idle_blink");
      blinkResetTimeout = window.setTimeout(() => {
        if (currentScene === "bar" && phoenixState === "idle_blink") {
          window.setPhoenixState("idle");
        }
      }, 120);
    }, 4000 + Math.random() * 2000);
  }

  function drawPhoenix(state) {
    if (phoenixSprite) {
      k.destroy(phoenixSprite);
      phoenixSprite = null;
    }

    const spriteKey = phoenixSprites[state] || phoenixSprites.idle;
    phoenixSprite = k.add([
      k.sprite(spriteKey),
      k.pos(phoenixPosition.x, phoenixPosition.y),
      k.scale(phoenixScale),
      k.z(6),
      "phoenix",
    ]);
    window.phoenixSprite = phoenixSprite;
  }

  window.setPhoenixState = function (state) {
    const nextState = phoenixSprites[state] ? state : "idle";
    phoenixState = nextState;
    if (phoenixSprite) {
      drawPhoenix(phoenixState);
    }

    if (phoenixState === "idle") {
      scheduleBlink();
    } else if (phoenixState !== "idle_blink") {
      clearBlinkTimers();
    }
  };

  function addBottle(config) {
    const bottle = k.add([
      k.sprite(config.key),
      k.pos(config.x, config.y),
      k.scale(config.scale || 0.25),
      k.area(),
      k.z(8),
      "bottle",
      { baseY: config.y, spirit: config.spirit },
    ]);

    bottle.onClick(() => window.emitBottleSignal(config.spirit));
    bottle.onHover(() => {
      document.body.style.cursor = "pointer";
      bottle.pos.y = bottle.baseY - 6;
    });
    bottle.onHoverEnd(() => {
      document.body.style.cursor = "default";
      bottle.pos.y = bottle.baseY;
    });
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * k.width(),
      y: ((event.clientY - rect.top) / rect.height) * k.height(),
    };
  }

  function getBottleAtPoint(point) {
    return bottleConfigs.find((config) => {
      const scale = config.scale || 0.25;
      const hitPadding = 8;
      const left = config.x - hitPadding;
      const top = config.y - hitPadding;
      const right = config.x + config.width * scale + hitPadding;
      const bottom = config.y + config.height * scale + hitPadding;
      return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
    });
  }

  function advanceIntro() {
    if (introIndex >= introScreens.length - 1) {
      k.go("bar");
      return;
    }
    introIndex += 1;
    k.go("intro");
  }

  canvas.addEventListener("click", (event) => {
    if (currentScene === "intro") {
      advanceIntro();
      return;
    }

    if (currentScene === "bar") {
      const bottle = getBottleAtPoint(getCanvasPoint(event));
      if (bottle) {
        window.emitBottleSignal(bottle.spirit);
      }
    }
  });

  k.scene("intro", () => {
    currentScene = "intro";
    setChatVisible(false);
    if (typeof window.hideStreetDialog === "function") {
      window.hideStreetDialog();
    }
    if (typeof window.hideBarDialog === "function") {
      window.hideBarDialog();
    }
    clearBlinkTimers();
    phoenixSprite = null;
    window.phoenixSprite = null;
    document.body.style.cursor = "pointer";

    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(0, 0, 0), k.z(0)]);

    const screen = introScreens[introIndex];
    if (screen.type === "image") {
      addBackground(screen.sprite, 1);
      if (screen.character) {
        k.add([k.sprite(screen.character), k.pos(375, 269), k.scale(0.5), k.z(2), "street_phoenix"]);
      }
      return;
    }

    if (screen.type === "vignette_text") {
      addBackground("story_intro_5", 1);
      addBackground(screen.vignette, 2);
      k.add([
        k.text(screen.content, {
          size: screen.size,
          font: "VT323",
        }),
        k.pos(k.width() - 48, k.height() - 56),
        k.anchor("botright"),
        k.color(255, 255, 255),
        k.z(3),
      ]);
      return;
    }

    if (screen.type === "vignette_image") {
      addBackground(screen.sprite, 1);
      addBackground(screen.vignette, 2);
      if (screen.character) {
        k.add([k.sprite(screen.character), k.pos(375, 269), k.scale(0.5), k.z(3), "street_phoenix"]);
      }
      return;
    }

    if (screen.type === "black") {
      return;
    }

    if (screen.type === "street_dialog") {
      addBackground(screen.bg || "gs_dialog_bg", 1);
      if (typeof window.showStreetDialog === "function") {
        window.showStreetDialog(screen.line);
      }
      return;
    }

    if (screen.type === "bar_dialog") {
      addBackground(screen.bg || "bar_dialog_bg", 1);
      if (typeof window.showBarDialog === "function") {
        window.showBarDialog(screen.line);
      }
      return;
    }

    k.add([
      k.text(screen.content, {
        size: screen.size,
        width: screen.width || 900,
        align: "center",
        font: "VT323",
      }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(2),
    ]);
  });

  k.scene("bar", () => {
    currentScene = "bar";
    setChatVisible(true);
    if (typeof window.hideStreetDialog === "function") {
      window.hideStreetDialog();
    }
    if (typeof window.hideBarDialog === "function") {
      window.hideBarDialog();
    }
    document.body.style.cursor = "default";
    addBackground("home", 0);
    drawPhoenix(phoenixState);
    addBackground("bar_foreground", 7);

    bottleConfigs.forEach(addBottle);

    const dimmer = k.add([
      k.rect(k.width(), k.height()),
      k.pos(0, 0),
      k.color(0, 0, 0),
      k.opacity(0.03),
      k.z(3),
    ]);

    k.onUpdate(() => {
      dimmer.opacity = 0.02 + Math.random() * 0.025;
    });

    scheduleBlink();
    k.wait(0, () => {
      if (typeof window.onBarSceneReady === "function") {
        window.onBarSceneReady();
      }
    });
  });

  k.go("intro");
})();
