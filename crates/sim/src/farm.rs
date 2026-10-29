//! Water for the mushroom beds. A bed holds a water level (0 to [`WATER_MAX`] units
//! of real water); a watered bed grows twice as fast, a dry one still grows at the
//! normal rate, so water is a bonus and never a requirement. A bed beside a pool
//! waters itself, sipping a few units from it as its own water drains. Any other
//! bed that runs low raises a [`JobKind::Water`] errand: a survivor fills a bucket
//! at the nearest pool they can walk to (or, with none in reach and water to
//! spare, at the colony's tanks) and carries it over. Buckets really take the
//! water out of the pool (see `Sim::take_water`), so small pools can run dry.

use crate::haul::Item;
use crate::jobs::JobKind;
use crate::nav::UNREACHED;
use crate::water::WATER_ERRANDS_FROM_DAY;
use crate::{Activity, Building, Element, Sim, EVENT_WATERED};

/// A full bed, and what a bucket fills it to.
pub const WATER_MAX: i32 = 100;
/// A growing bed loses one point this often, so a full bed stays wet for about
/// two and a half growth cycles.
pub const WATER_DRAIN_TICKS: u64 = 10;
/// A bed below this raises a water errand.
pub const WATER_LOW: i32 = WATER_MAX / 2;
/// A bed with a pool this close (cells either way, across and up or down) waters itself.
pub const IRRIGATION_REACH: i32 = 2;
/// A self-watering bed takes at most this much from its pool each time it drinks (every [`WATER_DRAIN_TICKS`]).
pub const SELF_WATER_SIP: i32 = 5;
/// Work to fill a bucket (about 10 ticks for an average hand).
pub const FILL_WORK: i32 = 20;

impl Sim {
    /// The pool cell within [`IRRIGATION_REACH`] of the bed at `i` (a box around it), first in index order.
    fn pool_near(&self, i: usize) -> Option<usize> {
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        for dy in -IRRIGATION_REACH..=IRRIGATION_REACH {
            for dx in -IRRIGATION_REACH..=IRRIGATION_REACH {
                let (nx, ny) = (x + dx, y + dy);
                if nx >= 0 && ny >= 0 && nx < self.width as i32 && ny < self.height as i32 {
                    let j = (ny as u32 * self.width + nx as u32) as usize;
                    if self.elements[j] == Element::Water {
                        return Some(j);
                    }
                }
            }
        }
        None
    }

    /// Whether the bed at cell `i` has a pool within [`IRRIGATION_REACH`] and waters itself.
    pub fn irrigated(&self, i: usize) -> bool {
        self.pool_near(i).is_some()
    }

    fn note_watered(&mut self) {
        if !self.water_noted {
            self.water_noted = true;
            self.push_event(EVENT_WATERED, 0);
        }
    }

    /// Drain beds a little while they grow, and let self-watering ones sip from their pool.
    pub(crate) fn beds_water_tick(&mut self) {
        let due = self.tick % WATER_DRAIN_TICKS == 0;
        for i in 0..self.buildings.len() {
            if self.buildings[i] != Building::MushroomBed {
                self.bed_water[i] = 0;
                continue;
            }
            if !due {
                continue;
            }
            if self.bed_water[i] > 0 && !self.is_warm(i) {
                self.bed_water[i] -= 1;
            }
            if self.bed_water[i] < WATER_MAX {
                if let Some(pool) = self.pool_near(i) {
                    let got = self.take_water(pool, SELF_WATER_SIP.min(WATER_MAX - self.bed_water[i]));
                    self.bed_water[i] += got;
                    if got > 0 {
                        self.note_watered();
                    }
                }
            }
        }
    }

    /// Beds that need a bucket, driest first (then lowest cell).
    pub(crate) fn thirsty_beds(&self) -> Vec<usize> {
        let mut beds: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::MushroomBed && self.bed_water[i] < WATER_LOW && !self.irrigated(i)).collect();
        beds.sort_by_key(|&i| (self.bed_water[i], i));
        beds
    }

    pub(crate) fn any_thirsty_bed(&self) -> bool {
        (0..self.buildings.len()).any(|i| self.buildings[i] == Building::MushroomBed && self.bed_water[i] < WATER_LOW && !self.irrigated(i))
    }

    /// Raise a water errand for the driest bed, at most one per thirsty bed: at
    /// the pool nearest it by walking, else at the nearest tank if the stock can
    /// spare a bucket. Not before day [`WATER_ERRANDS_FROM_DAY`].
    pub(crate) fn raise_water_jobs(&mut self) {
        if self.day() < WATER_ERRANDS_FROM_DAY || self.tick % 20 != 10 {
            return;
        }
        let beds = self.thirsty_beds();
        let carried = self.colonists.iter().filter(|c| c.alive() && matches!(c.carrying, Some((Item::Water, _)))).count();
        let open = self.jobs.iter().filter(|j| j.kind == JobKind::Water).count();
        if beds.is_empty() || open + carried >= beds.len() {
            return;
        }
        let bed = beds[0];
        let field = self.field_from(bed as u32 % self.width, bed as u32 / self.width);
        let target = match self.nearest_pool_in(&field.dist) {
            Some((_, pool)) => Some(pool),
            None => self.containers().into_iter().filter(|&t| field.dist[t] != UNREACHED && self.stock_source_ok(t)).min_by_key(|&t| (field.dist[t], t)),
        };
        if let Some(cell) = target {
            self.add_job(cell as u32 % self.width, cell as u32 / self.width, JobKind::Water);
        }
    }

    /// Carry the bucket to the nearest thirsty bed and tip it in. What the bed
    /// cannot take is carried on to the next, or spilt if none wants it.
    pub(crate) fn deliver_water(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x, self.colonists[c].y);
        let w = self.width as usize;
        let beside = (x.saturating_sub(1)..=(x + 1).min(self.width - 1)).map(|sx| y as usize * w + sx as usize).find(|&b| self.buildings[b] == Building::MushroomBed && self.bed_water[b] < WATER_MAX);
        if let (Some(b), Some((item, amount))) = (beside, self.colonists[c].carrying) {
            let poured = amount.min(WATER_MAX - self.bed_water[b]);
            self.bed_water[b] += poured;
            self.note_watered();
            let col = &mut self.colonists[c];
            col.carrying = (amount > poured).then_some((item, amount - poured));
            col.path.clear();
            col.activity = Activity::Idle;
            return;
        }
        if !self.colonists[c].path.is_empty() {
            if !self.step_along(c) {
                self.colonists[c].path.clear();
            }
            return;
        }
        let field = self.field_from(x, y);
        let best = self.thirsty_beds().into_iter().filter(|&b| field.dist[b] != UNREACHED).min_by_key(|&b| (field.dist[b], b));
        match best {
            Some(to) => {
                let path = self.path_to(&field, to);
                let col = &mut self.colonists[c];
                col.path = path;
                col.activity = Activity::Walking;
            }
            // No bed wants it any more: the water is poured away.
            None => self.drop_load(c),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Rations a lone mushroom bed at `bed_x` grows in two days, with a pool at x = 22 on its row.
    fn rations(bed_x: u32) -> i32 {
        let mut sim = Sim::new(7, 64, 64);
        let y = 55;
        for x in 8..40 {
            for yy in y - 1..=y + 1 {
                let i = sim.idx(x, yy);
                sim.elements[i] = Element::Rock;
            }
            let i = sim.idx(x, y);
            sim.elements[i] = Element::Floor;
        }
        let pool = sim.idx(22, y);
        sim.elements[pool] = Element::Water;
        sim.water[pool] = crate::WATER_FULL;
        let bed = sim.idx(bed_x, y);
        sim.buildings[bed] = Building::MushroomBed;
        sim.food = 0;
        for _ in 0..crate::DAY_TICKS * 2 {
            sim.buildings_tick();
            sim.tick += 1;
        }
        assert!(sim.is_dark(bed) && !sim.is_warm(bed), "the test bed must be out of the firelight");
        sim.food
    }

    #[test]
    fn a_bed_by_water_waters_itself_and_grows_twice_as_fast() {
        let dry = rations(12);
        let wet = rations(20);
        assert_eq!(dry, 6, "a dry bed grows at the normal rate: one ration per cycle");
        assert_eq!(wet, 12, "a bed by a pool grows twice as fast");
    }
}
