## Ruta finishing and review

Ruta's individual front/side/back sleeveless torso replacements were registered and the neutral turnaround restacked. The shared initial torso correction sheet still had sleeves, so final torso sources are `ruta-front-torso-fix.json`, `ruta-side-torso-fix.json`, and `ruta-back-torso-fix.json`.

The generated front left sleeve and underlying torso both carried unwanted extra red cross patches. A targeted generated edit removed these two cross marks; only the local registered rectangles were transferred, preserving every pixel elsewhere. The front viewer-right/side near-arm cross remains. [Verbatim cleanup prompt and source](provenance/ruta-cross-cleanup.json), one generation try. Cleanup is reproducible with `tools/remaining2_ruta.py <source>`.

All nine animations and GIFs were composed using the unchanged rig/poses. Reviewed every decoded GIF frame in `contact-animations-ruta.png`: hood/scarf neck remains connected, arms/legs rotate without opening gaps, the short coat leaves boot/leg swing visible, and the medical roll follows the torso. Poses use the original turnaround as the design reference; all matching eat/collapse frames were generated together and processed with a shared scale.

Final strict result after the frost-crusted dead pose was delivered: `check_art.py --id ruta --strict`: 40 PASS, 1 WARN, 0 FAIL, 0 missing. The collapse warning records 31px of sideways body movement during the deliberate standing-to-lying action; reviewed against the four clear steps and stable ground line. Final full contact sheet and frost pose reviewed; dead matches final collapse silhouette, closed eyes and ground position with a thin crisp frost crust on top edges.
