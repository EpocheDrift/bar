# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Phoenix's Bar** is a pixel art AI bar game. The player is under anesthesia for a cybernetic augmentation (year 4144), their mind slips into a nameless bar, and they talk to Phoenix — an AI bartender with a real person's personality — who recommends cocktails through conversation and can challenge them to a Mixing Game quiz. Portfolio-level creative project. Live at bar.chaostudio.org.

Team: Zayn (development), Lisa (visual design). Work branch is `v2`.

## Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set API key — copy .env.example to .env and fill in:
# MINIMAX_API_KEY="your-key-here"

# Run locally: Flask serves both the static frontend and /chat
python server.py          # then open http://localhost:5000
```

The frontend calls `/chat` with a relative URL, so serving the static files from a different origin (e.g. `python -m http.server 8080`) breaks chat. Use the Flask server for local dev.

There is no build step, test suite, or linter.

```bash
# Production (on the server, in /srv/bar)
docker compose up -d
```

## Architecture

Plain JS frontend (Kaplay + HTML layers, no framework, no bundler) + a minimal Flask backend that only proxies AI calls.

### Directory layout

```
index.html           # Entry point: Kaplay canvas + HTML layers (bar, chat, mixing game)
main.js              # Kaplay init, intro sequence, bar layer, Phoenix animation, bottle clicks
chat.js              # Chat UI: speech bubble, typewriter, quick-reply pills, /chat calls
mixing-game.js       # Mixing Game: quiz generation, intro/quiz/result screens, hearts
style.css            # All overlay styles (VT323 pixel font)
server.py            # Flask app: PhoenixAI class + POST /chat
Dockerfile           # Backend-only image (gunicorn), copies server.py + prompt/cocktail docs
docker-compose.yml   # Binds Flask to 127.0.0.1:5000
Caddyfile            # HTTPS, static file serving, proxies /chat, blocks secrets/source
data/
  recipes.json       # 16 recipes — NOT read by any code currently
docs/
  kaplay.js          # Vendored Kaplay (loaded locally, not from CDN)
  Action-Index.md    # Single source of truth for task status (Chinese)
  character/         # Phoenix-Prompt.md (system prompt, read by server)
  project/           # Cocktail-List.md (31 drinks, read by server), Worldbuilding.md
  design/            # Flow-v2, MainPage-Interaction, MixingGame-Design, Figma-Sync
  tech/              # Kaplay notes
  assets/            # Pixel art (BG/, Character/, Alcohol/, UI/, …)
  Lisa/              # Fonts and splash art from Lisa
  archive/           # Superseded v1 docs — don't treat as current
```

### Frontend

**Kaplay** (`main.js`): 1024×576 internal resolution, `scale: 2`, `crisp: true`, `global: false` (call everything via `k.`). Two scenes:
- `intro` — a 23-step narrative sequence defined in the `introScreens` array (text, images, vignettes, street/bar dialog). Click on the canvas advances it.
- `bar` — mostly just shows `#bar-layer` and starts the light flicker.

**Bar layer** is HTML, not canvas: `#bar-layer` / `#bar-scale-root` is laid out in a fixed 2048px coordinate space and scaled to the viewport (`updateBarScale`). Phoenix is `<img id="phoenix-img">`; animation swaps `img.src` via `window.setPhoenixState(state)` using `phoenixSpritePaths` (idle + random blink every 4–6s). Bottles are `<img class="bar-bottle" data-spirit="…">`.

**Cross-file bridge** — the three scripts load in order `main.js` → `mixing-game.js` → `chat.js` and talk through `window.*` functions (always guarded with `typeof … === "function"`):
- Bottle click → `emitBottleSignal(spirit)` + `setQuickBubbles(...)` + `updateGameSuggestion(spirit)`. The next sent message is prefixed with `[User is looking at the <spirit>]` via `consumeBottleSignal()`.
- `onBarSceneReady()` → chat sends the opening `__init__` message.
- `/chat` response → typewriter reply, `setQuickBubbles(suggestions)`, and `startMixingGame(game)` if `game` is set.
- `showStreetDialog` / `showBarDialog` (and `hide…`) are defined in `chat.js`, called by the intro.

**Mixing Game** (`mixing-game.js`): 5 questions generated from the hardcoded `COCKTAILS` array (31 drinks: base spirit, method, steps), 5 hearts, intro → quiz → result screens. `SPIRIT_COCKTAILS` maps bottles to drinks for the persistent "Mix me a …?" suggestion pill.

### Backend (Flask)

`POST /chat`

```
Request:  { messages: [{role, content}, ...] }
Response: { reply: string, game: string | null, suggestions: string[] }
```

Stateless — the client (`chat.js` `messages` array) sends the full history every time. Flask also serves static files at `/` and `/<path>` for local dev (dotfiles 404); in production Caddy serves static files and only `/chat` reaches Flask.

### AI integration (`PhoenixAI` in server.py)

- Model: **MiniMax** via the OpenAI SDK (OpenAI-compatible endpoint). Env: `MINIMAX_API_KEY` (falls back to `OPENAI_API_KEY`), `MINIMAX_BASE_URL`, `MINIMAX_MODEL` (default `MiniMax-M3.1-Flash`), `MINIMAX_REASONING_EFFORT` (default `low`), `MINIMAX_MAX_TOKENS` (default 1200). `ALLOWED_ORIGIN` controls CORS on `/chat`.
- System prompt = the fenced block under `## SYSTEM PROMPT` in `docs/character/Phoenix-Prompt.md`, with the `[INJECT: …Cocktail-List.md…]` placeholder replaced by the full cocktail list, plus two appended protocols:
  - **Game trigger**: Phoenix ends a reply with `[GAME:Cocktail Name]` to launch the Mixing Game. The model often forgets the marker, so `_infer_game` also starts the game when Phoenix's reply contains a challenge line (`CHALLENGE_RE`, e.g. "Let's find out") or the user's last message says "mixing game", picking the most recently mentioned cocktail (word-boundary match, plus `COCKTAIL_ALIASES`).
  - **Suggestions**: every reply should end with `SUGGEST: "a" | "b" | "c"`. MiniMax-M3.1-Flash drops this line in roughly half of replies (prompt wording didn't change that), so the server fills in 3 from `DEFAULT_SUGGESTIONS`.
  - The MiniMax key has an RPM rate limit (429 → fallback line); avoid parallel load tests against it.
  Both markers and any `<think>…</think>` reasoning are stripped before the reply reaches the client.
- Opening message (`__init__` or empty) returns a canned "Welcome." without calling the API.
- On any failure / empty reply / missing key: a random cold one-liner from `fallback_lines`.

### Cocktail data lives in three places

- `docs/project/Cocktail-List.md` — what Phoenix knows (server reads it at startup)
- `COCKTAILS` in `mixing-game.js` — what the quiz uses
- `data/recipes.json` — unused

Adding or renaming a drink means updating the first two in sync (names must match for `[GAME:Name]` lookups and `SPIRIT_COCKTAILS`).

### Deployment

Docker (gunicorn, 2 workers, 60s timeout, non-root) behind Caddy on a self-hosted server. The site root `/srv/bar` is a full git checkout, so the Caddyfile explicitly 404s `.env*`, `.git`, `*.md`, server source and config files. If you add a new server-side or secret file, add it to both `@hidden` and `file_server hide` in the Caddyfile.

### Key constraints

- Desktop-first (1280px+); no auth; no persistence between sessions
- AI response target: under 10 seconds
- Kaplay `crisp: true` — never disable, it maintains pixel art rendering
- API key never committed — use `.env` file (gitignored)
- Keep Kaplay vendored locally (`docs/kaplay.js`) — no CDN scripts
- Update `docs/Action-Index.md` status when finishing a tracked item
