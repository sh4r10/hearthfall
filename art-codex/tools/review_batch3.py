#!/usr/bin/env python3
"""Write scale comparisons and animation previews for the Batch 3 art review."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1]/'out'
NAMES = ('esk', 'mara', 'tobin', 'ostra', 'pim', 'ruta')


def comparison(pose, names=NAMES):
    n = 4 if pose == 'collapse' else 3 if pose == 'eat' else 1
    sheet = Image.new('RGBA', ((n+1)*320, len(names)*320), (100,100,100,255))
    draw = ImageDraw.Draw(sheet)
    for row, name in enumerate(names):
        folder = OUT/'characters'/name
        idle = Image.open(folder/'anim/idle.png').convert('RGBA').crop((0,0,320,320))
        strip = Image.open(folder/'poses'/f'{pose}.png').convert('RGBA')
        sheet.alpha_composite(idle, (0,row*320))
        sheet.alpha_composite(strip, (320,row*320))
        draw.text((5,row*320+5), f'{name}: idle / {pose}', fill='white')
    sheet.convert('RGB').save(OUT/f'contact-batch3-{pose}.png')


def icons():
    names = ('coal', 'food', 'survivors', 'hearth')
    sheet = Image.new('RGB', (320,128), '#33291f')
    draw = ImageDraw.Draw(sheet)
    for i,name in enumerate(names):
        icon = Image.open(OUT/'ui/icons'/f'{name}.png').convert('RGBA')
        tiny = icon.resize((20,20),Image.Resampling.LANCZOS)
        sheet.paste(tiny, (i*80+30,30),tiny)
        draw.text((i*80+8,65),name,fill='white')
    sheet.save(OUT/'contact-batch3-icons-20px.png')


if __name__ == '__main__':
    comparison('eat')
    comparison('collapse', ('esk','mara','ostra','pim','ruta'))
    comparison('dead', ('esk','mara'))
    icons()
