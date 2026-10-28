#!/usr/bin/env python3
"""Register the generated closed-eye edit, retaining original pixels elsewhere."""
import json
from pathlib import Path
from PIL import Image
from prepare_generated import content, OUT

source=json.loads((OUT/'provenance/head-blinks.json').read_text())['path']
sheet=Image.open(source).convert('RGBA')
rows=[('esk','front',[(142,124,154,139),(168,124,180,139)]),
      ('esk','side',[(200,123,212,141)]),
      ('mara','front',[(140,104,155,122),(168,104,183,122)]),
      ('mara','side',[(194,103,209,121)])]
for i,(name,view,eyes) in enumerate(rows):
    path=OUT/'characters'/name/view
    original=Image.open(path/'head.png').convert('RGBA')
    box=content(original).size
    bbox=original.getchannel('A').point(lambda x:255 if x>=128 else 0).getbbox()
    edited=content(sheet.crop((i*sheet.width//4,0,(i+1)*sheet.width//4,sheet.height)))
    edited=edited.resize((bbox[2]-bbox[0],bbox[3]-bbox[1]),Image.Resampling.LANCZOS)
    registered=Image.new('RGBA',(320,320))
    registered.alpha_composite(edited,bbox[:2])
    out=original.copy()
    for eye in eyes:
        out.paste(registered.crop(eye),eye[:2])
    out.save(path/'head-blink.png')
