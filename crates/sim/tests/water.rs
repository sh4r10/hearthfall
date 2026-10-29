//! Drinking water: the stock, buckets, thirst and the tanks.

use sim::{Building, Command, Element, Item, Sim, CAUSE_THIRST, DAY_TICKS, START_WATER, STAT_MAX, WATER_FULL};

/// Water cells hold, plus what dried up: the world's water apart from tanks and buckets.
fn pools_total(sim: &Sim) -> i64 {
    sim.water.iter().map(|&v| v as i64).sum::<i64>() + sim.water_lost
}

/// Water in the arms of survivors.
fn carried(sim: &Sim) -> i64 {
    sim.colonists.iter().filter_map(|c| c.carrying).filter(|&(i, _)| matches!(i, Item::Water | Item::StockWater)).map(|(_, n)| n as i64).sum()
}

/// The start cave with a sealed two-cell pool on its right behind a one-cell stone ledge, the barrel empty and a
/// cistern standing beside the hearth. Returns the sim and the pool cells.
fn basin() -> (Sim, [usize; 2]) {
    let mut sim = Sim::new(7, 128, 96);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    let tile = sim.idx(cx + 6, cy);
    sim.elements[tile] = Element::Tile;
    let pool = [sim.idx(cx + 7, cy), sim.idx(cx + 8, cy)];
    for &p in &pool {
        sim.elements[p] = Element::Water;
        sim.water[p] = WATER_FULL;
    }
    let barrel = sim.idx(cx - 4, cy);
    assert_eq!(sim.buildings[barrel], Building::WaterBarrel);
    sim.water_store[barrel] = 0;
    sim.water_stock = 0;
    let cistern = sim.idx(cx + 3, cy);
    sim.buildings[cistern] = Building::Cistern;
    (sim, pool)
}

#[test]
fn the_start_cave_has_a_barrel_with_three_days_of_water() {
    let sim = Sim::new(7, 160, 110);
    assert_eq!(sim.water_stock, START_WATER);
    assert_eq!(sim.water_stock, sim.water_capacity());
    assert!(sim.water_stock >= 3 * sim.water_per_day(), "the barrel should last three days for the first two");
    // The barrel is not for building, and is never taken down.
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    let mut sim = sim;
    sim.step(&[Command::Build { x: cx + 4, y: cy - 3, building: Building::WaterBarrel }, Command::Deconstruct { x: cx - 4, y: cy }]);
    assert_eq!(sim.jobs.len(), 0);
}

#[test]
fn bucket_hauling_conserves_water() {
    let (mut sim, pool) = basin();
    sim.tick = DAY_TICKS + 100; // errands begin on day 2
    for c in &mut sim.colonists {
        c.thirst = STAT_MAX; // nobody drinks during the run, so every unit taken from the pool is in a tank, a bucket or the spill
    }
    let before = pools_total(&sim);
    for _ in 0..800 {
        sim.step(&[]);
    }
    let taken = before - pools_total(&sim);
    assert!(sim.water_stock >= 100, "buckets should have reached the tanks, stock is {}", sim.water_stock);
    assert!(sim.water_stock <= sim.water_capacity());
    assert_eq!(taken, sim.water_stock as i64 + sim.water_spilled + carried(&sim), "pool loss != stock + spill + carried");
    let in_pool: i32 = pool.iter().map(|&p| sim.water[p]).sum();
    assert!(in_pool < 2 * WATER_FULL, "the pool really shrinks");
}

#[test]
fn a_thirsty_survivor_drinks_from_the_stock() {
    let mut sim = Sim::new(7, 160, 110);
    for c in &mut sim.colonists {
        c.thirst = 1_000;
    }
    for _ in 0..200 {
        sim.step(&[]);
    }
    assert!(sim.colonists.iter().all(|c| c.thirst > 5_000), "both should have had a drink: {:?}", sim.colonists.iter().map(|c| c.thirst).collect::<Vec<_>>());
    assert_eq!(sim.water_stock, START_WATER - 2 * sim::DRINK_UNITS);
}

#[test]
fn without_stock_a_survivor_drinks_at_the_pool_edge() {
    let (mut sim, pool) = basin();
    let before: i32 = pool.iter().map(|&p| sim.water[p]).sum();
    for c in &mut sim.colonists {
        c.thirst = 1_000;
    }
    for _ in 0..300 {
        sim.step(&[]);
    }
    let after: i32 = pool.iter().map(|&p| sim.water[p]).sum();
    assert!(sim.colonists.iter().all(|c| c.thirst > 5_000));
    assert_eq!(before - after, 2 * sim::DRINK_UNITS, "each drink takes 10 units from the pool");
}

#[test]
fn nobody_dies_of_thirst_before_day_four() {
    let mut sim = Sim::new(7, 160, 110);
    let barrel = sim.idx(sim.width / 2 - 4, sim.height / 2);
    sim.water_store[barrel] = 0;
    sim.water_stock = 0;
    for c in &mut sim.colonists {
        c.thirst = 0;
        c.parched = DAY_TICKS as u32 + 500;
    }
    sim.tick = 2 * DAY_TICKS + 400; // day 3, a full day dry already
    sim.step(&[]);
    assert!(sim.colonists.iter().all(|c| c.alive()), "no thirst deaths before day 4");
    sim.tick = 3 * DAY_TICKS + 400; // day 4
    sim.step(&[]);
    assert!(sim.colonists.iter().all(|c| !c.alive() && c.cause == CAUSE_THIRST), "a full day at zero on day 4 is fatal");
}

// --- The first water source, drip catchers and the hand pump -------------------------------

/// Whether an open cell is reachable from the hearth over open cells (diagonals ignored, gravity ignored).
fn connected_open(sim: &Sim, from: usize, to: usize) -> bool {
    let w = sim.width as usize;
    let mut seen = vec![false; sim.elements.len()];
    let mut stack = vec![from];
    seen[from] = true;
    while let Some(i) = stack.pop() {
        if i == to {
            return true;
        }
        let (x, y) = (i % w, i / w);
        for (nx, ny) in [(x.wrapping_sub(1), y), (x + 1, y), (x, y.wrapping_sub(1)), (x, y + 1)] {
            if nx < w && ny < sim.height as usize {
                let j = ny * w + nx;
                if !seen[j] && sim.elements[j] == Element::Floor {
                    seen[j] = true;
                    stack.push(j);
                }
            }
        }
    }
    false
}

#[test]
fn a_sealed_water_pocket_is_a_short_dig_from_the_start_cave() {
    for seed in [7, 1234, 99_999, 0, 1, 2, 3, 40, 41] {
        let mut sim = Sim::new(seed, 160, 110);
        let (cx, cy) = (sim.width / 2, sim.height / 2);
        let (pw, ph) = sim::water_pocket_size(seed);
        assert!((4..=6).contains(&pw) && (2..=3).contains(&ph));
        let pocket: Vec<usize> = (0..sim.elements.len()).filter(|&i| sim.elements[i] == Element::Water && sim.water[i] == WATER_FULL && (6..=11).contains(&(i as u32 % sim.width).wrapping_sub(cx)) && (5..=7).contains(&(i as u32 / sim.width).wrapping_sub(cy))).collect();
        assert_eq!(pocket.len() as i32, pw * ph, "seed {seed}: a full pocket of {pw}x{ph} near the start");
        // Sealed: no open air cell touches it.
        for &p in &pocket {
            let (x, y) = (p as u32 % sim.width, p as u32 / sim.width);
            for (nx, ny) in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)] {
                assert_ne!(sim.elements[sim.idx(nx, ny)], Element::Floor, "seed {seed}: pocket not sealed at {nx},{ny}");
            }
        }
        // Dig a shaft from the floor down to it: dirt and ore only, 4 cells.
        let shaft_x = cx + 7;
        for y in cy + 1..=cy + 4 {
            let i = sim.idx(shaft_x, y);
            assert!(sim.elements[i].is_diggable(), "seed {seed}: shaft cell {y} should be solid ground, is {:?}", sim.elements[i]);
            sim.elements[i] = Element::Floor;
        }
        let top = sim.idx(shaft_x, cy + 5);
        assert_eq!(sim.elements[top], Element::Water, "seed {seed}: the shaft ends on the pocket");
        assert!(connected_open(&sim, sim.idx(cx, cy), sim.idx(shaft_x, cy + 4)), "seed {seed}: the shaft joins the cave");
        // Opening it must not lift water towards the start floor.
        for _ in 0..600 {
            sim.step(&[]);
        }
        for y in cy - 5..=cy {
            for x in cx - 8..=cx + 8 {
                assert_ne!(sim.elements[sim.idx(x, y)], Element::Water, "seed {seed}: the start room flooded at {x},{y}");
            }
        }
        assert!(sim.water[top] > 0 || sim.elements[sim.idx(shaft_x, cy + 6)] == Element::Water, "seed {seed}: the pool is still there");
    }
}

/// A start cave with a catcher at `x`, rock over it and, if `wet`, a sealed pool in the rock two rows above it.
fn catcher_under_rock(wet: bool) -> (Sim, usize, usize) {
    let mut sim = Sim::new(7, 128, 96);
    sim.colonists.clear();
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    // Rock over the room's roof near the right wall: the catcher stands under a one-cell ceiling.
    let catcher = sim.idx(cx + 5, cy);
    sim.buildings[catcher] = Building::DripCatcher;
    let ceiling = sim.idx(cx + 5, cy - 1);
    sim.elements[ceiling] = Element::Rock;
    for dx in 4..=6 {
        for dy in 2..=3 {
            let i = sim.idx(cx + dx, cy - dy);
            sim.elements[i] = Element::Rock;
        }
    }
    if wet {
        let pool = sim.idx(cx + 5, cy - 2);
        sim.elements[pool] = Element::Water;
        sim.water[pool] = WATER_FULL;
    }
    let barrel = sim.idx(cx - 4, cy);
    sim.water_store[barrel] = 0;
    sim.water_stock = 0;
    (sim, catcher, barrel)
}

#[test]
fn a_drip_catcher_under_wet_rock_makes_water_and_a_dry_one_does_not() {
    let (mut wet, catcher, _) = catcher_under_rock(true);
    assert_eq!(wet.drip_state(catcher), sim::DRIP_WET);
    let (mut dry, dry_catcher, _) = catcher_under_rock(false);
    assert_eq!(dry.drip_state(dry_catcher), sim::DRIP_DRY);
    for _ in 0..sim::DRIP_TICKS * 3 {
        wet.step(&[]);
        dry.step(&[]);
    }
    assert_eq!(wet.water_stock, 3, "one unit every {} ticks", sim::DRIP_TICKS);
    assert_eq!(dry.water_stock, 0);
    assert!(wet.events.iter().any(|e| e.kind == sim::EVENT_DRIPPED));
    assert_eq!(wet.water[wet.idx(wet.width / 2 + 5, wet.height / 2 - 2)], WATER_FULL, "wet rock is endless: the pool is untouched");
}

#[test]
fn a_catcher_holds_ten_when_the_tanks_are_full() {
    let (mut sim, catcher, barrel) = catcher_under_rock(true);
    sim.water_store[barrel] = sim::BARREL_CAPACITY;
    sim.water_stock = sim::BARREL_CAPACITY;
    for _ in 0..sim::DRIP_TICKS * 14 {
        sim.step(&[]);
    }
    assert_eq!(sim.water_stock, sim::BARREL_CAPACITY);
    assert_eq!(sim.drip_held[catcher], sim::DRIP_HOLD);
    // Room appears: the catcher passes its water on.
    sim.water_store[barrel] -= 30;
    sim.water_stock -= 30;
    for _ in 0..40 {
        sim.step(&[]);
    }
    assert_eq!(sim.drip_held[catcher], 0);
    assert_eq!(sim.water_stock, sim::BARREL_CAPACITY - 30 + sim::DRIP_HOLD);
}

#[test]
fn a_hand_pump_moves_water_from_the_pool_to_the_stock_without_loss() {
    let mut sim = Sim::new(7, 128, 96);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    // A 3 x 2 pool sunk into the floor to the right of the cave, with a cistern and a pump on its bank.
    for dx in 7..=9 {
        for dy in 1..=2 {
            let i = sim.idx(cx + dx, cy + dy);
            sim.elements[i] = Element::Water;
            sim.water[i] = WATER_FULL;
        }
    }
    let barrel = sim.idx(cx - 4, cy);
    sim.water_store[barrel] = 0;
    sim.water_stock = 0;
    let cistern = sim.idx(cx + 3, cy);
    sim.buildings[cistern] = Building::Cistern;
    let pump = sim.idx(cx + 6, cy);
    assert!(sim.pump_site_ok(cx + 6, cy));
    assert!(!sim.pump_site_ok(cx + 1, cy), "a pump away from the pool is refused");
    sim.buildings[pump] = Building::HandPump;
    assert_eq!(sim.pump_state(pump), sim::PUMP_READY);
    for c in &mut sim.colonists {
        c.thirst = STAT_MAX;
    }
    let before = pools_total(&sim);
    for _ in 0..500 {
        for c in &mut sim.colonists {
            c.thirst = STAT_MAX;
        }
        sim.step(&[]);
    }
    assert_eq!(sim.water_store[cistern], sim::CISTERN_CAPACITY, "one stint fills a cistern ({} units)", sim::CISTERN_CAPACITY);
    assert_eq!(before - pools_total(&sim), sim.water_stock as i64 + sim.water_spilled + carried(&sim), "pool loss != stock gain");
    assert_eq!(sim.pump_state(pump), sim::PUMP_TANKS_FULL);
    // Drink the cistern down: the pump runs again and tops it up from the pool.
    sim.water_store[cistern] -= 50;
    sim.water_stock -= 50;
    let (before, stock_before) = (pools_total(&sim), sim.water_stock as i64);
    for _ in 0..300 {
        for c in &mut sim.colonists {
            c.thirst = STAT_MAX;
        }
        sim.step(&[]);
    }
    assert_eq!(sim.water_store[cistern], sim::CISTERN_CAPACITY);
    assert_eq!(before - pools_total(&sim), sim.water_stock as i64 - stock_before + sim.water_spilled);
    assert!(sim.events.iter().any(|e| e.kind == sim::EVENT_PUMPED));
}
