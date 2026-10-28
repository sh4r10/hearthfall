#!/usr/bin/env python3
"""Register generated Mara neck replacements and batch-two UI/creature art."""
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image
from prepare_generated import ROOT,OUT,content,fit,asset
from check_art import stack_view

def mara(src):
    sheet=Image.open(src).convert('RGBA')
    for i,view in enumerate(('front','side','back')):
        cell=content(sheet.crop((i*sheet.width//3,0,(i+1)*sheet.width//3,sheet.height)))
        # The collar base sits above the braid tip; register that base at y188.
        cell=cell.resize((110,150),Image.Resampling.LANCZOS)
        head=Image.new('RGBA',(320,320));head.alpha_composite(cell,(107 if view=='side' else 105,54))
        p=OUT/'characters/mara'/view
        head.save(p/'head.png')
    rig=json.loads((ROOT/'rig.json').read_text())
    turn=Image.new('RGBA',(960,320))
    for i,v in enumerate(('front','side','back')):turn.alpha_composite(stack_view(OUT,'mara',v,rig),(i*320,0))
    turn.save(OUT/'characters/mara/turnaround.png')

def esk(src):
    sheet=Image.open(src).convert('RGBA')
    for i,view in enumerate(('front','side','back')):
        cell=content(sheet.crop((i*sheet.width//3,0,(i+1)*sheet.width//3,sheet.height)))
        cell=cell.resize((110,135),Image.Resampling.LANCZOS)
        head=Image.new('RGBA',(320,320));head.alpha_composite(cell,(107 if view=='side' else 105,54))
        head.save(OUT/'characters/esk'/view/'head.png')
    rig=json.loads((ROOT/'rig.json').read_text())
    turn=Image.new('RGBA',(960,320))
    for i,v in enumerate(('front','side','back')):turn.alpha_composite(stack_view(OUT,'esk',v,rig),(i*320,0))
    turn.save(OUT/'characters/esk/turnaround.png')

def icon(src,id):
    im=Image.open(src).convert('RGBA')
    im=content(im)
    im=fit(im,(96,96))
    ar=np.array(im);ar[:,:,:3]=255
    out=Image.new('RGBA',(128,128));out.alpha_composite(Image.fromarray(ar),(16,16))
    p=OUT/'ui/icons'/f'{id.removeprefix("icon-")}.png';p.parent.mkdir(parents=True,exist_ok=True);out.save(p)

def blinks(src):
    sheet=Image.open(src).convert('RGBA')
    for i,(view,rects) in enumerate((('front',[(144,119,159,135),(172,119,187,135)]),('side',[(181,118,196,135)]))):
        path=OUT/'characters/mara'/view
        edit=content(sheet.crop((i*sheet.width//3,0,(i+1)*sheet.width//3,sheet.height))).resize((110,150),Image.Resampling.LANCZOS)
        registered=Image.new('RGBA',(320,320));registered.alpha_composite(edit,(107 if view=='side' else 105,54))
        head=Image.open(path/'head.png').convert('RGBA')
        for box in rects:head.paste(registered.crop(box),box[:2])
        head.save(path/'head-blink.png')

def shade(src,id):
    sheet=Image.open(src).convert('RGBA')
    # Broad thrust arms cross the model's approximate thirds; isolate complete figures.
    fractions={'drift':[0,.25,.5,.75,1], 'lunge':[0,.28,.74,1], 'recoil':[0,.29,.65,1]}[id]
    out=Image.new('RGBA',(320*(len(fractions)-1),320))
    for i,(l,r) in enumerate(zip(fractions,fractions[1:])):
        cell=content(sheet.crop((round(l*sheet.width),0,round(r*sheet.width),sheet.height)))
        # Shared source-pixel scale across every frame/animation retains body scale.
        cell=cell.resize((round(cell.width*.34),round(cell.height*.34)),Image.Resampling.LANCZOS)
        out.alpha_composite(cell,(i*320+(320-cell.width)//2,318-cell.height))
    path=OUT/'creatures/shade'/f'{id}.png';path.parent.mkdir(parents=True,exist_ok=True);out.save(path)

def eskblinks(src):
    sheet=Image.open(src).convert('RGBA')
    for i,(view,rects) in enumerate((('front',[(141,120,155,134),(168,120,182,134)]),('side',[(190,119,204,133)]))):
        path=OUT/'characters/esk'/view
        edit=content(sheet.crop((i*sheet.width//3,0,(i+1)*sheet.width//3,sheet.height))).resize((110,135),Image.Resampling.LANCZOS)
        registered=Image.new('RGBA',(320,320));registered.alpha_composite(edit,(107 if view=='side' else 105,54))
        head=Image.open(path/'head.png').convert('RGBA')
        for box in rects:head.paste(registered.crop(box),box[:2])
        head.save(path/'head-blink.png')

if __name__=='__main__':
    mode,src,*args=sys.argv[1:]
    if mode=='mara':mara(src)
    elif mode=='esk':esk(src)
    elif mode=='eskblinks':eskblinks(src)
    elif mode=='blinks':blinks(src)
    elif mode=='shade':shade(src,args[0])
    elif mode=='icon':icon(src,args[0])
    else:
        specs=json.loads((ROOT/'assets.json').read_text())['assets']
        asset(src,next(a for a in specs if a['id']==args[0]))
