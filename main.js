(function () {
  const canvas = document.getElementById("gameCanvas");
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
  const startRegion = { x: 397, y: 367, width: 230, height: 54 };
  const quitRegion = { x: 397, y: 437, width: 230, height: 54 };
  const bottleConfigs = [
    { key: "whiskey", spirit: "whiskey", x: 32, y: 350, width: 42, height: 104, scale: 0.3 },
    { key: "rum", spirit: "rum", x: 126, y: 334, width: 34, height: 94, scale: 0.27 },
    { key: "gin", spirit: "gin", x: 392, y: 330, width: 34, height: 96, scale: 0.28 },
    { key: "vodka", spirit: "vodka", x: 506, y: 328, width: 34, height: 96, scale: 0.28 },
    { key: "tequila", spirit: "tequila", x: 626, y: 338, width: 35, height: 92, scale: 0.27 },
    { key: "brandy", spirit: "brandy", x: 724, y: 350, width: 50, height: 90, scale: 0.26 },
    { key: "cointreau", spirit: "cointreau", x: 846, y: 348, width: 42, height: 104, scale: 0.3 },
  ];

  let currentScene = "entrance";
  let phoenixSprite = null;
  let phoenixState = "idle";

  k.loadSprite("splash", "docs/assets/splash.png");
  k.loadSprite("home", "docs/assets/home.png");
  k.loadSprite("browse", "docs/assets/browse.png");
  k.loadSprite("phoenix_idle", "docs/assets/standing.png");
  k.loadSprite("phoenix_shake", "docs/assets/shake_1.png");
  k.loadSprite("gin", "docs/assets/Gin.png");
  k.loadSprite("rum", "docs/assets/Rum.png");
  k.loadSprite("whiskey", "docs/assets/Whiskey.png");
  k.loadSprite("vodka", "docs/assets/Vodka.png");
  k.loadSprite("tequila", "docs/assets/Tequila.png");
  k.loadSprite("brandy", "docs/assets/Brandy.png");
  k.loadSprite("cointreau", "docs/assets/Cointreau.png");

  window.injectBottleContext = window.injectBottleContext || function () {};

  function addBackground(name) {
    k.add([k.sprite(name), k.pos(0, 0), k.scale(backgroundScale), k.z(0)]);
  }

  function makeButton(label, y, onClick) {
    const x = k.width() / 2;
    const panel = k.add([
      k.rect(230, 54),
      k.pos(x, y),
      k.anchor("center"),
      k.area(),
      k.color(10, 10, 15),
      k.opacity(0.72),
      k.z(4),
    ]);

    k.add([
      k.text(label, { size: 28 }),
      k.pos(x, y + 2),
      k.anchor("center"),
      k.color(232, 224, 208),
      k.z(5),
    ]);

    panel.onClick(onClick);
    panel.onHover(() => {
      document.body.style.cursor = "pointer";
      panel.opacity = 0.95;
    });
    panel.onHoverEnd(() => {
      document.body.style.cursor = "default";
      panel.opacity = 0.72;
    });
  }

  function drawPhoenix(state) {
    if (phoenixSprite) {
      k.destroy(phoenixSprite);
      phoenixSprite = null;
    }

    if (state === "shake") {
      phoenixSprite = k.add([
        k.sprite("phoenix_shake"),
        k.pos(265, 145),
        k.scale(0.42),
        k.z(6),
        "phoenix",
      ]);
    } else {
      phoenixSprite = k.add([
        k.sprite("phoenix_idle"),
        k.pos(292, 58),
        k.scale(0.13),
        k.z(6),
        "phoenix",
      ]);
    }

    window.phoenixSprite = phoenixSprite;
  }

  window.setPhoenixState = function (state) {
    phoenixState = state === "shake" ? "shake" : "idle";
    if (phoenixSprite) {
      drawPhoenix(phoenixState);
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

  function pointerToGame(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 1024,
      y: ((event.clientY - bounds.top) / bounds.height) * 576,
    };
  }

  function isInside(point, region) {
    return (
      point.x >= region.x &&
      point.x <= region.x + region.width &&
      point.y >= region.y &&
      point.y <= region.y + region.height
    );
  }

  function bottleAt(point) {
    return bottleConfigs.find((bottle) => isInside(point, bottle));
  }

  canvas.addEventListener("click", (event) => {
    const point = pointerToGame(event);
    if (currentScene === "entrance" && isInside(point, startRegion)) {
      k.go("bar");
      return;
    }
    if (currentScene === "entrance" && isInside(point, quitRegion)) {
      window.close();
      return;
    }
    if (currentScene === "bar") {
      const bottle = bottleAt(point);
      if (bottle) {
        window.injectBottleContext(bottle.spirit);
      }
    }
  });

  canvas.addEventListener("mousemove", (event) => {
    const point = pointerToGame(event);
    const isInteractive =
      (currentScene === "entrance" && (isInside(point, startRegion) || isInside(point, quitRegion))) ||
      (currentScene === "bar" && Boolean(bottleAt(point)));
    document.body.style.cursor = isInteractive ? "pointer" : "default";
  });

  k.scene("entrance", () => {
    currentScene = "entrance";
    phoenixSprite = null;
    window.phoenixSprite = null;
    addBackground("splash");
    makeButton("START", 394, () => k.go("bar"));
    makeButton("QUIT", 464, () => {
      window.close();
    });
  });

  k.scene("bar", () => {
    currentScene = "bar";
    addBackground("home");
    drawPhoenix(phoenixState);

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

    k.wait(0, () => {
      if (typeof window.onBarSceneReady === "function") {
        window.onBarSceneReady();
      }
    });
  });

  k.go("entrance");
})();
