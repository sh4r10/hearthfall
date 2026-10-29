//! Water for the mushroom beds. A bed holds a water level; a watered bed grows
//! twice as fast, a dry one still grows at the normal rate, so water is a bonus
//! and never a requirement. A bed beside a pool waters itself; any other bed
//! that runs low raises a [`JobKind::Water`] errand: a survivor fills a bucket
//! at the nearest pool and carries it over. Water is never used up: pools do
//! not drain, however many beds drink from them.

use crate::haul::Item;
use crate::jobs::JobKind;
use crate::nav::UNREACHED;
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
/// Pools further than this (cells either way) from a bed aren't worth the walk.
pub const WATER_FETCH_REACH: i32 = 24;
/// Work to fill a bucket (about 10 ticks for an average hand).
pub const FILL_WORK: i32 = 20;

impl Sim {
    /// Whether the bed at cell `i` has a pool within [`IRRIGATION_REACH`] (a box around it).
    pub fn irrigated(&self, i: usize) -> bool {
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        (-IRRIGATION_REACH..=IRRIGATION_REACH).any(|dy| {
            (-IRRIGATION_REACH..=IRRIGATION_REACH).any(|dx| {
                let (nx, ny) = (x + dx, y + dy);
                nx >= 0 && ny >= 0 && nx < self.width as i32 && ny < self.height as i32 && self.elements[(ny as u32 * self.width + nx as u32) as usize] == Element::Water
            })
        })
    }

    fn note_watered(&mut self) {
        if !self.water_noted {
            self.water_noted = true;
            self.push_event(EVENT_WATERED, 0);
        }
    }

    /// Fill self-watering beds and drain the rest a little while they grow.
    pub(crate) fn beds_water_tick(&mut self) {
        for i in 0..self.buildings.len() {
            if self.buildings[i] != Building::MushroomBed {
                self.bed_water[i] = 0;
                continue;
            }
            if self.irrigated(i) {
                self.bed_water[i] = WATER_MAX;
                self.note_watered();
            } else if self.bed_water[i] > 0 && self.tick % WATER_DRAIN_TICKS == 0 && !self.is_warm(i) {
                self.bed_water[i] -= 1;
            }
        }
    }

    /// Beds that need a bucket, driest first (then lowest cell).
    fn thirsty_beds(&self) -> Vec<usize> {
        let mut beds: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::MushroomBed && self.bed_water[i] < WATER_LOW && !self.irrigated(i)).collect();
        beds.sort_by_key(|&i| (self.bed_water[i], i));
        beds
    }

    pub(crate) fn any_thirsty_bed(&self) -> bool {
        (0..self.buildings.len()).any(|i| self.buildings[i] == Building::MushroomBed && self.bed_water[i] < WATER_LOW && !self.irrigated(i))
    }

    /// The pool cell nearest cell `i` (within [`WATER_FETCH_REACH`]) with open floor beside it.
    fn nearest_pool(&self, i: usize) -> Option<usize> {
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        let mut best: Option<((i32, usize), usize)> = None;
        for ny in (y - WATER_FETCH_REACH).max(0)..=(y + WATER_FETCH_REACH).min(self.height as i32 - 1) {
            for nx in (x - WATER_FETCH_REACH).max(0)..=(x + WATER_FETCH_REACH).min(self.width as i32 - 1) {
                let j = (ny as u32 * self.width + nx as u32) as usize;
                if self.elements[j] != Element::Water || !(-1..=1).any(|dy| (-1..=1).any(|dx| self.open(nx + dx, ny + dy))) {
                    continue;
                }
                let key = ((nx - x) * (nx - x) + (ny - y) * (ny - y), j);
                if best.map_or(true, |(k, _)| key < k) {
                    best = Some((key, j));
                }
            }
        }
        best.map(|(_, j)| j)
    }

    /// Raise a water errand at the pool nearest the driest bed, at most one per thirsty bed.
    pub(crate) fn raise_water_jobs(&mut self) {
        let beds = self.thirsty_beds();
        let carried = self.colonists.iter().filter(|c| c.alive() && matches!(c.carrying, Some((Item::Water, _)))).count();
        let open = self.jobs.iter().filter(|j| j.kind == JobKind::Water).count();
        if beds.is_empty() || open + carried >= beds.len() {
            return;
        }
        if let Some(pool) = self.nearest_pool(beds[0]) {
            self.add_job(pool as u32 % self.width, pool as u32 / self.width, JobKind::Water);
        }
    }

    /// The bucket is full: the survivor now carries it (see [`Sim::deliver_water`]).
    pub(crate) fn fill_bucket(&mut self, c: usize) {
        let col = &mut self.colonists[c];
        col.carrying = Some((Item::Water, WATER_MAX));
        col.path.clear();
    }

    /// Carry the bucket to the nearest thirsty bed and tip it in.
    pub(crate) fn deliver_water(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x, self.colonists[c].y);
        let w = self.width as usize;
        let beside = (x.saturating_sub(1)..=(x + 1).min(self.width - 1)).map(|sx| y as usize * w + sx as usize).find(|&b| self.buildings[b] == Building::MushroomBed && self.bed_water[b] < WATER_MAX);
        if let Some(b) = beside {
            self.bed_water[b] = WATER_MAX;
            self.note_watered();
            let col = &mut self.colonists[c];
            col.carrying = None;
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
