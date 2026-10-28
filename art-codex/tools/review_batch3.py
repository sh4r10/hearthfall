#!/usr/bin/env python3
"""Write scale comparisons and animation previews for the Batch 3 art review."""
from pathlib import Path
import json
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


def buildings():
    specs = json.loads((OUT.parent/'assets.json').read_text())['assets']
    rows = [a for a in specs if a['batch'] == 3 and a['id'].startswith('building-') and 'ladder' not in a['id'] and (OUT.parent.parent/a['path']).exists()]
    sheet = Image.new('RGB',(5*200,((len(rows)+4)//5)*220),'#3d3f45')
    draw = ImageDraw.Draw(sheet)
    for i,a in enumerate(rows):
        im = Image.open(OUT.parent.parent/a['path']).convert('RGBA')
        im.thumbnail((192,192),Image.Resampling.LANCZOS)
        x,y=(i%5)*200,(i//5)*220
        sheet.paste(im,(x+(192-im.width)//2,y+192-im.height),im)
        draw.text((x+4,y+198),a['id'][9:],fill='white')
    sheet.save(OUT/'contact-batch3-buildings.png')


def creatures():
    specs = json.loads((OUT.parent/'assets.json').read_text())['assets']
    rows = [a for a in specs if a['batch']==3 and (a['id'].startswith('creature-') or a['id']=='refugee') and (OUT.parent.parent/a['path']).exists()]
    sheet = Image.new('RGB',(1000,len(rows)*190),'#3d3f45')
    draw = ImageDraw.Draw(sheet)
    for row,a in enumerate(rows):
        path = OUT.parent.parent/a['path']
        strip = Image.open(path).convert('RGBA')
        frames = []
        for i in range(a['frames']):
            cell = strip.crop((i*a['width'],0,(i+1)*a['width'],a['height']))
            preview = Image.new('RGBA',cell.size,(61,63,69,255))
            preview.alpha_composite(cell)
            frames.append(preview.convert('RGB'))
            cell.thumbnail((192,160),Image.Resampling.LANCZOS)
            sheet.paste(cell,(i*200+(192-cell.width)//2,row*190+160-cell.height),cell)
        draw.text((4,row*190+166),a['id'],fill='white')
        loop = {'loop':0} if path.stem in ('crawl','latch','feed','dig','idle') else {}
        frames[0].save(path.with_suffix('.gif'),save_all=True,append_images=frames[1:],duration=166,**loop)
    sheet.save(OUT/'contact-batch3-creatures.png')


if __name__ == '__main__':
    comparison('eat')
    comparison('collapse', ('esk','mara','ostra','pim','ruta'))
    comparison('dead', ('esk','mara'))
    icons()
    buildings()
    creatures()
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
