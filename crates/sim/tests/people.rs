use sim::{Activity, Building, Command, Element, JobKind, Sim};

#[test]
fn two_runs_roll_different_esks() {
    let rolls: Vec<_> = (0..12).map(|seed| {
        let esk = &Sim::new(seed, 64, 64).colonists[0];
        assert_eq!(esk.who, 0, "Esk is always the first survivor");
        assert_eq!(esk.knack as usize, sim::SKILL_DIG);
        assert_eq!(esk.traits.count_ones(), 2, "one good and one bad trait");
        (esk.traits, esk.temper.cold_at, esk.temper.eagerness)
    }).collect();
    assert!(rolls.iter().any(|r| *r != rolls[0]), "every seed rolled the same Esk");
    let a = Sim::new(5, 64, 64);
    let b = Sim::new(5, 64, 64);
    assert_eq!(a.colonists[0].traits, b.colonists[0].traits, "the same seed must roll the same Esk");
}

#[test]
fn skills_grow_with_use() {
    let mut sim = Sim::new(3, 64, 64);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    for c in sim.colonists.iter_mut() {
        c.energy = sim::STAT_MAX;
        c.fullness = sim::STAT_MAX;
    }
    let before = sim.colonists[0].xp[sim::SKILL_DIG] + sim.colonists[1].xp[sim::SKILL_DIG];
    for x in 0..6 {
        let i = sim.idx(cx - 1 - x, cy);
        sim.elements[i] = Element::Floor;
        let i = sim.idx(cx - 1 - x, cy - 1);
        sim.elements[i] = Element::Rock;
    }
    let cmds: Vec<_> = (0..6).map(|x| Command::Dig { x: cx - 1 - x, y: cy - 1 }).collect();
    sim.step(&cmds);
    for _ in 0..600 {
        sim.step(&[]);
    }
    let after = sim.colonists[0].xp[sim::SKILL_DIG] + sim.colonists[1].xp[sim::SKILL_DIG];
    assert!(after > before + 100, "digging should train digging: {before} -> {after}");
    assert_eq!(sim::level(sim::xp_for(3)), 3);
}

#[test]
fn an_errand_switched_off_is_left_alone() {
    let mut sim = Sim::new(3, 64, 64);
    let (cx, cy) = (sim.width / 2, sim.height / 2);
    let cmds = [
        Command::SetPref { colonist: 0, skill: sim::SKILL_BUILD as u8, pref: sim::PREF_OFF },
        Command::SetPref { colonist: 1, skill: sim::SKILL_BUILD as u8, pref: sim::PREF_OFF },
        Command::Build { x: cx + 5, y: cy, building: Building::Lamp },
    ];
    sim.step(&cmds);
    for _ in 0..300 {
        sim.step(&[]);
    }
    let lamp = sim.jobs.iter().find(|j| j.kind == JobKind::Build(Building::Lamp)).expect("the lamp order went");
    assert!(lamp.claimed_by.is_none(), "nobody should take an errand they were told to leave");
}

#[test]
fn firekeepers_roast_mushrooms_and_roast_meals_lift_morale() {
    let mut sim = Sim::new(4, 64, 64);
    sim.coal = 40;
    sim.food = 10;
    for c in sim.colonists.iter_mut() {
        c.energy = sim::STAT_MAX;
        c.fullness = sim::STAT_MAX;
    }
    for _ in 0..400 {
        sim.step(&[]);
    }
    assert!(sim.meals > 0, "nobody cooked: food {} coal {}", sim.food, sim.coal);
    sim.colonists[0].fullness = 100;
    sim.step(&[]);
    assert_eq!(sim.colonists[0].activity, Activity::Eating);
    assert_eq!(sim.colonists[0].last_meal, sim::MEAL_ROAST);
    assert_eq!(sim.morale_parts(0)[sim::MORALE_FOOD], 2);
}

#[test]
fn a_new_colony_keeps_its_spirits_up_through_the_first_days() {
    // Expectations start low, so an ordinary first two days never leave
    // anyone miserable, whatever traits they rolled.
    for seed in 0..6 {
        let mut sim = Sim::new(seed, 160, 110);
        for _ in 0..2 * sim::DAY_TICKS {
            sim.step(&[]);
        }
        for c in &sim.colonists {
            assert!(!c.alive() || c.mood > sim::MISERABLE, "seed {seed}: someone fell into misery in two days (mood {})", c.mood);
        }
    }
}
