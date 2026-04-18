"""Results page for ingredient matches and AI recommendations."""

from collections.abc import Iterable

import streamlit as st

from services.matcher import load_recipes


st.set_page_config(page_title="Results", page_icon="🍹", layout="centered")


@st.cache_data(show_spinner=False)
def _recipes() -> list[dict]:
    return load_recipes()


def _normalize(values: Iterable[str]) -> set[str]:
    return {value.strip().lower() for value in values if value and value.strip()}


def _match_recipes(user_ingredients: list[str], recipes: list[dict]) -> list[dict]:
    user_set = _normalize(user_ingredients)
    matches: list[dict] = []

    for recipe in recipes:
        ingredient_names = {ingredient["name"].strip().lower() for ingredient in recipe.get("ingredients", [])}
        missing = sorted(ingredient_names - user_set)
        hits = len(ingredient_names & user_set)
        if hits == 0:
            continue

        matches.append(
            {
                **recipe,
                "match_type": "exact" if not missing else "partial",
                "missing": missing,
                "match_score": hits,
            }
        )

    return sorted(
        matches,
        key=lambda item: (item["match_type"] != "exact", -item["match_score"], item["name"]),
    )


def _open_detail(recipe: dict) -> None:
    st.session_state["selected_recipe"] = recipe
    st.session_state["serving_multiplier"] = 1
    st.session_state["current_step_index"] = 0
    st.switch_page("pages/04_detail.py")


st.title("Results")
st.write("Ingredient matches and recommendations live here.")

recipes = _recipes()
user_ingredients = st.session_state.get("user_ingredients", [])
matches = _match_recipes(user_ingredients, recipes) if user_ingredients else []

if not user_ingredients:
    st.info("Add ingredients on the home page to see match results.")
else:
    st.subheader("Ingredient Matches")
    if not matches:
        st.warning("No matches found yet.")

    for recipe in matches:
        st.markdown(f"**{recipe['name']}**")
        st.caption(recipe["description"])
        st.markdown(
            f"Match: `{recipe['match_type']}`"
            + (f" | Missing: {', '.join(recipe['missing'])}" if recipe["missing"] else "")
        )
        if st.button("View detail", key=f"results_{recipe['id']}"):
            _open_detail(recipe)
        st.divider()

ai_recommendations = st.session_state.get("ai_recommendations", [])
if ai_recommendations:
    st.subheader("AI Recommendations")
    for recommendation in ai_recommendations:
        st.markdown(f"**{recommendation['name']}**")
        st.caption(recommendation["description"])
