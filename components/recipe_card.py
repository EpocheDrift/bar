"""Reusable recipe card widget."""
import streamlit as st


def recipe_card(recipe: dict, show_missing: bool = False) -> None:
    """Render a compact recipe card.

    Args:
        recipe: Recipe dict (may include 'missing' and 'match_type' from matcher).
        show_missing: If True, display missing ingredients below the card.
    """
    raise NotImplementedError
