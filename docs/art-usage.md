# Art usage

Codex delivers art on the `art/codex` branch (`art-codex/out/`). `scripts/import-codex-art.py` brings what the game uses into `apps/client/art/`. This page lists every delivered asset the game does **not** use, why not, and what will use it. Keep it current: `python3 scripts/art-usage.py <art-codex>` fails on any delivered asset that is neither imported nor listed here.

Ids are the asset ids in `art-codex/assets.json`; `*` matches any part of an id.

| Asset | Status | Why | Will be used by |
|---|---|---|---|
| `*-turnaround` | Reference | The model sheet every other image of a survivor is matched to. Never drawn in game. | Nothing (reference only) |
| `*-side-*`, `*-front-*`, `*-back-*` | Source | Painted body parts. `compose_character.py` builds the animation strips from them, and the game uses those strips. | Indirectly, through the `anim` strips |
| `*-pose-sleep-ground`, `*-pose-cold` | Source | The composed `sleep` and `cold` strips are built from these poses. | Indirectly, through the `anim` strips |
| `prop-hammer`, `prop-pickaxe` | Source | Baked into the `build` and `dig` strips. The pickaxe is also the dig marker (cropped by the importer). | Indirectly |
| `prop-coal-sack` | Source | Baked into the `carry` strip, which survivors walk with while hauling. | Indirectly, through the `carry` strip |
| `item-ration` | Planned | Food isn't dropped on the ground; mushroom beds put rations straight into stock. | Food hauling, if added |
| `prop-lantern` | Planned | Nothing in the game carries a lantern yet. | Refugees following the light down, and night errands |
| `building-diffuser-on`, `building-diffuser-off`, `icon-diffuser`, `icon-breath` | Retired | Air is shelved: the oxygen diffuser and the breath need are gone from the game. | Nothing, unless air comes back |
| `building-lamp-off` | Unused | Under the current rules a lamp never goes out. | A lamp that needs fuel, if one is added |
| `water-surface` | Unused | The pool surface is drawn by the animated water mesh, which shades it by firelight cell by cell. The painted strip would need the same per-cell light. | The water rework |
| `icon-coal`, `icon-food`, `icon-survivors`, `icon-hearth` | Waiting on a repaint | Their inner lines turn to mush at 20 px, so the drawn line icons stay. Codex repaints them in batch 3. | The interface, once repainted |
| `icon-hunger` | Unused | The survivor card shows food, which uses the food icon. | Nothing yet |
| `story-1`, `story-2`, `story-3`, `story-4`, `story-5`, `story-*-back`, `story-*-mid`, `story-*-front` | Planned | The animated story intro on the menu isn't built yet. `story-6` is the title screen backdrop. | The story intro |
| `*-pose-research` | Planned | Survivors at the research bench use the `build` strip for now; the research pose is a single painted frame that needs its own idle loop. | Survivors studying at the bench |
| `*-pose-climb-up`, `*-pose-climb-down`, `*-pose-ladder-on`, `*-pose-ladder-off`, `building-ladder-top`, `building-ladder-middle`, `building-ladder-bottom`, `building-ladder-peg-*` | Batch 3, not imported yet | The batch 3 ladder system: tiled ladder pieces and climb poses. Needs the ladder renderer to pick pieces per cell. | The ladder rework |
| `item-coke-pile`, `item-iron-bar-stack` | Planned | Coke and iron are made straight into stock at the oven and smelter, so they never lie on the floor. | Stockpiles that show coke and iron |
| `item-coal-pile`, `item-stone-pile`, `item-stone-chunk`, `item-scrap-pile` | Planned | Dug piles use `item-coal-chunk`, `item-iron-ore-pile` and `item-crystal-pile`; stone piles still use the code-built heap. Scrap isn't in the game. | Bigger heaps, stone piles, salvage |
| `building-stockpile-stone-half`, `building-stockpile-stone-full` | Planned | Stockpiles show the colony's coal only. | Stockpiles that show stone too |
| `building-lens-bench-idle`, `building-lens-bench-working`, `icon-lens` | Planned | The crystal lamp takes raw crystal; there is no lens-grinding step yet. | A lens bench refining step |
| `building-crystal-lamp-off` | Unused | A crystal lamp never goes out. | Nothing yet |
| `building-heater-off`, `building-heater-on`, `icon-tech-heater` | Planned | The first research branch is coke, the grate and the crystal lamp. A heater is the next fire upgrade. | A heater tech |
| `building-crate-*`, `building-kitchen-*`, `building-medbay-empty`, `building-door-*`, `building-water-pump-*` | Batch 3, not imported yet | Buildings for mechanics the game doesn't have yet (storage crates, cooking, a medic, doors, pumping water). | Those mechanics |
| `creature-heat-leech-*`, `creature-burrower-*`, `creature-shade-idle`, `creature-shade-dissolve`, `refugee` | Batch 3, not imported yet | New creatures and Shade states, and the refugee arrival. | Creatures beyond the Shade, Shade polish, refugee arrivals |
| `prop-crowbar` | Planned | Nothing pries things open yet. | Salvage |
| `tex-ice`, `tex-gravel`, `tex-deep-rock`, `tex-backwall-1`, `tex-backwall-2`, `tex-backwall-3` | Planned | The map has one rock and one back wall. These are for the deeper layers. | Layers 2 to 5 |
| `icon-pause`, `icon-speed`, `icon-priority`, `icon-alert`, `icon-inspect`, `icon-haul`, `icon-stone`, `icon-deconstruct`, `icon-area`, `icon-cancel-area` | Batch 3, not imported yet | The drawn line icons for these are in use; the painted ones need a pass to check they read at 14 to 22 px. | The interface |
| `badge-*`, `trait-*` | Batch 3, not imported yet | Role badges and trait icons for the survivor cards. | The roster and the personalities work |
