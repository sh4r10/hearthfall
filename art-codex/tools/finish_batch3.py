#!/usr/bin/env python3
"""Finish generated art: repeat edges, register state edits, and record prompts."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from prepare_generated import ROOT, OUT, content
from check_art import flood, border_mask
from prepare_batch3 import register as register_generated


def records():
    return [json.loads(p.read_text()) for p in sorted((OUT/'provenance/batch3').glob('*.json'))]


def align_states():
    rs = {r['id']:r for r in records()}
    specs = {a['id']:a for a in json.loads((ROOT/'assets.json').read_text())['assets']}
    for base_id in sorted({r['base'] for r in rs.values() if r.get('base')}):
        base = rs[base_id]
        a = specs[base_id]
        original = Image.open(base['path']).convert('RGBA')
        members = [base]+[r for r in rs.values() if r.get('base') == base_id]
        images = [Image.open(r['path']).convert('RGBA').resize(original.size,Image.Resampling.LANCZOS) for r in members]
        boxes = [im.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox() for im in images]
        # Anchor every source to the same base before finding the common extent.
        for i,(im,box) in enumerate(zip(images,boxes)):
            shifted = Image.new('RGBA',original.size)
            shifted.alpha_composite(im,(0,boxes[0][3]-box[3]))
            images[i] = shifted
        boxes = [im.getchannel('A').point(lambda v:255 if v>=128 else 0).getbbox() for im in images]
        b = (min(v[0] for v in boxes),min(v[1] for v in boxes),max(v[2] for v in boxes),max(v[3] for v in boxes))
        w,h = a['width'],a['height']
        scale = min((w-16)/(b[2]-b[0]),(h-8)/(b[3]-b[1]))
        bw,bh = round((b[2]-b[0])*scale),round((b[3]-b[1])*scale)
        rendered = []
        for im in images:
            im = im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
            out = Image.new('RGBA',(w,h))
            out.alpha_composite(im,((w-bw)//2-round(b[0]*scale),h-2-bh-round(b[1]*scale)))
            rendered.append(out)
        canonical = rendered[0]
        # Preserve the immutable outer structural ink and the foundation pixels.
        mask = canonical.getchannel('A').point(lambda v:255 if v>=128 else 0)
        interior = mask.filter(ImageFilter.MinFilter(5))
        rim = np.asarray(mask,dtype=int)-np.asarray(interior,dtype=int)
        keep = rim > 0
        keep[-8:] = np.asarray(mask)[-8:] > 0
        # A door's opening is functional; its surrounding timber frame persists.
        for r,out in zip(members,rendered):
            arr = np.array(out)
            arr[keep] = np.array(canonical)[keep]
            Image.fromarray(arr).save(ROOT.parent/specs[r['id']]['path'])


def wrap_texture(path):
    image = Image.open(path).convert('RGB')
    ar = np.array(image).astype(float)
    # A narrow periodic edge correction, without mirrored landmarks.
    for axis in (0,1):
        first = np.take(ar,0,axis=axis).copy()
        last = np.take(ar,-1,axis=axis).copy()
        average = (first+last)/2
        for k in range(8):
            blend = (8-k)/8
            if axis == 0:
                ar[k] = ar[k]*(1-blend)+average*blend
                ar[-1-k] = ar[-1-k]*(1-blend)+average*blend
            else:
                ar[:,k] = ar[:,k]*(1-blend)+average*blend
                ar[:,-1-k] = ar[:,-1-k]*(1-blend)+average*blend
    Image.fromarray(np.clip(ar,0,255).astype('uint8')).save(path)


def log_group(group):
    rs = [r for r in records() if r.get('group') == group]
    text = '\n## Batch 3: '+group+'\n\n'
    for r in rs:
        text += '### '+r['id']+'\n\nTries: '+str(r.get('tries',1))+'. Built-in imagegen. Source: `'+r['path']+'`.\n\nFinal prompt:\n\n'+r['prompt']+'\n\n'
        if r.get('notes'): text += r['notes']+'\n\n'
    log = OUT/'LOG.md'
    text = '\n'.join(line.rstrip() for line in text.splitlines())+'\n'
    log.write_text((log.read_text()+text).rstrip()+'\n')


def centre_strips():
    specs = json.loads((ROOT/'assets.json').read_text())['assets']
    for a in specs:
        if a['batch'] != 3 or not (a['id'].startswith('creature-') or a['id']=='refugee'): continue
        path = ROOT.parent/a['path']
        if not path.exists(): continue
        strip = Image.open(path).convert('RGBA')
        w,h,n = a['width'],a['height'],a['frames']
        cells = [strip.crop((i*w,0,(i+1)*w,h)) for i in range(n)]
        moments = []
        for cell in cells:
            ys,xs = np.where(np.asarray(cell.getchannel('A')) >= 128)
            moments.append((xs.mean(),xs.min(),xs.max()))
        if max(m[0] for m in moments)-min(m[0] for m in moments) <= 12: continue
        reach = max(max(c-left,right-c) for c,left,right in moments)
        scale = min(1,(w/2-8)/reach)
        out = Image.new('RGBA',strip.size)
        for i,cell in enumerate(cells):
            cell = cell.resize((round(w*scale),round(h*scale)),Image.Resampling.LANCZOS)
            ys,xs = np.where(np.asarray(cell.getchannel('A')) >= 128)
            out.alpha_composite(cell,(i*w+round(w/2-xs.mean()),h-2-int(ys.max())))
        out.save(path)


def small_regions(mask,limit):
    remaining = mask.copy()
    h,w = mask.shape
    for y,x in zip(*np.where(mask)):
        if not remaining[y,x]: continue
        stack,points = [(y,x)],[]
        remaining[y,x] = False
        while stack:
            cy,cx = stack.pop()
            points.append((cy,cx))
            for ny,nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                if 0<=ny<h and 0<=nx<w and remaining[ny,nx]:
                    remaining[ny,nx] = False
                    stack.append((ny,nx))
        if len(points)<=limit: yield tuple(np.array(points).T)


def clean_icons(ids=None):
    specs = json.loads((ROOT/'assets.json').read_text())['assets']
    for a in specs:
        if a['batch'] != 3 or not a['id'].startswith(('icon-','badge-','trait-')): continue
        if ids is not None and a['id'] not in ids: continue
        path = ROOT.parent/a['path']
        record = json.loads((OUT/'provenance/batch3'/f"{a['id']}.json").read_text())
        # Always begin from the generated source so repeated cleanup is stable.
        register_generated(record['path'],a['id'])
        rgba = np.array(Image.open(path).convert('RGBA'))
        alpha = rgba[:,:,3].copy()
        if a['id']=='icon-lens':
            # Turn generated glass opacity into a flat disc; encode its painted
            # upper-left highlight as one transparent cutout instead of shading.
            empty = alpha<16
            disk = ~flood(empty,border_mask(*empty.shape,'tblr') & empty)
            inset = np.asarray(Image.fromarray(disk.astype('uint8')*255).filter(ImageFilter.MinFilter(9)))>0
            yy,xx = np.indices(alpha.shape)
            highlights = list(small_regions((alpha>=240)&inset&(xx<64)&(yy<80),alpha.size))
            if not highlights: raise ValueError('No generated lens highlight found')
            highlight = max(highlights,key=lambda r:len(r[0]))
            alpha = disk.astype('uint8')*255
            alpha[highlight] = 0
            alpha = np.array(Image.fromarray(alpha).resize((256,256),Image.Resampling.LANCZOS).resize((128,128),Image.Resampling.LANCZOS))
        if a['id']=='badge-guard':
            alpha = np.array(Image.fromarray(alpha).filter(ImageFilter.MaxFilter(9)))
        if a['id']=='trait-night-owl':
            regions = list(small_regions(alpha>=128,alpha.size))
            largest = max(regions,key=lambda r:len(r[0]))
            keep = np.zeros(alpha.shape,dtype=np.uint8)
            keep[largest] = 255
            allowed = np.asarray(Image.fromarray(keep).filter(ImageFilter.MaxFilter(3)))>0
            alpha[~allowed] = 0
        for region in small_regions(alpha>=16,3): alpha[region] = 0
        solid = alpha>=128
        empty = ~solid
        exterior = flood(empty,border_mask(*empty.shape,'tblr') & empty)
        for region in small_regions(empty & ~exterior,12): alpha[region] = 255
        solid = alpha>=128
        interior = np.asarray(Image.fromarray(solid.astype('uint8')*255).filter(ImageFilter.MinFilter(3)))>0
        alpha[interior] = 255
        alpha[alpha>=240] = 255
        alpha[alpha<16] = 0
        rgba[:,:,3] = alpha
        rgba[:,:,:3] = 255
        cell = content(Image.fromarray(rgba))
        scale = min(96/cell.width,96/cell.height)
        cell = cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.LANCZOS)
        out = Image.new('RGBA',(128,128))
        out.alpha_composite(cell,((128-cell.width)//2,(128-cell.height)//2))
        out.save(path)


def esk_frost(source):
    strip = Image.open(OUT/'characters/esk/poses/collapse.png').convert('RGBA')
    base = strip.crop((960,0,1280,320))
    edited = Image.open(source).convert('RGBA').resize((320,320),Image.Resampling.LANCZOS)
    rgba = np.array(edited)
    rgb = rgba[:,:,:3].astype(np.int16)
    near = np.asarray(base.getchannel('A').filter(ImageFilter.MaxFilter(13)))>=128
    frost = (rgb[:,:,0]>=160)&(rgb[:,:,1]>=170)&(rgb[:,:,2]>=180)&(rgb[:,:,2]>=rgb[:,:,1])&(rgb[:,:,1]>=rgb[:,:,0]-1)&(rgba[:,:,3]>=32)&near
    frost[305:] = False
    if frost.sum()<20: raise ValueError('Generated edit contains too little usable frost')
    overlay = np.zeros_like(rgba)
    overlay[frost] = rgba[frost]
    base.alpha_composite(Image.fromarray(overlay))
    base.save(OUT/'characters/esk/poses/dead.png')


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('mode',choices=('states','wrap','log','centre','icons','frost'))
    p.add_argument('value',nargs='?')
    args = p.parse_args()
    if args.mode == 'states': align_states()
    elif args.mode == 'centre': centre_strips()
    elif args.mode == 'icons': clean_icons(set(args.value.split(',')) if args.value else None)
    elif args.mode == 'frost': esk_frost(args.value)
    elif args.mode == 'wrap': wrap_texture(Path(args.value))
    else: log_group(args.value)
