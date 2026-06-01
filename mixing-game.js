(function () {
  const layer = document.getElementById("mixing-game-layer");
  if (!layer) return;

  const introScreen = document.getElementById("mg-intro");
  const quizScreen = document.getElementById("mg-quiz");
  const resultScreen = document.getElementById("mg-result");
  const introLine = document.getElementById("mg-intro-line");
  const introNext = document.getElementById("mg-intro-next");
  const heartsEl = document.getElementById("mg-hearts");
  const progressEl = document.getElementById("mg-progress");
  const questionEl = document.getElementById("mg-question");
  const subtitleEl = document.getElementById("mg-subtitle");
  const optionsEl = document.getElementById("mg-options");
  const resultTitleEl = document.getElementById("mg-result-title");
  const resultScoreEl = document.getElementById("mg-result-score");
  const resultCommentEl = document.getElementById("mg-result-comment");
  const backButton = document.getElementById("mg-back");
  const restartButton = document.getElementById("mg-restart");

  const HEART_FULL = "docs/assets/UI/heart_full.png";
  const HEART_EMPTY = "docs/assets/UI/heart_empty.png";
  const QUESTION_COUNT = 5;

  const COCKTAILS = [
    {
      name: "Whiskey Sour",
      method: "shake",
      baseSpirit: "Whiskey",
      steps: [
        "Fill shaker with ice",
        "Add bourbon, lemon juice, and syrup",
        "Shake vigorously for 12-15 seconds",
        "Strain into a rocks glass over fresh ice",
        "Garnish with a lemon slice or cherry",
      ],
    },
    {
      name: "Bloody Mary",
      method: "shake",
      baseSpirit: "Vodka",
      steps: [
        "Fill shaker with ice",
        "Add vodka, tomato juice, and lemon juice",
        "Shake briefly for 5-8 seconds only",
        "Strain into a tall glass over ice",
        "Garnish with celery or lemon",
      ],
    },
    {
      name: "Gin Tonic",
      method: "stir",
      baseSpirit: "Gin",
      steps: [
        "Fill a tall glass with ice",
        "Pour gin over ice",
        "Add lemon juice",
        "Top with tonic water",
        "Stir gently once",
      ],
    },
    {
      name: "Tom Collins",
      method: "shake",
      baseSpirit: "Gin",
      steps: [
        "Combine gin, lemon juice, and syrup",
        "Shake for 10 seconds",
        "Strain into a tall glass over fresh ice",
        "Top with soda water",
        "Stir gently once and garnish",
      ],
    },
    {
      name: "Iced Lychee",
      method: "shake",
      baseSpirit: "Gin",
      steps: [
        "Muddle lychee pieces in the shaker",
        "Add gin and lychee juice",
        "Fill with ice and shake until frosted",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Jasmine Sea Breeze",
      method: "shake",
      baseSpirit: "Rum",
      steps: [
        "Fill shaker with ice",
        "Add rum, milk, cream, tea, syrup, and salt",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Night Grape",
      method: "shake",
      baseSpirit: "Rum or Gin",
      steps: [
        "Fill shaker with ice",
        "Add rum or gin, grape juice, and milk",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Osmanthus / Logan Whiskey",
      method: "shake",
      baseSpirit: "Whiskey",
      steps: [
        "Add osmanthus or longa syrup to the shaker",
        "Fill with ice",
        "Add whiskey and black tea",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Dog Hair",
      method: "shake",
      baseSpirit: "Whiskey",
      steps: [
        "Fill shaker with ice",
        "Add honey, whiskey, milk, and cream",
        "Shake until the shaker frosts",
        "Strain into a pre-chilled glass",
      ],
    },
    {
      name: "Daydreaming",
      method: "shake",
      baseSpirit: "Tequila",
      steps: [
        "Fill shaker with ice",
        "Add elderflower syrup and tequila",
        "Add pineapple juice and yogurt or milk",
        "Shake until the shaker frosts",
        "Strain into a pre-chilled glass",
      ],
    },
    {
      name: "Negroni Sour",
      method: "shake",
      baseSpirit: "Gin",
      steps: [
        "Fill shaker with ice",
        "Add gin, juices, yogurt or milk, and grenadine",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Orange Fragrance",
      method: "shake",
      baseSpirit: "Whiskey",
      steps: [
        "Fill shaker with ice",
        "Add whiskey, elderflower syrup, tea, and juices",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Coconut Amora",
      method: "shake",
      baseSpirit: "Rum",
      steps: [
        "Add osmanthus syrup to the shaker",
        "Fill with ice",
        "Add rum and coconut water",
        "Shake until the shaker frosts",
        "Float light cream on top",
      ],
    },
    {
      name: "Pina Colada",
      method: "shake",
      baseSpirit: "Rum",
      steps: [
        "Add rum, coconut milk, pineapple, syrup, and lime",
        "Shake vigorously for 15 seconds",
        "Pour into a chilled glass",
        "Garnish with pineapple or cherry",
      ],
    },
    {
      name: "Daiquiri",
      method: "shake",
      baseSpirit: "Rum",
      steps: [
        "Fill shaker with ice",
        "Add rum, lemon juice, and syrup",
        "Shake vigorously for 12-15 seconds",
        "Double-strain into a chilled coupe",
        "Serve clean with no garnish",
      ],
    },
    {
      name: "Orange Blossom",
      method: "shake",
      baseSpirit: "Gin",
      steps: [
        "Fill shaker with ice",
        "Add gin, Cointreau, orange juice, lime, and grenadine",
        "Shake for 10-12 seconds",
        "Strain into a chilled cocktail glass",
        "Garnish with an orange twist",
      ],
    },
    {
      name: "Mojito",
      method: "build",
      baseSpirit: "Rum",
      steps: [
        "Add lime juice and syrup to the glass",
        "Gently press mint leaves",
        "Fill glass with ice",
        "Pour rum over ice",
        "Top with soda water and stir gently",
      ],
    },
    {
      name: "Margarita",
      method: "shake",
      baseSpirit: "Tequila",
      steps: [
        "Salt the rim with a lime wedge",
        "Fill shaker with ice",
        "Add tequila, Cointreau, and lime juice",
        "Shake vigorously for 12-15 seconds",
        "Strain into the salted glass",
      ],
    },
    {
      name: "Orange Tonic",
      method: "stir",
      baseSpirit: "Cointreau",
      steps: [
        "Fill a glass with ice",
        "Pour Cointreau over ice",
        "Top with tonic water",
        "Stir gently once and serve immediately",
      ],
    },
    {
      name: "Cosmopolitan",
      method: "shake",
      baseSpirit: "Vodka",
      steps: [
        "Fill shaker with ice",
        "Add vodka, Cointreau, cranberry, and lime",
        "Shake vigorously for 12-15 seconds",
        "Strain into a chilled martini glass",
        "Garnish with lime or orange",
      ],
    },
    {
      name: "Long Island Ice Tea",
      method: "stir",
      baseSpirit: "Mixed spirits",
      steps: [
        "Fill a tall glass with ice",
        "Add tequila, rum, gin, vodka, and Cointreau",
        "Add lemon juice and syrup, then stir briefly",
        "Top with cola without stirring",
        "Garnish with a lemon wedge",
      ],
    },
    {
      name: "Perfume Gin",
      method: "shake",
      baseSpirit: "Gin",
      steps: [
        "Fill shaker with ice",
        "Add gin, Cointreau, lime, and elderflower syrup",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Yukiguni",
      method: "shake",
      baseSpirit: "Vodka",
      steps: [
        "Chill a coupe and sugar the rim",
        "Fill shaker with ice",
        "Add vodka, Cointreau, and lime juice",
        "Shake until the shaker frosts",
        "Strain into the prepared glass",
      ],
    },
    {
      name: "Witch",
      method: "shake",
      baseSpirit: "Tequila",
      steps: [
        "Fill shaker with ice",
        "Add tequila, Cointreau, and lemon juice",
        "Shake until the shaker frosts",
        "Strain into a pre-chilled glass",
        "Pour grenadine slowly and do not stir",
      ],
    },
    {
      name: "Night of Rendezvous",
      method: "shake",
      baseSpirit: "Cointreau",
      steps: [
        "Add osmanthus syrup to the shaker",
        "Fill with ice",
        "Add Cointreau, jasmine tea, and lemon juice",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Cuba Libre",
      method: "build",
      baseSpirit: "Rum",
      steps: [
        "Fill a tall glass with ice",
        "Squeeze lime juice into the glass",
        "Pour rum over ice",
        "Top with cola",
        "Stir gently and garnish with lime",
      ],
    },
    {
      name: "Passion Fruit Martini",
      method: "shake",
      baseSpirit: "Vodka",
      steps: [
        "Add passion fruit syrup to the shaker",
        "Fill with ice",
        "Add vodka, Cointreau, and lemon juice",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
    {
      name: "Painkiller",
      method: "shake",
      baseSpirit: "Rum",
      steps: [
        "Fill shaker with ice",
        "Add rum, pineapple, orange, and coconut milk",
        "Shake vigorously for 12-15 seconds",
        "Pour over fresh ice in a tall glass",
        "Grate nutmeg over the top",
      ],
    },
    {
      name: "Kamikaze",
      method: "shake",
      baseSpirit: "Vodka",
      steps: [
        "Fill shaker with ice",
        "Add vodka, Cointreau, and lime juice",
        "Shake for 10-12 seconds",
        "Strain into a shot glass or cocktail glass",
        "Garnish with a lime wedge",
      ],
    },
    {
      name: "Apple Highball",
      method: "stir",
      baseSpirit: "Whiskey",
      steps: [
        "Fill a tall glass with ice",
        "Pour whiskey over ice",
        "Add apple juice",
        "Top with soda water",
        "Stir gently once and garnish",
      ],
    },
    {
      name: "Sight",
      method: "shake",
      baseSpirit: "Rum",
      steps: [
        "Add passion fruit syrup to the shaker",
        "Fill with ice",
        "Add rum, guava, yogurt, and lemon",
        "Add tequila last",
        "Shake until the shaker frosts",
        "Strain over a large ice cube",
      ],
    },
  ];

  const METHODS = ["shake", "stir", "build"];
  const BASE_SPIRITS = ["Whiskey", "Tequila", "Vodka", "Gin", "Rum", "Cointreau"];

  const PRE_ANSWER_LINES = [
    "Go on. Impress me. The bar is currently at zero expectations.",
    "Pick one. Slowly, if you need to make it dramatic.",
    "I am watching. Mostly out of concern.",
    "Try not to make the glass regret existing.",
  ];

  const CORRECT_LINES = [
    "Correct. Do not look so surprised.",
    "Fine. That one was actually right.",
    "Acceptable. A rare little sparkle from you.",
    "Yes. Write this date down.",
  ];

  const WRONG_LINES = [
    "No. The drink and I are both disappointed.",
    "Wrong. Boldly wrong, but still wrong.",
    "Absolutely not. The shaker deserves better.",
    "That answer walked in and fell over immediately.",
  ];

  const RESULT_COMMENTS = [
    "Out. Now. Come back when you know what a cocktail is.",
    "One out of five. I'd say try harder, but I'm not sure it would help.",
    "That was painful to watch. Did you even try?",
    "Mediocre. Just like everything else about you.",
    "Close enough. I've seen worse. Not much worse, but worse.",
    "...Fine. You actually did it. Don't let it go to your head.",
  ];

  const state = {
    cocktailName: "",
    cocktail: null,
    questions: [],
    index: 0,
    score: QUESTION_COUNT,
    locked: false,
    nextTimer: null,
  };

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sample(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function uniqueOptions(items) {
    const seen = new Set();
    const result = [];
    items.forEach((item) => {
      const value = String(item || "").trim();
      const key = normalize(value);
      if (!value || seen.has(key)) {
        return;
      }
      seen.add(key);
      result.push(value);
    });
    return result;
  }

  function findCocktail(cocktailName, allCocktails) {
    const list = Array.isArray(allCocktails) && allCocktails.length ? allCocktails : COCKTAILS;
    const target = normalize(cocktailName);
    const exact = list.find((cocktail) => normalize(cocktail.name) === target);
    if (exact) return exact;
    const loose = list.find((cocktail) => normalize(cocktail.name).includes(target) || target.includes(normalize(cocktail.name)));
    return loose || list[0];
  }

  function makeQuestion(question, correctAnswer, wrongAnswers, type) {
    const candidates = uniqueOptions(shuffle(wrongAnswers)).filter((answer) => normalize(answer) !== normalize(correctAnswer));
    const options = uniqueOptions([correctAnswer].concat(candidates)).slice(0, 3);
    const shuffledOptions = shuffle(options);
    return {
      type,
      question,
      options: shuffledOptions,
      correctIndex: shuffledOptions.findIndex((answer) => normalize(answer) === normalize(correctAnswer)),
    };
  }

  function baseQuestion(cocktail, allCocktails) {
    const wrongAnswers = allCocktails
      .filter((item) => normalize(item.name) !== normalize(cocktail.name))
      .map((item) => item.baseSpirit)
      .concat(BASE_SPIRITS);
    return makeQuestion(
      `What's the base spirit in a ${cocktail.name}?`,
      cocktail.baseSpirit,
      wrongAnswers,
      "base",
    );
  }

  function methodQuestion(cocktail) {
    return makeQuestion(
      `How is a ${cocktail.name} prepared?`,
      cocktail.method,
      METHODS.filter((method) => method !== cocktail.method),
      "method",
    );
  }

  function stepQuestion(cocktail, allCocktails, step) {
    const wrongAnswers = allCocktails
      .filter((item) => normalize(item.name) !== normalize(cocktail.name))
      .flatMap((item) => item.steps || [])
      .concat(
        COCKTAILS
          .filter((item) => normalize(item.name) !== normalize(cocktail.name))
          .flatMap((item) => item.steps || []),
      );
    return makeQuestion(
      `Which step is part of making a ${cocktail.name}?`,
      step,
      wrongAnswers,
      "step",
    );
  }

  function generateQuestions(cocktailName, allCocktails) {
    const list = Array.isArray(allCocktails) && allCocktails.length ? allCocktails : COCKTAILS;
    const cocktail = findCocktail(cocktailName, list);
    const selectedSteps = shuffle(cocktail.steps || []).slice(0, 3);
    const questions = [
      baseQuestion(cocktail, list),
      methodQuestion(cocktail),
      ...selectedSteps.map((step) => stepQuestion(cocktail, list, step)),
    ];

    return shuffle(questions).slice(0, QUESTION_COUNT);
  }

  function setScreen(screenName) {
    introScreen.style.display = screenName === "intro" ? "block" : "none";
    quizScreen.style.display = screenName === "quiz" ? "block" : "none";
    resultScreen.style.display = screenName === "result" ? "block" : "none";
  }

  function clearNextTimer() {
    window.clearTimeout(state.nextTimer);
    state.nextTimer = null;
  }

  function renderHearts() {
    heartsEl.textContent = "";
    heartsEl.setAttribute("aria-label", `${state.score} hearts remaining`);
    for (let i = 0; i < QUESTION_COUNT; i += 1) {
      const img = document.createElement("img");
      img.className = "mg-heart";
      img.src = i < state.score ? HEART_FULL : HEART_EMPTY;
      img.alt = i < state.score ? "Full heart" : "Empty heart";
      heartsEl.appendChild(img);
    }
  }

  function renderQuestion() {
    const question = state.questions[state.index];
    state.locked = false;
    progressEl.textContent = `${state.index + 1} / ${QUESTION_COUNT}`;
    questionEl.textContent = question.question;
    subtitleEl.textContent = sample(PRE_ANSWER_LINES);
    optionsEl.textContent = "";

    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mg-option";
      button.textContent = option;
      button.addEventListener("click", () => handleAnswer(index));
      optionsEl.appendChild(button);
    });
  }

  function showQuiz() {
    clearNextTimer();
    state.index = 0;
    state.score = QUESTION_COUNT;
    renderHearts();
    renderQuestion();
    setScreen("quiz");
  }

  function showResult() {
    clearNextTimer();
    resultTitleEl.textContent = state.cocktailName;
    resultScoreEl.textContent = `${state.score} / ${QUESTION_COUNT}`;
    resultCommentEl.textContent = RESULT_COMMENTS[state.score] || RESULT_COMMENTS[0];
    setScreen("result");
  }

  function handleAnswer(selectedIndex) {
    if (state.locked) return;

    state.locked = true;
    const question = state.questions[state.index];
    const isCorrect = selectedIndex === question.correctIndex;
    const buttons = Array.from(optionsEl.querySelectorAll(".mg-option"));

    if (!isCorrect) {
      state.score = Math.max(0, state.score - 1);
    }

    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === question.correctIndex) {
        button.classList.add("is-correct");
      }
      if (index === selectedIndex && !isCorrect) {
        button.classList.add("is-wrong");
      }
    });

    subtitleEl.textContent = isCorrect ? sample(CORRECT_LINES) : sample(WRONG_LINES);
    renderHearts();

    state.nextTimer = window.setTimeout(() => {
      if (state.index >= QUESTION_COUNT - 1) {
        showResult();
        return;
      }

      state.index += 1;
      renderQuestion();
    }, 1500);
  }

  function hideGame() {
    clearNextTimer();
    layer.style.display = "none";
    setScreen("");
    const input = document.getElementById("chat-input");
    if (input) input.focus();
  }

  function startMixingGame(cocktailName) {
    clearNextTimer();
    state.cocktail = findCocktail(cocktailName, COCKTAILS);
    state.cocktailName = state.cocktail.name;
    state.questions = generateQuestions(state.cocktail.name, COCKTAILS);
    state.index = 0;
    state.score = QUESTION_COUNT;
    state.locked = false;

    introLine.textContent = `Think you can make a ${state.cocktailName}?`;
    layer.style.display = "block";
    setScreen("intro");
  }

  introNext.addEventListener("click", showQuiz);
  backButton.addEventListener("click", hideGame);
  restartButton.addEventListener("click", () => startMixingGame(state.cocktailName));

  // ── Persistent game suggestion pill ──

  const suggestPill = document.getElementById("mg-suggest-pill");

  const SPIRIT_COCKTAILS = {
    tequila:   ["Margarita", "Witch", "Daydreaming"],
    gin:       ["Gin Tonic", "Tom Collins", "Perfume Gin", "Orange Blossom"],
    rum:       ["Mojito", "Daiquiri", "Cuba Libre", "Pina Colada"],
    vodka:     ["Bloody Mary", "Cosmopolitan", "Yukiguni"],
    whiskey:   ["Whiskey Sour", "Dog Hair", "Apple Highball"],
    cointreau: ["Orange Tonic", "Night of Rendezvous"],
  };

  function setGameSuggestion(cocktailName) {
    if (!suggestPill) return;
    suggestPill.textContent = `Mix me a ${cocktailName}?`;
    suggestPill.dataset.cocktail = cocktailName;
  }

  function randomCocktail() {
    return COCKTAILS[Math.floor(Math.random() * COCKTAILS.length)].name;
  }

  function suggestionFromReply(replyText) {
    const lower = replyText.toLowerCase();
    for (const c of COCKTAILS) {
      if (lower.includes(c.name.toLowerCase())) return c.name;
    }
    return null;
  }

  if (suggestPill) {
    setGameSuggestion(randomCocktail());

    suggestPill.addEventListener("click", () => {
      const input = document.getElementById("chat-input");
      if (!input) return;
      const name = suggestPill.dataset.cocktail || randomCocktail();
      input.value = `Let's play the mixing game — make me a ${name}!`;
      input.focus();
    });
  }

  window.updateGameSuggestion = function (hint) {
    if (typeof hint === "string") {
      const fromReply = suggestionFromReply(hint);
      if (fromReply) { setGameSuggestion(fromReply); return; }
      const spirit = hint.trim().toLowerCase();
      if (SPIRIT_COCKTAILS[spirit]) {
        const list = SPIRIT_COCKTAILS[spirit];
        setGameSuggestion(list[Math.floor(Math.random() * list.length)]);
        return;
      }
    }
    setGameSuggestion(randomCocktail());
  };

  window.generateQuestions = generateQuestions;
  window.startMixingGame = startMixingGame;
  window.MixingGame = {
    cocktails: COCKTAILS,
    generateQuestions,
    getState: () => ({
      cocktailName: state.cocktailName,
      index: state.index,
      score: state.score,
      locked: state.locked,
    }),
  };
})();
