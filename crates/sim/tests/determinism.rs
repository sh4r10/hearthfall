use sim::{Activity, Building, Command, Element, JobKind, Sim};

fn script(tick: u64, sim: &Sim) -> Vec<Command> {
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    match tick {
        5 => vec![Command::Build { x: cx + 4, y: cy, building: Building::OxygenDiffuser }],
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
            sim.oxygen[i] = if open { 1800 } else { 0 };
            sim.co2[i] = 0;
            sim.buildings[i] = Building::None;
        }
    }
    sim
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
fn gas_is_never_created() {
    let mut sim = Sim::new(7, 96, 96);
    // Breathing and fire turn O2 into CO2 and the walls soak a little CO2 up,
    // so the total gas mass can only fall, and never below zero.
    let total = |s: &Sim| s.oxygen.iter().chain(&s.co2).map(|&v| v as i64).sum::<i64>();
    let before = total(&sim);
    for _ in 0..200 {
        sim.step(&[]);
    }
    assert!(total(&sim) <= before);
    assert!(sim.oxygen.iter().chain(&sim.co2).all(|&v| v >= 0));
}

#[test]
fn colonists_suffocate_without_oxygen() {
    let mut sim = Sim::new(3, 64, 64);
    for _ in 0..400 {
        sim.oxygen.iter_mut().for_each(|v| *v = 0);
        sim.step(&[]);
    }
    assert_eq!(sim.alive_colonists(), 0);
}

#[test]
fn carbon_dioxide_sinks() {
    let mut sim = sealed_room(9, 32, (16, 4, 16, 19));
    sim.colonists.clear();
    let top = sim.idx(16, 4);
    sim.co2[top] = 4000;
    for _ in 0..2000 {
        sim.step(&[]);
    }
    let bottom = sim.idx(16, 19);
    assert!(sim.co2[bottom] > sim.co2[top] * 3, "bottom {} top {}", sim.co2[bottom], sim.co2[top]);
}

#[test]
fn water_falls() {
    let mut sim = sealed_room(4, 16, (0, 0, 15, 15));
    sim.colonists.clear();
    let i = sim.idx(8, 2);
    sim.elements[i] = Element::Water;
    for _ in 0..30 {
        sim.step(&[]);
    }
    let rows: Vec<usize> = (0..256).filter(|&i| sim.elements[i] == Element::Water).map(|i| i / 16).collect();
    assert_eq!(rows, vec![15]);
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
        let expected = if i == centre { Building::Hearth } else { Building::Cairn };
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
    let coal = sim.coal;
    sim.step(&[Command::Dig { x: 31, y: 20 }]);
    assert_eq!(sim.jobs.len(), 1);
    for _ in 0..600 {
        sim.step(&[]);
    }
    assert_eq!(sim.elements[target], Element::Floor, "jobs left: {:?}", sim.jobs);
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
    sim.step(&[Command::Build { x: 19, y: 7, building: Building::OxygenDiffuser }]);
    for _ in 0..800 {
        sim.step(&[]);
    }
    assert_eq!(sim.buildings[sim.idx(19, 7)], Building::OxygenDiffuser, "jobs: {:?}", sim.jobs);
}

#[test]
fn firekeepers_refuel_hearths_from_the_stockpile() {
    let mut sim = Sim::new(6, 64, 64);
    let centre = sim.idx(32, 32);
    sim.hearth_fuel[centre] = 5;
    sim.coal = 30;
    for _ in 0..12 {
        sim.step(&[]);
    }
    // The firekeeper (Mara, colonist 1) takes it, even though the digger is as close.
    let refuel = sim.jobs.iter().find(|j| j.kind == JobKind::Refuel).expect("refuel job");
    assert_eq!(refuel.claimed_by, Some(1));
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
            sim.elements[i] = Element::Water;
        }
    }
    for _ in 0..200 {
        sim.step(&[]);
    }
    // 48 cells over a 16 wide floor: exactly the bottom three rows.
    let water: Vec<usize> = (0..256).filter(|&i| sim.elements[i] == Element::Water).collect();
    assert_eq!(water.len(), 48);
    assert!(water.iter().all(|&i| i / 16 >= 13), "pool is not level");
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
        // The tick being simulated, before step moves the clock on.
        let (night, day) = (sim.is_night(), sim.day());
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
    // Dawn sends them away.
    while sim.is_night() {
        sim.step(&[]);
    }
    sim.step(&[]);
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
    // Digging out a building's floor takes the building down first, and the
    // dig waits until it is.
    let lamp = sim.idx(12, 20);
    sim.buildings[lamp] = Building::Lamp;
    sim.step(&[Command::Dig { x: 12, y: 21 }]);
    assert!(sim.jobs.iter().any(|j| j.kind == JobKind::Deconstruct && (j.x, j.y) == (12, 20)));
    let dig = sim.jobs.iter().find(|j| j.kind == JobKind::Dig).unwrap().clone();
    assert!(sim.holds_up_building(dig.x, dig.y));
    // A wide building rests on the cells beside its own too: digging under the
    // edge of a hearth takes the hearth down, and a cairn's floor stays put.
    let hearth = sim.idx(16, 20);
    sim.buildings[hearth] = Building::Hearth;
    sim.step(&[Command::Dig { x: 17, y: 21 }]);
    assert!(sim.jobs.iter().any(|j| j.kind == JobKind::Deconstruct && (j.x, j.y) == (16, 20)));
    let cairn = sim.idx(8, 20);
    sim.buildings[cairn] = Building::Cairn;
    sim.step(&[Command::Dig { x: 8, y: 21 }]);
    assert!(!sim.jobs.iter().any(|j| (j.x, j.y) == (8, 21)));
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
    let mut sim = sealed_room(4, 64, (10, 30, 54, 30));
    let centre = sim.idx(32, 30);
    sim.buildings[centre] = Building::Hearth;
    sim.hearth_fuel[centre] = 40;
    sim.colonists.truncate(1);
    sim.colonists[0].x = 33;
    sim.colonists[0].y = 30;
    sim.colonists[0].role = sim::Role::Digger;
    // A dig far out in the dark, past the firelight. Once they are at work
    // there, the cold gets to them.
    sim.step(&[Command::Dig { x: 55, y: 30 }]);
    let mut turned_back = false;
    for _ in 0..600 {
        sim.step(&[]);
        if sim.colonists[0].activity == Activity::Working {
            sim.colonists[0].warmth = sim.colonists[0].warmth.min(sim::STAT_MAX * 3 / 10);
        }
        let c = &sim.colonists[0];
        if c.job.is_none() && c.heading == sim::HEADING_WARM {
            turned_back = true;
        }
    }
    let c = &sim.colonists[0];
    assert!(turned_back, "never headed back to the fire");
    assert!(c.alive(), "froze on the job");
    assert!(sim.is_warm(sim.idx(c.x, c.y)), "ended up at ({}, {}), not by the fire", c.x, c.y);
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
fn the_set_maps_let_a_colony_through_two_nights_untouched() {
    // The seeds behind the title screen's set maps (apps/client/src/main.ts).
    for seed in [7, 1234, 99_999] {
        let mut sim = Sim::new(seed, 160, 110);
        for _ in 0..2 * sim::DAY_TICKS {
            sim.step(&[]);
        }
        assert!(sim.colonists.iter().all(|c| c.alive()), "seed {seed}: someone died within two days with no orders given");
    }
}

#[test]
fn survivors_step_out_of_stale_air_and_a_shaft_clears() {
    // A deep shaft under a sealed room, its bottom full of carbon dioxide.
    let mut sim = sealed_room(5, 64, (20, 20, 44, 20));
    let hearth = sim.idx(33, 20); // beside the shaft, so its light reaches the bottom and nobody flees the dark instead
    sim.buildings[hearth] = Building::Hearth;
    sim.hearth_fuel[hearth] = 40;
    for y in 21..=30 {
        let i = sim.idx(32, y);
        sim.elements[i] = Element::Floor;
        sim.buildings[i] = Building::Ladder;
        sim.oxygen[i] = 0;
        sim.co2[i] = 1800;
    }
    sim.colonists.truncate(1);
    sim.colonists[0].x = 32;
    sim.colonists[0].y = 30;
    let mut left_for_air = false;
    for _ in 0..1500 {
        sim.step(&[]);
        if sim.colonists[0].heading == sim::HEADING_AIR {
            left_for_air = true;
        }
    }
    assert!(left_for_air, "never went looking for air");
    assert!(sim.colonists[0].alive(), "died in the shaft of cause {}", sim.colonists[0].cause);
    let bottom = sim.idx(32, 30);
    assert!(sim.co2[bottom] < 900, "the shaft still holds {} mg of CO2", sim.co2[bottom]);
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
fn refugees_join_at_dawn_when_a_bed_and_food_are_spare() {
    let mut sim = Sim::new(42, 160, 110);
    assert_eq!(sim.colonists.len(), 2, "the colony starts with Esk and Mara");
    let bed = sim.idx(84, 55);
    sim.buildings[bed] = Building::Bed;
    sim.food = 40;
    for _ in 0..2 * sim::DAY_TICKS + 1 {
        sim.step(&[]);
    }
    assert_eq!(sim.colonists.len(), 3, "nobody arrived at dawn of day 3");
    assert!(sim.events.iter().any(|e| e.kind == sim::EVENT_ARRIVAL && e.colonist == 2));
    let c = &sim.colonists[2];
    assert!(sim.is_warm(sim.idx(c.x, c.y)), "the refugee appeared in the dark");
}
