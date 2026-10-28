#!/usr/bin/env python3
"""Write scale comparisons and animation previews for the Batch 3 art review."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1]/'out'
NAMES = ('esk', 'mara', 'tobin', 'ostra', 'pim', 'ruta')


def comparison(pose, names=NAMES):
    n = Image.open(OUT/'characters'/names[0]/'poses'/f'{pose}.png').width//320
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
    for pose in ('climb-up','climb-down','ladder-on','ladder-off','research'):
        if all((OUT/'characters'/name/'poses'/f'{pose}.png').exists() for name in NAMES):
            comparison(pose)
            for name in NAMES:
                path = OUT/'characters'/name/'poses'/f'{pose}.png'
                strip = Image.open(path).convert('RGBA')
                frames = []
                for x in range(0,strip.width,320):
                    cell = Image.new('RGBA',(320,320),(100,100,100,255))
                    cell.alpha_composite(strip.crop((x,0,x+320,320)))
                    frames.append(cell.convert('RGB'))
                frames[0].save(path.with_suffix('.gif'),save_all=True,append_images=frames[1:],duration=166,loop=0)
