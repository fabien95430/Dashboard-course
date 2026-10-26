#!/usr/bin/env python3
"""Crée les vignettes de cartes des plats (www/Plats/cartes/*.webp) manquantes.

Chaque photo www/Plats/<nom>.png reste la source ; la carte du Catalogue utilise une
copie WebP de 720 px de large, légère et prête à s'afficher. Sans vignette, la carte
reprend automatiquement la photo d'origine (plus lente). Nécessite Pillow.
Usage : python3 scripts/make_dish_cards.py [--force]
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "www" / "Plats"
TARGET = SOURCE / "cartes"
WIDTH = 720


def main() -> int:
    force = "--force" in sys.argv[1:]
    TARGET.mkdir(exist_ok=True)
    created = 0
    for photo in sorted(SOURCE.glob("*.png")):
        card = TARGET / (photo.stem + ".webp")
        if card.exists() and not force:
            continue
        with Image.open(photo) as image:
            image = image.convert("RGB")
            height = round(image.height * WIDTH / image.width)
            image.resize((WIDTH, height), Image.LANCZOS).save(card, "WEBP", quality=82, method=6)
        created += 1
        print(f"vignette créée : {card.relative_to(ROOT)}")
    print(f"{created} vignette(s) créée(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
