//! Thin wasm-bindgen wrapper around the `sim` crate for the web client.

use sim::{Building, Command, Role, Tech};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WebSim {
    sim: sim::Sim,
    queued: Vec<Command>,
    /// `Sim::job_blockers`, refreshed every [`BLOCKERS_EVERY`] ticks since it walks every survivor's map.
    blockers: Vec<u8>,
    blockers_tick: u64,
}

const BLOCKERS_EVERY: u64 = 10;

/// Values per colonist in [`WebSim::colonists`].
pub const COLONIST_STRIDE: usize = 18 + 3 * sim::SKILLS + 2 + sim::MORALE_PARTS + 3;
/// Values per job in [`WebSim::jobs`].
pub const JOB_STRIDE: usize = 8;
/// Values per event in [`WebSim::events`].
pub const EVENT_STRIDE: usize = 3;
/// Values per Shade in [`WebSim::shades`].
pub const SHADE_STRIDE: usize = 3;

#[wasm_bindgen]
impl WebSim {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64, width: u32, height: u32) -> WebSim {
        WebSim { sim: sim::Sim::new(seed, width, height), queued: Vec::new(), blockers: Vec::new(), blockers_tick: u64::MAX }
    }

    pub fn dig(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Dig { x, y });
    }

    /// `building` uses the numbering of `sim::Building`.
    pub fn build(&mut self, x: u32, y: u32, building: u8) {
        let building = match building {
            1 => Building::Vent,
            2 => Building::Ladder,
            3 => Building::Hearth,
            4 => Building::MushroomBed,
            6 => Building::Lamp,
            7 => Building::Bed,
            8 => Building::Stockpile,
            9 => Building::Tile,
            10 => Building::Door,
            11 => Building::ResearchBench,
            12 => Building::CokeOven,
            13 => Building::Smelter,
            14 => Building::CrystalLamp,
            _ => return,
        };
        self.queued.push(Command::Build { x, y, building });
    }

    pub fn cancel(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Cancel { x, y });
    }

    pub fn deconstruct(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Deconstruct { x, y });
    }

    pub fn set_role(&mut self, colonist: u32, role: u8) {
        if let Some(role) = Role::from_u8(role) {
            self.queued.push(Command::SetRole { colonist, role });
        }
    }

    /// Take in (true) or turn away the stranger waiting at the edge of the light.
    pub fn answer_stranger(&mut self, accept: bool) {
        self.queued.push(Command::AnswerStranger { accept });
    }

    /// How keen a survivor is on one group of errands (by skill): 0 never, 1 low, 2 normal, 3 high.
    pub fn set_pref(&mut self, colonist: u32, skill: u8, pref: u8) {
        self.queued.push(Command::SetPref { colonist, skill, pref });
    }

    /// Set the priority (1 to 9) of the order on a cell.
    pub fn set_priority(&mut self, x: u32, y: u32, priority: u8) {
        self.queued.push(Command::SetPriority { x, y, priority });
    }

    /// Study `tech` (a `sim::Tech` number) at the research bench, or nothing if it is negative.
    pub fn research(&mut self, tech: i32) {
        let tech = u8::try_from(tech).ok().and_then(Tech::from_u8);
        self.queued.push(Command::Research { tech });
    }

    /// Have an iron grate fitted to the hearth on a cell.
    pub fn upgrade(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Upgrade { x, y });
    }

    /// Applies the queued commands without running a tick, so orders given
    /// while paused show at once. Same result as leaving them for `step`.
    pub fn apply_queued(&mut self) {
        let commands = std::mem::take(&mut self.queued);
        self.sim.apply_commands(&commands);
        self.blockers_tick = u64::MAX;
    }

    /// Runs one tick with every command queued since the last step.
    pub fn step(&mut self) {
        let commands = std::mem::take(&mut self.queued);
        self.sim.step(&commands);
    }

    pub fn width(&self) -> u32 {
        self.sim.width
    }

    pub fn height(&self) -> u32 {
        self.sim.height
    }

    pub fn tick(&self) -> u64 {
        self.sim.tick
    }

    pub fn coal(&self) -> i32 {
        self.sim.coal
    }

    pub fn stone(&self) -> i32 {
        self.sim.stone
    }

    pub fn food(&self) -> i32 {
        self.sim.food
    }

    /// Roast meals cooked at a hearth.
    pub fn meals(&self) -> i32 {
        self.sim.meals
    }

    /// The stranger waiting to be taken in, as one `COLONIST_STRIDE` row (see
    /// `colonists`), or empty if nobody is waiting. They leave at nightfall.
    pub fn stranger(&self) -> Vec<i32> {
        self.sim.stranger.as_ref().map_or(Vec::new(), |c| row(&self.sim, c, None).to_vec())
    }

    /// Iron ore, iron, crystal and coke in stock, in that order.
    pub fn rare_stock(&self) -> Vec<i32> {
        vec![self.sim.ore, self.sim.iron, self.sim.crystal, self.sim.coke]
    }

    /// One bit per `sim::Tech` the colony knows.
    pub fn known(&self) -> u32 {
        self.sim.known
    }

    /// The `sim::Tech` being studied, or -1.
    pub fn researching(&self) -> i32 {
        self.sim.researching.map_or(-1, |t| t as i32)
    }

    /// Study banked towards each `sim::Tech`, by number.
    pub fn research_points(&self) -> Vec<i32> {
        self.sim.research_points.clone()
    }

    pub fn is_night(&self) -> bool {
        self.sim.is_night()
    }

    pub fn state_hash(&self) -> u64 {
        self.sim.state_hash()
    }

    pub fn elements(&self) -> Vec<u8> {
        self.sim.elements.iter().map(|&e| e as u8).collect()
    }

    pub fn buildings(&self) -> Vec<u8> {
        self.sim.buildings.iter().map(|&b| b as u8).collect()
    }

    pub fn hearth_fuel(&self) -> Vec<i32> {
        self.sim.hearth_fuel.clone()
    }

    /// How much of each hearth's fuel is coke, by cell.
    pub fn hearth_clean(&self) -> Vec<i32> {
        self.sim.hearth_clean.clone()
    }

    /// 1 where a hearth has an iron grate.
    pub fn hearth_grate(&self) -> Vec<u8> {
        self.sim.hearth_grate.iter().map(|&g| g as u8).collect()
    }

    /// Priority of each hearth's refuel errands, by cell.
    pub fn refuel_priority(&self) -> Vec<u8> {
        self.sim.refuel_priority.clone()
    }

    /// What lies loose on each cell, as a `sim::Item` number (0 for nothing).
    pub fn pile_item(&self) -> Vec<u8> {
        self.sim.pile_item.clone()
    }

    /// How much lies loose on each cell.
    pub fn pile_amount(&self) -> Vec<i32> {
        self.sim.pile_amount.clone()
    }

    pub fn light(&self) -> Vec<u8> {
        self.sim.light.clone()
    }

    /// The part of `light` that comes from hearths: only this keeps survivors warm.
    pub fn firelight(&self) -> Vec<u8> {
        self.sim.firelight.clone()
    }

    /// Where hearth light will reach tonight; see `Sim::night_firelight`.
    pub fn night_firelight(&self) -> Vec<u8> {
        self.sim.night_firelight()
    }

    /// Smoke per cell scaled to 0..=255; see `sim::SMOKE_MAX`.
    /// Which kind of room each cell is in (sim::ROOM_*), 0 outside any room.
    pub fn rooms(&self) -> Vec<u8> {
        self.sim.room_kind.clone()
    }

    pub fn smoke(&self) -> Vec<u8> {
        self.sim.smoke.iter().map(|&s| (s * 255 / sim::SMOKE_MAX) as u8).collect()
    }

    pub fn temperature(&self) -> Vec<i32> {
        self.sim.temperature.clone()
    }

    /// Flat, `COLONIST_STRIDE` values each: x, y, role, activity, warmth,
    /// energy, fullness, mood, sleep quality (needs out of 10000), then the
    /// job's x and y (-1 if none) and its kind, then the cause of death
    /// (0 alive, 1 froze, 2 taken by a Shade), then what they carry (a
    /// `sim::Item` number, 0 for nothing) and how much. Then who they are:
    /// cast index, trait bits, knack skill; then per skill (`sim::SKILLS` of
    /// them) the level, then the percent to each next level, then the errand
    /// preferences; morale, expectation, the morale parts (`sim::MORALE_`
    /// order); last meal, warmth they turn back to the fire at, and ticks
    /// between looking for work.
    pub fn colonists(&self) -> Vec<i32> {
        let s = &self.sim;
        s.colonists.iter().enumerate().flat_map(|(i, c)| row(s, c, Some(i))).collect()
    }

    /// Flat, `JOB_STRIDE` values each: x, y, kind (0 dig, 1 build, 2 refuel,
    /// 3 deconstruct, 4 haul, 5 research, 6 refine, 7 upgrade), building (to build, or to take down), progress percent,
    /// claimed (0 or 1), priority (1 to 9), and why it is stuck (a
    /// `sim::BLOCK_` value, 0 if it isn't).
    pub fn jobs(&mut self) -> Vec<i32> {
        let tick = self.sim.tick;
        if self.blockers.len() != self.sim.jobs.len() || self.blockers_tick == u64::MAX || tick >= self.blockers_tick + BLOCKERS_EVERY {
            self.blockers = self.sim.job_blockers();
            self.blockers_tick = tick;
        }
        let s = &self.sim;
        let blockers = &self.blockers;
        s.jobs
            .iter()
            .enumerate()
            .flat_map(|(k, j)| {
                let building = match j.kind {
                    sim::JobKind::Build(b) => b as i32,
                    sim::JobKind::Deconstruct | sim::JobKind::Refine | sim::JobKind::Upgrade | sim::JobKind::Research => s.buildings[s.idx(j.x, j.y)] as i32,
                    _ => 0,
                };
                [j.x as i32, j.y as i32, j.kind.code() as i32, building, j.progress * 100 / (s.work_needed(j) * sim::WORK_UNIT).max(1), j.claimed_by.is_some() as i32, j.priority as i32, blockers[k] as i32]
            })
            .collect()
    }

    /// Flat, `EVENT_STRIDE` values each, oldest first: tick, kind (1 death,
    /// 2 a Shade starts an attack, 3 a building fell, 4 a stranger was taken
    /// in, 5 smoke, 6 a finished study, 7 a stranger is waiting, 8 a stranger
    /// was turned away or left), colonist index (for 3 the building number,
    /// for 6 the `sim::Tech` number). Only the last 32 events are kept.
    pub fn events(&self) -> Vec<i32> {
        self.sim.events.iter().flat_map(|e| [e.tick as i32, e.kind as i32, e.colonist as i32]).collect()
    }

    /// Flat, `SHADE_STRIDE` values each: x, y, state (0 drifting, 1 attacking).
    /// Empty by day.
    pub fn shades(&self) -> Vec<i32> {
        self.sim.shades.iter().flat_map(|s| [s.x as i32, s.y as i32, s.state as i32]).collect()
    }
}

/// One survivor as a `COLONIST_STRIDE` row. `index` is their place in the
/// colony, or None for the stranger, who has no morale yet.
fn row(s: &sim::Sim, c: &sim::Colonist, index: Option<usize>) -> [i32; COLONIST_STRIDE] {
    let job = c.job.and_then(|id| s.jobs.iter().find(|j| j.id == id));
    let parts = index.map_or([0; sim::MORALE_PARTS], |i| s.morale_parts(i));
    let mut r = [0; COLONIST_STRIDE];
    let head = [
        c.x as i32, c.y as i32, c.role as i32, c.activity as i32,
        c.warmth, c.energy, c.fullness, c.mood, c.sleep_quality,
        job.map_or(-1, |j| j.x as i32), job.map_or(-1, |j| j.y as i32), job.map_or(-1, |j| j.kind.code() as i32),
        c.cause as i32,
        c.carrying.map_or(0, |(i, _)| i as i32), c.carrying.map_or(0, |(_, n)| n),
        c.who as i32, c.traits as i32, c.knack as i32,
    ];
    r[..head.len()].copy_from_slice(&head);
    const N: usize = sim::SKILLS;
    for k in 0..N {
        let lvl = c.level(k);
        r[18 + k] = lvl;
        r[18 + N + k] = if lvl >= sim::MAX_LEVEL { 100 } else { (c.xp[k] - sim::xp_for(lvl)) * 100 / (sim::xp_for(lvl + 1) - sim::xp_for(lvl)) };
        r[18 + 2 * N + k] = c.prefs[k] as i32;
    }
    let m = 18 + 3 * N;
    r[m] = parts.iter().sum();
    r[m + 1] = c.expectation();
    r[m + 2..m + 2 + sim::MORALE_PARTS].copy_from_slice(&parts);
    let t = m + 2 + sim::MORALE_PARTS;
    r[t] = c.last_meal as i32;
    r[t + 1] = c.temper.cold_at;
    r[t + 2] = c.temper.eagerness as i32;
    r
}
