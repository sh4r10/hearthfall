#!/usr/bin/env python3
"""Register state edits and keep shared structural pixels from the first state."""
import json
import numpy as np
from PIL import Image
from prepare_generated import OUT, content


def source(id):
    p=json.loads((OUT/'provenance'/f'{id}.json').read_text())['path']
    return Image.open(p).convert('RGBA')


def diffuser():
    # The first generation supplied an unsolicited on/off pair. Use its cold
    # right-hand machine as the immutable structure for both delivered states.
    sheet=source('building-diffuser-off')
    left=sheet.crop((0,0,round(sheet.width*.52),sheet.height))
    right=sheet.crop((round(sheet.width*.51),0,sheet.width,sheet.height))
    rb=right.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    body=content(right)
    height=230
    width=round(body.width*height/body.height)
    body=body.resize((width,height),Image.Resampling.LANCZOS)
    x,y=(192-width)//2,318-height
    off=Image.new('RGBA',(192,320))
    off.alpha_composite(body,(x,y))
    on=off.copy()
    working=content(left.crop((0,rb[1],left.width,left.height)))
    lb=left.crop((0,rb[1],left.width,left.height)).getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    working=working.resize((width,height),Image.Resampling.LANCZOS)
    # The only changing solid regions: gauge needle and indicator.
    for box in ((.30,.36,.76,.64),(.39,.67,.67,.81)):
        b=(round(width*box[0]),round(height*box[1]),round(width*box[2]),round(height*box[3]))
        on.paste(working.crop(b),(x+b[0],y+b[1]))
    bubbles=left.crop((0,0,left.width,rb[1]))
    scale=height/(rb[3]-rb[1])
    bubbles=bubbles.resize((round(bubbles.width*scale),round(bubbles.height*scale)),Image.Resampling.LANCZOS)
    on.alpha_composite(bubbles,(x-round(lb[0]*scale),y-bubbles.height))
    off.save(OUT/'buildings/diffuser-off.png')
    on.save(OUT/'buildings/diffuser-on.png')


def mushrooms():
    base=Image.open(OUT/'buildings/mushroom-bed-seedling.png').convert('RGBA')
    # Plant growth stays above the front board. Its pixels are identical in
    # every state, including anti-aliased outside edges and ground contact.
    for state in ('growing','ready'):
        path=OUT/'buildings'/f'mushroom-bed-{state}.png'
        im=Image.open(path).convert('RGBA')
        im.paste(base.crop((0,100,384,160)),(0,100))
        im.save(path)


def stockpile():
    sheet=source('building-stockpile-empty')
    cells=[content(sheet.crop((i*sheet.width//3,0,(i+1)*sheet.width//3,sheet.height))) for i in range(3)]
    scale=120/max(c.height for c in cells)
    frames=[]
    for cell in cells:
        cell=cell.resize((368,round(cell.height*scale)),Image.Resampling.LANCZOS)
        im=Image.new('RGBA',(384,128))
        im.alpha_composite(cell,((384-cell.width)//2,126-cell.height))
        frames.append(im)
    for state,im in zip(('empty','half','full'),frames):
        im.paste(frames[0].crop((0,112,384,128)),(0,112))
        im.save(OUT/'buildings'/f'stockpile-{state}.png')


def lamp():
    on=np.array(Image.open(OUT/'buildings/lamp-on.png').convert('RGBA'))
    edit=np.array(Image.open(OUT/'buildings/lamp-off.png').convert('RGBA'))
    off=on.copy()
    yy,xx=np.indices(on.shape[:2])
    # Transfer generated cold glass, retaining the original dark cross-braces.
    mask=(xx>=116)&(xx<=156)&(yy>=115)&(yy<=170)&(on[:,:,0]>150)&(on[:,:,1]>115)&(on[:,:,2]<175)
    off[mask,:3]=edit[mask,:3]
    Image.fromarray(off).save(OUT/'buildings/lamp-off.png')


if __name__=='__main__':
    diffuser()
    mushrooms()
    stockpile()
    lamp()
