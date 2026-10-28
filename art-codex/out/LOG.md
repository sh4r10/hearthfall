# Art batch 1 generation log

Generated with the built-in image generation tool. No API/CLI fallback or placeholder art was used.
The linked provenance JSON files contain the final prompts verbatim, source image locations, references where recorded, and generation attempt counts. Shared parts sheets have one prompt serving each listed part.

## Processing and review

- Transparent generated sheets were cut by connected alpha regions rather than trusting approximate cell boundaries. Parts were registered to the pivots in the unchanged rig; caps extend into their parent parts.
- Images were delivered as 8-bit RGB/RGBA PNGs and resized with Lanczos. Multi-frame sheets use a shared scale so figures and effects do not grow between frames.
- Blink edits were generated as a sheet; only eye rectangles were transferred to the original heads, leaving every other pixel unchanged.
- Delivered turnarounds are restacked from the final registered parts, so neutral layer reconstruction matches exactly. Generation references were the original turnaround designs. Frosted dead poses are registered to the final collapse-frame bounds.
- Building variants use the first generated state as reference. Cleanup retains common structural pixels; the diffuser and stockpile use matching states supplied together in their initial generated sheet.
- Animations were built with compose_character.py. GIF frames are decoded into the animation contact sheets for frame-by-frame and loop-boundary review.
- No manifest, rig or motion specification was changed.

## Specification notes

- The cold-pose rows request gritted teeth, whereas the general face construction forbids teeth except for Pim. These poses follow the specific cold-pose request.
- Collapse warnings about sideways movement are reviewed as the intentional change from standing to lying; the ground remains fixed.
- The checker can flag saturated fire colours and pale effect edges. These are reviewed against the specified fire and frost palettes, rather than treated as permission to add glow.

## Deliverables and final prompts

| Asset | Final prompt / construction | Generation tries | Notes |
|---|---|---:|---|
| `esk-turnaround` | [Verbatim prompt](provenance/esk-turnaround.json) | 1 |  |
| `esk-portrait` | [Verbatim prompt](provenance/esk-portrait.json) | 1 |  |
| `esk-side-head` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-side-head-blink` | [Verbatim prompt](provenance/head-blinks.json) | 1 |  |
| `esk-side-torso` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-side-scarf` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-side-arm-front` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-side-arm-back` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-side-leg-front` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-side-leg-back` | [Verbatim prompt](provenance/esk-side-parts.json) | 1 |  |
| `esk-front-head` | [Verbatim prompt](provenance/esk-front-parts.json) | 1 |  |
| `esk-front-head-blink` | [Verbatim prompt](provenance/head-blinks.json) | 1 |  |
| `esk-front-torso` | [Verbatim prompt](provenance/esk-front-parts.json) | 1 |  |
| `esk-front-arm-left` | [Verbatim prompt](provenance/esk-front-parts.json) | 1 |  |
| `esk-front-arm-right` | [Verbatim prompt](provenance/esk-front-parts.json) | 1 |  |
| `esk-front-leg-left` | [Verbatim prompt](provenance/esk-front-parts.json) | 1 |  |
| `esk-front-leg-right` | [Verbatim prompt](provenance/esk-front-parts.json) | 1 |  |
| `esk-back-head` | [Verbatim prompt](provenance/esk-back-parts.json) | 1 |  |
| `esk-back-torso` | [Verbatim prompt](provenance/esk-back-parts.json) | 1 |  |
| `esk-back-arm-left` | [Verbatim prompt](provenance/esk-back-parts.json) | 1 |  |
| `esk-back-arm-right` | [Verbatim prompt](provenance/esk-back-parts.json) | 1 |  |
| `esk-back-leg-left` | [Verbatim prompt](provenance/esk-back-parts.json) | 1 |  |
| `esk-back-leg-right` | [Verbatim prompt](provenance/esk-back-parts.json) | 1 |  |
| `esk-pose-sleep-ground` | [Verbatim prompt](provenance/esk-pose-sleep-ground.json) | 1 |  |
| `esk-pose-sleep-back` | [Verbatim prompt](provenance/esk-pose-sleep-back.json) | 1 |  |
| `esk-pose-eat` | [Verbatim prompt](provenance/esk-pose-eat.json) | 1 |  |
| `esk-pose-cold` | [Verbatim prompt](provenance/esk-pose-cold.json) | 1 |  |
| `esk-pose-collapse` | [Verbatim prompt](provenance/esk-pose-collapse.json) | 1 |  |
| `esk-pose-dead` | [Verbatim prompt](provenance/esk-pose-dead.json) | 1 |  |
| `esk-anim-idle` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-walk` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-dig` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-build` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-carry` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-climb` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-celebrate` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-cold` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `esk-anim-sleep` | `python3 art-codex/tools/compose_character.py esk`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-turnaround` | [Verbatim prompt](provenance/mara-turnaround.json) | 1 |  |
| `mara-portrait` | [Verbatim prompt](provenance/mara-portrait.json) | 1 |  |
| `mara-side-head` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-side-head-blink` | [Verbatim prompt](provenance/head-blinks.json) | 1 |  |
| `mara-side-torso` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-side-scarf` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-side-arm-front` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-side-arm-back` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-side-leg-front` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-side-leg-back` | [Verbatim prompt](provenance/mara-side-parts.json) | 1 |  |
| `mara-front-head` | [Verbatim prompt](provenance/mara-front-parts.json) | 1 |  |
| `mara-front-head-blink` | [Verbatim prompt](provenance/head-blinks.json) | 1 |  |
| `mara-front-torso` | [Verbatim prompt](provenance/mara-front-parts.json) | 1 |  |
| `mara-front-arm-left` | [Verbatim prompt](provenance/mara-front-parts.json) | 1 |  |
| `mara-front-arm-right` | [Verbatim prompt](provenance/mara-front-parts.json) | 1 |  |
| `mara-front-leg-left` | [Verbatim prompt](provenance/mara-front-parts.json) | 1 |  |
| `mara-front-leg-right` | [Verbatim prompt](provenance/mara-front-parts.json) | 1 |  |
| `mara-back-head` | [Verbatim prompt](provenance/mara-back-parts.json) | 1 |  |
| `mara-back-torso` | [Verbatim prompt](provenance/mara-back-parts.json) | 1 |  |
| `mara-back-arm-left` | [Verbatim prompt](provenance/mara-back-parts.json) | 1 |  |
| `mara-back-arm-right` | [Verbatim prompt](provenance/mara-back-parts.json) | 1 |  |
| `mara-back-leg-left` | [Verbatim prompt](provenance/mara-back-parts.json) | 1 |  |
| `mara-back-leg-right` | [Verbatim prompt](provenance/mara-back-parts.json) | 1 |  |
| `mara-pose-sleep-ground` | [Verbatim prompt](provenance/mara-pose-sleep-ground.json) | 1 |  |
| `mara-pose-sleep-back` | [Verbatim prompt](provenance/mara-pose-sleep-back.json) | 1 |  |
| `mara-pose-eat` | [Verbatim prompt](provenance/mara-pose-eat.json) | 1 |  |
| `mara-pose-cold` | [Verbatim prompt](provenance/mara-pose-cold.json) | 1 |  |
| `mara-pose-collapse` | [Verbatim prompt](provenance/mara-pose-collapse.json) | 1 |  |
| `mara-pose-dead` | [Verbatim prompt](provenance/mara-pose-dead.json) | 1 |  |
| `mara-anim-idle` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-walk` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-dig` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-build` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-carry` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-climb` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-celebrate` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-cold` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `mara-anim-sleep` | `python3 art-codex/tools/compose_character.py mara`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `prop-pickaxe` | [Verbatim prompt](provenance/prop-pickaxe.json) | 1 |  |
| `prop-hammer` | [Verbatim prompt](provenance/prop-hammer.json) | 1 |  |
| `prop-coal-sack` | [Verbatim prompt](provenance/prop-coal-sack.json) | 1 |  |
| `prop-lantern` | [Verbatim prompt](provenance/prop-lantern.json) | 1 |  |
| `item-coal-chunk` | [Verbatim prompt](provenance/item-coal-chunk.json) | 1 |  |
| `item-ration` | [Verbatim prompt](provenance/item-ration.json) | 1 |  |
| `tex-rock` | [Verbatim prompt](provenance/tex-rock.json) | 1 |  |
| `tex-dirt` | [Verbatim prompt](provenance/tex-dirt.json) | 1 |  |
| `tex-coal` | [Verbatim prompt](provenance/tex-coal.json) | 1 |  |
| `tex-backwall` | [Verbatim prompt](provenance/tex-backwall.json) | 1 |  |
| `tex-water` | [Verbatim prompt](provenance/tex-water.json) | 1 |  |
| `water-surface` | [Verbatim prompt](provenance/water-surface.json) | 1 |  |
| `building-hearth` | [Verbatim prompt](provenance/building-hearth.json) | 1 |  |
| `building-ladder` | [Verbatim prompt](provenance/building-ladder.json) | 1 |  |
| `building-mushroom-bed-seedling` | [Verbatim prompt](provenance/building-mushroom-bed-seedling.json) | 1 |  |
| `building-mushroom-bed-growing` | [Verbatim prompt](provenance/building-mushroom-bed-growing.json) | 1 |  |
| `building-mushroom-bed-ready` | [Verbatim prompt](provenance/building-mushroom-bed-ready.json) | 1 |  |
| `building-diffuser-off` | [Verbatim prompt](provenance/building-diffuser-off.json) | 1 |  |
| `building-diffuser-on` | [Verbatim prompt](provenance/building-diffuser-off.json) | 2 |  Matching state selected from the initial shared sheet; separate state edit discarded to retain structure. |
| `building-bed-empty` | [Verbatim prompt](provenance/building-bed-empty.json) | 1 |  |
| `building-lamp-off` | [Verbatim prompt](provenance/building-lamp-off.json) | 2 | Initial off-state glass was yellow; edited to cold grey-blue. |
| `building-lamp-on` | [Verbatim prompt](provenance/building-lamp-on.json) | 1 |  |
| `building-grave` | [Verbatim prompt](provenance/building-grave.json) | 1 |  |
| `building-stockpile-empty` | [Verbatim prompt](provenance/building-stockpile-empty.json) | 1 |  |
| `building-stockpile-half` | [Verbatim prompt](provenance/building-stockpile-empty.json) | 2 |  Matching state selected from the initial shared sheet; separate state edit discarded to retain structure. |
| `building-stockpile-full` | [Verbatim prompt](provenance/building-stockpile-empty.json) | 2 |  Matching state selected from the initial shared sheet; separate state edit discarded to retain structure. |
| `anim-flame` | [Verbatim prompt](provenance/anim-flame.json) | 2 | First generation included logs and a hearth; regenerated as isolated flames. |
| `fx-debris-rock` | [Verbatim prompt](provenance/fx-debris-rock.json) | 1 |  |
| `fx-debris-dirt` | [Verbatim prompt](provenance/fx-debris-dirt.json) | 1 |  |
| `fx-debris-coal` | [Verbatim prompt](provenance/fx-debris-coal.json) | 2 | First generation incorrectly included a miner. |
| `fx-smoke-puff` | [Verbatim prompt](provenance/fx-smoke-puff.json) | 1 |  |
| `fx-breath-mist` | [Verbatim prompt](provenance/fx-breath-mist.json) | 2 | Initial effect included an unwanted character or water column; regenerated as an isolated effect. |
| `fx-frost-overlay` | [Verbatim prompt](provenance/fx-frost-overlay.json) | 2 | Initial effect included an unwanted character or water column; regenerated as an isolated effect. |
| `fx-falling-water` | [Verbatim prompt](provenance/fx-falling-water.json) | 1 |  |
| `fx-splash` | [Verbatim prompt](provenance/fx-splash.json) | 2 | Initial effect included an unwanted character or water column; regenerated as an isolated effect. |
