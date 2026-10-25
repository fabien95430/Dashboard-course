#!/usr/bin/env python3
"""Temporary batch optimizer for oversized local product images (not shipped)."""
from __future__ import annotations
from PIL import Image, ImageChops, ImageStat
from pathlib import Path
from io import BytesIO
import json
import math

ROOT = Path("www/Items")
THRESHOLD = 100 * 1024
TARGET = 70 * 1024
MAXIMUM = 85 * 1024
EXPECTED = 32
DISPLAY = 192
BACKGROUNDS = ((255,255,255,255),(233,240,231,255))

def composite_preview(im, background):
    im = im.convert("RGBA")
    im = im.resize((DISPLAY, DISPLAY), Image.Resampling.LANCZOS)
    return Image.alpha_composite(Image.new("RGBA",(DISPLAY,DISPLAY),background), im).convert("RGB")

def error(original, candidate):
    differences = []
    for background in BACKGROUNDS:
        a = composite_preview(original,background)
        b = composite_preview(candidate,background)
        differences.append(sum(ImageStat.Stat(ImageChops.difference(a,b)).rms)/3)
    return max(differences)

files = sorted(p for p in ROOT.glob("*.webp") if p.stat().st_size > THRESHOLD)
if len(files) != EXPECTED:
    raise RuntimeError(f"Expected {EXPECTED} heavy files, found {len(files)}: {[p.name for p in files]}")
staged = {}
details = []
for path in files:
    with Image.open(path) as raw:
        original = raw.convert("RGBA")
    orig_size = path.stat().st_size
    original_min_alpha, original_max_alpha = original.getchannel("A").getextrema()
    width,height = original.size
    if width < DISPLAY or height < DISPLAY:
        raise RuntimeError(f"Unexpectedly small original {path.name}: {original.size}")
    chosen = None
    for side in (512,448,384):
        if chosen is not None: break
        scale = min(1.0, side/max(width,height))
        out_size=(max(1,round(width*scale)),max(1,round(height*scale)))
        resized=original.resize(out_size,Image.Resampling.LANCZOS) if out_size!=original.size else original
        for quality in (90,86,82,78,74,70,66):
            buf=BytesIO()
            resized.save(buf,format="WEBP",quality=quality,method=6)
            content=buf.getvalue()
            if len(content)>TARGET:continue
            with Image.open(BytesIO(content)) as temp:
                candidate=temp.convert("RGBA")
            rms=error(original,candidate)
            if rms>18:continue
            if (original_min_alpha<255) and candidate.getchannel("A").getextrema()[0]==255:
                continue
            chosen=(content,out_size,quality,rms)
            break
    if chosen is None:
        # Less aggressive safety ceiling; never reduce fidelity just to force a tiny byte count.
        for side in (512,448,384):
            if chosen is not None:break
            scale=min(1.0,side/max(width,height))
            out_size=(max(1,round(width*scale)),max(1,round(height*scale)))
            resized=original.resize(out_size,Image.Resampling.LANCZOS) if out_size!=original.size else original
            for quality in (86,82,78,74,70):
                buf=BytesIO()
                resized.save(buf,format="WEBP",quality=quality,method=6)
                content=buf.getvalue()
                if len(content)>MAXIMUM:continue
                with Image.open(BytesIO(content)) as temp:
                    candidate=temp.convert("RGBA")
                rms=error(original,candidate)
                if rms>18:continue
                chosen=(content,out_size,quality,rms)
                break
    if chosen is None:
        raise RuntimeError(f"No acceptable compression for {path.name}, will not degrade image")
    content,output_size,quality,rms=chosen
    if len(content)>=orig_size or len(content)>MAXIMUM:
        raise RuntimeError(f"Invalid result for {path.name}: {orig_size} -> {len(content)}")
    staged[path]=content
    details.append({"name":path.name,"originalKB":round(orig_size/1024,1),"finalKB":round(len(content)/1024,1),"dimensions":output_size,"quality":quality,"rms192":round(rms,2)})
for path,content in staged.items():
    path.write_bytes(content)
print(json.dumps({"status":"ok","optimized":len(staged),"originalMB":round(sum(d["originalKB"] for d in details)/1024,2),"finalMB":round(sum(d["finalKB"] for d in details)/1024,2),"files":details},ensure_ascii=False,indent=2))
