#!/usr/bin/env python3
"""Validate the generated catalog asset before any Git commit/publication."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RESULT_PATH=ROOT / '.courses-dish-result.json'


def save_failure(data: dict, message: str) -> None:
    payload=dict(data or {})
    payload['ok']=False
    payload['error']=message
    RESULT_PATH.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    raise RuntimeError(message)


def png_dimensions(data: bytes) -> tuple[int,int]:
    if len(data)<24 or data[:8]!=b'\x89PNG\r\n\x1a\n' or data[12:16]!=b'IHDR':
        raise ValueError('Le visuel généré n’est pas un PNG valide')
    return int.from_bytes(data[16:20],'big'),int.from_bytes(data[20:24],'big')


def webp_dimensions(data: bytes) -> tuple[int,int]:
    if len(data)<20 or data[:4]!=b'RIFF' or data[8:12]!=b'WEBP':
        raise ValueError('Le visuel généré n’est pas un WebP valide')
    offset=12
    while offset+8<=len(data):
        chunk=data[offset:offset+4]
        size=int.from_bytes(data[offset+4:offset+8],'little')
        payload=data[offset+8:offset+8+size]
        if len(payload)<size:
            break
        if chunk==b'VP8X' and len(payload)>=10:
            width=1+int.from_bytes(payload[4:7],'little')
            height=1+int.from_bytes(payload[7:10],'little')
            return width,height
        if chunk==b'VP8L' and len(payload)>=5 and payload[0]==0x2F:
            bits=int.from_bytes(payload[1:5],'little')
            width=(bits&0x3FFF)+1
            height=((bits>>14)&0x3FFF)+1
            return width,height
        if chunk==b'VP8 ' and len(payload)>=10 and payload[3:6]==b'\x9d\x01\x2a':
            width=int.from_bytes(payload[6:8],'little')&0x3FFF
            height=int.from_bytes(payload[8:10],'little')&0x3FFF
            return width,height
        offset+=8+size+(size&1)
    raise ValueError('Dimensions du visuel WebP illisibles')


def main() -> None:
    item_type=(sys.argv[1] if len(sys.argv)>1 else '').strip().lower()
    if item_type not in {'product','dish'}:
        raise SystemExit('Type de visuel attendu: product ou dish')
    try:
        data=json.loads(RESULT_PATH.read_text(encoding='utf-8'))
    except Exception as error:
        raise RuntimeError(f'Résultat d’intégration illisible: {error}') from error
    if data.get('already_exists') is True:
        return
    filename=str(data.get('filename') or '').strip()
    if not filename:
        save_failure(data,'Aucun nom de fichier image n’a été produit')
    path=ROOT / ('www/Items' if item_type=='product' else 'www/Plats') / filename
    if not path.is_file():
        save_failure(data,f'Image générée introuvable: {filename}')
    image=path.read_bytes()
    try:
        if item_type=='product':
            width,height=webp_dimensions(image)
            expected=(1024,1024)
            if path.suffix.lower()!='.webp':
                raise ValueError('Le visuel produit doit être enregistré en WebP')
        else:
            width,height=png_dimensions(image)
            expected=(1536,1024)
            if path.suffix.lower()!='.png':
                raise ValueError('Le visuel du plat doit être enregistré en PNG')
    except ValueError as error:
        save_failure(data,str(error))
    if (width,height)!=expected:
        label='produit' if item_type=='product' else 'plat'
        save_failure(data,f'Dimensions du visuel {label} invalides: {width}×{height} (attendu {expected[0]}×{expected[1]})')


if __name__=='__main__':
    try:
        main()
    except Exception as error:
        if not RESULT_PATH.exists():
            RESULT_PATH.write_text(json.dumps({'ok':False,'error':str(error)},ensure_ascii=False,indent=2),encoding='utf-8')
        print(str(error),file=sys.stderr)
        sys.exit(1)
