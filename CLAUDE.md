# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Phoenix's Bar** is a pixel art AI bar game. A player enters a bar, interacts with Phoenix (an AI bartender with a real person's personality), and gets cocktail recommendations through conversation. Built as a portfolio-level creative project.

## Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set API key — create .env with:
# OPENAI_API_KEY="your-key-here"

# Run the Flask backend
python server.py

# Frontend: open index.html directly in browser, or serve with:
python -m http.server 8080
```

## Architecture

Two-tier: a **Kaplay (Kaboom.js) frontend** renders the pixel art game, and a minimal **Flask backend** handles AI API calls. No framework on the frontend beyond Kaplay.

### Directory layout

```
index.html           # Entry point: canvas + HTML overlay containers
main.js              # Kaplay init, scene definitions, sprite interactions
chat.js              # Chat UI logic + Flask API calls
style.css            # Chat overlay styles (pixel font, dark theme)
server.py            # Flask backend — single /chat route
data/
  recipes.json       # Cocktail recipe store (reference data for Phoenix + Mixing Game)
docs/
  README.md          # Docs index
  Action-Index.md    # All action items and dependency map
  project/           # Project direction docs
  design/            # Game design flows and brainstorm
  character/         # Phoenix character sheet and system prompt
  tech/              # Technical notes (Kaplay, etc.)
  assets/            # All pixel art assets (PNG sprites)
```

### Frontend (Kaplay)

Kaplay renders at a low internal resolution (TBD, ~480×270) and scales up with nearest-neighbor interpolation — this is what gives the pixel art its crisp look. All sprites are PNG files drawn onto a Canvas element.

Two scenes:
- `entrance` — title/splash screen (Entrance.png background, START/QUIT)
- `bar` — main scene (bar.png background, Phoenix sprite, bottle sprites)

Scene objects are Kaplay game objects with `sprite()`, `pos()`, `area()` components. Clickable elements (bottles) use `onClick()` to inject context into the chat.

### Frontend–backend bridge

The chat UI is an **HTML div overlay** on top of the Kaplay canvas (not drawn in canvas). This allows native HTML input, scrolling, and styling. JS connects the two layers:
- Bottle click in Kaplay → calls JS function → injects message into chat UI
- AI response received → triggers Phoenix animation state change in Kaplay

### Backend (Flask)

Single route: `POST /chat`

```
Request:  { messages: [{role, content}, ...] }
Response: { reply: "Phoenix's response text" }
```

Maintains no server-side session state — full conversation history is sent from the client on each request. System prompt prepended server-side on every call.

### AI integration

- Model: OpenAI (or Minimax as fallback)
- Pattern: system prompt (Phoenix character) + full conversation history
- Phoenix's system prompt lives in `docs/character/Phoenix-Prompt.md`
- Response is plain conversational text — no JSON, no structured output
- Error handling: on API failure, return a Phoenix-appropriate cold one-liner

### Key constraints

- Desktop-first (1280px+); no auth; no persistence between sessions
- AI response target: under 10 seconds
- Kaplay `crisp: true` — never disable, it maintains pixel art rendering
- API key never committed — use `.env` file (gitignored)
