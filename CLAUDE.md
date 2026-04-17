# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Configure API key — create .streamlit/secrets.toml with:
# ANTHROPIC_API_KEY = "your-key-here"

# Run the app locally
streamlit run app.py
```

## Architecture

**Pour Decisions / HangoverGPT** is a single-tier Streamlit app. All logic is server-side Python; there is no separate frontend. The browser receives rendered HTML/JS from Streamlit.

### Directory layout (planned — partially scaffolded)

```
app.py               # Entry point: st.set_page_config, top-level routing
pages/               # Streamlit multi-page routing (01_home, 02_results, 03_detail, 04_mix)
services/
  matcher.py         # Ingredient-based recipe filtering (exact + partial match)
  recommender.py     # Claude API call → structured JSON recommendations
  scaler.py          # Serving size multiplier (×1/×2/×4) — skips null amounts
components/          # Reusable Streamlit widgets (recipe_card, progress_bar)
data/
  recipes.json       # Static recipe store (or recipes.db for SQLite)
.streamlit/
  secrets.toml       # ANTHROPIC_API_KEY — never commit
```

### Cross-page state

All inter-page data passes through `st.session_state`:

| Key | Type | Purpose |
|---|---|---|
| `user_ingredients` | `list[str]` | Ingredient input |
| `selected_recipe` | `dict` | Full recipe object passed to detail/mix pages |
| `current_step_index` | `int` | Mixing simulation progress |
| `serving_multiplier` | `int` | ×1/×2/×4 scaler |
| `ai_recommendations` | `list[dict]` | Cached Claude API results (avoid re-calling on re-render) |

### AI integration (`services/recommender.py`)

Uses a **system prompt + user prompt** pattern. The system prompt instructs Claude to return **only a JSON array** (no prose, no markdown fences). Parse with `json.loads`; return `[]` on `JSONDecodeError` for graceful degradation. Cache results in `st.session_state["ai_recommendations"]` so page re-renders don't re-call the API.

Model: `claude-opus-4-5` (specified in Architecture.md). Access key via `st.secrets["ANTHROPIC_API_KEY"]`.

### Recipe data model

Each recipe has: `id`, `name`, `description`, `difficulty` (`easy`|`medium`|`hard`), `serving_size`, `flavor_tags[]`, `ingredients[]` (`name`, `amount: float|null`, `unit`), `steps[]` (`order`, `action`, `tip?`). Scaling rule: `scaled_amount = base_amount × multiplier`; `null` amounts (to taste) are left unchanged.

## Key constraints

- Desktop-first (1280px+); no auth; no user-generated data to persist in v1.
- AI response NFR: under 10 seconds. `max_tokens=1024` caps response size.
- Recipe store is read-only at runtime; seeded manually.
