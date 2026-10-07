#!/usr/bin/env python3
"""Run the existing dish integrator with the validated dessert visual direction."""

from __future__ import annotations

import os
import re

import integrate_dish as base

_original_image_prompt = base.image_prompt
_original_integrate_files = base.integrate_files


def require_web_push() -> None:
    required = (
        "PUSH_ENDPOINT",
        "PUSH_P256DH",
        "PUSH_AUTH",
        "PUSH_PUBLIC_KEY",
        "COURSES_VAPID_PRIVATE_KEY",
    )
    missing = [name for name in required if not os.getenv(name, "").strip()]
    if missing:
        raise SystemExit(
            "Configuration Web Push incomplète : "
            + ", ".join(missing)
            + ". L’intégration automatique n’est pas lancée sans notification de fin."
        )


def harmonized_integrate_files(name: str, metadata: dict, child: bool, image: bytes) -> tuple[int, str]:
    local_path = base.ROOT / "dish-local-images.js"
    sw_path = base.ROOT / "sw.js"
    local_text = local_path.read_text(encoding="utf-8")
    sw_text = sw_path.read_text(encoding="utf-8")
    local_match = re.search(r"const APP_VERSION='v(\d+)'", local_text)
    sw_match = re.search(r"const CACHE='courses-app-v(\d+)-r\d+'", sw_text)
    if local_match and sw_match and int(sw_match.group(1)) > int(local_match.group(1)):
        local_text = re.sub(
            r"const APP_VERSION='v\d+'",
            f"const APP_VERSION='v{sw_match.group(1)}'",
            local_text,
            count=1,
        )
        local_path.write_text(local_text, encoding="utf-8")
    return _original_integrate_files(name, metadata, child, image)


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
base.integrate_files = harmonized_integrate_files

if __name__ == "__main__":
    require_web_push()
    base.main()
