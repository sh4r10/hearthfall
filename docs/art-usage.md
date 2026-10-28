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
