use sim::{Building, Command, Sim, Tech, COAL_RESERVE, HEARTH_CAPACITY};

fn start() -> (Sim, u32, u32) {
    let sim = Sim::new(7, 160, 110);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    (sim, cx, cy)
}

#[test]
fn a_bench_studies_the_picked_tech_and_unlocks_its_building() {
    let (mut sim, cx, cy) = start();
    // Locked until Coking is known.
    sim.apply_commands(&[Command::Build { x: cx + 4, y: cy, building: Building::CokeOven }]);
    assert!(sim.jobs.is_empty());
    let bench = sim.idx(cx + 5, cy);
    sim.buildings[bench] = Building::ResearchBench;
    // Smelting first needs nothing; the grate needs smelting.
    sim.apply_commands(&[Command::Research { tech: Some(Tech::HearthGrate) }]);
    assert_eq!(sim.researching, None);
    sim.apply_commands(&[Command::Research { tech: Some(Tech::Coking) }]);
    assert_eq!(sim.researching, Some(Tech::Coking));
    let learnt = (0..3 * 1200).find(|_| {
        sim.step(&[]);
        sim.knows(Tech::Coking)
    });
    assert!(learnt.is_some(), "Coking was never learnt");
    assert_eq!(sim.researching, None);
    sim.apply_commands(&[Command::Build { x: cx - 3, y: cy, building: Building::CokeOven }]);
    assert_eq!(sim.jobs.iter().filter(|j| j.kind == sim::JobKind::Build(Building::CokeOven)).count(), 1);
}

#[test]
fn a_coke_oven_keeps_coal_for_the_fires_and_hearths_burn_coke_first() {
    let (mut sim, cx, cy) = start();
    sim.known = 1 << Tech::Coking as u32;
    let oven = sim.idx(cx + 5, cy);
    sim.buildings[oven] = Building::CokeOven;
    sim.coal = COAL_RESERVE + 12;
    for _ in 0..1200 {
        let before = (sim.coal, sim.coke);
        sim.step(&[]);
        // Coke is only ever made from coal above the reserve.
        if sim.coke > before.1 {
            assert!(before.0 >= COAL_RESERVE + sim::COKE_COAL, "the oven ate the fire's coal");
        }
    }
    let start = (cy * sim.width + cx) as usize;
    assert!(sim.coke > 0 || sim.hearth_clean[start] > 0, "no coke was made or burnt");
}

#[test]
fn a_grate_burns_slower_and_smokes_less() {
    let run = |grate: bool| {
        let (mut sim, cx, cy) = start();
        let i = sim.idx(cx, cy);
        sim.hearth_grate[i] = grate;
        sim.coal = 0; // no refuelling, so the fire only burns what it holds
        for _ in 0..600 {
            sim.step(&[]);
        }
        (HEARTH_CAPACITY - sim.hearth_fuel[i], sim.smoke.iter().sum::<i32>())
    };
    let (burnt, smoke) = run(false);
    let (burnt_grate, smoke_grate) = run(true);
    assert!(burnt_grate < burnt, "grate burnt {burnt_grate}, plain {burnt}");
    assert!(smoke_grate * 10 < smoke * 6, "grate smoke {smoke_grate}, plain {smoke}");
}

#[test]
fn a_grate_is_fitted_for_iron() {
    let (mut sim, cx, cy) = start();
    sim.known = 1 << Tech::HearthGrate as u32;
    sim.iron = 3;
    sim.step(&[Command::Upgrade { x: cx, y: cy }]);
    let fitted = (0..1200).find(|_| {
        sim.step(&[]);
        sim.hearth_grate[sim.idx(cx, cy)]
    });
    assert!(fitted.is_some());
    assert_eq!(sim.iron, 0);
}
