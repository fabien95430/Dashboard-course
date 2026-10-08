#!/usr/bin/env python3
"""Generate and integrate one product with its individual WebP visual."""

from __future__ import annotations

import base64
import json
import os
import re
import sys

import integrate_dish as base

ROOT = base.ROOT
RESULT_PATH = base.RESULT_PATH
PRODUCT_PREFIX = "__courses_product__:"


def require_push() -> None:
    required=("PUSH_ENDPOINT","PUSH_P256DH","PUSH_AUTH","PUSH_PUBLIC_KEY")
    if any(not str(os.getenv(key) or "").strip() for key in required):
        base.fail("Souscription Web Push manquante pour confirmer la fin de l’intégration")


def load_groups() -> tuple[str, re.Match[str], dict[str, dict[str, list[str]]]]:
    text=(ROOT / "catalog.js").read_text(encoding="utf-8")
    match=re.search(r"groups:\s*(\{.*?\}),\s*\n\s*meta:",text,flags=re.S)
    if not match:
        base.fail("Structure groups de catalog.js introuvable")
    try:
        groups=json.loads(match.group(1))
    except json.JSONDecodeError as error:
        base.fail(f"catalog.js illisible: {error}")
    if not isinstance(groups,dict) or not groups:
        base.fail("Catalogue produits vide")
    return text,match,groups


def find_product(groups: dict[str, dict[str, list[str]]], name: str):
    wanted=base.normalize(name)
    for category,subgroups in groups.items():
        for subgroup,names in subgroups.items():
            for existing in names:
                if base.normalize(existing)==wanted:
                    return str(existing),category,subgroup
    return None


def validate_location_result(result: dict, source: dict, name: str) -> tuple[str,str,bool]:
    category=str(result.get("category") or "").strip()
    subgroup=re.sub(r"\s+"," ",str(result.get("subgroup") or "")).strip()
    create_value=result.get("create_subgroup")
    if not isinstance(create_value,bool):
        raise RuntimeError("Le classement produit doit préciser create_subgroup avec un booléen")
    if category not in source:
        raise RuntimeError("Catégorie produit générée invalide")
    if not subgroup:
        raise RuntimeError("Sous-catégorie produit vide")

    for existing in source[category]:
        if base.normalize(existing)==base.normalize(subgroup):
            return category,str(existing),False

    if not create_value:
        raise RuntimeError("Sous-catégorie produit générée inexistante")
    if len(subgroup)>40 or len(subgroup.split())>5:
        raise RuntimeError("Nouvelle sous-catégorie produit invalide")
    if any(ord(character)<32 for character in subgroup):
        raise RuntimeError("Nouvelle sous-catégorie produit invalide")
    if base.normalize(subgroup)==base.normalize(name):
        raise RuntimeError("La nouvelle sous-catégorie doit être générique et réutilisable")
    return category,subgroup,True


def infer_location(name: str, selected_category: str, groups: dict, api_key: str) -> tuple[str,str,bool]:
    if selected_category and selected_category not in groups:
        base.fail("Catégorie produit invalide")
    source={selected_category:groups[selected_category]} if selected_category else groups
    candidates={
        category:{subgroup:list(names) for subgroup,names in subgroups.items()}
        for category,subgroups in source.items()
    }
    model=os.getenv("COURSES_TEXT_MODEL","gpt-6-luna")
    category_rule=(
        f"La catégorie imposée est {selected_category!r}; retourne exactement cette catégorie."
        if selected_category else
        "Choisis la catégorie principale la plus cohérente parmi celles fournies."
    )
    prompt=f"""
Tu classes un nouveau produit dans le catalogue d'une application de courses française.
Produit demandé: {name}
{category_rule}

Réponds UNIQUEMENT par un objet JSON avec exactement trois clés:
"category", "subgroup" et "create_subgroup".
"create_subgroup" doit être un booléen JSON.

Règles de classement:
- Analyse toutes les sous-catégories et tous les produits existants fournis ci-dessous.
- Privilégie toujours une sous-catégorie existante lorsque le produit y est naturellement à sa place.
- Si tu choisis une sous-catégorie existante, recopie son nom EXACTEMENT et mets "create_subgroup": false.
- Uniquement si aucune sous-catégorie existante n'est réellement cohérente, mets "create_subgroup": true et propose dans "subgroup" un nom français court, générique et réutilisable pour plusieurs produits.
- Une nouvelle sous-catégorie ne doit jamais être simplement le nom du produit demandé.
- La catégorie principale doit toujours être recopiée EXACTEMENT depuis le catalogue fourni; n'invente jamais de nouvelle catégorie principale.

Catalogue disponible:
{json.dumps(candidates,ensure_ascii=False)}
""".strip()
    payload=base.api_json(
        "https://api.openai.com/v1/responses",
        {"model":model,"input":prompt,"store":False},
        api_key,
    )
    try:
        result=base.parse_json_object(base.response_text(payload))
        return validate_location_result(result,source,name)
    except Exception as error:
        raise RuntimeError(f"Classement produit invalide: {error}") from error


def image_prompt(name: str, category: str, subgroup: str) -> str:
    return (
        f"Vignette produit pour une application de courses: {name}. Catégorie {category}, sous-groupe {subgroup}. "
        "Reprendre le langage visuel des produits déjà présents dans le catalogue: illustration 3D semi-réaliste de catalogue mobile, "
        "objet détouré propre, volumes simples, textures nettes, lumière studio douce et ombre très légère. "
        "Représenter un seul type de produit, isolé et immédiatement reconnaissable, sur fond totalement transparent. "
        "Le produit principal doit occuper environ 65 à 75 % du carré, être centré, avec une marge transparente régulière et aucun bord important coupé. "
        "Privilégier le produit lui-même plutôt que son emballage de vente. Si l'objet est reconnaissable sans emballage "
        "(par exemple pile, thermomètre, éponge, rasoir, fruit ou légume), le montrer hors boîte, hors blister, hors sachet et sans étiquette. "
        "N'utiliser un emballage générique que lorsqu'il est réellement indispensable pour identifier le produit; dans ce cas il doit rester simple, "
        "sans marque, sans logo et sans texte lisible. Éviter les grands blocs rectangulaires ou les packagings qui dominent la vignette. "
        "Aucun décor, table, rayon, main, personne, collage, grille ou deuxième type de produit. Aucun texte ajouté autour du produit. "
        "Le produit doit rester parfaitement lisible à petite taille et visuellement cohérent avec les autres icônes du catalogue."
    )


def generate_image(name: str, category: str, subgroup: str, api_key: str) -> bytes:
    model=os.getenv("COURSES_IMAGE_MODEL","gpt-image-2.5-flare")
    payload=base.api_json(
        "https://api.openai.com/v1/images/generations",
        {
            "model":model,
            "prompt":image_prompt(name,category,subgroup),
            "size":"1024x1024",
            "quality":"high",
            "output_format":"webp",
            "background":"transparent",
            "n":1,
        },
        api_key,
        timeout=300,
    )
    encoded=((payload.get("data") or [{}])[0] or {}).get("b64_json")
    if not encoded:
        raise RuntimeError("L'API image n'a retourné aucune image")
    try:
        image=base64.b64decode(encoded,validate=True)
    except Exception as error:
        raise RuntimeError("Image OpenAI invalide") from error
    if len(image)<12 or image[:4]!=b"RIFF" or image[8:12]!=b"WEBP":
        raise RuntimeError("Le visuel produit généré n'est pas un WebP valide")
    return image


def current_version() -> int:
    text=(ROOT / "dish-local-images.js").read_text(encoding="utf-8")
    match=re.search(r"const APP_VERSION='v(\d+)'",text)
    if not match:
        base.fail("Version globale introuvable dans dish-local-images.js")
    return int(match.group(1))


def integrate_files(name: str, category: str, subgroup: str, image: bytes, catalog_text: str, groups_match: re.Match[str], groups: dict, already_in_catalog: bool, create_subgroup: bool=False) -> tuple[int,str]:
    local_path=ROOT / "dish-local-images.js"
    sw_path=ROOT / "sw.js"
    local_text=local_path.read_text(encoding="utf-8")
    sw_text=sw_path.read_text(encoding="utf-8")
    new_version=current_version()+1

    if not already_in_catalog:
        if create_subgroup:
            if subgroup in groups[category]:
                base.fail("La sous-catégorie produit existe déjà")
            groups[category][subgroup]=[]
        elif subgroup not in groups[category]:
            base.fail("Sous-catégorie produit introuvable")
        groups[category][subgroup].append(name)
        encoded_groups=json.dumps(groups,ensure_ascii=False,separators=(",",":"))
        catalog_text=catalog_text[:groups_match.start(1)]+encoded_groups+catalog_text[groups_match.end(1):]
        (ROOT / "catalog.js").write_text(catalog_text,encoding="utf-8")

    local_text,count=re.subn(r"const APP_VERSION='v\d+'",f"const APP_VERSION='v{new_version}'",local_text,count=1)
    if count!=1:
        base.fail("Version globale introuvable dans dish-local-images.js")
    sw_text,count=re.subn(r"const CACHE='courses-app-v\d+-r\d+'",f"const CACHE='courses-app-v{new_version}-r1'",sw_text,count=1)
    if count!=1:
        base.fail("Version de cache introuvable dans sw.js")

    filename=base.slugify(name)+".webp"
    image_path=ROOT / "www" / "Items" / filename
    image_path.parent.mkdir(parents=True,exist_ok=True)
    image_path.write_bytes(image)
    local_path.write_text(local_text,encoding="utf-8")
    sw_path.write_text(sw_text,encoding="utf-8")
    return new_version,filename


def main() -> None:
    raw_name=re.sub(r"\s+"," ",str(os.getenv("DISH_NAME") or "")).strip()
    selected_category=str(os.getenv("DISH_CATEGORY") or "").strip()
    api_key=str(os.getenv("OPENAI_API_KEY") or "").strip()
    if not raw_name.startswith(PRODUCT_PREFIX):
        base.fail("Préfixe produit manquant")
    name=raw_name[len(PRODUCT_PREFIX):].strip()
    if not name or len(name)>80:
        base.fail("Nom de produit invalide")
    require_push()

    catalog_text,groups_match,groups=load_groups()
    existing=find_product(groups,name)
    create_subgroup=False
    if existing:
        existing_name,category,subgroup=existing
        filename=base.slugify(existing_name)+".webp"
        image_path=ROOT / "www" / "Items" / filename
        if image_path.is_file():
            RESULT_PATH.write_text(json.dumps({
                "ok":True,"already_exists":True,"name":existing_name,
                "version":current_version(),"filename":filename,
            },ensure_ascii=False,indent=2),encoding="utf-8")
            return
        name=existing_name
        already_in_catalog=True
    else:
        if not api_key:
            base.fail("Secret GitHub OPENAI_API_KEY manquant")
        category,subgroup,create_subgroup=infer_location(name,selected_category,groups,api_key)
        already_in_catalog=False

    if not api_key:
        base.fail("Secret GitHub OPENAI_API_KEY manquant")
    image=generate_image(name,category,subgroup,api_key)
    version,filename=integrate_files(
        name,category,subgroup,image,catalog_text,groups_match,groups,already_in_catalog,create_subgroup
    )
    RESULT_PATH.write_text(json.dumps({
        "ok":True,"already_exists":False,"name":name,"version":version,
        "filename":filename,"category":category,"subgroup":subgroup,
        "created_subgroup":create_subgroup,
    },ensure_ascii=False,indent=2),encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        if not RESULT_PATH.exists():
            RESULT_PATH.write_text(json.dumps({"ok":False,"error":str(error)},ensure_ascii=False,indent=2),encoding="utf-8")
        print(str(error),file=sys.stderr)
        sys.exit(1)
