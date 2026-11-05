from PIL import Image, ImageDraw
from pathlib import Path
import io, json
names=["jus-d-orange","jus-de-pomme","jus-d-ananas","jus-de-raisin","jus-de-tomate","jus-multifruits","jus-de-poire","biere-sans-alcool","rhum","ricard","tonic"]
root=Path('.juice-transfer')
report=[]
sheet=Image.new('RGB',(1200,1040),'#e9e9e9')
draw=ImageDraw.Draw(sheet)
for index,name in enumerate(names):
    source=Image.open(root/(name+'.png')).convert('RGBA')
    side=384 if name.startswith('jus-') and name!='jus-de-poire' else 256
    image=source.resize((side,side),Image.Resampling.LANCZOS)
    alpha=image.getchannel('A')
    assert alpha.getextrema()==(0,255),name+' alpha missing'
    bbox=alpha.point(lambda v:255 if v>=24 else 0).getbbox()
    assert bbox and min(bbox[0],bbox[1],side-bbox[2],side-bbox[3])>=3,(name,bbox)
    ratio=(bbox[3]-bbox[1])/(bbox[2]-bbox[0])
    assert (2.3<=ratio<=2.9 if name.startswith('jus-') else 1.8<=ratio<=4.5),(name,ratio)
    encoded=None
    for quality in (94,90,86,82,78,74,70,66,62,58,54,50,46,42,38,34):
        b=io.BytesIO()
        image.save(b,format='WEBP',quality=quality,method=6,alpha_quality=100,exact=True)
        if len(b.getvalue())<=15000:
            encoded=b.getvalue()
            break
    assert encoded is not None,name+' exceeds 15000 bytes'
    (Path('www/Items')/(name+'.webp')).write_bytes(encoded)
    decoded=Image.open(io.BytesIO(encoded)).convert('RGBA')
    report.append(dict(name=name,bytes=len(encoded),quality=quality,dimension=side,bbox=bbox,heightWidthRatio=round(ratio,3)))
    x=(index%3)*400
    y=(index//3)*260
    draw.text((x+8,y+5),name,fill='#161616')
    for col,color in enumerate(('#ffffff','#1c1c1c')):
        tile=Image.new('RGBA',(192,192),color)
        tile.alpha_composite(decoded.resize((192,192),Image.Resampling.LANCZOS))
        sheet.paste(tile.convert('RGB'),(x+col*200+4,y+25))
        small=Image.new('RGBA',(48,48),color)
        small.alpha_composite(decoded.resize((48,48),Image.Resampling.LANCZOS))
        sheet.paste(small.convert('RGB'),(x+col*200+76,y+215))
(root/'report.json').write_text(json.dumps(report,indent=2)+'\n')
sheet.save(root/'qa.png')
print(json.dumps(report))
