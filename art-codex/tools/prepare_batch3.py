#!/usr/bin/env python3
"""Register generated Batch 3 art without stretching poses to fill their cells."""
import argparse
import json
from io import BytesIO
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageOps
from prepare_generated import ROOT, OUT, content, figure_cells, asset


def clean_source(source):
    rgba = np.array(Image.open(source).convert('RGBA'))
    rgba[:, :, 3] = np.where(rgba[:, :, 3] >= 240, 255, 0)
    return Image.fromarray(rgba)


def leech_palette(image):
    """Flatten the generated translucent heat treatment into crisp fill tones."""
    colours = np.array([[42,28,20],[85,58,62],[180,155,158],[148,125,132],
                        [207,180,172],[207,150,132],[171,118,108],[228,183,161],
                        [231,162,79],[191,117,68],[239,188,103]],dtype=np.int32)
    rgba = np.array(image)
    rgb = rgba[:,:,:3].astype(np.int32)
    best = np.full(rgb.shape[:2],1000000,dtype=np.int32)
    indices = np.zeros(rgb.shape[:2],dtype=np.uint8)
    for i,colour in enumerate(colours):
        distance = ((rgb-colour)**2).sum(axis=2,dtype=np.int32)
        update = distance < best
        indices[update] = i
        best[update] = distance[update]
    rgba[:,:,:3] = colours[indices].astype(np.uint8)
    return Image.fromarray(rgba)


def ladder(source):
    """Cut generated rails, lashings, hooks and rubble onto exact shared rails."""
    image = clean_source(source)
    rails = [(image.crop((225,700,283,900)),48),
             (image.crop((443,700,501,900)),144)]
    rung = image.crop((145,1010,579,1110)).resize((192,44),Image.Resampling.LANCZOS)
    hooks = image.crop((145,0,579,170)).resize((192,75),Image.Resampling.LANCZOS)
    rubble = content(image.crop((145,2020,579,2172)))
    rubble = rubble.resize((192,50),Image.Resampling.LANCZOS)
    pieces = {}
    for name in ('top','middle','bottom'):
        out = Image.new('RGBA',(192,192))
        for rail,x in rails:
            start = 40 if name == 'top' else 0
            part = rail.resize((26,192-start),Image.Resampling.LANCZOS)
            out.alpha_composite(part,(x-13,start))
        for y in ([144] if name == 'top' else [48,144]):
            out.alpha_composite(rung,(0,y-22))
        if name == 'top': out.alpha_composite(hooks,(0,0))
        if name == 'bottom': out.alpha_composite(rubble,(0,142))
        pieces[name] = out
    # Identical continuation pixels on every join, including alpha.
    seam = pieces['middle'].crop((0,0,192,1))
    for name in ('top','middle'): pieces[name].paste(seam,(0,191))
    pieces['bottom'].paste(seam,(0,0))
    for name,out in pieces.items(): out.save(OUT/'buildings'/f'ladder-{name}.png')


def pegs(source, material):
    image = content(clean_source(source))
    scale = min(54/image.width,178/image.height)
    image = image.resize((round(image.width*scale),round(image.height*scale)),Image.Resampling.LANCZOS)
    out = Image.new('RGBA',(192,192))
    out.alpha_composite(image,(0,192-image.height))
    out.save(OUT/'buildings'/f'ladder-peg-{material}-left.png')
    ImageOps.mirror(out).save(OUT/'buildings'/f'ladder-peg-{material}-right.png')


def register(source, ident):
    specs = json.loads((ROOT / 'assets.json').read_text())['assets']
    spec = next(a for a in specs if a['id'] == ident)
    (ROOT.parent/spec['path']).parent.mkdir(parents=True,exist_ok=True)
    image = Image.open(source).convert('RGBA')
    if ident == 'refugee': image = clean_source(source)
    if (spec.get('character') and spec['kind'] == 'pose') or ident == 'refugee':
        n = spec['frames']
        cells = figure_cells(image, n) if n > 1 else [content(image)]
        pose = Path(spec['path']).stem
        heights = ([175] * n if pose == 'eat' else
                   [250, 215, 188, 88] if pose == 'collapse' else
                   [88] if pose == 'dead' else [250] * n)
        common_scale = min(heights[0]/cells[0].height,
                           284/max(cell.width for cell in cells))
        out = Image.new('RGBA', (320*n, 320))
        for i, (cell, height) in enumerate(zip(cells, heights)):
            # One source-pixel scale across the entire strip. A kneeling
            # transition must retain its natural shorter height, not grow.
            scale = common_scale
            cell = cell.resize((round(cell.width*scale), round(cell.height*scale)), Image.Resampling.LANCZOS)
            rgba = np.asarray(cell)
            ys, xs = np.where(rgba[:, :, 3] >= 128)
            bottom = ys >= ys.max()-20
            # Lock the support area, rather than the bounding box, across collapse.
            support_x = round(xs[bottom].mean())
            x = 160-support_x
            x = max(2, min(318-cell.width, x))
            baseline = 319 if ident == 'refugee' else 305
            out.alpha_composite(cell, (i*320+x, baseline-cell.height))
        out.save(ROOT.parent / spec['path'])
    elif ident.startswith('creature-shade-'):
        n = spec['frames']
        cells = [content(image.crop((i*image.width//n,0,(i+1)*image.width//n,image.height))) for i in range(n)]
        reference = Image.open(OUT/'creatures/shade/drift.png').convert('RGBA').crop((0,0,320,320))
        target_h = content(reference).height
        scale = min(target_h/cells[0].height,280/max(c.width for c in cells))
        out = Image.new('RGBA',(320*n,320))
        for i,cell in enumerate(cells):
            cell = cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.LANCZOS)
            if ident.endswith('dissolve') and i == n-1:
                alpha = cell.getchannel('A').point(lambda v:round(v*.65))
                cell.putalpha(alpha)
            out.alpha_composite(cell,(i*320+(320-cell.width)//2,318-cell.height))
        out.save(ROOT.parent/spec['path'])
    elif ident.startswith(('creature-burrower-', 'creature-heat-leech-')):
        # Discard generated ambient haze before reduction; keep the painted art.
        painted = clean_source(source)
        if ident.startswith('creature-heat-leech-'): painted = leech_palette(painted)
        if ident in {'creature-heat-leech-crawl','creature-heat-leech-latch',
                     'creature-heat-leech-feed','creature-burrower-attack'}:
            cells = figure_cells(painted,spec['frames'])
            w,h,n = spec['width'],spec['height'],spec['frames']
            scale = min((w-16)/max(c.width for c in cells),(h-8)/max(c.height for c in cells))
            out = Image.new('RGBA',(w*n,h))
            for i,cell in enumerate(cells):
                cell = cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.LANCZOS)
                out.alpha_composite(cell,(i*w+(w-cell.width)//2,h-2-cell.height))
            out.save(ROOT.parent/spec['path'])
            return
        buffer = BytesIO()
        painted.save(buffer,format='PNG')
        buffer.seek(0)
        asset(buffer,spec)
    elif ident.startswith(('icon-', 'badge-', 'trait-')):
        cell = content(image)
        scale = min(96/cell.width, 96/cell.height)
        cell = cell.resize((round(cell.width*scale), round(cell.height*scale)), Image.Resampling.LANCZOS)
        rgba = np.array(cell)
        rgba[:, :, :3] = 255
        if ident in {'icon-coal', 'icon-food', 'icon-survivors', 'icon-hearth'}:
            # Remove enclosed hairline alpha marks that disappear at 20 px.
            mask = Image.fromarray((rgba[:, :, 3] >= 128).astype('uint8')*255)
            padded = Image.new('L', (mask.width+2, mask.height+2))
            padded.paste(mask, (1, 1))
            ImageDraw.floodfill(padded, (0, 0), 128)
            inside = np.array(padded)[1:-1, 1:-1] != 128
            rgba[:, :, 3][inside] = 255
        out = Image.new('RGBA', (128, 128))
        out.alpha_composite(Image.fromarray(rgba), ((128-cell.width)//2, (128-cell.height)//2))
        path = ROOT.parent/spec['path']
        path.parent.mkdir(parents=True, exist_ok=True)
        out.save(path)
    else:
        asset(source, spec)


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('source')
    p.add_argument('id')
    args = p.parse_args()
    if args.id == 'ladder-system': ladder(args.source)
    elif args.id.startswith('pegs-'): pegs(args.source,args.id[5:])
    else: register(args.source, args.id)
