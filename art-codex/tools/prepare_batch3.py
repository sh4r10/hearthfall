#!/usr/bin/env python3
"""Register generated Batch 3 art without stretching poses to fill their cells."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from prepare_generated import ROOT, OUT, content, figure_cells, asset


def register(source, ident):
    specs = json.loads((ROOT / 'assets.json').read_text())['assets']
    spec = next(a for a in specs if a['id'] == ident)
    image = Image.open(source).convert('RGBA')
    if spec.get('character') and spec['kind'] == 'pose':
        n = spec['frames']
        cells = figure_cells(image, n) if n > 1 else [content(image)]
        pose = Path(spec['path']).stem
        heights = ([175] * n if pose == 'eat' else
                   [250, 215, 188, 88] if pose == 'collapse' else
                   [88] if pose == 'dead' else [250] * n)
        out = Image.new('RGBA', (320*n, 320))
        for i, (cell, height) in enumerate(zip(cells, heights)):
            # One uniform scale per figure; never stretch head or torso.
            scale = min(height / cell.height, 284 / cell.width)
            cell = cell.resize((round(cell.width*scale), round(cell.height*scale)), Image.Resampling.LANCZOS)
            rgba = np.asarray(cell)
            ys, xs = np.where(rgba[:, :, 3] >= 128)
            bottom = ys >= ys.max()-20
            # Lock the support area, rather than the bounding box, across collapse.
            support_x = round(xs[bottom].mean())
            x = 160-support_x
            x = max(2, min(318-cell.width, x))
            out.alpha_composite(cell, (i*320+x, 305-cell.height))
        out.save(ROOT.parent / spec['path'])
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
    register(args.source, args.id)
