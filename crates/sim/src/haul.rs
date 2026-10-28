//! Loose goods and hauling. Digging drops what it cuts as a pile on the floor;
//! nothing counts towards the colony's stock until someone carries it to a
//! stockpile. Building and refuelling then draw on that stock.

use crate::jobs::JobKind;
use crate::nav::UNREACHED;
use crate::{Activity, Building, Sim};

/// What lies in a pile or a survivor's arms. 0 is nothing.
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Item {
    Coal = 1,
    Stone = 2,
}

impl Item {
    pub fn from_u8(v: u8) -> Option<Item> {
        match v {
            1 => Some(Item::Coal),
            2 => Some(Item::Stone),
            _ => None,
        }
    }
}

/// Most a survivor carries in one trip.
pub const CARRY_MAX: i32 = 10;
/// A new pile joins a pile of the same thing up to this many cells along the floor.
const MERGE_REACH: i32 = 2;

impl Sim {
    /// Put `amount` of `item` down at cell `i`, onto a pile of the same thing
    /// close by if there is one, so a tunnel leaves a few heaps, not a trail.
    pub(crate) fn drop_pile(&mut self, i: usize, item: Item, amount: i32) {
        if amount <= 0 {
            return;
        }
        let w = self.width as i32;
        let (x, y) = (i as i32 % w, i as i32 / w);
        let mut spot = None;
        for d in 0..=MERGE_REACH {
            for nx in [x - d, x + d] {
                if nx < 0 || nx >= w || !self.open(nx, y) {
                    continue;
                }
                let j = (y * w + nx) as usize;
                if self.pile_item[j] == item as u8 {
                    spot = Some(j);
                    break;
                }
            }
            if spot.is_some() {
                break;
            }
        }
        let spot = spot.or_else(|| (0..=MERGE_REACH).flat_map(|d| [x - d, x + d]).find(|&nx| nx >= 0 && nx < w && self.open(nx, y) && self.pile_item[(y * w + nx) as usize] == 0).map(|nx| (y * w + nx) as usize));
        match spot {
            Some(j) => {
                self.pile_item[j] = item as u8;
                self.pile_amount[j] += amount;
            }
            // Nowhere to put it down at all: it isn't lost, it goes to stock.
            None => self.store(item, amount),
        }
    }

    pub(crate) fn store(&mut self, item: Item, amount: i32) {
        match item {
            Item::Coal => self.coal += amount,
            Item::Stone => self.stone += amount,
        }
    }

    /// Piles over open air drop a cell a tick until they land, like everything else.
    pub(crate) fn settle_piles(&mut self) {
        let w = self.width as i32;
        for y in (0..self.height as i32 - 1).rev() {
            for x in 0..w {
                let i = (y * w + x) as usize;
                if self.pile_item[i] == 0 || !self.open(x, y + 1) || self.ladder(x, y + 1) || self.ladder(x, y) {
                    continue;
                }
                let below = i + w as usize;
                if self.pile_item[below] == 0 || self.pile_item[below] == self.pile_item[i] {
                    self.pile_item[below] = self.pile_item[i];
                    self.pile_amount[below] += self.pile_amount[i];
                    self.pile_item[i] = 0;
                    self.pile_amount[i] = 0;
                }
            }
        }
    }

    pub fn has_stockpile(&self) -> bool {
        self.buildings.contains(&Building::Stockpile)
    }

    /// Whether a pile at cell `i` can be fetched now. At night nobody goes
    /// into the dark for goods: the pile waits for dawn, so hauling never
    /// sends anyone out to the Shades.
    pub(crate) fn haul_doable(&self, i: usize) -> bool {
        self.pile_amount[i] > 0 && self.has_stockpile() && !(self.is_night() && self.is_dark(i))
    }

    /// Raise a haul errand for every pile, and keep piles falling.
    pub(crate) fn raise_haul_jobs(&mut self) {
        self.settle_piles();
        for i in 0..self.pile_item.len() {
            if self.pile_amount[i] > 0 {
                let (x, y) = (i as u32 % self.width, i as u32 / self.width);
                self.add_job(x, y, JobKind::Haul);
            } else {
                self.pile_item[i] = 0;
            }
        }
    }

    /// A haul errand is done: pick up what the pile holds, up to a load.
    pub(crate) fn pick_up(&mut self, c: usize, i: usize) {
        let Some(item) = Item::from_u8(self.pile_item[i]) else { return };
        let amount = self.pile_amount[i].min(CARRY_MAX);
        self.pile_amount[i] -= amount;
        if self.pile_amount[i] == 0 {
            self.pile_item[i] = 0;
        }
        let col = &mut self.colonists[c];
        col.carrying = Some((item, amount));
        col.path.clear();
    }

    /// Put down whatever the survivor carries where they stand.
    pub(crate) fn drop_load(&mut self, c: usize) {
        if let Some((item, amount)) = self.colonists[c].carrying.take() {
            let col = &self.colonists[c];
            let i = self.idx(col.x, col.y);
            self.drop_pile(i, item, amount);
        }
    }

    /// Carry the load to the nearest stockpile and put it in stock there.
    pub(crate) fn deliver(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x, self.colonists[c].y);
        let w = self.width as usize;
        let row = y as usize * w;
        // Anywhere on the pallet counts: the stockpile and a cell either side.
        let at_pile = (x.saturating_sub(1)..=(x + 1).min(self.width - 1)).any(|sx| self.buildings[row + sx as usize] == Building::Stockpile);
        if at_pile {
            if let Some((item, amount)) = self.colonists[c].carrying.take() {
                self.store(item, amount);
            }
            let col = &mut self.colonists[c];
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
        let best = (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::Stockpile && field.dist[i] != UNREACHED).min_by_key(|&i| (field.dist[i], i));
        match best {
            Some(to) => {
                let path = self.path_to(&field, to);
                let col = &mut self.colonists[c];
                col.path = path;
                col.activity = Activity::Walking;
            }
            // No way to a stockpile: set it down and get on with something else.
            None => self.drop_load(c),
        }
    }
}
