# Hearthfall design

The single reference for what the game is. Items marked **(built)** are in the current build; everything else is planned.

## Story

The sun didn't go out. It dimmed. Its gravity never changed, so the Earth kept its orbit, but too little light and heat reached the ground. Crops failed and the oceans began to freeze. People called the day the last harvest failed **the Hearthfall**.

The survivors went underground, towards the planet's own heat, and carried fire with them. Down there they found they were not alone. Things live in the deep dark, and they are drawn to warmth, light and noise.

Other survivors are still out there, on the frozen surface or in failing shelters. Your hearths are the warmest thing for miles, and refugees follow the warmth down to you.

An animated, skippable version of this story plays from the main menu and on the first run.

## Core loop

You never control survivors directly. You mark jobs, and survivors claim and carry them out based on their role, skills and needs, as in Oxygen Not Included.

- **Hearths are everything (built).** They light and warm the caves around them. Light only travels through open space, so walls cast shadows. Hearths burn their own fuel and use up oxygen while giving off carbon dioxide and heat.
- **Light is territory (built).** Survivors won't wander into the dark on their own. In the dark they lose warmth, faster at night, and die if it runs out.
- **Coal is fuel (built).** Dig coal seams to fill the stockpile. Firekeepers carry it to hearths that run low.
- **Food (built: mushroom beds).** Mushroom beds only grow in the dark, which forces you to build outside the light.
- **Air (built).** Carbon dioxide sinks and pools, and a sealed room with a fire suffocates.
- **Water (built).** Water falls and levels out into pools. The starting cave is always dry: the map generator lets water settle and dries out any that could flow into the start room. Sealed pockets of water stay in the rock, so careless digging can flood the colony.
- **Growth.** Refugees arrive every few days. Taking one in needs a bed, food and warmth to spare.
- **Escalation.** Creatures are drawn by the colony's heat, light and digging noise, so the threat grows with colony size and depth.

## Survivors

- **Needs (built):** warmth, breath, energy, food, mood and sleep quality. Tired survivors sleep, and sleep is better somewhere warm and lit. Hungry survivors eat a ration. Mood follows how well their needs are met. Low mood slows work, and a miserable survivor refuses to work.
- **Roles (built):** Digger, Builder and Firekeeper. A job waits a short while for someone in the matching role before anyone else takes it, and specialists work faster.
- **Skills:** digging, building, firekeeping, farming, medicine and fighting, which improve with use.
- **Traits:** for example "Night owl", "Afraid of the dark" and "Iron lungs".
- **Refugees** arrive with a card showing their skills and traits, and you choose whether to take them in.

## Building and research

Start with dig, ladder, hearth, mushroom bed and oxygen diffuser **(built)**. Survivors research at a workbench to unlock more:

- **Utilities:** beds, lamps, heaters, air pumps and vents, water pumps, a medical bay, doors, storage.
- **Defence:** barricades, flare lamps (scare off Shades), spike traps (Burrowers), braziers (keep Heat-leeches off hearths), crossbow turrets.

## Creatures

- **Shades** live in the dark and avoid light. They attack anyone outside the firelight.
- **Heat-leeches** are drawn to warmth. They latch onto hearths and drain fuel.
- **Burrowers** tunnel through rock and can breach walls, letting in water, gas or cold.
- **Deep things** are rare, big and dangerous. They appear once you've dug deep or grown large.

## Modes

- **Endless (main):** grow and survive. Score is days survived multiplied by peak population, and goes on the leaderboard.
- **Scenarios:** set challenges, for example "survive 10 days with 3 people and no coal seams".
- **Co-op:** friends share one colony.
- **Competitive:** players dig into the same world from different sides. Physics is a weapon: breach a wall to flood or gas a rival.

## Tutorial

On the first run, a guided tutorial on a fixed map covers the basics only: mark a dig, dig coal, refuel the hearth, build a ladder, plant mushrooms in the dark, and get through the first night. Each step waits for the player and highlights the relevant button. It can be skipped or replayed from the menu.

## Look

Side-on, as in Oxygen Not Included, but in low-poly 3D built in code, in the style of Keepfall: faceted rock, chunky flat-shaded models, firelight casting real shadows, and bloom **(built)**. Firelight and darkness carry the mood. Every model comes from one registry, so better hand-made models or sprites can replace any piece later without touching the game. Details in [art-brief.md](art-brief.md).
