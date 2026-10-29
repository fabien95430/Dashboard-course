#!/usr/bin/env python3
"""Single use: red Coca bottle matching existing Zero silhouette; no other catalogue change."""
from PIL import Image, ImageChops
from pathlib import Path

items=Path('www/Items')
with Image.open(items/'coca-zero.webp') as file:
    assert file.format=='WEBP' and file.size==(256,256)
    original=file.convert('RGBA')
red=original.copy()
pixels=red.load()

for y in range(256):
    for x in range(256):
        r,g,b,a=pixels[x,y]
        if a<10: continue
        light=(r*25+g*68+b*7)//100
        if 17<=y<=39 and 106<=x<=149:
            # Red cap preserving specular highlights and exact alpha.
            if light>221: continue
            pixels[x,y]=(min(255,140+light),min(100,10+light//5),min(98,14+light//7),a)
        if 112<=y<=161 and 89<=x<=169:
            # Dark label -> red, preserving 'Coca-Cola' original white script.
            if y<=141 and light>=174 and max(r,g,b)-min(r,g,b)<52:
                continue
            # Erase the unwanted zero typography under the classic logo.
            if 142<=y<=156 and 107<=x<=156:
                edge=abs(x-132)/48
                pixels[x,y]=(int(202-21*edge),int(13-4*edge),int(20-6*edge),a)
                continue
            # Bright, dimensional red based on the original label's lighting.
            edge=abs(x-129)/45
            rr=max(130,min(255,int(180+light*.30-18*edge)))
            gg=min(65,int(10+light*.06))
            bb=min(71,int(15+light*.07))
            pixels[x,y]=(rr,gg,bb,a)

assert ImageChops.difference(original.getchannel('A'),red.getchannel('A')).getbbox() is None
path=items/'coca.webp'
red.save(path,'WEBP',quality=83,method=6,exact=True)
with Image.open(path) as im:
    assert im.format=='WEBP' and im.size==(256,256)
    assert ImageChops.difference(im.convert('RGBA').getchannel('A'),original.getchannel('A')).getbbox() is None
assert path.stat().st_size<24000
print('coca-red-variant bytes',path.stat().st_size,flush=True)
