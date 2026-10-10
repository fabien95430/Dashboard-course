#!/usr/bin/env python3
"""Generate and integrate one product with its individual WebP visual."""

from __future__ import annotations

import base64
import json
import os
import re
import sys
from urllib.parse import unquote

import integrate_dish as base

ROOT = base.ROOT
RESULT_PATH = base.RESULT_PATH
PRODUCT_PREFIX = "__courses_product__:"
IMAGE_HINT_MARKER = "||__courses_image_hint__:"
IMAGE_HINT_MAX = 140
PRODUCT_IMAGE_SIZE = "816x816"
DISPLAY_MODES=(
    "Bouteille","Pot","Poids","Barquette","Sachet","Pièce","Paquet","Boîte","Flacon",
    "Plaquette","Brique","Sac","Tablette","Tube","Rouleau","Paire","Stick","Botte","Unité",
)
HINT_DISPLAY_MODES=(
    ("bouteille","Bouteille"),("pot","Pot"),("barquette","Barquette"),("sachet","Sachet"),
    ("paquet","Paquet"),("boite","Boîte"),("flacon","Flacon"),("brique","Brique"),
    ("tube","Tube"),("rouleau","Rouleau"),("tablette","Tablette"),("plaquette","Plaquette"),
    ("stick","Stick"),("paire","Paire"),("botte","Botte"),("sac","Sac"),
)


def require_push() -> None:
    required=("PUSH_ENDPOINT","PUSH_P256DH","PUSH_AUTH","PUSH_PUBLIC_KEY")
    if any(not str(os.getenv(key) or "").strip() for key in required):
        base.fail("Souscription Web Push manquante pour confirmer la fin de l’intégration")


def load_groups() -> tuple[str, re.Match[str], dict[str, dict[str, list[str]]]]:
    text=(ROOT / "catalog.js").read_text(encoding="utf-8")
    match=re.search(r"groups:\s*(\{.*?\}),\s*\n\s*favorites:",text,flags=re.S)
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


def parse_product_category(value: str) -> tuple[str,str]:
    raw=str(value or "").strip()
    if IMAGE_HINT_MARKER not in raw:
        return raw,""
    category,encoded_hint=raw.split(IMAGE_HINT_MARKER,1)
    try:
        hint=unquote(encoded_hint)
    except Exception:
        hint=encoded_hint
    hint=re.sub(r"\s+"," ",hint).strip()
    hint="".join(character for character in hint if ord(character)>=32)[:IMAGE_HINT_MAX]
    return category.strip(),hint


def display_mode_from_hint(value: str) -> str:
    normalized=base.normalize(value)
    for token,mode in HINT_DISPLAY_MODES:
        if re.search(rf"\b{re.escape(token)}\b",normalized):
            return mode
    return ""


def validate_location_result(result: dict, source: dict, name: str) -> tuple[str,str,bool,str]:
    category=str(result.get("category") or "").strip()
    subgroup=re.sub(r"\s+"," ",str(result.get("subgroup") or "")).strip()
    create_value=result.get("create_subgroup")
    display_mode=str(result.get("display_mode") or "").strip()
    if not isinstance(create_value,bool):
        raise RuntimeError("Le classement produit doit préciser create_subgroup avec un booléen")
    if display_mode not in DISPLAY_MODES:
        raise RuntimeError("Conditionnement produit généré invalide")
    if category not in source:
        raise RuntimeError("Catégorie produit générée invalide")
    if not subgroup:
        raise RuntimeError("Sous-catégorie produit vide")

    for existing in source[category]:
        if base.normalize(existing)==base.normalize(subgroup):
            return category,str(existing),False,display_mode

    if not create_value:
        raise RuntimeError("Sous-catégorie produit générée inexistante")
    if len(subgroup)>40 or len(subgroup.split())>5:
        raise RuntimeError("Nouvelle sous-catégorie produit invalide")
    if any(ord(character)<32 for character in subgroup):
        raise RuntimeError("Nouvelle sous-catégorie produit invalide")
    if base.normalize(subgroup)==base.normalize(name):
        raise RuntimeError("La nouvelle sous-catégorie doit être générique et réutilisable")
    return category,subgroup,True,display_mode


def infer_location(name: str, selected_category: str, groups: dict, image_hint: str, api_key: str) -> tuple[str,str,bool,str]:
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
    hint_rule=(
        f"Précision utilisateur sur le visuel/contenant: {image_hint!r}. Si elle indique clairement un contenant (par exemple pot, bouteille, boîte, sachet), utilise ce même type pour display_mode."
        if image_hint else
        "Aucune précision de contenant n'a été fournie; déduis le conditionnement d'achat le plus naturel pour ce produit."
    )
    prompt=f"""
Tu classes un nouveau produit dans le catalogue d'une application de courses française.
Produit demandé: {name}
{category_rule}
{hint_rule}

Réponds UNIQUEMENT par un objet JSON avec exactement quatre clés:
"category", "subgroup", "create_subgroup" et "display_mode".
"create_subgroup" doit être un booléen JSON.
"display_mode" doit être exactement l'une des valeurs suivantes: {json.dumps(DISPLAY_MODES,ensure_ascii=False)}.

Règles de classement:
- Analyse toutes les sous-catégories et tous les produits existants fournis ci-dessous.
- Privilégie toujours une sous-catégorie existante lorsque le produit y est naturellement à sa place.
- Si tu choisis une sous-catégorie existante, recopie son nom EXACTEMENT et mets "create_subgroup": false.
- Uniquement si aucune sous-catégorie existante n'est réellement cohérente, mets "create_subgroup": true et propose dans "subgroup" un nom français court, générique et réutilisable pour plusieurs produits.
- Une nouvelle sous-catégorie ne doit jamais être simplement le nom du produit demandé.
- La catégorie principale doit toujours être recopiée EXACTEMENT depuis le catalogue fourni; n'invente jamais de nouvelle catégorie principale.
- "display_mode" représente le conditionnement visible dans l'application (Pot, Bouteille, Paquet, Sachet, etc.), jamais une unité de recette.
- Une précision utilisateur de contenant est prioritaire pour "display_mode" lorsqu'elle est explicite.

Catalogue disponible:
{json.dumps(candidates,ensure_ascii=False)}
""".strip()
    payload=base.api_json(
        "https://api.openai.com/v1/responses",
        {"model":model,"input":prompt,"store":False},
        api_key,
    )

    def decode_result(response: dict) -> dict:
        result=base.parse_json_object(base.response_text(response))
        explicit_mode=display_mode_from_hint(image_hint)
        if explicit_mode:
            result["display_mode"]=explicit_mode
        return result

    try:
        return validate_location_result(decode_result(payload),source,name)
    except Exception as first_error:
        allowed_subgroups={category:list(subgroups) for category,subgroups in source.items()}
        retry_prompt=f"""
Le premier classement du produit {name!r} est invalide: {first_error}.
Corrige uniquement le classement, sans inventer de nouvelle sous-catégorie.
{category_rule}
{hint_rule}

Réponds UNIQUEMENT par un objet JSON avec exactement quatre clés:
"category", "subgroup", "create_subgroup" et "display_mode".
- "subgroup" doit recopier EXACTEMENT l'une des sous-catégories existantes autorisées ci-dessous.
- "create_subgroup" doit être false.
- "category" doit recopier EXACTEMENT la catégorie correspondante.
- "display_mode" doit être exactement l'une des valeurs suivantes: {json.dumps(DISPLAY_MODES,ensure_ascii=False)}.

Sous-catégories existantes autorisées:
{json.dumps(allowed_subgroups,ensure_ascii=False)}

Catalogue avec exemples:
{json.dumps(candidates,ensure_ascii=False)}
""".strip()
        retry_payload=base.api_json(
            "https://api.openai.com/v1/responses",
            {"model":model,"input":retry_prompt,"store":False},
            api_key,
        )
        try:
            retry_result=decode_result(retry_payload)
            retry_result["create_subgroup"]=False
            return validate_location_result(retry_result,source,name)
        except Exception as retry_error:
            raise RuntimeError(f"Classement produit invalide après nouvelle tentative: {retry_error}") from retry_error


def image_prompt(name: str, category: str, subgroup: str, image_hint: str="") -> str:
    hint=(
        f"Précision visuelle prioritaire fournie par l’utilisateur: {image_hint}. "
        "Respecter précisément cette forme, ce contenant ou cet emballage; cette précision ne modifie jamais le nom du produit. "
        if image_hint else ""
    )
    return (
        f"Vignette produit pour une application de courses: {name}. Catégorie {category}, sous-groupe {subgroup}. "
        +hint+
        "Reprendre fidèlement le langage visuel des produits déjà présents dans le catalogue: rendu 3D semi-réaliste, propre, simple, premium et cohérent avec les autres items existants. "
        "L'image est destinée à une petite vignette mobile avec une cible d'affichage finale de 192×192 px. Elle doit donc rester immédiatement identifiable à cette taille. "
        "Utiliser des formes lisibles, des volumes simples, des contours nets, des textures sobres et uniquement les détails indispensables à l'identification du produit. "
        "Représenter exactement un seul type de produit, isolé sur fond totalement transparent, centré, avec des proportions naturelles et une marge transparente régulière. "
        "Le produit principal doit occuper environ 86 à 92 % de sa plus grande dimension dans le carré et aucun bord important ne doit être coupé. "
        "Éviter les micro-détails, textures photographiques complexes, reflets multiples, bruit visuel, grain, motifs fins, petits accessoires secondaires et détails invisibles à petite taille. "
        "En l’absence de précision visuelle utilisateur, privilégier le produit lui-même plutôt que son emballage de vente. Si l'objet est reconnaissable sans emballage "
        "(par exemple pile, thermomètre, éponge, rasoir, fruit ou légume), le montrer hors boîte, hors blister, hors sachet et sans étiquette. "
        "N'utiliser un emballage générique que lorsqu'il est réellement indispensable pour identifier le produit, ou lorsqu’une précision visuelle utilisateur le demande; dans ce cas il doit rester simple, "
        "sans marque, sans logo, sans texte lisible, visuellement léger et non dominant. Éviter les grands blocs rectangulaires ou les packagings massifs. "
        "Aucun décor, table, rayon, main, personne, collage, grille ou deuxième type de produit. Aucun texte ajouté autour du produit. "
        "Le rendu final doit être clair, compact, harmonisé avec les autres icônes du catalogue et parfaitement lisible en petite vignette mobile."
    )


def generate_image(name: str, category: str, subgroup: str, image_hint: str, api_key: str) -> bytes:
    model=os.getenv("COURSES_IMAGE_MODEL","gpt-image-2.5-flare")
    payload=base.api_json(
        "https://api.openai.com/v1/images/generations",
        {
            "model":model,
            "prompt":image_prompt(name,category,subgroup,image_hint),
            "size":PRODUCT_IMAGE_SIZE,
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


def update_display_mode(name: str, display_mode: str) -> None:
    path=ROOT / "catalog-quantities.js"
    text=path.read_text(encoding="utf-8")
    match=re.search(r"(const DISPLAY_MODE_BY_PRODUCT=Object\.freeze\(\{)(.*?)(\n\}\);)",text,flags=re.S)
    if not match:
        base.fail("Table des conditionnements introuvable dans catalog-quantities.js")
    body=match.group(2)
    quoted=json.dumps(name,ensure_ascii=False)
    if re.search(rf"(?:^|[,\n]\s*){re.escape(quoted)}\s*:",body):
        return
    entry=f"  {quoted}:{json.dumps(display_mode,ensure_ascii=False)}"
    suffix="," if body.rstrip() and not body.rstrip().endswith(",") else ""
    replacement=match.group(1)+body.rstrip()+suffix+"\n"+entry+match.group(3)
    path.write_text(text[:match.start()]+replacement+text[match.end():],encoding="utf-8")


def ensure_shell_assets(text: str, assets: list[str]) -> str:
    return base.ensure_shell_assets(text,assets)


def integrate_files(name: str, category: str, subgroup: str, display_mode: str, image: bytes, catalog_text: str, groups_match: re.Match[str], groups: dict, already_in_catalog: bool, create_subgroup: bool=False) -> tuple[int,str]:
    local_path=ROOT / "dish-local-images.js"
    sw_path=ROOT / "sw.js"
    index_path=ROOT / "index.html"
    local_text=local_path.read_text(encoding="utf-8")
    sw_text=sw_path.read_text(encoding="utf-8")
    index_text=index_path.read_text(encoding="utf-8")
    new_version=current_version()+1

    if not already_in_catalog:
        if create_subgroup:
            if subgroup in groups[category]:
                base.fail("La sous-catégorie produit existe déjà")
            groups[category][subgroup]=[]
        elif subgroup not in groups[category]:
            base.fail("Sous-catégorie produit introuvable")
        groups[category][subgroup].append(name)
        groups[category][subgroup].sort(key=base.normalize)
        update_display_mode(name,display_mode)
        encoded_groups=json.dumps(groups,ensure_ascii=False,separators=(",",":"))
        catalog_text=catalog_text[:groups_match.start(1)]+encoded_groups+catalog_text[groups_match.end(1):]

    catalog_text=re.sub(r"(catalog-quantities\.js\?v=)\d+",rf"\g<1>{new_version}",catalog_text,count=1)
    catalog_text=re.sub(r"(dish-local-images\.js\?v=)\d+",rf"\g<1>{new_version}",catalog_text,count=1)
    catalog_text=re.sub(r"(app-ui\.js\?v=)\d+",rf"\g<1>{new_version}",catalog_text,count=1)
    (ROOT / "catalog.js").write_text(catalog_text,encoding="utf-8")

    local_text,count=re.subn(r"const APP_VERSION='v\d+'",f"const APP_VERSION='v{new_version}'",local_text,count=1)
    if count!=1:
        base.fail("Version globale introuvable dans dish-local-images.js")
    sw_text,count=re.subn(r"const CACHE='courses-app-v\d+-r\d+'",f"const CACHE='courses-app-v{new_version}-r1'",sw_text,count=1)
    if count!=1:
        base.fail("Version de cache introuvable dans sw.js")
    sw_text=ensure_shell_assets(sw_text,[
        f"./catalog.js?v={new_version}",
        f"./catalog-quantities.js?v={new_version}",
        f"./dish-local-images.js?v={new_version}",
        f"./app-ui.js?v={new_version}",
    ])
    index_text,count=re.subn(r'(<span class="page-version">)v\d+(</span>)',rf'\g<1>v{new_version}\g<2>',index_text)
    if count!=3:
        base.fail("Badges de version visibles introuvables dans index.html")
    index_text=re.sub(r'(catalog\.js\?v=)\d+',rf'\g<1>{new_version}',index_text,count=1)

    filename=base.slugify(name)+".webp"
    image_path=ROOT / "www" / "Items" / filename
    image_path.parent.mkdir(parents=True,exist_ok=True)
    image_path.write_bytes(image)
    local_path.write_text(local_text,encoding="utf-8")
    sw_path.write_text(sw_text,encoding="utf-8")
    index_path.write_text(index_text,encoding="utf-8")
    return new_version,filename


def main() -> None:
    raw_name=re.sub(r"\s+"," ",str(os.getenv("DISH_NAME") or "")).strip()
    selected_category,image_hint=parse_product_category(str(os.getenv("DISH_CATEGORY") or ""))
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
    display_mode=""
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
        category,subgroup,create_subgroup,display_mode=infer_location(name,selected_category,groups,image_hint,api_key)
        already_in_catalog=False

    if not api_key:
        base.fail("Secret GitHub OPENAI_API_KEY manquant")
    image=generate_image(name,category,subgroup,image_hint,api_key)
    version,filename=integrate_files(
        name,category,subgroup,display_mode,image,catalog_text,groups_match,groups,already_in_catalog,create_subgroup
    )
    RESULT_PATH.write_text(json.dumps({
        "ok":True,"already_exists":False,"name":name,"version":version,
        "filename":filename,"category":category,"subgroup":subgroup,
        "created_subgroup":create_subgroup,"display_mode":display_mode,
    },ensure_ascii=False,indent=2),encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        if not RESULT_PATH.exists():
            RESULT_PATH.write_text(json.dumps({"ok":False,"error":str(error)},ensure_ascii=False,indent=2),encoding="utf-8")
        print(str(error),file=sys.stderr)
        sys.exit(1)