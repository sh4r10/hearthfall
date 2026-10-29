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
