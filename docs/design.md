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
2. **Night (about 50 s, after a dusk of 8 s): hold the line.** The light shrinks over dusk, Shades come out of the dark for anyone outside the firelight, and cold bites harder.
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
- **Inspect (built):** click anything a tool wouldn't act on (a hearth, a building, a survivor, a seam, an order already marked) for a live panel. A hearth shows its coal, burn rate, time until it goes out, warm reach by day and night, whether it is cooking, and its refuel priority. Survivors show their role, what they are doing, every need, traits and temperament, morale part by part against expectations, and skills; the panel follows them as they move.
- **Managing people (built), after Oxygen Not Included:** a compact roster down the right edge, one slim row each (portrait, name, what they're doing, a thin mood bar, an amber dot when a need is low); clicking a row centres on them and inspects them. The **Colony** screen (C, or the top-bar button) holds the detail as tables with a row per survivor: **Vitals** (doing, every need, morale against expectations), **Errands** (role, and how keen each survivor is on digging, building, firekeeping and hauling: Off, Low, Normal or High; click a cell to raise it, shift-click to lower it, click a column header to raise it for everyone) and **Skills** (levels with progress to the next, the knack starred, traits and temperament). Schedules are still to come.
- **Orders (built):** dig, build, remove and cancel. Click one cell, or shift-drag a box over many (build tools paint along the pointer instead). Right-click or right-drag cancels with any tool. Cancelling frees the survivor on it at once.
- **Remove (built):** a Builder walks over and takes the building down, salvaging half its cost rounded up (a hearth also gives back the fuel in it). Cairns can't be removed.
- **Support (built):** everything but ladders and cairns stands on solid floor. Marking a building's floor to dig also orders the building taken down, and the dig waits until it is. A building whose floor goes some other way falls at once, is salvaged as if removed, and the log says so. A planned building whose floor is dug out is dropped.

- **Hearths are everything (built).** They light and warm the caves around them. Light only travels through open space, so walls cast shadows. Hearths burn their own fuel and give off heat, and stay lit as long as they have fuel.
- **The dark (built).** One rule set, read the same by the sim and on screen (a cell is dark exactly when its light is under 40 of 255; the shader draws those cells low and bluish, lit cells clearly bright). **Firelight** (a lit hearth, or a hearth room) is warm and safe: survivors recover warmth there. **Lamp light** is safe from Shades but cold: warmth drifts down slowly (5 per tick) instead of recovering. **Dark** is cold (faster at night) and, at night, where Shades hunt. The day has four phases on a 1200-tick clock (10 ticks a second): day 0-639, **dusk** 640-719, **night** 720-1199, and **dawn** for the first 80 ticks of each day after the first. Hearth, lamp and crystal-lamp radius shrink smoothly from their day to their night size over dusk and grow back over dawn, not all at once. **Curfew:** from dusk until the end of dawn nobody takes an errand whose standing cell is dark, and anyone caught in the dark with an errand or a load sets the load down and runs for the light; stuck-order reports treat these as waiting for dawn, not stuck. Survivors never wander into the dark on their own.
- **Coal is fuel (built).** Dig coal seams to fill the stockpile. Firekeepers carry it to hearths that run low.
- **Hauling (built).** Digging drops what it cuts as a pile on the floor (coal 4 a cell, rock 3 stone, dirt 1), merging with a pile of the same thing up to 2 cells along. Piles obey gravity and fall when their floor is dug out. A pile never lies inside a solid cell or under a building: when a tile or building finishes (or water floods) on top of one, the pile is pushed to the nearest free floor nearby, merging with a same-item heap if one is close (or goes to stock if there is no room), and a stockpile built on a pile stores it. Nothing counts towards stock until a survivor carries it to a **stockpile** (2 stone, three cells wide; one stands in the start cave). Every pile raises a haul errand that Haulers prefer; a survivor carries up to 10 at a time to the nearest stockpile they can reach, and drops the load where they stand if a need (cold, hunger, sleep) cuts in. To keep the early days safe, nobody fetches from the dark between dusk and dawn (the curfew, see The dark): those piles wait for daylight. Building and refuelling draw on the stock. Salvage from removed buildings goes straight to stock.
- **Smoke (built).** Fires give off smoke, slowly: it rises, pools under ceilings and in dead-end pockets, soaks into the walls a little, and with one hearth in the start cave takes about three days to get thick. Thick smoke dims the light, which shrinks the warm, Shade-free area, and makes survivors cough (lower mood, slower work). It never kills on its own. Deal with it by digging a flue up from the fire, so it spreads into more rock, or building a vent (3 stone) where it pools. The log warns the first time smoke gets thick, and the Warmth view shows it as a grey haze. Research cuts it: coke smokes half as much as coal, and so does a hearth with an iron grate (both together, a quarter).
- **Tiles, doors and rooms (built).** A **stone tile** (1 stone) is a block of cut stone survivors lay in any open cell next to something solid: platforms over gaps, bridges, ceilings and walls. It is terrain once built, solid like rock, and digging it gives the stone back. Nobody can be walled in: a tile waits until its cell is empty, and the builder works from beside it. A **door** (3 stone) is two cells tall on a floor; survivors walk through, smoke and Shades don't, and it swings open as someone passes. A **room** is any pocket of open cells, at most 48, closed off by rock, tiles and doors and not touching the map edge, the way Oxygen Not Included recognises rooms from enclosure plus furniture: the start cave is too big to count, so every room is partitioned off on purpose. What is inside decides its kind: a lit hearth makes a **hearth room**, where every cell counts as warm (it holds the smoke too, so vent it); beds and no fire make a **bedroom**, where a bed gives the best sleep there is and rests faster; two or more mushroom beds and no fire make a **mushroom cellar**, growing twice as fast; anything else is a plain room that still keeps Shades and smoke out. Rooms are outlined and tinted in the Warmth view and named in the inspect panel. Room bonuses also feed survivor morale and expectations (see the personalities work), and a mess hall follows when the kitchen does.
- **Stone is for building (built).** Digging grey rock gives 3 stone a cell and dirt 1, since every tunnel pays a little. Every building costs something, paid when it is finished: ladder 1 stone, tile 1 stone, mushroom bed 2 stone, bed 3 stone, door 3 stone, lamp 2 coal and 1 stone, vent 3 stone, hearth 8 coal and 4 stone. You start with 24 coal and 12 stone, and the start cave has a strip of rock under its floor.
- **Food (built: mushroom beds).** Mushroom beds grow anywhere out of the firelight, which forces you to build beyond the fire. Lamp light doesn't stop them, so the way to farm safely is to light the farm with lamps: Shades keep out, and nobody has to tend the beds anyway, since they grow on their own. **Water is a bonus, never a need:** each bed holds water (0 to 100, draining 1 per 10 ticks while it grows). A watered bed grows an extra ration every cycle (twice as fast, on top of the cellar bonus); a dry bed still grows at the normal rate, so water can never starve a colony. A bed with a pool within 2 cells (a box around it) waters itself for free. Any other bed that drops below half raises a water errand (Hauling skill, priority one under normal): a survivor fills a bucket at the nearest pool (about 10 ticks) and carries it over. It obeys the curfew like other errands, and pools are never drained by it.
- **Food quality (built).** Raw mushrooms keep you alive; roast ones keep you happy. When there are raw rations, at least 25 coal in stock (more than you start with, so cooking waits until coal has been dug) and fewer than 2 roast meals per survivor, a firekeeping errand appears at a lit hearth: a survivor roasts 2 raw rations with 1 coal into 3 roast meals. Survivors eat roast meals first. A roast meal is +2 morale until the next meal; raw is 0 (and -2 for a picky eater). The food stat shows raw+roast.
- **Air (shelved 2026-10-28):** oxygen, carbon dioxide and the diffuser were removed to keep warmth as the one pressure; they live in git history before this commit if wanted back.
- **Water (built).** Water is a volume per cell (0 to 1000, `Sim::water`). It falls into the cell below until that is full, then rests and spreads sideways, half the difference per tick, until neighbours are within 1; films under 20 dry up (counted in `water_lost`). A cell with 500 or more is `Element::Water` (not walkable); less is wet floor you can wade. Connected bodies of full cells equalise like communicating vessels (a quarter of the surface height difference moves per tick, so a shaft and the lake it joins end level). `Sim::take_water` and `add_water` are for buckets, pumps and drips. Pools level out. The starting cave is always dry: the map generator lets water settle and dries out any that could flow into the start room, and keeps water at least three cells from its walls so opening a coal seam never lets a lake in. Sealed pockets of water stay in the rock, so careless digging can flood the colony.
- **Map views (built).** Each view answers one question the player acts on, and appears only once that question matters. **Warmth** (W, from the start) shows firelight where survivors warm up, lamp light that keeps Shades out but is cold, the dark, the part that goes cold tonight (hatched, with a dashed line where the fire will reach after dark), and coal seams. Its legend says who is out in the cold and how much the warm area shrinks tonight; before the first night the game points at it. Cell temperature is simulated but nothing reads it yet, so it has no view. A log line warns once when a fire has under 45 s of coal left and the stockpile is empty.
- **Death (built).** A survivor who freezes, or is taken by a Shade, collapses, and a cairn is left where they fell. Deaths are logged with the day and cause, and also raise a banner under the top bar (portrait, "Esk was taken by a Shade on day 3") that stays until clicked or 20 seconds; several stack.
- **Growth (built).** You start with two: Esk and Mara. From day 3, at dawn every other day, if there is a free bed, at least 5 food and a fire to stand by, a stranger follows the firelight down and waits at the edge of the light: one of the six in the cast not yet in the colony, freshly rolled. A card shows their knack, traits, temperament and skills, and you **take them in** or **turn them away**; unanswered, they leave at nightfall. The colony tops out at the cast of six. Later idea (2026-10-28, not now): a reproduction mechanic, so colonies can also grow from within.
- **Escalation.** Creatures are drawn by the colony's heat, light and digging noise, so the threat grows with colony size and depth.

## Survivors

Every survivor is one of the cast of six (Esk, Mara, Tobin, Ostra, Pim, Ruta), but who they are inside is rolled from the seed each time they appear, so two Esks in two runs behave differently.

- **Needs (built):** warmth, energy, food, mood and sleep quality. Tired survivors sleep in a free bed, or else on their own patch of floor away from the others and the fire, and sleep is better somewhere warm and lit. A survivor who falls asleep at night sleeps until dawn, however rested, unless the cold or a Shade wakes them; night owls may get up when rested, but the curfew still holds for them. Hungry survivors eat, roast meals first. Low mood (under 30%) halves work speed, and a miserable survivor (under 10%) does nothing but keep the fires fed, so misery can't let a colony freeze.
- **Morale and expectations (built), after ONI:** morale is a sum of parts, worked out live: last meal (roast +2, raw 0), last sleep (lit bed +2, dark bed +1, dark floor -1), standing in firelight +1, the dark -2, thick smoke -2, each of cold, hunger and exhaustion -2, working at their knack +1, and a cheerful or gloomy trait ±2. Expectations are a third of their total skill levels, so they start at about 1 and rise as survivors get better. Mood drifts towards 60% when morale meets expectations, 10% more or less per point above or below. The inspect panel and Vitals table show morale against expectations and every part. Sleeping in a bed in a bedroom counts +3 for sleep.
- **Roles (built):** Digger, Builder, Firekeeper, Hauler and Researcher. Refining is firekeeper work, and fitting a grate builder work. A job waits a short while for someone in the matching role before anyone else takes it, and specialists work faster. Newcomers start in the role of their knack.
- **Errand preferences (built):** each survivor has Off, Low, Normal or High for digging, building (and grates), firekeeping (refuel, cook and refine), hauling and research, set in the Colony screen. Off means never; otherwise they take the errand they are keenest on first, then the most urgent order, then the nearest.
- **Skills (built):** digging, building, firekeeping, hauling and research, levels 0 to 10, which grow with use: every tick of work (or of carrying, for hauling) is experience, double for a quick learner and +1 at their knack. Level n needs 100·n·(n+1) experience, so level 1 comes in about 20 s of work. Work speed is 20 tenths a tick, +10 in the matching role, +2 per level. A knack (one skill, starred) starts at level 2 or 3, others at 0 or 1. Esk's knack is digging and Mara's firekeeping. Still to come: farming, medicine and fighting.
- **Traits (built):** one good and one bad each. Good: Iron lungs (smoke never bothers them), Frostborn (a quarter less cold in the dark), Quick learner, Hard worker (+4 speed), Cheerful (+2 morale), Sound sleeper (sleeps well anywhere), Light eater (hungry a quarter slower), Night owl (+6 speed at night, stays up later, the dark costs only 1). Bad: Afraid of the dark (the dark costs 4), Big appetite, Gloomy (-2 morale), Dawdler (-4 speed), Light sleeper (sleeps badly off a bed), Picky eater (raw food -2), Thin-blooded (a quarter more cold in the dark).
- **Temperament (built):** small rolled differences that change behaviour: the warmth at which they give up and go to the fire (bold to cautious, ±10%), when they stop to eat and to sleep (±5%), how quickly they pick up work when idle (eager to unhurried) and how much they fidget.

## Building and research

Start with dig, ladder, hearth and mushroom bed **(built)**. Everything but a ladder stands on solid floor, buildings can't overlap (a hearth or mushroom bed needs a clear cell either side), and the floor under a building can't be dug out **(built)**. Survivors research at a workbench to unlock more:

- **Lamps (built):** cost 2 coal and burn nothing. They light 4 cells by day and 3 at night through open space like hearth light, give no warmth, and keep Shades out like any light.
- **Beds (built):** free to build and walkable. A tired survivor claims the nearest free bed within 40 steps and sleeps there, one per bed: in a lit bed they sleep as well as by a warm fire and regain energy 50% faster. With no free bed they sleep where they stand.

- **Research (built, first branch).** A **research bench** (4 stone, three cells wide) lets the player pick one study at a time from the Research button in the top bar (R). While a study is picked, the bench raises a study errand at priority 3, below normal orders, so research never takes hands from the fire; a Researcher prefers it and works fastest. Each stint banks 120 points; progress per study is kept if the player switches. A finished study is logged and its tool appears in the toolbar. The first branch is the fire:
  - **Coking** (900): the **coke oven** (6 stone, one cell). A firekeeper bakes 3 coal into 2 coke. Coke gives a hearth 2 fuel a piece and smokes half as much while it burns; firekeepers load coke first.
  - **Smelting** (1200): the **smelter** (8 stone, three cells). 2 iron ore and 1 coal make 1 iron.
  - **Hearth grate** (1500, after Smelting): a builder fits a hearth with an iron grate for 3 iron. It burns a fuel unit every 60 ticks instead of 40, its light and warmth reach 2 cells further, and it smokes half as much.
  - **Crystal lens** (1400, after Coking): the **crystal lamp** (1 stone, 2 crystal) lights 8 cells by day and 6 at night, twice a lamp, with no fuel.
- **Refining runs itself, gently (built).** Ovens and smelters raise their own errands at priority 4, but only while the colony has coal to spare: they never take the stock below 16 coal, and stop once there are 20 coke or 10 iron. So a refinery can't starve the fires, which keeps the early days safe.
- **Deeper materials (built).** **Iron ore** veins appear a few cells below the start cave (2 ore a cell, a guaranteed pocket just under the shell) and **crystal** deeper, in hard rock more than 14 cells down (1 crystal a cell, with a guaranteed pocket about 16 down). Both are dug and hauled like coal and stone.
- **Utilities:** heaters, air pumps and vents, water pumps, a medical bay, storage. Doors and tiles are built.
- **Defence:** barricades, flare lamps (scare off Shades), spike traps (Burrowers), braziers (keep Heat-leeches off hearths), crossbow turrets.

## Creatures

- **Shades (built)** rise at night from day 2, from dark open cells at least 6 cells from any light and within 24 cells of a survivor, at most one per 3 survivors plus one; none rise in the last 120 ticks of the night, so the night ends quiet. They float one cell every 4 ticks through dark open cells towards the nearest survivor in the dark, never entering light; one on a survivor drains 400 warmth a tick (a death "taken by a Shade"). At dawn they don't blink out: they turn and retreat from the light, one step towards the darkest neighbouring cell, cannot attack, and dissolve (the dissolve sprite fades them) by the end of dawn, sooner if light reaches them. They also fade when their prey reaches light with no one else in the dark within 12 cells.
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
4. **A growing colony:** strangers with skill cards, traits, morale and skills that grow (built 2026-10-29); kitchen, schedules and medbay still to come.
5. **The win:** layers 4 and 5, defences, the Deep thing, the Deep Hearth, win screen.
6. **Around the game:** story intro, save and load, Endless, leaderboard, co-op, competitive.

## Tutorial

**(built)** On the first run a four-step guide sits under the top bar: mark coal to dig, build a lamp, build a bed, get through the first night. Each step waits for the world to show it done and pulses the button it needs. Step 1 also pulses a glow on the nearest coal cell a survivor can reach (an exposed seam beside open floor, nearest the first hearth) and glides the camera to it if it is off screen. Skip remembers itself in the browser. Still to come: a fixed tutorial map and replaying it from the menu.

**The toolbar unfolds (built).** The game starts with Dig, Ladder, Hearth, Lamp, Bed, Mushrooms, Stockpile, Research bench (in Industry), Remove, Cancel and Priority. The rest arrive as the colony is ready, and each reveal pulses the new button and logs one line saying what it is for and which category it lives in: Tile and Door (in Build) from day 2 or once the colony holds 20 stone; Vent (in Fire and light) when smoke first warns or on day 3. Clicking the top-bar Research button before any bench exists selects the bench tool and opens the Industry flyout, with the bench hint. Tools behind research stay hidden until studied. Hidden tools have no keyboard shortcut until revealed. Build tools are grouped, after Oxygen Not Included, into category buttons that open a flyout row above the bar: Build (Ladder, Tile, Door, Stockpile), Fire and light (Hearth, Lamp, Crystal lamp, Vent, Grate), Living (Bed, Mushrooms) and Industry (Research bench, Coke oven, Smelter); Dig, Priority, Remove and Cancel stay top level. A category hides while all its tools are hidden, and pulses with a new tool. The single-key shortcuts still pick the tool directly and open its flyout.

**Goals (built).** When the tutorial ends (or was skipped on an earlier run), a small "Next" card takes its place and sets one goal at a time, each checked from the world and logged when done: store 40 coal; build a research bench and start a study; wall off a bedroom; grow food (two mushroom beds); reach the next layer. The card lights up the tool it needs (and its category), shows progress where it can, and can be skipped. Like the tutorial, skipping or finishing is remembered. Both hide when the game-over panel shows.

## Look

Side-on, as in Oxygen Not Included: painted 2D sprites and textures (AI-generated, cleaned up) standing in a 3D scene, with smooth ink-outlined terrain, an animated flame, embers and bloom **(built)**. Firelight and darkness carry the mood. Every model comes from one registry, so better art can replace any piece without touching the game, and without the images it falls back to a low-poly look. Details in [art-brief.md](art-brief.md).

The game opens on a title screen over the story art **(built)**; the animated story intro is still to come.
