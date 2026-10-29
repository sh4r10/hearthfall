//! Rooms: small pockets of open cells closed off by walls (dug rock, laid
//! tiles) and doors. Shut a few cells in and they become a room; what is in
//! the room decides what it does for the colony.
//!
//! A room is any connected run of open cells, not crossing a door, of at most
//! [`ROOM_MAX_CELLS`] cells and nowhere touching the edge of the map. Door
//! cells belong to no room. The start cave is too big to count, so every room
//! is one the player partitioned off on purpose.

use crate::{Building, Sim};
use std::collections::VecDeque;

/// A pocket bigger than this is a cave, not a room: too much space to hold heat.
pub const ROOM_MAX_CELLS: usize = 48;
/// Rooms are re-read this often. Walls and doors change rarely, so a short
/// delay never shows.
pub const ROOM_TICKS: u64 = 10;
/// Firelight every cell of a hearth room is held at (0..=255, above DARK_BELOW).
pub const ROOM_GLOW: u8 = 160;

/// Values of `Sim::room_kind`, per cell.
pub const ROOM_NONE: u8 = 0;
/// Closed off, but nothing in it that changes anything. Still keeps Shades out.
pub const ROOM_PLAIN: u8 = 1;
/// Holds a lit hearth: the whole room counts as warm. Needs a vent for its smoke.
pub const ROOM_HEARTH: u8 = 2;
/// Beds and no fire: everyone in a bed here sleeps as well as it gets, and rests faster.
pub const ROOM_BEDROOM: u8 = 3;
/// Two or more mushroom beds and no fire: the damp still air grows mushrooms twice as fast.
pub const ROOM_CELLAR: u8 = 4;

impl Sim {
    /// Recompute `room_id` and `room_kind` from the walls, doors and buildings.
    pub(crate) fn rooms_tick(&mut self) {
        if self.tick % ROOM_TICKS != 0 {
            return;
        }
        let (w, h) = (self.width as usize, self.height as usize);
        let n = w * h;
        self.room_id.iter_mut().for_each(|r| *r = 0);
        self.room_kind.iter_mut().for_each(|k| *k = ROOM_NONE);
        let mut seen = vec![false; n];
        let mut next_id: u16 = 1;
        let mut cells = Vec::with_capacity(ROOM_MAX_CELLS + 1);
        let mut queue = VecDeque::new();
        for start in 0..n {
            if seen[start] || !self.elements[start].is_open() || self.doorway(start) {
                continue;
            }
            // Flood this pocket, stopping as soon as it is too big to be a room.
            cells.clear();
            queue.clear();
            seen[start] = true;
            queue.push_back(start);
            let mut touches_edge = false;
            while let Some(i) = queue.pop_front() {
                cells.push(i);
                let (x, y) = (i % w, i / w);
                if x == 0 || y == 0 || x + 1 == w || y + 1 == h {
                    touches_edge = true;
                }
                if cells.len() > ROOM_MAX_CELLS || touches_edge {
                    // Not a room: mark the rest of the pocket as seen and move on.
                    while let Some(i) = queue.pop_front() {
                        cells.push(i);
                    }
                    break;
                }
                for j in [x.checked_sub(1).map(|nx| y * w + nx), (x + 1 < w).then(|| i + 1), y.checked_sub(1).map(|ny| ny * w + x), (y + 1 < h).then(|| i + w)].into_iter().flatten() {
                    if !seen[j] && self.elements[j].is_open() && !self.doorway(j) {
                        seen[j] = true;
                        queue.push_back(j);
                    }
                }
            }
            if cells.len() > ROOM_MAX_CELLS || touches_edge {
                // Finish marking the whole pocket so it is never visited twice.
                let mut stack: Vec<usize> = cells.clone();
                while let Some(i) = stack.pop() {
                    let (x, y) = (i % w, i / w);
                    for j in [x.checked_sub(1).map(|nx| y * w + nx), (x + 1 < w).then(|| i + 1), y.checked_sub(1).map(|ny| ny * w + x), (y + 1 < h).then(|| i + w)].into_iter().flatten() {
                        if !seen[j] && self.elements[j].is_open() && !self.doorway(j) {
                            seen[j] = true;
                            stack.push(j);
                        }
                    }
                }
                continue;
            }
            let (mut hearth_lit, mut beds, mut shrooms) = (false, 0, 0);
            for &i in &cells {
                match self.buildings[i] {
                    Building::Hearth => hearth_lit |= self.hearth_fuel[i] > 0,
                    Building::Bed => beds += 1,
                    Building::MushroomBed => shrooms += 1,
                    _ => {}
                }
            }
            let kind = if hearth_lit {
                ROOM_HEARTH
            } else if beds > 0 {
                ROOM_BEDROOM
            } else if shrooms >= 2 {
                ROOM_CELLAR
            } else {
                ROOM_PLAIN
            };
            for &i in &cells {
                self.room_id[i] = next_id;
                self.room_kind[i] = kind;
            }
            next_id = next_id.wrapping_add(1).max(1);
        }
    }

    /// Whether cell `i` is inside a room of any kind.
    pub fn in_room(&self, i: usize) -> bool {
        self.room_id[i] != 0
    }

    /// Whether a door closes cell `i` to smoke and Shades: the door's own
    /// cell, or the cell above it that its frame fills (a door is two tall).
    pub fn doorway(&self, i: usize) -> bool {
        self.buildings[i] == Building::Door || (i + (self.width as usize) < self.buildings.len() && self.buildings[i + self.width as usize] == Building::Door)
    }
}
