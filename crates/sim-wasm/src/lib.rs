//! Thin wasm-bindgen wrapper around the `sim` crate for the web client.

use sim::{Building, Command};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WebSim {
    sim: sim::Sim,
    queued: Vec<Command>,
}

#[wasm_bindgen]
impl WebSim {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64, width: u32, height: u32) -> WebSim {
        WebSim { sim: sim::Sim::new(seed, width, height), queued: Vec::new() }
    }

    pub fn dig(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Dig { x, y });
    }

    pub fn build_diffuser(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Build { x, y, building: Building::OxygenDiffuser });
    }

    pub fn build_hearth(&mut self, x: u32, y: u32) {
        self.queued.push(Command::Build { x, y, building: Building::Hearth });
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

    pub fn fuel(&self) -> i32 {
        self.sim.fuel
    }

    pub fn is_night(&self) -> bool {
        self.sim.is_night()
    }

    pub fn light(&self) -> Vec<u8> {
        self.sim.light.clone()
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

    pub fn oxygen(&self) -> Vec<i32> {
        self.sim.oxygen.clone()
    }

    pub fn co2(&self) -> Vec<i32> {
        self.sim.co2.clone()
    }

    pub fn temperature(&self) -> Vec<i32> {
        self.sim.temperature.clone()
    }

    /// Flat `[x, y, breath, warmth, ...]`.
    pub fn colonists(&self) -> Vec<i32> {
        self.sim.colonists.iter().flat_map(|c| [c.x as i32, c.y as i32, c.breath, c.warmth]).collect()
    }
}
