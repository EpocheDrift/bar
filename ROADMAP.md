# ROADMAP — Pour Decisions (HangoverGPT 🍹)

> **Status as of 2026-04-17:** Project revived. Repo scaffolded; zero features implemented.
> Original deadline (June 1, 2025) has passed. Timeline below is reset from current date.

---

## Design Inconsistencies to Resolve Before Implementing

| # | Issue | Where |
|---|---|---|
| 1 | Browse page (Issue #4) and search/filter (Issue #5) are not in Architecture.md | Add to Architecture.md or remove issues |
| 2 | AI recommendation feature has no GitHub Issue | Create Issue #9 |
| 3 | `base_spirit` field required by Issues #4/#5 but absent from data model | Added to `data/recipes.json` — update Architecture.md |
| 4 | AI model name conflict: README says `claude-3-5-sonnet`, Architecture.md says `claude-opus-4-5` | Pick one and align |
| 5 | SPEC allows "OpenAI API" as alternative — Architecture.md has already committed to Claude | Close the ambiguity in SPEC |

---

## Feature Backlog

### Phase 1 — Foundation (Issue #2) · ~1–2 days
- [ ] Confirm and lock data schema (`data/recipes.json`) — especially `base_spirit` field
- [ ] Seed `recipes.json` with 10–15 real recipes
- [ ] Configure `.streamlit/config.toml` theme
- [ ] Verify `streamlit run app.py` runs clean with the new `pages/` structure
- [ ] Set up `.streamlit/secrets.toml` locally (not committed)

### Phase 2 — Core Browsing (Issues #4, #5) · ~3–4 days
- [ ] `pages/02_browse.py` — grid/list of all recipes using `recipe_card` component
- [ ] `components/recipe_card.py` — card widget (name, difficulty, base spirit, flavor tags)
- [ ] Search bar (filter by name)
- [ ] Filter controls: base spirit, flavor profile, difficulty (multi-select, combinable)
- [ ] Empty-state message when no results match

### Phase 3 — Ingredient Matching (Issue #3) · ~2–3 days
- [ ] `pages/01_home.py` — ingredient multi-select/text input
- [ ] `services/matcher.py` — case-insensitive exact + partial match, sorted by closeness
- [ ] `pages/03_results.py` — render match results with missing ingredient tags
- [ ] Empty-state message when no matches

### Phase 4 — Recipe Detail + Scaler (Issue #6) · ~1–2 days
- [ ] `pages/04_detail.py` — full recipe display
- [ ] `services/scaler.py` — ×1/×2/×4 multiplier (skip `null` amounts)
- [ ] Fractional display: `0.5 oz` → `½ oz`
- [ ] "Start Mixing" button → navigate to `05_mix`

### Phase 5 — Mixing Simulation (Issue #7) · ~2 days
- [ ] `pages/05_mix.py` — one step at a time, Next Step / Start Over
- [ ] `components/progress_bar.py` — labeled progress tracker
- [ ] Completion message after final step

### Phase 6 — AI Recommendations (Issue #9 — to be created) · ~2–3 days
- [ ] Resolve model name (claude-3-5-sonnet vs claude-opus-4-5)
- [ ] `services/recommender.py` — system prompt, API call, JSON parse with fallback
- [ ] Wire into `pages/01_home.py` (flavor/mood input)
- [ ] Display in `pages/03_results.py` alongside ingredient matches
- [ ] Loading spinner + cache results in `st.session_state['ai_recommendations']`

### Phase 7 — UI Polish (Issue #8) · ~2 days
- [ ] Finalize color palette and typography in `config.toml`
- [ ] Consistent spacing and layout across all pages
- [ ] Logo / header branding for "Pour Decisions"
- [ ] Tablet responsiveness check

---

## Estimated Total: ~2–3 weeks from now (phases can overlap)

---

## Out of Scope (v1)
- User accounts / authentication
- Social sharing
- Mobile-first layout (desktop 1280px+ primary)
- Real-time inventory sync
