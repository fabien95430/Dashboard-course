#!/usr/bin/env python3
"""Remove one product from the catalog and its GitHub-tracked references."""
from __future__ import annotations

import json
import os
import re
import sys

import integrate_dish as base

ROOT = base.ROOT
RESULT_PATH = base.RESULT_PATH
DELETE_PREFIX = '__courses_delete_product__:'


def fail(message: str) -> "NoReturn":
    RESULT_PATH.write_text(
        json.dumps({'ok': False, 'deleted': False, 'error': message}, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )
    raise RuntimeError(message)


def decode_js(value: str) -> str:
    return value.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')


def find_product(groups: dict, requested: str):
    wanted = base.normalize(requested)
    for category, subgroups in groups.items():
        for subgroup, names in subgroups.items():
            for existing in names:
                if base.normalize(existing) == wanted:
                    return str(existing), category, subgroup
    return None


def recipe_usages(name: str) -> list[str]:
    text = (ROOT / 'dishes-ui.js').read_text(encoding='utf-8')
    wanted = base.normalize(name)
    used: list[str] = []
    pattern = re.compile(r"\{name:'((?:\\.|[^'])*)',photoId:.*?ingredients:\[([^\]]*)\]\}", re.S)
    for match in pattern.finditer(text):
        dish = decode_js(match.group(1))
        ingredients = [decode_js(value) for value in re.findall(r"'((?:\\.|[^'])*)'", match.group(2))]
        if any(base.normalize(value) == wanted for value in ingredients):
            used.append(dish)
    return list(dict.fromkeys(used))


def current_version() -> int:
    text = (ROOT / 'dish-local-images.js').read_text(encoding='utf-8')
    match = re.search(r"const APP_VERSION='v(\d+)'", text)
    if not match:
        fail('Version globale introuvable dans dish-local-images.js')
    return int(match.group(1))


def ensure_shell_assets(text: str, assets: list[str]) -> str:
    return base.ensure_shell_assets(text, assets)


def remove_from_favorites(catalog_text: str, name: str) -> str:
    match = re.search(r"(favorites:\s*\[)(.*?)(\])", catalog_text, flags=re.S)
    if not match:
        return catalog_text
    values = [decode_js(value) for value in re.findall(r"'((?:\\.|[^'])*)'", match.group(2))]
    filtered = [value for value in values if base.normalize(value) != base.normalize(name)]
    if len(filtered) == len(values):
        return catalog_text
    replacement = ','.join(base.js_quote(value) for value in filtered)
    return catalog_text[:match.start(2)] + replacement + catalog_text[match.end(2):]


def remove_object_entry(text: str, constant: str, name: str, value_pattern: str) -> str:
    wrapper = re.search(
        rf"(const\s+{re.escape(constant)}\s*=\s*Object\.freeze\(\{{)(.*?)(\}}\);)",
        text,
        flags=re.S,
    )
    if not wrapper:
        return text
    body = wrapper.group(2)
    single_key = re.escape(base.js_quote(name))
    double_key = re.escape(json.dumps(name, ensure_ascii=False))
    entry = rf"(?:{single_key}|{double_key})\s*:\s*(?:{value_pattern})"
    updated, count = re.subn(entry + r"\s*,", '', body, count=1, flags=re.S)
    if count == 0:
        updated, count = re.subn(r",\s*" + entry, '', body, count=1, flags=re.S)
    if count == 0:
        updated, count = re.subn(entry, '', body, count=1, flags=re.S)
    if count == 0:
        return text
    # An entry removal can leave indentation on an otherwise empty line.
    # Keep git diff --check strict without reformatting unrelated code.
    updated = re.sub(r'(?m)^[ \t]+$', '', updated)
    return text[:wrapper.start(2)] + updated + text[wrapper.end(2):]


def main() -> None:
    raw = re.sub(r"\s+", " ", str(os.getenv('DISH_NAME') or '')).strip()
    if not raw.startswith(DELETE_PREFIX):
        fail('Demande de suppression invalide')
    requested = raw[len(DELETE_PREFIX):].strip()
    if not requested or len(requested) > 80:
        fail('Nom de produit invalide')

    catalog_path = ROOT / 'catalog.js'
    catalog_text = catalog_path.read_text(encoding='utf-8')
    groups_match = re.search(r"groups:\s*(\{.*?\}),\s*\n\s*favorites:", catalog_text, flags=re.S)
    if not groups_match:
        fail('Structure groups de catalog.js introuvable')
    try:
        groups = json.loads(groups_match.group(1))
    except json.JSONDecodeError as error:
        fail(f'catalog.js illisible: {error}')

    found = find_product(groups, requested)
    if not found:
        fail('Produit introuvable dans catalog.js')
    name, category, subgroup = found

    usages = recipe_usages(name)
    if usages:
        preview = ', '.join(usages[:8])
        suffix = '…' if len(usages) > 8 else ''
        fail(f'Suppression bloquée : « {name} » est utilisé par {len(usages)} plat(s) : {preview}{suffix}')

    groups[category][subgroup] = [
        value for value in groups[category][subgroup]
        if base.normalize(value) != base.normalize(name)
    ]
    if not groups[category][subgroup]:
        del groups[category][subgroup]

    encoded_groups = json.dumps(groups, ensure_ascii=False, separators=(',', ':'))
    catalog_text = (
        catalog_text[:groups_match.start(1)]
        + encoded_groups
        + catalog_text[groups_match.end(1):]
    )
    catalog_text = remove_from_favorites(catalog_text, name)

    quantities_path = ROOT / 'catalog-quantities.js'
    quantities_text = quantities_path.read_text(encoding='utf-8')
    quantities_text = remove_object_entry(quantities_text, 'PURCHASE_REFERENCES', name, r"\{[^{}]*\}")
    quantities_text = remove_object_entry(
        quantities_text,
        'DISPLAY_MODE_BY_PRODUCT',
        name,
        r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"",
    )
    quantities_text = remove_object_entry(
        quantities_text,
        'TECHNICAL_MODE_BY_PRODUCT',
        name,
        r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"",
    )

    app_path = ROOT / 'app.js'
    app_text = app_path.read_text(encoding='utf-8')
    app_text = remove_object_entry(
        app_text,
        'CATALOG_DISPLAY_NAMES',
        name,
        r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"",
    )

    intelligence_path = ROOT / 'purchase-intelligence.js'
    intelligence_text = intelligence_path.read_text(encoding='utf-8')
    intelligence_text = remove_object_entry(intelligence_text, 'PRODUCT', name, r"\{[^{}]*\}")

    local_path = ROOT / 'dish-local-images.js'
    sw_path = ROOT / 'sw.js'
    index_path = ROOT / 'index.html'
    local_text = local_path.read_text(encoding='utf-8')
    sw_text = sw_path.read_text(encoding='utf-8')
    index_text = index_path.read_text(encoding='utf-8')
    new_version = current_version() + 1

    catalog_text = re.sub(
        r"(catalog-quantities\.js\?v=)\d+",
        rf"\g<1>{new_version}",
        catalog_text,
        count=1,
    )
    catalog_text = re.sub(
        r"(dish-local-images\.js\?v=)\d+",
        rf"\g<1>{new_version}",
        catalog_text,
        count=1,
    )
    local_text, count = re.subn(
        r"const APP_VERSION='v\d+'",
        f"const APP_VERSION='v{new_version}'",
        local_text,
        count=1,
    )
    if count != 1:
        fail('Version globale introuvable dans dish-local-images.js')
    local_text = re.sub(
        r"(purchase-intelligence\.js\?v=)\d+",
        rf"\g<1>{new_version}",
        local_text,
        count=1,
    )
    sw_text, count = re.subn(
        r"const CACHE='courses-app-v\d+-r\d+'",
        f"const CACHE='courses-app-v{new_version}-r1'",
        sw_text,
        count=1,
    )
    if count != 1:
        fail('Version de cache introuvable dans sw.js')
    sw_text = ensure_shell_assets(sw_text, [
        f'./catalog.js?v={new_version}',
        f'./app.js?v={new_version}',
        f'./catalog-quantities.js?v={new_version}',
        f'./dish-local-images.js?v={new_version}',
        f'./purchase-intelligence.js?v={new_version}',
    ])

    index_text, count = re.subn(
        r'(<span class="page-version">)v\d+(</span>)',
        rf'\g<1>v{new_version}\g<2>',
        index_text,
    )
    if count != 3:
        fail('Badges de version visibles introuvables dans index.html')
    index_text = re.sub(
        r'(catalog\.js\?v=)\d+',
        rf'\g<1>{new_version}',
        index_text,
        count=1,
    )
    index_text = re.sub(
        r'(app\.js\?v=)\d+',
        rf'\g<1>{new_version}',
        index_text,
        count=1,
    )

    filename = base.slugify(name) + '.webp'
    image_path = ROOT / 'www' / 'Items' / filename

    catalog_path.write_text(catalog_text, encoding='utf-8')
    quantities_path.write_text(quantities_text, encoding='utf-8')
    app_path.write_text(app_text, encoding='utf-8')
    intelligence_path.write_text(intelligence_text, encoding='utf-8')
    local_path.write_text(local_text, encoding='utf-8')
    sw_path.write_text(sw_text, encoding='utf-8')
    index_path.write_text(index_text, encoding='utf-8')
    if image_path.exists():
        image_path.unlink()

    RESULT_PATH.write_text(
        json.dumps({
            'ok': True,
            'deleted': True,
            'already_exists': False,
            'name': name,
            'version': new_version,
            'filename': filename,
            'category': category,
            'subgroup': subgroup,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        if not RESULT_PATH.exists():
            RESULT_PATH.write_text(
                json.dumps({'ok': False, 'deleted': False, 'error': str(error)}, ensure_ascii=False, indent=2),
                encoding='utf-8',
            )
        print(str(error), file=sys.stderr)
        sys.exit(1)
