#!/usr/bin/env python3
"""Generate and integrate one product with its individual WebP visual."""

from __future__ import annotations

import base64
import json
import os
import ctypes
import ctypes.util
import math
import re
import sys
from urllib.parse import unquote

import integrate_dish as base
import update_visual_hashes

ROOT = base.ROOT
RESULT_PATH = base.RESULT_PATH
PRODUCT_PREFIX = "__courses_product__:"
IMAGE_HINT_MARKER = "||__courses_image_hint__:"
IMAGE_HINT_MAX = 140
PRODUCT_IMAGE_SIZE = "816x816"
# Compression WebP explicite pour la vignette mobile (pas une garantie de taille en octets).
PRODUCT_IMAGE_COMPRESSION = 75
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



# Une règle par famille visuelle et par sous-catégorie de catalog.js.
# Les modèles d'images cités restent des références pour l'agent : l'API images/generations
# ne reçoit pas les pixels des fichiers www/Items/ en entrée.
SUBGROUP_VISUAL_GUIDANCE = {
    "Boissons / Bières & vins": "Sous-groupe mixte : distinguer bouteilles de bière, vins, effervescents et spiritueux. Garder le conditionnement validé du produit précis ; ne jamais appliquer un modèle de bière à un vin ou à un alcool fort.",
    "Boissons / Eaux & jus": "Distinguer bouteilles d'eau, jus et lait chocolaté. Chaque famille garde sa silhouette canonique ; les fruits des jus sont uniquement imprimés sur les étiquettes.",
    "Boissons / Sodas & sirops": "Respecter la bouteille ou le flacon propre à chaque boisson : Coca/Coca zéro, citronnade, limonade, ginger beer, tonic et sirops sont des familles distinctes.",
    "Enfant / Enfant": "Sous-groupe hétérogène : céréales infantiles en boîte crème/bleu, goûters bébé en sachets fermés crème/bleu, lait infantile en boîte cylindrique, compotes en gourde, petits pots en verre, couches et lingettes selon leurs références. Aucun âge, marque ou allégation inventé.",
    "Épicerie / Boulangerie": "Pains, biscottes et viennoiseries dans leur forme naturelle validée, sans emballage, planche ni assiette ajoutés ; distinguer pita, naan, bagels, pain de mie et croissants par leur texture et leur forme.",
    "Épicerie / Pâtes à tarte": "Pâte crue roulée, avec papier cuisson et emballage transparent fermé, mêmes proportions que la référence Pâte brisée ; jamais fond de tarte cuit, moule, quiche ni halo plastique.",
    "Épicerie / Conserves": "Conserves de légumes en métal argenté fermé avec étiquette crème et bandeau sauge, dessin de l'ingrédient imprimé. Le concentré a une boîte plus petite ; ne pas forcer les exceptions comme Coulis de tomate en boîte.",
    "Épicerie / Monde & pratique": "Sous-groupe mixte : cubes en boîte, nouilles et céréales en paquet, lait de coco en boîte métal fermée, épices en bocal, soupes en brique et tortillas nature. Ne pas imposer un seul contenant.",
    "Épicerie / Pâtes, riz & céréales": "Pâtes sèches en paquets beige à grande fenêtre sans nom ; riz en paquets bleus à grande fenêtre et petite zone beige basse ; semoule/boulgour en kraft et polenta/quinoa en crème/ocre. Contenu exact visible, sans bol.",
    "Épicerie / Pâtisserie & cuisine": "Poudres dans sachets kraft/crème fermés, sucres dans bocaux à couvercle bois, gélatine en boîte, pâte feuilletée crue pliée et amandes nature. Ne pas représenter les poudres dans un bol.",
    "Épicerie / Sauces & condiments": "Les sauces en bocal Mayonnaise, les huiles en flacons à anse et bouchon vert, les vinaigres en bouteilles élancées, Cornichon en bocal vert spécifique. Ne jamais uniformiser ces familles.",
    "Épicerie / Confitures": "Même bocal à facettes, couvercle vichy rouge/blanc et étiquette ronde que Confiture fraise ; seuls le fruit, la couleur de confiture et l'intitulé générique autorisé changent.",
    "Épicerie / Sauces sucrées": "Coulis de fruit en bocal de préparation type Mayonnaise, sans bol, assiette, fruit physique ou bouteille inventée.",
    "Frais / Fromages": "Présentations naturelles cohérentes avec les fromages validés : croûtes et trous préservés, râpés en petits amas, mozzarella en billes en boules. Aucun plateau, condiment ou garniture.",
    "Frais / Laits & crèmes": "Laits en bouteilles de famille ; crème liquide en brique ; crèmes épaisse/fraîche en pots de crème ; Mascarpone en pot laitier bas fermé. Ne pas appliquer les bocaux de sauces.",
    "Frais / Surgelés": "Légumes et frites en sachets bleus à flocon opaque selon Haricots verts surgelés. Glaces en pots et Nuii en bâtonnet restent des familles distinctes ; ne pas les transformer en sachets.",
    "Frais / Traiteur frais": "Familles distinctes : Gnocchis en paquet de pâtes beige à fenêtre, pâte à pizza roulée, pâtes fraîches en nid naturel, quiche entière sans assiette, tofu en barquette fermée.",
    "Frais / Yaourts & desserts": "Deux familles de yaourts séparées : nature/grecs/skyr en pot crème/bleu rond, yaourt/fruits/vanille et crèmes dessert en petit pot à opercule souple carré. Crème anglaise en brique, riz au lait en verre fermé, yaourt à boire en bouteille.",
    "Fruits & Légumes / Fruits classiques": "Fruits frais entiers ou avec une coupe naturelle conforme à leur référence ; couleurs réelles, aucune étiquette, corbeille, assiette, sachet ou décoration ajoutés.",
    "Fruits & Légumes / Fruits rouges & exotiques": "Petits fruits et fruits exotiques dans leur forme naturelle, sans emballage, bol ou garniture ; distinguer fruits frais et fruits secs ensachés du Petit-déjeuner.",
    "Fruits & Légumes / Légumes du quotidien": "Légumes frais crus, produits entiers et bien cadrés ; une tomate cerise ne ressemble pas à une grosse tomate. Ne pas inventer de cuisson ni plateau.",
    "Fruits & Légumes / Légumes variés": "Représentations naturelles et différentes des choux, courges, fenouil, asperges et autres légumes ; garder l'objet entier, sans réduction excessive ni emballage.",
    "Fruits & Légumes / Salades & herbes": "Feuilles, salades et bouquets d'herbes naturels, lisibles à petite taille ; aucune boîte, pot, sachet ou assiette ajoutés.",
    "Fruits & Légumes / Pommes de terre & aromates": "Ail, oignons, pommes de terre, noix nature et aromates dans leurs formes naturelles ; ne pas leur appliquer les sachets kraft des fruits secs emballés.",
    "Hygiène & soins / Hygiène": "Conserver la forme exacte de l'article d'hygiène : tube, flacon, disques coton, brosses, brossettes en blister ou fil dentaire en boîte ; pas de bouteille générique commune.",
    "Hygiène & soins / Salle de bain & soins": "Représenter pots, tubes, protections, thermomètres et flacons selon leur conditionnement réel validé ; aucune marque, chiffre ni allégation de soin inventés.",
    "Maison / Entretien": "Pulvérisateurs harmonisés pour les nettoyants à gâchette ; Javel, flacons WC, poudres et autres liquides gardent leurs formes propres. Ne pas transformer un bidon en spray.",
    "Maison / Équipement": "Piles et batteries de formats réellement reconnaissables, hors emballage sauf exception validée ; cadrage cohérent entre petites piles et lots.",
    "Maison / Lessive": "Lessive liquide/poudre/capsules, adoucissant, détachant et accessoires gardent chacun leur emballage validé ; spray seulement pour produits à gâchette.",
    "Maison / Papier & sacs": "Rouleaux, paquets, mouchoirs, sacs zip et poubelle gardent leurs silhouettes propres ; aucun sac rempli de déchets, aucun bord coupé.",
    "Maison / Vaisselle": "Liquides en flacons de famille, produits lave-vaisselle en emballages validés, éponges/grattoirs/torchons naturels ; ne pas imposer la bouteille d'un liquide à un accessoire.",
    "Maison / Entretien auto": "Bidon de lave-glace automobile adapté au produit ; pas de pulvérisateur ménager inventé.",
    "Petit-déj & snacks / Apéritif": "Fruits secs en sachets kraft Dattes v778 ; snacks et biscuits gardent leurs propres présentations ; Houmous et Tapenade en bocal de sauce Mayonnaise.",
    "Petit-déj & snacks / Biscuits & goûters": "Biscuits, tablettes de chocolat, gaufres, crêpes, muffins et compotes en formes distinctes déjà validées ; éviter sachets et assiettes inventés.",
    "Petit-déj & snacks / Café & thé": "Respecter les formes différentes des capsules, dosettes, grains, moulu, soluble, filtres, thé, matcha et infusions ; ne pas agrandir excessivement les capsules ou uniformiser en pot.",
    "Petit-déj & snacks / Petit-déjeuner": "Céréales en cartons de famille, Muesli et Granola dans leurs sachets existants, fruits secs dans sachets Dattes v778 ; miel, pancakes, flocons et pâte à tartiner gardent leurs propres références.",
    "Viandes & poissons / Charcuterie": "Tranches, saucissons, pâtés et terrines selon leur préparation réelle, sans salade, plateau ni garniture ; Pâté reprend le petit bocal fermé de Rillettes.",
    "Viandes & poissons / Poissons & traiteur": "Poissons frais en filets ou portions selon Saumon/Cabillaud, fumés en tranches ; moules, surimi et poisson pané selon formes propres. Truite jamais entière avec tête.",
    "Viandes & poissons / Poissons en conserve": "Sardines, maquereaux et thon dans leurs boîtes de poisson spécifiques ; ne pas réutiliser les boîtes crème/sauge des légumineuses.",
    "Viandes & poissons / Surgelés": "Poisson surgelé dans son conditionnement spécifique déjà présent, jamais automatiquement un sachet bleu de légumes.",
    "Viandes & poissons / Viandes": "Viandes crues/cuites fidèles au nom et à la coupe, sans herbes, poivre, planche ou garniture inventés ; Dinde et escalopes de poulet crues seules.",
}

VISUAL_FAMILY_RULES = {
    "cereal_boxes": "GABARIT VISUEL INVARIABLE de Céréales Lion : carton rectangulaire vertical de mêmes largeur, hauteur et profondeur apparentes ; même angle trois-quarts montrant une bande étroite du CÔTÉ GAUCHE et la grande face avant. Bandeau BLEU PÂLE RECTILIGNE sur le dessus et bandeau bleu pâle rectiligne en bas, sans vague ni décrochement ; corps crème uniforme. GRAND ÉPI DORÉ imprimé en diagonale, partant du bas-gauche de la face et montant vers sa partie haute droite, même emplacement et taille visuelle que sur Lion. Fenêtre rectangulaire aux coins arrondis, dans la moitié basse de la face, mêmes position, largeur, hauteur et marges que sur Lion : jamais fenêtre remontée, agrandie, rétrécie ou collée au bas. La boîte garde la même taille apparente dans la vignette, ni plus fine ni plus petite. CECI N'EST PAS UNE PROPOSITION DE NOUVEAU DESIGN : seule la texture des céréales À L'INTÉRIEUR de la fenêtre peut changer. Aucun épi supplémentaire, vignette de céréales imprimée, aliment posé hors boîte, bol, logo, nom ou inscription.",
    "cereal_plain": "Préserver le modèle de www/Items/cereales.webp : boîte carton beige naturelle avec grand épi doré et fenêtre basse ; flocons dorés dans la fenêtre. Ne pas lui imposer les bandeaux bleus des autres céréales.",
    "baby_cereal": "Conserver le modèle exact de www/Items/cereales-infantiles.webp : boîte crème et bleu pâle à épi doré, fenêtre basse contenant de la poudre céréalière fine, pas de coussins chocolat ni marque.",
    "dried_nuts": "Modèle unique www/Items/dattes.webp v778 : sachet kraft/crème fermé à zip, fenêtre intermédiaire arrondie haut vers 40 % et bas vers 92 % de la hauteur, bande kraft haute visible avec petite icône brune monochrome au trait, décoration ocre discrète basse. Aucun mot, lettre, nom, grand fruit imprimé, bocal ou aliment hors sachet. Seuls contenu naturel et petite icône changent.",
    "juice": "Référence canonique www/Items/jus-d-orange.webp v783 : bouteille en verre droite, corps modérément élancé hauteur/largeur ~2,6, épaules arrondies, col court, bouchon doré vissé, petite étiquette crème basse à fruits imprimés et filet discret. Garder même angle, largeur, bouchon, échelle et position de l'étiquette ; seules couleur naturelle du jus et illustration de son fruit changent. Aucun fruit physique, mot, nom, logo ou paille.",
    "beer": "Référence canonique www/Items/biere-blonde.webp v780 : bouteille de 33 cl trapue et large, épaules arrondies, col court, corps ~40 % de la hauteur totale en largeur, petite étiquette crème basse ; capsule et petit pictogramme imprimé adaptés à la variété. Même silhouette et échelle pour ces huit produits, sans texte ni marque.",
    "beer_zero": "Conserver la bouteille large de Bière blonde, capsule bleu pétrole, petite étiquette crème portant UNIQUEMENT BIÈRE 0 %, sans fruit, épi, symbole ou autre texte.",
    "whisky": "Référence canonique www/Items/whisky.webp v785 : corps rectangulaire large à coins arrondis, épaules inclinées, col court, petit bouchon noir vissé, liquide ambré. Petite étiquette crème basse portant UNIQUEMENT WHISKY en capitales brunes ; ne pas revenir au bouchon de liège v780, à une carafe ni à une bouteille haute étroite.",
    "rhum": "Même bouteille cylindrique ambrée validée, bouchon brun bronze, étiquette crème portant UNIQUEMENT RHUM, sans pictogramme ni autre inscription.",
    "ricard": "Silhouette élancée ambrée, col et capsule argentés, petite étiquette crème portant UNIQUEMENT RICARD en bleu marine ; pas de soleil ni deuxième étiquette.",
    "tonic": "Bouteille en verre clair légèrement bleuté à bouchon argenté, étiquette crème portant UNIQUEMENT TONIC en bleu ardoise ; aucun pictogramme ni autre inscription.",
    "cola": "Conserver précisément les deux bouteilles déjà harmonisées : même silhouette de PET nervuré, même hauteur, même angle, bouchon et bandeau déjà validés. Préserver uniquement les inscriptions de marque déjà présentes sur ces références ; Coca rouge, Coca zéro noir. Ne pas réinterpréter l'emballage.",
    "jams": "Référence canonique www/Items/confiture-fraise.webp : bocal haut à facettes, couvercle fermé vichy rouge/blanc, étiquette crème ronde à double filet rouge. Même forme, échelle et position ; seul le fruit, sa couleur naturelle, le fruit imprimé et son NOM GÉNÉRIQUE autorisé sur l'étiquette changent. Aucun fruit hors bocal.",
    "sauces": "Référence canonique www/Items/mayonnaise.webp : reprendre exactement bocal en verre aux épaules arrondies, couvercle doré, grande étiquette crème centrale rectangulaire à coins arrondis avec double filet fin. Garder les proportions, la forme, le cadrage, l'étiquette SANS TEXTE NI PICTOGRAMME. Changer le contenu et l'accent discret selon la sauce ; ne pas inventer flacon souple, tube ou bol. Exclut huiles, vinaigres, confitures, miel, crèmes et pâtes à tartiner sucrées.",
    "spices": "Référence canonique www/Items/paprika.webp : exactement le même petit bocal rigide en verre, couvercle doré, petite étiquette crème centrale en cartouche à coins décoratifs et double filet brun cannelle SANS TEXTE NI PICTOGRAMME. Seul le contenu exact change : gousses entières pour Vanille, piments séchés pour Chili, ni moulins ni sachets.",
    "pasta": "Modèle paquet beige de pâtes à grande fenêtre : même forme, volume, palette beige et marges, aucune désignation ni mot ; montrer majoritairement les pâtes de la FORME EXACTE du nom. Pour Gnocchis, petites coquilles creuses striées dans le modèle Conchiglie, jamais des boulettes de pomme de terre.",
    "rice": "Modèle riz validé : paquet bleu, large fenêtre laissant voir davantage de riz que d'emballage, petite zone beige en bas ; grains et couleurs naturelles propres à la variété, aucun bol, nom ni produit hors paquet.",
    "grains": "Polenta et Quinoa en sachet crème/ocre existant, Boulgour et Semoule en sachet kraft/crème de leur famille ; même fenêtre et contenu naturel sans bol ni texte inventé.",
    "flours": "Conserver les emballages poudre de famille en sachets kraft/crème fermés avec une discrète illustration imprimée si déjà validée ; jamais poudre en bol, sac ouvert ou ingrédient physique autour.",
    "sugar": "Conserver les bocaux à couvercle bois déjà validés avec petits tas de sucre et étiquettes harmonisées : textures blanc cristallisé, poudre fine ou roux distinctes. Ne pas appliquer le bocal des épices.",
    "preserves": "Boîte métallique argentée fermée, étiquette crème, bandeau sauge, contenu représenté par illustration imprimée. Même finition que Pois chiches/Haricots rouges ; concentré de tomate dans une boîte plus petite. Aucun aliment physique autour.",
    "baby_snacks": "Même sachet crème fermé avec bandeaux bleu pâle, grande fenêtre et petit épi imprimé ; contenu réel propre au nom, pas d'âge ni texte inventé.",
    "yogurt_round": "Famille pots crème et bleu pâle à couvercle ROND déjà validés. Garder forme et échelle, ne pas leur imposer l'opercule carré.",
    "yogurt_square": "Référence www/Items/yaourts-vanille.webp v760 : petit pot blanc évasé à opercule SOUPLE CARRÉ fermé, même angle et proportions. Seules teintes naturelles de parfum et petite illustration imprimée autorisée varient ; aucun fruit physique, pas de texte, pas de couvercle rigide rond. Les crèmes dessert restent bien identifiées comme crèmes dessert.",
    "fresh_creams": "Pot de crème fraîche fermé avec couvercle clairement visible, distinct des bocaux Mayonnaise/Paprika ; jamais brique ou bouteille.",
    "mascarpone": "Pot laitier bas et large fermé avec opercule/rebord, décor crème/bleu et seule désignation générique MASCARPONE autorisée ; ni bol de crème exposée ni pot de sauce.",
    "milk_plant": "Reprendre les bouteilles laitières végétales déjà validées, notamment Lait d'amande pour Lait de soja ; changer seulement l'illustration imprimée de l'ingrédient et la couleur naturelle, pas la silhouette.",
    "frozen_vegetables": "Référence www/Items/haricots-verts-surgeles.webp : sachet large fermé, bandeau courbe bleu glacier, petit flocon BLANC OPAQUE, grande fenêtre transparente et bas bleu. Montrer le contenu exact ; frites pâles non cuites, épinards hachés en portions et épinards en feuilles distincts.",
    "sprays": "Référence www/Items/nettoyant-multi-usages.webp : même flacon ménager ergonomique entier et gâchette blanche, étiquette crème courbe sans texte ; seules les couleurs déjà validées changent. Ne pas étendre aux bidons Javel, produits WC ou poudres.",
    "oils": "Flacon d'huile à anse et bouchon vert de la famille validée, huile naturelle visible, petite illustration imprimée si prévue ; jamais pot de sauce.",
    "vinegars": "Bouteille de vinaigre élancée fermée et étiquette crème à filet olive doré de la famille validée ; couleurs et illustration de raisin/cidre seulement selon produit, jamais pot Mayonnaise.",
    "raw_meats": "Représenter de la viande CRUE seule, sans persil, grains de poivre, décor, planche ou assiette ; forme fidèle à la coupe.",
    "fish_portions": "Poisson FRAIS en filet ou portion crue cohérente avec Saumon et Cabillaud ; Truite à chair rosée et peau argentée, jamais poisson entier avec tête et queue.",
    "cheese_grated": "Fromage râpé en petit amas naturel isolé, sans sachet, plat ni garniture ; fils longs jaunes pour Emmental, grains ivoire fins pour Parmesan, mozzarella plus blanche.",
    "tart_dough": "Référence Pâte brisée : rouleau de pâte CRUE avec spirale et papier cuisson, emballage transparent fermé, entièrement visible, sans assiette ni fond de tarte cuit.",
    "baby_items": "Conserver EXACTEMENT la présentation propre au produit : petites pâtes en sachet crème/bleu, purée en gourde crème/sauge, compotes en gourde jaune/rouge, lait infantile en boîte cylindrique crème/bleu, petits pots en bocal fermé doré, desserts lactés en pot carré crème/bleu, sacs à couches en rouleau bleu menthe neuf. Jamais texte d'âge ni garniture inventée.",
    "packaged_snacks": "Respecter les sachets kraft/creme de Granola et Muesli déjà validés avec contenu bien visible et proportions de famille ; ne pas utiliser la boîte de Céréales Lion.",
    "house_batteries": "Représenter les piles naturelles hors boîte ni blister, proportions exactes pour chaque référence, échelle équilibrée dans la grille.",
}

PRODUCT_VISUAL_FAMILY = {
    "Céréales Lion": "cereal_boxes",
    "Céréales Trésor": "cereal_boxes",
    "Céréales": "cereal_plain",
    "Céréales infantiles": "baby_cereal",
    "Noix de cajou": "dried_nuts",
    "Pistaches": "dried_nuts",
    "Cacahuètes": "dried_nuts",
    "Noix de pécan": "dried_nuts",
    "Noix du Brésil": "dried_nuts",
    "Dattes": "dried_nuts",
    "Abricots secs": "dried_nuts",
    "Raisins secs": "dried_nuts",
    "Pruneaux": "dried_nuts",
    "Figues sèches": "dried_nuts",
    "Jus d'orange": "juice",
    "Jus de pomme": "juice",
    "Jus de poire": "juice",
    "Jus de raisin": "juice",
    "Jus d'ananas": "juice",
    "Jus de tomate": "juice",
    "Jus multifruits": "juice",
    "Bière ambrée": "beer",
    "Bière aux fruits": "beer",
    "Bière blanche": "beer",
    "Bière blonde": "beer",
    "Bière brune": "beer",
    "Bière IPA": "beer",
    "Bière triple": "beer",
    "Panaché": "beer",
    "Bière sans alcool": "beer_zero",
    "Whisky": "whisky",
    "Rhum": "rhum",
    "Ricard": "ricard",
    "Tonic": "tonic",
    "Coca": "cola",
    "Coca zéro": "cola",
    "Confiture abricot": "jams",
    "Confiture cerise": "jams",
    "Confiture figue": "jams",
    "Confiture fraise": "jams",
    "Confiture framboise": "jams",
    "Confiture fruits rouges": "jams",
    "Confiture mirabelles": "jams",
    "Confiture mûre": "jams",
    "Confiture myrtille": "jams",
    "Confiture orange": "jams",
    "Confiture pêche": "jams",
    "Mayonnaise": "sauces",
    "Ketchup": "sauces",
    "Moutarde": "sauces",
    "Pesto": "sauces",
    "Tabasco": "sauces",
    "Bolognaise": "sauces",
    "Harissa": "sauces",
    "Guacamole": "sauces",
    "Houmous": "sauces",
    "Tapenade": "sauces",
    "Coulis de tomate": "sauces",
    "Coulis de fruit": "sauces",
    "Sauce aigre-douce": "sauces",
    "Sauce algérienne": "sauces",
    "Sauce andalouse": "sauces",
    "Sauce au poivre": "sauces",
    "Sauce au roquefort": "sauces",
    "Sauce aux champignons": "sauces",
    "Sauce barbecue": "sauces",
    "Sauce Béarnaise": "sauces",
    "Sauce blanche": "sauces",
    "Sauce burger": "sauces",
    "Sauce César": "sauces",
    "Sauce curry": "sauces",
    "Sauce hollandaise": "sauces",
    "Sauce miel-moutarde": "sauces",
    "Sauce napolitaine": "sauces",
    "Sauce ranch": "sauces",
    "Sauce samouraï": "sauces",
    "Sauce soja": "sauces",
    "Sauce tartare": "sauces",
    "Sauce teriyaki": "sauces",
    "Sauce tomate": "sauces",
    "Curcuma": "spices",
    "Curry": "spices",
    "Paprika": "spices",
    "Poivre": "spices",
    "Sel": "spices",
    "Chili": "spices",
    "Vanille": "spices",
    "Conchiglie": "pasta",
    "Coquillettes": "pasta",
    "Farfalle": "pasta",
    "Fusilli": "pasta",
    "Lasagnes": "pasta",
    "Linguine": "pasta",
    "Macaronis": "pasta",
    "Orecchiette": "pasta",
    "Penne": "pasta",
    "Rigatoni": "pasta",
    "Spaghetti": "pasta",
    "Tagliatelles": "pasta",
    "Vermicelles": "pasta",
    "Gnocchis": "pasta",
    "Riz à sushi": "rice",
    "Riz arborio": "rice",
    "Riz basmati": "rice",
    "Riz blanc": "rice",
    "Riz complet": "rice",
    "Riz gluant": "rice",
    "Riz jasmin": "rice",
    "Riz long": "rice",
    "Riz noir": "rice",
    "Riz rouge": "rice",
    "Riz sauvage": "rice",
    "Polenta": "grains",
    "Quinoa": "grains",
    "Boulgour": "grains",
    "Semoule": "grains",
    "Amandes en poudre": "flours",
    "Chapelure": "flours",
    "Farine": "flours",
    "Levure boulangère": "flours",
    "Maïzena": "flours",
    "Noix de coco râpée": "flours",
    "Sucre": "sugar",
    "Sucre glace": "sugar",
    "Sucre roux": "sugar",
    "Champignons en boîte": "preserves",
    "Concentré de tomate": "preserves",
    "Flageolets": "preserves",
    "Haricots blancs": "preserves",
    "Haricots rouges": "preserves",
    "Haricots verts en boîte": "preserves",
    "Lentilles": "preserves",
    "Maïs en boîte": "preserves",
    "Petits pois carottes": "preserves",
    "Pois chiches": "preserves",
    "Raviolis en boîte": "preserves",
    "Tomates pelées": "preserves",
    "Gâteaux bébé": "baby_snacks",
    "Biscuits bébé": "baby_snacks",
    "Boudoirs bébé": "baby_snacks",
    "Galettes de riz bébé": "baby_snacks",
    "Yaourts nature": "yogurt_round",
    "Yaourts grecs": "yogurt_round",
    "Skyr": "yogurt_round",
    "Yaourt": "yogurt_square",
    "Yaourts fruits": "yogurt_square",
    "Yaourts vanille": "yogurt_square",
    "Yaourts citron": "yogurt_square",
    "Yaourts noix de coco": "yogurt_square",
    "Crème dessert caramel": "yogurt_square",
    "Crème dessert chocolat": "yogurt_square",
    "Crème dessert vanille": "yogurt_square",
    "Crème épaisse": "fresh_creams",
    "Crème fraîche": "fresh_creams",
    "Mascarpone": "mascarpone",
    "Lait d'amande": "milk_plant",
    "Lait d'avoine": "milk_plant",
    "Lait de soja": "milk_plant",
    "Épinards hachés surgelés": "frozen_vegetables",
    "Épinards surgelés": "frozen_vegetables",
    "Frites surgelées": "frozen_vegetables",
    "Haricots verts surgelés": "frozen_vegetables",
    "Légumes surgelés": "frozen_vegetables",
    "Petits pois surgelés": "frozen_vegetables",
    "Poêlée de légumes": "frozen_vegetables",
    "Désinfectant": "sprays",
    "Désodorisant textile": "sprays",
    "Détachant": "sprays",
    "Nettoyant multi-usages": "sprays",
    "Nettoyant salle de bain": "sprays",
    "Nettoyant vitres": "sprays",
    "Huile d'olive": "oils",
    "Huile de tournesol": "oils",
    "Huile de sésame": "oils",
    "Vinaigre balsamique": "vinegars",
    "Vinaigre de cidre": "vinegars",
    "Vinaigre de vin": "vinegars",
    "Dinde": "raw_meats",
    "Escalopes de poulet": "raw_meats",
    "Filets de poulet": "raw_meats",
    "Truite": "fish_portions",
    "Saumon": "fish_portions",
    "Cabillaud": "fish_portions",
    "Thon frais": "fish_portions",
    "Emmental râpé": "cheese_grated",
    "Parmesan râpé": "cheese_grated",
    "Fromage râpé": "cheese_grated",
    "Mozzarella râpée": "cheese_grated",
    "Pâte brisée": "tart_dough",
    "Pâte sablée": "tart_dough",
    "Petites pâtes bébé": "baby_items",
    "Purée bébé": "baby_items",
    "Compotes bébé": "baby_items",
    "Lait infantile": "baby_items",
    "Petits pots": "baby_items",
    "Desserts lactés bébé": "baby_items",
    "Sacs à couches": "baby_items",
    "Granola": "packaged_snacks",
    "Muesli": "packaged_snacks",
    "Pile 9V": "house_batteries",
    "Pile AAA": "house_batteries",
    "Piles AA": "house_batteries",
    "Piles CR123A": "house_batteries",
    "Piles CR2025": "house_batteries",
    "Piles CR2032": "house_batteries",
    "Piles CR2450": "house_batteries",
    "Piles LR44": "house_batteries",
}

PRODUCT_VISUAL_EXCEPTIONS = {
    "Céréales Trésor": "INSTRUCTION PRIORITAIRE SUR LE VISUEL FINAL : obtenir le paquet de Céréales Lion avec exactement le même cadrage, la même largeur, la même perspective trois-quarts, les deux bandeaux bleu pâle DROITS, le même GRAND ÉPI DORÉ OBLIQUE et la même fenêtre arrondie basse. Ne pas créer une nouvelle boîte : pas de carton plus étroit, autre face latérale, vague bleue, épi vertical, fenêtre déplacée ou décoration de céréales hors fenêtre. SEUL CHANGEMENT AUTORISÉ : remplacer les céréales de la fenêtre par des coussins gonflés BLÉ DORÉ CLAIR, carrés et légèrement bombés, fourrés de chocolat brun ; une ou deux pièces cassées peuvent montrer le chocolat UNIQUEMENT DANS LA FENÊTRE. La couleur extérieure des coussins reste dorée claire, jamais brun chocolat, et aucun texte/nom/logo n'est ajouté.",
    "Céréales Lion": "Conserver les céréales soufflées triangulaires chocolat brun et caramel doré dans la fenêtre du modèle existant, sans modifier la silhouette du paquet ni ajouter de texte.",
    "Crème liquide": "Crème liquide en BRIQUE fermée, jamais pot de crème épaisse ni bocal de sauce.",
    "Crème anglaise": "Brique crème/vanille fermée avec bouchon ; vanille et volute de crème seulement imprimées.",
    "Coulis de tomate": "Contenu de tomate rouge lisse dans le bocal Mayonnaise ; jamais viande ou pot de conserve.",
    "Gouda": "Conserver pâte jaune, cire rouge et cubes, sans ombre externe, marges serrées pour une taille cohérente.",
    "Burrata": "Burrata seule sans tomate, basilic ni huile.",
    "Feta": "Feta seule sans salade ni olive.",
    "Ricotta": "Ricotta seule sans garniture.",
    "Tofu": "Bloc ivoire et cubes en barquette transparente FERMÉE avec bandeau crème/sauge ; aucune garniture.",
    "Riz au lait": "Petit pot en verre FERMÉ avec riz crémeux visible, sans caramel ni cannelle ajoutés.",
    "Yaourt à boire": "Bouteille laitière fermée à bouchon rose, fraise uniquement imprimée ; aucun fruit autour.",
    "Petits pois": "Petits amas de pois nature sans bol ; quelques cosses ouvertes autorisées.",
    "Olives fraîches": "Olives fraîches en petit amas naturel sans bol ni bocal de sauce.",
    "Chou blanc": "Tête de chou blanc avec quartier révélant la chair pâle, sans préparation.",
    "Choux de Bruxelles": "Petits choux verts en groupe et un demi-chou, sans emballage.",
    "Pastèque": "Fruit entier vert rayé avec un quartier rouge naturel, sans plat.",
    "Pamplemousse": "Fruit entier et moitié à chair rose, sans bol.",
    "Pâte feuilletée": "Pâte CRUE pliée sans moule ni quiche.",
    "Mascarpone": "Conserver l'étiquette générique MASCARPONE du pot laitier, mais aucune marque ou slogan.",
    "Whisky": "Cette règle v785 remplace explicitement tout ancien whisky à bouchon de liège.",
    "Bière sans alcool": "BIÈRE 0 % est le seul texte autorisé ; ne pas appliquer la règle sans texte des autres bières.",
    "Gnocchis": "Produit du catalogue = pâtes sèches en petites coquilles creuses striées dans un paquet beige, PAS des gnocchis de pommes de terre.",
    "Vinaigre de vin": "Bouteille élancée, liquide grenat/brun rouge translucide distinct du balsamique et du cidre ; bouchon vissé doré et raisin imprimé.",
    "Crème de coco": "Boîte métal fermée du modèle Lait de coco avec symbole coco et crème imprimée, jamais boîte ouverte.",
    "Pain de mie complet": "Tranches de pain complet brun dans le rendu de Pain de mie.",
    "Épinards hachés surgelés": "Contenu en portions compactes d'épinards hachés, pas feuilles entières.",
    "Liquide vaisselle mains sensibles": "Même flacon que Liquide vaisselle avec liquide rose pâle et étiquette crème, SANS allégation commerciale.",
    "Brossettes interdentaires": "Petites brossettes en blister crème/bleu fermé et non une brosse à dents géante.",
    "Fil dentaire": "Petite boîte à fil dentaire blanc/bleu et coupe-fil, pas tube.",
}


def select_visual_family(name: str, category: str, subgroup: str) -> str:
    """Privilégie la famille réelle de l'article à son sous-groupe de navigation."""
    known=PRODUCT_VISUAL_FAMILY.get(name)
    if known:
        return known
    if category=="Boissons" and name.startswith("Jus "):
        return "juice"
    if category=="Boissons" and name.startswith("Bière "):
        return "beer"
    if category=="Épicerie" and name.startswith("Confiture "):
        return "jams"
    if category=="Épicerie" and (name.startswith("Sauce ") or name.startswith("Coulis ")):
        return "sauces"
    if category=="Épicerie" and name.startswith("Riz "):
        return "rice"
    return ""


def image_prompt(name: str, category: str, subgroup: str, image_hint: str="") -> str:
    """Compose seulement les consignes de la sous-catégorie et de la famille concernées."""
    family=select_visual_family(name,category,subgroup)
    subgroup_rule=SUBGROUP_VISUAL_GUIDANCE.get(f"{category} / {subgroup}","")
    family_rule=VISUAL_FAMILY_RULES.get(family,"")
    product_rule=PRODUCT_VISUAL_EXCEPTIONS.get(name,"")
    hint=(
        f"Précision visuelle prioritaire fournie par l’utilisateur: {image_hint}. "
        "Respecter cette précision si elle conserve l'identité du produit, le modèle visuel approuvé et la sécurité. "
        if image_hint else ""
    )
    return " ".join(part for part in (
        f"Vignette produit pour une application de courses : {name}. Catégorie {category}, sous-groupe {subgroup}.",
        "Rendu 3D semi-réaliste premium, lisible en petite vignette mobile cible d'affichage finale de 192×192 px. "
        "Un seul produit, fond totalement transparent, entièrement visible, centré, formes lisibles, "
        "textures sobres, contours nets, sans halo ni liseré blanc, aucune table, personne, collage, décor ou accessoire ajouté. "
        "Éviter les micro-détails, textures photographiques complexes, reflets multiples, motifs fins et bruit visuel. "
        "Le produit principal occupe environ 86 à 92 % de sa plus grande dimension, sans bord coupé ; "
        "garder son échelle comparable aux autres articles de la MÊME FAMILLE VISUELLE, et non du seul sous-groupe.",
        "Hiérarchie obligatoire : exception produit validée > modèle canonique de famille > "
        "règle de sous-catégorie > style premium général. Une ancienne règle remplacée n'est plus applicable. "
        "Pour une famille emballée disposant d'un modèle canonique, traiter la forme validée comme un GABARIT INVARIABLE : " 
        "ne pas proposer un nouveau design, modifier uniquement le contenu ou l'accent explicitement autorisé. "
        "Pour une famille emballée, conserver silhouette, perspective, bandes, étiquette, fenêtre, fermeture et marges "
        "du modèle déjà approuvé. Ne modifier que le contenu ou les accents expressément autorisés. "
        "Aucun objet ou aliment en dehors de son emballage. Aucune inscription, marque ou logo inventés ; "
        "conserver uniquement les noms ou marques explicitement autorisés par la famille ou le produit.",
        "Règle de sous-catégorie : "+subgroup_rule if subgroup_rule else "",
        "Règle de famille visuelle : "+family_rule if family_rule else "",
        "Exception produit prioritaire : "+product_rule if product_rule else "",
        hint,
        "Concevoir une image qui se compresse efficacement en WebP : maximum 15 000 octets "
        "pour le fichier final, à contrôler après encodage, sans sacrifier sa reconnaissance ni son style premium. "
        "Préserver le conditionnement demandé et la transparence du fond, sans rognage, "
        "vérifier contours et lisibilité à 192 px et 48 px sur fonds clair et foncé. "
        "Si le poids ou la qualité sont insuffisants, refuser l'intégration.",
    ) if part)
 
 
PRODUCT_IMAGE_MAX_BYTES = 15_000


def _webp_codec():
    """Charge la bibliothèque native présente sur le runner, sans paquet Python externe."""
    name = ctypes.util.find_library("webp")
    if not name:
        raise RuntimeError("Codec libwebp indisponible : réencodage WebP local impossible")
    lib = ctypes.CDLL(name)
    pointer = ctypes.POINTER(ctypes.c_uint8)
    lib.WebPDecodeRGBA.argtypes = (
        pointer, ctypes.c_size_t, ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int)
    )
    lib.WebPDecodeRGBA.restype = pointer
    lib.WebPEncodeRGBA.argtypes = (
        pointer, ctypes.c_int, ctypes.c_int, ctypes.c_int,
        ctypes.c_float, ctypes.POINTER(pointer)
    )
    lib.WebPEncodeRGBA.restype = ctypes.c_size_t
    lib.WebPFree.argtypes = (ctypes.c_void_p,)
    lib.WebPFree.restype = None
    return lib


def _resample_rgba(raw: bytes, width: int, height: int, side: int) -> bytes:
    """Bilinear alpha-premultiplied : pas de halo sombre autour du produit."""
    if width == height == side:
        return raw
    pixels = memoryview(raw)
    output = bytearray(side * side * 4)
    for y in range(side):
        fy = (y + 0.5) * height / side - 0.5
        y0 = max(0, min(height - 1, math.floor(fy)))
        y1 = max(0, min(height - 1, y0 + 1))
        wy = max(0.0, min(1.0, fy - y0))
        for x in range(side):
            fx = (x + 0.5) * width / side - 0.5
            x0 = max(0, min(width - 1, math.floor(fx)))
            x1 = max(0, min(width - 1, x0 + 1))
            wx = max(0.0, min(1.0, fx - x0))
            corners = (
                (y0 * width + x0, (1 - wx) * (1 - wy)),
                (y0 * width + x1, wx * (1 - wy)),
                (y1 * width + x0, (1 - wx) * wy),
                (y1 * width + x1, wx * wy),
            )
            alpha_total = 0.0
            colors = [0.0, 0.0, 0.0]
            for pixel, weight in corners:
                if not weight:
                    continue
                i = pixel * 4
                alpha = pixels[i + 3]
                alpha_total += weight * alpha
                for channel in range(3):
                    colors[channel] += weight * alpha * pixels[i + channel]
            i = (y * side + x) * 4
            output[i + 3] = max(0, min(255, round(alpha_total)))
            if alpha_total:
                for channel in range(3):
                    output[i + channel] = max(0, min(255, round(colors[channel] / alpha_total)))
    return bytes(output)


def optimize_product_webp(image: bytes) -> bytes:
    """Réencode la même génération : aucun nouvel appel API, aucun redimensionnement vers le haut."""
    if len(image) <= PRODUCT_IMAGE_MAX_BYTES:
        return image
    lib = _webp_codec()
    pointer = ctypes.POINTER(ctypes.c_uint8)
    source = (ctypes.c_uint8 * len(image)).from_buffer_copy(image)
    width = ctypes.c_int()
    height = ctypes.c_int()
    decoded = lib.WebPDecodeRGBA(source, len(image), ctypes.byref(width), ctypes.byref(height))
    if not decoded:
        raise RuntimeError("Le visuel WebP généré ne peut être décodé par libwebp")
    try:
        rgba = ctypes.string_at(decoded, width.value * height.value * 4)
    finally:
        lib.WebPFree(decoded)
    if width.value < 256 or height.value < 256:
        raise RuntimeError("Visuel source insuffisant pour une vignette produit premium")
    candidates = ((816, 80), (512, 75), (384, 75), (384, 65),
                  (320, 75), (320, 65), (256, 80), (256, 70), (256, 65))
    for side, quality in candidates:
        if side > width.value or side > height.value:
            continue
        pixels = _resample_rgba(rgba, width.value, height.value, side)
        buffer = (ctypes.c_uint8 * len(pixels)).from_buffer_copy(pixels)
        encoded = pointer()
        size = lib.WebPEncodeRGBA(buffer, side, side, side * 4, float(quality), ctypes.byref(encoded))
        if not size or not encoded:
            continue
        try:
            result = ctypes.string_at(encoded, size)
        finally:
            lib.WebPFree(encoded)
        if (len(result) <= PRODUCT_IMAGE_MAX_BYTES and result[:4] == b"RIFF"
                and result[8:12] == b"WEBP" and result[12:16] == b"VP8X"
                and result[20] & 0x10):
            return result
    raise RuntimeError(
        f"Visuel produit trop lourd ({len(image)} octets) : aucun réencodage transparent "
        f"et lisible (min. 256 px, qualité 65) ne respecte {PRODUCT_IMAGE_MAX_BYTES} octets"
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
            "output_compression":PRODUCT_IMAGE_COMPRESSION,
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
    return optimize_product_webp(image)


def current_version() -> int:
    text=(ROOT / "dish-local-images.js").read_text(encoding="utf-8")
    match=re.search(r"const APP_VERSION='v(\d+)'",text)
    if not match:
        base.fail("Version globale introuvable dans dish-local-images.js")
    return int(match.group(1))


def update_display_mode(name: str, display_mode: str) -> bool:
    path=ROOT / "catalog-quantities.js"
    text=path.read_text(encoding="utf-8")
    match=re.search(r"(const DISPLAY_MODE_BY_PRODUCT=Object\.freeze\(\{)(.*?)(\n\}\);)",text,flags=re.S)
    if not match:
        base.fail("Table des conditionnements introuvable dans catalog-quantities.js")
    body=match.group(2)
    quoted=json.dumps(name,ensure_ascii=False)
    if re.search(rf"(?:^|[,\n]\s*){re.escape(quoted)}\s*:",body):
        return False
    entry=f"  {quoted}:{json.dumps(display_mode,ensure_ascii=False)}"
    suffix="," if body.rstrip() and not body.rstrip().endswith(",") else ""
    replacement=match.group(1)+body.rstrip()+suffix+"\n"+entry+match.group(3)
    path.write_text(text[:match.start()]+replacement+text[match.end():],encoding="utf-8")
    return True


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
    quantities_changed=False

    if not already_in_catalog:
        if create_subgroup:
            if subgroup in groups[category]:
                base.fail("La sous-catégorie produit existe déjà")
            groups[category][subgroup]=[]
        elif subgroup not in groups[category]:
            base.fail("Sous-catégorie produit introuvable")
        groups[category][subgroup].append(name)
        groups[category][subgroup].sort(key=base.normalize)
        quantities_changed=update_display_mode(name,display_mode)
        encoded_groups=json.dumps(groups,ensure_ascii=False,separators=(",",":"))
        catalog_text=catalog_text[:groups_match.start(1)]+encoded_groups+catalog_text[groups_match.end(1):]

    if quantities_changed:
        catalog_text=re.sub(r"(catalog-quantities\.js\?v=)\d+",rf"\g<1>{new_version}",catalog_text,count=1)
    catalog_text=re.sub(r"(dish-local-images\.js\?v=)\d+",rf"\g<1>{new_version}",catalog_text,count=1)
    (ROOT / "catalog.js").write_text(catalog_text,encoding="utf-8")

    catalog_quantities_match=re.search(r"['\"](\./catalog-quantities\.js\?v=\d+)['\"]",catalog_text)
    if not catalog_quantities_match:
        base.fail("Révision active de catalog-quantities.js introuvable dans catalog.js")
    catalog_quantities_asset=catalog_quantities_match.group(1)

    local_text,count=re.subn(r"const APP_VERSION='v\d+'",f"const APP_VERSION='v{new_version}'",local_text,count=1)
    if count!=1:
        base.fail("Version globale introuvable dans dish-local-images.js")
    sw_text,count=re.subn(r"const CACHE='courses-app-v\d+-r\d+'",f"const CACHE='courses-app-v{new_version}-r1'",sw_text,count=1)
    if count!=1:
        base.fail("Version de cache introuvable dans sw.js")
    sw_text=ensure_shell_assets(sw_text,[
        f"./catalog.js?v={new_version}",
        catalog_quantities_asset,
        f"./dish-local-images.js?v={new_version}",
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
    update_visual_hashes.refresh()
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

