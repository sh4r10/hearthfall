//! Deterministic colony simulation.
//!
//! All state is integers and all randomness comes from a seeded [`Rng`], so the
//! same seed plus the same command list always produces the same state hash on
//! every platform. That property is what lockstep multiplayer and server-side
//! replay verification rely on.

mod colonist;
mod jobs;
mod nav;
mod physics;
mod rng;
mod shades;
mod world;

pub use colonist::{Activity, Colonist, Role, BED_REACH, CAUSE_ALIVE, CAUSE_FROZE, CAUSE_SUFFOCATED, CAUSE_TAKEN, HEADING_NONE, HEADING_WARM, LIT_COLD_DRAIN, STAT_MAX};
pub use jobs::{build_cost, reach, Job, JobKind, COAL_PER_CELL, HEARTH_CAPACITY, HEARTH_COST, LAMP_COST, REFUEL_BELOW};
pub use rng::Rng;
pub use shades::{
    Shade, SHADE_ATTACKING, SHADE_DRAIN, SHADE_DRIFTING, SHADE_FIRST_DAY, SHADE_GIVE_UP, SHADE_SPAWN_FROM_LIGHT, SHADE_SPAWN_RANGE, SHADE_SPAWN_TICKS, SHADE_STEP_TICKS,
};
pub use world::{Building, Element, START_OXYGEN_MG, START_TEMP_CK};

/// Oxygen a colonist breathes in (and CO2 breathed out) per tick, in mg.
pub const BREATH_MG: i32 = 12;
/// Oxygen a diffuser adds to its cell per tick, in mg.
pub const DIFFUSER_MG: i32 = 120;
/// Below this much oxygen in their cell a colonist starts suffocating.
pub const SUFFOCATE_BELOW_MG: i32 = 300;

/// Ticks per full day. The last 40% of each day is night.
pub const DAY_TICKS: u64 = 1200;
/// A lit hearth burns one unit of its fuel this often.
pub const HEARTH_BURN_TICKS: u64 = 40;
/// A mushroom bed in the dark grows a ration this often.
pub const MUSHROOM_TICKS: u64 = 400;
pub const START_COAL: i32 = 24;
pub const START_FOOD: i32 = 20;
/// How far hearth light reaches through open cells, by day and by night.
pub const LIGHT_RADIUS_DAY: i32 = 13;
pub const LIGHT_RADIUS_NIGHT: i32 = 8;
/// How far lamp light reaches, by day and by night.
pub const LAMP_RADIUS_DAY: i32 = 4;
pub const LAMP_RADIUS_NIGHT: i32 = 3;
/// A hearth needs this much oxygen in its cell to stay lit.
pub const HEARTH_MIN_OXYGEN_MG: i32 = 150;
/// Below this light level a cell counts as dark and colonists get cold.
pub const DARK_BELOW: u8 = 40;
/// How many recent events [`Sim::events`] keeps.
pub const MAX_EVENTS: usize = 32;
/// [`Event::kind`] for a survivor dying.
pub const EVENT_DEATH: u8 = 1;
/// [`Event::kind`] for a Shade starting an attack on a survivor.
pub const EVENT_SHADE_ATTACK: u8 = 2;

/// Something the renderer should hear about once, such as a death.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Event {
    pub tick: u64,
    pub kind: u8,
    /// Index of the colonist it happened to.
    pub colonist: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Command {
    /// Mark a cell to be dug out.
    Dig { x: u32, y: u32 },
    /// Mark a cell for construction.
    Build { x: u32, y: u32, building: Building },
    /// Remove a dig or build order.
    Cancel { x: u32, y: u32 },
    SetRole { colonist: u32, role: Role },
}

#[derive(Clone, Debug)]
pub struct Sim {
    pub width: u32,
    pub height: u32,
    pub tick: u64,
    pub elements: Vec<Element>,
    pub buildings: Vec<Building>,
    /// Fuel inside each hearth, indexed by cell.
    pub hearth_fuel: Vec<i32>,
    pub oxygen: Vec<i32>,
    pub co2: Vec<i32>,
    pub temperature: Vec<i32>,
    /// Light level per cell, 0..=255. Derived from hearths and lamps each tick.
    pub light: Vec<u8>,
    /// The part of `light` that comes from hearths. Only this warms.
    pub firelight: Vec<u8>,
    /// Coal in the colony stockpile.
    pub coal: i32,
    /// Rations in the colony stockpile.
    pub food: i32,
    pub colonists: Vec<Colonist>,
    pub jobs: Vec<Job>,
    /// Shades abroad. Only ever non-empty at night.
    pub shades: Vec<Shade>,
    /// The last [`MAX_EVENTS`] events, oldest first.
    pub events: Vec<Event>,
    next_job_id: u32,
    rng: Rng,
    scratch: Vec<i32>,
    scratch2: Vec<i32>,
}

impl Sim {
    pub fn new(seed: u64, width: u32, height: u32) -> Self {
        let elements = world::generate(seed, width, height);
        let n = elements.len();
        let oxygen = elements.iter().map(|e| if e.is_open() { START_OXYGEN_MG } else { 0 }).collect();
        let (cx, cy) = (width / 2, height / 2);
        let roles = [Role::Digger, Role::Builder, Role::Firekeeper];
        // Around the hearth, not in it, and not on top of each other.
        let spots = [cx - 3, cx + 3, cx + 5];
        let colonists = roles.iter().zip(spots).map(|(&r, x)| Colonist::new(x, cy, r)).collect();
        let mut buildings = vec![Building::None; n];
        let mut hearth_fuel = vec![0; n];
        let start = (cy * width + cx) as usize;
        buildings[start] = Building::Hearth;
        hearth_fuel[start] = HEARTH_CAPACITY;
        let mut sim = Sim {
            width,
            height,
            tick: 0,
            elements,
            buildings,
            hearth_fuel,
            oxygen,
            co2: vec![0; n],
            temperature: vec![START_TEMP_CK; n],
            light: vec![0; n],
            firelight: vec![0; n],
            coal: START_COAL,
            food: START_FOOD,
            colonists,
            jobs: Vec::new(),
            shades: Vec::new(),
            events: Vec::new(),
            next_job_id: 1,
            rng: Rng::new(seed ^ 0xC010_C010),
            scratch: vec![0; n],
            scratch2: vec![0; n],
        };
        sim.update_light();
        sim
    }

    #[inline]
    pub fn idx(&self, x: u32, y: u32) -> usize {
        (y * self.width + x) as usize
    }

    fn in_bounds(&self, x: u32, y: u32) -> bool {
        x < self.width && y < self.height
    }

    pub fn is_night(&self) -> bool {
        self.tick % DAY_TICKS >= DAY_TICKS * 6 / 10
    }

    pub fn day(&self) -> u64 {
        self.tick / DAY_TICKS + 1
    }

    pub fn alive_colonists(&self) -> usize {
        self.colonists.iter().filter(|c| c.alive()).count()
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
        self.maintain_jobs();
        self.shades_tick();
        self.colonists_tick();
        self.diffuse_gases();
        self.conduct_heat();
        self.tick += 1;
    }

    fn apply(&mut self, command: Command) {
        match command {
            Command::Dig { x, y } if self.in_bounds(x, y) => {
                if self.elements[self.idx(x, y)].is_diggable() && !self.holds_up_building(x, y) {
                    self.add_job(x, y, JobKind::Dig);
                }
            }
            Command::Build { x, y, building } if self.in_bounds(x, y) && !matches!(building, Building::None | Building::Cairn) => {
                if self.room_for(x, y, building) {
                    self.add_job(x, y, JobKind::Build(building));
                }
            }
            Command::Cancel { x, y } => self.cancel_job(x, y),
            Command::SetRole { colonist, role } => {
                if let Some(c) = self.colonists.get_mut(colonist as usize) {
                    c.role = role;
                }
            }
            _ => {}
        }
    }

    fn buildings_tick(&mut self) {
        let burn = self.tick % HEARTH_BURN_TICKS == 0;
        let grow = self.tick % MUSHROOM_TICKS == MUSHROOM_TICKS - 1;
        for i in 0..self.buildings.len() {
            match self.buildings[i] {
                Building::OxygenDiffuser => self.oxygen[i] += DIFFUSER_MG,
                Building::Hearth if self.hearth_lit(i) => {
                    // Fire eats oxygen and gives off CO2 and heat.
                    let burned = self.oxygen[i].min(8);
                    self.oxygen[i] -= burned;
                    self.co2[i] += burned;
                    self.temperature[i] += 150;
                    if burn {
                        self.hearth_fuel[i] -= 1;
                    }
                }
                // Mushrooms shun the fire's light and heat; lamp light doesn't bother them.
                Building::MushroomBed if grow && !self.is_warm(i) => self.food += 1,
                _ => {}
            }
        }
    }

    pub(crate) fn push_event(&mut self, kind: u8, colonist: u32) {
        if self.events.len() == MAX_EVENTS {
            self.events.remove(0);
        }
        self.events.push(Event { tick: self.tick, kind, colonist });
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
        eat(&self.coal.to_le_bytes());
        eat(&self.food.to_le_bytes());
        for i in 0..self.elements.len() {
            eat(&[self.elements[i] as u8, self.buildings[i] as u8]);
            eat(&self.hearth_fuel[i].to_le_bytes());
            eat(&self.oxygen[i].to_le_bytes());
            eat(&self.co2[i].to_le_bytes());
            eat(&self.temperature[i].to_le_bytes());
        }
        for c in &self.colonists {
            c.hash_into(&mut eat);
        }
        for j in &self.jobs {
            for v in [j.id as i32, j.x as i32, j.y as i32, j.kind.code() as i32, j.progress, j.created as i32, j.claimed_by.map_or(-1, |c| c as i32)] {
                eat(&v.to_le_bytes());
            }
        }
        eat(&(self.shades.len() as u32).to_le_bytes());
        for s in &self.shades {
            s.hash_into(&mut eat);
        }
        for e in &self.events {
            eat(&e.tick.to_le_bytes());
            eat(&[e.kind]);
            eat(&e.colonist.to_le_bytes());
        }
        h
    }
}
