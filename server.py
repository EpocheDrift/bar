from __future__ import annotations

import os
import random
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory
from flask_cors import CORS

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - local setup should install requirements
    OpenAI = None


BASE_DIR = Path(__file__).resolve().parent
PROMPT_PATH = BASE_DIR / "docs" / "character" / "Phoenix-Prompt.md"
COCKTAIL_LIST_PATH = BASE_DIR / "docs" / "project" / "Cocktail-List.md"
GAME_MARKER_RE = re.compile(r"\[(?:GAME|Mixing\s*Game)\s*:\s*([^\]]+)\]", re.IGNORECASE)
SUGGEST_RE = re.compile(r"(?:^|\n)SUGGEST:\s*(.+?)\s*$", re.MULTILINE)
QUOTED_SUGGESTION_RE = re.compile(r'"([^"]+)"')


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def extract_system_prompt(markdown: str) -> str:
    match = re.search(r"## SYSTEM PROMPT\s*```(?:\w+)?\s*(.*?)\s*```", markdown, re.S)
    return match.group(1).strip() if match else markdown.strip()


class PhoenixAI:
    fallback_lines = (
        "The line went dead. Typical.",
        "Something broke. Pretend that was atmospheric.",
        "The bar is quiet. Try again if you must.",
    )

    def __init__(self) -> None:
        load_dotenv()
        prompt_text = extract_system_prompt(read_text(PROMPT_PATH))
        cocktail_list = read_text(COCKTAIL_LIST_PATH)
        prompt_text = prompt_text.replace(
            "[INJECT: full contents of docs/project/Cocktail-List.md at server startup]",
            cocktail_list,
        )

        game_protocol = (
            "GAME TRIGGER PROTOCOL\n"
            "The Mixing Game is a machine-driven quiz. To launch it, you must output a trigger marker.\n"
            "Saying challenge words alone ('show me', 'let's find out', 'prove it') does NOTHING "
            "— the game will not start unless the marker is present.\n\n"
            "You MUST append the marker in ALL of these cases:\n"
            "1. You decide to challenge the customer (e.g. you say 'show me' or 'let's find out').\n"
            "2. The customer claims they already know how to make the drink, or says they don't need instructions.\n"
            "3. The customer explicitly asks to play the mixing game.\n\n"
            "The marker must be on its own line at the very end of your response, "
            "exactly this format — no variations, no spaces around the colon:\n"
            "[GAME:Cocktail Name]\n"
            "Example: [GAME:Gin Tonic] or [GAME:Whiskey Sour]\n"
            "Use the exact cocktail name from the cocktail list. "
            "Do not write 'Mixing Game:' or any other format. Only [GAME:Name].\n"
            "CRITICAL: The marker and your spoken words must go in the SAME response. "
            "Do not say 'show me' in one message and expect the game to start — "
            "they must be together."
        )
        suggest_protocol = (
            "SUGGESTION OUTPUT PROTOCOL (REQUIRED — every single response, no exceptions)\n"
            "The very last line of every response must be a SUGGEST line. "
            "Even if your response is a question. Even if it is one word. Always.\n"
            "Format (exact, no variations):\n"
            'SUGGEST: "suggestion1" | "suggestion2" | "suggestion3"\n'
            "1 to 3 suggestions, each 5 words or fewer, natural English, "
            "fits Phoenix's cold personality. "
            "This line is a machine-readable control signal — "
            "it is stripped server-side and never shown to the user."
        )
        self.system_message = f"{prompt_text}\n\n---\n\n{game_protocol}\n\n---\n\n{suggest_protocol}"
        self.model = os.getenv("MINIMAX_MODEL", "MiniMax-Text-01")
        api_key = os.getenv("MINIMAX_API_KEY") or os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("MINIMAX_BASE_URL", "https://api.minimax.chat/v1")
        self.client = OpenAI(api_key=api_key, base_url=base_url) if api_key and OpenAI else None
        self._cocktail_names = [
            n.strip()
            for n in re.findall(r"###\s*\*{0,3}\d+\.\s+\*{0,3}([^(\n*✅]+)", cocktail_list)
            if n.strip()
        ]

    def chat(self, messages: list[dict[str, Any]]) -> tuple[str, str | None, list[str]]:
        clean_messages = self._clean_messages(messages)
        if self._is_opening(clean_messages):
            return "Welcome.", None, ["What do you want?", "Surprise me", "Something drinkable?"]
        if self.client is None:
            return self._fallback(), None, []

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": self.system_message}, *clean_messages],
                temperature=0.85,
                max_tokens=350,
            )
            reply = response.choices[0].message.content or ""
            display_text, game, suggestions = self._parse_reply(reply)
            if not game:
                game = self._extract_requested_game(clean_messages)
            return display_text, game, suggestions
        except Exception:
            return self._fallback(), None, []

    def _extract_requested_game(self, messages: list[dict[str, str]]) -> str | None:
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )
        if not re.search(r"mixing\s*game", last_user, re.IGNORECASE):
            return None
        # Search full history newest-first for the most recently mentioned cocktail
        for msg in reversed(messages):
            lower = msg["content"].lower()
            for name in self._cocktail_names:
                if name.lower() in lower:
                    return name
        return None

    def _clean_messages(self, messages: list[dict[str, Any]]) -> list[dict[str, str]]:
        clean: list[dict[str, str]] = []
        for message in messages:
            role = message.get("role")
            content = message.get("content")
            if role in {"user", "assistant"} and isinstance(content, str):
                clean.append({"role": role, "content": content})
        return clean

    def _is_opening(self, messages: list[dict[str, str]]) -> bool:
        if not messages:
            return True
        last = messages[-1]
        return last["role"] == "user" and last["content"].strip() in {"", "__init__"}

    def _parse_reply(self, reply: str) -> tuple[str, str | None, list[str]]:
        match = GAME_MARKER_RE.search(reply)
        game = match.group(1).strip() if match else None
        display_text = GAME_MARKER_RE.sub("", reply).strip()

        suggestions: list[str] = []
        suggest_match = SUGGEST_RE.search(display_text)
        if suggest_match:
            raw_suggestions = suggest_match.group(1)
            quoted = QUOTED_SUGGESTION_RE.findall(raw_suggestions)
            parts = quoted if quoted else raw_suggestions.split("|")
            suggestions = [part.strip().strip('"') for part in parts if part.strip()][:3]
            display_text = (display_text[: suggest_match.start()] + display_text[suggest_match.end() :]).strip()

        return display_text or "...", game, suggestions

    def _fallback(self) -> str:
        return random.choice(self.fallback_lines)


app = Flask(__name__, static_folder=None)
_allowed_origin = os.getenv("ALLOWED_ORIGIN", "*")
CORS(app, resources={r"/chat": {"origins": _allowed_origin}})
phoenix = PhoenixAI()


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:filename>")
def static_files(filename: str):
    if filename.startswith(".") or "/." in filename:
        abort(404)
    return send_from_directory(BASE_DIR, filename)


@app.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    messages = payload.get("messages", [])
    if not isinstance(messages, list):
        messages = []
    reply, game, suggestions = phoenix.chat(messages)
    return jsonify({"reply": reply, "game": game, "suggestions": suggestions})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
