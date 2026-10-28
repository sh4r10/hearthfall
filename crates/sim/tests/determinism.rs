use sim::{Building, Command, Sim};

fn script(tick: u64, sim: &Sim) -> Vec<Command> {
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    match tick {
        5 => vec![Command::Build { x: cx + 3, y: cy, building: Building::OxygenDiffuser }],
        10..=30 => vec![Command::Dig { x: cx + 8 + (tick as u32 - 10), y: cy }],
        _ => vec![],
    }
}

fn run(seed: u64, ticks: u64) -> u64 {
    let mut sim = Sim::new(seed, 128, 128);
    for t in 0..ticks {
        let cmds = script(t, &sim);
        sim.step(&cmds);
    }
    sim.state_hash()
}

#[test]
fn same_seed_and_commands_give_same_hash() {
    assert_eq!(run(42, 300), run(42, 300));
}

#[test]
fn different_seeds_diverge() {
    assert_ne!(run(1, 50), run(2, 50));
}

#[test]
fn gas_diffusion_conserves_mass() {
    let mut sim = Sim::new(7, 96, 96);
    // Breathing and fire turn O2 into CO2, so check the total gas mass.
    let total = |s: &Sim| s.oxygen.iter().chain(&s.co2).map(|&v| v as i64).sum::<i64>();
    let before = total(&sim);
    for _ in 0..200 {
        sim.step(&[]);
    }
    assert_eq!(before, total(&sim));
    assert!(sim.oxygen.iter().all(|&v| v >= 0));
}

#[test]
fn colonists_suffocate_without_oxygen() {
    let mut sim = Sim::new(3, 64, 64);
    sim.oxygen.iter_mut().for_each(|v| *v = 0);
    for _ in 0..200 {
        sim.step(&[]);
    }
    assert_eq!(sim.alive_colonists(), 0);
}

#[test]
fn carbon_dioxide_sinks() {
    // A sealed 1-wide shaft: CO2 released at the top should end up at the bottom.
    let mut sim = Sim::new(9, 32, 32);
    sim.colonists.clear();
    for y in 0..32 {
        for x in 0..32 {
            let i = sim.idx(x, y);
            sim.elements[i] = if x == 16 && (4..20).contains(&y) { sim::Element::Floor } else { sim::Element::Rock };
            sim.oxygen[i] = if sim.elements[i].is_open() { 1000 } else { 0 };
            sim.co2[i] = 0;
        }
    }
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
    let mut sim = Sim::new(4, 16, 16);
    sim.colonists.clear();
    for i in 0..sim.elements.len() {
        sim.elements[i] = sim::Element::Floor;
    }
    let i = sim.idx(8, 2);
    sim.elements[i] = sim::Element::Water;
    for _ in 0..30 {
        sim.step(&[]);
    }
    let water: Vec<u32> = (0..256).filter(|&i| sim.elements[i] == sim::Element::Water).map(|i| i as u32 / 16).collect();
    assert_eq!(water, vec![15]);
}

#[test]
fn colonists_stand_on_the_floor() {
    let mut sim = Sim::new(5, 64, 64);
    for _ in 0..100 {
        sim.step(&[]);
    }
    let (cy, floor) = (sim.height / 2, sim.height / 2 + 1);
    for c in &sim.colonists {
        assert!(c.y <= cy, "colonist fell to row {} below floor row {}", c.y, floor);
    }
}

#[test]
fn hearth_lights_the_start_room_and_burns_fuel() {
    let mut sim = Sim::new(6, 64, 64);
    let centre = sim.idx(32, 32);
    assert!(sim.light[centre] > 200);
    let fuel = sim.fuel;
    for _ in 0..200 {
        sim.step(&[]);
    }
    assert_eq!(sim.fuel, fuel - 10);
    assert_eq!(sim.alive_colonists(), 3);
}

#[test]
fn colonists_freeze_when_the_fuel_runs_out() {
    let mut sim = Sim::new(6, 64, 64);
    sim.fuel = 0;
    for _ in 0..300 {
        sim.step(&[]);
    }
    assert!(sim.light.iter().all(|&l| l == 0));
    assert_eq!(sim.alive_colonists(), 0);
}

#[test]
fn digging_coal_adds_fuel() {
    let mut sim = Sim::new(6, 64, 64);
    let i = sim.idx(10, 10);
    sim.elements[i] = sim::Element::Coal;
    let fuel = sim.fuel;
    sim.step(&[Command::Dig { x: 10, y: 10 }]);
    assert_eq!(sim.fuel, fuel + sim::COAL_FUEL - 1); // tick 0 also burns one unit
}
