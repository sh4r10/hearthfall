#!/usr/bin/env python3
"""Register batch-two generated survivor sheets to the unchanged shared rig."""
import argparse
import json
from pathlib import Path
from collections import deque
from PIL import Image, ImageDraw, ImageSequence
import numpy as np
from prepare_generated import ROOT, OUT, content, figure_cells, asset
from check_art import stack_view

def clean(im):
    # The generator may leave extremely faint colour outside the cutout.
    a=np.array(im.convert('RGBA'))
    a[a[:,:,3]<16]=0
    return Image.fromarray(a)

def parts(src,name,view):
    im=clean(Image.open(src))
    names=['head','torso','scarf','arm-front','arm-back','leg-front','leg-back'] if view=='side' else ['head','torso','arm-left','arm-right','leg-left','leg-right']
    cols=4 if view=='side' else 3
    rig=json.loads((ROOT/'rig.json').read_text())['views'][view]['parts']
    mask=np.array(im.getchannel('A').resize((im.width//4,im.height//4)))>=128
    islands=[]
    for y,x in zip(*np.where(mask)):
        if not mask[y,x]:continue
        q=deque([(y,x)]);mask[y,x]=False;points=[]
        while q:
            cy,cx=q.popleft();points.append((cx,cy))
            for ny,nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                if 0<=ny<mask.shape[0] and 0<=nx<mask.shape[1] and mask[ny,nx]:mask[ny,nx]=False;q.append((ny,nx))
        if len(points)>mask.size*.0005:
            xy=np.array(points);islands.append((len(points),(max(0,int(xy[:,0].min()*4-4)),max(0,int(xy[:,1].min()*4-4)),min(im.width,int((xy[:,0].max()+1)*4+4)),min(im.height,int((xy[:,1].max()+1)*4+4)))))
    islands=sorted(islands,reverse=True)[:len(names)]
    upper=sorted([b for _,b in islands if (b[1]+b[3])/2<im.height/2],key=lambda b:b[0])
    lower=sorted([b for _,b in islands if (b[1]+b[3])/2>=im.height/2],key=lambda b:b[0])
    boxes=upper+lower
    if len(boxes)!=len(names) or len(upper)!=cols:raise ValueError(f'{name} {view}: cannot isolate parts {boxes}')
    for i,part in enumerate(names):
        col=i%cols; row=i//cols
        cell=content(im.crop(boxes[i]))
        px,py=rig[part]['pivot']
        if part=='head': box=(px-55,54,px+55,189)
        elif part=='torso':
            half=60 if name=='tobin' and view!='side' else 43
            box=(px-half,160,px+half,263)
        elif part=='scarf': box=(125,164,153,224)
        elif part.startswith('arm'): box=(px-14,py-14,px+16,250)
        elif name=='tobin': box=(px-(16 if view=='side' else 20),py-14,px+(34 if view=='side' else 22),305)
        else: box=(px-13,py-14,px+(26 if view=='side' else 15),305)
        cell=cell.resize((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
        dst=Image.new('RGBA',(320,320));dst.alpha_composite(cell,box[:2])
        path=OUT/'characters'/name/view/f'{part}.png';path.parent.mkdir(parents=True,exist_ok=True);dst.save(path)

def turnaround(src,name):
    im=clean(Image.open(src)); out=Image.new('RGBA',(960,320))
    cells=figure_cells(im,3)
    for i,cell in enumerate(cells):
        cell=cell.resize((round(cell.width*250/cell.height),250),Image.Resampling.LANCZOS)
        out.alpha_composite(cell,(i*320+160-cell.width//2,55))
    path=OUT/'characters'/name/'turnaround.png';path.parent.mkdir(parents=True,exist_ok=True);out.save(path)

def restack(name):
    rig=json.loads((ROOT/'rig.json').read_text()); im=Image.new('RGBA',(960,320))
    for i,v in enumerate(('front','side','back')): im.alpha_composite(stack_view(OUT,name,v,rig),(i*320,0))
    im.save(OUT/'characters'/name/'turnaround.png')

def review(name):
    files=sorted((OUT/'characters'/name/'anim').glob('*.gif'))
    sheet=Image.new('RGB',(960,len(files)*180),'#888888');d=ImageDraw.Draw(sheet)
    for row,p in enumerate(files):
        g=Image.open(p)
        for col,f in enumerate(ImageSequence.Iterator(g)): sheet.paste(f.convert('RGB').resize((160,160)),(col*160,row*180+20))
        d.text((4,row*180+3),p.stem,fill='black')
    sheet.save(OUT/f'contact-animations-{name}.png')

def ready():
    specs=json.loads((ROOT/'assets.json').read_text())['assets']
    for a in specs:
        if a.get('character') not in ('tobin','ostra','pim','ruta') or a['kind'] not in ('pose','sprite'): continue
        p=OUT/'provenance'/f"{a['id']}.json"
        dst=ROOT.parent/a['path']
        if p.exists() and not dst.exists():
            source=json.loads(p.read_text())['path']
            if a['id'].endswith('-pose-dead'):
                last=Image.open(OUT/'characters'/a['character']/'poses/collapse.png').convert('RGBA').crop((960,0,1280,320))
                b=last.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
                cell=content(clean(Image.open(source))).resize((b[2]-b[0],b[3]-b[1]),Image.Resampling.LANCZOS)
                out=Image.new('RGBA',(320,320));out.alpha_composite(cell,b[:2]);out.save(dst)
            else:asset(source,a)
            print(a['id'])

def torsofix(name):
    shared=OUT/'provenance'/f'{name}-torso-fix.json'
    for i,view in enumerate(('front','side','back')):
        p=OUT/'provenance'/f'{name}-{view}-torso-fix.json'
        if p.exists():cell=content(clean(Image.open(json.loads(p.read_text())['path'])))
        elif shared.exists():cell=figure_cells(clean(Image.open(json.loads(shared.read_text())['path'])),3)[i]
        else:continue
        half=60 if name=='tobin' and view!='side' else 43
        cell=cell.resize((half*2,103),Image.Resampling.LANCZOS)
        dst=Image.new('RGBA',(320,320));dst.alpha_composite(cell,(160-half,160));dst.save(OUT/'characters'/name/view/'torso.png')

def blink(group):
    rows={'a':[('tobin','front',[(142,107,156,123),(165,107,179,123)]),('tobin','side',[(186,107,199,124)]),('ostra','front',[(139,116,153,126),(169,116,184,126)]),('ostra','side',[(191,115,202,125)])],
          'b':[('pim','front',[(139,121,153,142),(167,121,181,142)]),('pim','side',[(182,119,195,138)]),('ruta','front',[(140,114,153,131),(168,114,180,131)]),('ruta','side',[(188,124,200,143)])]}
    source=json.loads((OUT/'provenance'/f'characters2-blinks-{group}.json').read_text())['path']
    cells=figure_cells(clean(Image.open(source)),4)
    for cell,(name,view,eyes) in zip(cells,rows[group]):
        p=OUT/'characters'/name/view
        original=Image.open(p/'head.png').convert('RGBA')
        bbox=original.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
        cell=cell.resize((bbox[2]-bbox[0],bbox[3]-bbox[1]),Image.Resampling.LANCZOS)
        registered=Image.new('RGBA',(320,320));registered.alpha_composite(cell,bbox[:2]);out=original.copy()
        for eye in eyes:out.paste(registered.crop(eye),eye[:2])
        out.save(p/'head-blink.png')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode');p.add_argument('name');p.add_argument('source',nargs='?');p.add_argument('view',nargs='?');a=p.parse_args()
    if a.mode=='turnaround':turnaround(a.source,a.name)
    elif a.mode=='parts':parts(a.source,a.name,a.view)
    elif a.mode=='restack':restack(a.name)
    elif a.mode=='review':review(a.name)
    elif a.mode=='ready':ready()
    elif a.mode=='torsofix':torsofix(a.name)
    elif a.mode=='blink':blink(a.name)
