#!/usr/bin/env python3
"""Crée les copies WebP des plats manquantes : vignettes de cartes et photos de fiche.

Chaque photo www/Plats/<nom>.png reste la source :
- www/Plats/cartes/<nom>.webp (720 px) pour les cartes du Catalogue ;
- www/Plats/fiches/<nom>.webp (1200 px, qualité 92) pour la photo de la fiche plat (~290 Ko au lieu de ~2,4 Mo).
Sans copie WebP, l'application reprend automatiquement la photo PNG d'origine (plus lente).
Nécessite Pillow.
Usage : python3 scripts/make_dish_cards.py [--force]
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "www" / "Plats"
TARGETS = (
    (SOURCE / "cartes", 720, 92),
    (SOURCE / "fiches", 1200, 92),
)


def main() -> int:
    force = "--force" in sys.argv[1:]
    created = 0
    for target, width, quality in TARGETS:
        target.mkdir(exist_ok=True)
        for photo in sorted(SOURCE.glob("*.png")):
            copy = target / (photo.stem + ".webp")
            if copy.exists() and not force:
                continue
            with Image.open(photo) as image:
                image = image.convert("RGB")
                height = round(image.height * width / image.width)
                image.resize((width, height), Image.LANCZOS).save(copy, "WEBP", quality=quality, method=6)
            created += 1
            print(f"copie créée : {copy.relative_to(ROOT)}")
    print(f"{created} copie(s) WebP créée(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
