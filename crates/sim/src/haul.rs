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
    /// Iron ore, for the smelter.
    Ore = 3,
    Crystal = 4,
    /// A bucket of water on its way to a mushroom bed. Never lies in a pile or goes to stock.
    Water = 5,
}

impl Item {
    pub fn from_u8(v: u8) -> Option<Item> {
        match v {
            1 => Some(Item::Coal),
            2 => Some(Item::Stone),
            3 => Some(Item::Ore),
            4 => Some(Item::Crystal),
            5 => Some(Item::Water),
            _ => None,
        }
    }
}

/// Most a survivor carries in one trip.
pub const CARRY_MAX: i32 = 10;
/// A new pile joins a pile of the same thing up to this many cells along the floor.
const MERGE_REACH: i32 = 2;
/// A pile pushed out of a new tile or building looks this far for a new place.
const DISPLACE_REACH: i32 = 5;
const DISPLACE_REACH_Y: i32 = 3;

impl Sim {
    /// Put `amount` of `item` down at cell `i`: it falls to the first floor
    /// below, then joins a pile of the same thing close by if there is one, so
    /// a tunnel leaves a few heaps, not a trail.
    pub(crate) fn drop_pile(&mut self, i: usize, item: Item, amount: i32) {
        if amount <= 0 {
            return;
        }
        let w = self.width as i32;
        let (x, mut y) = (i as i32 % w, i as i32 / w);
        while self.open(x, y) && !self.supported(x, y) {
            y += 1;
        }
        // Nowhere to put it down at all: it isn't lost, it goes to stock.
        match self.pile_spot(x, y, item, MERGE_REACH, 0) {
            Some(j) => {
                self.pile_item[j] = item as u8;
                self.pile_amount[j] += amount;
            }
            None => self.store(item, amount),
        }
    }

    /// Whether goods can lie in cell `j`: open, held up, and with no building
    /// (a ladder is walked past, so a heap may sit on one).
    fn pile_fits(&self, j: usize) -> bool {
        let (x, y) = ((j as u32 % self.width) as i32, (j as u32 / self.width) as i32);
        self.open(x, y) && matches!(self.buildings[j], Building::None | Building::Ladder) && self.supported(x, y)
    }

    /// The best cell within `reach` across and `reach_y` up or down of (x, y)
    /// to lay `item` in: a heap of the same thing first, else the nearest
    /// empty cell. Ties go to the lowest index.
    fn pile_spot(&self, x: i32, y: i32, item: Item, reach: i32, reach_y: i32) -> Option<usize> {
        let w = self.width as i32;
        let mut best: Option<((bool, i32, usize), usize)> = None;
        for ny in (y - reach_y).max(0)..=(y + reach_y).min(self.height as i32 - 1) {
            for nx in (x - reach).max(0)..=(x + reach).min(w - 1) {
                let j = (ny * w + nx) as usize;
                if !self.pile_fits(j) || (self.pile_item[j] != 0 && self.pile_item[j] != item as u8) {
                    continue;
                }
                let key = (self.pile_item[j] == 0, (nx - x).abs().max((ny - y).abs()), j);
                if best.map_or(true, |(k, _)| key < k) {
                    best = Some((key, j));
                }
            }
        }
        best.map(|(_, j)| j)
    }

    /// If the pile at cell `i` is stuck in something solid (a finished tile,
    /// water that flowed over it) or under a building, move it out: onto the
    /// nearest free floor, merging with a heap of the same thing if one is
    /// close. A stockpile built on a pile takes it in. With nowhere to go it
    /// is put in stock.
    pub(crate) fn clear_pile_at(&mut self, i: usize) {
        let Some(item) = Item::from_u8(self.pile_item[i]) else { return };
        let amount = self.pile_amount[i];
        if amount <= 0 {
            return;
        }
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        let stored = self.open(x, y) && self.buildings[i] == Building::Stockpile;
        // A heap lying in a free cell stays; one in the air is `settle_piles`' business.
        if !stored && self.open(x, y) && matches!(self.buildings[i], Building::None | Building::Ladder) {
            return;
        }
        self.pile_item[i] = 0;
        self.pile_amount[i] = 0;
        if stored {
            self.store(item, amount);
            return;
        }
        match self.pile_spot(x, y, item, DISPLACE_REACH, DISPLACE_REACH_Y) {
            Some(j) => {
                self.pile_item[j] = item as u8;
                self.pile_amount[j] += amount;
            }
            None => self.store(item, amount),
        }
    }

    pub(crate) fn store(&mut self, item: Item, amount: i32) {
        match item {
            Item::Coal => self.coal += amount,
            Item::Stone => self.stone += amount,
            Item::Ore => self.ore += amount,
            Item::Crystal => self.crystal += amount,
            Item::Water => {}
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

    /// Whether a pile at cell `i` can be fetched now. From dusk to dawn
    /// nobody goes into the dark for goods (the curfew): the pile waits for
    /// daylight, so hauling never sends anyone out to the Shades.
    pub(crate) fn haul_doable(&self, i: usize) -> bool {
        self.pile_amount[i] > 0 && self.has_stockpile() && !(self.is_curfew() && self.is_dark(i))
    }

    /// Raise a haul errand for every pile, and keep piles falling.
    pub(crate) fn raise_haul_jobs(&mut self) {
        self.settle_piles();
        for i in 0..self.pile_item.len() {
            self.clear_pile_at(i);
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
            // A bucket spilt is just gone.
            if item == Item::Water {
                return;
            }
            let col = &self.colonists[c];
            let i = self.idx(col.x, col.y);
            self.drop_pile(i, item, amount);
        }
    }

    /// Carry the load to the nearest stockpile and put it in stock there.
    pub(crate) fn deliver(&mut self, c: usize) {
        if matches!(self.colonists[c].carrying, Some((Item::Water, _))) {
            return self.deliver_water(c);
        }
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::world::Element;

    /// A rock block with a floor corridor of `len` cells along row `y`.
    fn corridor(y: u32, x0: u32, len: u32) -> Sim {
        let mut sim = Sim::new(7, 64, 64);
        for x in x0 - 2..x0 + len + 2 {
            for yy in y - 1..=y + 1 {
                let i = sim.idx(x, yy);
                sim.elements[i] = Element::Rock;
            }
        }
        for x in x0..x0 + len {
            let i = sim.idx(x, y);
            sim.elements[i] = Element::Floor;
        }
        sim
    }

    fn pile_total(sim: &Sim, item: Item) -> i32 {
        (0..sim.pile_item.len()).filter(|&i| sim.pile_item[i] == item as u8).map(|i| sim.pile_amount[i]).sum()
    }

    #[test]
    fn a_tile_built_on_a_pile_pushes_it_out() {
        let mut sim = corridor(30, 20, 7);
        let (coal0, w) = (sim.coal, sim.width);
        let at = sim.idx(23, 30);
        sim.pile_item[at] = Item::Coal as u8;
        sim.pile_amount[at] = 6;
        let job = crate::jobs::Job { id: 0, x: 23, y: 30, kind: JobKind::Build(Building::Tile), progress: 0, created: 0, claimed_by: None, priority: 5 };
        sim.finish_job(&job);
        assert_eq!(sim.elements[at], Element::Tile);
        assert_eq!(sim.pile_amount[at], 0, "nothing may stay inside the tile");
        assert_eq!(pile_total(&sim, Item::Coal), 6, "the coal is moved, not lost");
        assert_eq!(sim.coal, coal0, "and it didn't fall back to stock");
        for i in 0..sim.pile_item.len() {
            if sim.pile_amount[i] > 0 {
                assert!(sim.elements[i].is_open(), "pile in a solid cell");
                assert!((i as i32 % w as i32 - 23).abs() <= 2 && i as u32 / w == 30, "pile should lie beside the tile");
            }
        }
    }

    #[test]
    fn a_pile_falls_when_its_floor_is_dug() {
        let mut sim = corridor(30, 20, 7);
        for x in 20..27 {
            let i = sim.idx(x, 31);
            sim.elements[i] = Element::Rock;
        }
        let at = sim.idx(23, 30);
        sim.pile_item[at] = Item::Stone as u8;
        sim.pile_amount[at] = 4;
        let job = crate::jobs::Job { id: 0, x: 23, y: 31, kind: JobKind::Dig, progress: 0, created: 0, claimed_by: None, priority: 5 };
        sim.finish_job(&job);
        for _ in 0..4 {
            sim.settle_piles();
        }
        let below = sim.idx(23, 31);
        assert_eq!(sim.pile_amount[at], 0);
        assert_eq!(sim.pile_amount[below], 4 + crate::jobs::STONE_PER_CELL);
    }
}
