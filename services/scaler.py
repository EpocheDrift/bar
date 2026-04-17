"""Serving size scaling for recipe ingredients."""


def scale_recipe(recipe: dict, multiplier: int) -> dict:
    """Return a copy of recipe with ingredient amounts scaled by multiplier.

    Ingredients with amount=None (e.g. 'to taste') are left unchanged.
    """
    raise NotImplementedError
