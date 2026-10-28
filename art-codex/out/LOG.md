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

## Batch 2 delivery

All source artwork used the built-in image generation tool. The table indexes every one of the 200 batch-two manifest files. Linked provenance records preserve verbatim final prompts, original source locations, references and attempts. Shared sheets supply the listed matching parts or frames. No API/CLI fallback or substitute placeholder artwork was used.

### Character processing and review

- Tobin, Ostra, Pim and Ruta each began with an independently generated three-view turnaround. All later character prompts attach that original design reference and request the same character, proportions and colours. The original references remain recorded even though the delivered turnarounds are restacked from registered final parts.
- Transparent parts were isolated by connected alpha regions, then registered to the unchanged 320px rig. Head/collar parts extend to y188; coat collars begin at y160. Limbs have rounded caps extending14px over their pivots, and coat hems overlap the thighs. Tobin keeps his120px-wide front/back body and broader boots. No pivots or animation specifications changed.
- Initial torso extractions included unwanted sleeve stubs or frontal profiles. Regenerated sleeveless torso parts fix those; Ostra's six-patch shawl now reaches nearly to the coat hem, Pim's satchel includes both spoon and gear, and Ruta's panels sit inside the body silhouette.
- Blink heads use generated eye edits transferred only inside eye rectangles. Every other pixel, including the full outline and neck stub, remains identical to the open-eye head. The two blink review sheets show these changes.
- Whole-body multi-frame poses were generated together and normalized with one shared scale per strip. Dead poses are generated frost edits of each final collapse frame and are registered to that frame's bounds. The generic sleep instruction to pull a hood up is interpreted as coat fabric around characters whose design uses a hat or earmuffs.
- All nine animations per survivor were built with compose_character.py. Every decoded GIF frame was reviewed in contact-animations-<name>.png, including loop boundaries, tool swing, head tilt and joint overlap. Collapse sideways movement warnings are intentional changes from standing to lying, with a stable ground row. Ostra's folded/hugged shawl drape in painted poses was visually reviewed against her corrected neutral model.
- Source generation is resized with Lanczos to exact8-bit RGB/RGBA PNG dimensions. Portraits, poses and sprites preserve true generated transparency.

### Complete batch-two manifest index

| Asset | Final prompt / construction | Generation tries | Notes |
|---|---|---:|---|
| `tobin-turnaround` | [Verbatim prompt](provenance/tobin-turnaround.json) | 1 | Original model generated first; delivered neutral restacked from final registered parts. |
| `tobin-portrait` | [Verbatim prompt](provenance/tobin-portrait.json) | 1 |  |
| `tobin-side-head` | [Verbatim prompt](provenance/tobin-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-side-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-a.json); [Original head sheet](provenance/tobin-side-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `tobin-side-torso` | [Verbatim prompt](provenance/tobin-side-torso-fix.json); [Initial sheet](provenance/tobin-side-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `tobin-side-scarf` | [Verbatim prompt](provenance/tobin-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-side-arm-front` | [Verbatim prompt](provenance/tobin-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-side-arm-back` | [Verbatim prompt](provenance/tobin-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-side-leg-front` | [Verbatim prompt](provenance/tobin-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-side-leg-back` | [Verbatim prompt](provenance/tobin-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-front-head` | [Verbatim prompt](provenance/tobin-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-front-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-a.json); [Original head sheet](provenance/tobin-front-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `tobin-front-torso` | [Verbatim prompt](provenance/tobin-front-torso-fix.json); [Initial sheet](provenance/tobin-front-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `tobin-front-arm-left` | [Verbatim prompt](provenance/tobin-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-front-arm-right` | [Verbatim prompt](provenance/tobin-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-front-leg-left` | [Verbatim prompt](provenance/tobin-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-front-leg-right` | [Verbatim prompt](provenance/tobin-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-back-head` | [Verbatim prompt](provenance/tobin-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-back-torso` | [Verbatim prompt](provenance/tobin-back-torso-fix.json); [Initial sheet](provenance/tobin-back-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `tobin-back-arm-left` | [Verbatim prompt](provenance/tobin-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-back-arm-right` | [Verbatim prompt](provenance/tobin-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-back-leg-left` | [Verbatim prompt](provenance/tobin-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-back-leg-right` | [Verbatim prompt](provenance/tobin-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `tobin-pose-sleep-ground` | [Verbatim prompt](provenance/tobin-pose-sleep-ground.json) | 1 |  |
| `tobin-pose-sleep-back` | [Verbatim prompt](provenance/tobin-pose-sleep-back.json) | 1 |  |
| `tobin-pose-eat` | [Verbatim prompt](provenance/tobin-pose-eat.json) | 1 |  |
| `tobin-pose-cold` | [Verbatim prompt](provenance/tobin-pose-cold.json) | 1 |  |
| `tobin-pose-collapse` | [Verbatim prompt](provenance/tobin-pose-collapse.json) | 1 |  |
| `tobin-pose-dead` | [Verbatim prompt](provenance/tobin-pose-dead.json) | 1 | Generated frost edit of final collapse frame; same lying bounds. |
| `tobin-anim-idle` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-walk` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-dig` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-build` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-carry` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-climb` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-celebrate` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-cold` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `tobin-anim-sleep` | `python3 art-codex/tools/compose_character.py tobin`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-turnaround` | [Verbatim prompt](provenance/ostra-turnaround.json) | 1 | Original model generated first; delivered neutral restacked from final registered parts. |
| `ostra-portrait` | [Verbatim prompt](provenance/ostra-portrait.json) | 1 |  |
| `ostra-side-head` | [Verbatim prompt](provenance/ostra-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-side-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-a.json); [Original head sheet](provenance/ostra-side-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `ostra-side-torso` | [Verbatim prompt](provenance/ostra-torso-fix.json); [Initial sheet](provenance/ostra-side-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `ostra-side-scarf` | [Verbatim prompt](provenance/ostra-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-side-arm-front` | [Verbatim prompt](provenance/ostra-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-side-arm-back` | [Verbatim prompt](provenance/ostra-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-side-leg-front` | [Verbatim prompt](provenance/ostra-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-side-leg-back` | [Verbatim prompt](provenance/ostra-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-front-head` | [Verbatim prompt](provenance/ostra-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-front-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-a.json); [Original head sheet](provenance/ostra-front-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `ostra-front-torso` | [Verbatim prompt](provenance/ostra-torso-fix.json); [Initial sheet](provenance/ostra-front-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `ostra-front-arm-left` | [Verbatim prompt](provenance/ostra-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-front-arm-right` | [Verbatim prompt](provenance/ostra-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-front-leg-left` | [Verbatim prompt](provenance/ostra-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-front-leg-right` | [Verbatim prompt](provenance/ostra-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-back-head` | [Verbatim prompt](provenance/ostra-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-back-torso` | [Verbatim prompt](provenance/ostra-torso-fix.json); [Initial sheet](provenance/ostra-back-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `ostra-back-arm-left` | [Verbatim prompt](provenance/ostra-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-back-arm-right` | [Verbatim prompt](provenance/ostra-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-back-leg-left` | [Verbatim prompt](provenance/ostra-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-back-leg-right` | [Verbatim prompt](provenance/ostra-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ostra-pose-sleep-ground` | [Verbatim prompt](provenance/ostra-pose-sleep-ground.json) | 1 |  |
| `ostra-pose-sleep-back` | [Verbatim prompt](provenance/ostra-pose-sleep-back.json) | 1 |  |
| `ostra-pose-eat` | [Verbatim prompt](provenance/ostra-pose-eat.json) | 1 |  |
| `ostra-pose-cold` | [Verbatim prompt](provenance/ostra-pose-cold.json) | 1 |  |
| `ostra-pose-collapse` | [Verbatim prompt](provenance/ostra-pose-collapse.json) | 1 |  |
| `ostra-pose-dead` | [Verbatim prompt](provenance/ostra-pose-dead.json) | 1 | Generated frost edit of final collapse frame; same lying bounds. |
| `ostra-anim-idle` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-walk` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-dig` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-build` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-carry` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-climb` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-celebrate` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-cold` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ostra-anim-sleep` | `python3 art-codex/tools/compose_character.py ostra`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-turnaround` | [Verbatim prompt](provenance/pim-turnaround.json) | 1 | Original model generated first; delivered neutral restacked from final registered parts. |
| `pim-portrait` | [Verbatim prompt](provenance/pim-portrait.json) | 1 |  |
| `pim-side-head` | [Verbatim prompt](provenance/pim-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-side-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-b.json); [Original head sheet](provenance/pim-side-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `pim-side-torso` | [Verbatim prompt](provenance/pim-torso-fix.json); [Initial sheet](provenance/pim-side-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `pim-side-scarf` | [Verbatim prompt](provenance/pim-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-side-arm-front` | [Verbatim prompt](provenance/pim-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-side-arm-back` | [Verbatim prompt](provenance/pim-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-side-leg-front` | [Verbatim prompt](provenance/pim-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-side-leg-back` | [Verbatim prompt](provenance/pim-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-front-head` | [Verbatim prompt](provenance/pim-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-front-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-b.json); [Original head sheet](provenance/pim-front-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `pim-front-torso` | [Verbatim prompt](provenance/pim-torso-fix.json); [Initial sheet](provenance/pim-front-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `pim-front-arm-left` | [Verbatim prompt](provenance/pim-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-front-arm-right` | [Verbatim prompt](provenance/pim-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-front-leg-left` | [Verbatim prompt](provenance/pim-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-front-leg-right` | [Verbatim prompt](provenance/pim-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-back-head` | [Verbatim prompt](provenance/pim-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-back-torso` | [Verbatim prompt](provenance/pim-torso-fix.json); [Initial sheet](provenance/pim-back-parts.json) | 2 | Regenerated sleeveless torso; correct view and collar overlap. |
| `pim-back-arm-left` | [Verbatim prompt](provenance/pim-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-back-arm-right` | [Verbatim prompt](provenance/pim-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-back-leg-left` | [Verbatim prompt](provenance/pim-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-back-leg-right` | [Verbatim prompt](provenance/pim-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `pim-pose-sleep-ground` | [Verbatim prompt](provenance/pim-pose-sleep-ground.json) | 1 |  |
| `pim-pose-sleep-back` | [Verbatim prompt](provenance/pim-pose-sleep-back.json) | 1 |  |
| `pim-pose-eat` | [Verbatim prompt](provenance/pim-pose-eat.json) | 1 |  |
| `pim-pose-cold` | [Verbatim prompt](provenance/pim-pose-cold.json) | 1 |  |
| `pim-pose-collapse` | [Verbatim prompt](provenance/pim-pose-collapse.json) | 1 |  |
| `pim-pose-dead` | [Verbatim prompt](provenance/pim-pose-dead.json) | 1 | Generated frost edit of final collapse frame; same lying bounds. |
| `pim-anim-idle` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-walk` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-dig` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-build` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-carry` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-climb` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-celebrate` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-cold` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `pim-anim-sleep` | `python3 art-codex/tools/compose_character.py pim`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-turnaround` | [Verbatim prompt](provenance/ruta-turnaround.json) | 1 | Original model generated first; delivered neutral restacked from final registered parts. |
| `ruta-portrait` | [Verbatim prompt](provenance/ruta-portrait.json) | 1 |  |
| `ruta-side-head` | [Verbatim prompt](provenance/ruta-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-side-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-b.json); [Original head sheet](provenance/ruta-side-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `ruta-side-torso` | [Verbatim prompt](provenance/ruta-side-torso-fix.json); [Initial sheet](provenance/ruta-side-parts.json) | 3 | Regenerated sleeveless torso; correct view and collar overlap. |
| `ruta-side-scarf` | [Verbatim prompt](provenance/ruta-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-side-arm-front` | [Verbatim prompt](provenance/ruta-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-side-arm-back` | [Verbatim prompt](provenance/ruta-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-side-leg-front` | [Verbatim prompt](provenance/ruta-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-side-leg-back` | [Verbatim prompt](provenance/ruta-side-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-front-head` | [Verbatim prompt](provenance/ruta-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-front-head-blink` | [Eye-only generated edit](provenance/characters2-blinks-b.json); [Original head sheet](provenance/ruta-front-parts.json) | 1 | Only eye rectangles transferred; outline and all other pixels identical. |
| `ruta-front-torso` | [Verbatim prompt](provenance/ruta-front-torso-fix.json); [Initial sheet](provenance/ruta-front-parts.json); [Local duplicate-cross edit](provenance/ruta-cross-cleanup.json) | 4 | Regenerated sleeveless torso; correct view and collar overlap. Removed only the duplicated far-side cross; physical near-side cross retained. |
| `ruta-front-arm-left` | [Verbatim prompt](provenance/ruta-front-parts.json); [Local duplicate-cross edit](provenance/ruta-cross-cleanup.json) | 2 | Generated parts sheet; cut out and registered to unchanged rig. Removed only the duplicated far-side cross; physical near-side cross retained. |
| `ruta-front-arm-right` | [Verbatim prompt](provenance/ruta-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-front-leg-left` | [Verbatim prompt](provenance/ruta-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-front-leg-right` | [Verbatim prompt](provenance/ruta-front-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-back-head` | [Verbatim prompt](provenance/ruta-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-back-torso` | [Verbatim prompt](provenance/ruta-back-torso-fix.json); [Initial sheet](provenance/ruta-back-parts.json) | 3 | Regenerated sleeveless torso; correct view and collar overlap. |
| `ruta-back-arm-left` | [Verbatim prompt](provenance/ruta-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-back-arm-right` | [Verbatim prompt](provenance/ruta-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-back-leg-left` | [Verbatim prompt](provenance/ruta-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-back-leg-right` | [Verbatim prompt](provenance/ruta-back-parts.json) | 1 | Generated parts sheet; cut out and registered to unchanged rig. |
| `ruta-pose-sleep-ground` | [Verbatim prompt](provenance/ruta-pose-sleep-ground.json) | 1 |  |
| `ruta-pose-sleep-back` | [Verbatim prompt](provenance/ruta-pose-sleep-back.json) | 1 |  |
| `ruta-pose-eat` | [Verbatim prompt](provenance/ruta-pose-eat.json) | 1 |  |
| `ruta-pose-cold` | [Verbatim prompt](provenance/ruta-pose-cold.json) | 1 |  |
| `ruta-pose-collapse` | [Verbatim prompt](provenance/ruta-pose-collapse.json) | 1 |  |
| `ruta-pose-dead` | [Verbatim prompt](provenance/ruta-pose-dead.json) | 1 | Generated frost edit of final collapse frame; same lying bounds. |
| `ruta-anim-idle` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-walk` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-dig` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-build` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-carry` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-climb` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-celebrate` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-cold` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `ruta-anim-sleep` | `python3 art-codex/tools/compose_character.py ruta`; unchanged rig and poses | 0 | Composed PNG and GIF preview. |
| `creature-shade-drift` | [Verbatim prompt](provenance/creature-shade-drift.json) | 1 |  |
| `creature-shade-lunge` | [Verbatim prompt](provenance/creature-shade-lunge.json) | 1 |  |
| `creature-shade-recoil` | [Verbatim prompt](provenance/creature-shade-recoil.json) | 1 |  |
| `icon-dig` | [Verbatim prompt](provenance/icon-dig.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-cancel` | [Verbatim prompt](provenance/icon-cancel.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-ladder` | [Verbatim prompt](provenance/icon-ladder.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-hearth` | [Verbatim prompt](provenance/icon-hearth.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-mushroom-bed` | [Verbatim prompt](provenance/icon-mushroom-bed.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-diffuser` | [Verbatim prompt](provenance/icon-diffuser.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-bed` | [Verbatim prompt](provenance/icon-bed.json) | 2 | First source had thin detailed elements that lost legibility at20px; regenerated as chunky solid silhouette with10px minimum features. Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-lamp` | [Verbatim prompt](provenance/icon-lamp.json) | 2 | First source had thin detailed elements that lost legibility at20px; regenerated as chunky solid silhouette with10px minimum features. Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-coal` | [Verbatim prompt](provenance/icon-coal.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-food` | [Verbatim prompt](provenance/icon-food.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-survivors` | [Verbatim prompt](provenance/icon-survivors.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-warmth` | [Verbatim prompt](provenance/icon-warmth.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-breath` | [Verbatim prompt](provenance/icon-breath.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-energy` | [Verbatim prompt](provenance/icon-energy.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-hunger` | [Verbatim prompt](provenance/icon-hunger.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-mood` | [Verbatim prompt](provenance/icon-mood.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-sleep` | [Verbatim prompt](provenance/icon-sleep.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-death` | [Verbatim prompt](provenance/icon-death.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-day` | [Verbatim prompt](provenance/icon-day.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `icon-night` | [Verbatim prompt](provenance/icon-night.json) | 1 |  Pure-white glyph RGB, generated alpha,96px extent within16px margins; reviewed at20px. |
| `wordmark` | [Verbatim prompt](provenance/wordmark.json) | 3 | First source had painterly woodgrain/bevels. Second flattened style correctly but oversized flame emerged from A apex. Third edit corrected a small flame on first A crossbar. |
| `story-1` | [Verbatim full-scene and layer prompts](provenance/story-1.json) | 2 | Delivered full image is the pixel-exact stack of exported planes. |
| `story-1-back` | [Verbatim full-scene and layer prompts](provenance/story-1.json) | 1 | Opaque painted continuation. |
| `story-1-mid` | [Verbatim full-scene and layer prompts](provenance/story-1.json) | 1 | Registered transparent plane. |
| `story-1-front` | [Verbatim full-scene and layer prompts](provenance/story-1.json) | 1 | Registered transparent plane. |
| `story-2` | [Verbatim full-scene and layer prompts](provenance/story-2.json) | 2 | Delivered full image is the pixel-exact stack of exported planes. |
| `story-2-back` | [Verbatim full-scene and layer prompts](provenance/story-2.json) | 1 | Opaque painted continuation. |
| `story-2-mid` | [Verbatim full-scene and layer prompts](provenance/story-2.json) | 1 | Registered transparent plane. |
| `story-2-front` | [Verbatim full-scene and layer prompts](provenance/story-2.json) | 1 | Registered transparent plane. |
| `story-3` | [Verbatim full-scene and layer prompts](provenance/story-3.json) | 2 | Delivered full image is the pixel-exact stack of exported planes. |
| `story-3-back` | [Verbatim full-scene and layer prompts](provenance/story-3.json) | 2 | Opaque painted continuation. Cold sky correction. |
| `story-3-mid` | [Verbatim full-scene and layer prompts](provenance/story-3.json) | 1 | Registered transparent plane. |
| `story-3-front` | [Verbatim full-scene and layer prompts](provenance/story-3.json) | 1 | Registered transparent plane. |
| `story-4` | [Verbatim full-scene and layer prompts](provenance/story-4.json) | 2 | Delivered full image is the pixel-exact stack of exported planes. |
| `story-4-back` | [Verbatim full-scene and layer prompts](provenance/story-4.json) | 1 | Opaque painted continuation. |
| `story-4-mid` | [Verbatim full-scene and layer prompts](provenance/story-4.json) | 1 | Registered transparent plane. Pale snow edge warning visually reviewed. |
| `story-4-front` | [Verbatim full-scene and layer prompts](provenance/story-4.json) | 1 | Registered transparent plane. |
| `story-5` | [Verbatim full-scene and layer prompts](provenance/story-5.json) | 3 | Delivered full image is the pixel-exact stack of exported planes. |
| `story-5-back` | [Verbatim full-scene and layer prompts](provenance/story-5.json) | 1 | Opaque painted continuation. |
| `story-5-mid` | [Verbatim full-scene and layer prompts](provenance/story-5.json) | 1 | Registered transparent plane. |
| `story-5-front` | [Verbatim full-scene and layer prompts](provenance/story-5.json) | 1 | Registered transparent plane. |
| `story-6` | [Verbatim full-scene and layer prompts](provenance/story-6.json) | 2 | Delivered full image is the pixel-exact stack of exported planes. |
| `story-6-back` | [Verbatim full-scene and layer prompts](provenance/story-6.json) | 1 | Opaque painted continuation. |
| `story-6-mid` | [Verbatim full-scene and layer prompts](provenance/story-6.json) | 1 | Registered transparent plane. |
| `story-6-front` | [Verbatim full-scene and layer prompts](provenance/story-6.json) | 1 | Registered transparent plane. |

### Neck corrections, interface and creature review

The following worker review records both requested batch-one neck corrections, the icon family, Shade movement warnings, wordmark spelling and retries.

#### Mara correction and batch 2 interface/creatures

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

#### Esk follow-up neck correction

The user requested the same correction for Esk. All three heads were regenerated with his pointed slate hood, brass goggles, grey ruff, determined face and a broad attached rust scarf/neck stub reaching y188. No pivots or torso files changed. The turnaround was restacked and all nine animations/GIFs rebuilt with `compose_character.py esk`. Front and side blink images transfer ONLY the closed-eye rectangles from a generated edit; all other pixels match the new open-eye heads. No back blink is requested by the manifest.

| Assets | Prompt | Tries | Notes |
|---|---|---:|---|
| Esk heads, front/side/back | [Neck fix](provenance/esk-neck-fix.json) | 1 | Broad rust neck stub covers the neck pivot and reaches y188. |
| Esk head-blink, front/side | [Eye edit](provenance/esk-neck-blinks.json) | 1 | Every changed pixel is confined to front eyes at x141..181/y120..133 and side eye at x190..203/y119..132. |
| Esk turnaround and animations | Neutral restack; `compose_character.py esk` | 0 | Unchanged rig/poses. |

`check_art.py --id esk --strict`:40 PASS,1 WARN,0 FAIL,0 missing. The existing collapse pose sideways movement warning is the deliberate standing-to-lying action from batch1. Reviewed all decoded GIF frames in `contact-animations-esk.png`: scarf/collar remains continuous through head tilts, swings, carry, walk and climb.


### Story review

See [story processing and per-plane validation](STORY-BATCH2-LOG.md), including exact layer reconstruction, painted continuations, cast-reference correction and reviewed pale snow edges.

### Ruta finishing details

#### Ruta finishing and review

Ruta's individual front/side/back sleeveless torso replacements were registered and the neutral turnaround restacked. The shared initial torso correction sheet still had sleeves, so final torso sources are `ruta-front-torso-fix.json`, `ruta-side-torso-fix.json`, and `ruta-back-torso-fix.json`.

The generated front left sleeve and underlying torso both carried unwanted extra red cross patches. A targeted generated edit removed these two cross marks; only the local registered rectangles were transferred, preserving every pixel elsewhere. The front viewer-right/side near-arm cross remains. [Verbatim cleanup prompt and source](provenance/ruta-cross-cleanup.json), one generation try. Cleanup is reproducible with `tools/remaining2_ruta.py <source>`.

All nine animations and GIFs were composed using the unchanged rig/poses. Reviewed every decoded GIF frame in `contact-animations-ruta.png`: hood/scarf neck remains connected, arms/legs rotate without opening gaps, the short coat leaves boot/leg swing visible, and the medical roll follows the torso. Poses use the original turnaround as the design reference; all matching eat/collapse frames were generated together and processed with a shared scale.

Final strict result after the frost-crusted dead pose was delivered: `check_art.py --id ruta --strict`: 40 PASS, 1 WARN, 0 FAIL, 0 missing. The collapse warning records 31px of sideways body movement during the deliberate standing-to-lying action; reviewed against the four clear steps and stable ground line. Final full contact sheet and frost pose reviewed; dead matches final collapse silhouette, closed eyes and ground position with a thin crisp frost crust on top edges.


Final survivor strict checks: Tobin41 PASS/0 WARN, Ostra40 PASS/1 WARN, Pim40 PASS/1 WARN, Ruta40 PASS/1 WARN; every survivor has0 FAIL and0 missing. The three warnings are the reviewed standing-to-lying collapse motion,14px for Ostra,26px for Pim and31px for Ruta.

## Batch 3: play-test fixes

Built-in imagegen; uniformly scaled generated figures, never fitted seated art to standing height. Eating 175 px; collapse standing 250, buckling 215, kneeling 188, lying 88. Support pixels registered on y304, lower support centre x160. White icon interiors filled to remove hairline holes.

### esk-pose-eat

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-ce6066d7-1da8-4104-9068-96b4038bca33.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target: second reference eating strip. First reference is Esk's exact character model and SCALE reference. Repaint eating frames with head EXACTLY the same pixel size as model sheet head, not enlarged. Three equally spaced 320x320 cells in one horizontal 960x320 strip, transparent. Same character as reference, same proportions, same colours. Each seated figure is only 175px tall from hat to soles, resting on y304. Head and hood around 105px tall, body compact beneath. Do not enlarge figure to fill cell. Frame1 holding bowl; frame2 raising spoon; frame3 bite. Same body placement and scale throughout. Generous transparent space above each seated figure.

### esk-pose-collapse

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-466433c5-098f-4d64-8b78-f853d2be1b2d.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Use case: identity-preserve. Repaint second reference's four-frame collapse strip. First reference is exact esk model sheet. The same character as reference, same proportions, same colours. Four evenly spaced cells in one horizontal strip, transparent. Frame1 standing eyes half shut; frame2 knees buckle reaching down; frame3 kneeling slumping forward; frame4 lying on side eyes shut. IMPORTANT head stays EXACTLY same size throughout, and matches turnaround side head. Standing height250, kneeling188, lying88; DO NOT stretch or enlarge later poses to fill cells. Boots stay planted at same horizontal support x160 and ground y304 as body folds down, no sliding sideways. Same head construction, clothes and palette as turnaround. Thin dark brown ink, clean flat fills. Last lying figure fits compactly about240px long, head on right. No floor.

### esk-pose-dead

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-50f20c23-8b2e-491a-96e3-ca9c78e10da3.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target second reference dead pose; first reference esk exact scale and model. Repaint same character as reference, same proportions, same colours. Lying on side eyes closed calmly, head right, thin pale frost crust on TOP edges of hood, coat, boots. No gruesome features. Head must be EXACTLY same size as model turnaround head. Compact lying height about88px, length about250px, resting y304 on 320x320 transparent frame. Never enlarge to fill canvas. Match the final collapse pose, boots at left.

### mara-pose-eat

Tries: 3. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-8309bf16-ee67-4366-af4c-1d81c4efe94a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target reference eating strip. Change ONLY Mara's exposed hands into plain dark-brown leather MITTENS #6b4a2f. No visible fingers. Preserve every other detail, exact head size, figure height, positions and three frames, transparent background. Same character as the reference, same proportions, same colours. Keep175px seated height and105px head within each320px cell.

### mara-pose-collapse

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-83e926a4-7a68-4910-9e58-5b072baba09e.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Use case: identity-preserve. Repaint second reference's four-frame collapse strip. First reference is exact mara model sheet. The same character as reference, same proportions, same colours. Four evenly spaced cells in one horizontal strip, transparent. Frame1 standing eyes half shut; frame2 knees buckle reaching down; frame3 kneeling slumping forward; frame4 lying on side eyes shut. IMPORTANT head stays EXACTLY same size throughout, and matches turnaround side head. Standing height250, kneeling188, lying88; DO NOT stretch or enlarge later poses to fill cells. Boots stay planted at same horizontal support x160 and ground y304 as body folds down, no sliding sideways. Same head construction, clothes and palette as turnaround. Thin dark brown ink, clean flat fills. Last lying figure fits compactly about240px long, head on right. No floor.

### mara-pose-dead

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-cc8d3d39-15c9-4d0e-b2b2-83c11a12918b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target second reference dead pose; first reference mara exact scale and model. Repaint same character as reference, same proportions, same colours. Lying on side eyes closed calmly, head right, thin pale frost crust on TOP edges of hood, coat, boots. No gruesome features. Head must be EXACTLY same size as model turnaround head. Compact lying height about88px, length about250px, resting y304 on 320x320 transparent frame. Never enlarge to fill canvas. Match the final collapse pose, boots at left.

### tobin-pose-eat

Tries: 2. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-4f03094e-4c88-4f0f-9b61-233c1327012e.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The same character as the reference, same proportions, same colours: tobin. Produce a three frame eating animation as one horizontal transparent strip. Facing right, seated cross-legged, holding wooden mushroom bowl: spoon in bowl, raising spoon, spoon at lips. CRITICAL PROPORTIONS: the HEAD IS HUGE relative to seated body: head/hat from crown to chin is 110 units tall, compact torso plus folded legs under chin only65 units tall, overall seated silhouette175 units. Thus head occupies 63 PERCENT of the seated figure's entire height. This matches the exact head size of the standing turnaround which is250 units tall. Do NOT make a miniature version of standing character, do NOT give a long torso, do NOT shrink head. Reduce seated torso and folded-leg area beneath the full-sized model-sheet head. Each320x320 cell has ground y304 and highest head pixel y129. All3frames same body, headsize and placement. Leave wide clear transparent area above. No standing figure, no extra objects. Preserve exact hat, hair, face, scarf and coat identity from model sheet.

### ostra-pose-eat

Tries: 2. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-8681648c-c9d3-4a91-872e-bdc8550871af.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The same character as the reference, same proportions, same colours: ostra. Produce a three frame eating animation as one horizontal transparent strip. Facing right, seated cross-legged, holding wooden mushroom bowl: spoon in bowl, raising spoon, spoon at lips. CRITICAL PROPORTIONS: the HEAD IS HUGE relative to seated body: head/hat from crown to chin is 110 units tall, compact torso plus folded legs under chin only65 units tall, overall seated silhouette175 units. Thus head occupies 63 PERCENT of the seated figure's entire height. This matches the exact head size of the standing turnaround which is250 units tall. Do NOT make a miniature version of standing character, do NOT give a long torso, do NOT shrink head. Reduce seated torso and folded-leg area beneath the full-sized model-sheet head. Each320x320 cell has ground y304 and highest head pixel y129. All3frames same body, headsize and placement. Leave wide clear transparent area above. No standing figure, no extra objects. Preserve exact hat, hair, face, scarf and coat identity from model sheet.

### ostra-pose-collapse

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-c5fceb42-048e-4587-9edd-845f446b97ac.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Use case: identity-preserve. Repaint second reference's four-frame collapse strip. First reference is exact ostra model sheet. The same character as reference, same proportions, same colours. Four evenly spaced cells in one horizontal strip, transparent. Frame1 standing eyes half shut; frame2 knees buckle reaching down; frame3 kneeling slumping forward; frame4 lying on side eyes shut. IMPORTANT head stays EXACTLY same size throughout, and matches turnaround side head. Standing height250, kneeling188, lying88; DO NOT stretch or enlarge later poses to fill cells. Boots stay planted at same horizontal support x160 and ground y304 as body folds down, no sliding sideways. Same head construction, clothes and palette as turnaround. Thin dark brown ink, clean flat fills. Last lying figure fits compactly about240px long, head on right. No floor.

### pim-pose-eat

Tries: 2. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-02d68120-ed89-4037-b87e-ce74471823ae.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The same character as the reference, same proportions, same colours: pim. Produce a three frame eating animation as one horizontal transparent strip. Facing right, seated cross-legged, holding wooden mushroom bowl: spoon in bowl, raising spoon, spoon at lips. CRITICAL PROPORTIONS: the HEAD IS HUGE relative to seated body: head/hat from crown to chin is 110 units tall, compact torso plus folded legs under chin only65 units tall, overall seated silhouette175 units. Thus head occupies 63 PERCENT of the seated figure's entire height. This matches the exact head size of the standing turnaround which is250 units tall. Do NOT make a miniature version of standing character, do NOT give a long torso, do NOT shrink head. Reduce seated torso and folded-leg area beneath the full-sized model-sheet head. Each320x320 cell has ground y304 and highest head pixel y129. All3frames same body, headsize and placement. Leave wide clear transparent area above. No standing figure, no extra objects. Preserve exact hat, hair, face, scarf and coat identity from model sheet.

### pim-pose-collapse

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-f6063ae8-b320-419a-bf77-f1306d36507a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Use case: identity-preserve. Repaint second reference's four-frame collapse strip. First reference is exact pim model sheet. The same character as reference, same proportions, same colours. Four evenly spaced cells in one horizontal strip, transparent. Frame1 standing eyes half shut; frame2 knees buckle reaching down; frame3 kneeling slumping forward; frame4 lying on side eyes shut. IMPORTANT head stays EXACTLY same size throughout, and matches turnaround side head. Standing height250, kneeling188, lying88; DO NOT stretch or enlarge later poses to fill cells. Boots stay planted at same horizontal support x160 and ground y304 as body folds down, no sliding sideways. Same head construction, clothes and palette as turnaround. Thin dark brown ink, clean flat fills. Last lying figure fits compactly about240px long, head on right. No floor.

### ruta-pose-eat

Tries: 2. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-458e964b-6048-4f73-bf7f-e8ee123070cf.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The same character as the reference, same proportions, same colours: ruta. Produce a three frame eating animation as one horizontal transparent strip. Facing right, seated cross-legged, holding wooden mushroom bowl: spoon in bowl, raising spoon, spoon at lips. CRITICAL PROPORTIONS: the HEAD IS HUGE relative to seated body: head/hat from crown to chin is 110 units tall, compact torso plus folded legs under chin only65 units tall, overall seated silhouette175 units. Thus head occupies 63 PERCENT of the seated figure's entire height. This matches the exact head size of the standing turnaround which is250 units tall. Do NOT make a miniature version of standing character, do NOT give a long torso, do NOT shrink head. Reduce seated torso and folded-leg area beneath the full-sized model-sheet head. Each320x320 cell has ground y304 and highest head pixel y129. All3frames same body, headsize and placement. Leave wide clear transparent area above. No standing figure, no extra objects. Preserve exact hat, hair, face, scarf and coat identity from model sheet.

### ruta-pose-collapse

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-b955571f-3c2a-48ea-9373-f3d2c3965e4b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Use case: identity-preserve. Repaint second reference's four-frame collapse strip. First reference is exact ruta model sheet. The same character as reference, same proportions, same colours. Four evenly spaced cells in one horizontal strip, transparent. Frame1 standing eyes half shut; frame2 knees buckle reaching down; frame3 kneeling slumping forward; frame4 lying on side eyes shut. IMPORTANT head stays EXACTLY same size throughout, and matches turnaround side head. Standing height250, kneeling188, lying88; DO NOT stretch or enlarge later poses to fill cells. Boots stay planted at same horizontal support x160 and ground y304 as body folds down, no sliding sideways. Same head construction, clothes and palette as turnaround. Thin dark brown ink, clean flat fills. Last lying figure fits compactly about240px long, head on right. No floor.

### icon-coal

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-01840b42-36f8-40bd-ac4d-49dde520a6a7.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
OVERRIDE for interface icon: Flat interface glyph, pure white #ffffff on real transparent background. Repaint reference icon as one chunky irregular lump of coal, absolutely solid interior. ONE SOLID SILHOUETTE. NO inner lines, NO outlines, NO shading, NO texture, NO fine detail, NO dark pixels, NO holes. Rounded geometric forms, central96px of128px canvas with16px margin. Must read instantly when reduced to20px.

### icon-food

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-1b3cdc0a-3d80-4065-ab47-36dccdccc787.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
OVERRIDE for interface icon: Flat interface glyph, pure white #ffffff on real transparent background. Repaint reference icon as one bowl heaped with three mushroom cap silhouettes fused into bowl, absolutely solid interior. ONE SOLID SILHOUETTE. NO inner lines, NO outlines, NO shading, NO texture, NO fine detail, NO dark pixels, NO holes. Rounded geometric forms, central96px of128px canvas with16px margin. Must read instantly when reduced to20px.

### icon-survivors

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-f3dd47ea-0d73-407e-b9a9-10c59c06f0c3.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
OVERRIDE for interface icon: Flat interface glyph, pure white #ffffff on real transparent background. Repaint reference icon as two hooded head-and-shoulder silhouettes fused together, no faces. ONE SOLID SILHOUETTE. NO inner lines, NO outlines, NO shading, NO texture, NO fine detail, NO dark pixels, NO holes. Rounded geometric forms, central96px of128px canvas with16px margin. Must read instantly when reduced to20px.

### icon-hearth

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-7b6536a3-ab1f-43a3-8403-9b01c1eaa76f.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
OVERRIDE for interface icon: Flat interface glyph, pure white #ffffff on real transparent background. Repaint reference icon as one flame rising from fused crossed logs, solid flame interior. ONE SOLID SILHOUETTE. NO inner lines, NO outlines, NO shading, NO texture, NO fine detail, NO dark pixels, NO holes. Rounded geometric forms, central96px of128px canvas with16px margin. Must read instantly when reduced to20px.

## Batch 3: ladders and climbing

Rails at x48/x144 in192px tiles map to x112/x208 in320px character frames. Generated continuous ladder cut into rails, rungs, hooks and rubble, then registered at exact joins; all join-edge pixels match. Peg right variants mirror their generated left variants. Soft generated haze removed by alpha cleanup before reduction. Character strips use one uniform source-pixel scale across every frame; shorter stepping poses retain their natural height.

### building-ladder-bottom

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-c3e36940-a0c9-4ac2-a7a9-4de149af3cf3.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Create a SINGLE continuous timber ladder system as a vertical triptych: top section, middle section, bottom section stacked immediately above each other, equal192x192 cells, total192x576. No spaces or labels between sections. On transparent background. Two split-log rails centred EXACTLY at x48 and144 in192px width; rails continue seamlessly through all3sections. Two lashed wooden rungs per192px, rung spacing96px. Top: iron hooks bend outward over floor lip above, rope tails. Middle: straight rail ends touching both cell boundaries, two rungs, no pegs. Bottom: railfeet rest on tiny dirt/rubble scatter, one wedge stone. Keep timber mid-brown #8a6440, shadow #6b4a2f, ink #2a1c14. Flat simple confident shapes, no crate-like outer frame, no background, no extra ladder, no ground line. Preserve generous transparent area to left/right of rails. Rails are same width throughout.

### building-ladder-middle

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-c3e36940-a0c9-4ac2-a7a9-4de149af3cf3.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Create a SINGLE continuous timber ladder system as a vertical triptych: top section, middle section, bottom section stacked immediately above each other, equal192x192 cells, total192x576. No spaces or labels between sections. On transparent background. Two split-log rails centred EXACTLY at x48 and144 in192px width; rails continue seamlessly through all3sections. Two lashed wooden rungs per192px, rung spacing96px. Top: iron hooks bend outward over floor lip above, rope tails. Middle: straight rail ends touching both cell boundaries, two rungs, no pegs. Bottom: railfeet rest on tiny dirt/rubble scatter, one wedge stone. Keep timber mid-brown #8a6440, shadow #6b4a2f, ink #2a1c14. Flat simple confident shapes, no crate-like outer frame, no background, no extra ladder, no ground line. Preserve generous transparent area to left/right of rails. Rails are same width throughout.

### building-ladder-peg-dirt-left

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e134fdb5-7670-4559-9808-c510eb30abda.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Two matching left-wall ladder anchors, one above the other, isolated on transparent background, as one tall narrow piece. Short sharpened wooden stakes driven into packed dirt at the LEFT edge, stout rope lashings extending to the right to wrap a ladder rail. Tiny crumbly dirt flecks at left. Only two anchors and their lashings, no ladder itself, no wall, no background. The left edge is wall contact x0, right ends reach x48 of a192px canvas. Upper anchor aroundy96, lower aroundy186; bottom of lower anchor on y191. Ladder rail positionx48. Design robustly at smallsize with simple shapes, no decoration.

### building-ladder-peg-dirt-right

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e134fdb5-7670-4559-9808-c510eb30abda.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Two matching left-wall ladder anchors, one above the other, isolated on transparent background, as one tall narrow piece. Short sharpened wooden stakes driven into packed dirt at the LEFT edge, stout rope lashings extending to the right to wrap a ladder rail. Tiny crumbly dirt flecks at left. Only two anchors and their lashings, no ladder itself, no wall, no background. The left edge is wall contact x0, right ends reach x48 of a192px canvas. Upper anchor aroundy96, lower aroundy186; bottom of lower anchor on y191. Ladder rail positionx48. Design robustly at smallsize with simple shapes, no decoration.

### building-ladder-peg-rock-left

Tries: 2. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-4783cc79-aff0-4183-952e-456c781f428f.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit this ladder bracket sheet. REMOVE THE ENTIRE VERTICAL WOODEN RAIL, including wood inside the metal clasp. Keep ONLY the two horizontal iron spikes, metal brackets and rings, plus tiny rock chips at left. Everything else perfectly transparent, no brown haze or ambient shadow. Simplify into clean flat grey metal #6f7a80 with one dark shadow #4a5258 and dark brown ink #2a1c14. No gradients or photographic texture. No wooden elements anywhere. Keep both brackets identical, one above other.

### building-ladder-peg-rock-right

Tries: 2. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-4783cc79-aff0-4183-952e-456c781f428f.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit this ladder bracket sheet. REMOVE THE ENTIRE VERTICAL WOODEN RAIL, including wood inside the metal clasp. Keep ONLY the two horizontal iron spikes, metal brackets and rings, plus tiny rock chips at left. Everything else perfectly transparent, no brown haze or ambient shadow. Simplify into clean flat grey metal #6f7a80 with one dark shadow #4a5258 and dark brown ink #2a1c14. No gradients or photographic texture. No wooden elements anywhere. Keep both brackets identical, one above other.

### building-ladder-top

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-c3e36940-a0c9-4ac2-a7a9-4de149af3cf3.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Create a SINGLE continuous timber ladder system as a vertical triptych: top section, middle section, bottom section stacked immediately above each other, equal192x192 cells, total192x576. No spaces or labels between sections. On transparent background. Two split-log rails centred EXACTLY at x48 and144 in192px width; rails continue seamlessly through all3sections. Two lashed wooden rungs per192px, rung spacing96px. Top: iron hooks bend outward over floor lip above, rope tails. Middle: straight rail ends touching both cell boundaries, two rungs, no pegs. Bottom: railfeet rest on tiny dirt/rubble scatter, one wedge stone. Keep timber mid-brown #8a6440, shadow #6b4a2f, ink #2a1c14. Flat simple confident shapes, no crate-like outer frame, no background, no extra ladder, no ground line. Preserve generous transparent area to left/right of rails. Rails are same width throughout.

### esk-pose-climb-down

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e6889cf8-de51-4a5e-8dec-2742842f20b6.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Esk (the digger, see CHARACTERS.md). Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### esk-pose-climb-up

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-897e915d-ddac-4c71-891f-972cac5ea31c.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Esk (the digger, see CHARACTERS.md). Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### esk-pose-ladder-off

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-20ca9222-e594-4699-9efd-10fcaeec1a99.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Esk (the digger, see CHARACTERS.md). Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### esk-pose-ladder-on

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-089ab433-4d81-4d97-9f85-c47d2a853b6b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Esk (the digger, see CHARACTERS.md). Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### mara-pose-climb-down

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-72dca881-bf58-442f-aa2c-e509d3c3eadb.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Mara (the firekeeper, see CHARACTERS.md). Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### mara-pose-climb-up

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-c6870e79-b687-43e0-b2a5-5e873f8093fa.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Mara (the firekeeper, see CHARACTERS.md). Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### mara-pose-ladder-off

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-8d6dc0ee-8de8-4ea0-8379-57328fa9d8d8.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Mara (the firekeeper, see CHARACTERS.md). Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### mara-pose-ladder-on

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-47aa02f1-9d0b-4ea6-b0b4-c19bb28dcf68.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Mara (the firekeeper, see CHARACTERS.md). Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ostra-pose-climb-down

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-b7904ce3-ed34-4f45-b2b9-d882b42034e1.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ostra (the elder, see CHARACTERS.md). Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ostra-pose-climb-up

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-3a1d9c67-2e51-4857-a7db-5269fa2e08c4.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ostra (the elder, see CHARACTERS.md). Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ostra-pose-ladder-off

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-886b5397-c9f8-467a-a4a5-404a30043f08.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ostra (the elder, see CHARACTERS.md). Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ostra-pose-ladder-on

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-6066e93a-8b2e-4b6f-b469-b646fedcd90b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ostra (the elder, see CHARACTERS.md). Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### pim-pose-climb-down

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-0035f007-3e9b-48e5-8d49-3ac99ada63f7.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Pim (the scavenger, see CHARACTERS.md). Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### pim-pose-climb-up

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-ab6eed43-6db2-4010-a855-68335d0cbc0e.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Pim (the scavenger, see CHARACTERS.md). Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### pim-pose-ladder-off

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-edfe5d61-b9d8-45d5-ae22-08e3ad3fed6a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Pim (the scavenger, see CHARACTERS.md). Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### pim-pose-ladder-on

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-717d484a-3459-4430-b2dc-d917a158beae.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Pim (the scavenger, see CHARACTERS.md). Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ruta-pose-climb-down

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-d77a4dc7-d12f-4ae9-a887-1b62e35f3254.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ruta (the medic, see CHARACTERS.md). Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ruta-pose-climb-up

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e9b66af5-df0d-4290-a1f7-f3489fb65625.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ruta (the medic, see CHARACTERS.md). Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ruta-pose-ladder-off

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e798cc2b-4eec-49f1-b98d-a4fda96b7038.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ruta (the medic, see CHARACTERS.md). Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### ruta-pose-ladder-on

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e8e0f9c9-529f-458a-8920-954e882fa8ee.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ruta (the medic, see CHARACTERS.md). Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### tobin-pose-climb-down

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-7f2c3f18-5b59-46d4-81c5-adf36dfc54e0.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Tobin (the builder, see CHARACTERS.md). Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### tobin-pose-climb-up

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-88a0417b-09d7-4ac3-b3c5-92b46d683fd0.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Tobin (the builder, see CHARACTERS.md). Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 4 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### tobin-pose-ladder-off

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-04d9fbd0-5e86-4143-b073-3080e83c7bcf.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Tobin (the builder, see CHARACTERS.md). Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

### tobin-pose-ladder-on

Tries: 1. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-04681967-84db-47f0-926d-75450d668f1a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Tobin (the builder, see CHARACTERS.md). Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame. Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains.
Generate all frames in one image so they match. The ladder rails sit at x=112 and x=208, so mittens and boots land on them.
The same character as the reference, same proportions, same colours. Reference1 exact character turnaround; reference2 ladder positioning guide ONLY. Deliver 3 complete evenly spaced figures in ONE horizontal transparent strip. REMOVE ALL LADDER PIXELS from final art; survivor only. Same scale and head size as standing model: head105px, body250px within each320x320cell. Top of heady54, lowest booty304. Mittens, never fingers. No hands or arms above top of hat; upper mitten can grip beside head, lower mitten at chest. Rails atx112 and208. Keep torso centredx160 across frames. One knee raised alternating, boots land on rails. Never enlarge head to fill canvas. No separate props.

## Batch 3: mechanics

### building-coke-oven-off

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-3fcf6ffa-7c02-49b1-b145-902fcbb9e229.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A squat clay kiln for baking coal into coke: a domed clay body with an iron door at the front and a short stack. on: the door seams and the stack mouth glow orange (painted flat). State: off.
Deliver exactly ONE asset, not a comparison sheet. 192x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### building-coke-oven-on

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-9930fd8b-969e-4a99-8457-b368017caeb7.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A squat clay kiln for baking coal into coke: a domed clay body with an iron door at the front and a short stack. on: the door seams and the stack mouth glow orange (painted flat). State: on.
Deliver exactly ONE asset, not a comparison sheet. 192x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-crate-empty

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-fb20a7fa-430c-4bb1-b876-0f1345cbeb30.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A storage crate of nailed planks. empty: open and empty. half: some coal and stones. full: overflowing. State: empty.
Deliver exactly ONE asset, not a comparison sheet. 192x192 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### building-crate-full

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-03eaa6d8-39d8-4467-9a5c-a9866a46622b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A storage crate of nailed planks. empty: open and empty. half: some coal and stones. full: overflowing. State: full.
Deliver exactly ONE asset, not a comparison sheet. 192x192 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-crate-half

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-c6615cdd-c63e-473d-a558-721cba38e521.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A storage crate of nailed planks. empty: open and empty. half: some coal and stones. full: overflowing. State: half.
Deliver exactly ONE asset, not a comparison sheet. 192x192 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-crystal-lamp-off

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-898e3144-d2b0-47d6-b5ee-b47553abf284.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The lamp upgrade: the same wooden post and cross-arm as the batch 1 lamp, the lantern now holding a cut teal crystal lens. on: the lens painted bright cool white (no glow halo). State: off.
Deliver exactly ONE asset, not a comparison sheet. 192x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-crystal-lamp-on

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-88c26e6c-ad21-40c5-8068-fb400dd96e56.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The lamp upgrade: the same wooden post and cross-arm as the batch 1 lamp, the lantern now holding a cut teal crystal lens. on: the lens painted bright cool white (no glow halo). State: on.
Deliver exactly ONE asset, not a comparison sheet. 192x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-door-closed

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-80de350a-2f16-4595-8ace-577c8b2e67be.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A rough plank door in a timber frame with iron straps. open: the door swung to the side, frame empty. State: closed.
Deliver exactly ONE asset, not a comparison sheet. 192x384 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### building-door-open

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-4d9e7d8e-7038-42c8-91f9-6edf4b93e4d0.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A rough plank door in a timber frame with iron straps. open: the door swung to the side, frame empty. State: open.
Deliver exactly ONE asset, not a comparison sheet. 192x384 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-hearth-grate

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e0156fa5-ed56-4011-a850-73ae620b02cc.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The better-burner upgrade of the batch 1 hearth: exactly the same stone ring, footprint and outline as building-hearth, with black iron fire-bars laid across the pit. No flame (separate).
Deliver exactly ONE asset, not a comparison sheet. 384x160 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-heater-off

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-ce9e8ee3-7933-468e-beb7-5c68db65d8c2.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
An iron stove heater with a grille front and a chimney stub. on: grille glowing orange (painted). State: off.
Deliver exactly ONE asset, not a comparison sheet. 192x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### building-heater-on

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-d140329a-501a-45c5-bab7-f1c2f96f5736.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
An iron stove heater with a grille front and a chimney stub. on: grille glowing orange (painted). State: on.
Deliver exactly ONE asset, not a comparison sheet. 192x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-kitchen-cooking

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-5990454b-3f7a-4de7-b01a-f0596f0d4671.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A cooking pot hung from a tripod over a small stone fire ring. cooking: steam curls and a low painted flame under the pot. State: cooking.
Deliver exactly ONE asset, not a comparison sheet. 384x320 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-kitchen-off

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-fa3407f6-ee65-45d6-b70e-482d8af2b0d2.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target reference building. COLD OFF STATE. Remove ALL flames, embers, steam and orange illumination. Leave unlit dark wood logs in the stone ring and a cold pot hanging on the identical tripod. No steam, no fire, no light. Keep remaining structural pixels, footprint and outline unchanged. Real transparent background. Clean ink and flat muted fills. Exactly one unattended building, no people, no comparison sheet.

### building-lens-bench-idle

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-d8626448-9f87-41c4-8aa3-3257d245b559.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target reference building. Remove the ENTIRE person, hands, boots, apron and hair. Leave ONLY the unattended plank bench, treadle grinding wheel, small vice holding teal crystal and mechanism. Wheel motionless. No sparks. No people or body parts anywhere. Keep remaining structural pixels, footprint and outline unchanged. Real transparent background. Clean ink and flat muted fills. Exactly one unattended building, no people, no comparison sheet.

### building-lens-bench-working

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-6d7cef11-d2be-42a5-840e-742dd983f5c5.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit this unattended lens-grinder bench to WORKING state. NO PEOPLE: no worker, no hands, no feet, no body parts. Same bench, same structure, exact silhouette and position. Change ONLY grinding wheel: add TWO simple ink motion lines and three tiny flat teal crystal chips. No glow, no blur, no fire. Keep small vice holding teal crystal and all planks exactly unchanged. Real transparent background.

### building-medbay-empty

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-3f53c5cb-6faf-40bb-9271-f5391c03623b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A medical cot: white-grey sheet, a red cross stitched on a hanging cloth, bandages and a bottle on a crate beside it. State: empty.
Deliver exactly ONE asset, not a comparison sheet. 384x160 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### building-smelter-off

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-31f0624b-48ec-4eaf-b76a-b4549e72ec79.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target reference building. COLD OFF STATE. Remove ALL smoke, flames, embers and orange light. Chimney clear, tap hole dark cold grey inside, leather bellows fully expanded. Same stone furnace, same framing and exact position. Keep remaining structural pixels, footprint and outline unchanged. Real transparent background. Clean ink and flat muted fills. Exactly one unattended building, no people, no comparison sheet.

### building-smelter-on

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-9d187b3f-dfd7-4eb6-b7db-b12df962c37a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A stone bloomery for smelting iron: a round stone furnace with a clay chimney, leather bellows on the left side, a tap hole at the bottom front. on: the tap hole glows, the bellows are squeezed, a little smoke at the chimney. State: on.
Deliver exactly ONE asset, not a comparison sheet. 384x384 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-stockpile-stone-full

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-2554717b-9acf-41b0-ad35-0484ed3c5889.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The stockpile pallet from batch 1 (same outline and stake) piled with grey rubble stone instead of coal. half: a low heap. full: a big heap. State: full.
Deliver exactly ONE asset, not a comparison sheet. 384x128 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-stockpile-stone-half

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-8340bd2e-bd5c-4850-805d-5b00a0cf3b61.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
The stockpile pallet from batch 1 (same outline and stake) piled with grey rubble stone instead of coal. half: a low heap. full: a big heap. State: half.
Deliver exactly ONE asset, not a comparison sheet. 384x128 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-water-pump-off

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-23e72284-e96a-4bc0-8504-a27492391476.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A hand pump on a tank with a spout. on: a stream at the spout. State: off.
Deliver exactly ONE asset, not a comparison sheet. 384x384 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### building-water-pump-on

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e451587a-a5dc-4fd4-9202-aab0a53dfda4.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A hand pump on a tank with a spout. on: a stream at the spout. State: on.
Deliver exactly ONE asset, not a comparison sheet. 384x384 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### building-workbench-idle

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-77d0a9f5-63a5-44f7-8351-f66028141972.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Edit target reference building. IDLE STATE. Extinguish the small oil lamp: remove the flame and make the glass clear cold grey. Keep every other object, plank, vice, paper, book and tool identical. No people. Keep remaining structural pixels, footprint and outline unchanged. Real transparent background. Clean ink and flat muted fills. Exactly one unattended building, no people, no comparison sheet.

### building-workbench-working

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-231614e2-2477-42b8-964d-7d379cae2941.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A research workbench: heavy planks, a vice, scattered tools, scraps of paper, a small oil lamp. working: lamp lit, papers spread out. State: working.
Deliver exactly ONE asset, not a comparison sheet. 384x384 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light. Edit the reference to this state. Keep exact outside silhouette, structure, footprint, framing and position; change only the functional part described. Do not invent extra objects.

### esk-pose-research

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-136b9d67-5f78-47c6-9a05-1c645a1c9dd5.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Esk (the digger, see CHARACTERS.md). Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.
The same character as the reference, same proportions, same colours. Three equally spaced full-body figures in one horizontal strip on transparent background. Same105px head and250px standing scale, groundy304,320x320 cells. Hands are simple mittens, never visible fingers. Feet and body completely fixed across3frames, movement only near mitten and head. Reading and handling a small loose sheet of paper held at waist height. DO NOT paint a bench, lamp or other furniture. Do not enlarge head or shoulders. Flat muted palette exactly matching model. Hat/head and coat/body proportions copied from turnaround.

### item-coal-pile

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-a686e8aa-0dcb-4921-b2ee-63c14b218423.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A small heap of coal lumps on the ground, the hauled-and-dropped version of the coal chunk, five or six lumps. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-coke-pile

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-67ac8e54-9270-4841-bb07-c754e2046413.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A neat stack of grey-black coke briquettes, rounded rectangles with a dull sheen, stacked three high. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-crystal-pile

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-162da3dc-f3a8-410a-be35-f1471f029b15.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A small heap of pale teal crystal shards (#7fd1c8 #c8f0ea), each a clean faceted shape. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-iron-bar-stack

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-f90b78a8-d101-46fb-ab58-68fdeb752e85.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Three small iron ingots stacked in a little pyramid, dark grey metal with a pale highlight edge. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-iron-ore-pile

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-3f823cec-aba8-4f08-aa78-100dc39b9a0d.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A small heap of rust-red iron ore lumps (#8a4a2c #b8693a) with dull metallic flecks. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-scrap-pile

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-fd8c92b6-56a0-4931-8dbb-f7a4932f9054.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A small heap of scrap: bent pipe, a gear, rusty plates. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-stone-chunk

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-eecabc48-7f80-4237-8f79-a008656eff18.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A single fist-sized rough grey stone (#5a5b5f #7a7873), a few flat faces, one chip. The stone resource, carried and stockpiled like coal. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### item-stone-pile

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-ab4e5c7c-b7ed-4de5-9e1b-f1d7ae39b687.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A small heap of grey rubble stones. Sitting on the ground at the bottom of the canvas.
Deliver exactly ONE asset, not a comparison sheet. 96x96 canvas, real transparent background, no floor or cast shadow. Centre the object, base touching bottom edge with0-3px margin. Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### mara-pose-research

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-62fea10c-53e7-4fd9-be5a-443c879ded5c.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Mara (the firekeeper, see CHARACTERS.md). Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.
The same character as the reference, same proportions, same colours. Three equally spaced full-body figures in one horizontal strip on transparent background. Same105px head and250px standing scale, groundy304,320x320 cells. Hands are simple mittens, never visible fingers. Feet and body completely fixed across3frames, movement only near mitten and head. Reading and handling a small loose sheet of paper held at waist height. DO NOT paint a bench, lamp or other furniture. Do not enlarge head or shoulders. Flat muted palette exactly matching model. Hat/head and coat/body proportions copied from turnaround.

### ostra-pose-research

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-e14d6c1d-5378-43f9-83b8-e5967d55608a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ostra (the elder, see CHARACTERS.md). Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.
The same character as the reference, same proportions, same colours. Three equally spaced full-body figures in one horizontal strip on transparent background. Same105px head and250px standing scale, groundy304,320x320 cells. Hands are simple mittens, never visible fingers. Feet and body completely fixed across3frames, movement only near mitten and head. Reading and handling a small loose sheet of paper held at waist height. DO NOT paint a bench, lamp or other furniture. Do not enlarge head or shoulders. Flat muted palette exactly matching model. Hat/head and coat/body proportions copied from turnaround.

### pim-pose-research

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-5aaca21f-390f-4fbe-b0b3-7d2ccdb47af9.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Pim (the scavenger, see CHARACTERS.md). Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.
The same character as the reference, same proportions, same colours. Three equally spaced full-body figures in one horizontal strip on transparent background. Same105px head and250px standing scale, groundy304,320x320 cells. Hands are simple mittens, never visible fingers. Feet and body completely fixed across3frames, movement only near mitten and head. Reading and handling a small loose sheet of paper held at waist height. DO NOT paint a bench, lamp or other furniture. Do not enlarge head or shoulders. Flat muted palette exactly matching model. Hat/head and coat/body proportions copied from turnaround.

### prop-crowbar

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-8dae30b1-fc4c-481d-ace3-77e08fb6fa89.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A short iron crowbar for taking buildings apart: a bent claw at the top end, a strip of cloth wrapped at the grip, worn paint. Used for the deconstruct marker too, so it must read at 40 px. Held: the grip point is exactly at (172, 238). The handle points straight up from it and the whole tool reaches no more than 100 px above the grip, so it stays inside the frame when swung.
Deliver exactly ONE asset, not a comparison sheet. 320x320 canvas, real transparent background, no floor or cast shadow.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.

### ruta-pose-research

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-b92b4274-e552-4f8e-b0af-c649c81b6cc7.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Ruta (the medic, see CHARACTERS.md). Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.
The same character as the reference, same proportions, same colours. Three equally spaced full-body figures in one horizontal strip on transparent background. Same105px head and250px standing scale, groundy304,320x320 cells. Hands are simple mittens, never visible fingers. Feet and body completely fixed across3frames, movement only near mitten and head. Reading and handling a small loose sheet of paper held at waist height. DO NOT paint a bench, lamp or other furniture. Do not enlarge head or shoulders. Flat muted palette exactly matching model. Hat/head and coat/body proportions copied from turnaround.

### tex-backwall-1

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-db993866-fba6-4564-bbf0-432beee3c544.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable cave back wall, very low contrast, soft strata, background only. Layer 1 back wall: cold blue-brown.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-backwall-2

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-7a7b1ae5-76fe-4b8d-ba9f-d7a77567fd9d.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable cave back wall, very low contrast, soft strata, background only. Layer 2 back wall: grey-brown with faint gravel.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-backwall-3

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-db6354f5-4a69-4a92-8a58-4394dfcbb771.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable cave back wall, very low contrast, soft strata, background only. Layer 3 back wall: dark slate with faint columns.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-crystal

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-0b263859-48ed-44c5-964e-8662ff93d446.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. Rock with clusters of pale teal crystals (#7fd1c8 #c8f0ea), each crystal a clean faceted shape. One tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-deep-rock

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-84ebb7df-23e9-4c64-a75e-3731f355829b.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. Deep basalt: dark slate (#2a2c33 #3a3d46) in tall angular columns. One tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-gravel

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-456aebf4-29d0-4d19-8fe1-f9d0d7f85f0c.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. Loose gravel: rounded grey-brown pebbles of three sizes, packed tight. One tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-ice

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-06ef4e2a-8fa5-45c2-b2d4-a25c51b22616.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. Ice: pale blue blocks (#9cc4e4 #5f7fa8 #e4f1fb) with straight fracture lines and a few trapped bubbles. One tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tex-iron-ore

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-3fa15f99-5e24-44e7-855d-3df00e839634.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. Rock with rust-red and orange iron ore veins (#8a4a2c #b8693a) and dull metallic flecks. One tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.
Deliver exactly ONE asset, not a comparison sheet. 512x512 canvas, fully opaque square texture filling every pixel.  Muted palette: ink#2a1c14 wood#8a6440 metal#6f7a80 brass#b08d4a teal#3f7f7a rock#5a5b5f. Flat graphic shapes, outer4px/inner2px lines at192px scale. At most one seam or chip per component. No fine scratches, no realistic material texture, no volumetric light.  Seamless in both directions, no vignette, no edge border, no centre landmark, uniform density.

### tobin-pose-research

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-f6bdec24-aa94-470f-90d0-692e4294ddcc.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Tobin (the builder, see CHARACTERS.md). Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move. Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about 0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.
The same character as the reference, same proportions, same colours. Three equally spaced full-body figures in one horizontal strip on transparent background. Same105px head and250px standing scale, groundy304,320x320 cells. Hands are simple mittens, never visible fingers. Feet and body completely fixed across3frames, movement only near mitten and head. Reading and handling a small loose sheet of paper held at waist height. DO NOT paint a bench, lamp or other furniture. Do not enlarge head or shoulders. Flat muted palette exactly matching model. Hat/head and coat/body proportions copied from turnaround.

## Batch 3: creatures

### creature-burrower-attack

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-7e36ef25-e0b6-4be7-b46b-e90eb8ce2d4a.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. CLAW ATTACK, not digging. Frame1 whole eyeless armoured mole crouches and pulls its three big shovel claws BACK beside chest, ready to swipe. Frame2 huge near foreclaw swings far FORWARD to the right, clear attacking swipe, chest raised. Frame3 follow-through: near claw fully extended right, body leaning forward, head low. Full animal remains visible, constant plate and head size. No digging rocks, no rubble spray, no target or victim, no eyes. One small ink motion arc allowed.
Exactly 3 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-burrower-dig

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-26c30b9a-167c-4427-a9fe-836c1b75e41e.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A Burrower: a mole-like beast the size of a dog, armoured overlapping plates, eyeless, huge shovel claws. Side view facing right. Animation: dig, 4 frames.
Generate all frames of one animation in one image so they match.
ONE horizontal animation strip, exactly 4 evenly spaced frames. Each frame has equal384x256 canvas and generous clear space from neighbours, real transparent background. Same anatomy, design and source-pixel scale in all frames. Base or lowest wisp remains on bottom row. Clean flat graphic shapes, consistent ink, no gradient, no glowing halo, no floor or background.  Eyeless mole, no eyes, five big armour plates, three large shovel claws; no tiny scale detail.

### creature-burrower-retreat

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-7f44978d-547a-4377-8750-14852898f059.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. RETREATING UNDERGROUND, not digging in place. Frame1 full mole crouches to dive headfirst into ground. Frame2 ONLY back armour arch and hind legs remain visible; head and front claws already underground, so NOT painted. Frame3 ONLY THREE small back-plate tips and a few rubble chips remain visible; NO head, NO legs, NO full body. Keep plates exactly same size, never enlarge partial fragments. No floor slab, only tiny rubble scatter.
Exactly 3 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-burrower-surface

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-5d77fb91-ae02-4615-9388-ad8bcc0b80de.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. SURFACING from beneath ground, not digging. Frame1 ONLY the tip of two armoured back plates and two claws visible above a small rubble scatter; head and almost all body hidden underground and therefore NOT painted. Frame2 half the animal emerges: head, front plates and front claws visible, hind body still hidden. Frame3 complete armoured eyeless mole fully above ground standing ready. Same size plates and same anatomy across frames. Do not enlarge partial frames to fill canvas. No floor slab, only a little rubble.
Exactly 3 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-heat-leech-burst

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-dc939749-3fad-41b0-8497-d47e4405d73c.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. ONE-SHOT NON-LOOPING BURST. Frame1 whole bloated orange-filled leech. Frame2 body splitting open with a jagged flat orange burst shape and sparks. Frame3 ONLY scattered sparks and a few tiny pink fragments; NO body, NO head, NO sucker mouth. Frame4 ONLY FOUR tiny fading orange embers; NO animal, NO head, NO sucker, NO returning to whole body. Later fragments keep original pixel scale. This is disappearance, never regeneration. Sparse final frame must still contain four clearly visible tiny embers.
Exactly 4 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-heat-leech-crawl

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-5669a3d2-b8a7-4853-a821-95c1298e2737.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. A looping CRAWL only. All FOUR frames are EMPTY COLD GREY-PINK, absolutely NO orange or yellow in any frame. Frame1 short body bunched at back; frame2 body long low stretched forward; frame3 back catches up and bunches; frame4 extends forward again. Same round sucker mouth and same head scale. Change only body compression. Remove every internal orange patch from reference.
Exactly 4 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-heat-leech-feed

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-07254610-fe40-4da6-905f-f84df4211c0f.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. FEEDING PULSE. Both frames already latched to imaginary surface on right, sucker pressed flat and body filled with a CRISP-EDGED SOLID FLAT ORANGE internal patch. Frame1 orange patch medium; frame2 patch slightly larger and body slightly plumper. Both frames orange, never empty cold in frame1. No gradient, no airbrush, no glowing halo; one flat orange patch with one pale flat highlight.
Exactly 2 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-heat-leech-latch

Tries: 2. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-9a47619f-fb1c-494c-8d39-bc13bdff9e35.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
Generate a corrected animation strip of the SAME CREATURE as reference, same proportions and colours. LATCHING only, not feeding. Both frames COLD GREY-PINK, NO orange or yellow. Frame1 front sucker stretches and flares toward the RIGHT; frame2 wide sucker lip presses flat against an imaginary vertical surface on right, body tail curls upward and clings. Do not paint the wall or hearth. Clear suction action, no crawl cycle.
Exactly 2 complete, evenly spaced frames in ONE horizontal transparent strip, each frame same canvas size. No extra panels, no labels. Keep generous transparent gaps between figures. Reference shows creature design only; draw the NEW ACTION just described. Muted palette, clean crisp flat fills, no background, no ambient haze, no cast shadow.

### creature-shade-dissolve

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-cdee2a19-131b-4a07-9dde-0821436bc315.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A Shade (the same figure as the batch 2 drift strip: hunched black smoke, wisping edges, pale cold eyes #e4f1fb, long thin arms). Animation: dissolve, 5 frames. Dissolving in firelight: frame 1 recoiling, frames 2 to 4 the smoke coming apart from the edges into drifting wisps and flakes, the eyes last to go, frame 5 only a few faint wisps.
Generate all frames in one image so they match, with the batch 2 drift strip attached as the reference.
ONE horizontal animation strip, exactly 5 evenly spaced frames. Each frame has equal320x320 canvas and generous clear space from neighbours, real transparent background. Same anatomy, design and source-pixel scale in all frames. Base or lowest wisp remains on bottom row. Clean flat graphic shapes, consistent ink, no gradient, no glowing halo, no floor or background. Same creature as the reference, same proportions, same palette.   Frame1 full hunched Shade recoils; frame2 outer wisps break; frame3 limbs fragment; frame4 eyes remain among wisps; frame5 just THREE small dark curling wisps, no eyes, no body, visible faint cores, not fully empty. Never enlarge later fragments.

### creature-shade-idle

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-ef1af14e-1df2-4eae-ae0e-1abb7abdb682.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A Shade (the same figure as the batch 2 drift strip: hunched black smoke, wisping edges, pale cold eyes #e4f1fb, long thin arms). Animation: idle, 4 frames. Idle loop: hovering in place, the smoke body slowly swelling and settling, wisps curling off the shoulders, eyes blinking once on frame 3.
Generate all frames in one image so they match, with the batch 2 drift strip attached as the reference.
ONE horizontal animation strip, exactly 4 evenly spaced frames. Each frame has equal320x320 canvas and generous clear space from neighbours, real transparent background. Same anatomy, design and source-pixel scale in all frames. Base or lowest wisp remains on bottom row. Clean flat graphic shapes, consistent ink, no gradient, no glowing halo, no floor or background. Same creature as the reference, same proportions, same palette.

### refugee

Tries: 1. Built-in imagegen. Source: `/var/home/shariq/.codex/generated_images/01a18495-b86b-71d1-8789-59a825b5766a/exec-ba6ba4bc-b766-4b82-b2d1-4a529dbdb279.png`.

Final prompt:

Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.
A refugee in a ragged, snow-caked coat at the edge of the light, holding up a dim lantern and waving, facing left. Generic look, hood up, face in shadow. Two frames: arm up, arm higher.

ONE horizontal animation strip, exactly 2 evenly spaced frames. Each frame has equal320x320 canvas and generous clear space from neighbours, real transparent background. Same anatomy, design and source-pixel scale in all frames. Base or lowest wisp remains on bottom row. Clean flat graphic shapes, consistent ink, no gradient, no glowing halo, no floor or background.     Survivor scale250px tall,105px head, coat95px, legs50px. Facing LEFT. Hood rounded grey-brown, face hidden in dark blue-grey shadow, ragged coat, pale frost crust. Real mittens, never fingers. No goggles. Lantern flame tiny flat orange, no halo. Boots on y304 in320px frame. Only arm waves; body and boots stay fixed.

Creature cleanup: removed generated ambient haze before reduction; registered complete connected creatures where source figures crossed approximate cell divisions; kept one scale across every strip. Heat-leech fills reduced to crisp muted tones. Shade scale matches batch 2 drift, final dissolve wisps retain 65% alpha. Horizontal registration fixes centre-of-mass warnings. Refugee rests on the manifest bottom anchor.
