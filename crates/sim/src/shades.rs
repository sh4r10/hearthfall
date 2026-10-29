//! Shades: things from the deep dark that hunt survivors caught outside the
//! light at night. They never enter a lit cell, so light is the only defence.

use crate::{Sim, DARK_BELOW, DAY_TICKS, EVENT_SHADE_ATTACK};
use std::collections::VecDeque;

/// Values of [`Shade::state`].
pub const SHADE_DRIFTING: u8 = 0;
pub const SHADE_ATTACKING: u8 = 1;
/// Dawn: fleeing the light, unable to attack, dissolving as the day comes.
pub const SHADE_RETREATING: u8 = 2;

/// A Shade moves one cell this often.
pub const SHADE_STEP_TICKS: u64 = 4;
/// At night, a new Shade may rise this often.
pub const SHADE_SPAWN_TICKS: u64 = 40;
/// Shades only come out from this day on, so the first night is a rehearsal.
pub const SHADE_FIRST_DAY: u64 = 2;
/// No new Shade rises in the last this-many ticks of the night, so the ones
/// out at dawn have been hunting a while and the night ends quiet.
pub const SHADE_LAST_RISE: u64 = 120;
/// Shades rise only from cells at least this far from any light.
pub const SHADE_SPAWN_FROM_LIGHT: i32 = 6;
/// ...and no further than this through open cells from a living survivor.
pub const SHADE_SPAWN_RANGE: i32 = 24;
/// Warmth a survivor loses each tick while a Shade is on them.
pub const SHADE_DRAIN: i32 = 400;
/// A Shade whose prey escaped fades unless another survivor in the dark is
/// this close (in cells, along the grid).
pub const SHADE_GIVE_UP: i32 = 12;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Shade {
    pub x: u32,
    pub y: u32,
    /// [`SHADE_DRIFTING`], [`SHADE_ATTACKING`] or [`SHADE_RETREATING`].
    pub state: u8,
    /// Index of the survivor it is hunting, if any.
    pub target: Option<u32>,
}

impl Shade {
    pub(crate) fn hash_into(&self, eat: &mut impl FnMut(&[u8])) {
        for v in [self.x as i32, self.y as i32, self.state as i32, self.target.map_or(-1, |t| t as i32)] {
            eat(&v.to_le_bytes());
        }
    }
}

const UNREACHED: i32 = i32::MAX;

impl Sim {
    pub(crate) fn shades_tick(&mut self) {
        if !self.is_night() {
            if self.is_dawn() && !self.shades.is_empty() {
                self.shades_retreat();
            } else {
                self.shades.clear();
            }
            return;
        }
        // Light that reaches a Shade unmakes it, wherever the light came from.
        let light = &self.light;
        let w = self.width;
        self.shades.retain(|s| light[(s.y * w + s.x) as usize] < DARK_BELOW);

        if self.tick % SHADE_SPAWN_TICKS == 0 && self.day() >= SHADE_FIRST_DAY && self.tick % DAY_TICKS < DAY_TICKS - SHADE_LAST_RISE {
            self.spawn_shade();
        }
        if self.tick % SHADE_STEP_TICKS == 0 {
            let mut k = 0;
            while k < self.shades.len() {
                if self.move_shade(k) {
                    k += 1;
                } else {
                    self.shades.remove(k);
                }
            }
        }

        // A Shade on its prey in the dark attacks. Announce each new attack once.
        for k in 0..self.shades.len() {
            let s = self.shades[k];
            let attacking = s.target.is_some_and(|t| self.can_strike(s.x, s.y, t as usize));
            if attacking && s.state == SHADE_DRIFTING {
                self.push_event(EVENT_SHADE_ATTACK, s.target.unwrap());
            }
            self.shades[k].state = if attacking { SHADE_ATTACKING } else { SHADE_DRIFTING };
        }
    }

    /// Dawn: Shades flee the light, one step towards the darkest open
    /// neighbour they can reach, and cannot attack. Light that catches them
    /// unmakes them; the rest dissolve when dawn ends.
    fn shades_retreat(&mut self) {
        let light = &self.light;
        let w = self.width;
        self.shades.retain(|s| light[(s.y * w + s.x) as usize] < DARK_BELOW);
        let step = self.tick % SHADE_STEP_TICKS == 0;
        let (wi, hi) = (self.width as i32, self.height as i32);
        for k in 0..self.shades.len() {
            self.shades[k].state = SHADE_RETREATING;
            self.shades[k].target = None;
            if !step {
                continue;
            }
            let s = self.shades[k];
            let here = self.light[self.idx(s.x, s.y)];
            let mut best = (here, s.x as i32, s.y as i32);
            for (dx, dy) in [(1, 0), (-1, 0), (0, 1), (0, -1)] {
                let (nx, ny) = (s.x as i32 + dx, s.y as i32 + dy);
                if nx < 0 || ny < 0 || nx >= wi || ny >= hi {
                    continue;
                }
                let j = (ny * wi + nx) as usize;
                if self.elements[j].is_open() && !self.doorway(j) && self.is_dark(j) && self.light[j] < best.0 {
                    best = (self.light[j], nx, ny);
                }
            }
            self.shades[k].x = best.1 as u32;
            self.shades[k].y = best.2 as u32;
        }
    }

    /// Whether a Shade at (x, y) can reach survivor `c`: alive, in the dark,
    /// and in this or a neighbouring cell (diagonals count).
    fn can_strike(&self, x: u32, y: u32, c: usize) -> bool {
        let col = &self.colonists[c];
        // A closed room (walls and a door) keeps a Shade off whoever is inside it.
        col.alive() && self.is_dark(self.idx(col.x, col.y)) && col.x.abs_diff(x) <= 1 && col.y.abs_diff(y) <= 1 && self.room_id[self.idx(col.x, col.y)] == self.room_id[self.idx(x, y)]
    }

    /// Whether some Shade is attacking survivor `c` this tick.
    pub(crate) fn under_attack(&self, c: usize) -> bool {
        self.shades.iter().any(|s| s.state == SHADE_ATTACKING && s.target == Some(c as u32))
    }

    /// At most one Shade per three survivors, plus one.
    fn spawn_shade(&mut self) {
        let alive = self.alive_colonists();
        if alive == 0 || self.shades.len() >= alive / 3 + 1 {
            return;
        }
        let (w, h) = (self.width as i32, self.height as i32);
        let n = self.elements.len();
        let neighbours = |i: usize| {
            let (x, y) = ((i as i32) % w, (i as i32) / w);
            [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
                .into_iter()
                .filter(move |&(nx, ny)| nx >= 0 && ny >= 0 && nx < w && ny < h)
                .map(move |(nx, ny)| (ny * w + nx) as usize)
        };

        // Distance from any light at all, straight through rock.
        let mut from_light = vec![UNREACHED; n];
        let mut queue = VecDeque::new();
        for i in 0..n {
            if self.light[i] > 0 {
                from_light[i] = 0;
                queue.push_back(i);
            }
        }
        while let Some(i) = queue.pop_front() {
            if from_light[i] >= SHADE_SPAWN_FROM_LIGHT {
                continue;
            }
            for j in neighbours(i) {
                if from_light[j] == UNREACHED {
                    from_light[j] = from_light[i] + 1;
                    queue.push_back(j);
                }
            }
        }

        // Distance from the survivors through open cells, so Shades rise in
        // caves that connect to someone.
        let mut from_colony = vec![UNREACHED; n];
        for c in &self.colonists {
            let i = self.idx(c.x, c.y);
            if c.alive() && from_colony[i] == UNREACHED {
                from_colony[i] = 0;
                queue.push_back(i);
            }
        }
        while let Some(i) = queue.pop_front() {
            if from_colony[i] >= SHADE_SPAWN_RANGE {
                continue;
            }
            for j in neighbours(i) {
                if from_colony[j] == UNREACHED && self.elements[j].is_open() {
                    from_colony[j] = from_colony[i] + 1;
                    queue.push_back(j);
                }
            }
        }

        let candidates: Vec<usize> = (0..n)
            .filter(|&i| self.elements[i].is_open() && from_light[i] >= SHADE_SPAWN_FROM_LIGHT && from_colony[i] != UNREACHED)
            .collect();
        if candidates.is_empty() {
            return;
        }
        let i = candidates[self.rng.below(candidates.len() as u32) as usize];
        self.shades.push(Shade { x: i as u32 % self.width, y: i as u32 / self.width, state: SHADE_DRIFTING, target: None });
    }

    /// One step for Shade `k`: pick the nearest survivor in the dark it can
    /// reach and close in. Returns false if the Shade fades.
    fn move_shade(&mut self, k: usize) -> bool {
        let (w, h) = (self.width as i32, self.height as i32);
        let s = self.shades[k];
        let in_dark = |c: &crate::Colonist| c.alive() && self.is_dark(self.idx(c.x, c.y));

        // Prey that got back to the light (or died) is lost. Give up unless
        // someone else is still out in the dark close by.
        if let Some(t) = s.target {
            if !in_dark(&self.colonists[t as usize]) {
                let near = self.colonists.iter().any(|c| in_dark(c) && (c.x.abs_diff(s.x) + c.y.abs_diff(s.y)) as i32 <= SHADE_GIVE_UP);
                if !near {
                    return false;
                }
            }
        }

        // Breadth-first through dark open cells: Shades float, so no ladders needed.
        let n = self.elements.len();
        let mut dist = vec![UNREACHED; n];
        let mut parent = vec![usize::MAX; n];
        let start = self.idx(s.x, s.y);
        dist[start] = 0;
        let mut queue = VecDeque::from([start]);
        while let Some(i) = queue.pop_front() {
            let (x, y) = ((i as i32) % w, (i as i32) / w);
            for (nx, ny) in [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)] {
                if nx < 0 || ny < 0 || nx >= w || ny >= h {
                    continue;
                }
                let j = (ny * w + nx) as usize;
                if dist[j] == UNREACHED && self.elements[j].is_open() && !self.doorway(j) && self.is_dark(j) {
                    dist[j] = dist[i] + 1;
                    parent[j] = i;
                    queue.push_back(j);
                }
            }
        }
        let mut best: Option<(i32, usize)> = None; // (distance, colonist)
        for (c, col) in self.colonists.iter().enumerate() {
            let d = dist[self.idx(col.x, col.y)];
            if in_dark(col) && d != UNREACHED && best.map_or(true, |(bd, _)| d < bd) {
                best = Some((d, c));
            }
        }
        self.shades[k].target = best.map(|(_, c)| c as u32);

        let next = match best {
            Some((_, c)) if self.can_strike(s.x, s.y, c) => None, // already on them
            Some((_, c)) => {
                let col = &self.colonists[c];
                let mut i = self.idx(col.x, col.y);
                while parent[i] != start {
                    i = parent[i];
                }
                Some(i)
            }
            None => {
                // Nobody to hunt: drift about the dark.
                let (dx, dy) = [(1, 0), (-1, 0), (0, 1), (0, -1)][self.rng.below(4) as usize];
                let (nx, ny) = (s.x as i32 + dx, s.y as i32 + dy);
                let ok = nx >= 0 && ny >= 0 && nx < w && ny < h && dist[(ny * w + nx) as usize] != UNREACHED;
                ok.then(|| (ny * w + nx) as usize)
            }
        };
        if let Some(i) = next {
            self.shades[k].x = i as u32 % self.width;
            self.shades[k].y = i as u32 / self.width;
        }
        true
    }
}
