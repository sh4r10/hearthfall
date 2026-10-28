//! Plays the set maps with a random player and reports anything that would
//! look wrong on screen: survivors floating or inside rock, buildings in walls
//! or over thin air, sleepers on top of each other.
//!
//! `cargo run --release -p sim --example soak [days]`
use sim::{reach, Activity, Building, Command, Rng, Sim};

const MAPS: [(&str, u64); 3] = [("Hearth Hollow", 7), ("The Long Gallery", 1234), ("Frostbite", 99_999)];
const BUILDS: [Building; 6] = [Building::Ladder, Building::Hearth, Building::MushroomBed, Building::OxygenDiffuser, Building::Lamp, Building::Bed];

fn main() {
    let days: u64 = std::env::args().nth(1).and_then(|d| d.parse().ok()).unwrap_or(3);
    let mut failed = false;
    for (name, seed) in MAPS {
        for run in 0..3 {
            let problems = soak(seed, run, days);
            println!("{name} run {run}: {}", if problems.is_empty() { "clean".to_string() } else { format!("{} problems", problems.len()) });
            for p in problems.iter().take(8) {
                println!("  {p}");
            }
            failed |= !problems.is_empty();
        }
    }
    if failed {
        std::process::exit(1);
    }
}

fn open(sim: &Sim, x: i32, y: i32) -> bool {
    x >= 0 && y >= 0 && x < sim.width as i32 && y < sim.height as i32 && sim.elements[(y as u32 * sim.width + x as u32) as usize].is_open()
}

fn soak(seed: u64, run: u64, days: u64) -> Vec<String> {
    let mut sim = Sim::new(seed, 160, 110);
    let mut rng = Rng::new(seed ^ (run + 1) * 0x9e37_79b9);
    let mut problems = Vec::new();
    let mut hanging = vec![0u32; sim.colonists.len()];
    let mut last_y: Vec<u32> = sim.colonists.iter().map(|c| c.y).collect();
    let w = sim.width as i32;
    for _ in 0..days * sim::DAY_TICKS {
        let mut commands = Vec::new();
        if sim.tick % 40 == 0 {
            // Act near a random living survivor, like a player would.
            let alive: Vec<_> = sim.colonists.iter().filter(|c| c.alive()).collect();
            if !alive.is_empty() {
                let c = alive[rng.below(alive.len() as u32) as usize];
                for _ in 0..6 {
                    let x = (c.x as i32 + rng.below(21) as i32 - 10).clamp(0, w - 1);
                    let y = (c.y as i32 + rng.below(13) as i32 - 6).clamp(0, sim.height as i32 - 1);
                    let (x, y) = (x as u32, y as u32);
                    if rng.below(3) == 0 {
                        let building = BUILDS[rng.below(BUILDS.len() as u32) as usize];
                        commands.push(Command::Build { x, y, building });
                    } else {
                        commands.push(Command::Dig { x, y });
                    }
                }
            }
        }
        sim.step(&commands);
        let t = sim.tick;
        // Refugees join over time.
        hanging.resize(sim.colonists.len(), 0);
        last_y.extend(sim.colonists[last_y.len()..].iter().map(|c| c.y));

        for (c, col) in sim.colonists.iter().enumerate() {
            let (x, y) = (col.x as i32, col.y as i32);
            if !open(&sim, x, y) {
                problems.push(format!("tick {t}: survivor {c} inside rock at {x},{y}"));
            }
            let ladder = |x: i32, y: i32| open(&sim, x, y) && sim.buildings[(y * w + x) as usize] == Building::Ladder;
            let held = ladder(x, y) || !open(&sim, x, y + 1) || ladder(x, y + 1);
            // Falling drops a cell every tick; unheld without dropping is floating.
            let dropped = col.y > last_y[c];
            last_y[c] = col.y;
            hanging[c] = if held || dropped { 0 } else { hanging[c] + 1 };
            if hanging[c] > 1 {
                problems.push(format!("tick {t}: survivor {c} ({:?}) floating at {x},{y}", col.activity));
            }
            if !col.alive() && hanging[c] > 0 {
                problems.push(format!("tick {t}: body {c} in mid-air at {x},{y}"));
            }
            if col.activity == Activity::Sleeping {
                for (o, other) in sim.colonists.iter().enumerate().skip(c + 1) {
                    if other.activity == Activity::Sleeping && other.y == col.y && other.x.abs_diff(col.x) <= 1 && sim.buildings[(y * w + x) as usize] != Building::Bed {
                        problems.push(format!("tick {t}: sleepers {c} and {o} on top of each other at {x},{y} ({:?} {:?} / {},{} {:?})", sim.buildings[(y * w + x) as usize], col.bed.map(|b| (b % sim.width, b / sim.width)), other.x, other.y, other.bed.map(|b| (b % sim.width, b / sim.width))));
                    }
                }
            }
        }

        for (i, &b) in sim.buildings.iter().enumerate() {
            if b == Building::None {
                continue;
            }
            let (x, y) = (i as i32 % w, i as i32 / w);
            let r = reach(b) as i32;
            for dx in -r..=r {
                if !open(&sim, x + dx, y) {
                    problems.push(format!("tick {t}: {b:?} at {x},{y} drawn into rock"));
                } else if b != Building::Ladder && open(&sim, x + dx, y + 1) {
                    problems.push(format!("tick {t}: {b:?} at {x},{y} hangs over air"));
                }
                // Neighbours overlapping its picture.
                for ox in x - r - 1..=x + r + 1 {
                    if ox <= x || ox < 0 || ox >= w {
                        continue;
                    }
                    let other = sim.buildings[(y * w + ox) as usize];
                    if other != Building::None && (ox - x) as u32 <= reach(b) + reach(other) && dx == 0 {
                        problems.push(format!("tick {t}: {b:?} at {x},{y} overlaps {other:?} at {ox},{y}"));
                    }
                }
            }
        }
        if problems.len() > 5000 {
            break;
        }
    }
    // Report each problem once, at the tick it first showed.
    let mut seen = std::collections::HashSet::new();
    problems.retain(|p| seen.insert(p.split_once(": ").map_or(p.clone(), |(_, what)| what.to_string())));
    problems
}
