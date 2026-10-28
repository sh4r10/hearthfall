//! Deterministic colony simulation.
//!
//! All state is integers and all randomness comes from a seeded [`Rng`], so the
//! same seed plus the same command list always produces the same state hash on
//! every platform. That property is what lockstep multiplayer and server-side
//! replay verification rely on.

mod colonist;
mod haul;
mod jobs;
mod nav;
mod orders;
mod physics;
mod rng;
mod shades;
mod world;

pub use colonist::{Activity, Colonist, Role, BED_REACH, CAUSE_ALIVE, CAUSE_FROZE, CAUSE_TAKEN, HEADING_NONE, HEADING_WARM, LIT_COLD_DRAIN, STAT_MAX};
pub use jobs::{build_cost, DEFAULT_PRIORITY, MAX_PRIORITY, reach, refund, removable, Job, JobKind, COAL_PER_CELL, STONE_PER_CELL, STONE_PER_DIRT, HEARTH_CAPACITY, HEARTH_COST, LAMP_COST, REFUEL_BELOW};
pub use orders::{BLOCK_NONE, BLOCK_NO_COAL, BLOCK_NO_HANDS, BLOCK_NO_STOCKPILE, BLOCK_NO_STONE, BLOCK_UNREACHABLE, BLOCK_UNDER_BUILDING, NO_HANDS_TICKS};
pub use haul::{Item, CARRY_MAX};
pub use rng::Rng;
pub use shades::{
    Shade, SHADE_ATTACKING, SHADE_DRAIN, SHADE_DRIFTING, SHADE_FIRST_DAY, SHADE_GIVE_UP, SHADE_SPAWN_FROM_LIGHT, SHADE_SPAWN_RANGE, SHADE_SPAWN_TICKS, SHADE_STEP_TICKS,
};
pub use world::{Building, Element, START_TEMP_CK};

/// Ticks per full day. The last 40% of each day is night.
pub const DAY_TICKS: u64 = 1200;
/// A lit hearth burns one unit of its fuel this often.
pub const HEARTH_BURN_TICKS: u64 = 40;
/// A mushroom bed in the dark grows a ration this often.
pub const MUSHROOM_TICKS: u64 = 400;
pub const START_COAL: i32 = 24;
/// Enough stone for a couple of ladders and a bed before the first rock is cut.
pub const START_STONE: i32 = 12;
pub const START_FOOD: i32 = 20;
/// The starting stockpile stands this many cells left of the first hearth.
pub const START_STOCKPILE_LEFT: u32 = 6;
/// How far hearth light reaches through open cells, by day and by night.
pub const LIGHT_RADIUS_DAY: i32 = 13;
pub const LIGHT_RADIUS_NIGHT: i32 = 8;
/// How far lamp light reaches, by day and by night.
pub const LAMP_RADIUS_DAY: i32 = 4;
pub const LAMP_RADIUS_NIGHT: i32 = 3;
/// Below this light level a cell counts as dark and colonists get cold.
pub const DARK_BELOW: u8 = 40;
/// How many recent events [`Sim::events`] keeps.
pub const MAX_EVENTS: usize = 32;
/// [`Event::kind`] for a survivor dying.
pub const EVENT_DEATH: u8 = 1;
/// [`Event::kind`] for a Shade starting an attack on a survivor.
pub const EVENT_SHADE_ATTACK: u8 = 2;
/// [`Event::kind`] for a building falling because its floor went. Its
/// `colonist` field holds the [`Building`] number instead.
pub const EVENT_COLLAPSE: u8 = 3;
/// [`Event::kind`] for a refugee joining the colony.
pub const EVENT_ARRIVAL: u8 = 4;
/// [`Event::kind`] for smoke first gathering thick enough to matter. Sent once.
pub const EVENT_SMOKE: u8 = 5;
/// Smoke per cell, 0 to this. Fires add a little each tick; it rises, pools
/// under ceilings, soaks slowly into the walls, and escapes through vents.
pub const SMOKE_MAX: i32 = 1_000;
/// Smoke a lit hearth gives off per tick. Slow on purpose: one hearth in the
/// start cave takes about three days to get thick, so it is a day-3 problem,
/// not a day-1 one.
pub const SMOKE_PER_TICK: i32 = 2;
/// Walled cells lose this fraction of their smoke to the rock each tick.
pub const SMOKE_SOAK_DIV: i32 = 8_000;
/// Smoke a vent clears from its cell each tick: a strong draught, so a vent
/// above the fire swallows the whole column and the ceiling drains towards it.
pub const VENT_CLEAR: i32 = SMOKE_MAX;
/// From this much smoke a cell is smoky: light is dimmed and survivors cough.
pub const SMOKY: i32 = 400;
/// Refugees can arrive at dawn from this day on, every other day.
pub const REFUGEE_FIRST_DAY: u64 = 3;
/// A refugee only joins a colony with this much food to spare.
pub const REFUGEE_FOOD: i32 = 5;
/// The colony never grows past this on its own.
pub const MAX_COLONISTS: usize = 8;

/// Something the renderer should hear about once, such as a death.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Event {
    pub tick: u64,
    pub kind: u8,
    /// Index of the colonist it happened to (for [`EVENT_COLLAPSE`], the building).
    pub colonist: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Command {
    /// Mark a cell to be dug out.
    Dig { x: u32, y: u32 },
    /// Mark a cell for construction.
    Build { x: u32, y: u32, building: Building },
    /// Remove a dig, build or deconstruct order.
    Cancel { x: u32, y: u32 },
    /// Have the building in a cell taken down.
    Deconstruct { x: u32, y: u32 },
    SetRole { colonist: u32, role: Role },
    /// Change the priority (1 to 9) of the order on a cell.
    SetPriority { x: u32, y: u32, priority: u8 },
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
    /// Priority each hearth's refuel errands get, indexed by cell.
    pub refuel_priority: Vec<u8>,
    /// What lies loose on each cell (an [`Item`] number, 0 for nothing) and how much.
    pub pile_item: Vec<u8>,
    pub pile_amount: Vec<i32>,
    pub temperature: Vec<i32>,
    /// Light level per cell, 0..=255. Derived from hearths and lamps each tick.
    pub light: Vec<u8>,
    /// The part of `light` that comes from hearths. Only this warms.
    pub firelight: Vec<u8>,
    /// Coal in the colony stockpile.
    /// Smoke per cell; see [`SMOKE_MAX`].
    pub smoke: Vec<i32>,
    /// Whether [`EVENT_SMOKE`] has been sent.
    pub smoke_warned: bool,
    pub coal: i32,
    /// Stone from digging rock. Everything you stack is built from it.
    pub stone: i32,
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
    /// Snapshot buffer for heat conduction, so the result is order-independent.
    scratch: Vec<i32>,
}

impl Sim {
    pub fn new(seed: u64, width: u32, height: u32) -> Self {
        let elements = world::generate(seed, width, height);
        let n = elements.len();
        let (cx, cy) = (width / 2, height / 2);
        // Esk and Mara. Everyone else follows the firelight down later.
        let roles = [Role::Digger, Role::Firekeeper];
        // Around the hearth, not in it, and not on top of each other.
        let spots = [cx - 3, cx + 3];
        let colonists = roles.iter().zip(spots).map(|(&r, x)| Colonist::new(x, cy, r)).collect();
        let mut buildings = vec![Building::None; n];
        let mut hearth_fuel = vec![0; n];
        let start = (cy * width + cx) as usize;
        buildings[start] = Building::Hearth;
        hearth_fuel[start] = HEARTH_CAPACITY;
        // A stockpile in the start cave, so the first dug coal has somewhere to go.
        buildings[start - START_STOCKPILE_LEFT as usize] = Building::Stockpile;
        let mut sim = Sim {
            width,
            height,
            tick: 0,
            elements,
            buildings,
            hearth_fuel,
            refuel_priority: vec![DEFAULT_PRIORITY; n],
            pile_item: vec![0; n],
            pile_amount: vec![0; n],
            temperature: vec![START_TEMP_CK; n],
            light: vec![0; n],
            firelight: vec![0; n],
            smoke: vec![0; n],
            smoke_warned: false,
            coal: START_COAL,
            stone: START_STONE,
            food: START_FOOD,
            colonists,
            jobs: Vec::new(),
            shades: Vec::new(),
            events: Vec::new(),
            next_job_id: 1,
            rng: Rng::new(seed ^ 0xC010_C010),
            scratch: vec![0; n],
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

    /// At dawn every other day from [`REFUGEE_FIRST_DAY`], a refugee drawn by
    /// the firelight joins, if there is a free bed, food to spare and a fire
    /// to stand by. They appear in the firelight on a free patch of floor.
    fn refugees_tick(&mut self) {
        let day = self.tick / DAY_TICKS + 1;
        if self.tick % DAY_TICKS != 0 || day < REFUGEE_FIRST_DAY || (day - REFUGEE_FIRST_DAY) % 2 != 0 {
            return;
        }
        if self.colonists.len() >= MAX_COLONISTS || self.food < REFUGEE_FOOD {
            return;
        }
        let bed_free = (0..self.buildings.len()).any(|i| self.buildings[i] == Building::Bed && !self.colonists.iter().any(|c| c.alive() && c.bed == Some(i as u32)));
        if !bed_free {
            return;
        }
        let w = self.width as i32;
        let spot = (0..self.buildings.len()).find(|&i| {
            let (x, y) = (i as i32 % w, i as i32 / w);
            self.is_warm(i) && self.open(x, y) && self.supported(x, y) && self.buildings[i] == Building::None && !self.by_hearth(x, y)
                && !self.colonists.iter().any(|c| c.alive() && (c.x as i32, c.y as i32) == (x, y))
        });
        let Some(spot) = spot else { return };
        let roles = [Role::Builder, Role::Hauler, Role::Digger, Role::Firekeeper];
        let role = roles[self.colonists.len() % roles.len()];
        self.colonists.push(Colonist::new(spot as u32 % self.width, spot as u32 / self.width, role));
        self.push_event(EVENT_ARRIVAL, self.colonists.len() as u32 - 1);
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
        self.smoke_tick();
        self.update_light();
        self.water_tick();
        self.maintain_jobs();
        self.refugees_tick();
        self.shades_tick();
        self.colonists_tick();
        self.conduct_heat();
        self.tick += 1;
    }

    /// Apply commands without advancing time. `step` applies its commands
    /// before anything moves, so this is the same as handing them to the next
    /// step; a paused game uses it so new orders show at once.
    pub fn apply_commands(&mut self, commands: &[Command]) {
        for &c in commands {
            self.apply(c);
        }
    }

    fn apply(&mut self, command: Command) {
        match command {
            Command::Dig { x, y } if self.in_bounds(x, y) => {
                if self.elements[self.idx(x, y)].is_diggable() {
                    // A building's floor can't be dug out from under it: the
                    // player removes the building first, on purpose.
                    if !self.holds_up_building(x, y) {
                        self.add_job(x, y, JobKind::Dig);
                    }
                }
            }
            Command::Deconstruct { x, y } if self.in_bounds(x, y) => self.order_deconstruct(x, y),
            Command::Build { x, y, building } if self.in_bounds(x, y) && !matches!(building, Building::None | Building::Cairn) => {
                if self.room_for(x, y, building) {
                    self.add_job(x, y, JobKind::Build(building));
                }
            }
            Command::Cancel { x, y } if self.in_bounds(x, y) => self.cancel_job(x, y),
            Command::SetPriority { x, y, priority } if self.in_bounds(x, y) => self.set_priority(x, y, priority),
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
                Building::Hearth if self.hearth_lit(i) => {
                    // Fire gives off heat and smoke.
                    self.temperature[i] += 150;
                    self.smoke[i] = (self.smoke[i] + SMOKE_PER_TICK).min(SMOKE_MAX);
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
        eat(&[self.smoke_warned as u8]);
        eat(&self.coal.to_le_bytes());
        eat(&self.stone.to_le_bytes());
        eat(&self.food.to_le_bytes());
        for i in 0..self.elements.len() {
            eat(&[self.elements[i] as u8, self.buildings[i] as u8]);
            eat(&self.hearth_fuel[i].to_le_bytes());
            eat(&[self.refuel_priority[i], self.pile_item[i]]);
            eat(&self.pile_amount[i].to_le_bytes());
            eat(&self.temperature[i].to_le_bytes());
            eat(&self.smoke[i].to_le_bytes());
        }
        for c in &self.colonists {
            c.hash_into(&mut eat);
        }
        for j in &self.jobs {
            for v in [j.id as i32, j.x as i32, j.y as i32, j.kind.code() as i32, j.progress, j.created as i32, j.claimed_by.map_or(-1, |c| c as i32), j.priority as i32] {
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
