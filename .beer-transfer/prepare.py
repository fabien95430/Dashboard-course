from PIL import Image, ImageDraw
from pathlib import Path
import io, json
names=["biere-ambree","biere-aux-fruits","biere-blanche","biere-blonde","biere-brune","biere-ipa","biere-sans-alcool","biere-triple","panache","tonic","whisky","jus-de-poire","sirop-de-grenadine","sirop-de-menthe","sirop-de-peche"]
sizes={"tonic":[256,256],"whisky":[256,256],"jus-de-poire":[256,256],"sirop-de-grenadine":[384,384],"sirop-de-menthe":[384,384],"sirop-de-peche":[384,384]}
root=Path('.beer-transfer')
report=[]
sheet=Image.new('RGB',(1200,1300),'#e9e9e9')
draw=ImageDraw.Draw(sheet)
for index,name in enumerate(names):
    source=Image.open(root/(name+'.png')).convert('RGBA')
    image=source.resize(tuple(sizes.get(name,[256,256])),Image.Resampling.LANCZOS)
    side=image.width
    alpha=image.getchannel('A')
    assert alpha.getextrema()==(0,255),name+' alpha missing'
    bbox=alpha.point(lambda value:255 if value>=24 else 0).getbbox()
    assert bbox and min(bbox[0],bbox[1],side-bbox[2],side-bbox[3])>=3,(name,bbox)
    assert (bbox[2]-bbox[0])/(bbox[3]-bbox[1])>=(.28 if name.startswith('sirop-') else .35),(name,bbox)
    encoded=None
    for quality in (94,90,86,82,78,74,70,66,62,58,54,50,46,42,38,34):
        buffer=io.BytesIO()
        image.save(buffer,format='WEBP',quality=quality,method=6,alpha_quality=100,exact=True)
        if len(buffer.getvalue())<=15000:
            encoded=buffer.getvalue()
            break
    assert encoded is not None,name+' exceeds size limit'
    target=Path('www/Items')/(name+'.webp')
    target.write_bytes(encoded)
    decoded=Image.open(io.BytesIO(encoded)).convert('RGBA')
    report.append(dict(name=name,bytes=len(encoded),quality=quality,bbox=bbox,widthRatio=round((bbox[2]-bbox[0])/(bbox[3]-bbox[1]),3)))
    x=(index%3)*400
    y=(index//3)*260
    draw.text((x+8,y+5),name,fill='#161616')
    for column,color in enumerate(('#ffffff','#1c1c1c')):
        tile=Image.new('RGBA',(192,192),color)
        tile.alpha_composite(decoded.resize((192,192),Image.Resampling.LANCZOS))
        sheet.paste(tile.convert('RGB'),(x+column*200+4,y+25))
        small=Image.new('RGBA',(48,48),color)
        small.alpha_composite(decoded.resize((48,48),Image.Resampling.LANCZOS))
        sheet.paste(small.convert('RGB'),(x+column*200+76,y+215))
(root/'report.json').write_text(json.dumps(report,indent=2)+'\n')
sheet.save(root/'qa.png')
print(json.dumps(report))
