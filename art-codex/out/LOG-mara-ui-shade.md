# Mara correction and batch 2 interface/creatures

All source art used the built-in image generation tool, with genuine generated alpha. Verbatim final prompts and attempt counts are linked below.

Mara's replacement front, side and back heads include a broad teal neck/collar stub, registered with the hat top at y54 and collar base at about y188. The hanging braid continues to y203; that lower head bounding box is intentional. The stub overlaps the torso collar without changing any rig pivots. Head-blink assets retain every pixel outside the eye rectangles, transferred from the generated closed-eye edit. The three replacement heads, two blinks, restacked turnaround, seven affected animation strips and their GIFs were rebuilt. `check_art.py --id mara`: 41 PASS, 0 WARN, 0 FAIL, 0 missing. Decoded GIF frames reviewed in `contact-animations-mara.png`: neck remains connected through tilts, swings, walk, carry and climb.

| Assets | Prompt | Tries | Notes |
|---|---|---:|---|
| Mara head, front/side/back | [Neck fix](provenance/mara-neck-fix.json) | 1 | Replaces the batch 1 heads; broad painted collar closes the gap. |
| Mara head-blink, front/side | [Eye edit](provenance/mara-neck-blinks.json) | 1 | Eyes only; identical outline. Back view has no blink in the manifest. |
| Mara turnaround and animations | `compose_character.py mara`; neutral turnaround restacked from corrected parts | 0 | PNG/GIF outputs, unchanged rig and poses. |
| `icon-dig` | [Verbatim prompt](provenance/icon-dig.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-cancel` | [Verbatim prompt](provenance/icon-cancel.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-ladder` | [Verbatim prompt](provenance/icon-ladder.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-hearth` | [Verbatim prompt](provenance/icon-hearth.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-mushroom-bed` | [Verbatim prompt](provenance/icon-mushroom-bed.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-diffuser` | [Verbatim prompt](provenance/icon-diffuser.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-bed` | [Verbatim prompt](provenance/icon-bed.json) | 2 | First fine-detail source rejected at20px; regenerated as chunky platform/legs or solid lantern with flame cutout. Normalized to pure-white RGB and16px clear margin. |
| `icon-lamp` | [Verbatim prompt](provenance/icon-lamp.json) | 2 | First fine-detail source rejected at20px; regenerated as chunky platform/legs or solid lantern with flame cutout. Normalized to pure-white RGB and16px clear margin. |
| `icon-coal` | [Verbatim prompt](provenance/icon-coal.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-food` | [Verbatim prompt](provenance/icon-food.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-survivors` | [Verbatim prompt](provenance/icon-survivors.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-warmth` | [Verbatim prompt](provenance/icon-warmth.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-breath` | [Verbatim prompt](provenance/icon-breath.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-energy` | [Verbatim prompt](provenance/icon-energy.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-hunger` | [Verbatim prompt](provenance/icon-hunger.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-mood` | [Verbatim prompt](provenance/icon-mood.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-sleep` | [Verbatim prompt](provenance/icon-sleep.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-death` | [Verbatim prompt](provenance/icon-death.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-day` | [Verbatim prompt](provenance/icon-day.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `icon-night` | [Verbatim prompt](provenance/icon-night.json) | 1 | Generated glyph resized to 96px within 16px clear margins; RGB normalized to pure white while preserving alpha. |
| `creature-shade-drift` | [Verbatim prompt](provenance/creature-shade-drift.json) | 1 | Matching frames generated together, same scale and flat smoke shapes. |
| `creature-shade-lunge` | [Verbatim prompt](provenance/creature-shade-lunge.json) | 1 | Matching frames generated together, same scale and flat smoke shapes. |
| `creature-shade-recoil` | [Verbatim prompt](provenance/creature-shade-recoil.json) | 1 | Matching frames generated together, same scale and flat smoke shapes. |

Shade frame registration uses one shared source scale across all three animations and recovers full figures across the generated sheet's approximate cell boundaries, so the extended lunge arms remain complete. Lunge and recoil produce centre-of-mass warnings of 24px and 14px respectively; reviewed as intentional forward thrust and shielding/withdrawal, with body scale and ground row stable. The drift returns smoothly to its first upright pose. Technical result: 1 PASS, 2 WARN, 0 FAIL, 0 missing.

| Asset | Prompt | Tries | Notes |
|---|---|---:|---|
| `wordmark` | [Verbatim final edit prompt](provenance/wordmark.json) | 3 | First source rejected for painterly woodgrain/bevels; second had oversized flame at apex. Final edit preserves flat letters and puts a tiny flame on the first A crossbar. Exact spelling visually checked: HEARTHFALL. Saturation warning is the permitted ember-orange top edges. |

Final interface validation: `check_art.py --id icon` gives20 PASS,0 WARN,0 FAIL,0 missing. Reviewed `contact-sheet-icon.png` and actual20px glyphs enlarged with nearest-neighbour in `contact-icons-20px.png`; simplified cot and lantern retain clear silhouettes.

## Esk follow-up neck correction

The user requested the same correction for Esk. All three heads were regenerated with his pointed slate hood, brass goggles, grey ruff, determined face and a broad attached rust scarf/neck stub reaching y188. No pivots or torso files changed. The turnaround was restacked and all nine animations/GIFs rebuilt with `compose_character.py esk`. Front and side blink images transfer ONLY the closed-eye rectangles from a generated edit; all other pixels match the new open-eye heads. No back blink is requested by the manifest.

| Assets | Prompt | Tries | Notes |
|---|---|---:|---|
| Esk heads, front/side/back | [Neck fix](provenance/esk-neck-fix.json) | 1 | Broad rust neck stub covers the neck pivot and reaches y188. |
| Esk head-blink, front/side | [Eye edit](provenance/esk-neck-blinks.json) | 1 | Every changed pixel is confined to front eyes at x141..181/y120..133 and side eye at x190..203/y119..132. |
| Esk turnaround and animations | Neutral restack; `compose_character.py esk` | 0 | Unchanged rig/poses. |

`check_art.py --id esk --strict`:40 PASS,1 WARN,0 FAIL,0 missing. The existing collapse pose sideways movement warning is the deliberate standing-to-lying action from batch1. Reviewed all decoded GIF frames in `contact-animations-esk.png`: scarf/collar remains continuous through head tilts, swings, carry, walk and climb.
