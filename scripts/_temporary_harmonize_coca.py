#!/usr/bin/env python3
"""One-shot recolour of Coca Zero's existing bottle to Coca classic, preserving its silhouette."""
from PIL import Image, ImageChops
from pathlib import Path
import io, hashlib

items=Path('www/Items')
zero_path=items/'coca-zero.webp'
out_path=items/'coca.webp'
with Image.open(zero_path) as src:
    assert src.format=='WEBP' and src.size==(256,256)
    original=src.convert('RGBA')
    result=original.copy()

pix=result.load()
for y in range(256):
    for x in range(256):
        r,g,b,a=pix[x,y]
        if a<10:
            continue
        # Exact same bottle, now with Coca's red cap.
        if 16<=y<=39 and 104<=x<=151:
            lum=int(.22*r+.70*g+.08*b)
            if lum>213 and (y>=36 or x<108 or x>148):
                continue  # retain bright metal / glass glints
            rr=min(255,int(148+lum*.68))
            gg=min(95,int(12+lum*.19))
            bb=min(94,int(22+lum*.13))
            pix[x,y]=(rr,gg,bb,a)
        # Change the existing Coca Zero black label to Coca red; retain the white original script.
        elif 130<=y<=183 and 91<=x<=166:
            lum=int(.26*r+.67*g+.07*b)
            if y<=164 and lum>=178 and abs(r-g)<37 and abs(g-b)<45:
                continue  # original light lettering preserved
            # Remove the little 'zero' word completely from the lower label band.
            if y>=165:
                # Slightly shaded red follows bottle's cylindrical shape, no lettering.
                falloff=abs(x-129)/40.0
                rr=max(110,int(207-36*falloff))
                gg=max(4,int(13-5*falloff))
                bb=max(8,int(23-7*falloff))
            else:
                rr=min(246,int(154+lum*.58))
                gg=min(65,int(9+lum*.11))
                bb=min(74,int(21+lum*.10))
            pix[x,y]=(rr,gg,bb,a)

assert ImageChops.difference(original.getchannel('A'),result.getchannel('A')).getbbox() is None
assert result.size == (256,256)
assert result.getpixel((0,0))[3]==0 and result.getpixel((255,255))[3]==0
result.save(out_path,'WEBP',quality=83,method=6,exact=True)
with Image.open(out_path) as check:
    assert check.format=='WEBP' and check.size==(256,256)
    decoded=check.convert('RGBA')
assert ImageChops.difference(original.getchannel('A'),decoded.getchannel('A')).getbbox() is None
assert out_path.stat().st_size <= 24000
print('COCA_OK',out_path.stat().st_size,'bytes',hashlib.sha256(out_path.read_bytes()).hexdigest(),flush=True)
