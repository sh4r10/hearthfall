# Hearthfall art brief

For an artist, or as a guide for generating and cleaning up art with an AI image tool. Read [design.md](design.md) first for the world and the game.

## The feel

A frozen world, survived underground by firelight. The caves are cold, blue-grey and heavy. Every warm colour in the frame comes from fire, and the people huddled near it. The mood is close and worn but not grim: the survivors are scrappy and a little funny, like Oxygen Not Included's duplicants, and the world is hand-painted rather than realistic.

Reference points:
- **Oxygen Not Included:** side-on cutaway, painted terrain with soft organic edges, chunky readable buildings, characters built from parts.
- **Don't Starve:** scratchy dark outlines and a muted, slightly desaturated palette.
- **Darkest Dungeon (lighting only):** firelight against deep darkness.

## Rules

- **View:** strictly side-on, no perspective. The light source for painted shading is upper left.
- **Outlines:** dark warm brown (`#1a120c`), never pure black. About 3 px at the base tile size, a little uneven, as if inked by hand.
- **Shading:** two or three painted tones per material, soft edges, a little texture. No gradients that look digital, no photo textures.
- **Silhouettes first:** every building and creature must read at 48 px from its outline alone.
- **Grid:** one cell is 64 × 64 px at 1x. Deliver at 2x (128 px per cell). Buildings snap to whole cells.

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

- Proportions about 2.5 heads tall: big head, short body, stubby limbs, as in ONI.
- Winter layers: hooded coats with fur trim, scarves, mittens, patched trousers, heavy boots. Each person is recognisable by their hood, scarf colour and one accessory (goggles, a beanie, a bandage).
- **Built from parts** for puppet animation, as ONI does: head, hood (back and front), eyes (open, closed, worried), mouth (several shapes), torso, upper arm, lower arm, hand, upper leg, lower leg, foot. Each part goes on its own transparent layer.
- **Animations:** idle (breathing and shivering variants), walk, climb ladder, dig, build, carry, eat, sleep (lying down), cold (hugging self), dying, and a celebrate gesture.
- A 128 px tall version is about one cell wide and two cells tall.

## Terrain

ONI-style terrain is drawn as a material texture plus an edge treatment, so the grid never shows:
- For each material (rock, dirt, coal, ice, sand, and later deep rock and crystal): one **seamless 512 × 512 fill texture**, and one **edge strip**, a 128 px tall seamless horizontal band showing the material's lip with its outline, which the game bends around every edge.
- **Back wall:** a seamless 1024 × 1024 painted cave wall, darker and lower contrast than the terrain.
- **Water:** a fill colour plus a surface strip with a highlight.

## Buildings (first set)

Each is a single transparent PNG at 2x, plus an "off" or "broken" state where noted.

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

- Fire: flame loop, embers, smoke puff. Breath mist in the cold. Frost creeping in at the screen edges when a survivor is freezing.
- Dig debris burst for each material. Gas wisps for carbon dioxide.
- Icons, 64 px, in the same inked style: dig, cancel, every building, every need (warmth, breath, energy, food, mood, sleep), every role, and coal, food and survivors.

## Story intro

Five or six wide illustrations, 1920 × 1080, painted, with parallax layers separated where possible:
1. A normal sunny town, the sun a little too pale.
2. Frozen fields, people looking up at a weak sun.
3. A long line of people walking through snow carrying lanterns and embers.
4. The descent into a mine entrance or cave mouth.
5. The first hearth lit underground, faces lit warm against blue dark.
6. Title card: "Hearthfall".

## AI generation tips

- Generate **one asset at a time** on a plain background, then remove the background and clean the outline by hand.
- Keep a fixed style block at the start of every prompt, for example: *"2D hand-painted game asset, side view, Oxygen Not Included and Don't Starve style, warm dark-brown ink outlines, muted desaturated colours, soft painted shading lit from upper left, plain flat background"*.
- Generate a character sheet first and reuse it as the image reference for every later character asset, so faces and proportions stay consistent.
- Expect to redraw parts: AI art is usually inconsistent in line weight and lighting between pieces, which is what makes a game look cheap.

## Delivery

PNG with transparency, at 2x. One folder per category (`terrain/`, `buildings/`, `characters/`, `creatures/`, `fx/`, `ui/`, `story/`). Layered source files (PSD or Krita) for characters and creatures.
