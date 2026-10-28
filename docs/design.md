# Hearthfall design

The single reference for what the game is. Items marked **(built)** are in the current build; everything else is planned.

## Story

The sun didn't go out. It dimmed. Its gravity never changed, so the Earth kept its orbit, but too little light and heat reached the ground. Crops failed and the oceans began to freeze. People called the day the last harvest failed **the Hearthfall**.

The survivors went underground, towards the planet's own heat, and carried fire with them. Down there they found they were not alone. Things live in the deep dark, and they are drawn to warmth, light and noise.

Other survivors are still out there, on the frozen surface or in failing shelters. Your hearths are the warmest thing for miles, and refugees follow the warmth down to you.

Deep below, at the planet's warm core, is an old furnace the first refugees built and lost: the **Deep Hearth**. Relighting it would warm every cave above it.

An animated, skippable version of this story plays from the main menu and on the first run.

## The goal of a run

Each run is a descent (plan agreed 2026-10-28). **You win by digging down to the Deep Hearth and relighting it with your colony alive.** You lose when every survivor is dead, or every fire is out at dawn. A first win takes about 20 to 30 in-game days.

- **Score:** days taken, with a bonus for each survivor alive. Endless mode continues after the win, with longer nights and more creatures, and the leaderboard ranks days survived.
- **Competitive:** same seed, same map, fastest descent wins.
- **The HUD always shows:** depth (a gauge with the 5 layers), what the next layer needs, and time until night.

### The daily rhythm

1. **Day (about 70 s): prepare.** Dig, gather coal and food, build, push deeper. The light is wide and nothing attacks.
2. **Night (about 50 s): hold the line.** The light shrinks, Shades come out of the dark for anyone outside the firelight, and cold bites harder.
3. **Dawn: count the cost.** Fuel used, anyone lost, and a refugee may appear at the edge of the light.

### The layers

Every layer needs its own hearth, so going deeper splits fuel and people.

| Layer | Days | Find | Danger | To go deeper |
| --- | --- | --- | --- | --- |
| 1 Frost Crust | 1-4 | dirt, ice, shallow coal | cold, Shades at night | a second hearth below the first |
| 2 Coal Seams | 4-9 | hard rock, rich coal, stone; the workbench | Burrowers | stone walls and lamps |
| 3 Flooded Galleries | 9-14 | lakes, glowing fungus caverns (best food) | Heat-leeches, flooding | a water pump |
| 4 The Old Mine | 14-20 | ruins, scrap, iron, survivors to rescue | Shade swarms | defences, iron for the furnace |
| 5 The Warm Deep | 20-25 | warm rock, the Deep Hearth | the Deep thing | relight the Deep Hearth: win |

## Core loop

You never control survivors directly. You mark jobs, and survivors claim and carry them out based on their role, skills and needs, as in Oxygen Not Included.

- **Hearths are everything (built).** They light and warm the caves around them. Light only travels through open space, so walls cast shadows. Hearths burn their own fuel and use up oxygen while giving off carbon dioxide and heat.
- **Light is territory (built).** Survivors won't wander into the dark on their own, and an idle survivor caught in the dark heads for the nearest lit cell. In the dark they lose warmth, faster at night, and die if it runs out. Lamp light without a hearth is "lit but cold": warmth drifts down slowly (5 per tick) instead of recovering.
- **Coal is fuel (built).** Dig coal seams to fill the stockpile. Firekeepers carry it to hearths that run low.
- **Food (built: mushroom beds).** Mushroom beds only grow in the dark, which forces you to build outside the light.
- **Air (built).** Carbon dioxide sinks and pools, and a sealed room with a fire suffocates.
- **Water (built).** Water falls and levels out into pools. The starting cave is always dry: the map generator lets water settle and dries out any that could flow into the start room. Sealed pockets of water stay in the rock, so careless digging can flood the colony.
- **Death (built).** A survivor who freezes or suffocates collapses, and a cairn is left where they fell. Deaths are logged with the day and cause.
- **Growth.** Refugees arrive at dawn every few days. Taking one in needs a bed, food and warmth to spare.
- **Escalation.** Creatures are drawn by the colony's heat, light and digging noise, so the threat grows with colony size and depth.

## Survivors

- **Needs (built):** warmth, breath, energy, food, mood and sleep quality. Tired survivors sleep, and sleep is better somewhere warm and lit. Hungry survivors eat a ration. Mood follows how well their needs are met. Low mood slows work, and a miserable survivor refuses to work.
- **Roles (built):** Digger, Builder and Firekeeper. A job waits a short while for someone in the matching role before anyone else takes it, and specialists work faster.
- **Skills:** digging, building, firekeeping, farming, medicine and fighting, which improve with use.
- **Traits:** for example "Night owl", "Afraid of the dark" and "Iron lungs".
- **Refugees** arrive with a card showing their skills and traits, and you choose whether to take them in.

## Building and research

Start with dig, ladder, hearth, mushroom bed and oxygen diffuser **(built)**. Survivors research at a workbench to unlock more:

- **Lamps (built):** cost 2 coal and burn nothing. They light 4 cells by day and 3 at night through open space like hearth light, give no warmth, and keep Shades out like any light.
- **Beds (built):** free to build and walkable. A tired survivor claims the nearest free bed within 40 steps and sleeps there, one per bed: in a lit bed they sleep as well as by a warm fire and regain energy 50% faster. With no free bed they sleep where they stand.

- **Utilities:** heaters, air pumps and vents, water pumps, a medical bay, doors, storage.
- **Defence:** barricades, flare lamps (scare off Shades), spike traps (Burrowers), braziers (keep Heat-leeches off hearths), crossbow turrets.

## Creatures

- **Shades (built)** rise at night from day 2, from dark open cells at least 6 cells from any light and within 24 cells of a survivor, at most one per 3 survivors plus one. They float one cell every 4 ticks through dark open cells towards the nearest survivor in the dark, never entering light; one on a survivor drains 400 warmth a tick (a death "taken by a Shade"). They fade at dawn, when light reaches them, or when their prey reaches light with no one else in the dark within 12 cells.
- **Heat-leeches** are drawn to warmth. They latch onto hearths and drain fuel.
- **Burrowers** tunnel through rock and can breach walls, letting in water, gas or cold.
- **Deep things** are rare, big and dangerous. They appear once you've dug deep or grown large.

## Modes

- **Descent (main):** reach and relight the Deep Hearth. Score is days taken with a bonus per survivor alive.
- **Endless:** keep going after the win. Score is days survived, on the leaderboard.
- **Scenarios:** set challenges, for example "survive 10 days with 3 people and no coal seams".
- **Co-op:** friends share one colony.
- **Competitive:** players dig into the same world from different sides. Physics is a weapon: breach a wall to flood or gas a rival.

## Milestones

1. **Polish (done 2026-10-28):** smooth movement, bedrolls, collapse and cairns, painted water, hauling still to do.
2. **Nights that bite:** Shades at night, lamps, beds, depth gauge, first-night tutorial. This is where it becomes a game.
3. **Layers 1 to 3:** the vertical map, stone, workbench and the first research, Burrowers and Heat-leeches.
4. **A growing colony:** refugees with skill cards, skills that grow, kitchen and medbay.
5. **The win:** layers 4 and 5, defences, the Deep thing, the Deep Hearth, win screen.
6. **Around the game:** story intro, save and load, Endless, leaderboard, co-op, competitive.

## Tutorial

On the first run, a guided tutorial on a fixed map covers the basics only: mark a dig, dig coal, refuel the hearth, build a ladder, plant mushrooms in the dark, and get through the first night. Each step waits for the player and highlights the relevant button. It can be skipped or replayed from the menu.

## Look

Side-on, as in Oxygen Not Included: painted 2D sprites and textures (AI-generated, cleaned up) standing in a 3D scene, with smooth ink-outlined terrain, an animated flame, embers and bloom **(built)**. Firelight and darkness carry the mood. Every model comes from one registry, so better art can replace any piece without touching the game, and without the images it falls back to a low-poly look. Details in [art-brief.md](art-brief.md).

The game opens on a title screen over the story art **(built)**; the animated story intro is still to come.
