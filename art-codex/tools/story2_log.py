#!/usr/bin/env python3
"""Write the story generation log and verify exact exported parallax stacks."""
import json
from pathlib import Path
from PIL import Image, ImageChops

OUT = Path(__file__).resolve().parents[1] / 'out'
lines = ['## Batch 2 story scenes', '',
         'All story artwork was generated with the built-in image generation tool. Verbatim prompts, references and attempt counts are in the linked provenance JSON. Original initial and accepted full-scene sources are retained in `provenance/story-sources/`.', '',
         'Full scenes were generated first, then simplified into broad flat graphic forms. Each back/mid/front plane was generated with its accepted full scene attached. Back planes continue behind cutouts. Exported full PNGs are the exact alpha stack of their exported planes, all 1920×1080. The generated extractions preserve the scene arrangement; minor market details in scene 1 were simplified. Scene 3 sky was edited from orange to cold blue-mauve so carried lanterns remain the warm focus. Scene 5 used all four actual turnaround references for its cast correction.', '',
         'Extraction scale was restored for the scene 2 family, scene 4 procession, scene 5 cast and scene 6 tiny hearth group. The scene 5 cast was placed in the lower-middle with a calm floor margin below. Isolated duplicate foreground rocks from scene 6 extraction were removed; the mid plane carries those rocks. A matching brown contour was applied to the scene 4 mid-plane snow cutout; its checker fringe warning is intentional painted pale snow, visually reviewed in the full scene. No manifest or brief was changed.', '',
         '| Asset | Final prompt / construction | Generation tries | Notes |',
         '|---|---|---:|---|']
for number in range(1, 7):
    record = json.loads((OUT / 'provenance' / f'story-{number}.json').read_text())
    composite = Image.open(OUT / 'story' / f'{number}-back.png').convert('RGBA')
    for layer in ('mid', 'front'):
        composite = Image.alpha_composite(composite, Image.open(OUT / 'story' / f'{number}-{layer}.png').convert('RGBA'))
    final = Image.open(OUT / 'story' / f'{number}.png').convert('RGB')
    assert ImageChops.difference(composite.convert('RGB'), final).getbbox() is None, number
    link = f'[Verbatim prompts](provenance/story-{number}.json)'
    lines.append(f'| `story-{number}` | {link}; exact exported layer stack | {record["tries"]} | Original full scene plus flat-shape edit' + (' and cast-reference correction.' if number == 5 else '.') + ' |')
    for layer, data in record['layers'].items():
        tries = data.get('tries', 1) + data.get('colour_edit_tries', 0)
        notes = 'Opaque painted continuation.' if layer == 'back' else 'Registered transparent plane.'
        if number == 4 and layer == 'mid':
            notes += ' Pale snow edge warning visually accepted.'
        if number == 3 and layer == 'back':
            notes += ' Cold sky correction.'
        lines.append(f'| `story-{number}-{layer}` | {link} | {tries} | {notes} |')
(OUT / 'STORY-BATCH2-LOG.md').write_text('\n'.join(lines) + '\n')
print('All six story parallax stacks are pixel-exact; story log written.')
