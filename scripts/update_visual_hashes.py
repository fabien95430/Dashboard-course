#!/usr/bin/env python3
"""Met à jour les empreintes de contenu des visuels dans sw.js.

Le service worker compare ces empreintes avec celles des copies en cache sur l'appareil :
- visuel inchangé : servi depuis le cache, aucun téléchargement ;
- visuel modifié ou nouveau : re-téléchargé avant l'affichage, visible dès la première ouverture ;
- visuel supprimé du dépôt : retiré du cache.

Ne jamais tenir de liste manuelle de visuels à invalider dans sw.js : lancer ce script après
tout ajout, remplacement ou suppression d'image dans www/Items/ ou www/Plats/{cartes,fiches}/.
Le test tests/visual-hashes.test.mjs échoue tant que les empreintes ne sont pas à jour.

Usage : python3 scripts/update_visual_hashes.py [--check]
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SW_PATH = ROOT / "sw.js"
# Dossiers dont le cache est persistant sur l'appareil (voir isPersistentVisual dans sw.js).
FOLDERS = ("Items", "Plats/cartes", "Plats/fiches")
HASH_LENGTH = 10
LINE_PATTERN = re.compile(r"^const VISUAL_HASHES=\{.*\};$", re.M)


def compute_hashes() -> dict[str, str]:
    hashes: dict[str, str] = {}
    for folder in FOLDERS:
        directory = ROOT / "www" / folder
        if not directory.is_dir():
            continue
        for path in sorted(directory.iterdir()):
            if path.is_file() and not path.name.startswith("."):
                digest = hashlib.sha256(path.read_bytes()).hexdigest()[:HASH_LENGTH]
                hashes[f"{folder}/{path.name}"] = digest
    return dict(sorted(hashes.items()))


def render_line(hashes: dict[str, str]) -> str:
    return "const VISUAL_HASHES=" + json.dumps(hashes, ensure_ascii=False, separators=(",", ":")) + ";"


def refresh() -> bool:
    """Réécrit la ligne VISUAL_HASHES de sw.js. Renvoie True si elle a changé."""
    text = SW_PATH.read_text(encoding="utf-8")
    if not LINE_PATTERN.search(text):
        raise SystemExit("Ligne VISUAL_HASHES introuvable dans sw.js")
    line = render_line(compute_hashes())
    updated = LINE_PATTERN.sub(lambda _match: line, text, count=1)
    if updated == text:
        return False
    SW_PATH.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    if "--check" in sys.argv[1:]:
        text = SW_PATH.read_text(encoding="utf-8")
        match = LINE_PATTERN.search(text)
        if not match or match.group(0) != render_line(compute_hashes()):
            print("Empreintes des visuels obsolètes : lancer python3 scripts/update_visual_hashes.py", file=sys.stderr)
            return 1
        print("Empreintes des visuels à jour")
        return 0
    changed = refresh()
    print("Empreintes des visuels mises à jour" if changed else "Empreintes des visuels déjà à jour")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
