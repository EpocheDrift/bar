(function () {
  const canvas = document.getElementById("gameCanvas");
  const barLayer = document.getElementById("bar-layer");
  const barScaleRoot = document.getElementById("bar-scale-root");
  const phoenixImg = document.getElementById("phoenix-img");
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

  const phoenixSpritePaths = {
    idle:       "docs/assets/Character/phoenix_idle.png",
    idle_blink: "docs/assets/Character/phoenix_idle_blink.png",
  };

  const bottleSuggestions = {
    tequila: ["Make me a Margarita", "What mixes with tequila?"],
    gin: ["Make me a G&T", "Gin cocktail ideas?"],
    rum: ["Make me a Mojito", "What's good with rum?"],
    vodka: ["Moscow Mule?", "Vodka cocktails?"],
    whiskey: ["Old Fashioned please", "Best whiskey drink?"],
    cointreau: ["What can I make with this?", "Cointreau cocktail?"],
  };

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
      line: "Browse around. Or talk to me. Fair warning though — I'm not known for being pleasant.",
    },
  ];

  let currentScene = "intro";
  let introIndex = 0;
  let phoenixState = "idle";
  let blinkTimeout = null;
  let blinkResetTimeout = null;
  let pendingBottleSignal = null;
  let flickerFrameId = null;

  k.loadFont("VT323", "docs/Lisa/VT323-Regular.ttf");
  k.loadSprite("scene_station_blur", "docs/assets/BG/scene_station_blur.png");
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

  window.emitBottleSignal = function (spirit) {
    const normalizedSpirit = String(spirit || "").trim().toLowerCase();
    pendingBottleSignal = normalizedSpirit ? { spirit: normalizedSpirit } : null;
  };

  window.consumeBottleSignal = function () {
    const signal = pendingBottleSignal;
    pendingBottleSignal = null;
    return signal;
  };

  function updateBarScale() {
    if (!barScaleRoot) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / 2048, vh / 1152);
    const tx = Math.round((vw - 2048 * scale) / 2);
    const ty = Math.round((vh - 1152 * scale) / 2);
    barScaleRoot.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  window.addEventListener("resize", updateBarScale);

  function flickerFrame() {
    const dimmer = document.getElementById("bar-dimmer");
    if (dimmer) {
      dimmer.style.opacity = (0.02 + Math.random() * 0.025).toFixed(4);
    }
    flickerFrameId = requestAnimationFrame(flickerFrame);
  }

  function flickerStart() {
    if (!flickerFrameId) flickerFrame();
  }

  function flickerStop() {
    if (flickerFrameId) {
      cancelAnimationFrame(flickerFrameId);
      flickerFrameId = null;
    }
  }

  function setBarLayerVisible(visible) {
    if (!barLayer) return;
    if (visible) {
      barLayer.style.display = "block";
      updateBarScale();
      flickerStart();
    } else {
      barLayer.style.display = "none";
      flickerStop();
      const speechBubble = document.getElementById("speech-bubble");
      if (speechBubble) speechBubble.style.display = "none";
    }
  }

  function clearBlinkTimers() {
    window.clearTimeout(blinkTimeout);
    window.clearTimeout(blinkResetTimeout);
    blinkTimeout = null;
    blinkResetTimeout = null;
  }

  function scheduleBlink() {
    clearBlinkTimers();
    if (currentScene !== "bar" || phoenixState !== "idle") return;
    blinkTimeout = window.setTimeout(() => {
      if (currentScene !== "bar" || phoenixState !== "idle") return;
      window.setPhoenixState("idle_blink");
      blinkResetTimeout = window.setTimeout(() => {
        if (currentScene === "bar" && phoenixState === "idle_blink") {
          window.setPhoenixState("idle");
        }
      }, 120);
    }, 4000 + Math.random() * 2000);
  }

  window.setPhoenixState = function (state) {
    const nextState = phoenixSpritePaths[state] ? state : "idle";
    phoenixState = nextState;
    if (phoenixImg) {
      phoenixImg.src = phoenixSpritePaths[nextState];
    }
    if (phoenixState === "idle") {
      scheduleBlink();
    } else if (phoenixState !== "idle_blink") {
      clearBlinkTimers();
    }
  };

  function setupBarBottles() {
    document.querySelectorAll(".bar-bottle").forEach((img) => {
      if (img.dataset.bottleBound === "true") {
        return;
      }
      img.dataset.bottleBound = "true";
      img.addEventListener("click", () => {
        const spirit = String(img.dataset.spirit || "").toLowerCase();
        window.emitBottleSignal(spirit);
        if (typeof window.setQuickBubbles === "function") {
          window.setQuickBubbles(bottleSuggestions[spirit] || []);
        }
        if (typeof window.updateGameSuggestion === "function") {
          window.updateGameSuggestion(spirit);
        }
      });
    });
  }

  function addBackground(name, layer) {
    k.add([k.sprite(name), k.pos(0, 0), k.scale(backgroundScale), k.z(layer || 0)]);
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
    setBarLayerVisible(false);
    if (typeof window.hideStreetDialog === "function") window.hideStreetDialog();
    if (typeof window.hideBarDialog === "function") window.hideBarDialog();
    clearBlinkTimers();
    document.body.style.cursor = "pointer";

    k.add([k.rect(k.width(), k.height()), k.pos(0, 0), k.color(0, 0, 0), k.z(0)]);

    const screen = introScreens[introIndex];

    if (screen.type === "image") {
      addBackground(screen.sprite, 1);
      return;
    }

    if (screen.type === "vignette_text") {
      addBackground("story_intro_5", 1);
      addBackground(screen.vignette, 2);
      k.add([
        k.text(screen.content, { size: screen.size, font: "VT323" }),
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
      return;
    }

    if (screen.type === "black") {
      return;
    }

    if (screen.type === "street_dialog") {
      addBackground(screen.bg || "gs_dialog_bg", 1);
      if (typeof window.showStreetDialog === "function") window.showStreetDialog(screen.line);
      return;
    }

    if (screen.type === "bar_dialog") {
      addBackground(screen.bg || "bar_dialog_bg", 1);
      if (typeof window.showBarDialog === "function") window.showBarDialog(screen.line);
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
    setBarLayerVisible(true);
    if (typeof window.hideStreetDialog === "function") window.hideStreetDialog();
    if (typeof window.hideBarDialog === "function") window.hideBarDialog();
    document.body.style.cursor = "default";
    setupBarBottles();
    scheduleBlink();
    k.wait(0, () => {
      if (typeof window.onBarSceneReady === "function") window.onBarSceneReady();
    });
  });

  k.go("intro");
})();
