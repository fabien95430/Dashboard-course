#!/usr/bin/env python3
"""Crée les copies WebP de la scène du Bureau à partir des PNG d'origine de www/Bureau/.

- www/Bureau/webp/piece.webp : la pièce détourée (le beige autour est rendu transparent), 1200 px de large ;
- www/Bureau/webp/<poste>.webp : chaque poste détouré, 360 px de large, avec une ombre
  de contact douce intégrée (le poste ne flotte pas sur le parquet) ; les variantes
  frappe / tête reprennent l'image au repos et n'en remplacent que les mains ou la tête
  (zones ZONES) : bureau, chaise et écran restent identiques au pixel près quand elles alternent ;
- www/Bureau/webp/dossier.webp : dossier indépendant, affiché seulement pour une tâche non terminée.
Les PNG d'origine restent les sources et ne sont jamais modifiés.
Nécessite Pillow et NumPy.
Usage : python3 scripts/make_bureau_images.py
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "www" / "Bureau"
TARGET = SOURCE / "webp"
POSTES = {
    "02-trieur-repos.png": "trieur-repos.webp",
    "03-developpeur-repos.png": "developpeur-repos.webp",
    "04-testeur-repos.png": "testeur-repos.webp",
}
# Variante → (image au repos, zone reprise de la variante en pixels du PNG d'origine, fichier).
VARIANTES = {
    "05-trieur-frappe.png": ("02-trieur-repos.png", (430, 640, 720, 860), "trieur-frappe.webp"),
    "06-trieur-tete.png": ("02-trieur-repos.png", (470, 270, 780, 600), "trieur-tete.webp"),
    "07-developpeur-frappe.png": ("03-developpeur-repos.png", (470, 620, 740, 840), "developpeur-frappe.webp"),
    "08-developpeur-tete.png": ("03-developpeur-repos.png", (490, 210, 800, 520), "developpeur-tete.webp"),
    "09-testeur-frappe.png": ("04-testeur-repos.png", (470, 520, 880, 760), "testeur-frappe.webp"),
    "10-testeur-tete.png": ("04-testeur-repos.png", (630, 50, 960, 400), "testeur-tete.webp"),
}
# Source indépendante : la pièce ne contient aucun dossier permanent.
DOSSIER_SOURCE = "13-dossier-tache.png"
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


def align_on(base: Image.Image, variant: Image.Image) -> Image.Image:
    """Décale la variante (±6 px) pour que son bureau (bas de l'image) recouvre celui du repos."""
    small = 4
    ref = np.asarray(base.getchannel("A").reduce(small), dtype=float)
    cur = np.asarray(variant.getchannel("A").reduce(small), dtype=float)
    height, width = ref.shape
    top, margin = int(height * 0.6), 3
    best = (float("inf"), 0, 0)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            a = cur[top - dy:height - margin - dy, margin - dx:width - margin - dx]
            b = ref[top:height - margin, margin:width - margin]
            if a.shape == b.shape:
                best = min(best, (float(np.abs(a - b).mean()), dx, dy))
    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    canvas.alpha_composite(variant, (best[1] * small, best[2] * small))
    return canvas


def only_zone(base: Image.Image, variant: Image.Image, zone: tuple[int, int, int, int]) -> Image.Image:
    """Image au repos, avec seulement ce qui change dans la zone (mains ou tête) repris de la variante."""
    a = np.asarray(base.filter(ImageFilter.GaussianBlur(1.5)), dtype=int)
    b = np.asarray(variant.filter(ImageFilter.GaussianBlur(1.5)), dtype=int)
    changed = Image.fromarray(((np.abs(a - b).max(2) > 22) * 255).astype("uint8")).filter(ImageFilter.MaxFilter(31))
    area = Image.new("L", base.size, 0)
    ImageDraw.Draw(area).rounded_rectangle(zone, radius=60, fill=255)
    mask = Image.fromarray(np.minimum(np.asarray(changed), np.asarray(area))).filter(ImageFilter.GaussianBlur(10))
    return Image.composite(variant, base, mask)


def save_poste(image: Image.Image, target: str) -> None:
    poste = with_contact_shadow(image)
    poste = poste.resize((POSTE_WIDTH, round(poste.height * POSTE_WIDTH / poste.width)), Image.LANCZOS)
    poste.save(TARGET / target, "WEBP", quality=88, method=6, exact=False)


def main() -> int:
    TARGET.mkdir(exist_ok=True)
    room = cut_out_room(Image.open(SOURCE / "01-piece-vide.png").convert("RGB"))
    room = room.resize((1200, round(room.height * 1200 / room.width)), Image.LANCZOS)
    room.save(TARGET / "piece.webp", "WEBP", quality=86, method=6, exact=False)
    for source, target in POSTES.items():
        save_poste(Image.open(SOURCE / source).convert("RGBA"), target)
    for source, (base, zone, target) in VARIANTES.items():
        rest = Image.open(SOURCE / base).convert("RGBA")
        variant = Image.open(SOURCE / source).convert("RGBA").resize(rest.size, Image.LANCZOS)
        changed = with_contact_shadow(only_zone(rest, align_on(rest, variant), zone))
        fixed = Image.open(TARGET / POSTES[base]).convert("RGBA")
        changed = changed.resize(fixed.size, Image.LANCZOS)
        area = Image.new("L", fixed.size, 0)
        scale = POSTE_WIDTH / rest.width
        x0, y0, x1, y1 = zone
        ImageDraw.Draw(area).rectangle(
            (int((x0-32)*scale), int((y0-32)*scale),
             int((x1+32)*scale), int((y1+32)*scale)), fill=255)
        stable = Image.composite(changed, fixed, area)
        assert not np.any(np.asarray(stable)[np.asarray(area)==0] != np.asarray(fixed)[np.asarray(area)==0])
        stable.save(TARGET / target, "WEBP", lossless=True, method=6, exact=True)
    folder = Image.open(SOURCE / DOSSIER_SOURCE).convert("RGBA").resize((105, 74), Image.LANCZOS)
    folder.save(TARGET / "dossier.webp", "WEBP", lossless=True, method=6, exact=True)
    for path in sorted(TARGET.glob("*.webp")):
        print(f"{path.relative_to(ROOT)} {path.stat().st_size} octets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
