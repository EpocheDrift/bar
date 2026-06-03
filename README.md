# Phoenix's Bar

A pixel art AI bar game. You walk into a nameless bar, sit down, and talk to Phoenix — a bartender who knows what you need before you do. Get a cocktail recommendation through conversation, then prove you can make it yourself in the Mixing Game.

Live at [bar.chaostudio.org](https://bar.chaostudio.org)

---

## What it is

- **Conversation-driven** — Phoenix is an AI bartender with a real personality. No menus, no forms. Just talk.
- **Mixing Game** — Phoenix can challenge you to a step-by-step quiz on how to make the drink. Get it wrong enough and you're cut off.
- **Pixel art aesthetic** — Hand-drawn sprites, pixel font, a bar that feels like it's hiding something.

---

## Tech Stack

| Layer | Details |
|---|---|
| **Frontend** | Kaplay (Kaboom.js) canvas + HTML overlay |
| **Backend** | Python / Flask + Gunicorn |
| **AI** | Minimax API (OpenAI-compatible) |
| **Deployment** | Docker + Caddy on a self-hosted Ubuntu server |

---

## Local Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up API key — create a .env file:
# MINIMAX_API_KEY="your-key-here"

# Run the Flask backend
python server.py

# Serve the frontend (open index.html, or):
python -m http.server 8080
```

---

## Production Deployment

The backend runs in Docker behind Caddy. Caddy serves all static files directly and proxies only `/chat` to Flask.

```bash
git clone https://github.com/EpocheDrift/bar.git /srv/bar
cd /srv/bar

# Create .env with your API key
cp .env.example .env

# Start Flask container
docker compose up -d
```

Caddy config (`Caddyfile`) is included. Point your DNS to the server and Caddy handles HTTPS automatically.

---

## Project Structure

```
index.html           # Entry point
main.js              # Kaplay scenes and sprite logic
chat.js              # Chat UI and API calls
mixing-game.js       # Mixing Game UI and quiz engine
style.css            # Overlay styles
server.py            # Flask backend — single /chat route
Dockerfile
docker-compose.yml
Caddyfile
data/
  recipes.json       # Cocktail recipe store
docs/
  character/         # Phoenix system prompt and personality
  project/           # Cocktail list (31 drinks with steps)
  design/            # Game flow and interaction design
  assets/            # Pixel art sprites
```

---

## Team

| Role | |
|---|---|
| Development | Zayn |
| Visual Design | Lisa |
