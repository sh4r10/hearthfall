#!/usr/bin/env python3
"""Show every decoded GIF frame in order, with the saved frame timing."""
from PIL import Image, ImageDraw, ImageSequence
from prepare_generated import OUT

for name in ('esk','mara'):
    files=sorted((OUT/'characters'/name/'anim').glob('*.gif'))
    if not files:
        continue
    sheet=Image.new('RGB',(960,len(files)*180),'#888888')
    draw=ImageDraw.Draw(sheet)
    for row,path in enumerate(files):
        gif=Image.open(path)
        for col,frame in enumerate(ImageSequence.Iterator(gif)):
            # Iterator frames share their backing image: copy immediately.
            thumb=frame.convert('RGB').resize((160,160),Image.Resampling.LANCZOS)
            sheet.paste(thumb,(col*160,row*180+20))
        draw.text((4,row*180+3),f'{path.stem} ({gif.info.get("duration",0)} ms/frame)',fill='black')
    sheet.save(OUT/f'contact-animations-{name}.png')
