#!/usr/bin/env python3
"""Append the batch-two prompt index without rewriting the batch-one log."""
import json
from pathlib import Path

OUT=Path(__file__).resolve().parents[1]/'out'
ROOT=OUT.parent
assets=[a for a in json.loads((ROOT/'assets.json').read_text())['assets'] if a['batch']==2]
records={p.stem:json.loads(p.read_text()) for p in (OUT/'provenance').glob('*.json')}
marker='\n## Batch 2 delivery\n'
old=(OUT/'LOG.md').read_text().split(marker)[0].rstrip()
lines=['','## Batch 2 delivery','',
       'All source artwork used the built-in image generation tool. The table indexes every one of the 200 batch-two manifest files. Linked provenance records preserve verbatim final prompts, original source locations, references and attempts. Shared sheets supply the listed matching parts or frames. No API/CLI fallback or substitute placeholder artwork was used.','',
       '### Character processing and review','',
       '- Tobin, Ostra, Pim and Ruta each began with an independently generated three-view turnaround. All later character prompts attach that original design reference and request the same character, proportions and colours. The original references remain recorded even though the delivered turnarounds are restacked from registered final parts.',
       '- Transparent parts were isolated by connected alpha regions, then registered to the unchanged 320px rig. Head/collar parts extend to y188; coat collars begin at y160. Limbs have rounded caps extending14px over their pivots, and coat hems overlap the thighs. Tobin keeps his120px-wide front/back body and broader boots. No pivots or animation specifications changed.',
       '- Initial torso extractions included unwanted sleeve stubs or frontal profiles. Regenerated sleeveless torso parts fix those; Ostra\'s six-patch shawl now reaches nearly to the coat hem, Pim\'s satchel includes both spoon and gear, and Ruta\'s panels sit inside the body silhouette.',
       '- Blink heads use generated eye edits transferred only inside eye rectangles. Every other pixel, including the full outline and neck stub, remains identical to the open-eye head. The two blink review sheets show these changes.',
       '- Whole-body multi-frame poses were generated together and normalized with one shared scale per strip. Dead poses are generated frost edits of each final collapse frame and are registered to that frame\'s bounds. The generic sleep instruction to pull a hood up is interpreted as coat fabric around characters whose design uses a hat or earmuffs.',
       '- All nine animations per survivor were built with compose_character.py. Every decoded GIF frame was reviewed in contact-animations-<name>.png, including loop boundaries, tool swing, head tilt and joint overlap. Collapse sideways movement warnings are intentional changes from standing to lying, with a stable ground row. Ostra\'s folded/hugged shawl drape in painted poses was visually reviewed against her corrected neutral model.',
       '- Source generation is resized with Lanczos to exact8-bit RGB/RGBA PNG dimensions. Portraits, poses and sprites preserve true generated transparency.','',
       '### Complete batch-two manifest index','',
       '| Asset | Final prompt / construction | Generation tries | Notes |',
       '|---|---|---:|---|']

def link(key,label='Verbatim prompt'):
    if key not in records:raise RuntimeError(f'Missing provenance: {key}')
    return f'[{label}](provenance/{key}.json)'

for a in assets:
    aid=a['id'];name=a.get('character');notes='';tries=1
    if a['source']=='compose':
        prompt=f'`python3 art-codex/tools/compose_character.py {name}`; unchanged rig and poses'
        tries=0;notes='Composed PNG and GIF preview.'
    elif aid.startswith('story-'):
        bits=aid.split('-');key='-'.join(bits[:2]);r=records[key]
        prompt=link(key,'Verbatim full-scene and layer prompts')
        if len(bits)==3:
            layer=bits[2];data=r['layers'][layer];tries=data.get('tries',1)+data.get('colour_edit_tries',0)
            notes='Opaque painted continuation.' if layer=='back' else 'Registered transparent plane.'
            if key=='story-3' and layer=='back':notes+=' Cold sky correction.'
            if key=='story-4' and layer=='mid':notes+=' Pale snow edge warning visually reviewed.'
        else:
            tries=r.get('tries',1);notes='Delivered full image is the pixel-exact stack of exported planes.'
    elif a['kind']=='part':
        view=Path(a['path']).parent.name;part=Path(a['path']).stem
        if part=='head-blink':
            key='characters2-blinks-'+('a' if name in ('tobin','ostra') else 'b')
            prompt=link(key,'Eye-only generated edit')+'; '+link(f'{name}-{view}-parts','Original head sheet')
            notes='Only eye rectangles transferred; outline and all other pixels identical.'
        elif part=='torso':
            key=f'{name}-{view}-torso-fix' if f'{name}-{view}-torso-fix' in records else f'{name}-torso-fix'
            prompt=link(key)+'; '+link(f'{name}-{view}-parts','Initial sheet')
            tries=3 if name=='ruta' else 2;notes='Regenerated sleeveless torso; correct view and collar overlap.'
        else:
            key=f'{name}-{view}-parts';prompt=link(key)
            notes='Generated parts sheet; cut out and registered to unchanged rig.'
    else:
        key=aid;r=records[key];prompt=link(key);tries=r.get('tries',1)
        notes=r.get('rejected','')
        if aid.endswith('-turnaround'):notes='Original model generated first; delivered neutral restacked from final registered parts.'
        elif aid.endswith('-pose-dead'):notes='Generated frost edit of final collapse frame; same lying bounds.'
        elif aid.startswith('icon-'):notes+=' Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px.'
    if aid in ('ruta-front-arm-left','ruta-front-torso'):
        prompt+='; '+link('ruta-cross-cleanup','Local duplicate-cross edit')
        tries+=1;notes+=' Removed only the duplicated far-side cross; physical near-side cross retained.'
    lines.append(f'| `{aid}` | {prompt} | {tries} | {notes.replace(chr(10)," ")} |')

lines += ['','### Neck corrections, interface and creature review','',
          'The following worker review records both requested batch-one neck corrections, the icon family, Shade movement warnings, wordmark spelling and retries.','',
          (OUT/'LOG-mara-ui-shade.md').read_text().replace('# Mara correction and batch 2 interface/creatures','#### Mara correction and batch 2 interface/creatures').replace('## Esk follow-up neck correction','#### Esk follow-up neck correction'),
          '', '### Story review','',
          'See [story processing and per-plane validation](STORY-BATCH2-LOG.md), including exact layer reconstruction, painted continuations, cast-reference correction and reviewed pale snow edges.',
          '', '### Ruta finishing details','',
          (OUT/'LOG-ruta-finish.md').read_text().replace('## Ruta finishing and review','#### Ruta finishing and review'),
          '', 'Final survivor strict checks: Tobin41 PASS/0 WARN, Ostra40 PASS/1 WARN, Pim40 PASS/1 WARN, Ruta40 PASS/1 WARN; every survivor has0 FAIL and0 missing. The three warnings are the reviewed standing-to-lying collapse motion,14px for Ostra,26px for Pim and31px for Ruta.']
(OUT/'LOG.md').write_text(old+'\n'+'\n'.join(lines)+'\n')
print(f'Indexed {len(assets)} batch-two assets; preserved batch-one log.')
