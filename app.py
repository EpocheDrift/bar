"""HangoverGPT 🍹 — Streamlit entry point."""

from copy import deepcopy

import streamlit as st

DEFAULT_SESSION_STATE = {
    "user_ingredients": [],
    "selected_recipe": {},
    "current_step_index": 0,
    "serving_multiplier": 1,
    "ai_recommendations": [],
    "ai_preference": "",
    "ai_recommendations_error": False,
}


def initialize_session_state() -> None:
    """Populate expected cross-page state on first load."""
    for key, default_value in DEFAULT_SESSION_STATE.items():
        if key not in st.session_state:
            st.session_state[key] = deepcopy(default_value)


st.set_page_config(
    page_title="HangoverGPT 🍹",
    page_icon="🍹",
    layout="centered",
    initial_sidebar_state="expanded",
)

initialize_session_state()

st.title("HangoverGPT 🍹")
st.write("Welcome! Open **Results** in the sidebar to match cocktails to your bar.")
