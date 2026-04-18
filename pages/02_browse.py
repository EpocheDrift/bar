"""Browse page — full cocktail list with search and filter (Issues #4, #5)."""

from __future__ import annotations

import streamlit as st

from components.recipe_card import recipe_card
from services.matcher import load_recipes


st.set_page_config(page_title="Browse Cocktails", page_icon="🍹", layout="wide")


@st.cache_data(show_spinner=False)
def get_recipes() -> list[dict]:
    """Load the seeded recipe store once per session."""
    recipes = load_recipes()
    return [recipe for recipe in recipes if isinstance(recipe, dict)]


def render_recipe_grid(recipes: list[dict]) -> None:
    """Render recipes in a responsive grid."""
    if not recipes:
        st.warning("No cocktails were found in the recipe store.")
        return

    columns_per_row = 3
    for row_start in range(0, len(recipes), columns_per_row):
        row = recipes[row_start : row_start + columns_per_row]
        columns = st.columns(len(row))
        for column, recipe in zip(columns, row):
            with column:
                recipe_card(recipe)


st.title("Browse Cocktails")
st.caption("Browse the full recipe catalog and open any cocktail to view details.")

recipes = get_recipes()
st.write(f"{len(recipes)} cocktails available")

render_recipe_grid(recipes)
