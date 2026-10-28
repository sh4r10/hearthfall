# Art

Cleaned-up art the game uses in place of the code-built fallbacks. Anything missing falls back. These files are generated from the raw AI images by `scripts/process-art.py` (the raw images live in the project files, `hearthfall/art-src/`), so re-run the script rather than editing them by hand.

| File | What | Notes |
|---|---|---|
| `rock.png` `dirt.png` `coal.png` | Terrain fill textures | Seamless, 512 px. One image spans 4 × 4 cells. |
| `backwall.png` | Cave back wall | Seamless, 512 px. One image spans 8 × 8 cells. |
| `hearth.png` | Hearth base, no flame | Bottom-aligned. |
| `flame.png` | Flame loop | 8 frames side by side, bottom-aligned, on transparent. |
| `ladder.png` | One ladder section | Tiles vertically. |
| `mushroom-bed.png` | Mushroom bed | |
| `diffuser.png` | Oxygen diffuser | |
| `survivor-N-front.png` | Survivor N, front view | N is 0 (male) or 1 (female). Used standing about, and for the roster portrait. |
| `survivor-N-side.png` | Survivor N, side view facing right | Cut at the coat hem for walking: the legs are drawn separately. |
| `survivor-N-leg0.png` `survivor-N-leg1.png` | Boots and trousers, front and side | `leg1` swings under the side view. |
| `story-1.jpg` | Title screen illustration | |

Prompts are in `docs/art-prompts.md`, and the style rules in `docs/art-brief.md`.
