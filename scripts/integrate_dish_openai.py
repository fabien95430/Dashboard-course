#!/usr/bin/env python3
"""Run the existing dish integrator with the validated dessert visual direction."""

from __future__ import annotations

import integrate_dish as base

_original_image_prompt = base.image_prompt


def dessert_image_prompt(name: str, metadata: dict, child: bool) -> str:
    if "Dessert" not in metadata.get("tags", []):
        return _original_image_prompt(name, metadata, child)

    ingredients = ", ".join(metadata["ingredients"])
    description = metadata["description"]
    return (
        f"Photo culinaire réaliste, harmonieuse et appétissante de {name}, un seul dessert servi dans un contenant adapté à la recette, "
        "posé sur une table en bois de chêne chaleureuse et naturelle. Vue légèrement plongeante en trois-quarts haut, cadrage cohérent avec "
        "les autres photos de plats de l'application : dessert placé assez haut dans l'image, entier ou quasi entier, sans coupe importante, "
        "avec une marge naturelle de table visible autour. "
        f"Recette et présentation : {description}. Ingrédients visibles et cohérents : {ingredients}. "
        "Disposer autour du dessert quelques ingrédients ou éléments cohérents, comme sur la référence visuelle Crème brûlée, de manière discrète "
        "et éditoriale, sans surcharge. Lumière naturelle chaude et douce, textures alimentaires réalistes, couleurs gourmandes mais naturelles, "
        "profondeur de champ légère. Aucun collage, aucune grille, aucun deuxième dessert, aucun texte, logo, watermark, main ou personne, "
        "aucun gros flou artificiel dans les coins, aucune bordure étirée."
    )


base.image_prompt = dessert_image_prompt

if __name__ == "__main__":
    base.main()
