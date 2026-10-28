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
pub const BREATH_MG: i32 = 12;
/// Oxygen a diffuser adds to its cell per tick, in mg.
pub const DIFFUSER_MG: i32 = 120;
/// Below this much oxygen in their cell a colonist starts suffocating.
pub const SUFFOCATE_BELOW_MG: i32 = 300;
pub const MAX_BREATH: i32 = 100;
pub const MAX_WARMTH: i32 = 100;

/// Ticks per full day. The last 40% of each day is night.
pub const DAY_TICKS: u64 = 1200;
/// A lit hearth burns one unit of colony fuel this often.
pub const HEARTH_BURN_TICKS: u64 = 20;
/// Fuel gained from digging one coal cell.
pub const COAL_FUEL: i32 = 12;
pub const START_FUEL: i32 = 60;
/// How far hearth light reaches through open cells, by day and by night.
pub const LIGHT_RADIUS_DAY: i32 = 13;
pub const LIGHT_RADIUS_NIGHT: i32 = 8;
/// A hearth needs this much oxygen in its cell to stay lit.
pub const HEARTH_MIN_OXYGEN_MG: i32 = 150;
/// Below this light level a cell counts as dark and colonists get cold.
pub const DARK_BELOW: u8 = 40;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Command {
    Dig { x: u32, y: u32 },
    Build { x: u32, y: u32, building: Building },
}

#[derive(Clone, Debug)]
pub struct Colonist {
    pub x: u32,
    pub y: u32,
    pub breath: i32,
    /// Drops in the dark, recovers near a hearth.
    pub warmth: i32,
}

impl Colonist {
    pub fn alive(&self) -> bool {
        self.breath > 0 && self.warmth > 0
    }
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
    /// The colony's shared fuel stock.
    pub fuel: i32,
    /// Light level per cell, 0..=255. Derived from hearths each tick.
    pub light: Vec<u8>,
    rng: Rng,
    scratch: Vec<i32>,
    scratch2: Vec<i32>,
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
            .map(|i| Colonist { x: cx - 2 + i * 2, y: cy, breath: MAX_BREATH, warmth: MAX_WARMTH })
            .collect();
        let mut buildings = vec![Building::None; n];
        buildings[(cy * width + cx) as usize] = Building::Hearth;
        let mut sim = Sim {
            width,
            height,
            tick: 0,
            elements,
            buildings,
            oxygen,
            co2: vec![0; n],
            temperature: vec![START_TEMP_CK; n],
            colonists,
            fuel: START_FUEL,
            light: vec![0; n],
            rng: Rng::new(seed ^ 0xC010_C010),
            scratch: vec![0; n],
            scratch2: vec![0; n],
        };
        sim.update_light();
        sim
    }

    pub fn is_night(&self) -> bool {
        self.tick % DAY_TICKS >= DAY_TICKS * 6 / 10
    }

    fn hearth_lit(&self, i: usize) -> bool {
        self.buildings[i] == Building::Hearth && self.fuel > 0 && self.oxygen[i] >= HEARTH_MIN_OXYGEN_MG
    }

    /// Flood light outwards from every lit hearth through open cells, so
    /// walls cast real shadows. The first solid cell hit is lit too, so cave
    /// walls show at the edge of the light.
    fn update_light(&mut self) {
        let (w, h) = (self.width as i32, self.height as i32);
        let radius = if self.is_night() { LIGHT_RADIUS_NIGHT } else { LIGHT_RADIUS_DAY };
        self.light.iter_mut().for_each(|l| *l = 0);
        let mut dist = vec![i32::MAX; self.light.len()];
        let mut queue = std::collections::VecDeque::new();
        for i in 0..self.buildings.len() {
            if self.hearth_lit(i) {
                dist[i] = 0;
                queue.push_back(i);
            }
        }
        while let Some(i) = queue.pop_front() {
            let d = dist[i];
            let level = (255 * (radius - d) / radius).max(0) as u8;
            self.light[i] = self.light[i].max(level);
            if d >= radius || !self.elements[i].is_open() {
                continue;
            }
            let (x, y) = ((i as i32) % w, (i as i32) / w);
            for (dx, dy) in [(1, 0), (-1, 0), (0, 1), (0, -1)] {
                let (nx, ny) = (x + dx, y + dy);
                if nx < 0 || ny < 0 || nx >= w || ny >= h {
                    continue;
                }
                let j = (ny * w + nx) as usize;
                if dist[j] > d + 1 {
                    dist[j] = d + 1;
                    queue.push_back(j);
                }
            }
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
        self.update_light();
        self.water_tick();
        self.colonists_tick();
        diffuse_gas(self.width, self.height, &self.elements, &mut self.oxygen, &mut self.scratch);
        diffuse_gas(self.width, self.height, &self.elements, &mut self.co2, &mut self.scratch);
        self.settle_gases();
        self.conduct_heat();
        self.tick += 1;
    }

    fn apply(&mut self, command: Command) {
        match command {
            Command::Dig { x, y } if self.in_bounds(x, y) => {
                let i = self.idx(x, y);
                if self.elements[i].is_diggable() {
                    if self.elements[i] == Element::Coal {
                        self.fuel += COAL_FUEL;
                    }
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
        let mut any_lit = false;
        for i in 0..self.buildings.len() {
            match self.buildings[i] {
                Building::OxygenDiffuser => self.oxygen[i] += DIFFUSER_MG,
                Building::Hearth if self.hearth_lit(i) => {
                    // Fire eats oxygen, gives off CO2 and heat.
                    let burned = self.oxygen[i].min(8);
                    self.oxygen[i] -= burned;
                    self.co2[i] += burned;
                    self.temperature[i] += 150;
                    any_lit = true;
                }
                _ => {}
            }
        }
        if any_lit && self.tick % HEARTH_BURN_TICKS == 0 {
            self.fuel -= 1;
        }
    }

    fn open(&self, x: i32, y: i32) -> bool {
        x >= 0 && y >= 0 && self.in_bounds(x as u32, y as u32) && self.elements[self.idx(x as u32, y as u32)].is_open()
    }

    fn ladder(&self, x: i32, y: i32) -> bool {
        self.open(x, y) && self.buildings[self.idx(x as u32, y as u32)] == Building::Ladder
    }

    /// Whether a colonist at (x, y) is standing on something (y grows downwards).
    fn supported(&self, x: i32, y: i32) -> bool {
        self.ladder(x, y) || y + 1 >= self.height as i32 || !self.open(x, y + 1) || self.ladder(x, y + 1)
    }

    fn colonists_tick(&mut self) {
        for c in 0..self.colonists.len() {
            if !self.colonists[c].alive() {
                continue;
            }
            let (x, y) = (self.colonists[c].x as i32, self.colonists[c].y as i32);
            let (nx, ny) = if !self.supported(x, y) {
                (x, y + 1) // fall
            } else {
                // Wander along floors and up and down ladders. Pathfinding and
                // jobs replace this in milestone 1.
                let mut options = [(x, y); 5];
                let mut n = 1; // staying put is always an option
                for dx in [-1, 1] {
                    if self.open(x + dx, y) && self.supported(x + dx, y) {
                        options[n] = (x + dx, y);
                        n += 1;
                    }
                }
                if self.ladder(x, y) && self.open(x, y - 1) {
                    options[n] = (x, y - 1);
                    n += 1;
                }
                if self.ladder(x, y + 1) {
                    options[n] = (x, y + 1);
                    n += 1;
                }
                // Colonists are afraid of the dark: they won't step out of the
                // light on their own.
                let here_lit = self.light[self.idx(x as u32, y as u32)] >= DARK_BELOW;
                let mut lit = [(x, y); 5];
                let mut m = 0;
                for &(ox, oy) in &options[..n] {
                    if !here_lit || self.light[self.idx(ox as u32, oy as u32)] >= DARK_BELOW {
                        lit[m] = (ox, oy);
                        m += 1;
                    }
                }
                lit[self.rng.below(m as u32) as usize]
            };
            if self.open(nx, ny) {
                self.colonists[c].x = nx as u32;
                self.colonists[c].y = ny as u32;
            }

            let i = self.idx(self.colonists[c].x, self.colonists[c].y);
            let inhaled = self.oxygen[i].min(BREATH_MG);
            self.oxygen[i] -= inhaled;
            self.co2[i] += inhaled;
            let dark = self.light[i] < DARK_BELOW;
            let night = self.is_night();
            let col = &mut self.colonists[c];
            if self.oxygen[i] < SUFFOCATE_BELOW_MG {
                col.breath -= 1;
            } else {
                col.breath = (col.breath + 2).min(MAX_BREATH);
            }
            if dark {
                col.warmth -= if night { 2 } else { 1 };
            } else {
                col.warmth = (col.warmth + 1).min(MAX_WARMTH);
            }
            if col.breath <= 0 || col.warmth <= 0 {
                col.breath = col.breath.max(0);
                col.warmth = col.warmth.max(0);
            }
        }
    }

    /// Water falls into open cells below, and flows sideways towards drops.
    /// Moving water swaps places with the gas it displaces, so mass is conserved.
    fn water_tick(&mut self) {
        let (w, h) = (self.width as i32, self.height as i32);
        let mut moved = vec![false; self.elements.len()];
        let left_first = self.tick % 2 == 0;
        for y in (0..h).rev() {
            for k in 0..w {
                let x = if left_first { k } else { w - 1 - k };
                let i = self.idx(x as u32, y as u32);
                if self.elements[i] != Element::Water || moved[i] {
                    continue;
                }
                let target = if self.open(x, y + 1) {
                    Some((x, y + 1))
                } else {
                    let dir = if self.rng.below(2) == 0 { -1 } else { 1 };
                    [dir, -dir].into_iter().map(|d| (x + d, y)).find(|&(sx, sy)| {
                        // Flow sideways towards a drop, or occasionally level out.
                        self.open(sx, sy) && (self.open(sx, sy + 1) || self.rng.below(4) == 0)
                    })
                };
                if let Some((tx, ty)) = target {
                    let j = self.idx(tx as u32, ty as u32);
                    self.elements.swap(i, j);
                    self.oxygen.swap(i, j);
                    self.co2.swap(i, j);
                    self.temperature.swap(i, j);
                    moved[j] = true;
                }
            }
        }
    }

    /// Carbon dioxide is heavier than oxygen: let it sink by trading places
    /// with oxygen in the cell below. Both gases are conserved.
    fn settle_gases(&mut self) {
        let (w, h) = (self.width as usize, self.height as usize);
        self.scratch.copy_from_slice(&self.oxygen);
        self.scratch2.copy_from_slice(&self.co2);
        for y in 0..h - 1 {
            for x in 0..w {
                let (above, below) = (y * w + x, (y + 1) * w + x);
                if self.elements[above].is_open() && self.elements[below].is_open() {
                    let flow = self.scratch2[above].min(self.scratch[below]) / 8;
                    self.co2[above] -= flow;
                    self.co2[below] += flow;
                    self.oxygen[below] -= flow;
                    self.oxygen[above] += flow;
                }
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
        self.colonists.iter().filter(|c| c.alive()).count()
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
        eat(&self.fuel.to_le_bytes());
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
            eat(&c.warmth.to_le_bytes());
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
