from PIL import Image, ImageDraw
from pathlib import Path
import io,json
root=Path('.whisky-transfer')
image=Image.open(root/'whisky.png').convert('RGBA').resize((256,256),Image.Resampling.LANCZOS)
alpha=image.getchannel('A')
assert alpha.getextrema()==(0,255),'missing alpha'
bbox=alpha.point(lambda v:255 if v>=24 else 0).getbbox()
assert bbox and min(bbox[0],bbox[1],256-bbox[2],256-bbox[3])>=3,bbox
ratio=(bbox[3]-bbox[1])/(bbox[2]-bbox[0])
assert 1.8<=ratio<=2.8,ratio
encoded=None
for quality in (94,90,86,82,78,74,70,66,62,58,54,50,46,42,38,34):
    b=io.BytesIO()
    image.save(b,format='WEBP',quality=quality,method=6,alpha_quality=100,exact=True)
    if len(b.getvalue())<=15000:
        encoded=b.getvalue()
        break
assert encoded is not None,'over 15000 bytes'
Path('www/Items/whisky.webp').write_bytes(encoded)
decoded=Image.open(io.BytesIO(encoded)).convert('RGBA')
sheet=Image.new('RGB',(400,260),'#e9e9e9')
draw=ImageDraw.Draw(sheet)
draw.text((8,5),'Whisky validé - 192 et 48 px',fill='#161616')
for col,color in enumerate(('#ffffff','#1c1c1c')):
    tile=Image.new('RGBA',(192,192),color)
    tile.alpha_composite(decoded.resize((192,192),Image.Resampling.LANCZOS))
    sheet.paste(tile.convert('RGB'),(col*200+4,25))
    small=Image.new('RGBA',(48,48),color)
    small.alpha_composite(decoded.resize((48,48),Image.Resampling.LANCZOS))
    sheet.paste(small.convert('RGB'),(col*200+76,215))
sheet.save(root/'qa.png')
report=dict(bytes=len(encoded),quality=quality,bbox=bbox,heightWidthRatio=round(ratio,3))
(root/'report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
