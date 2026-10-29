//! Errands the player marks (dig, build) or the colony raises itself (refuel).
//! Survivors claim them, walk to them and work them off.

use crate::haul::Item;
use crate::research::{COKE_FUEL, GRATE_IRON, RESEARCH_PRIORITY, RESEARCH_STINT};
use crate::{Building, Element, Role, Sim};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum JobKind {
    Dig,
    Build(Building),
    /// Carry coal from the stockpile into a hearth.
    Refuel,
    /// Take a building down and put part of its cost back in the stockpile.
    Deconstruct,
    /// Pick up a pile of dug goods and carry it to a stockpile.
    Haul,
    /// A stint of study at a research bench.
    Research,
    /// A batch at a coke oven or smelter.
    Refine,
    /// Fit an iron grate to a hearth.
    Upgrade,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Job {
    pub id: u32,
    pub x: u32,
    pub y: u32,
    pub kind: JobKind,
    pub progress: i32,
    pub created: u64,
    /// Index of the colonist working on it.
    pub claimed_by: Option<u32>,
    /// 1 (whenever) to 9 (drop everything). Survivors take the highest
    /// priority they can reach first, and the nearest among equals.
    pub priority: u8,
}

/// Priority of a fresh order.
pub const DEFAULT_PRIORITY: u8 = 5;
pub const MAX_PRIORITY: u8 = 9;

/// Coal a hearth costs to build.
pub const HEARTH_COST: i32 = 8;
/// Coal a lamp costs to build. It needs no fuel after that.
pub const LAMP_COST: i32 = 2;
/// Coal gained from digging one coal cell.
pub const COAL_PER_CELL: i32 = 4;
pub const HEARTH_CAPACITY: i32 = 40;
/// A job waits this long for someone in its role before anyone may take it.
pub const ROLE_PRIORITY_TICKS: u64 = 100;
/// Firekeepers top up a hearth once its fuel falls below this.
pub const REFUEL_BELOW: i32 = 20;

/// Stone gained from digging one rock cell.
pub const STONE_PER_CELL: i32 = 3;
/// Stone gained from digging one dirt cell: dirt is full of small stones.
pub const STONE_PER_DIRT: i32 = 1;
/// Iron ore gained from digging one ore cell, and crystal from one crystal cell.
pub const ORE_PER_CELL: i32 = 2;
pub const CRYSTAL_PER_CELL: i32 = 1;

/// What a building costs, as (coal, stone). Coal is for anything that burns
/// or glows, stone for everything you stack. Paid when the build finishes.
pub fn build_cost(b: Building) -> (i32, i32) {
    match b {
        Building::Hearth => (HEARTH_COST, 4),
        Building::Lamp => (LAMP_COST, 1),
        Building::Vent => (0, 3),
        Building::Ladder => (0, 1),
        Building::MushroomBed => (0, 2),
        Building::Bed => (0, 3),
        Building::Stockpile => (0, 2),
        Building::ResearchBench => (0, 4),
        Building::CokeOven => (0, 6),
        Building::Smelter => (0, 8),
        Building::CrystalLamp => (0, 1),
        Building::None | Building::Cairn => (0, 0),
    }
}

/// What a building costs in the rarer goods, as (iron, crystal), on top of
/// [`build_cost`].
pub fn rare_cost(b: Building) -> (i32, i32) {
    match b {
        Building::CrystalLamp => (0, 2),
        _ => (0, 0),
    }
}

/// What a building gives back when taken down, as (coal, stone): half its
/// cost, rounded up so a one-stone ladder isn't lost. A hearth also gives back
/// the fuel still in it.
pub fn refund(b: Building) -> (i32, i32) {
    let (coal, stone) = build_cost(b);
    ((coal + 1) / 2, (stone + 1) / 2)
}

/// Whether the player may order `b` taken down. Cairns are memorials the sim
/// places, so they stay.
pub fn removable(b: Building) -> bool {
    !matches!(b, Building::None | Building::Cairn)
}

/// How many cells either side of its own a building's picture reaches. Two
/// buildings on the same row must be further apart than their reaches added up,
/// so they never draw over each other.
pub fn reach(b: Building) -> u32 {
    match b {
        Building::Hearth | Building::MushroomBed | Building::Stockpile | Building::ResearchBench | Building::Smelter => 1,
        _ => 0,
    }
}

impl JobKind {
    pub fn role(self) -> Role {
        match self {
            JobKind::Dig => Role::Digger,
            JobKind::Build(_) => Role::Builder,
            JobKind::Refuel => Role::Firekeeper,
            JobKind::Deconstruct => Role::Builder,
            JobKind::Haul => Role::Hauler,
            JobKind::Research => Role::Researcher,
            JobKind::Refine => Role::Firekeeper,
            JobKind::Upgrade => Role::Builder,
        }
    }

    pub fn code(self) -> u8 {
        match self {
            JobKind::Dig => 0,
            JobKind::Build(_) => 1,
            JobKind::Refuel => 2,
            JobKind::Deconstruct => 3,
            JobKind::Haul => 4,
            JobKind::Research => 5,
            JobKind::Refine => 6,
            JobKind::Upgrade => 7,
        }
    }
}

impl Sim {
    pub(crate) fn add_job(&mut self, x: u32, y: u32, kind: JobKind) {
        // A haul shares its cell with any order: a pile lying there blocks nothing.
        if self.jobs.iter().any(|j| j.x == x && j.y == y && (j.kind == JobKind::Haul) == (kind == JobKind::Haul)) {
            return;
        }
        let id = self.next_job_id;
        self.next_job_id += 1;
        let priority = match kind {
            JobKind::Refuel => self.refuel_priority[self.idx(x, y)],
            JobKind::Research => RESEARCH_PRIORITY,
            // Refining is never urgent: the fires come first.
            JobKind::Refine => DEFAULT_PRIORITY - 1,
            _ => DEFAULT_PRIORITY,
        };
        self.jobs.push(Job { id, x, y, kind, progress: 0, created: self.tick, claimed_by: None, priority });
    }

    pub(crate) fn cancel_job(&mut self, x: u32, y: u32) {
        if let Some(pos) = self.jobs.iter().position(|j| j.x == x && j.y == y && !matches!(j.kind, JobKind::Refuel | JobKind::Haul | JobKind::Research | JobKind::Refine)) {
            let job = self.jobs.remove(pos);
            if let Some(c) = job.claimed_by {
                self.colonists[c as usize].drop_job();
            }
        }
    }

    /// Set the priority of whatever order is on (x, y), refuelling included.
    pub(crate) fn set_priority(&mut self, x: u32, y: u32, priority: u8) {
        let priority = priority.clamp(1, MAX_PRIORITY);
        // A hearth keeps its refuel priority for every errand to come.
        let i = self.idx(x, y);
        if self.buildings[i] == Building::Hearth {
            self.refuel_priority[i] = priority;
        }
        for job in self.jobs.iter_mut().filter(|j| j.x == x && j.y == y) {
            job.priority = priority;
        }
    }

    /// Order the building at (x, y) taken down. A refuel errand on a hearth
    /// gives way to it.
    pub(crate) fn order_deconstruct(&mut self, x: u32, y: u32) {
        if !removable(self.buildings[self.idx(x, y)]) {
            return;
        }
        if let Some(pos) = self.jobs.iter().position(|j| j.x == x && j.y == y && j.kind == JobKind::Refuel) {
            let job = self.jobs.remove(pos);
            if let Some(c) = job.claimed_by {
                self.colonists[c as usize].drop_job();
            }
        }
        self.add_job(x, y, JobKind::Deconstruct);
    }

    /// Whether `b` can go at (x, y): open, empty, and clear of every building
    /// and planned building on the row by their combined [`reach`].
    pub fn room_for(&self, x: u32, y: u32, b: Building) -> bool {
        if self.buildings[self.idx(x, y)] != Building::None || !self.fits(x, y, b) {
            return false;
        }
        let clear = |ox: u32, other: Building| other == Building::None || x.abs_diff(ox) > reach(b) + reach(other);
        let w = self.width;
        let row = (y * w) as usize;
        (0..w).all(|ox| ox == x || clear(ox, self.buildings[row + ox as usize]))
            && self.jobs.iter().all(|j| match j.kind {
                JobKind::Build(other) => j.y != y || (j.x != x && clear(j.x, other)),
                _ => true,
            })
    }

    /// Whether `b`'s whole picture at (x, y) is in open cells and, for all but
    /// a ladder or a vent, stands on solid ground (not water) all the way across.
    pub fn fits(&self, x: u32, y: u32, b: Building) -> bool {
        let r = reach(b) as i32;
        (-r..=r).all(|dx| {
            let (cx, cy) = (x as i32 + dx, y as i32);
            self.open(cx, cy) && (!Self::needs_floor(b) || (cy + 1 < self.height as i32 && self.elements[self.idx(cx as u32, cy as u32 + 1)].is_diggable()))
        })
    }

    /// Whether `b` needs solid floor under it. Ladders hang on their own, and
    /// a vent is bored into the rock wherever the smoke pools, ceilings included.
    pub fn needs_floor(b: Building) -> bool {
        !matches!(b, Building::None | Building::Ladder | Building::Vent)
    }

    /// Whether the cell is the floor under a building, so digging it out would
    /// leave the building floating. Such a dig is refused.
    pub fn holds_up_building(&self, x: u32, y: u32) -> bool {
        self.held_up_by(x, y).is_some()
    }

    /// The column of the building whose floor (x, y) is, if any. Wide
    /// buildings rest on the cells under their whole picture.
    pub fn held_up_by(&self, x: u32, y: u32) -> Option<u32> {
        if y == 0 {
            return None;
        }
        (-1..=1).map(|dx: i32| x as i32 + dx).find(|&ox| {
            ox >= 0 && ox < self.width as i32 && {
                let b = self.buildings[self.idx(ox as u32, y - 1)];
                Self::needs_floor(b) && ox.abs_diff(x as i32) <= reach(b)
            }
        }).map(|ox| ox as u32)
    }

    /// Whether a non-ladder building or planned building at (x, y) has lost
    /// the solid floor it stands on.
    fn unsupported(&self, x: u32, y: u32, b: Building) -> bool {
        Self::needs_floor(b) && (y + 1 >= self.height || self.elements[self.idx(x, y + 1)].is_open())
    }

    /// Buildings whose floor has gone (water drained away, say) fall and break.
    /// What they were made of is salvaged, as if taken down.
    pub(crate) fn collapse_unsupported(&mut self) {
        for i in 0..self.buildings.len() {
            let b = self.buildings[i];
            let (x, y) = (i as u32 % self.width, i as u32 / self.width);
            if b == Building::None || !(self.unsupported(x, y, b) || !self.elements[i].is_open()) {
                continue;
            }
            self.take_down(i);
            if b != Building::Cairn {
                self.push_event(crate::EVENT_COLLAPSE, b as u32);
            }
        }
    }

    /// Remove the building at cell `i` and salvage it into the stockpile.
    fn take_down(&mut self, i: usize) {
        let b = self.buildings[i];
        let (coal, stone) = refund(b);
        let (iron, crystal) = rare_cost(b);
        // Fuel from coke goes back as coke, the rest as coal.
        let clean = self.hearth_clean[i].clamp(0, self.hearth_fuel[i].max(0));
        self.coal += coal + self.hearth_fuel[i].max(0) - clean;
        self.coke += clean / COKE_FUEL;
        self.stone += stone;
        self.iron += (iron + 1) / 2 + if self.hearth_grate[i] { (GRATE_IRON + 1) / 2 } else { 0 };
        self.crystal += (crystal + 1) / 2;
        self.hearth_fuel[i] = 0;
        self.hearth_clean[i] = 0;
        self.hearth_grate[i] = false;
        self.refuel_priority[i] = DEFAULT_PRIORITY;
        self.buildings[i] = Building::None;
    }

    pub(crate) fn job_doable(&self, job: &Job) -> bool {
        let i = self.idx(job.x, job.y);
        match job.kind {
            JobKind::Dig => self.elements[i].is_diggable() && !self.holds_up_building(job.x, job.y),
            JobKind::Build(b) => {
                let (coal, stone) = build_cost(b);
                let (iron, crystal) = rare_cost(b);
                self.buildings[i] == Building::None && self.fits(job.x, job.y, b) && self.coal >= coal && self.stone >= stone && self.iron >= iron && self.crystal >= crystal
            }
            JobKind::Refuel => self.buildings[i] == Building::Hearth && (self.coal > 0 || self.coke > 0),
            JobKind::Deconstruct => removable(self.buildings[i]),
            JobKind::Haul => self.haul_doable(i),
            JobKind::Research => self.buildings[i] == Building::ResearchBench && self.researching.is_some(),
            JobKind::Refine => self.refine_doable(i),
            JobKind::Upgrade => self.buildings[i] == Building::Hearth && !self.hearth_grate[i] && self.iron >= GRATE_IRON,
        }
    }

    pub fn work_needed(&self, job: &Job) -> i32 {
        match job.kind {
            JobKind::Dig => match self.elements[self.idx(job.x, job.y)] {
                Element::Dirt => 60,
                Element::Coal => 90,
                Element::Iron => 160,
                Element::Crystal => 180,
                _ => 140,
            },
            JobKind::Build(Building::Hearth) => 150,
            JobKind::Build(_) => 80,
            JobKind::Refuel => 30,
            JobKind::Deconstruct => match self.buildings[self.idx(job.x, job.y)] {
                Building::Hearth => 75,
                _ => 40,
            },
            // Scooping up a pile; the walk to the stockpile comes after.
            JobKind::Haul => 15,
            JobKind::Research => RESEARCH_STINT,
            JobKind::Refine => 120,
            JobKind::Upgrade => 100,
        }
    }

    pub(crate) fn finish_job(&mut self, job: &Job) {
        let i = self.idx(job.x, job.y);
        match job.kind {
            JobKind::Dig => {
                // What the cell was cut into lands on the floor for a hauler.
                let dropped = match self.elements[i] {
                    Element::Coal => Some((Item::Coal, COAL_PER_CELL)),
                    Element::Rock => Some((Item::Stone, STONE_PER_CELL)),
                    Element::Dirt => Some((Item::Stone, STONE_PER_DIRT)),
                    Element::Iron => Some((Item::Ore, ORE_PER_CELL)),
                    Element::Crystal => Some((Item::Crystal, CRYSTAL_PER_CELL)),
                    _ => None,
                };
                self.elements[i] = Element::Floor;
                if let Some((item, amount)) = dropped {
                    self.drop_pile(i, item, amount);
                }
            }
            JobKind::Build(b) => {
                let (coal, stone) = build_cost(b);
                let (iron, crystal) = rare_cost(b);
                self.coal -= coal;
                self.stone -= stone;
                self.iron -= iron;
                self.crystal -= crystal;
                if b == Building::Hearth {
                    self.hearth_fuel[i] = 10;
                }
                self.buildings[i] = b;
            }
            JobKind::Refuel => {
                // Coke first: it goes twice as far and smokes half as much.
                let coke = self.coke.min((HEARTH_CAPACITY - self.hearth_fuel[i]) / COKE_FUEL).max(0);
                self.coke -= coke;
                self.hearth_fuel[i] += coke * COKE_FUEL;
                self.hearth_clean[i] += coke * COKE_FUEL;
                let amount = self.coal.min(HEARTH_CAPACITY - self.hearth_fuel[i]).max(0);
                self.coal -= amount;
                self.hearth_fuel[i] += amount;
            }
            JobKind::Deconstruct => self.take_down(i),
            // The colonist picks the pile up; see `Sim::pick_up`.
            JobKind::Haul => {}
            JobKind::Research => self.finish_research(RESEARCH_STINT),
            JobKind::Refine => self.finish_refine(i),
            JobKind::Upgrade => {
                self.iron -= GRATE_IRON;
                self.hearth_grate[i] = true;
            }
        }
    }

    /// Raise refuel errands for hungry hearths and drop jobs that no longer apply.
    pub(crate) fn maintain_jobs(&mut self) {
        self.collapse_unsupported();
        self.raise_haul_jobs();
        self.raise_research_jobs();
        if self.coal > 0 || self.coke > 0 {
            for i in 0..self.buildings.len() {
                if self.buildings[i] == Building::Hearth && self.hearth_fuel[i] < REFUEL_BELOW {
                    let (x, y) = (i as u32 % self.width, i as u32 / self.width);
                    self.add_job(x, y, JobKind::Refuel);
                }
            }
        }
        let mut k = 0;
        while k < self.jobs.len() {
            let job = &self.jobs[k];
            let stale = match job.kind {
                JobKind::Dig => !self.elements[self.idx(job.x, job.y)].is_diggable(),
                // Ground dug out from under a planned building drops the plan.
                JobKind::Build(b) => self.buildings[self.idx(job.x, job.y)] != Building::None || !self.fits(job.x, job.y, b),
                JobKind::Refuel => self.buildings[self.idx(job.x, job.y)] != Building::Hearth,
                JobKind::Deconstruct => !removable(self.buildings[self.idx(job.x, job.y)]),
                JobKind::Haul => self.pile_amount[self.idx(job.x, job.y)] <= 0,
                JobKind::Research => self.buildings[self.idx(job.x, job.y)] != Building::ResearchBench || self.researching.is_none(),
                // Left alone once started, so a batch isn't lost to a stock tick.
                JobKind::Refine => job.claimed_by.is_none() && !self.refine_doable(self.idx(job.x, job.y)),
                JobKind::Upgrade => self.buildings[self.idx(job.x, job.y)] != Building::Hearth || self.hearth_grate[self.idx(job.x, job.y)],
            };
            if stale {
                let job = self.jobs.remove(k);
                if let Some(c) = job.claimed_by {
                    self.colonists[c as usize].drop_job();
                }
            } else {
                k += 1;
            }
        }
    }
}
