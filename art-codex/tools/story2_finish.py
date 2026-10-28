#!/usr/bin/env python3
"""Register generated story planes and keep their composite exact."""
import argparse
import json
from pathlib import Path
import shutil
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'

def finish(number):
    record = json.loads((OUT / 'provenance' / f'story-{number}.json').read_text())
    archive = OUT / 'provenance' / 'story-sources'
    archive.mkdir(parents=True, exist_ok=True)
    for key, suffix in (('original_path', 'initial'), ('path', 'accepted')):
        shutil.copy2(record[key], archive / f'{number}-{suffix}.png')
    dest = OUT / 'story'
    dest.mkdir(parents=True, exist_ok=True)
    planes = []
    for layer in ('back', 'mid', 'front'):
        src = Image.open(record['layers'][layer]['path']).convert('RGBA')
        if record['layers'][layer].get('ink_edge'):
            # Snow at a cutout edge needs the same brown contour as other planes.
            ink = Image.new('RGBA', src.size, '#2a1c14')
            ink.putalpha(src.getchannel('A').filter(ImageFilter.MaxFilter(5)))
            src = Image.alpha_composite(ink, src)
        if layer == 'front' and record.get('front_bbox'):
            # Model extraction may enlarge figures despite a registered prompt.
            # Restore their accepted source extent without painting new pixels.
            box = record['front_bbox']
            cut = src.crop(record['front_crop']) if record.get('front_crop') else src
            content = cut.crop(cut.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox())
            content = content.resize((box[2] - box[0], box[3] - box[1]), Image.Resampling.LANCZOS)
            src = Image.new('RGBA', src.size)
            src.alpha_composite(content, box[:2])
        src = src.resize((1920, 1080), Image.Resampling.LANCZOS)
        if layer == 'back':
            src = src.convert('RGB').convert('RGBA')
        (src.convert('RGB') if layer == 'back' else src).save(dest / f'{number}-{layer}.png')
        planes.append(src)
    full = planes[0]
    for plane in planes[1:]:
        full = Image.alpha_composite(full, plane)
    full.convert('RGB').save(dest / f'{number}.png')
    print(f'Story {number}: saved 4 registered planes/composite')

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('number', type=int)
    finish(p.parse_args().number)
