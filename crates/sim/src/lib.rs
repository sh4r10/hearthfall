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
mod people;
mod physics;
mod research;
mod rng;
mod rooms;
mod shades;
mod world;

pub use colonist::{Activity, Colonist, Role, MISERABLE, WORK_UNIT, BED_REACH, CAUSE_ALIVE, CAUSE_FROZE, CAUSE_TAKEN, HEADING_NONE, HEADING_WARM, LIT_COLD_DRAIN, STAT_MAX};
pub use jobs::{build_cost, rare_cost, CRYSTAL_PER_CELL, ORE_PER_CELL, DEFAULT_PRIORITY, MAX_PRIORITY, reach, refund, removable, Job, JobKind, COAL_PER_CELL, STONE_PER_CELL, STONE_PER_DIRT, HEARTH_CAPACITY, HEARTH_COST, LAMP_COST, REFUEL_BELOW, TILE_STONE};
pub use orders::{BLOCK_NONE, BLOCK_NO_COAL, BLOCK_NO_CRYSTAL, BLOCK_NO_IRON, BLOCK_NO_HANDS, BLOCK_NO_STOCKPILE, BLOCK_NO_STONE, BLOCK_UNREACHABLE, BLOCK_UNDER_BUILDING, NO_HANDS_TICKS};
pub use haul::{Item, CARRY_MAX};
pub use research::{Tech, COAL_RESERVE, COKE_COAL, COKE_FUEL, COKE_KEEP, COKE_MADE, GRATE_BURN_TICKS, GRATE_IRON, GRATE_RADIUS, IRON_KEEP, RESEARCH_PRIORITY, RESEARCH_STINT, SMELT_ORE, TECHS};
pub use people::*;
pub use rng::Rng;
pub use rooms::{ROOM_BEDROOM, ROOM_CELLAR, ROOM_GLOW, ROOM_HEARTH, ROOM_MAX_CELLS, ROOM_NONE, ROOM_PLAIN, ROOM_TICKS};
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
/// How far a crystal lamp's light reaches, by day and by night.
pub const CRYSTAL_RADIUS_DAY: i32 = 8;
pub const CRYSTAL_RADIUS_NIGHT: i32 = 6;
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
/// [`Event::kind`] for a stranger taken into the colony. See also
/// [`EVENT_STRANGER`] and [`EVENT_TURNED_AWAY`].
pub const EVENT_ARRIVAL: u8 = 4;
/// [`Event::kind`] for smoke first gathering thick enough to matter. Sent once.
pub const EVENT_SMOKE: u8 = 5;
/// [`Event::kind`] for a finished study. Its `colonist` field holds the [`Tech`] number instead.
pub const EVENT_RESEARCH: u8 = 6;
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
    /// Take in (`true`) or turn away the stranger waiting at the edge of the light.
    AnswerStranger { accept: bool },
    /// How keen a survivor should be on one group of errands, by skill: a `PREF_` value.
    SetPref { colonist: u32, skill: u8, pref: u8 },
    /// Change the priority (1 to 9) of the order on a cell.
    SetPriority { x: u32, y: u32, priority: u8 },
    /// Pick what the research bench studies, or nothing.
    Research { tech: Option<Tech> },
    /// Have an iron grate fitted to the hearth on a cell.
    Upgrade { x: u32, y: u32 },
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
    /// How much of each hearth's fuel is coke, which smokes half as much.
    pub hearth_clean: Vec<i32>,
    /// Whether each hearth has an iron grate.
    pub hearth_grate: Vec<bool>,
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
    /// Which room each cell is in, 0 for none; see `rooms.rs`.
    pub room_id: Vec<u16>,
    /// What kind of room each cell is in, one of the `ROOM_` values.
    pub room_kind: Vec<u8>,
    pub coal: i32,
    /// Stone from digging rock. Everything you stack is built from it.
    pub stone: i32,
    /// Raw rations in the colony stockpile.
    pub food: i32,
    /// Roast meals, cooked from raw rations at a hearth. Eaten first.
    pub meals: i32,
    /// Someone waiting at the edge of the light to be taken in or turned away.
    pub stranger: Option<Colonist>,
    /// Iron ore, iron, crystal and coke in stock.
    pub ore: i32,
    pub iron: i32,
    pub crystal: i32,
    pub coke: i32,
    /// One bit per [`Tech`] the colony knows.
    pub known: u32,
    /// What the research bench is studying.
    pub researching: Option<Tech>,
    /// Study banked towards each [`Tech`], by its number.
    pub research_points: Vec<i32>,
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
            hearth_clean: vec![0; n],
            hearth_grate: vec![false; n],
            refuel_priority: vec![DEFAULT_PRIORITY; n],
            pile_item: vec![0; n],
            pile_amount: vec![0; n],
            temperature: vec![START_TEMP_CK; n],
            light: vec![0; n],
            firelight: vec![0; n],
            smoke: vec![0; n],
            smoke_warned: false,
            room_id: vec![0; n],
            room_kind: vec![rooms::ROOM_NONE; n],
            coal: START_COAL,
            stone: START_STONE,
            food: START_FOOD,
            ore: 0,
            iron: 0,
            crystal: 0,
            coke: 0,
            known: 0,
            researching: None,
            research_points: vec![0; TECHS.len()],
            meals: 0,
            stranger: None,
            colonists: Vec::new(),
            jobs: Vec::new(),
            shades: Vec::new(),
            events: Vec::new(),
            next_job_id: 1,
            rng: Rng::new(seed ^ 0xC010_C010),
            scratch: vec![0; n],
        };
        // Esk and Mara, either side of the hearth. Everyone else follows the firelight down later.
        sim.first_two(cx, cy);
        sim.rooms_tick();
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
        self.smoke_tick();
        self.rooms_tick();
        self.update_light();
        self.water_tick();
        self.maintain_jobs();
        self.strangers_tick();
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
            Command::Build { x, y, building } if self.in_bounds(x, y) && !matches!(building, Building::None | Building::Cairn) && self.unlocked(building) => {
                if self.room_for(x, y, building) {
                    self.add_job(x, y, JobKind::Build(building));
                }
            }
            Command::Cancel { x, y } if self.in_bounds(x, y) => self.cancel_job(x, y),
            Command::SetPriority { x, y, priority } if self.in_bounds(x, y) => self.set_priority(x, y, priority),
            Command::Research { tech } => self.set_research(tech),
            Command::Upgrade { x, y } if self.in_bounds(x, y) => self.order_upgrade(x, y),
            Command::SetRole { colonist, role } => {
                if let Some(c) = self.colonists.get_mut(colonist as usize) {
                    c.role = role;
                }
            }
            Command::AnswerStranger { accept } => self.answer_stranger(accept),
            Command::SetPref { colonist, skill, pref } => {
                if let Some(c) = self.colonists.get_mut(colonist as usize) {
                    if (skill as usize) < SKILLS {
                        c.prefs[skill as usize] = pref.min(PREF_HIGH);
                    }
                }
            }
            _ => {}
        }
    }

    fn buildings_tick(&mut self) {
        let grow = self.tick % MUSHROOM_TICKS == MUSHROOM_TICKS - 1;
        // A cellar grows a second ration halfway through each cycle.
        let grow_cellar = self.tick % MUSHROOM_TICKS == MUSHROOM_TICKS / 2 - 1;
        for i in 0..self.buildings.len() {
            match self.buildings[i] {
                Building::Hearth if self.hearth_lit(i) => {
                    // Fire gives off heat and smoke. A grate and coke each
                    // halve the smoke: worked out per two ticks to stay whole.
                    self.temperature[i] += 150;
                    let clean = self.hearth_clean[i] > 0;
                    let per_two = SMOKE_PER_TICK * 2 >> (self.hearth_grate[i] as u32 + clean as u32);
                    let puff = per_two / 2 + if self.tick % 2 == 0 { per_two % 2 } else { 0 };
                    self.smoke[i] = (self.smoke[i] + puff).min(SMOKE_MAX);
                    let every = if self.hearth_grate[i] { GRATE_BURN_TICKS } else { HEARTH_BURN_TICKS };
                    if self.tick % every == 0 {
                        self.hearth_fuel[i] -= 1;
                        if clean {
                            self.hearth_clean[i] -= 1;
                        }
                    }
                }
                // Mushrooms shun the fire's light and heat; lamp light doesn't bother them.
                Building::MushroomBed if (grow || (grow_cellar && self.room_kind[i] == rooms::ROOM_CELLAR)) && !self.is_warm(i) => self.food += 1,
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
        eat(&self.meals.to_le_bytes());
        match &self.stranger {
            Some(c) => c.hash_into(&mut eat),
            None => eat(&[0xff]),
        }
        for v in [self.ore, self.iron, self.crystal, self.coke, self.known as i32, self.researching.map_or(-1, |t| t as i32)] {
            eat(&v.to_le_bytes());
        }
        for v in &self.research_points {
            eat(&v.to_le_bytes());
        }
        for i in 0..self.elements.len() {
            eat(&[self.elements[i] as u8, self.buildings[i] as u8]);
            eat(&self.hearth_fuel[i].to_le_bytes());
            eat(&self.hearth_clean[i].to_le_bytes());
            eat(&[self.hearth_grate[i] as u8]);
            eat(&[self.refuel_priority[i], self.pile_item[i]]);
            eat(&self.pile_amount[i].to_le_bytes());
            eat(&self.temperature[i].to_le_bytes());
            eat(&self.smoke[i].to_le_bytes());
            eat(&self.room_id[i].to_le_bytes());
            eat(&[self.room_kind[i]]);
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
