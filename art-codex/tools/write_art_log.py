#!/usr/bin/env python3
"""Index final generation prompts, attempts and composed deliverables."""
import json
from pathlib import Path
from prepare_generated import ROOT, OUT

assets=[a for a in json.loads((ROOT/'assets.json').read_text())['assets'] if a['batch']==1]
records={p.stem:json.loads(p.read_text()) for p in (OUT/'provenance').glob('*.json')}
lines=['# Art batch 1 generation log','',
       'Generated with the built-in image generation tool. No API/CLI fallback or placeholder art was used.',
       'The linked provenance JSON files contain the final prompts verbatim, source image locations, references where recorded, and generation attempt counts. Shared parts sheets have one prompt serving each listed part.', '',
       '## Processing and review','',
       '- Transparent generated sheets were cut by connected alpha regions rather than trusting approximate cell boundaries. Parts were registered to the pivots in the unchanged rig; caps extend into their parent parts.',
       '- Images were delivered as 8-bit RGB/RGBA PNGs and resized with Lanczos. Multi-frame sheets use a shared scale so figures and effects do not grow between frames.',
       '- Blink edits were generated as a sheet; only eye rectangles were transferred to the original heads, leaving every other pixel unchanged.',
       '- Delivered turnarounds are restacked from the final registered parts, so neutral layer reconstruction matches exactly. Generation references were the original turnaround designs. Frosted dead poses are registered to the final collapse-frame bounds.',
       '- Building variants use the first generated state as reference. Cleanup retains common structural pixels; the diffuser and stockpile use matching states supplied together in their initial generated sheet.',
       '- Animations were built with compose_character.py. GIF frames are decoded into the animation contact sheets for frame-by-frame and loop-boundary review.',
       '- No manifest, rig or motion specification was changed.', '',
       '## Specification notes','',
       '- The cold-pose rows request gritted teeth, whereas the general face construction forbids teeth except for Pim. These poses follow the specific cold-pose request.',
       '- Collapse warnings about sideways movement are reviewed as the intentional change from standing to lying; the ground remains fixed.',
       '- The checker can flag saturated fire colours and pale effect edges. These are reviewed against the specified fire and frost palettes, rather than treated as permission to add glow.', '',
       '## Deliverables and final prompts','',
       '| Asset | Final prompt / construction | Generation tries | Notes |',
       '|---|---|---:|---|']
for a in assets:
    id=a['id']
    if a['source']=='compose':
        lines.append(f'| `{id}` | `python3 art-codex/tools/compose_character.py {a["character"]}`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |')
        continue
    key=id
    shared={'building-stockpile-half':'building-stockpile-empty',
            'building-stockpile-full':'building-stockpile-empty',
            'building-diffuser-on':'building-diffuser-off'}
    key=shared.get(id,key)
    if a['kind']=='part':
        view=Path(a['path']).parent.name
        key='head-blinks' if id.endswith('head-blink') else f'{a["character"]}-{view}-parts'
    record=records.get(key)
    if record is None:
        lines.append(f'| `{id}` | MISSING PROVENANCE | ? | Must resolve before delivery. |')
        continue
    notes=record.get('rejected','')
    tries=record.get('tries',1)
    if id in shared:
        notes+=' Matching state selected from the initial shared sheet; separate state edit discarded to retain structure.'
        tries+=1
    lines.append(f'| `{id}` | [Verbatim prompt](provenance/{key}.json) | {tries} | {notes} |')
(OUT/'LOG.md').write_text('\n'.join(lines)+'\n')
