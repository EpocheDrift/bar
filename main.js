(function () {
  const canvas = document.getElementById("gameCanvas");
  const chatOverlay = document.getElementById("chat-overlay");
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
  const phoenixPosition = { x: 300, y: 126 };
  const phoenixScale = 0.5;
  const bottleConfigs = [
    { key: "whiskey", spirit: "whiskey", x: 32, y: 350, width: 42, height: 104, scale: 0.3 },
    { key: "rum", spirit: "rum", x: 126, y: 334, width: 34, height: 94, scale: 0.27 },
    { key: "gin", spirit: "gin", x: 392, y: 330, width: 34, height: 96, scale: 0.28 },
    { key: "vodka", spirit: "vodka", x: 506, y: 328, width: 34, height: 96, scale: 0.28 },
    { key: "tequila", spirit: "tequila", x: 626, y: 338, width: 35, height: 92, scale: 0.27 },
    { key: "brandy", spirit: "brandy", x: 724, y: 350, width: 50, height: 90, scale: 0.26 },
    { key: "cointreau", spirit: "cointreau", x: 846, y: 348, width: 42, height: 104, scale: 0.3 },
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
    { type: "vignette_image", sprite: "scene_station", vignette: "closing_1", character: "phoenix_street" },
    { type: "image", sprite: "scene_station", character: "phoenix_street" },
    {
      type: "street_dialog",
      line: "What took you so long? I thought you died on the way here :)",
    },
    {
      type: "street_dialog",
      line:
        "Half the clinics here aren't exactly... licensed. Pray you don't die on the table. Because if you do – You'll be going straight to hell from here.",
    },
    {
      type: "street_dialog",
      line: "Are you going to stand there all night? Follow me. I know a place.",
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

  k.loadFont("VT323", "docs/Lisa/VT323-Regular.ttf");
  k.loadSprite("home", "docs/assets/BG/scene_bar_overview.png");
  k.loadSprite("bar_foreground", "docs/assets/BG/scene_bar.png");
  k.loadSprite("scene_station_blur", "docs/assets/BG/scene_station_blur.png");
  k.loadSprite("scene_station", "docs/assets/BG/scene_station.png");
  k.loadSprite("story_intro_5", "docs/assets/story_intro_5.png");
  k.loadSprite("closing_1", "docs/assets/Splash/Closing_1.png");
  k.loadSprite("closing_2", "docs/assets/Splash/Closing_2.png");
  k.loadSprite("closing_3", "docs/assets/Splash/Closing_3.png");
  k.loadSprite("phoenix_street", "docs/assets/standing.png");
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

  window.injectBottleContext = window.injectBottleContext || function () {};

  function setChatVisible(isVisible) {
    if (chatOverlay) {
      chatOverlay.style.display = isVisible ? "block" : "none";
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

    bottle.onClick(() => window.injectBottleContext(config.spirit));
    bottle.onHover(() => {
      document.body.style.cursor = "pointer";
      bottle.pos.y = bottle.baseY - 6;
    });
    bottle.onHoverEnd(() => {
      document.body.style.cursor = "default";
      bottle.pos.y = bottle.baseY;
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

  canvas.addEventListener("click", () => {
    if (currentScene === "intro") {
      advanceIntro();
    }
  });

  k.scene("intro", () => {
    currentScene = "intro";
    setChatVisible(false);
    if (typeof window.hideStreetDialog === "function") {
      window.hideStreetDialog();
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
        k.add([k.sprite(screen.character), k.pos(375, 269), k.scale(0.061), k.z(2), "street_phoenix"]);
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
        k.color(232, 224, 208),
        k.z(3),
      ]);
      return;
    }

    if (screen.type === "vignette_image") {
      addBackground(screen.sprite, 1);
      addBackground(screen.vignette, 2);
      if (screen.character) {
        k.add([k.sprite(screen.character), k.pos(375, 269), k.scale(0.061), k.z(3), "street_phoenix"]);
      }
      return;
    }

    if (screen.type === "black") {
      return;
    }

    if (screen.type === "street_dialog") {
      addBackground("scene_station", 1);
      k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(0, 0, 0),
        k.opacity(0.45),
        k.z(2),
      ]);
      k.add([k.sprite("phoenix_idle"), k.pos(300, 126), k.scale(0.5), k.z(3), "phoenix"]);
      if (typeof window.showStreetDialog === "function") {
        window.showStreetDialog(screen.line);
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
      k.color(232, 224, 208),
      k.z(2),
    ]);
  });

  k.scene("bar", () => {
    currentScene = "bar";
    setChatVisible(true);
    if (typeof window.hideStreetDialog === "function") {
      window.hideStreetDialog();
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
