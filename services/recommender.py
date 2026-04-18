"""AI-powered cocktail recommendations via Minimax API (OpenAI-compatible)."""
import json
import streamlit as st
from openai import OpenAI

SYSTEM_PROMPT = (
    "You are a professional cocktail consultant. When given a flavor preference or mood, "
    "return ONLY a JSON array of 3-5 cocktail recommendations. No prose, no markdown fences. "
    "Each object must have: name, description, flavor_tags (array), difficulty (easy/medium/hard), "
    "base_spirit, ingredients (array of strings), why (one sentence explaining the match)."
)


def get_recommendations(preference: str) -> list[dict]:
    """Call Minimax API and return 3-5 structured recipe suggestions.

    Returns [] on API failure or unparseable response.
    Caller should cache results in st.session_state['ai_recommendations'].
    """
    raise NotImplementedError
