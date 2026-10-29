//! Rough tick cost and world generation time: `cargo run --release -p sim --example bench`
use std::time::Instant;

fn main() {
    for seed in [1, 7, 1234, 99_999] {
        let start = Instant::now();
        let sim = sim::Sim::new(seed, 160, 110);
        println!("Sim::new(seed {seed}, 160x110): {:.1} ms (settles generated water), hash {:016x}", start.elapsed().as_secs_f64() * 1000.0, sim.state_hash());
    }
    let mut sim = sim::Sim::new(1, 256, 256);
    let ticks = 500;
    let start = Instant::now();
    for _ in 0..ticks {
        sim.step(&[]);
    }
    let per_tick = start.elapsed().as_secs_f64() * 1000.0 / ticks as f64;
    println!("256x256: {per_tick:.3} ms per tick, hash {:016x}", sim.state_hash());
}
