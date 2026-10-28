# Art

Art the game uses in place of the code-built fallbacks. Anything missing falls back. These files are imported from the Codex art batches on the `art/codex` branch (`art-codex/out/`, made to the brief in `art-codex/BRIEF.md` there) by `scripts/import-codex-art.py`, so re-run the script rather than editing them by hand.

| File | What | Notes |
|---|---|---|
| `rock.png` `dirt.png` `coal.png` `water.png` | Terrain fill textures | Seamless, 512 px. One image spans 4 x 4 cells. |
| `backwall.png` | Cave back wall | Seamless, 512 px. One image spans 8 x 8 cells. |
| `hearth.png` | Hearth base, no flame | 192 px per cell, bottom-aligned, like every sprite below. |
| `flame.png` | Flame loop | 8 frames side by side. |
| `ladder.png` | One ladder section | Tiles vertically. |
| `mushroom-bed.png` | Mushroom bed, ready | `-seedling` and `-growing` are the earlier growth stages (not shown yet). |
| `diffuser.png` | Oxygen diffuser, on | `diffuser-off.png` is the off state (not shown yet). |
| `cairn.png` | Grave cairn | |
| `bed.png` | Cot | Sleepers are drawn on top of it. |
| `lamp.png` | Lamp, lit | `lamp-off.png` is the unlit state (not shown yet). |
| `survivor-N-<anim>.png` | Survivor N's animation strips | N is 0 (Esk) or 1 (Mara). Square 192 px frames, feet 10 px above the bottom. idle 4, walk 6, dig 4, build 3, carry 6, climb 4, celebrate 3, cold 3, sleep 2, eat 3, collapse 4, dead 1. |
| `survivor-N-portrait.png` | Roster portrait | 128 px. |
| `story-1.jpg` | Title screen illustration | From the first AI art batch, until the new story scenes arrive. |
