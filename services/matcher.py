"""Ingredient-based recipe matching."""


def load_recipes(path: str = "data/recipes.json") -> list[dict]:
    import json
    with open(path) as f:
        return json.load(f)


def match_recipes(user_ingredients: list[str], recipes: list[dict]) -> list[dict]:
    """Return recipes ranked by ingredient overlap.

    Each result is the recipe dict augmented with:
      - match_type: "exact" | "partial"
      - missing: list of ingredient names not supplied by the user
    """
    raise NotImplementedError
