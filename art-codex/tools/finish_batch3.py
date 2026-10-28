#!/usr/bin/env python3
"""Finish generated art: repeat edges, register state edits, and record prompts."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from prepare_generated import ROOT, OUT


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
    log = OUT/'LOG.md'
    text = '\n'.join(line.rstrip() for line in text.splitlines())+'\n'
    log.write_text((log.read_text()+text).rstrip()+'\n')


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('mode',choices=('states','wrap','log'))
    p.add_argument('value',nargs='?')
    args = p.parse_args()
    if args.mode == 'states': align_states()
    elif args.mode == 'wrap': wrap_texture(Path(args.value))
    else: log_group(args.value)
