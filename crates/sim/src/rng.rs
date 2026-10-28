/// Small, seedable, platform-independent PRNG (SplitMix64).
/// Every random decision in the sim must go through this so runs replay exactly.
#[derive(Clone, Debug)]
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        Rng(seed)
    }

    pub fn next_u64(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    /// Uniform integer in `0..n`.
    pub fn below(&mut self, n: u32) -> u32 {
        (self.next_u64() % n as u64) as u32
    }
}

/// Stateless hash of a lattice point, used by map generation.
pub fn hash2(seed: u64, x: i32, y: i32) -> u32 {
    let mut r = Rng::new(seed ^ ((x as u32 as u64) << 32) ^ (y as u32 as u64));
    r.next_u64();
    r.next_u64() as u32
}
