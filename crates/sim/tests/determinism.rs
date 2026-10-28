use sim::{Building, Command, Sim};

fn script(tick: u64, sim: &Sim) -> Vec<Command> {
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    match tick {
        5 => vec![Command::Build { x: cx, y: cy - 2, building: Building::OxygenDiffuser }],
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
    sim.colonists.clear(); // breathing converts O2 to CO2 but conserves total; keep the test simple
    let total = |s: &Sim| s.oxygen.iter().map(|&v| v as i64).sum::<i64>();
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
