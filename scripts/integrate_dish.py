#!/usr/bin/env python3
"""Generate and integrate one dish without touching the product catalog or atlases."""

from __future__ import annotations

import base64
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULT_PATH = ROOT / ".courses-dish-result.json"
SPECIAL_SLUGS = {
    "Tagliatelles au saumon": "tagliatelles-saumon",
    "Gratin de courgettes": "gratin-courgettes",
    "Poulet pommes de terre au four": "poulet-pommes-de-terre-four",
}


def load_allowed_tags() -> list[str]:
    text = (ROOT / "dishes-ui.js").read_text(encoding="utf-8")
    match = re.search(r"const FILTERS=\[(.*?)\];", text, flags=re.S)
    if not match:
        raise RuntimeError("Filtres de plats introuvables dans dishes-ui.js")
    values = re.findall(r"'((?:\\.|[^'])*)'", match.group(1))
    tags: list[str] = []
    for value in values:
        value = value.replace("\\'", "'").replace("\\\\", "\\")
        if value in {"Tous", "Favoris"}:
            continue
        if value and value not in tags:
            tags.append(value)
    if not tags:
        raise RuntimeError("Aucune catégorie de plat trouvée dans dishes-ui.js")
    return tags


ALLOWED_TAGS = load_allowed_tags()


def fail(message: str) -> "NoReturn":
    RESULT_PATH.write_text(json.dumps({"ok": False, "error": message}, ensure_ascii=False, indent=2), encoding="utf-8")
    raise RuntimeError(message)


def normalize(value: str) -> str:
    value = str(value or "").lower().replace("œ", "oe")
    value = "".join(char for char in unicodedata.normalize("NFD", value) if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def slugify(value: str) -> str:
    return normalize(value).replace(" ", "-")


def js_quote(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def ensure_shell_assets(text: str, assets: list[str]) -> str:
    match = re.search(r"(const SHELL=\[)(.*?)(\];)", text, flags=re.S)
    if not match:
        fail("Précache SHELL introuvable dans sw.js")
    entries = re.findall(r"[\"'](\./[^\"']+)[\"']", match.group(2))
    replacements = {asset.split('?', 1)[0]: asset for asset in assets}
    result: list[str] = []
    seen_paths: set[str] = set()
    for entry in entries:
        path = entry.split('?', 1)[0]
        if path in seen_paths:
            continue
        result.append(replacements.get(path, entry))
        seen_paths.add(path)
    for path, asset in replacements.items():
        if path in seen_paths:
            continue
        result.append(asset)
        seen_paths.add(path)
    body = ','.join(json.dumps(asset, ensure_ascii=False) for asset in result)
    return text[:match.start()] + match.group(1) + body + match.group(3) + text[match.end():]


def api_json(url: str, payload: dict, api_key: str, timeout: int = 180) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", "replace")[:1200]
        raise RuntimeError(f"OpenAI HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"OpenAI inaccessible: {error.reason}") from error


def response_text(payload: dict) -> str:
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"]
    parts: list[str] = []
    for item in payload.get("output") or []:
        for content in item.get("content") or []:
            text = content.get("text")
            if isinstance(text, str):
                parts.append(text)
    return "\n".join(parts).strip()


def parse_json_object(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.I)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("réponse JSON introuvable")
    return json.loads(text[start : end + 1])


def load_catalog_names() -> list[str]:
    text = (ROOT / "catalog.js").read_text(encoding="utf-8")
    match = re.search(r"groups:\s*(\{.*?\}),\s*\n\s*favorites:", text, flags=re.S)
    if not match:
        fail("Structure groups de catalog.js introuvable")
    try:
        groups = json.loads(match.group(1))
    except json.JSONDecodeError as error:
        fail(f"catalog.js illisible: {error}")
    names: list[str] = []
    for subs in groups.values():
        for products in subs.values():
            names.extend(str(name) for name in products)
    return list(dict.fromkeys(names))


def existing_dish_names(text: str) -> list[str]:
    raw = re.findall(r"\{name:'((?:\\.|[^'])*)',photoId:", text)
    names = []
    for value in raw:
        value = value.replace("\\'", "'").replace("\\\\", "\\")
        names.append(value)
    return names


def infer_metadata(name: str, selected_category: str, catalog_names: list[str], api_key: str) -> dict:
    model = os.getenv("COURSES_TEXT_MODEL", "gpt-6-luna")
    category_rule = (
        f"La catégorie choisie par l'utilisateur est {selected_category!r}; elle doit obligatoirement apparaître dans tags."
        if selected_category
        else "Choisis les tags les plus pertinents."
    )
    prompt = f"""
Tu complètes le catalogue de plats d'une application de courses française.
Plat demandé: {name}
{category_rule}

Réponds UNIQUEMENT par un objet JSON avec exactement ces clés:
- "tags": tableau de 1 à 3 valeurs parmi {json.dumps(ALLOWED_TAGS, ensure_ascii=False)}
- "ingredients": tableau de 2 à 8 noms EXACTEMENT copiés depuis la liste de produits autorisés ci-dessous
- "description": une phrase courte décrivant visuellement le plat et ses ingrédients pour guider une photo culinaire réaliste

N'invente jamais un ingrédient absent de la liste. Choisis une recette simple et cohérente avec le nom du plat.
Produits autorisés:
{json.dumps(catalog_names, ensure_ascii=False)}
""".strip()
    payload = api_json(
        "https://api.openai.com/v1/responses",
        {"model": model, "input": prompt, "store": False},
        api_key,
    )
    try:
        metadata = parse_json_object(response_text(payload))
    except Exception as error:
        raise RuntimeError(f"Métadonnées de plat invalides: {error}") from error

    tags = metadata.get("tags")
    ingredients = metadata.get("ingredients")
    description = str(metadata.get("description") or "").strip()
    if not isinstance(tags, list) or not tags or any(tag not in ALLOWED_TAGS for tag in tags):
        raise RuntimeError("Tags générés invalides")
    tags = list(dict.fromkeys(str(tag) for tag in tags))[:3]
    if selected_category and selected_category not in tags:
        tags.insert(0, selected_category)
        tags = list(dict.fromkeys(tags))[:3]
    catalog_set = set(catalog_names)
    if not isinstance(ingredients, list) or not (2 <= len(ingredients) <= 8):
        raise RuntimeError("Liste d'ingrédients générée invalide")
    ingredients = list(dict.fromkeys(str(item) for item in ingredients))
    invalid = [item for item in ingredients if item not in catalog_set]
    if invalid:
        raise RuntimeError("Ingrédients hors catalog.js: " + ", ".join(invalid))
    if not description:
        description = f"{name} préparé avec " + ", ".join(ingredients)
    return {"tags": tags, "ingredients": ingredients, "description": description[:500]}


def image_prompt(name: str, metadata: dict, child: bool) -> str:
    ingredients = ", ".join(metadata["ingredients"])
    description = metadata["description"]
    if child:
        return (
            f"Photo culinaire réaliste et appétissante pour enfant de {name}, un seul plat servi dans une assiette blanche "
            "pour enfant avec bord bleu et petits motifs colorés discrets d'animaux et d'étoiles, sur une table en bois chaleureuse. "
            "Vue légèrement plongeante en trois-quarts haut, assiette entière ou quasi entière avec une marge naturelle de table autour. "
            f"Recette et présentation: {description}. Ingrédients visibles et cohérents: {ingredients}. "
            "Portion simple et rassurante, quelques accessoires enfant discrets seulement. Nourriture totalement réaliste, sans visage ni dessin animé. "
            "Lumière naturelle chaude et douce, textures réalistes, profondeur de champ légère. Aucun collage, aucune grille, aucun deuxième plat, "
            "aucun texte, logo, watermark, main ou personne, aucun gros flou artificiel, aucune bordure étirée."
        )
    return (
        f"Photo culinaire réaliste et appétissante de {name}, un seul plat dans une grande assiette ronde en céramique beige mouchetée "
        "à bord brun discret, posée sur une table en bois chaleureuse. Vue légèrement plongeante en trois-quarts haut, cadrage cohérent avec "
        "une série éditoriale de recettes: assiette entière ou quasi entière, marge naturelle de table visible autour, aucun bord important coupé. "
        f"Recette et présentation: {description}. Ingrédients visibles et cohérents: {ingredients}. "
        "Lumière naturelle chaude et douce, textures alimentaires réalistes, ingrédients nets et lisibles, couleurs gourmandes mais naturelles. "
        "Quelques ingrédients cohérents en arrière-plan légèrement flous. Aucun collage, aucune grille, aucun deuxième plat, aucun texte, logo, "
        "watermark, main ou personne, aucun gros flou artificiel dans les coins, aucune bordure étirée."
    )


def generate_image(name: str, metadata: dict, child: bool, api_key: str) -> bytes:
    model = os.getenv("COURSES_IMAGE_MODEL", "gpt-image-2")
    payload = api_json(
        "https://api.openai.com/v1/images/generations",
        {
            "model": model,
            "prompt": image_prompt(name, metadata, child),
            "size": "1536x1024",
            "quality": "high",
            "output_format": "png",
            "background": "opaque",
            "n": 1,
        },
        api_key,
        timeout=300,
    )
    encoded = ((payload.get("data") or [{}])[0] or {}).get("b64_json")
    if not encoded:
        raise RuntimeError("L'API image n'a retourné aucune image")
    try:
        return base64.b64decode(encoded, validate=True)
    except Exception as error:
        raise RuntimeError("Image OpenAI invalide") from error


def append_child_set(text: str, name: str) -> str:
    pattern = re.compile(r"(const CHILD_DISHES=new Set\(\[)(.*?)(\]\);)", re.S)
    match = pattern.search(text)
    if not match:
        fail("CHILD_DISHES introuvable")
    body = match.group(2)
    existing = [normalize(value.replace("\\'", "'")) for value in re.findall(r"'((?:\\.|[^'])*)'", body)]
    if normalize(name) in existing:
        return text
    quoted = js_quote(name)
    if "\n" in body:
        updated = body.rstrip() + ",\n  " + quoted + "\n"
    else:
        updated = body + ("," if body.strip() else "") + quoted
    return text[: match.start(2)] + updated + text[match.end(2) :]


def integrate_files(name: str, metadata: dict, child: bool, image: bytes) -> tuple[int, str]:
    catalog_path = ROOT / "catalog.js"
    dishes_path = ROOT / "dishes-ui.js"
    local_images_path = ROOT / "dish-local-images.js"
    sw_path = ROOT / "sw.js"
    index_path = ROOT / "index.html"
    catalog_text = catalog_path.read_text(encoding="utf-8")
    dishes_text = dishes_path.read_text(encoding="utf-8")
    local_text = local_images_path.read_text(encoding="utf-8")
    sw_text = sw_path.read_text(encoding="utf-8")
    index_text = index_path.read_text(encoding="utf-8")

    version_match = re.search(r"const APP_VERSION='v(\d+)'", local_text)
    if not version_match:
        fail("Version globale introuvable dans dish-local-images.js")
    new_version = int(version_match.group(1)) + 1

    entry = "  {name:" + js_quote(name) + ",photoId:'',tags:[" + ",".join(js_quote(tag) for tag in metadata["tags"]) + "],ingredients:[" + ",".join(js_quote(item) for item in metadata["ingredients"]) + "]},"
    marker = "\n]);\n\nconst FILTERS="
    position = dishes_text.find(marker)
    if position < 0:
        fail("Fin de DISHES introuvable dans dishes-ui.js")
    dishes_text = dishes_text[:position] + "\n" + entry + dishes_text[position:]
    if child:
        dishes_text = append_child_set(dishes_text, name)
        local_text = append_child_set(local_text, name)

    catalog_text = re.sub(r"(dishes-ui\.js\?v=)\d+", rf"\g<1>{new_version}", catalog_text, count=1)
    catalog_text = re.sub(r"(dish-local-images\.js\?v=)\d+", rf"\g<1>{new_version}", catalog_text, count=1)
    catalog_text = re.sub(r"(app-ui\.js\?v=)\d+", rf"\g<1>{new_version}", catalog_text, count=1)
    local_text = re.sub(r"const APP_VERSION='v\d+'", f"const APP_VERSION='v{new_version}'", local_text, count=1)
    sw_text, count = re.subn(r"const CACHE='courses-app-v\d+-r\d+'", f"const CACHE='courses-app-v{new_version}-r1'", sw_text, count=1)
    if count != 1:
        fail("Version de cache introuvable dans sw.js")
    sw_text = ensure_shell_assets(sw_text, [
        f"./catalog.js?v={new_version}",
        f"./dishes-ui.js?v={new_version}",
        f"./dish-local-images.js?v={new_version}",
        f"./app-ui.js?v={new_version}",
    ])
    index_text, count = re.subn(
        r'(<span class="page-version">)v\d+(</span>)',
        rf'\g<1>v{new_version}\g<2>',
        index_text,
    )
    if count != 3:
        fail("Badges de version visibles introuvables dans index.html")
    index_text = re.sub(r"(catalog\.js\?v=)\d+", rf"\g<1>{new_version}", index_text, count=1)

    filename = ("enfant-" if child else "") + slugify(name) + ".png"
    image_path = ROOT / "www" / "Plats" / filename
    if image_path.exists():
        fail(f"Le fichier image existe déjà: {filename}")
    image_path.parent.mkdir(parents=True, exist_ok=True)
    image_path.write_bytes(image)
    catalog_path.write_text(catalog_text, encoding="utf-8")
    dishes_path.write_text(dishes_text, encoding="utf-8")
    local_images_path.write_text(local_text, encoding="utf-8")
    sw_path.write_text(sw_text, encoding="utf-8")
    index_path.write_text(index_text, encoding="utf-8")
    return new_version, filename


def main() -> None:
    name = re.sub(r"\s+", " ", str(os.getenv("DISH_NAME") or "")).strip()
    selected_category = str(os.getenv("DISH_CATEGORY") or "").strip()
    api_key = str(os.getenv("OPENAI_API_KEY") or "").strip()
    if not name or len(name) > 80:
        fail("Nom de plat invalide")
    if selected_category not in ["", *ALLOWED_TAGS]:
        fail("Catégorie de plat invalide")

    dishes_text = (ROOT / "dishes-ui.js").read_text(encoding="utf-8")
    for existing in existing_dish_names(dishes_text):
        if normalize(existing) == normalize(name):
            local_text = (ROOT / "dish-local-images.js").read_text(encoding="utf-8")
            version = int(re.search(r"const APP_VERSION='v(\d+)'", local_text).group(1))
            child = existing in re.findall(r"'((?:\\.|[^'])*)'", re.search(r"const CHILD_DISHES=new Set\(\[(.*?)\]\);", dishes_text, re.S).group(1))
            filename = ("enfant-" if child else "") + SPECIAL_SLUGS.get(existing, slugify(existing)) + ".png"
            RESULT_PATH.write_text(json.dumps({
                "ok": True,
                "already_exists": True,
                "name": existing,
                "version": version,
                "filename": filename,
            }, ensure_ascii=False, indent=2), encoding="utf-8")
            return

    if not api_key:
        fail("Secret GitHub OPENAI_API_KEY manquant")
    catalog_names = load_catalog_names()
    metadata = infer_metadata(name, selected_category, catalog_names, api_key)
    child = "Enfants" in metadata["tags"]
    image = generate_image(name, metadata, child, api_key)
    version, filename = integrate_files(name, metadata, child, image)
    RESULT_PATH.write_text(json.dumps({
        "ok": True,
        "already_exists": False,
        "name": name,
        "version": version,
        "filename": filename,
        "tags": metadata["tags"],
        "ingredients": metadata["ingredients"],
    }, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        if not RESULT_PATH.exists():
            RESULT_PATH.write_text(json.dumps({"ok": False, "error": str(error)}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(str(error), file=sys.stderr)
        sys.exit(1)