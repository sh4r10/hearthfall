//! Movement rules and pathfinding. y grows downwards.
//!
//! Survivors walk along floors, climb ladders, step up one-cell ledges and fall
//! when nothing holds them up. Paths come from a breadth-first search over
//! those moves, which is cheap on this grid size and fully deterministic.

use crate::{Building, Sim};
use std::collections::VecDeque;

pub(crate) const UNREACHED: i32 = i32::MAX;

pub(crate) struct Field {
    pub dist: Vec<i32>,
    parent: Vec<u32>,
}

impl Sim {
    pub(crate) fn open(&self, x: i32, y: i32) -> bool {
        x >= 0 && y >= 0 && (x as u32) < self.width && (y as u32) < self.height && self.elements[self.idx(x as u32, y as u32)].is_open()
    }

    pub(crate) fn ladder(&self, x: i32, y: i32) -> bool {
        self.open(x, y) && self.buildings[self.idx(x as u32, y as u32)] == Building::Ladder
    }

    /// Whether someone at (x, y) is held up by a floor or ladder.
    pub(crate) fn supported(&self, x: i32, y: i32) -> bool {
        self.ladder(x, y) || y + 1 >= self.height as i32 || !self.open(x, y + 1) || self.ladder(x, y + 1)
    }

    /// Cells reachable in one move from (x, y). Order is fixed for determinism.
    pub(crate) fn moves(&self, x: i32, y: i32) -> ([(i32, i32); 6], usize) {
        let mut out = [(0, 0); 6];
        let mut n = 0;
        let mut push = |p| {
            out[n] = p;
            n += 1;
        };
        if !self.supported(x, y) {
            if self.open(x, y + 1) {
                push((x, y + 1));
            }
            return (out, n);
        }
        for dx in [-1, 1] {
            if self.open(x + dx, y) {
                push((x + dx, y));
            } else if self.open(x + dx, y - 1) && self.open(x, y - 1) {
                push((x + dx, y - 1)); // step up a ledge
            }
        }
        if self.ladder(x, y) && self.open(x, y - 1) {
            push((x, y - 1));
        }
        if self.ladder(x, y + 1) {
            push((x, y + 1));
        }
        (out, n)
    }

    pub(crate) fn field_from(&self, x: u32, y: u32) -> Field {
        let n = self.elements.len();
        let mut field = Field { dist: vec![UNREACHED; n], parent: vec![u32::MAX; n] };
        let start = self.idx(x, y);
        field.dist[start] = 0;
        let mut queue = VecDeque::from([start]);
        while let Some(i) = queue.pop_front() {
            let (cx, cy) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
            let (moves, count) = self.moves(cx, cy);
            for &(mx, my) in &moves[..count] {
                let j = self.idx(mx as u32, my as u32);
                if field.dist[j] == UNREACHED {
                    field.dist[j] = field.dist[i] + 1;
                    field.parent[j] = i as u32;
                    queue.push_back(j);
                }
            }
        }
        field
    }

    /// Path from the field's start to `to`, excluding the start, in walking order.
    pub(crate) fn path_to(&self, field: &Field, to: usize) -> Vec<(u32, u32)> {
        let mut path = Vec::new();
        let mut i = to;
        while field.dist[i] > 0 {
            path.push((i as u32 % self.width, i as u32 / self.width));
            i = field.parent[i] as usize;
        }
        path.reverse();
        path
    }
}
