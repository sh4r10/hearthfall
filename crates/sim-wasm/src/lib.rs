//! Thin wasm-bindgen wrapper around the `sim` crate for the web client.

use sim::{Building, Command, Role};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WebSim {
    sim: sim::Sim,
    queued: Vec<Command>,
}

/// Values per colonist in [`WebSim::colonists`].
pub const COLONIST_STRIDE: usize = 14;
/// Values per job in [`WebSim::jobs`].
pub const JOB_STRIDE: usize = 6;
/// Values per event in [`WebSim::events`].
pub const EVENT_STRIDE: usize = 3;
/// Values per Shade in [`WebSim::shades`].
pub const SHADE_STRIDE: usize = 3;

#[wasm_bindgen]
impl WebSim {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64, width: u32, height: u32) -> WebSim {
        WebSim { sim: sim::Sim::new(seed, width, height), queued: Vec::new() }
    }

    pub fn dig(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Dig { x, y });
    }

    /// `building` uses the numbering of `sim::Building`.
    pub fn build(&mut self, x: u32, y: u32, building: u8) {
        let building = match building {
            1 => Building::OxygenDiffuser,
            2 => Building::Ladder,
            3 => Building::Hearth,
            4 => Building::MushroomBed,
            6 => Building::Lamp,
            7 => Building::Bed,
            _ => return,
        };
        self.queued.push(Command::Build { x, y, building });
    }

    pub fn cancel(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Cancel { x, y });
    }

    pub fn set_role(&mut self, colonist: u32, role: u8) {
        if let Some(role) = Role::from_u8(role) {
            self.queued.push(Command::SetRole { colonist, role });
        }
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

    pub fn oxygen(&self) -> Vec<i32> {
        self.sim.oxygen.clone()
    }

    pub fn co2(&self) -> Vec<i32> {
        self.sim.co2.clone()
    }

    pub fn temperature(&self) -> Vec<i32> {
        self.sim.temperature.clone()
    }

    /// Flat, `COLONIST_STRIDE` values each: x, y, role, activity, breath,
    /// warmth, energy, fullness, mood, sleep quality (needs out of 10000),
    /// then the job's x and y (-1 if none) and its kind, then the cause of
    /// death (0 alive, 1 froze, 2 suffocated, 3 taken by a Shade).
    pub fn colonists(&self) -> Vec<i32> {
        let s = &self.sim;
        s.colonists
            .iter()
            .flat_map(|c| {
                let job = c.job.and_then(|id| s.jobs.iter().find(|j| j.id == id));
                [
                    c.x as i32, c.y as i32, c.role as i32, c.activity as i32,
                    c.breath, c.warmth, c.energy, c.fullness, c.mood, c.sleep_quality,
                    job.map_or(-1, |j| j.x as i32), job.map_or(-1, |j| j.y as i32), job.map_or(-1, |j| j.kind.code() as i32),
                    c.cause as i32,
                ]
            })
            .collect()
    }

    /// Flat, `JOB_STRIDE` values each: x, y, kind (0 dig, 1 build, 2 refuel),
    /// building, progress percent, claimed (0 or 1).
    pub fn jobs(&self) -> Vec<i32> {
        let s = &self.sim;
        s.jobs
            .iter()
            .flat_map(|j| {
                let building = match j.kind {
                    sim::JobKind::Build(b) => b as i32,
                    _ => 0,
                };
                [j.x as i32, j.y as i32, j.kind.code() as i32, building, j.progress * 100 / s.work_needed(j).max(1), j.claimed_by.is_some() as i32]
            })
            .collect()
    }

    /// Flat, `EVENT_STRIDE` values each, oldest first: tick, kind (1 death,
    /// 2 a Shade starts an attack), colonist index. Only the last 32 events are kept.
    pub fn events(&self) -> Vec<i32> {
        self.sim.events.iter().flat_map(|e| [e.tick as i32, e.kind as i32, e.colonist as i32]).collect()
    }

    /// Flat, `SHADE_STRIDE` values each: x, y, state (0 drifting, 1 attacking).
    /// Empty by day.
    pub fn shades(&self) -> Vec<i32> {
        self.sim.shades.iter().flat_map(|s| [s.x as i32, s.y as i32, s.state as i32]).collect()
    }
}
