#!/usr/bin/env python3
"""Final registration of the generated character art to the shared rig."""
import json
from PIL import Image
from prepare_generated import ROOT, OUT, content
from check_art import stack_view

rig=json.loads((ROOT/'rig.json').read_text())
for name in ('esk','mara'):
    # The delivered neutral model is rebuilt from the final registered parts.
    # All later generation used the original model-sheet design as reference.
    turnaround=Image.new('RGBA',(960,320))
    for i,view in enumerate(('front','side','back')):
        turnaround.alpha_composite(stack_view(OUT,name,view,rig),(i*320,0))
    turnaround.save(OUT/'characters'/name/'turnaround.png')
    path=OUT/'characters'/name/'poses'
    if not (path/'dead.png').exists():
        continue
    last=Image.open(path/'collapse.png').convert('RGBA').crop((960,0,1280,320))
    box=last.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    frost=content(Image.open(path/'dead.png').convert('RGBA'))
    frost=frost.resize((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
    dead=Image.new('RGBA',(320,320))
    dead.alpha_composite(frost,box[:2])
    dead.save(path/'dead.png')
