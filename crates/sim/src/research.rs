//! Research and refining. A survivor at a research bench studies whatever
//! the player picked; each finished study unlocks a building or an upgrade.
//! The first branch is all about the fire: coke that burns longer and
//! cleaner, an iron grate that makes a hearth go further, and a crystal lamp.
//!
//! Refineries run themselves, within limits: each keeps a modest stock of
//! what it makes and never eats into the coal the fires need.

use crate::jobs::JobKind;
use crate::{Building, Sim};

/// Something to research. The number is its bit in [`Sim::known`].
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tech {
    /// Unlocks the coke oven.
    Coking = 0,
    /// Unlocks the smelter.
    Smelting = 1,
    /// Lets a hearth be fitted with an iron grate.
    HearthGrate = 2,
    /// Unlocks the crystal lamp.
    CrystalLens = 3,
}

pub const TECHS: [Tech; 4] = [Tech::Coking, Tech::Smelting, Tech::HearthGrate, Tech::CrystalLens];

impl Tech {
    pub fn from_u8(v: u8) -> Option<Tech> {
        TECHS.get(v as usize).copied()
    }

    /// Study it takes, in work points (a survivor at the bench adds 2 or 3 a tick).
    pub fn cost(self) -> i32 {
        match self {
            Tech::Coking => 900,
            Tech::Smelting => 1200,
            Tech::HearthGrate => 1500,
            Tech::CrystalLens => 1400,
        }
    }

    /// What must be known first.
    pub fn needs(self) -> Option<Tech> {
        match self {
            Tech::Coking | Tech::Smelting => None,
            Tech::HearthGrate => Some(Tech::Smelting),
            Tech::CrystalLens => Some(Tech::Coking),
        }
    }
}

/// Work points one stint at the bench is worth before the survivor gets up.
pub const RESEARCH_STINT: i32 = 120;
/// Research is new to the colony, so it starts below other orders.
pub const RESEARCH_PRIORITY: u8 = 3;
/// Refineries leave at least this much coal for the fires.
pub const COAL_RESERVE: i32 = 16;
/// A coke oven turns this much coal into [`COKE_MADE`] coke.
pub const COKE_COAL: i32 = 3;
pub const COKE_MADE: i32 = 2;
/// Coke ovens stop once the colony holds this much coke.
pub const COKE_KEEP: i32 = 20;
/// A smelter turns this much ore and one coal into one iron.
pub const SMELT_ORE: i32 = 2;
/// Smelters stop once the colony holds this much iron.
pub const IRON_KEEP: i32 = 10;
/// Iron an iron grate costs.
pub const GRATE_IRON: i32 = 3;
/// Fuel units one piece of coke gives a hearth (coal gives one).
pub const COKE_FUEL: i32 = 2;
/// A grated hearth burns a fuel unit this often instead of every `HEARTH_BURN_TICKS`.
pub const GRATE_BURN_TICKS: u64 = 60;
/// A grated hearth's light and warmth reach this much further.
pub const GRATE_RADIUS: i32 = 2;

impl Sim {
    pub fn knows(&self, t: Tech) -> bool {
        self.known & (1 << t as u32) != 0
    }

    /// Whether `t` can be picked for study now.
    pub fn can_research(&self, t: Tech) -> bool {
        !self.knows(t) && t.needs().map_or(true, |n| self.knows(n))
    }

    /// Whether the colony knows how to build `b`.
    pub fn unlocked(&self, b: Building) -> bool {
        match b {
            Building::CokeOven => self.knows(Tech::Coking),
            Building::Smelter => self.knows(Tech::Smelting),
            Building::CrystalLamp => self.knows(Tech::CrystalLens),
            _ => true,
        }
    }

    pub(crate) fn set_research(&mut self, tech: Option<Tech>) {
        match tech {
            Some(t) if self.can_research(t) => self.researching = Some(t),
            None => self.researching = None,
            _ => {}
        }
    }

    /// Order an iron grate fitted to the hearth at (x, y).
    pub(crate) fn order_upgrade(&mut self, x: u32, y: u32) {
        let i = self.idx(x, y);
        if self.knows(Tech::HearthGrate) && self.buildings[i] == Building::Hearth && !self.hearth_grate[i] {
            // The refuel errand waits: the fire is half taken apart.
            if let Some(pos) = self.jobs.iter().position(|j| j.x == x && j.y == y && j.kind == JobKind::Refuel && j.claimed_by.is_none()) {
                self.jobs.remove(pos);
            }
            self.add_job(x, y, JobKind::Upgrade);
        }
    }

    /// Whether the refinery at cell `i` has something to do.
    pub(crate) fn refine_doable(&self, i: usize) -> bool {
        match self.buildings[i] {
            Building::CokeOven => self.coal >= COAL_RESERVE + COKE_COAL && self.coke < COKE_KEEP,
            Building::Smelter => self.ore >= SMELT_ORE && self.coal > COAL_RESERVE && self.iron < IRON_KEEP,
            _ => false,
        }
    }

    pub(crate) fn finish_refine(&mut self, i: usize) {
        if !self.refine_doable(i) {
            return;
        }
        match self.buildings[i] {
            Building::CokeOven => {
                self.coal -= COKE_COAL;
                self.coke += COKE_MADE;
            }
            Building::Smelter => {
                self.ore -= SMELT_ORE;
                self.coal -= 1;
                self.iron += 1;
            }
            _ => {}
        }
    }

    /// A stint at the bench is over: bank it, and learn the tech once it is paid for.
    pub(crate) fn finish_research(&mut self, points: i32) {
        let Some(t) = self.researching else { return };
        let k = t as usize;
        self.research_points[k] += points;
        if self.research_points[k] >= t.cost() {
            self.known |= 1 << t as u32;
            self.researching = None;
            self.push_event(crate::EVENT_RESEARCH, t as u32);
        }
    }

    /// Raise a study errand at the first bench while something is picked, and
    /// a refining errand at every refinery with work to do.
    pub(crate) fn raise_research_jobs(&mut self) {
        let bench = self.researching.is_some().then(|| self.buildings.iter().position(|&b| b == Building::ResearchBench)).flatten();
        if let Some(i) = bench {
            let (x, y) = (i as u32 % self.width, i as u32 / self.width);
            if !self.jobs.iter().any(|j| j.kind == JobKind::Research) {
                self.add_job(x, y, JobKind::Research);
            }
        }
        for i in 0..self.buildings.len() {
            if matches!(self.buildings[i], Building::CokeOven | Building::Smelter) && self.refine_doable(i) {
                self.add_job(i as u32 % self.width, i as u32 / self.width, JobKind::Refine);
            }
        }
    }
}
