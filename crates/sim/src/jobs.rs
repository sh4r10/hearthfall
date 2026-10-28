//! Errands the player marks (dig, build) or the colony raises itself (refuel).
//! Survivors claim them, walk to them and work them off.

use crate::{Building, Element, Role, Sim};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum JobKind {
    Dig,
    Build(Building),
    /// Carry coal from the stockpile into a hearth.
    Refuel,
    /// Take a building down and put part of its cost back in the stockpile.
    Deconstruct,
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
}

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

/// What a building costs, as (coal, stone). Coal is for anything that burns
/// or glows, stone for everything you stack. Paid when the build finishes.
pub fn build_cost(b: Building) -> (i32, i32) {
    match b {
        Building::Hearth => (HEARTH_COST, 4),
        Building::Lamp => (LAMP_COST, 1),
        Building::Ladder => (0, 1),
        Building::MushroomBed => (0, 2),
        Building::Bed => (0, 3),
        Building::OxygenDiffuser => (2, 6),
        Building::None | Building::Cairn => (0, 0),
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
        Building::Hearth | Building::MushroomBed => 1,
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
        }
    }

    pub fn code(self) -> u8 {
        match self {
            JobKind::Dig => 0,
            JobKind::Build(_) => 1,
            JobKind::Refuel => 2,
            JobKind::Deconstruct => 3,
        }
    }
}

impl Sim {
    pub(crate) fn add_job(&mut self, x: u32, y: u32, kind: JobKind) {
        if self.jobs.iter().any(|j| j.x == x && j.y == y) {
            return;
        }
        let id = self.next_job_id;
        self.next_job_id += 1;
        self.jobs.push(Job { id, x, y, kind, progress: 0, created: self.tick, claimed_by: None });
    }

    pub(crate) fn cancel_job(&mut self, x: u32, y: u32) {
        if let Some(pos) = self.jobs.iter().position(|j| j.x == x && j.y == y && j.kind != JobKind::Refuel) {
            let job = self.jobs.remove(pos);
            if let Some(c) = job.claimed_by {
                self.colonists[c as usize].drop_job();
            }
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
    /// a ladder, stands on solid ground (not water) all the way across.
    pub fn fits(&self, x: u32, y: u32, b: Building) -> bool {
        let r = reach(b) as i32;
        (-r..=r).all(|dx| {
            let (cx, cy) = (x as i32 + dx, y as i32);
            self.open(cx, cy) && (b == Building::Ladder || (cy + 1 < self.height as i32 && self.elements[self.idx(cx as u32, cy as u32 + 1)].is_diggable()))
        })
    }

    /// Whether `b` needs solid floor under it. Ladders hang on their own.
    pub fn needs_floor(b: Building) -> bool {
        !matches!(b, Building::None | Building::Ladder)
    }

    /// Whether the cell is the floor under a building, so digging it out would
    /// leave the building floating. Such a dig waits until the building is down.
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
        let (coal, stone) = refund(self.buildings[i]);
        self.coal += coal + self.hearth_fuel[i].max(0);
        self.stone += stone;
        self.hearth_fuel[i] = 0;
        self.buildings[i] = Building::None;
    }

    pub(crate) fn job_doable(&self, job: &Job) -> bool {
        let i = self.idx(job.x, job.y);
        match job.kind {
            JobKind::Dig => self.elements[i].is_diggable() && !self.holds_up_building(job.x, job.y),
            JobKind::Build(b) => {
                let (coal, stone) = build_cost(b);
                self.buildings[i] == Building::None && self.fits(job.x, job.y, b) && self.coal >= coal && self.stone >= stone
            }
            JobKind::Refuel => self.buildings[i] == Building::Hearth && self.coal > 0,
            JobKind::Deconstruct => removable(self.buildings[i]),
        }
    }

    pub fn work_needed(&self, job: &Job) -> i32 {
        match job.kind {
            JobKind::Dig => match self.elements[self.idx(job.x, job.y)] {
                Element::Dirt => 60,
                Element::Coal => 90,
                _ => 140,
            },
            JobKind::Build(Building::Hearth) => 150,
            JobKind::Build(_) => 80,
            JobKind::Refuel => 30,
            JobKind::Deconstruct => match self.buildings[self.idx(job.x, job.y)] {
                Building::Hearth => 75,
                _ => 40,
            },
        }
    }

    pub(crate) fn finish_job(&mut self, job: &Job) {
        let i = self.idx(job.x, job.y);
        match job.kind {
            JobKind::Dig => {
                match self.elements[i] {
                    Element::Coal => self.coal += COAL_PER_CELL,
                    Element::Rock => self.stone += STONE_PER_CELL,
                    Element::Dirt => self.stone += STONE_PER_DIRT,
                    _ => {}
                }
                self.elements[i] = Element::Floor;
                // Rock holds air in its pores: a fresh cut breathes, so a shaft
                // isn't a vacuum that stale air rushes into.
                self.oxygen[i] = crate::START_OXYGEN_MG;
            }
            JobKind::Build(b) => {
                let (coal, stone) = build_cost(b);
                self.coal -= coal;
                self.stone -= stone;
                if b == Building::Hearth {
                    self.hearth_fuel[i] = 10;
                }
                self.buildings[i] = b;
            }
            JobKind::Refuel => {
                let amount = self.coal.min(HEARTH_CAPACITY - self.hearth_fuel[i]).max(0);
                self.coal -= amount;
                self.hearth_fuel[i] += amount;
            }
            JobKind::Deconstruct => self.take_down(i),
        }
    }

    /// Raise refuel errands for hungry hearths and drop jobs that no longer apply.
    pub(crate) fn maintain_jobs(&mut self) {
        self.collapse_unsupported();
        if self.coal > 0 {
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
