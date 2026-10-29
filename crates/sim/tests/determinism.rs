use sim::{Activity, Building, Command, Element, JobKind, Sim};

fn script(tick: u64, sim: &Sim) -> Vec<Command> {
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    match tick {
        5 => vec![Command::Build { x: cx + 4, y: cy, building: Building::Lamp }],
        10..=30 => vec![Command::Dig { x: cx + 9 + (tick as u32 - 10), y: cy }],
        _ => vec![],
    }
}

fn run(seed: u64, ticks: u64) -> u64 {
    let mut sim = Sim::new(seed, 128, 96);
    for t in 0..ticks {
        let cmds = script(t, &sim);
        sim.step(&cmds);
    }
    sim.state_hash()
}

/// A sealed box of open floor, `w` by `h`, with solid rock around it.
fn sealed_room(seed: u64, size: u32, room: (u32, u32, u32, u32)) -> Sim {
    let mut sim = Sim::new(seed, size, size);
    let (x0, y0, x1, y1) = room;
    for y in 0..size {
        for x in 0..size {
            let i = sim.idx(x, y);
            let open = (x0..=x1).contains(&x) && (y0..=y1).contains(&y);
            sim.elements[i] = if open { Element::Floor } else { Element::Rock };
            sim.buildings[i] = Building::None;
        }
    }
    sim.water.fill(0);
    sim.water_lost = 0;
    sim.water_store.fill(0);
    sim.water_stock = 0;
    sim
}

/// A full water barrel at (x, y), for a sealed room whose survivors must last days.
fn add_barrel(sim: &mut Sim, x: u32, y: u32) {
    let i = sim.idx(x, y);
    sim.buildings[i] = Building::WaterBarrel;
    sim.water_store[i] = sim::START_WATER;
    sim.water_stock = sim::START_WATER;
}

/// Total water in the world plus what has dried up, which must never change.
fn water_total(sim: &Sim) -> i64 {
    sim.water.iter().map(|&v| v as i64).sum::<i64>() + sim.water_lost
}

#[test]
fn same_seed_and_commands_give_same_hash() {
    assert_eq!(run(42, 600), run(42, 600));
}

#[test]
fn different_seeds_diverge() {
    assert_ne!(run(1, 50), run(2, 50));
}

#[test]
fn water_falls() {
    let mut sim = sealed_room(4, 16, (0, 0, 15, 15));
    sim.colonists.clear();
    let i = sim.idx(8, 2);
    sim.add_water(i, 1000);
    for _ in 0..30 {
        sim.step(&[]);
    }
    let rows: Vec<usize> = (0..256).filter(|&i| sim.water[i] > 0).map(|i| i / 16).collect();
    assert!(rows.iter().all(|&r| r == 15), "water floated: {rows:?}");
    assert_eq!(water_total(&sim), 1000);
}

#[test]
fn hearth_lights_the_start_room_and_burns_its_fuel() {
    let mut sim = Sim::new(6, 64, 64);
    let centre = sim.idx(32, 32);
    assert!(sim.light[centre] > 200);
    let fuel = sim.hearth_fuel[centre];
    for _ in 0..200 {
        sim.step(&[]);
    }
    assert_eq!(sim.hearth_fuel[centre], fuel - 5);
}

#[test]
fn colonists_freeze_when_the_fire_dies() {
    let mut sim = Sim::new(6, 64, 64);
    let centre = sim.idx(32, 32);
    sim.hearth_fuel[centre] = 0;
    sim.coal = 0;
    for _ in 0..1000 {
        sim.step(&[]);
    }
    assert!(sim.light.iter().all(|&l| l == 0));
    assert_eq!(sim.alive_colonists(), 0);
}

#[test]
fn frozen_colonists_leave_cairns_and_death_events() {
    let mut sim = Sim::new(6, 64, 64);
    let centre = sim.idx(32, 32);
    sim.hearth_fuel[centre] = 0;
    sim.coal = 0;
    for _ in 0..1000 {
        sim.step(&[]);
    }
    assert_eq!(sim.alive_colonists(), 0);
    for (k, c) in sim.colonists.iter().enumerate() {
        assert_eq!(c.cause, sim::CAUSE_FROZE);
        // The cold hearth stays put; anywhere else gets a cairn.
        let i = sim.idx(c.x, c.y);
        // A cairn never goes on or beside another building, such as the starting stockpile.
        let expected = if i == centre { Building::Hearth } else if sim.room_for(c.x, c.y, Building::Cairn) || sim.buildings[i] == Building::Cairn { Building::Cairn } else { sim.buildings[i] };
        assert_eq!(sim.buildings[i], expected, "colonist {k} at {},{}", c.x, c.y);
        let deaths: Vec<_> = sim.events.iter().filter(|e| e.colonist == k as u32).collect();
        assert_eq!(deaths.len(), 1);
        assert_eq!(deaths[0].kind, sim::EVENT_DEATH);
    }
    assert_eq!(sim.events.len(), sim.colonists.len());
}

#[test]
fn a_survivor_walks_over_and_digs_a_marked_cell() {
    // Floor along the bottom of a room, with a coal block at the far end.
    let mut sim = sealed_room(1, 40, (5, 10, 30, 20));
    let target = sim.idx(31, 20);
    sim.elements[target] = Element::Coal;
    // Somewhere to carry the coal to.
    let store = sim.idx(10, 20);
    sim.buildings[store] = Building::Stockpile;
    let coal = sim.coal;
    sim.step(&[Command::Dig { x: 31, y: 20 }]);
    assert_eq!(sim.jobs.len(), 1);
    for _ in 0..1200 {
        sim.step(&[]);
    }
    assert_eq!(sim.elements[target], Element::Floor, "jobs left: {:?}", sim.jobs);
    // Dug coal lands as a pile and only counts once someone hauls it in.
    assert_eq!(sim.coal, coal + sim::COAL_PER_CELL);
    assert!(sim.jobs.is_empty());
}

#[test]
fn builders_use_ladders_to_reach_high_jobs() {
    let mut sim = sealed_room(2, 40, (5, 5, 30, 20));
    // A ladder up the middle, and a job on a ledge only the ladder reaches.
    for y in 8..=20 {
        let i = sim.idx(18, y);
        sim.buildings[i] = Building::Ladder;
    }
    // Make (19, 8) solid so (19, 7) is a ledge beside the ladder.
    let ledge = sim.idx(19, 8);
    sim.elements[ledge] = Element::Rock;
    sim.step(&[Command::Build { x: 19, y: 7, building: Building::Lamp }]);
    for _ in 0..800 {
        sim.step(&[]);
    }
    assert_eq!(sim.buildings[sim.idx(19, 7)], Building::Lamp, "jobs: {:?}", sim.jobs);
}

#[test]
fn firekeepers_refuel_hearths_from_the_stockpile() {
    let mut sim = Sim::new(6, 64, 64);
    let centre = sim.idx(32, 32);
    sim.hearth_fuel[centre] = 5;
    sim.coal = 30;
    // The firekeeper (Mara, colonist 1) takes it, even though the digger is as close.
    let mut taker = None;
    for _ in 0..30 {
        sim.step(&[]);
        taker = taker.or(sim.jobs.iter().find(|j| j.kind == JobKind::Refuel).and_then(|j| j.claimed_by));
    }
    assert_eq!(taker, Some(1));
    for _ in 0..300 {
        sim.step(&[]);
    }
    assert!(sim.hearth_fuel[centre] > 15);
    assert!(sim.coal < 30);
}

#[test]
fn tired_survivors_sleep_and_hungry_ones_eat() {
    let mut sim = Sim::new(6, 64, 64);
    sim.colonists[0].energy = 100;
    sim.colonists[1].fullness = 100;
    let food = sim.food;
    sim.step(&[]);
    assert_eq!(sim.colonists[0].activity, Activity::Sleeping);
    assert_eq!(sim.colonists[1].activity, Activity::Eating);
    for _ in 0..40 {
        sim.step(&[]);
    }
    assert_eq!(sim.food, food - 1);
    assert!(sim.colonists[1].fullness > 5000);
    assert!(sim.colonists[0].energy > 100);
}

#[test]
fn the_start_room_never_floods() {
    for seed in 0..40 {
        for (w, h) in [(160, 110), (128, 96)] {
            let mut sim = Sim::new(seed, w, h);
            for _ in 0..300 {
                sim.step(&[]);
            }
            let (cx, cy) = (w / 2, h / 2);
            for y in cy - 4..=cy {
                for x in cx - 8..=cx + 8 {
                    assert_ne!(sim.elements[sim.idx(x, y)], Element::Water, "seed {seed} ({w}x{h}) flooded at {x},{y}");
                }
            }
        }
    }
}

#[test]
fn water_levels_out_into_a_flat_pool() {
    let mut sim = sealed_room(4, 16, (0, 0, 15, 15));
    sim.colonists.clear();
    // A tall column of water on the left of an empty basin.
    for y in 4..16 {
        for x in 0..4 {
            let i = sim.idx(x, y);
            sim.add_water(i, 1000);
        }
    }
    assert_pool_levels_out(&mut sim, 16, 48_000);
}

/// Run the sim until the water rests (within `limit` ticks), then check the pool is flat.
fn assert_pool_levels_out(sim: &mut Sim, floor_row: u32, total: i64) {
    let mut settled_after = None;
    for t in 0..3000 {
        let before = sim.water.clone();
        sim.step(&[]);
        if before == sim.water {
            settled_after = Some(t);
            break;
        }
    }
    let t = settled_after.expect("pool never came to rest");
    println!("pool rested after {t} ticks");
    for _ in 0..100 {
        let before = sim.water.clone();
        sim.step(&[]);
        assert_eq!(before, sim.water, "pool started moving again");
    }
    assert_eq!(water_total(sim), total);
    // Neighbouring wet cells on the bottom row differ by at most one volume step
    // (flow stops at a difference of 1), and the whole row stays within 3% of full.
    let row: Vec<i32> = (0..sim.width).map(|x| sim.water[sim.idx(x, floor_row - 1)]).filter(|&v| v > 0).collect();
    assert!(row.windows(2).all(|p| (p[0] - p[1]).abs() <= 1), "surface not flat: {row:?}");
    let (lo, hi) = (*row.iter().min().unwrap(), *row.iter().max().unwrap());
    assert!(hi - lo <= 30, "surface not flat: {lo}..{hi}");
}

#[test]
fn water_is_conserved_over_two_thousand_ticks() {
    let mut sim = Sim::new(11, 128, 96);
    sim.colonists.clear();
    let total = water_total(&sim);
    assert!(sim.water.iter().sum::<i32>() > 0);
    // Pour some more in from above the start cave's dirt to keep things moving.
    for _ in 0..2000 {
        sim.step(&[]);
        assert_eq!(water_total(&sim), total);
    }
    assert!(sim.water_lost < total / 10 + 1, "too much water dried up: {}", sim.water_lost);
}

#[test]
fn a_dug_open_pocket_drains_into_a_cave_and_levels_flat() {
    // A sealed pocket high up, a rock plug, and a wide empty cave below.
    let mut sim = sealed_room(4, 24, (0, 0, 0, 0));
    sim.colonists.clear();
    for y in 2..22 {
        for x in 2..22 {
            let i = sim.idx(x, y);
            sim.elements[i] = if y >= 14 { Element::Floor } else { Element::Rock };
        }
    }
    for y in 5..8 {
        for x in 6..10 {
            let i = sim.idx(x, y);
            sim.elements[i] = Element::Floor;
            sim.add_water(i, 1000);
        }
    }
    let plug = sim.idx(8, 8);
    sim.step(&[]);
    assert_eq!(sim.elements[plug], Element::Rock);
    assert!(sim.water[sim.idx(8, 7)] == 1000 && sim.water[sim.idx(8, 20)] == 0);
    for y in 8..14 {
        let i = sim.idx(8, y);
        sim.elements[i] = Element::Floor;
    }
    let total = water_total(&sim);
    assert_eq!(total, 12_000);
    // The cave floor is row 21, so its bottom row is y = 21 (floor_row 22).
    assert_pool_levels_out(&mut sim, 22, total);
    assert!(sim.water[sim.idx(8, 6)] == 0, "pocket did not drain");
}

#[test]
fn same_seed_gives_same_hash_through_a_night_with_shades() {
    // Long enough to cover the second night, when Shades first come out.
    assert_eq!(run(42, sim::DAY_TICKS * 2 + 100), run(42, sim::DAY_TICKS * 2 + 100));
}

#[test]
fn lamps_light_cells_without_warming_them() {
    let mut sim = sealed_room(11, 40, (5, 10, 30, 20));
    let lamp = sim.idx(10, 20);
    sim.buildings[lamp] = Building::Lamp;
    sim.colonists[0].x = 11;
    sim.colonists[0].warmth = 5000;
    sim.colonists[1].x = 25;
    sim.colonists[1].warmth = 5000;
    sim.step(&[]);
    // Radius 4 by day: three cells out is still lit, four is dark.
    assert!(sim.light[lamp] > 200);
    assert!(!sim.is_dark(sim.idx(13, 20)));
    assert!(sim.is_dark(sim.idx(14, 20)));
    assert!(!sim.is_warm(lamp));
    for _ in 0..19 {
        sim.step(&[]);
    }
    // Lamp light: a slow drift down. Out in the dark: the full day rate.
    assert!(!sim.is_dark(sim.idx(sim.colonists[0].x, sim.colonists[0].y)));
    assert_eq!(sim.colonists[0].warmth, 5000 - 20 * sim::LIT_COLD_DRAIN);
    assert!(sim.colonists[1].warmth < sim.colonists[0].warmth);

    // Radius 3 at night.
    sim.tick = sim::DAY_TICKS * 6 / 10;
    sim.step(&[]);
    assert!(!sim.is_dark(sim.idx(12, 20)));
    assert!(sim.is_dark(sim.idx(13, 20)));
}

#[test]
fn builders_build_lamps_for_coal() {
    let mut sim = sealed_room(11, 40, (5, 10, 30, 20));
    sim.coal = 3;
    sim.stone = 1;
    sim.step(&[Command::Build { x: 12, y: 20, building: Building::Lamp }]);
    for _ in 0..400 {
        sim.step(&[]);
    }
    assert_eq!(sim.buildings[sim.idx(12, 20)], Building::Lamp, "jobs: {:?}", sim.jobs);
    assert_eq!((sim.coal, sim.stone), (3 - sim::LAMP_COST, 0));
}

#[test]
fn tired_survivors_walk_to_a_free_bed() {
    let mut sim = sealed_room(12, 40, (5, 10, 30, 20));
    let bed = sim.idx(12, 20);
    sim.buildings[bed] = Building::Bed;
    sim.colonists[0].energy = 100;
    sim.colonists[1].energy = 100;
    sim.step(&[]);
    // The first takes the bed; one sleeper per bed, so the second lies down on the floor.
    assert_eq!(sim.colonists[0].bed, Some(bed as u32));
    assert_eq!(sim.colonists[0].activity, Activity::Walking);
    assert_ne!(sim.colonists[1].bed, Some(bed as u32));
    assert_eq!(sim.colonists[1].activity, Activity::Sleeping);
    for _ in 0..30 {
        sim.step(&[]);
    }
    assert_eq!((sim.colonists[0].x, sim.colonists[0].y), (12, 20));
    assert_eq!(sim.colonists[0].activity, Activity::Sleeping);
    for _ in 0..200 {
        sim.step(&[]);
    }
    // Even in the dark, a bed rests better than the floor.
    assert!(sim.colonists[0].energy > sim.colonists[1].energy, "bed {} floor {}", sim.colonists[0].energy, sim.colonists[1].energy);
    assert!(sim.colonists[0].sleep_quality > sim.colonists[1].sleep_quality);
}

#[test]
fn floor_sleepers_spread_out_and_keep_off_the_hearth() {
    for seed in 0..10 {
        let mut sim = Sim::new(seed, 64, 64);
        for c in sim.colonists.iter_mut() {
            c.energy = 100;
        }
        for _ in 0..120 {
            sim.step(&[]);
        }
        let spots: Vec<(u32, u32)> = sim.colonists.iter().filter(|c| c.activity == Activity::Sleeping).map(|c| (c.x, c.y)).collect();
        assert_eq!(spots.len(), sim.colonists.len(), "seed {seed}: not all asleep");
        for (k, &(x, y)) in spots.iter().enumerate() {
            for &(ox, oy) in &spots[k + 1..] {
                assert!(oy != y || x.abs_diff(ox) > 1, "seed {seed}: sleepers at {x},{y} and {ox},{oy} overlap");
            }
            for dx in -2i32..=2 {
                let hx = (x as i32 + dx) as u32;
                assert_ne!(sim.buildings[sim.idx(hx, y)], Building::Hearth, "seed {seed}: sleeper at {x},{y} beside the hearth");
            }
        }
    }
}

#[test]
fn shades_come_out_from_the_second_night_and_never_enter_light() {
    let mut sim = sealed_room(13, 48, (2, 14, 45, 24));
    let lamp = (40u32, 24u32);
    let i = sim.idx(lamp.0, lamp.1);
    sim.buildings[i] = Building::Lamp;
    let mut seen = false;
    let mut count = 0;
    while sim.tick < sim::DAY_TICKS * 2 + 50 {
        // Keep everyone alive so the Shades keep coming.
        for c in sim.colonists.iter_mut() {
            c.warmth = sim::STAT_MAX;
            c.fullness = sim::STAT_MAX;
        }
        // The tick being simulated, before step moves the clock on. Shades
        // linger through dawn, retreating.
        let (night, day) = (sim.night_level() > 0, sim.day());
        sim.step(&[]);
        if !night || day < sim::SHADE_FIRST_DAY {
            assert!(sim.shades.is_empty(), "shade at tick {}", sim.tick);
        }
        assert!(sim.shades.len() <= sim.alive_colonists() / 3 + 1);
        for s in &sim.shades {
            assert!(sim.is_dark(sim.idx(s.x, s.y)), "shade in the light at {},{}", s.x, s.y);
        }
        if sim.shades.len() > count {
            let s = sim.shades.last().unwrap();
            assert!(s.x.abs_diff(lamp.0) + s.y.abs_diff(lamp.1) >= sim::SHADE_SPAWN_FROM_LIGHT as u32);
        }
        count = sim.shades.len();
        seen |= count > 0;
    }
    assert!(seen, "no shade ever came");
}

#[test]
fn shades_take_survivors_left_in_the_dark() {
    let mut sim = sealed_room(14, 40, (5, 10, 30, 20));
    // Nightfall on day 2, with no light anywhere.
    sim.tick = sim::DAY_TICKS + sim::DAY_TICKS * 6 / 10;
    for _ in 0..300 {
        sim.step(&[]);
    }
    let taken = sim.colonists.iter().filter(|c| c.cause == sim::CAUSE_TAKEN).count();
    assert!(taken > 0, "causes: {:?}", sim.colonists.iter().map(|c| c.cause).collect::<Vec<_>>());
    assert!(sim.events.iter().any(|e| e.kind == sim::EVENT_SHADE_ATTACK));
    assert!(sim.events.iter().any(|e| e.kind == sim::EVENT_DEATH));
    // Dawn sends them away: they retreat, cannot attack, and are gone by day.
    while sim.is_night() {
        sim.step(&[]);
    }
    sim.step(&[]);
    assert!(sim.shades.iter().all(|s| s.state == sim::SHADE_RETREATING));
    while sim.is_dawn() {
        sim.step(&[]);
    }
    assert!(sim.shades.is_empty());
}

#[test]
fn buildings_cannot_be_placed_over_each_other() {
    let mut sim = sealed_room(14, 40, (5, 10, 30, 20));
    sim.coal = 100;
    let (x, y) = (12u32, 20u32);
    sim.step(&[Command::Build { x, y, building: Building::Hearth }]);
    // A hearth's picture reaches a cell either side: nothing can go there,
    // nor a mushroom bed (which also reaches a cell) two cells away.
    sim.step(&[Command::Build { x: x + 1, y, building: Building::Bed }]);
    sim.step(&[Command::Build { x: x + 2, y, building: Building::MushroomBed }]);
    // A bed two cells away and another beside it are fine.
    sim.step(&[Command::Build { x: x + 2, y, building: Building::Bed }]);
    sim.step(&[Command::Build { x: x + 3, y, building: Building::Bed }]);
    let planned: Vec<(u32, Building)> = sim.jobs.iter().filter_map(|j| match j.kind {
        JobKind::Build(b) => Some((j.x, b)),
        _ => None,
    }).collect();
    assert_eq!(planned, vec![(x, Building::Hearth), (x + 2, Building::Bed), (x + 3, Building::Bed)]);
}

#[test]
fn buildings_never_float() {
    let mut sim = sealed_room(15, 40, (5, 10, 30, 20));
    // Nothing but a ladder goes up in mid-air.
    sim.step(&[Command::Build { x: 12, y: 15, building: Building::Bed }]);
    assert!(sim.jobs.is_empty());
    // A building's floor can't be dug out from under it, not even at the edge
    // of a wide one: removing a building is always an explicit order.
    let lamp = sim.idx(12, 20);
    sim.buildings[lamp] = Building::Lamp;
    let hearth = sim.idx(16, 20);
    sim.buildings[hearth] = Building::Hearth;
    let cairn = sim.idx(8, 20);
    sim.buildings[cairn] = Building::Cairn;
    sim.step(&[Command::Dig { x: 12, y: 21 }, Command::Dig { x: 17, y: 21 }, Command::Dig { x: 8, y: 21 }]);
    assert!(sim.jobs.iter().all(|j| j.kind != JobKind::Dig));
    assert!(sim.holds_up_building(15, 21) && !sim.holds_up_building(18, 21));
    // A bed whose floor goes anyway falls and is salvaged at once.
    let bed = sim.idx(20, 20);
    sim.buildings[bed] = Building::Bed;
    let (stone, below) = (sim.stone, sim.idx(20, 21));
    sim.elements[below] = Element::Floor;
    sim.step(&[]);
    assert_eq!(sim.buildings[bed], Building::None);
    assert_eq!(sim.stone, stone + 2);
}

#[test]
fn the_start_room_is_sealed_with_coal_in_its_walls() {
    for seed in [0, 3, 42, 1234, 99_999] {
        let sim = Sim::new(seed, 160, 110);
        let (cx, cy) = (80i32, 55i32);
        // Nothing reachable on foot lies outside the shell, so nobody can fall
        // into a random cave before the player digs.
        // Open cells flood-fill from the hearth; every move a survivor can
        // make goes through open cells, so this bounds where they can get to.
        let mut seen = vec![false; sim.elements.len()];
        let mut stack = vec![(cx, cy)];
        while let Some((x, y)) = stack.pop() {
            let i = (y * 160 + x) as usize;
            if seen[i] || sim.elements[i] != Element::Floor {
                continue;
            }
            seen[i] = true;
            assert!((x - cx).abs() <= 8 && (-5..=0).contains(&(y - cy)), "seed {seed}: ({x}, {y}) is open outside the start room");
            stack.extend([(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]);
        }
        let coal = sim.elements.iter().enumerate().filter(|&(i, &e)| {
            let (x, y) = (i as i32 % 160, i as i32 / 160);
            e == Element::Coal && (x - cx).abs() <= 10 && (-7..=2).contains(&(y - cy))
        }).count();
        assert!(coal >= 14, "seed {seed}: only {coal} coal cells in the start shell");
    }
}

#[test]
fn a_cold_survivor_drops_work_and_goes_back_to_the_fire() {
    // Wider than a room can be (48 cells), so the corridor doesn't hold the heat.
    let mut sim = sealed_room(4, 64, (6, 30, 58, 30));
    let centre = sim.idx(32, 30);
    sim.buildings[centre] = Building::Hearth;
    sim.hearth_fuel[centre] = 40;
    sim.colonists.truncate(1);
    sim.colonists[0].x = 33;
    sim.colonists[0].y = 30;
    sim.colonists[0].role = sim::Role::Digger;
    // A dig far out in the dark, past the firelight. Once they are at work
    // there, the cold gets to them.
    sim.step(&[Command::Dig { x: 59, y: 30 }]);
    let (mut turned_back, mut warmed) = (false, false);
    for _ in 0..600 {
        sim.step(&[]);
        if sim.colonists[0].activity == Activity::Working {
            sim.colonists[0].warmth = sim.colonists[0].warmth.min(sim::STAT_MAX / 4);
        }
        let c = &sim.colonists[0];
        if c.job.is_none() && c.heading == sim::HEADING_WARM {
            turned_back = true;
        }
        if turned_back && sim.is_warm(sim.idx(c.x, c.y)) {
            warmed = true;
        }
    }
    // The walk is long, so let the current trip back finish before looking.
    for _ in 0..400 {
        if sim.colonists[0].heading != sim::HEADING_WARM && sim.is_warm(sim.idx(sim.colonists[0].x, sim.colonists[0].y)) {
            break;
        }
        sim.step(&[]);
    }
    let c = &sim.colonists[0];
    assert!(turned_back, "never headed back to the fire");
    assert!(warmed, "turned back but never reached the fire");
    assert!(c.alive(), "froze on the job");
}

#[test]
fn a_colony_left_alone_survives_its_first_night() {
    let mut sim = Sim::new(42, 160, 110);
    for _ in 0..sim::DAY_TICKS {
        sim.step(&[]);
    }
    assert!(sim.colonists.iter().all(|c| c.alive()), "someone died on day 1 with no orders given");
}

#[test]
fn the_set_maps_let_a_colony_through_four_nights_untouched() {
    // The seeds behind the title screen's set maps (apps/client/src/main.ts).
    // Nothing that builds up on its own (smoke, cold) may kill a colony that
    // just sits by its fire for the first days.
    for seed in [7, 1234, 99_999] {
        let mut sim = Sim::new(seed, 160, 110);
        sim.coal = 200; // as if the player kept the digger busy; the fire itself is the player's job
        for _ in 0..4 * sim::DAY_TICKS {
            sim.step(&[]);
            if sim.tick == 2 * sim::DAY_TICKS {
                assert!(!sim.smoke_warned, "seed {seed}: smoke got thick within two days");
            }
        }
        assert!(sim.colonists.iter().all(|c| c.alive()), "seed {seed}: someone died within four days with no orders given");
        // The barrel carried them: they drank from it, and thirst never became the cause of anything by day 4.
        assert!(sim.water_stock < sim::START_WATER, "seed {seed}: nobody drank");
        assert!(sim.colonists.iter().all(|c| c.parched == 0 || c.thirst == 0), "seed {seed}: parched counter without thirst");
    }
}

#[test]
fn a_new_map_starts_with_its_water_at_rest() {
    for seed in [1, 7, 1234, 99_999] {
        let mut sim = Sim::new(seed, 160, 110);
        sim.colonists.clear();
        let before = sim.water.clone();
        for _ in 0..300 {
            sim.step(&[]);
        }
        assert!(before == sim.water, "seed {seed}: water moved after generation");
    }
}

#[test]
fn work_only_happens_beside_the_job() {
    let mut sim = sealed_room(12, 64, (10, 30, 54, 30));
    sim.colonists.truncate(1);
    sim.colonists[0].x = 20;
    sim.colonists[0].y = 30;
    sim.step(&[Command::Build { x: 40, y: 30, building: Building::Bed }]);
    for _ in 0..600 {
        sim.step(&[]);
        let c = &sim.colonists[0];
        if c.activity == Activity::Working {
            assert!(c.x.abs_diff(40) <= 1, "working on (40, 30) from ({}, {})", c.x, c.y);
        }
        // Knock them off course once: the path is gone but the job isn't.
        if sim.tick == 20 {
            sim.colonists[0].path.clear();
        }
    }
    assert_eq!(sim.buildings[sim.idx(40, 30)], Building::Bed, "the bed was never built: {:?}", sim.jobs);
}

#[test]
fn deconstruct_takes_a_building_down_and_salvages_it() {
    let mut sim = Sim::new(7, 128, 96);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    let fire = sim.idx(cx, cy);
    assert_eq!(sim.buildings[fire], Building::Hearth);
    sim.step(&[Command::Deconstruct { x: cx, y: cy }]);
    assert!(sim.jobs.iter().any(|j| j.kind == JobKind::Deconstruct));
    for _ in 0..400 {
        sim.step(&[]);
    }
    assert_eq!(sim.buildings[fire], Building::None);
    assert_eq!(sim.hearth_fuel[fire], 0);
    assert!(sim.jobs.iter().all(|j| j.kind != JobKind::Deconstruct));
}


#[test]
fn a_stranger_waits_at_dawn_and_joins_when_taken_in() {
    let mut sim = Sim::new(42, 160, 110);
    assert_eq!(sim.colonists.len(), 2, "the colony starts with Esk and Mara");
    let bed = sim.idx(84, 55);
    sim.buildings[bed] = Building::Bed;
    sim.food = 40;
    for _ in 0..2 * sim::DAY_TICKS + 1 {
        sim.step(&[]);
    }
    assert_eq!(sim.colonists.len(), 2, "nobody joins without being asked");
    let who = sim.stranger.as_ref().expect("nobody turned up at dawn of day 3").who;
    assert!(who >= 2, "the stranger should be someone not already in the colony");
    sim.step(&[Command::AnswerStranger { accept: true }]);
    assert_eq!(sim.colonists.len(), 3);
    assert!(sim.stranger.is_none());
    assert!(sim.events.iter().any(|e| e.kind == sim::EVENT_ARRIVAL && e.colonist == 2));
    let c = &sim.colonists[2];
    assert_eq!(c.who, who);
    assert!(sim.is_warm(sim.idx(c.x, c.y)), "the newcomer appeared in the dark");
}

#[test]
fn a_stranger_turned_away_or_left_waiting_goes() {
    let mut sim = Sim::new(42, 160, 110);
    let bed = sim.idx(84, 55);
    sim.buildings[bed] = Building::Bed;
    sim.food = 40;
    sim.coal = 500; // nobody digs in this test, so keep the fire fed
    for _ in 0..2 * sim::DAY_TICKS + 1 {
        sim.step(&[]);
    }
    assert!(sim.stranger.is_some());
    sim.step(&[Command::AnswerStranger { accept: false }]);
    assert!(sim.stranger.is_none());
    assert_eq!(sim.colonists.len(), 2);
    assert!(sim.events.iter().any(|e| e.kind == sim::EVENT_TURNED_AWAY));
    // Two days later another comes, and leaves at nightfall if nobody answers.
    for _ in 0..2 * sim::DAY_TICKS {
        sim.step(&[]);
    }
    assert!(sim.stranger.is_some(), "a stranger should come every other dawn");
    for _ in 0..sim::DAY_TICKS * 6 / 10 {
        sim.step(&[]);
    }
    assert!(sim.stranger.is_none(), "an unanswered stranger leaves at nightfall");
    assert_eq!(sim.colonists.len(), 2);
}

#[test]
fn smoke_pools_under_the_ceiling_and_a_vent_clears_it() {
    // A tall sealed cave with a hearth on the floor.
    let mut sim = sealed_room(9, 64, (24, 24, 40, 30));
    let hearth = sim.idx(32, 30);
    sim.buildings[hearth] = Building::Hearth;
    sim.hearth_fuel[hearth] = 40;
    sim.coal = 500;
    add_barrel(&mut sim, 30, 30);
    for (c, x) in [(0, 28), (1, 36)] {
        sim.colonists[c].x = x;
        sim.colonists[c].y = 30;
    }
    for _ in 0..4 * sim::DAY_TICKS {
        sim.step(&[]);
    }
    let (ceiling, floor) = (sim.idx(32, 24), sim.idx(28, 30));
    assert!(sim.smoke[ceiling] > sim.smoke[floor], "smoke should rise: ceiling {} floor {}", sim.smoke[ceiling], sim.smoke[floor]);
    assert!(sim.smoke_warned, "four days of one fire should get smoky");
    assert!(sim.colonists.iter().all(|c| c.alive()), "smoke must never kill on its own");
    // A vent above the fire swallows the column and drains the ceiling around it.
    let beside = sim.idx(29, 24);
    let before = sim.smoke[beside];
    sim.buildings[ceiling] = Building::Vent;
    for _ in 0..600 {
        sim.step(&[]);
    }
    assert_eq!(sim.smoke[ceiling], 0);
    assert!(sim.smoke[beside] < before / 2, "the ceiling should drain towards the vent: {} -> {}", before, sim.smoke[beside]);
}

#[test]
fn a_walled_pocket_with_a_door_becomes_a_room_that_holds_the_heat() {
    // A long, two-tall sealed cave: hearth on the left, survivors beside it,
    // and a pocket on the right that one two-tall door closes off.
    let mut sim = sealed_room(5, 64, (4, 29, 44, 30));
    let hearth = sim.idx(24, 30);
    sim.buildings[hearth] = Building::Hearth;
    sim.hearth_fuel[hearth] = 40;
    sim.coal = 500;
    sim.stone = 500;
    for (c, x) in [(0, 22), (1, 26)] {
        sim.colonists[c].x = x;
        sim.colonists[c].y = 30;
    }
    // A door at (36, 30) fills (36, 29) too; a tile laid in mid-air beside the floor at (30, 29).
    sim.step(&[Command::Build { x: 36, y: 30, building: Building::Door }, Command::Build { x: 30, y: 29, building: Building::Tile }]);
    for _ in 0..1500 {
        sim.step(&[]);
    }
    assert_eq!(sim.elements[sim.idx(30, 29)], Element::Tile, "tiles get built, and need no floor");
    assert_eq!(sim.buildings[sim.idx(36, 30)], Building::Door, "the door gets built");
    // The pocket (37..=44, 29..=30) is 16 cells: a plain room. The 64-cell side is no room.
    let inside = sim.idx(40, 29);
    assert_eq!(sim.room_kind[inside], sim::ROOM_PLAIN, "the closed-off pocket is a room");
    assert_eq!(sim.room_kind[sim.idx(20, 29)], sim::ROOM_NONE, "the open cave is too big to be one");
    assert!(sim.smoke[inside] < 20, "the door keeps the smoke out: {}", sim.smoke[inside]);
    // Put a hearth in the pocket and it holds the heat right to the far wall.
    let second = sim.idx(38, 30);
    sim.buildings[second] = Building::Hearth;
    sim.hearth_fuel[second] = 40;
    for _ in 0..20 {
        sim.step(&[]);
    }
    assert_eq!(sim.room_kind[inside], sim::ROOM_HEARTH);
    assert!(sim.is_warm(sim.idx(44, 29)), "every cell of a hearth room is warm");
}

#[test]
fn nobody_is_caught_by_a_hunting_shade_at_dawn() {
    // Hands off apart from digs far from the fire, so work spills into the
    // dark each evening. Whatever Shades are still out at dawn must be
    // retreating, never hunting, and nobody may be lost to them.
    let mut sim = Sim::new(7, 160, 110);
    sim.coal = 200;
    let (cx, cy) = (sim.width as i32 / 2, sim.height as i32 / 2);
    let digs: Vec<_> = (-16..=16).step_by(4).map(|dx| Command::Dig { x: (cx + dx) as u32, y: (cy + 8) as u32 }).collect();
    sim.step(&digs);
    for _ in 0..4 * sim::DAY_TICKS {
        let dawn = sim.is_dawn();
        sim.step(&[]);
        if dawn {
            assert!(sim.shades.iter().all(|s| s.state == sim::SHADE_RETREATING), "a Shade hunting at tick {}", sim.tick);
        }
    }
    assert!(sim.colonists.iter().all(|c| c.alive()), "someone died with digs in the dark");
}

fn column_level_below(sim: &Sim, x: u32, y0: u32) -> i32 {
    let y = (y0..sim.height).find(|&y| sim.water[sim.idx(x, y)] > 0).expect("dry column");
    (y as i32 + 1) * 1000 - sim.water[sim.idx(x, y)]
}

/// Surface height of the water in column `x`, in thousandths of a cell down from the top.
fn column_level(sim: &Sim, x: u32) -> i32 {
    let y = (0..sim.height).find(|&y| sim.water[sim.idx(x, y)] > 0).expect("dry column");
    (y as i32 + 1) * 1000 - sim.water[sim.idx(x, y)]
}

#[test]
fn connected_columns_settle_to_one_level() {
    // A U-tube: a full left shaft, a channel along the bottom, an empty right shaft.
    let mut sim = sealed_room(4, 24, (0, 0, 0, 0));
    sim.colonists.clear();
    for y in 2..21 {
        for x in [3, 12] {
            let i = sim.idx(x, y);
            sim.elements[i] = Element::Floor;
        }
    }
    for x in 3..=12 {
        let i = sim.idx(x, 20);
        sim.elements[i] = Element::Floor;
    }
    for y in 2..20 {
        let i = sim.idx(3, y);
        sim.add_water(i, 1000);
    }
    let total = water_total(&sim);
    let mut rested = None;
    for t in 0..6000 {
        let before = sim.water.clone();
        sim.step(&[]);
        if before == sim.water {
            rested = Some(t);
            break;
        }
    }
    println!("u-tube rested after {rested:?} ticks: levels {} {}", column_level(&sim, 3), column_level(&sim, 12));
    assert!(rested.is_some(), "u-tube never came to rest");
    assert_eq!(water_total(&sim), total);
    assert!((column_level(&sim, 3) - column_level(&sim, 12)).abs() <= 40, "surfaces not level");
}

#[test]
fn seed_7_shaft_settles_level_with_its_lake() {
    let mut sim = Sim::new(7, 160, 110);
    sim.colonists.clear();
    let total = water_total(&sim);
    for _ in 0..6000 {
        sim.step(&[]);
    }
    assert_eq!(water_total(&sim), total);
    // Columns 9 to 12 are roofed over by rock; the rest are open to the same air.
    let levels: Vec<i32> = (1..=18).filter(|&x| !(9..=12).contains(&x)).filter(|&x| (80..110).any(|y| sim.water[sim.idx(x, y)] > 0)).map(|x| column_level_below(&sim, x, 80)).collect();
    println!("seed 7 shaft columns: {levels:?}");
    assert!(levels.windows(2).all(|p| (p[0] - p[1]).abs() <= 150), "shaft and lake not level: {levels:?}");
}
