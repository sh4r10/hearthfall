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
