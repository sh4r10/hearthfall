use sim::{Building, Command, Sim, BLOCK_NONE, BLOCK_NO_COAL, BLOCK_UNREACHABLE};

#[test]
fn higher_priority_orders_go_first() {
    let mut sim = Sim::new(7, 128, 96);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    // Two wall digs, the far one marked urgent.
    let near = (cx - 9, cy - 1);
    let far = (cx + 9, cy - 1);
    sim.step(&[Command::Dig { x: near.0, y: near.1 }, Command::Dig { x: far.0, y: far.1 }, Command::SetPriority { x: far.0, y: far.1, priority: 9 }]);
    let first_claimed = (0..200).find_map(|_| {
        sim.step(&[]);
        sim.jobs.iter().find(|j| j.claimed_by.is_some() && j.kind == sim::JobKind::Dig).map(|j| (j.x, j.y))
    });
    assert_eq!(first_claimed, Some(far));
}

#[test]
fn stuck_orders_say_why() {
    let mut sim = Sim::new(7, 128, 96);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    sim.coal = 0;
    sim.apply_commands(&[Command::Dig { x: cx, y: sim.height - 3 }, Command::Build { x: cx - 4, y: cy, building: Building::Lamp }]);
    let blockers = sim.job_blockers();
    assert_eq!(blockers, vec![BLOCK_UNREACHABLE, BLOCK_NO_COAL]);
    sim.coal = 10;
    assert_eq!(sim.job_blockers()[1], BLOCK_NONE);
}

#[test]
fn hauling_the_start_seams_keeps_a_colony_alive_for_three_days() {
    // A player who only marks the coal seams in the start cave's walls: the
    // coal has to be hauled in now, and that must not starve the fire early.
    for seed in [7, 1234, 99_999] {
        let mut sim = Sim::new(seed, 160, 110);
        let (cx, cy) = (sim.width as i32 / 2, sim.height as i32 / 2);
        let mut digs = Vec::new();
        for (x0, y0, x1, y1) in [(-10, -3, -9, -1), (9, -3, 10, -1)] {
            for y in y0..=y1 {
                for x in x0..=x1 {
                    digs.push(Command::Dig { x: (cx + x) as u32, y: (cy + y) as u32 });
                }
            }
        }
        sim.step(&digs);
        for _ in 0..3 * sim::DAY_TICKS {
            sim.step(&[]);
        }
        assert!(sim.colonists.iter().all(|c| c.alive()), "seed {seed}: someone died within three days");
        assert!(sim.coal > 0 || sim.pile_amount.iter().sum::<i32>() == 0, "seed {seed}: coal left lying about while the stock ran dry");
    }
}

#[test]
fn nobody_takes_an_errand_in_the_dark_after_dusk() {
    // A sealed, unlit cave: the same dig is taken by day and left for dawn
    // once the curfew starts.
    for (start, expect_claimed) in [(100, true), (sim::NIGHT_AT + 10, false)] {
        let mut sim = Sim::new(7, 128, 96);
        let (cx, cy) = (sim.width / 2, sim.height / 2);
        for i in 0..sim.light.len() {
            sim.buildings[i] = Building::None;
        }
        sim.tick = start;
        sim.step(&[Command::Dig { x: cx - 9, y: cy - 1 }]);
        let mut claimed = false;
        for _ in 0..100 {
            for c in sim.colonists.iter_mut() {
                c.warmth = sim::STAT_MAX;
            }
            sim.step(&[]);
            claimed |= sim.jobs.iter().any(|j| j.claimed_by.is_some());
        }
        assert_eq!(claimed, expect_claimed, "start tick {start}");
    }
}
