//! Rough tick cost: `cargo run --release -p sim --example bench`
use std::time::Instant;

fn main() {
    let mut sim = sim::Sim::new(1, 256, 256);
    let ticks = 500;
    let start = Instant::now();
    for _ in 0..ticks {
        sim.step(&[]);
    }
    let per_tick = start.elapsed().as_secs_f64() * 1000.0 / ticks as f64;
    println!("256x256: {per_tick:.3} ms per tick, hash {:016x}", sim.state_hash());
}
