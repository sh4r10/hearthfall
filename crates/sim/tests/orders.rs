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
        sim.jobs.iter().find(|j| j.claimed_by.is_some()).map(|j| (j.x, j.y))
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
