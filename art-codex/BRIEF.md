# Hearthfall art brief for Codex

You are making the art for **Hearthfall**, a side-on 2D colony survival game that runs in the browser. This folder is everything you need. Work only inside `art-codex/`; do not change any game code, docs or files outside this folder.

Read these in order:

1. **This file**: the job, the style, the rules and the workflow.
2. **[CHARACTERS.md](CHARACTERS.md)**: the six survivors, how each one looks, and exactly how to build a character from parts.
3. **[ASSETS.md](ASSETS.md)**: every file to make, with its save path, size, frame count, transparency and what to paint. It is generated from `tools/make_manifest.py`, the same data as `assets.json`, which the checker reads.
4. **[rig.json](rig.json)** and **[poses.json](poses.json)**: the character skeleton and the animations built from it.

## The game in one paragraph

The sun dimmed and the surface froze. The last people went underground towards the planet's heat, carrying fire. The player runs a small colony in a cave, seen from the side like a cutaway (as in Oxygen Not Included): survivors dig tunnels, haul coal, keep hearths burning and grow cave mushrooms in the dark, while creatures called Shades come out at night for anyone outside the firelight. The goal of a run is to dig down five layers to an ancient furnace, the Deep Hearth, and relight it. The mood is **cold, close and firelit, but warm-hearted**: the survivors are scrappy, funny little people who look after each other.

How the art is used: sprites stand as flat cards in a 3D scene seen from the side. The engine adds all the lighting: it tints every sprite by the firelight where it stands, so things far from fire go dark blue-grey and things near fire go warm. Your art must therefore be **evenly lit, mid-value and un-glowing**. The engine adds glow, bloom and darkness.

## The style

The current art (in `apps/client/art/` on main) was made with an image model and **looks AI-generated**: over-rendered fur and stone, smeary painterly noise, every surface equally detailed, inconsistent line weight and lighting between pieces, glossy chibi faces. Do not match it. The new direction:

**Clean ink and flat colour, like a hand-made indie game.** Think Klei's *Don't Starve* and *Oxygen Not Included* for the game art, and the flat, graphic, warm look of *Hilda* (the Netflix series) and Cartoon Saloon's *Wolfwalkers* and *Song of the Sea* for the story scenes. Chunky, confident, readable, and a little wobbly in a human way.

### Style block

Start **every** image prompt with this paragraph, word for word:

> Hand-drawn 2D game art for a side-on underground survival game. Clean, confident dark-brown ink linework of even weight, thicker on the outer silhouette and thinner inside, with slightly hand-made wobble. Flat colour fills with one crisp-edged shadow tone and one small highlight, lit evenly from the upper left. A faint paper-grain texture inside the fills only. Big simple shapes and generous plain areas; detail only where the eye should go. Muted, cold palette; warm colours only for fire, scarves and skin. In the spirit of Klei's Don't Starve and Oxygen Not Included and the flat graphic look of the Hilda animated series. Not photoreal, not 3D-rendered, no airbrushed gradients, no glow, no bloom, no rim light, no lens effects, no cast shadow on the ground, no background, no text.

For story illustrations, replace the first sentence with *"Hand-drawn 2D illustration for the story intro of an underground survival game, wide 16:9 composition."* and drop "no background".

### What makes art look AI-made, and the rule against each

| Tell | Rule |
|---|---|
| Every fur strand, stone crack and fabric weave rendered | Fur is a **scalloped outline shape** with 3-5 inner tufts, never hair strands. Stone is a few big slabs. Fabric shows at most one patch or seam per piece. |
| Detail spread evenly everywhere | Detail only at focal points: faces, hands, the working part of a machine. Everything else is a plain filled shape. |
| Smeary painterly noise and soft gradients | Flat fills. Shadow is **one** darker tone with a crisp edge, highlight is **one** small lighter shape. No airbrush, no blur. |
| Line weight changes between assets | Outline colour `#2a1c14` everywhere. At final size: outer silhouette 4 px, inner lines 2 px (sprites at 192 px per cell). Scale proportionally for bigger canvases. |
| Lighting changes between assets | Always lit from the upper left. Shadow side lower right. No coloured rim lights, no backlight. |
| Baked-in glow, bloom, god rays, sparkles | Fire and glowing things are painted as flat bright shapes. The engine adds the glow. |
| Glossy generic anime-chibi faces | Use the face construction in CHARACTERS.md: dot eyes, tiny nose, simple mouth. Same construction on every character. |
| Melted details: extra fingers, garbled buckles, fake text, asymmetric goggles | Mittens, not fingers. At most two toggles or buckles per coat, drawn clearly. No writing anywhere except the wordmark. |
| Everything the same mid-saturation brown | Use the palette below and keep each object to 3-4 colour families. Scarves are the one bright accent on a person. |
| Random baked shadows, floors and backdrops | Transparent background. Nothing under the feet. |

### Palette

Paint with these. Each colour has a base, a shadow (about 15% darker and slightly bluer) and a highlight (about 12% lighter and slightly warmer); derive those yourself, consistently.

| Use | Base colours |
|---|---|
| Ink outline | `#2a1c14` |
| Cave rock | `#3d3f45` `#5a5b5f` `#7a7873` |
| Dirt | `#5e3f28` `#7d5638` `#9c7350` |
| Coal | `#1c1b1e` `#2e2c31`, glints `#c9a66b` |
| Ice, water, frost | `#1e4a63` `#3c7896` `#9cc4e4` `#e4f1fb` |
| Back wall | `#241d18` `#33291f` |
| Fire | `#fff3d0` `#ffc24a` `#ff7a1f` `#c2452f` |
| Wood | `#6b4a2f` `#8a6440` `#a8835a` |
| Metal | `#4a5258` `#6f7a80`, brass `#b08d4a`, teal paint `#3f7f7a` |
| Fur trim | `#d9cdb8` cream, `#8f8476` grey, `#6b5440` brown |
| Cloth | `#6a4a3a` `#3e5566` `#56603e` `#70553a` `#8c8a80` |
| Mushrooms | `#c9b6e4` `#9d86c4`, caps lighter `#e6dcf5` |

Keep values in the middle range: no fill darker than `#2e2c31` except coal and outlines, and nothing pure white except highlights, so sprites still read when the engine darkens them.

## Rules for every file

- **PNG**, sRGB, 8-bit. RGBA with a real transparent background wherever `alpha` is yes in the list; fully opaque where it is no.
- **Exact pixel size** from the list. A strip of N frames is N frames side by side in one row, each frame exactly the listed size, no gaps.
- **Grid scale:** 192 px = 1 grid cell for sprites; terrain textures are 128 px per cell (a 512 px tile is 4 x 4 cells). A survivor stands 250 px tall in a 320 x 320 frame with feet on y = 304.
- **Anchors:** `bottom-centre` means the object stands on the bottom edge of the canvas, centred, with no empty rows below it (a 0-4 px margin is fine). `centre` means centred with a small even margin. `rig` and `grip` are explained in CHARACTERS.md.
- **Strips:** every frame has the same scale, outline and position. The object's feet or base stay on the same row in every frame and it does not drift sideways unless the animation is about moving. Loops must loop: the last frame leads back into the first.
- **States** of the same building (off and on, empty and full) share the exact same outline and position; only the changing part differs. Make the first state, then edit it into the others rather than generating each from scratch.
- **Seamless textures** wrap in both directions with no visible seam or repeated landmark. Avoid any single feature that stands out, because it will repeat every 4 cells.
- **Front view for buildings**, straight on, ground line at the bottom. The camera looks slightly down, but paint them flat-on.
- **Survivors face right** in side views. The game mirrors them to face left.
- No text, logos, signatures or watermarks anywhere, except the HEARTHFALL wordmark.

## Interface icons

The game interface is being rebuilt in a clean, modern style, so UI icons are **not** painted: they are flat solid white glyphs on transparent that the interface tints. One shape, no outline, no shading, rounded geometric forms, 16 px clear margin, readable at 20 px. Keep stroke widths and corner radii identical across the set so they look like one family. The exact prompt is in each icon's row.

## Workflow

1. **Batch by batch.** Do batch 1 completely, check it, commit it and push it before starting batch 2. Batch 1 is what the game needs now: the first two survivors (Esk and Mara), the redone terrain, water, the redone buildings, props, items and effects.
2. **Characters first, turnaround first.** For each survivor, make `turnaround.png` and get it right before anything else. Then make every other image of that character with the turnaround attached as the reference image, and say "the same character as the reference, same proportions, same colours". Follow the build steps in CHARACTERS.md.
3. **Generate big, deliver exact.** Generate at a larger size (for example 1024 or 1536 px), then cut out, clean and downscale with Lanczos to the exact listed size. Do the cleanup in a script (Pillow and numpy are fine) and keep the scripts in `art-codex/tools/`.
4. **Transparency.** If your image tool can output a transparent background, use it. Otherwise generate on a flat mid-grey `#7f7f7f` background and remove it, including enclosed pockets (between an arm and the body, between ladder rungs), with no grey fringe on the outline.
5. **Sheets for matching frames.** When frames or states must match (poses, creature animations, building states), generate them in one image as a sheet with the frames evenly spaced in a row, then split. Never generate frames of the same animation in separate requests unless you are editing the previous frame.
6. **Build the character animations** with `python3 art-codex/tools/compose_character.py <name>` once that character's parts, poses and the props exist. It writes the `anim/` strips and a GIF preview of each.
7. **Check.** Run `python3 art-codex/tools/check_art.py --batch 1` (then 2, 3, 4). Fix every FAIL. Then open the contact sheet it writes and the GIF previews, and review them yourself against the style table above. Regenerate anything that looks AI-made, off-palette, off-model or inconsistent with its neighbours. A file that passes the checker is not automatically good.
8. **Log.** Keep `art-codex/out/LOG.md`: for each asset, the final prompt you used, how many tries it took, and anything that is off-spec or that you are unsure about. If a spec is impossible or wrong, write it in the log and do your best; do not edit `assets.json`, `rig.json` or this brief.
9. **Commit and push** each batch to this branch (`art/codex`) with a message like `Art batch 1: Esk and Mara, terrain, buildings`. Put the contact sheets in the commit too.

## Batch 3 fixes from play-testing

Seeing batches 1 and 2 in the game showed a few problems. Fix them at the start of batch 3, before the new batch 3 assets:

1. **Pose scale.** Every character's `poses/eat.png` came out about 1.3 to 1.4 times too big, and Esk's and Mara's `poses/collapse.png` and `poses/dead.png` about 1.25 times, so survivors grew when they sat down to eat. The game shrinks them for now. Repaint all six `eat` strips, and Esk's and Mara's `collapse` and `dead`, in place at the right scale. The head must be exactly as big as in the turnaround. A seated figure is about 0.7 of the standing height, kneeling about 0.75 and lying about 0.35. Never stretch a pose to fill the frame. Put each pose next to the matching `anim/idle.png` frame and compare head sizes before you commit.
2. **Ladders read as floating blocks.** The batch 1 ladder is one square tile, so a shaft of them looks like stacked crates. The batch 3 ladder is a system that fits into the cave:
   - `ladder-top` hooks over the lip of the floor above.
   - `ladder-middle` tiles to any height.
   - `ladder-bottom` rests on the floor.
   - `ladder-peg-dirt-*` and `ladder-peg-rock-*` anchor the rails into whichever wall is beside the shaft. The game picks dirt or rock from the neighbouring cell and draws the left or right peg piece only where a wall touches.
   
   All pieces share the rail positions (x=112 and x=208), so they join without seams. Paint them as one sheet, top to bottom, then cut.
3. **Climbing.** The built `climb` strip is replaced by painted `climb-up`, `climb-down`, `ladder-on` and `ladder-off` poses for every character, with mittens and boots landing on the rails.
4. **Icons that blur at 20 px.** `ui/icons/coal`, `food`, `survivors` and `hearth` have inner lines and holes that turn to mush at 20 px (see `contact-icons-20px.png`). Repaint them in place as single solid silhouettes with at most one cut-out.
5. **No more air.** Oxygen has been cut from the game, so nothing in batch 3 shows air, gas or oxygen machines. The batch 1 diffuser and the batch 2 breath icon stay where they are but are no longer used.
6. **Collapse drift.** Ostra's, Pim's and Ruta's collapse strips slide sideways by 14 to 31 px between frames (checker WARN). Keep the feet planted while the body goes down.

Then make the rest of batch 3 in this order: the ladder pieces and climbing poses, the stockpiles, piles and items that survivors haul, the new terrain (iron ore, crystal, gravel, ice, deep rock and the layer back walls), the new buildings (coke oven, smelter, lens bench, hearth grate, crystal lamp, workbench and the rest), the research pose, the creatures, and the interface icons last.

## Batch 4 additions

Alongside the endgame assets already listed under batch 4, the game gained a few systems that want art. They are small and independent; make them after the endgame set, or whenever convenient:

- **Rooms and tiles:** `tex-tile` (built stone tile, seamless like the other terrain), `icon-tile`, `icon-door`, and three optional room labels for the inspect panel (`icon-room-bedroom`, `icon-room-hearth`, `icon-room-cellar`). The door sprites themselves are already in batch 3.
- **Cooking:** `prop-spit` (a roasting spit over the hearth, same canvas as `building-hearth`), a `cook` pose for all six survivors (`<name>-pose-cook`, 4 frames, same scale rule as the other poses), `icon-meal`, and four optional skill glyphs (`icon-skill-dig`, `-build`, `-fire`, `-haul`).
- **Toolbar categories:** `icon-cat-build`, `icon-cat-fire`, `icon-cat-living`, `icon-cat-industry`.
- **The day cycle:** clock glyphs `icon-dusk` and `icon-dawn`, to sit beside the batch 2 `icon-day` and `icon-night`.
- **Water:** water is the colony's second lifeline, drunk by survivors (a new thirst need) and used to water the mushroom beds. Art: `building-water-barrel` (empty, half, full; the starting supply in the start cave), `building-cistern` (empty, half, full), `building-drip-catcher` (dry, dripping), `building-mushroom-bed-dry` (an extra state of the batch 1 mushroom bed, same outline), `prop-bucket` (held at the grip), a `drink` pose for all six survivors (`<name>-pose-drink`, 4 frames, same scale rule), `fx-drip`, and the icons `icon-water`, `icon-thirst`, `icon-cistern`, `icon-drip-catcher` and `icon-tech-pumps`. The hand pump from batch 3 (`building-water-pump-off` and `-on`) is reused, so there is no new pump art. The game has code-built fallbacks for all of these.

All the new icons are solid white glyphs in the same family as the batch 2 and 3 icons. Rows marked "Optional." in ASSETS.md can be skipped. The game has code-built fallbacks for everything in this section, so nothing blocks: deliver whatever is ready and the game picks it up on the next import.

## Folder layout

```
art-codex/
  BRIEF.md  CHARACTERS.md  ASSETS.md      read these
  assets.json  rig.json  poses.json       specs the tools read
  tools/                                   checker, compositor, your cleanup scripts
  out/                                     everything you make
    characters/<name>/turnaround.png  portrait.png
    characters/<name>/{side,front,back}/<part>.png
    characters/<name>/poses/<pose>.png
    characters/<name>/anim/<anim>.png      built by the compositor
    props/  items/  terrain/  buildings/  creatures/  fx/  ui/  story/
    LOG.md  contact-sheet-batch<N>.png
```

When a batch is pushed, the game's maintainers pull it into the game; you do not need to wire anything up.

## Story illustrations

Eight scenes (six intro scenes, win and lose), 1920 x 1080, plus three parallax layers each so the intro can slide them slowly. Same ink-and-flat-colour language as the game, but a little richer:

- **Flat graphic shapes** and strong silhouettes, like a frame from *Hilda* or *Wolfwalkers*. Depth comes from layered planes, each further plane flatter, lighter and bluer, not from blur or photographic perspective.
- **Five to seven colours per scene.** The surface scenes are pale blue, grey and white with the sun a weak cream disc. Underground scenes are deep blue darkness with one warm fire-orange focus. Warm colour always means fire or people.
- People are small and readable, in the cast's clothes where the scene names them (Esk's pointed hood, Mara's beanie and braid, Tobin's trapper hat, Ostra's quilt shawl, Pim's earmuffs, Ruta's tunnel hood).
- Generate the full scene first, then the three layers from it: `back` (sky and far landscape, opaque, painted to continue behind everything), `mid`, `front` (transparent). Stacked they must look exactly like the full scene.
- Leave the bottom fifth of each intro scene calm, because a line of story text will sit over it. Scene 6 leaves the top third empty for the wordmark.
