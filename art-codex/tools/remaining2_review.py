#!/usr/bin/env python3
"""Inspect batch-two icon readability at the actual 20px interface size."""
from PIL import Image,ImageDraw
from prepare_generated import OUT
files=sorted((OUT/'ui/icons').glob('*.png'))
sheet=Image.new('RGB',(800,((len(files)+7)//8)*120),'#3d3f45')
draw=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
    small=Image.open(p).convert('RGBA').resize((20,20),Image.Resampling.LANCZOS)
    zoom=small.resize((80,80),Image.Resampling.NEAREST)
    x,y=(i%8)*100,(i//8)*120
    sheet.paste(zoom,(x+10,y+4),zoom)
    draw.text((x+4,y+90),p.stem,fill='white')
sheet.save(OUT/'contact-icons-20px.png')
