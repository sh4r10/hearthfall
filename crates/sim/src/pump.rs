//! The hand pump: researched with Pumps, built on a floor cell at a pool's
//! edge and within [`PUMP_REACH`] cells of a cistern or the barrel. While the
//! tanks have room and the pool has water, a survivor works it: each stint
//! moves up to [`PUMP_STINT`] units from the pool into the nearest tank, ten
//! times what a bucket trip carries and with no walking. Water really leaves
//! the pool (`take_water`), so pool loss = stock gain, exactly.

use crate::jobs::JobKind;
use crate::{Building, Element, Sim, EVENT_PUMPED};

/// Units one stint at the pump moves.
pub const PUMP_STINT: i32 = 100;
/// Work one stint takes (the same as filling a bucket, 20), with no walk to the tank afterwards.
pub const PUMP_WORK: i32 = 20;
/// A pump feeds tanks this many cells away along the row, and one row up or down.
pub const PUMP_REACH: i32 = 3;
/// A pump only runs while the tanks have this much room, so it does not churn on a few units.
pub const PUMP_ROOM: i32 = 10;
/// The intake pipe reaches this many rows below the pump into the pool.
pub const PUMP_INTAKE_DEPTH: i32 = 3;

/// What the inspector shows for a pump (see [`Sim::pump_state`]).
pub const PUMP_READY: u8 = 1;
pub const PUMP_NO_WATER: u8 = 2;
pub const PUMP_NO_TANK: u8 = 3;
pub const PUMP_TANKS_FULL: u8 = 4;

impl Sim {
    /// Whether water stands right beside `(x, y)`: left or right, on its row or the one below.
    pub fn pool_beside(&self, x: i32, y: i32) -> bool {
        [(x - 1, y), (x + 1, y), (x - 1, y + 1), (x + 1, y + 1)].into_iter().any(|(nx, ny)| {
            nx >= 0 && ny >= 0 && nx < self.width as i32 && ny < self.height as i32 && self.elements[self.idx(nx as u32, ny as u32)] == Element::Water
        })
    }

    /// Tanks (barrel or cistern) a pump at `(x, y)` can feed, in index order.
    pub fn tanks_near(&self, x: i32, y: i32) -> Vec<usize> {
        self.containers().into_iter().filter(|&t| {
            let (tx, ty) = ((t as u32 % self.width) as i32, (t as u32 / self.width) as i32);
            (tx - x).abs() <= PUMP_REACH && (ty - y).abs() <= 1
        }).collect()
    }

    /// Whether a hand pump may be built at `(x, y)`: a pool beside it and a tank in reach.
    pub fn pump_site_ok(&self, x: u32, y: u32) -> bool {
        self.pool_beside(x as i32, y as i32) && !self.tanks_near(x as i32, y as i32).is_empty()
    }

    /// The pool cell a pump at `i` draws from: on each side the first water going down its intake, the fullest of the two.
    fn pump_source(&self, i: usize) -> Option<usize> {
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        let mut best: Option<usize> = None;
        for sx in [x - 1, x + 1] {
            if sx < 0 || sx >= self.width as i32 {
                continue;
            }
            for dy in 0..=PUMP_INTAKE_DEPTH {
                if y + dy >= self.height as i32 {
                    break;
                }
                let j = self.idx(sx as u32, (y + dy) as u32);
                match self.elements[j] {
                    Element::Water => {
                        if best.map_or(true, |b| self.water[j] > self.water[b]) {
                            best = Some(j);
                        }
                        break;
                    }
                    Element::Floor => continue,
                    _ => break,
                }
            }
        }
        best
    }

    /// 0 for anything but a hand pump, else a `PUMP_` value.
    pub fn pump_state(&self, i: usize) -> u8 {
        if self.buildings[i] != Building::HandPump {
            return 0;
        }
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        let tanks = self.tanks_near(x, y);
        if self.pump_source(i).is_none() {
            PUMP_NO_WATER
        } else if tanks.is_empty() {
            PUMP_NO_TANK
        } else if tanks.iter().map(|&t| self.tank_room(t)).sum::<i32>() < PUMP_ROOM {
            PUMP_TANKS_FULL
        } else {
            PUMP_READY
        }
    }

    pub(crate) fn pump_doable(&self, i: usize) -> bool {
        self.pump_state(i) == PUMP_READY && !(self.is_curfew() && self.is_dark(i))
    }

    /// A stint is done: move up to [`PUMP_STINT`] units from the pool to the nearest tank with room.
    pub(crate) fn finish_pump(&mut self, i: usize) {
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        let (Some(src), Some(tank)) = (self.pump_source(i), self.tanks_near(x, y).into_iter().filter(|&t| self.tank_room(t) > 0).min_by_key(|&t| ((t as i32 - i as i32).abs(), t))) else { return };
        let amount = PUMP_STINT.min(self.tank_room(tank)).min(self.water[src]);
        let taken = self.take_water(src, amount);
        self.store_add(tank, taken);
        if taken > 0 && !self.pump_noted {
            self.pump_noted = true;
            self.push_event(EVENT_PUMPED, 0);
        }
    }

    /// Raise a pump errand at every pump that has work to do. One per pump.
    pub(crate) fn raise_pump_jobs(&mut self) {
        if self.tick % 20 != 5 {
            return;
        }
        for i in 0..self.buildings.len() {
            if self.buildings[i] == Building::HandPump && self.pump_doable(i) {
                self.add_job(i as u32 % self.width, i as u32 / self.width, JobKind::Pump);
            }
        }
    }
}
