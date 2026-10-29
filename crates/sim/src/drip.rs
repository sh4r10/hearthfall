//! The drip catcher: a stone trough under wet rock. Rock that touches water
//! (a solid cell with a pool above or beside it) weeps, and the catcher
//! collects a unit every [`DRIP_TICKS`], about a third of one survivor's daily
//! drink, with no labour at all. The water goes to the first tank with room.
//! With every tank full the catcher keeps up to [`DRIP_HOLD`] itself and
//! passes it on once a tank has room.

use crate::{Building, Element, Sim, EVENT_DRIPPED};

/// A catcher under wet rock gains a unit this often: 3.3 units a day.
pub const DRIP_TICKS: u64 = 360;
/// How many rows above a catcher the rock may be wet.
pub const DRIP_REACH: i32 = 3;
/// Most a catcher holds itself while every tank is full.
pub const DRIP_HOLD: i32 = 10;

/// What the inspector shows for a drip catcher (see [`Sim::drip_state`]).
pub const DRIP_DRY: u8 = 1;
pub const DRIP_WET: u8 = 2;

impl Sim {
    /// Whether the cell at `(x, y)` is rock that weeps: solid natural ground with water above or beside it.
    pub fn wet_rock(&self, x: i32, y: i32) -> bool {
        if x < 0 || y < 0 || x >= self.width as i32 || y >= self.height as i32 {
            return false;
        }
        if !matches!(self.elements[self.idx(x as u32, y as u32)], Element::Dirt | Element::Rock | Element::Coal | Element::Iron | Element::Crystal) {
            return false;
        }
        [(x, y - 1), (x - 1, y), (x + 1, y)].into_iter().any(|(nx, ny)| {
            nx >= 0 && ny >= 0 && nx < self.width as i32 && ny < self.height as i32 && self.elements[self.idx(nx as u32, ny as u32)] == Element::Water
        })
    }

    /// Whether a catcher at `(x, y)` would drip: some rock within [`DRIP_REACH`] rows straight above is wet.
    pub fn drip_site_wet(&self, x: i32, y: i32) -> bool {
        (1..=DRIP_REACH).any(|d| self.wet_rock(x, y - d))
    }

    /// 0 for anything but a drip catcher, else [`DRIP_DRY`] or [`DRIP_WET`].
    pub fn drip_state(&self, i: usize) -> u8 {
        if self.buildings[i] != Building::DripCatcher {
            return 0;
        }
        if self.drip_site_wet((i as u32 % self.width) as i32, (i as u32 / self.width) as i32) {
            DRIP_WET
        } else {
            DRIP_DRY
        }
    }

    /// Pass what a catcher holds on to the first tank with room. Returns what moved.
    fn drip_flush(&mut self, i: usize) {
        for t in self.containers() {
            if self.drip_held[i] == 0 {
                break;
            }
            let moved = self.store_add(t, self.drip_held[i]);
            self.drip_held[i] -= moved;
        }
    }

    pub(crate) fn drip_tick(&mut self) {
        for i in 0..self.buildings.len() {
            if self.buildings[i] != Building::DripCatcher {
                self.drip_held[i] = 0;
                continue;
            }
            // Catchers do not all drip on the same tick.
            if (self.tick + i as u64) % DRIP_TICKS == 0 && self.drip_state(i) == DRIP_WET {
                self.drip_held[i] = (self.drip_held[i] + 1).min(DRIP_HOLD);
                if !self.drip_noted {
                    self.drip_noted = true;
                    self.push_event(EVENT_DRIPPED, 0);
                }
            }
            if self.drip_held[i] > 0 && (self.tick + i as u64) % 20 == 0 {
                self.drip_flush(i);
            }
        }
    }
}
