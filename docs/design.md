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
- **The HUD always shows:** depth (a gauge with the 5 layers, counted in cells below the start cave; each layer is a fifth of the rock below) **(built)**, what the next layer needs, and time until night **(built)**.

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

- **Speed (built):** pause, 1x, 2x and 3x in the top bar. Space pauses and resumes, shift-1 to 3 picks a speed. Orders given while paused show at once and wait for the clock.
- **Priorities (built):** every order has a priority from 1 (whenever) to 9 (urgent), 5 by default. Survivors take the most urgent order they can reach, then the nearest. The Priority tool (P) repaints orders with a level picked from a strip of 1 to 9 (number keys while it is out). A hearth keeps its own refuel priority, set from its inspect panel.
- **Stuck orders (built):** when orders can't go ahead, an amber chip in the top bar says how many and why: can't be reached, needs coal, needs stone, under a building nobody is taking down, or nobody free for 30 s. A dig deep inside a block of marked rock is not stuck, since the digs around it open the way. Clicking the chip jumps to the next stuck order and inspects it. Stuck orders carry an amber "!" on the map.
- **Inspect (built):** click anything a tool wouldn't act on (a hearth, a building, a survivor, a seam, an order already marked) for a live panel. A hearth shows its coal, burn rate, time until it goes out, warm reach by day and night, and its refuel priority. Survivors show their role, what they are doing and every need.
- **Orders (built):** dig, build, remove and cancel. Click one cell, or shift-drag a box over many (build tools paint along the pointer instead). Right-click or right-drag cancels with any tool. Cancelling frees the survivor on it at once.
- **Remove (built):** a Builder walks over and takes the building down, salvaging half its cost rounded up (a hearth also gives back the fuel in it). Cairns can't be removed.
- **Support (built):** everything but ladders and cairns stands on solid floor. Marking a building's floor to dig also orders the building taken down, and the dig waits until it is. A building whose floor goes some other way falls at once, is salvaged as if removed, and the log says so. A planned building whose floor is dug out is dropped.

- **Hearths are everything (built).** They light and warm the caves around them. Light only travels through open space, so walls cast shadows. Hearths burn their own fuel and give off heat, and stay lit as long as they have fuel.
- **Light is territory (built).** Survivors won't wander into the dark on their own, and an idle survivor caught in the dark heads for the nearest lit cell. In the dark they lose warmth, faster at night, and die if it runs out. Lamp light without a hearth is "lit but cold": warmth drifts down slowly (5 per tick) instead of recovering.
- **Coal is fuel (built).** Dig coal seams to fill the stockpile. Firekeepers carry it to hearths that run low.
- **Hauling (built).** Digging drops what it cuts as a pile on the floor (coal 4 a cell, rock 3 stone, dirt 1), merging with a pile of the same thing up to 2 cells along. Nothing counts towards stock until a survivor carries it to a **stockpile** (2 stone, three cells wide; one stands in the start cave). Every pile raises a haul errand that Haulers prefer; a survivor carries up to 10 at a time to the nearest stockpile they can reach, and drops the load where they stand if a need (cold, hunger, sleep) cuts in. To keep the early days safe, nobody fetches from the dark at night: those piles wait for dawn. Building and refuelling draw on the stock. Salvage from removed buildings goes straight to stock.
- **Smoke (built).** Fires give off smoke, slowly: it rises, pools under ceilings and in dead-end pockets, soaks into the walls a little, and with one hearth in the start cave takes about three days to get thick. Thick smoke dims the light, which shrinks the warm, Shade-free area, and makes survivors cough (lower mood, slower work). It never kills on its own. Deal with it by digging a flue up from the fire, so it spreads into more rock, or building a vent (3 stone) where it pools. The log warns the first time smoke gets thick, and the Warmth view shows it as a grey haze. Later, via research: better burners and coke that smoke less.
- **Stone is for building (built).** Digging grey rock gives 3 stone a cell and dirt 1, since every tunnel pays a little. Every building costs something, paid when it is finished: ladder 1 stone, mushroom bed 2 stone, bed 3 stone, lamp 2 coal and 1 stone, vent 3 stone, hearth 8 coal and 4 stone. You start with 24 coal and 12 stone, and the start cave has a strip of rock under its floor.
- **Food (built: mushroom beds).** Mushroom beds grow anywhere out of the firelight, which forces you to build beyond the fire. Lamp light doesn't stop them, so the way to farm safely is to light the farm with lamps: Shades keep out, and nobody has to tend the beds anyway, since they grow on their own.
- **Air (shelved 2026-10-28):** oxygen, carbon dioxide and the diffuser were removed to keep warmth as the one pressure; they live in git history before this commit if wanted back.
- **Water (built).** Water falls and levels out into pools. The starting cave is always dry: the map generator lets water settle and dries out any that could flow into the start room. Sealed pockets of water stay in the rock, so careless digging can flood the colony.
- **Map views (built).** Each view answers one question the player acts on, and appears only once that question matters. **Warmth** (W, from the start) shows firelight where survivors warm up, lamp light that keeps Shades out but is cold, the dark, the part that goes cold tonight (hatched, with a dashed line where the fire will reach after dark), and coal seams. Its legend says who is out in the cold and how much the warm area shrinks tonight; before the first night the game points at it. Cell temperature is simulated but nothing reads it yet, so it has no view. A log line warns once when a fire has under 45 s of coal left and the stockpile is empty.
- **Death (built).** A survivor who freezes, or is taken by a Shade, collapses, and a cairn is left where they fell. Deaths are logged with the day and cause.
- **Growth (built).** You start with two: Esk and Mara. From day 3, at dawn every other day, a refugee follows the firelight down and joins if there is a free bed, at least 5 food and a fire to stand by, up to eight people. The accept-or-turn-away card with skills and traits is still to come. Later idea (2026-10-28, not now): a reproduction mechanic, so colonies can also grow from within.
- **Escalation.** Creatures are drawn by the colony's heat, light and digging noise, so the threat grows with colony size and depth.

## Survivors

- **Needs (built):** warmth, energy, food, mood and sleep quality. Tired survivors sleep in a free bed, or else on their own patch of floor away from the others and the fire, and sleep is better somewhere warm and lit. Hungry survivors eat a ration. Mood follows how well their needs are met. Low mood slows work, and a miserable survivor refuses to work.
- **Roles (built):** Digger, Builder, Firekeeper and Hauler (refugees bring the Hauler). A job waits a short while for someone in the matching role before anyone else takes it, and specialists work faster.
- **Skills:** digging, building, firekeeping, farming, medicine and fighting, which improve with use.
- **Traits:** for example "Night owl", "Afraid of the dark" and "Iron lungs".
- **Refugees** arrive with a card showing their skills and traits, and you choose whether to take them in.

## Building and research

Start with dig, ladder, hearth and mushroom bed **(built)**. Everything but a ladder stands on solid floor, buildings can't overlap (a hearth or mushroom bed needs a clear cell either side), and the floor under a building can't be dug out **(built)**. Survivors research at a workbench to unlock more:

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
2. **Nights that bite (done 2026-10-28):** Shades at night, lamps, beds, depth gauge, first-night tutorial.
3. **Layers 1 to 3:** the vertical map, stone, workbench and the first research, Burrowers and Heat-leeches.
4. **A growing colony:** refugees with skill cards, skills that grow, kitchen and medbay.
5. **The win:** layers 4 and 5, defences, the Deep thing, the Deep Hearth, win screen.
6. **Around the game:** story intro, save and load, Endless, leaderboard, co-op, competitive.

## Tutorial

**(built)** On the first run a four-step guide sits under the top bar: mark coal to dig, build a lamp, build a bed, get through the first night. Each step waits for the world to show it done and pulses the button it needs. Skip remembers itself in the browser. Still to come: a fixed tutorial map and replaying it from the menu.

## Look

Side-on, as in Oxygen Not Included: painted 2D sprites and textures (AI-generated, cleaned up) standing in a 3D scene, with smooth ink-outlined terrain, an animated flame, embers and bloom **(built)**. Firelight and darkness carry the mood. Every model comes from one registry, so better art can replace any piece without touching the game, and without the images it falls back to a low-poly look. Details in [art-brief.md](art-brief.md).

The game opens on a title screen over the story art **(built)**; the animated story intro is still to come.
