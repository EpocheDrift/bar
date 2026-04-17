"""Recipe detail page — full recipe view with serving size scaler (Issue #6)."""
import streamlit as st

st.set_page_config(page_title="Recipe Detail", page_icon="🍹", layout="centered")

# TODO: Display st.session_state['selected_recipe'] details
# TODO: Serving size selector (×1 / ×2 / ×4) — call services.scaler.scale_recipe
# TODO: "Start Mixing" button → navigate to 05_mix
