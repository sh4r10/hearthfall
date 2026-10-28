//! Errands the player marks (dig, build) or the colony raises itself (refuel).
//! Survivors claim them, walk to them and work them off.

use crate::{Building, Element, Role, Sim};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum JobKind {
    Dig,
    Build(Building),
    /// Carry coal from the stockpile into a hearth.
    Refuel,
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

/// Coal a building costs to build.
pub fn build_cost(b: Building) -> i32 {
    match b {
        Building::Hearth => HEARTH_COST,
        Building::Lamp => LAMP_COST,
        _ => 0,
    }
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
        }
    }

    pub fn code(self) -> u8 {
        match self {
            JobKind::Dig => 0,
            JobKind::Build(_) => 1,
            JobKind::Refuel => 2,
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

    /// Whether the job still makes sense and its materials are available.
    /// Whether `b` can go at (x, y): open, empty, and clear of every building
    /// and planned building on the row by their combined [`reach`].
    pub fn room_for(&self, x: u32, y: u32, b: Building) -> bool {
        let i = self.idx(x, y);
        if !self.elements[i].is_open() || self.buildings[i] != Building::None {
            return false;
        }
        // Everything but a ladder stands on solid floor.
        if b != Building::Ladder && (y + 1 >= self.height || self.elements[self.idx(x, y + 1)].is_open()) {
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

    /// Whether the cell is the floor under a building (ladders need none), so
    /// digging it out would leave the building floating.
    pub fn holds_up_building(&self, x: u32, y: u32) -> bool {
        y > 0 && !matches!(self.buildings[self.idx(x, y - 1)], Building::None | Building::Ladder)
    }

    pub(crate) fn job_doable(&self, job: &Job) -> bool {
        let i = self.idx(job.x, job.y);
        match job.kind {
            JobKind::Dig => self.elements[i].is_diggable() && !self.holds_up_building(job.x, job.y),
            JobKind::Build(b) => {
                self.elements[i].is_open() && self.buildings[i] == Building::None && self.coal >= build_cost(b)
            }
            JobKind::Refuel => self.buildings[i] == Building::Hearth && self.coal > 0,
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
        }
    }

    pub(crate) fn finish_job(&mut self, job: &Job) {
        let i = self.idx(job.x, job.y);
        match job.kind {
            JobKind::Dig => {
                if self.elements[i] == Element::Coal {
                    self.coal += COAL_PER_CELL;
                }
                self.elements[i] = Element::Floor;
            }
            JobKind::Build(b) => {
                self.coal -= build_cost(b);
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
        }
    }

    /// Raise refuel errands for hungry hearths and drop jobs that no longer apply.
    pub(crate) fn maintain_jobs(&mut self) {
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
                JobKind::Build(_) => {
                    let i = self.idx(job.x, job.y);
                    !self.elements[i].is_open() || self.buildings[i] != Building::None
                }
                JobKind::Refuel => self.buildings[self.idx(job.x, job.y)] != Building::Hearth,
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
