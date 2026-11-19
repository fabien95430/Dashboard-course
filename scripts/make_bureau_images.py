#!/usr/bin/env python3
"""Crée les copies WebP de la scène du Bureau à partir des PNG d'origine de www/Bureau/.

- www/Bureau/webp/piece.webp : la pièce détourée (le beige autour est rendu transparent), 1200 px de large ;
- www/Bureau/webp/<poste>.webp : chaque poste détouré, 360 px de large, avec une ombre
  de contact douce intégrée (le poste ne flotte pas sur le parquet).
Les PNG d'origine restent les sources et ne sont jamais modifiés.
Nécessite Pillow.
Usage : python3 scripts/make_bureau_images.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "www" / "Bureau"
TARGET = SOURCE / "webp"
POSTES = {
    "02-trieur-repos.png": "trieur-repos.webp",
    "03-developpeur-repos.png": "developpeur-repos.webp",
    "04-testeur-repos.png": "testeur-repos.webp",
}
POSTE_WIDTH = 360
# Contour de la pièce dans 01-piece-vide.png (1464 × 1074) : haut des murs, côtés, bords du parquet.
ROOM_OUTLINE = (
    (62, 378), (707, 0), (728, 0), (728, 26), (1404, 416),
    (1404, 698), (755, 1074), (709, 1074), (62, 698),
)


def cut_out_room(room: Image.Image) -> Image.Image:
    scale = 4
    mask = Image.new("L", (room.width * scale, room.height * scale), 0)
    ImageDraw.Draw(mask).polygon([(x * scale, y * scale) for x, y in ROOM_OUTLINE], fill=255)
    mask = mask.resize(room.size, Image.LANCZOS)
    room = room.convert("RGBA")
    room.putalpha(mask)
    return room


def with_contact_shadow(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    shadow = alpha.filter(ImageFilter.GaussianBlur(radius=round(image.width / 70)))
    shadow = ImageChops.offset(shadow, round(image.width / 90), round(image.width / 70))
    shadow = shadow.point(lambda value: round(value * 0.16))
    layer = Image.new("RGBA", image.size, (88, 66, 44, 0))
    layer.putalpha(shadow)
    layer.alpha_composite(image)
    return layer


def main() -> int:
    TARGET.mkdir(exist_ok=True)
    room = cut_out_room(Image.open(SOURCE / "01-piece-vide.png").convert("RGB"))
    room = room.resize((1200, round(room.height * 1200 / room.width)), Image.LANCZOS)
    room.save(TARGET / "piece.webp", "WEBP", quality=86, method=6, exact=False)
    for source, target in POSTES.items():
        poste = with_contact_shadow(Image.open(SOURCE / source).convert("RGBA"))
        poste = poste.resize((POSTE_WIDTH, round(poste.height * POSTE_WIDTH / poste.width)), Image.LANCZOS)
        poste.save(TARGET / target, "WEBP", quality=88, method=6, exact=False)
    for path in sorted(TARGET.glob("*.webp")):
        print(f"{path.relative_to(ROOT)} {path.stat().st_size} octets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
