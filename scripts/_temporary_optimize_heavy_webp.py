#!/usr/bin/env python3
"""Conservative one-time WebP optimization preserving catalogue visuals."""
import hashlib, io, json, math, re, unicodedata
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
ROOT=Path(__file__).resolve().parents[1]
ITEMS=ROOT/"www"/"Items"
TARGETS=("bolognaise","romarin-frais","fenouil","coriandre","menthe","kiwis","grenade","betteraves","pain","radis","roquette","prunes","persil","mures","chou-rouge","gingembre")
BACKGROUNDS=((255,255,255),(231,238,230))
def slugify(name):
    name=name.lower().replace("œ","oe")
    name="".join(c for c in unicodedata.normalize("NFD",name) if unicodedata.category(c)!="Mn")
    return re.sub(r"^-+|-+$","",re.sub(r"[^a-z0-9]+","-",name))
def psnr192(a,b,color):
    def thumb(im):
        bg=Image.new("RGBA",im.size,color+(255,))
        return Image.alpha_composite(bg,im).convert("RGB").resize((192,192),Image.Resampling.LANCZOS)
    rms=ImageStat.Stat(ImageChops.difference(thumb(a),thumb(b))).rms
    n=math.sqrt(sum(x*x for x in rms)/3)
    return float("inf") if n==0 else 20*math.log10(255/n)
def replace(path,old,new,n=1):
    file=ROOT/path; s=file.read_text(encoding="utf-8")
    if s.count(old)!=n: raise RuntimeError(f"Unexpected baseline {path}: {old}")
    file.write_text(s.replace(old,new),encoding="utf-8")
def main():
    catalog=(ROOT/"catalog.js").read_text(encoding="utf-8")
    line=next((s for s in catalog.splitlines() if s.strip().startswith("groups: ")),None)
    if not line or not line.strip().endswith(","): raise RuntimeError("Unexpected catalog.js structure")
    groups=json.loads(line.split("groups: ",1)[1].strip().removesuffix(","))
    slugs={slugify(name) for subs in groups.values() for names in subs.values() for name in names}
    if not set(TARGETS).issubset(slugs): raise RuntimeError("Not all image slugs are active catalogue entries")
    rows=[]
    for slug in TARGETS:
        path=ITEMS/f"{slug}.webp"; old=path.read_bytes()
        with Image.open(io.BytesIO(old)) as img:
            if img.format!="WEBP": raise RuntimeError(f"Not WebP: {slug}")
            src=img.convert("RGBA"); dims=img.size
        if len(old)<=70000: raise RuntimeError(f"Image size unexpectedly changed: {slug}")
        best=None
        for q in (95,93,90,88,85,82):
            buf=io.BytesIO(); src.save(buf,format="WEBP",quality=q,method=6,exact=True)
            data=buf.getvalue()
            if len(data)>=min(len(old)*.80,len(old)-6000): continue
            with Image.open(io.BytesIO(data)) as dec:
                if dec.size!=dims or dec.format!="WEBP": raise RuntimeError("Format/dimensions mismatch")
                dst=dec.convert("RGBA")
            if ImageChops.difference(src.getchannel("A"),dst.getchannel("A")).getbbox(): continue
            score=min(psnr192(src,dst,bg) for bg in BACKGROUNDS)
            if score<40: continue
            if best is None or len(data)<len(best[0]): best=(data,q,score)
        if best is None:
            print(f"SKIP {slug}: {len(old)} bytes; no adequate quality/size gain",flush=True)
            continue
        new,q,score=best
        path.write_bytes(new)
        rows.append((slug,len(old),len(new),q,score,hashlib.sha256(old).hexdigest(),hashlib.sha256(new).hexdigest()))
        print(f"OK {slug}: {len(old)} -> {len(new)} bytes, q={q}, PSNR={score:.1f}",flush=True)
    if not rows: raise RuntimeError("No valid optimizations; do not publish")
    index=(ROOT/"index.html").read_text(encoding="utf-8")
    m=re.findall(r'<span class="page-version">v(\d+)</span>',index)
    if len(m)!=3 or len(set(m))!=1: raise RuntimeError(f"Unexpected version markers: {m}")
    n=int(m[0]); o=f"v{n}"; v=f"v{n+1}"
    replace("index.html",f'<span class="page-version">{o}</span>',f'<span class="page-version">{v}</span>',3)
    replace("index.html",f"./catalog.js?v={n}",f"./catalog.js?v={n+1}")
    replace("catalog.js",f"./dish-local-images.js?v={n}",f"./dish-local-images.js?v={n+1}")
    replace("dish-local-images.js",f"const APP_VERSION='{o}'",f"const APP_VERSION='{v}'")
    replace("sw.js",f"courses-app-{o}-r1",f"courses-app-{v}-r1")
    replace("sw.js",f"./catalog.js?v={n}",f"./catalog.js?v={n+1}")
    replace("sw.js",f"./dish-local-images.js?v={n}",f"./dish-local-images.js?v={n+1}")
    report=[
        f"# Optimisation prudente des WebP produits — {v}","",
        "Images actives provenant de catalog.js, sans création ni modification du produit.",
        "Les dimensions, le format WebP et la transparence pixel à pixel sont conservés.",
        "Comparaison à 192×192 sur fonds blanc et sauge : PSNR >= 40 dB.",
        "Économie minimale requise : 20 % et 6 000 octets. Sinon, image conservée.","",
        "| Slug | Avant (octets) | Après (octets) | Gain | Qualité | PSNR min (dB) | SHA-256 avant | SHA-256 après |",
        "|---|---:|---:|---:|---:|---:|---|---|"]
    for slug,bef,aft,q,score,sha1,sha2 in rows:
        report.append(f"| {slug} | {bef} | {aft} | {100*(1-aft/bef):.1f} % | {q} | {score:.1f} | {sha1} | {sha2} |")
    report+=["",f"**Bilan : {len(rows)} visuels, {sum(b-a for _,b,a,*_ in rows)} octets économisés.**",""]
    (ROOT/"docs"/f"IMAGE_OPTIMIZATION_{v.upper()}.md").write_text("\n".join(report),encoding="utf-8")
    print(f"UPDATED {len(rows)}/{len(TARGETS)} images, global version {o} -> {v}",flush=True)
if __name__=="__main__": main()
