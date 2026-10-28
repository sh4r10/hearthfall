//! Deterministic colony simulation.
//!
//! All state is integers and all randomness comes from a seeded [`Rng`], so the
//! same seed plus the same command list always produces the same state hash on
//! every platform. That property is what lockstep multiplayer and server-side
//! replay verification rely on.

mod rng;
mod world;

pub use rng::Rng;
pub use world::{Building, Element, START_OXYGEN_MG, START_TEMP_CK};

/// Oxygen a colonist breathes in (and CO2 breathed out) per tick, in mg.
pub const BREATH_MG: i32 = 40;
/// Oxygen a diffuser adds to its cell per tick, in mg.
pub const DIFFUSER_MG: i32 = 120;
/// Below this much oxygen in their cell a colonist starts suffocating.
pub const SUFFOCATE_BELOW_MG: i32 = 300;
pub const MAX_BREATH: i32 = 100;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Command {
    Dig { x: u32, y: u32 },
    Build { x: u32, y: u32, building: Building },
}

#[derive(Clone, Debug)]
pub struct Colonist {
    pub x: u32,
    pub y: u32,
    /// 0 means dead.
    pub breath: i32,
}

#[derive(Clone, Debug)]
pub struct Sim {
    pub width: u32,
    pub height: u32,
    pub tick: u64,
    pub elements: Vec<Element>,
    pub buildings: Vec<Building>,
    pub oxygen: Vec<i32>,
    pub co2: Vec<i32>,
    pub temperature: Vec<i32>,
    pub colonists: Vec<Colonist>,
    rng: Rng,
    scratch: Vec<i32>,
}

impl Sim {
    pub fn new(seed: u64, width: u32, height: u32) -> Self {
        let elements = world::generate(seed, width, height);
        let n = elements.len();
        let oxygen = elements
            .iter()
            .map(|e| if e.is_open() { START_OXYGEN_MG } else { 0 })
            .collect();
        let (cx, cy) = (width / 2, height / 2);
        let colonists = (0..3)
            .map(|i| Colonist { x: cx - 1 + i, y: cy, breath: MAX_BREATH })
            .collect();
        Sim {
            width,
            height,
            tick: 0,
            elements,
            buildings: vec![Building::None; n],
            oxygen,
            co2: vec![0; n],
            temperature: vec![START_TEMP_CK; n],
            colonists,
            rng: Rng::new(seed ^ 0xC010_C010),
            scratch: vec![0; n],
        }
    }

    #[inline]
    pub fn idx(&self, x: u32, y: u32) -> usize {
        (y * self.width + x) as usize
    }

    fn in_bounds(&self, x: u32, y: u32) -> bool {
        x < self.width && y < self.height
    }

    /// Advance one tick. `commands` are the inputs scheduled for this tick, in
    /// the order the server assigned them.
    pub fn step(&mut self, commands: &[Command]) {
        for &c in commands {
            self.apply(c);
        }
        self.buildings_tick();
        self.colonists_tick();
        diffuse_gas(self.width, self.height, &self.elements, &mut self.oxygen, &mut self.scratch);
        diffuse_gas(self.width, self.height, &self.elements, &mut self.co2, &mut self.scratch);
        self.conduct_heat();
        self.tick += 1;
    }

    fn apply(&mut self, command: Command) {
        match command {
            Command::Dig { x, y } if self.in_bounds(x, y) => {
                let i = self.idx(x, y);
                if self.elements[i].is_diggable() {
                    self.elements[i] = Element::Floor;
                }
            }
            Command::Build { x, y, building } if self.in_bounds(x, y) => {
                let i = self.idx(x, y);
                if self.elements[i].is_open() && self.buildings[i] == Building::None {
                    self.buildings[i] = building;
                }
            }
            _ => {}
        }
    }

    fn buildings_tick(&mut self) {
        for i in 0..self.buildings.len() {
            if self.buildings[i] == Building::OxygenDiffuser {
                self.oxygen[i] += DIFFUSER_MG;
            }
        }
    }

    fn colonists_tick(&mut self) {
        const DIRS: [(i32, i32); 4] = [(1, 0), (-1, 0), (0, 1), (0, -1)];
        for c in 0..self.colonists.len() {
            if self.colonists[c].breath == 0 {
                continue;
            }
            // Wander. Pathfinding and jobs replace this in milestone 1.
            let (dx, dy) = DIRS[self.rng.below(4) as usize];
            let (nx, ny) = (self.colonists[c].x as i32 + dx, self.colonists[c].y as i32 + dy);
            if nx >= 0 && ny >= 0 && self.in_bounds(nx as u32, ny as u32) {
                let ni = self.idx(nx as u32, ny as u32);
                if self.elements[ni].is_open() {
                    self.colonists[c].x = nx as u32;
                    self.colonists[c].y = ny as u32;
                }
            }

            let i = self.idx(self.colonists[c].x, self.colonists[c].y);
            let inhaled = self.oxygen[i].min(BREATH_MG);
            self.oxygen[i] -= inhaled;
            self.co2[i] += inhaled;
            let col = &mut self.colonists[c];
            if self.oxygen[i] < SUFFOCATE_BELOW_MG {
                col.breath -= 1;
            } else {
                col.breath = (col.breath + 2).min(MAX_BREATH);
            }
        }
    }

    fn conduct_heat(&mut self) {
        let (w, h) = (self.width as usize, self.height as usize);
        let t = &mut self.temperature;
        self.scratch.copy_from_slice(t);
        for y in 0..h {
            for x in 0..w {
                let i = y * w + x;
                for j in [if x + 1 < w { Some(i + 1) } else { None }, if y + 1 < h { Some(i + w) } else { None }]
                    .into_iter()
                    .flatten()
                {
                    let k = self.elements[i].conductivity().min(self.elements[j].conductivity()) as i64;
                    let flux = ((self.scratch[i] - self.scratch[j]) as i64 * k / 1024 / 5) as i32;
                    t[i] -= flux;
                    t[j] += flux;
                }
            }
        }
    }

    pub fn alive_colonists(&self) -> usize {
        self.colonists.iter().filter(|c| c.breath > 0).count()
    }

    /// FNV-1a over the whole state. Peers compare this to detect desyncs.
    pub fn state_hash(&self) -> u64 {
        let mut h: u64 = 0xcbf2_9ce4_8422_2325;
        let mut eat = |bytes: &[u8]| {
            for &b in bytes {
                h ^= b as u64;
                h = h.wrapping_mul(0x0000_0100_0000_01b3);
            }
        };
        eat(&self.tick.to_le_bytes());
        for i in 0..self.elements.len() {
            eat(&[self.elements[i] as u8, self.buildings[i] as u8]);
            eat(&self.oxygen[i].to_le_bytes());
            eat(&self.co2[i].to_le_bytes());
            eat(&self.temperature[i].to_le_bytes());
        }
        for c in &self.colonists {
            eat(&c.x.to_le_bytes());
            eat(&c.y.to_le_bytes());
            eat(&c.breath.to_le_bytes());
        }
        h
    }
}

/// Mass-conserving gas exchange between open neighbours. Fluxes are computed
/// from a snapshot so the result does not depend on iteration order.
fn diffuse_gas(width: u32, height: u32, elements: &[Element], gas: &mut [i32], snapshot: &mut [i32]) {
    let (w, h) = (width as usize, height as usize);
    snapshot.copy_from_slice(gas);
    for y in 0..h {
        for x in 0..w {
            let i = y * w + x;
            if !elements[i].is_open() {
                continue;
            }
            for j in [if x + 1 < w { Some(i + 1) } else { None }, if y + 1 < h { Some(i + w) } else { None }]
                .into_iter()
                .flatten()
            {
                if elements[j].is_open() {
                    // Dividing by 5 caps a cell's total outflow at 4/5 of its
                    // mass, so gas never goes negative.
                    let flux = (snapshot[i] - snapshot[j]) / 5;
                    gas[i] -= flux;
                    gas[j] += flux;
                }
            }
        }
    }
}
