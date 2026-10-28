#!/usr/bin/env python3
"""Finish Ruta's generated pose/portrait sources without touching other survivors."""
import json,sys
from pathlib import Path
from PIL import Image
from prepare_generated import ROOT,OUT,asset,content,figure_cells

def crossfix(src):
    cells=figure_cells(Image.open(src).convert('RGBA'),2)
    for cell,(part,box) in zip(cells,(('arm-left',(124,188,138,205)),('torso',(125,187,139,205)))):
        path=OUT/'characters/ruta/front'/f'{part}.png'
        original=Image.open(path).convert('RGBA')
        bounds=original.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
        registered=Image.new('RGBA',(320,320))
        cell=cell.resize((bounds[2]-bounds[0],bounds[3]-bounds[1]),Image.Resampling.LANCZOS)
        registered.alpha_composite(cell,bounds[:2])
        original.paste(registered.crop(box),box[:2]);original.save(path)

if __name__=='__main__':
    if len(sys.argv)>1:
        crossfix(sys.argv[1]);sys.exit()
    for spec in json.loads((ROOT/'assets.json').read_text())['assets']:
        if spec.get('character')!='ruta' or spec['kind'] not in ('pose','sprite') or spec['id']=='ruta-pose-dead':continue
        record=OUT/'provenance'/f"{spec['id']}.json"
        dest=ROOT.parent/spec['path']
        if record.exists() and not dest.exists():
            asset(json.loads(record.read_text())['path'],spec)
            print(spec['id'])
