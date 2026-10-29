//! Why an order is stuck, so the player can be told instead of left waiting.
//!
//! Nothing here changes state: it is a read-only report the client asks for
//! now and then, so it stays out of `state_hash`.

use crate::jobs::{build_cost, rare_cost, JobKind};
use crate::research::GRATE_IRON;
use crate::nav::UNREACHED;
use crate::Sim;

/// Not stuck: being worked, or just waiting its turn.
pub const BLOCK_NONE: u8 = 0;
/// No survivor can get next to it.
pub const BLOCK_UNREACHABLE: u8 = 1;
/// A build or refuel waiting for coal.
pub const BLOCK_NO_COAL: u8 = 2;
/// A build waiting for stone.
pub const BLOCK_NO_STONE: u8 = 3;
/// A dig under a building that nobody has been told to take down.
pub const BLOCK_UNDER_BUILDING: u8 = 4;
/// Doable and in reach, but nobody has picked it up for a long while.
pub const BLOCK_NO_HANDS: u8 = 5;
/// A pile with no stockpile to carry it to.
pub const BLOCK_NO_STOCKPILE: u8 = 6;
/// A build or upgrade waiting for iron.
pub const BLOCK_NO_IRON: u8 = 7;
/// A build waiting for crystal.
pub const BLOCK_NO_CRYSTAL: u8 = 8;
/// How long a doable order may sit unclaimed before it counts as stuck.
pub const NO_HANDS_TICKS: u64 = 300;

impl Sim {
    /// Whether some reachable cell beside (or at) a job is lit.
    fn lit_stand_near(&self, x: i32, y: i32, reach: &[bool]) -> bool {
        (-1..=1).any(|dy| {
            (-1..=1).any(|dx| {
                let (sx, sy) = (x + dx, y + dy);
                self.open(sx, sy) && self.supported(sx, sy) && reach[self.idx(sx as u32, sy as u32)] && !self.is_dark(self.idx(sx as u32, sy as u32))
            })
        })
    }

    /// One `BLOCK_` value per job, in the order of [`Sim::jobs`].
    pub fn job_blockers(&self) -> Vec<u8> {
        // Every cell some living survivor can walk to.
        let mut reach = vec![false; self.elements.len()];
        for c in self.colonists.iter().filter(|c| c.alive()) {
            let field = self.field_from(c.x, c.y);
            for (r, &d) in reach.iter_mut().zip(&field.dist) {
                *r |= d != UNREACHED;
            }
        }
        let pending_dig = |x: i32, y: i32| self.jobs.iter().any(|j| j.kind == JobKind::Dig && (j.x as i32, j.y as i32) == (x, y));
        self.jobs
            .iter()
            .map(|job| {
                if job.claimed_by.is_some() {
                    return BLOCK_NONE;
                }
                let (x, y) = (job.x as i32, job.y as i32);
                match job.kind {
                    JobKind::Dig if self.holds_up_building(job.x, job.y) => {
                        let removing = self.jobs.iter().any(|o| o.kind == JobKind::Deconstruct && o.y + 1 == job.y && o.x.abs_diff(job.x) <= 1);
                        return if removing { BLOCK_NONE } else { BLOCK_UNDER_BUILDING };
                    }
                    JobKind::Build(b) => {
                        let (coal, stone) = build_cost(b);
                        if self.coal < coal {
                            return BLOCK_NO_COAL;
                        }
                        if self.stone < stone {
                            return BLOCK_NO_STONE;
                        }
                        let (iron, crystal) = rare_cost(b);
                        if self.iron < iron {
                            return BLOCK_NO_IRON;
                        }
                        if self.crystal < crystal {
                            return BLOCK_NO_CRYSTAL;
                        }
                    }
                    JobKind::Refuel if self.coal <= 0 && self.coke <= 0 => return BLOCK_NO_COAL,
                    JobKind::Upgrade if self.iron < GRATE_IRON => return BLOCK_NO_IRON,
                    JobKind::Haul if !self.has_stockpile() => return BLOCK_NO_STOCKPILE,
                    // Out in the dark at night it waits for dawn, as it should.
                    JobKind::Haul if !self.haul_doable(self.idx(job.x, job.y)) => return BLOCK_NONE,
                    _ => {}
                }
                let stand = (-1..=1).any(|dy| {
                    (-1..=1).any(|dx| {
                        let (sx, sy) = (x + dx, y + dy);
                        self.open(sx, sy) && self.supported(sx, sy) && reach[self.idx(sx as u32, sy as u32)]
                    })
                });
                // The curfew: every cell they could work from is dark, so it waits for dawn.
                if stand && self.is_curfew() && !self.lit_stand_near(x, y, &reach) {
                    return BLOCK_NONE;
                }
                if !stand {
                    // Deep in a block of marked rock: the digs around it will open the way.
                    let queued = [(-1, 0), (1, 0), (0, -1), (0, 1)].iter().any(|&(dx, dy)| pending_dig(x + dx, y + dy));
                    return if queued { BLOCK_NONE } else { BLOCK_UNREACHABLE };
                }
                if self.tick >= job.created + NO_HANDS_TICKS {
                    BLOCK_NO_HANDS
                } else {
                    BLOCK_NONE
                }
            })
            .collect()
    }
}
