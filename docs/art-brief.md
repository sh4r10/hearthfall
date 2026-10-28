# Hearthfall art brief

How Hearthfall looks, for anyone adding a model, effect or piece of UI. Read [design.md](design.md) first for the world and the game.

**Approach (updated 2026-10-28):** the world is **painted 2D art standing in a side-on 3D scene**. Painted sprites (from AI images, cleaned up) stand as flat cards in the play plane; the caves are one shader that fills smooth, ink-outlined terrain shapes with painted rock, dirt, coal and back-wall textures; fire is an animated flame sprite with embers and bloom. The sim's light field tints everything, so the dark is dark and firelight is warm. Every model comes from one registry (`apps/client/src/models.ts`): painted sprites are registered in `apps/client/src/sprites.ts` under the same names as the low-poly code-built models, and replace them whenever the image exists in `apps/client/art/`. Without the images the game falls back to the low-poly look. The renderer is `apps/client/src/world-view.ts`; the art pipeline is `scripts/process-art.py`.

## The feel

A frozen world, survived underground by firelight. The caves are cold, blue-grey and heavy. Every warm colour in the frame comes from fire, and the people huddled near it. The mood is close and worn but not grim: the survivors are scrappy and a little funny, like Oxygen Not Included's duplicants, and the world is chunky and toy-like rather than realistic.

Reference points:
- **Keepfall (keepfall.oshh.dk):** the fallback low-poly look: code-built models, flat shading, emissive glows, real shadows, bloom.
- **Oxygen Not Included:** side-on cutaway, chunky readable buildings, characters built from parts.
- **Darkest Dungeon (lighting only):** firelight against deep darkness.

## Rules

- **View:** side-on, with a perspective camera (35° field of view) a little above the play plane, looking slightly down.
- **Units:** one grid cell is 1 × 1 world unit. Models stand on y = 0, face +x, and are centred on x = 0 and z = 0. The play plane is z = 0; the camera looks from +z.
- **Shapes:** few polygons, `flatShading: true`, roughness around 0.85. Use the shared `mat()` helper so materials are cached and colours stay on the palette. Lumpy natural shapes come from `lumpGeometry()`.
- **Light:** warm light only comes from fire (point lights with shadows, emissive flames and embers). Everything else gets a faint cold fill. The sim's light field darkens whatever the fire does not reach, so the picture always matches the rules.
- **Glow:** anything that should bloom (fire, embers, glowing fungus, gauges) uses an emissive colour with intensity above 1.
- **Silhouettes first:** every building and creature must read at the default zoom (about 18 cells tall on screen) from its shape alone.
- **Animation:** in code. Models expose named parts (for example `flame`, `bubbles`, `legL`) that the renderer moves.

## Palette

| Role | Colours |
|---|---|
| Cave rock | `#3d3f45` `#5a5b5f` `#7a7873` |
| Dirt and soil | `#5e3f28` `#7d5638` `#9c7350` |
| Coal | `#1c1b1e` `#2e2c31`, with warm glints `#c9a66b` |
| Ice and water | `#1e4a63` `#3c7896` `#9cc4e4` |
| Back wall (open cave) | `#241d18` `#33291f` |
| Fire and warmth | `#fff3d0` `#ffc24a` `#ff7a1f` `#c2452f` |
| Cold and danger | `#9cc4e4` `#5f7fa8` |
| Survivor clothing | muted wools: `#6a4a3a` `#3e5566` `#56603e` `#70553a`, plus one bright scarf or patch each |
| UI accent | ember `#f0a04b` on near-black `#0e0c0b` |

## Survivors

- Proportions about 2.5 heads tall: big head, short body, stubby limbs, as in ONI. About 1.3 cells tall in the world.
- Winter layers: hooded coats with fur trim, scarves, mittens, patched trousers, heavy boots. Each person is recognisable by their hood, scarf colour and one accessory (goggles, a beanie, a bandage).
- **Built from parts** for puppet animation. The `survivor` model has pivots named `legL`, `legR` (hips), `armF`, `armB` (shoulders), `head`, and a `tool` (a pick in the front hand). Coat and scarf colours come from the variant number.
- **Animations:** done now: idle breathing, shivering and hugging self when cold, walk, work (swinging the pick), eat, sleep and dead (lying down). Still to do: climb ladder, build, carry, celebrate.

## Terrain

- **Solid cells** are large, overlapping, randomly turned low-poly lumps (one per cell, scaled about 1.4), so the rock reads as one faceted mass and the grid never shows. Lumps facing open space are lighter and cast shadows, and are nudged back so floors stay clear.
- **Details:** stalactites under ceilings, pebbles on floors, gold specks on coal, and rare glowing cave fungus.
- **Back wall:** a gently bumped low-poly plane behind the caves, warm brown where the cave is open and near-black behind rock.
- **Water:** one continuous translucent body, not a block per cell: a front face, a lit surface sloping back, a pale foam line and small rolling waves, darker with depth and shaded by the light field. Each connected surface is drawn at its average height so pools look flat.

## Buildings (first set)

Each is a registered model. Planned buildings are listed with their footprint; the first four already exist.

| Building | Size in cells | Notes |
|---|---|---|
| Hearth | 2 × 1 | Stone ring and logs. The flame is a separate looping animation, 8-12 frames. |
| Ladder | 1 × 1 | Must tile vertically. |
| Mushroom bed | 2 × 1 | Three growth stages. Mushrooms glow faintly. |
| Oxygen diffuser | 1 × 2 | On and off states. |
| Bed (cot) | 2 × 1 | Empty and occupied variants. |
| Workbench | 2 × 2 | Research station: tools, scraps, a lamp. |
| Lamp | 1 × 1 | On and off. |
| Heater | 1 × 2 | Glowing grille. |
| Air pump | 2 × 2 | |
| Door | 1 × 2 | Open and closed. |
| Storage crate | 1 × 1 | Three fill levels. |
| Medical cot | 2 × 1 | |
| Barricade | 1 × 2 | |
| Flare lamp | 1 × 2 | Defence: intense light. |
| Spike trap | 1 × 1 | |
| Brazier | 1 × 2 | |
| Crossbow turret | 2 × 2 | Separate rotating bow. |

## Creatures

| Creature | Look | Animations |
|---|---|---|
| Shade | Smoke-like humanoid shape with pale eyes, edges dissolving into the dark. Never fully visible. | drift, lunge, recoil from light |
| Heat-leech | Fist-sized slug, translucent, glows orange when full of heat. | crawl, latch, feed, burst |
| Burrower | Mole-like, armoured and eyeless, with big claws. | dig, surface, attack, retreat |
| Deep thing | Huge, only ever partly seen: a limb or an eye in the wall. | emerge, attack, withdraw |

## Effects and UI

- Fire: flickering flame cones, rising embers, a point light that flickers with them. To do: smoke puff. Breath mist in the cold. Frost creeping in at the screen edges when a survivor is freezing.
- Dig debris burst for each material. Gas wisps for carbon dioxide.
- Icons, 64 px (UI only, see [ui-guide.md](ui-guide.md)): dig, cancel, every building, every need (warmth, breath, energy, food, mood, sleep), every role, and coal, food and survivors.

## Story intro

Five or six wide illustrations, 1920 × 1080, painted, with parallax layers separated where possible:
1. A normal sunny town, the sun a little too pale.
2. Frozen fields, people looking up at a weak sun.
3. A long line of people walking through snow carrying lanterns and embers.
4. The descent into a mine entrance or cave mouth.
5. The first hearth lit underground, faces lit warm against blue dark.
6. Title card: "Hearthfall".

## Swapping in better art later

Register a new factory under the same name in `models.ts`, for example one that loads a glTF made in Blender, or one that returns a sprite. Keep the units and named parts above and nothing else changes. [art-prompts.md](art-prompts.md) has AI image prompts, now only for the story intro, UI icons and marketing art, or for sprite experiments.

### AI generation tips

- Generate **one asset at a time** on a plain background, then remove the background and clean the outline by hand.
- Keep a fixed style block at the start of every prompt, for example: *"2D hand-painted game asset, side view, Oxygen Not Included and Don't Starve style, warm dark-brown ink outlines, muted desaturated colours, soft painted shading lit from upper left, plain flat background"*.
- Generate a character sheet first and reuse it as the image reference for every later character asset, so faces and proportions stay consistent.
- Expect to redraw parts: AI art is usually inconsistent in line weight and lighting between pieces, which is what makes a game look cheap.

## Delivery

Code models: in `apps/client/src/models.ts`. Images (story, icons): PNG with transparency in `apps/client/art/`. Hand-made 3D models: glTF (`.glb`), one per registry name.
