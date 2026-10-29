//! Drinking water: the colony's stock, where it is kept, how it is fetched and
//! how survivors drink it.
//!
//! The stock lives in tanks: the start cave's water barrel and any cisterns the
//! player builds, each holding up to its capacity (`water_store`, per cell;
//! `water_stock` is their sum). A survivor drinks 10 units from the nearest
//! tank, or failing that from the edge of a pool. When the tanks have room and
//! a pool can be reached a hauler fills a bucket (up to 100 units, really taken
//! out of the pool with `take_water`) and carries it to the nearest tank with
//! room. Water that is spilt on the way (a dropped load, a tank taken down)
//! is counted in `water_spilled`, so pool loss = stock gain + spill.

use crate::haul::Item;
use crate::jobs::JobKind;
use crate::nav::{Field, UNREACHED};
use crate::{Activity, Building, Element, Sim, DAY_TICKS, STAT_MAX, WATER_WET};

/// Water a full bucket holds.
pub const BUCKET: i32 = 100;
/// Stock one drink uses.
pub const DRINK_UNITS: i32 = 10;
/// Thirst a full drink (10 units) restores.
pub const DRINK: i32 = 6_000;
/// Thirst lost per tick: with [`DRINK`] that is one drink a day.
pub const THIRST_DRAIN: i32 = 5;
/// Ticks a drink takes.
pub const DRINK_TICKS: u32 = 20;
/// Starting thirst: a little under full, so the first drink comes late on day 1.
pub const START_THIRST: i32 = STAT_MAX * 85 / 100;
/// Water in the barrel at the start (three days for the first two survivors), and what it holds at most.
pub const START_WATER: i32 = 60;
pub const BARREL_CAPACITY: i32 = 60;
/// What one cistern adds to the colony's capacity.
pub const CISTERN_CAPACITY: i32 = 60;
/// Fetching and watering errands begin on this day: the barrel carries the first days.
pub const WATER_ERRANDS_FROM_DAY: u64 = 2;
/// A fetch errand is raised once the tanks have this much room.
pub const FETCH_ROOM: i32 = 30;
/// A thirsty survivor walks at most this many steps to water.
pub const DRINK_REACH: i32 = 40;
/// Beds are watered from the stock only when it holds this much more than two days of drinking.
pub const BED_STOCK_MIN: i32 = 50;
/// A parched survivor (thirst 0) collapses after a full day of it, and never before this day.
pub const COLLAPSE_FROM_DAY: u64 = 4;

/// What a tank holds at most; 0 for anything else.
pub fn container_capacity(b: Building) -> i32 {
    match b {
        Building::WaterBarrel => BARREL_CAPACITY,
        Building::Cistern => CISTERN_CAPACITY,
        _ => 0,
    }
}

impl Sim {
    /// Cells holding a tank, in index order.
    pub(crate) fn containers(&self) -> Vec<usize> {
        (0..self.buildings.len()).filter(|&i| container_capacity(self.buildings[i]) > 0).collect()
    }

    /// Total capacity of all tanks.
    pub fn water_capacity(&self) -> i32 {
        self.buildings.iter().map(|&b| container_capacity(b)).sum()
    }

    /// Stock held in cisterns only (the barrel's share is not counted).
    pub fn cistern_water(&self) -> i32 {
        (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::Cistern).map(|i| self.water_store[i]).sum()
    }

    /// How much more the tank at cell `i` holds.
    pub(crate) fn tank_room(&self, i: usize) -> i32 {
        (container_capacity(self.buildings[i]) - self.water_store[i]).max(0)
    }

    pub fn water_room(&self) -> i32 {
        (0..self.buildings.len()).map(|i| self.tank_room(i)).sum()
    }

    /// What the living drink in a day, in stock units.
    pub fn water_per_day(&self) -> i32 {
        self.alive_colonists() as i32 * DRINK_UNITS
    }

    /// Pour up to `amount` into the tank at `i`; returns what fitted.
    pub(crate) fn store_add(&mut self, i: usize, amount: i32) -> i32 {
        let added = amount.clamp(0, self.tank_room(i));
        self.water_store[i] += added;
        self.water_stock += added;
        added
    }

    /// Draw up to `amount` from the tank at `i`; returns what came out.
    pub(crate) fn store_take(&mut self, i: usize, amount: i32) -> i32 {
        let taken = amount.clamp(0, self.water_store[i]);
        self.water_store[i] -= taken;
        self.water_stock -= taken;
        taken
    }

    /// A tank is gone: what it held is spilt.
    pub(crate) fn empty_store(&mut self, i: usize) {
        let lost = self.store_take(i, self.water_store[i]);
        self.water_spilled += lost as i64;
    }

    fn is_tank(&self, i: usize) -> bool {
        container_capacity(self.buildings[i]) > 0
    }

    /// Whether a lit-enough, open, supported cell beside `(x, y)` (or at it) can be reached; the nearest one by `dist`.
    fn reachable_stand(&self, dist: &[i32], x: i32, y: i32) -> Option<usize> {
        let mut best: Option<usize> = None;
        for dy in -1..=1 {
            for dx in -1..=1 {
                let (sx, sy) = (x + dx, y + dy);
                if !self.open(sx, sy) || !self.supported(sx, sy) {
                    continue;
                }
                let s = self.idx(sx as u32, sy as u32);
                if dist[s] != UNREACHED && best.map_or(true, |b| dist[s] < dist[b]) {
                    best = Some(s);
                }
            }
        }
        best
    }

    /// The pool cell with the shortest walk to a cell beside it, from a field of walking distances, with that distance.
    pub(crate) fn nearest_pool_in(&self, dist: &[i32]) -> Option<(i32, usize)> {
        let w = self.width as usize;
        let mut best: Option<(i32, usize)> = None;
        for j in 0..self.elements.len() {
            if self.elements[j] != Element::Water || self.water[j] < WATER_WET {
                continue;
            }
            if let Some(s) = self.reachable_stand(dist, (j % w) as i32, (j / w) as i32) {
                if best.map_or(true, |b| (dist[s], j) < b) {
                    best = Some((dist[s], j));
                }
            }
        }
        best
    }

    // --- Fetching buckets for the stock -------------------------------------------------

    /// Whether a fetch errand at pool cell `i` still makes sense.
    pub(crate) fn fetch_valid(&self, i: usize) -> bool {
        self.elements[i] == Element::Water && self.water_room() > 0
    }

    pub(crate) fn fetch_doable(&self, i: usize) -> bool {
        self.fetch_valid(i) && !(self.is_curfew() && self.is_dark(i))
    }

    /// When the tanks have room and a pool is within reach of one, raise a
    /// fetch errand at the pool nearest a tank with room. One at a time.
    pub(crate) fn raise_fetch_jobs(&mut self) {
        if self.day() < WATER_ERRANDS_FROM_DAY || self.tick % 20 != 0 || self.water_room() < FETCH_ROOM {
            return;
        }
        if self.jobs.iter().any(|j| j.kind == JobKind::Fetch) || self.colonists.iter().any(|c| c.alive() && matches!(c.carrying, Some((Item::StockWater, _)))) {
            return;
        }
        let mut best: Option<(i32, usize)> = None;
        for t in self.containers() {
            if self.tank_room(t) == 0 {
                continue;
            }
            let field = self.field_from(t as u32 % self.width, t as u32 / self.width);
            if let Some(found) = self.nearest_pool_in(&field.dist) {
                if best.map_or(true, |b| found < b) {
                    best = Some(found);
                }
            }
        }
        if let Some((_, pool)) = best {
            self.add_job(pool as u32 % self.width, pool as u32 / self.width, JobKind::Fetch);
        }
    }

    // --- Bed errands that may draw on the stock --------------------------------------

    /// Stock above two days of drinking for the living (at least 20): what can go to the beds.
    pub fn stock_surplus(&self) -> i32 {
        self.water_stock - (2 * self.water_per_day()).max(20)
    }

    /// Whether the tank at `i` can fill a bucket for a bed.
    pub(crate) fn stock_source_ok(&self, i: usize) -> bool {
        self.is_tank(i) && self.water_store[i] > 0 && self.stock_surplus() >= BED_STOCK_MIN
    }

    pub(crate) fn water_errand_valid(&self, i: usize) -> bool {
        self.any_thirsty_bed() && (self.elements[i] == Element::Water || self.stock_source_ok(i))
    }

    pub(crate) fn water_errand_doable(&self, i: usize) -> bool {
        self.water_errand_valid(i) && !(self.is_curfew() && self.is_dark(i))
    }

    /// The bucket is full at job cell `i`: the survivor now carries it. A bed
    /// bucket holds no more than the driest bed wants, a stock bucket no more
    /// than the tanks have room for. Pools are drained of exactly what is carried.
    pub(crate) fn fill_bucket(&mut self, c: usize, i: usize, job: JobKind) {
        let load = if job == JobKind::Fetch {
            let amount = BUCKET.min(self.water_room());
            let got = self.take_water(i, amount);
            (Item::StockWater, got)
        } else {
            let want = self.thirsty_beds().first().map_or(0, |&b| crate::farm::WATER_MAX - self.bed_water[b]).min(BUCKET);
            let got = if self.elements[i] == Element::Water {
                self.take_water(i, want)
            } else {
                self.store_take(i, want.min(self.stock_surplus().max(0)))
            };
            (Item::Water, got)
        };
        let col = &mut self.colonists[c];
        col.carrying = (load.1 > 0).then_some(load);
        col.path.clear();
    }

    /// Carry the bucket to the nearest tank with room and pour it in; what
    /// does not fit goes to the next tank, and is spilt if none has room.
    pub(crate) fn deliver_stock(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x, self.colonists[c].y);
        let w = self.width as usize;
        let beside = (x.saturating_sub(1)..=(x + 1).min(self.width - 1)).map(|sx| y as usize * w + sx as usize).find(|&t| self.is_tank(t) && self.tank_room(t) > 0);
        if let (Some(t), Some((item, amount))) = (beside, self.colonists[c].carrying) {
            let added = self.store_add(t, amount);
            let col = &mut self.colonists[c];
            col.carrying = (amount > added).then_some((item, amount - added));
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
        let best = (0..self.buildings.len()).filter(|&t| self.is_tank(t) && self.tank_room(t) > 0 && field.dist[t] != UNREACHED).min_by_key(|&t| (field.dist[t], t));
        match best {
            Some(to) => {
                let path = self.path_to(&field, to);
                let col = &mut self.colonists[c];
                col.path = path;
                col.activity = Activity::Walking;
            }
            None => self.drop_load(c),
        }
    }

    // --- Drinking ---------------------------------------------------------------------

    /// A thirsty survivor goes for a drink: to the nearest tank with water, else to the
    /// edge of the nearest pool (never into the dark after dusk). Drops their errand
    /// only if there is somewhere to go. Returns whether they are on their way (or drinking).
    pub(crate) fn seek_drink(&mut self, c: usize) -> bool {
        let col = &self.colonists[c];
        let field = self.field_from(col.x, col.y);
        let tank = (0..self.buildings.len())
            .filter(|&t| self.is_tank(t) && self.water_store[t] > 0 && field.dist[t] != UNREACHED && field.dist[t] <= DRINK_REACH)
            .min_by_key(|&t| (field.dist[t], t));
        let target = tank.or_else(|| self.pool_edge(&field));
        let Some(to) = target else { return false };
        let path = self.path_to(&field, to);
        self.release_job(c);
        let col = &mut self.colonists[c];
        col.path = path;
        col.heading = crate::HEADING_DRINK;
        col.timer = 0;
        col.activity = Activity::Walking;
        if col.path.is_empty() {
            col.heading = crate::HEADING_NONE;
            if !self.begin_drink(c) {
                self.colonists[c].activity = Activity::Idle;
            }
        }
        true
    }

    /// The nearest cell beside a pool that someone may drink at now, within [`DRINK_REACH`].
    fn pool_edge(&self, field: &Field) -> Option<usize> {
        let w = self.width as usize;
        let night = self.is_curfew();
        let mut best: Option<(i32, usize)> = None;
        for j in 0..self.elements.len() {
            if self.elements[j] != Element::Water || self.water[j] < crate::WATER_FULL / 10 {
                continue;
            }
            let (px, py) = ((j % w) as i32, (j / w) as i32);
            for dy in -1..=1 {
                for dx in -1..=1 {
                    let (sx, sy) = (px + dx, py + dy);
                    if !self.open(sx, sy) || !self.supported(sx, sy) {
                        continue;
                    }
                    let s = self.idx(sx as u32, sy as u32);
                    if field.dist[s] == UNREACHED || field.dist[s] > DRINK_REACH || (night && self.is_dark(s)) {
                        continue;
                    }
                    if best.map_or(true, |b| (field.dist[s], s) < b) {
                        best = Some((field.dist[s], s));
                    }
                }
            }
        }
        best.map(|(_, s)| s)
    }

    /// Arrived at water: take a drink from a tank beside them, else from a pool beside them.
    /// Returns whether they started drinking.
    pub(crate) fn begin_drink(&mut self, c: usize) -> bool {
        let (x, y) = (self.colonists[c].x as i32, self.colonists[c].y as i32);
        let w = self.width as i32;
        let mut got = 0;
        for sx in (x - 1).max(0)..=(x + 1).min(w - 1) {
            let t = (y * w + sx) as usize;
            if self.is_tank(t) && self.water_store[t] > 0 {
                got = self.store_take(t, DRINK_UNITS);
                break;
            }
        }
        if got == 0 {
            'pool: for dy in -1..=1 {
                for dx in -1..=1 {
                    let (px, py) = (x + dx, y + dy);
                    if px < 0 || py < 0 || px >= w || py >= self.height as i32 {
                        continue;
                    }
                    let j = (py * w + px) as usize;
                    if self.elements[j] == Element::Water {
                        got = self.take_water(j, DRINK_UNITS);
                        break 'pool;
                    }
                }
            }
        }
        if got == 0 {
            return false;
        }
        let col = &mut self.colonists[c];
        col.thirst = (col.thirst + DRINK * got / DRINK_UNITS).min(STAT_MAX);
        col.activity = Activity::Drinking;
        col.timer = 0;
        col.path.clear();
        true
    }

    /// Whether a survivor who has been parched this long collapses on the current day.
    pub(crate) fn thirst_collapse(&self, parched: u32) -> bool {
        parched as u64 >= DAY_TICKS && self.day() >= COLLAPSE_FROM_DAY
    }
}
