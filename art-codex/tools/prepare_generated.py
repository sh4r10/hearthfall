#!/usr/bin/env python3
"""Size generated art without painting replacements; preserve generation provenance."""
import argparse
from collections import deque
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'


def content(im):
    a = np.asarray(im.getchannel('A'))
    yy, xx = np.where(a >= 128)
    if not len(xx):
        raise ValueError('Empty generated cell')
    return im.crop((xx.min(), yy.min(), xx.max()+1, yy.max()+1))


def fit(im, size, bottom=None):
    im = content(im)
    w, h = size
    scale = min(w/im.width, h/im.height)
    im = im.resize((round(im.width*scale), round(im.height*scale)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (w,h))
    canvas.alpha_composite(im, ((w-im.width)//2, h-im.height if bottom else (h-im.height)//2))
    return canvas


def figure_cells(im, count):
    """Recover whole figures that cross the model's approximate cell lines."""
    factor=4
    mask=np.asarray(im.getchannel('A').resize((im.width//factor,im.height//factor)))>127
    components=[]
    for y,x in zip(*np.where(mask)):
        if not mask[y,x]:
            continue
        queue=deque([(y,x)])
        mask[y,x]=False
        points=[]
        while queue:
            cy,cx=queue.popleft()
            points.append((cx,cy))
            for ny,nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                if 0<=ny<mask.shape[0] and 0<=nx<mask.shape[1] and mask[ny,nx]:
                    mask[ny,nx]=False
                    queue.append((ny,nx))
        if len(points)>mask.size*.002:
            xy=np.array(points)
            box=(max(0,int(xy[:,0].min()*factor-3)),max(0,int(xy[:,1].min()*factor-3)),
                 min(im.width,int((xy[:,0].max()+1)*factor+3)),min(im.height,int((xy[:,1].max()+1)*factor+3)))
            components.append((len(points),box))
    if len(components)!=count:
        raise ValueError(f'Expected {count} complete figures; found {len(components)}')
    return [content(im.crop(b)) for _,b in sorted(components,key=lambda item:item[1][0])]


def turnaround(src, name):
    im = Image.open(src).convert('RGBA')
    out = Image.new('RGBA', (960,320))
    for i in range(3):
        cell = content(im.crop((i*im.width//3,0,(i+1)*im.width//3,im.height)))
        cell = cell.resize((round(cell.width*250/cell.height),250),Image.Resampling.LANCZOS)
        out.alpha_composite(cell,(i*320+160-cell.width//2,55))
    path = OUT/'characters'/name/'turnaround.png'
    path.parent.mkdir(parents=True,exist_ok=True)
    out.save(path)


def parts(src, name, view):
    im = Image.open(src).convert('RGBA')
    names = (['head','torso','scarf','arm-front','arm-back','leg-front','leg-back']
             if view == 'side' else ['head','torso','arm-left','arm-right','leg-left','leg-right'])
    cols = 4 if view == 'side' else 3
    rig = json.loads((ROOT/'rig.json').read_text())['views'][view]['parts']
    # Generated sheets have generous separation, but not exact grid registration.
    # Isolate alpha-connected islands before ordering them by row and column.
    factor=4
    mask=np.asarray(im.getchannel('A').resize((im.width//factor,im.height//factor)))>127
    components=[]
    for y,x in zip(*np.where(mask)):
        if not mask[y,x]:
            continue
        q=deque([(y,x)])
        mask[y,x]=False
        points=[]
        while q:
            cy,cx=q.popleft()
            points.append((cx,cy))
            for ny,nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                if 0<=ny<mask.shape[0] and 0<=nx<mask.shape[1] and mask[ny,nx]:
                    mask[ny,nx]=False
                    q.append((ny,nx))
        if len(points)>mask.size*.0004:
            xy=np.array(points)
            box=(max(0,int(xy[:,0].min()*factor-4)),max(0,int(xy[:,1].min()*factor-4)),
                 min(im.width,int((xy[:,0].max()+1)*factor+4)),min(im.height,int((xy[:,1].max()+1)*factor+4)))
            components.append((len(points),box))
    components=sorted(components,reverse=True)[:len(names)]
    upper=sorted([b for _,b in components if (b[1]+b[3])/2<im.height/2],key=lambda b:b[0])
    lower=sorted([b for _,b in components if (b[1]+b[3])/2>=im.height/2],key=lambda b:b[0])
    boxes=upper+lower
    if len(boxes)!=len(names) or len(upper)!=cols:
        raise ValueError(f'Cannot isolate sheet parts: {boxes}')
    for i, part in enumerate(names):
        cell = content(im.crop(boxes[i]))
        px,py = rig[part]['pivot']
        if part == 'head':
            box = (px-55,54,px+55,177)
        elif part == 'torso':
            box = (px-43,165,px+43,262)
        elif part == 'scarf':
            box = (125,172,152,229)
        elif part.startswith('arm'):
            box = (px-13,py-12,px+15,250)
        else:
            box = (px-12,py-12,px+24 if view=='side' else px+14,305)
        # Preserve drawn shapes, adjusting aspect slightly only to register the rig.
        cell=cell.resize((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
        out=Image.new('RGBA',(320,320))
        out.alpha_composite(cell,box[:2])
        path=OUT/'characters'/name/view/f'{part}.png'
        path.parent.mkdir(parents=True,exist_ok=True)
        out.save(path)


def asset(src, spec):
    im = Image.open(src).convert('RGBA')
    w,h,n = spec['width'],spec['height'],spec['frames']
    out = Image.new('RGBA',(w*n,h))
    cells=[im.crop((i*im.width//n,0,(i+1)*im.width//n,im.height)) for i in range(n)]
    if n>1 and spec.get('character'):
        cells=figure_cells(im,n)
    boxes=[c.getchannel('A').point(lambda x:255 if x>=128 else 0).getbbox() for c in cells]
    union=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
    for i in range(n):
        cell = cells[i]
        if spec['id'] == 'water-surface':
            cell=cell.crop(union).resize((512,40),Image.Resampling.LANCZOS)
            canvas=Image.new('RGBA',(512,64))
            # Reflect one wave span: both the midpoint and wrap boundary join
            # exactly, without a transparent gap or a blurred seam band.
            half=cell.crop((0,0,256,40))
            canvas.alpha_composite(half,(0,0))
            canvas.alpha_composite(ImageOps.mirror(half),(256,0))
            cell=canvas
        elif spec['id'] == 'building-ladder':
            cell=content(cell)
            cell=cell.resize((96,192),Image.Resampling.LANCZOS)
            canvas=Image.new('RGBA',(192,192))
            canvas.alpha_composite(cell,(48,0))
            cell=canvas
        elif not spec['alpha']:
            cell = cell.convert('RGB').resize((w,h),Image.Resampling.LANCZOS)
        elif spec['anchor'] == 'grip':
            cell = content(cell)
            hangs = 'sack' in spec['id'] or 'lantern' in spec['id']
            scale = min((72 if hangs else 90)/cell.height,100/cell.width)
            cell = cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA',(w,h))
            y = 236 if hangs else 240-cell.height
            canvas.alpha_composite(cell,(172-cell.width//2,y))
            cell = canvas
        else:
            grounded = spec['anchor'] == 'bottom-centre'
            char = bool(spec.get('character'))
            area_h = 250 if char else h-8
            area_w = 274 if char else w-16
            if n>1:
                common_scale=min(area_w/(union[2]-union[0]),area_h/(union[3]-union[1]))
                crop=content(cell) if grounded else cell.crop(union)
                crop=crop.resize((max(1,round(crop.width*common_scale)),max(1,round(crop.height*common_scale))),Image.Resampling.LANCZOS)
                cell=Image.new('RGBA',(area_w,area_h))
                cell.alpha_composite(crop,((area_w-crop.width)//2,area_h-crop.height if grounded else (area_h-crop.height)//2))
            else:
                cell = fit(cell,(area_w,area_h),grounded)
            canvas = Image.new('RGBA',(w,h))
            y = 305-area_h if char and grounded else h-area_h-2 if grounded else (h-area_h)//2
            canvas.alpha_composite(cell,((w-area_w)//2,y))
            cell = canvas
        if spec['id'] in ('fx-falling-water','fx-smoke-puff'):
            alpha=np.asarray(cell.getchannel('A'))
            yy,xx=np.where(alpha>=128)
            shift=round(w/2-xx.mean())
            centred=Image.new('RGBA',(w,h))
            centred.alpha_composite(cell,(shift,0))
            cell=centred
        if spec['id']=='anim-flame':
            rgba=np.array(cell)
            palette=np.array([[42,28,20],[255,243,208],[255,194,74],[255,122,31],[194,69,47]],dtype=np.int32)
            rgb=rgba[:,:,:3].astype(np.int32)
            nearest=((rgb[:,:,None,:]-palette[None,None,:,:])**2).sum(axis=3).argmin(axis=2)
            rgba[:,:,:3]=palette[nearest].astype('uint8')
            cell=Image.fromarray(rgba)
        out.paste(cell,(i*w,0))
    path = ROOT.parent/spec['path']
    path.parent.mkdir(parents=True,exist_ok=True)
    (out if spec['alpha'] else out.convert('RGB')).save(path)


if __name__ == '__main__':
    p=argparse.ArgumentParser()
    p.add_argument('source')
    p.add_argument('id')
    a=p.parse_args()
    if a.id.endswith('-parts'):
        name,view,_=a.id.split('-')
        parts(a.source,name,view)
    elif a.id.endswith('-turnaround'):
        turnaround(a.source,a.id.split('-')[0])
    else:
        specs=json.loads((ROOT/'assets.json').read_text())['assets']
        asset(a.source,next(x for x in specs if x['id']==a.id))
