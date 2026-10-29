//! Environment: light, smoke, water and heat.

use crate::research::GRATE_RADIUS;
use crate::{Building, Element, Sim, WATER_PRESSURED, WATER_FULL, WATER_MIN, WATER_WET, CRYSTAL_RADIUS_DAY, CRYSTAL_RADIUS_NIGHT, DARK_BELOW, ROOM_GLOW, ROOM_HEARTH, EVENT_SMOKE, SMOKE_MAX, SMOKE_SOAK_DIV, SMOKY, VENT_CLEAR, LAMP_RADIUS_DAY, LAMP_RADIUS_NIGHT, LIGHT_RADIUS_DAY, LIGHT_RADIUS_NIGHT, NIGHT_FULL};

impl Sim {
    /// Flood light outwards from every lit hearth and every lamp through
    /// open cells, so walls cast real shadows. The first solid cell hit is lit
    /// too, so cave walls show at the edge of the light. Hearth light is also
    /// kept on its own in `firelight`, since only firelight warms.
    pub(crate) fn update_light(&mut self) {
        // Light shrinks over dusk and grows back over dawn, not all at once.
        let level = self.night_level();
        let fade = |day: i32, night: i32| day - ((day - night) * level + NIGHT_FULL / 2) / NIGHT_FULL;
        let (radius, lamp_radius, crystal_radius) = (
            fade(LIGHT_RADIUS_DAY, LIGHT_RADIUS_NIGHT),
            fade(LAMP_RADIUS_DAY, LAMP_RADIUS_NIGHT),
            fade(CRYSTAL_RADIUS_DAY, CRYSTAL_RADIUS_NIGHT),
        );
        let mut fire = std::mem::take(&mut self.firelight);
        fire.iter_mut().for_each(|l| *l = 0);
        self.flood_hearths(radius, &mut fire);
        self.firelight = fire;
        self.light.copy_from_slice(&self.firelight);
        let lamps: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::Lamp).collect();
        flood_light(self.width, self.height, &self.elements, &lamps, lamp_radius, &mut self.light);
        let crystals: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::CrystalLamp).collect();
        flood_light(self.width, self.height, &self.elements, &crystals, crystal_radius, &mut self.light);
        // A small closed room with a fire in it holds the heat: every cell of
        // it counts as warm, however far from the hearth. The smoke it holds
        // still dims it below, so a hearth room wants a vent.
        for i in 0..self.light.len() {
            if self.room_kind[i] == ROOM_HEARTH {
                self.firelight[i] = self.firelight[i].max(ROOM_GLOW);
                self.light[i] = self.light[i].max(ROOM_GLOW);
            }
        }
        // Smoke dims the light: a smoky cave shrinks the lit and warm area,
        // which lets the cold and the Shades in closer. Thick smoke cuts up
        // to 70%, so the fire itself always stays warm.
        for i in 0..self.light.len() {
            let keep = 1_000 - self.smoke[i].clamp(0, SMOKE_MAX) * 700 / SMOKE_MAX;
            self.light[i] = (self.light[i] as i32 * keep / 1_000) as u8;
            self.firelight[i] = (self.firelight[i] as i32 * keep / 1_000) as u8;
        }
    }

    /// Smoke rises: most of what a cell holds moves up until the cell above
    /// is full, so it piles up under ceilings and only then builds downwards.
    /// Under a ceiling it creeps sideways into open neighbours with less.
    /// Walled cells lose a sliver to the rock. Fluxes come from a snapshot so
    /// the result does not depend on iteration order. Vents then clear their
    /// cells. Sends [`EVENT_SMOKE`] the first time any cell gets smoky.
    pub(crate) fn smoke_tick(&mut self) {
        let (w, h) = (self.width as usize, self.height as usize);
        let snap = self.smoke.clone();
        // A door's hide flap holds the smoke back, so a room keeps its own.
        let passable: Vec<bool> = (0..self.elements.len()).map(|i| self.elements[i].is_open() && !self.doorway(i)).collect();
        let open = |i: usize| passable[i];
        for y in 0..h {
            for x in 0..w {
                let i = y * w + x;
                if !open(i) || snap[i] == 0 {
                    continue;
                }
                let up = y.checked_sub(1).map(|ny| ny * w + x).filter(|&j| open(j));
                if let Some(j) = up {
                    let flow = (snap[i] * 3 / 4).min(SMOKE_MAX - snap[j]).max(0);
                    self.smoke[i] -= flow;
                    self.smoke[j] += flow;
                } else {
                    for j in [x.checked_sub(1).map(|nx| y * w + nx), (x + 1 < w).then(|| i + 1)].into_iter().flatten().filter(|&j| open(j)) {
                        let flow = (snap[i] - snap[j]).max(0) / 8;
                        self.smoke[i] -= flow;
                        self.smoke[j] += flow;
                    }
                }
                let walled = [x.checked_sub(1).map(|nx| y * w + nx), (x + 1 < w).then(|| i + 1), y.checked_sub(1).map(|ny| ny * w + x), (y + 1 < h).then(|| i + w)]
                    .into_iter()
                    .flatten()
                    .any(|j| self.elements[j].is_wall());
                if walled {
                    self.smoke[i] -= snap[i] / SMOKE_SOAK_DIV;
                }
            }
        }
        // Vents draw last, so what flowed into one this tick is gone by the end of it.
        for i in 0..self.buildings.len() {
            if self.buildings[i] == Building::Vent {
                self.smoke[i] = (self.smoke[i] - VENT_CLEAR).max(0);
            }
        }
        if !self.smoke_warned && self.smoke.iter().any(|&s| s >= SMOKY) {
            self.smoke_warned = true;
            self.push_event(EVENT_SMOKE, 0);
        }
    }

    pub fn is_smoky(&self, i: usize) -> bool {
        self.smoke[i] >= SMOKY
    }

    /// Where hearth light will reach after nightfall if every lit hearth stays
    /// fed: a read-only forecast for the client's warmth view. Changes no state.
    pub fn night_firelight(&self) -> Vec<u8> {
        let mut out = vec![0; self.light.len()];
        self.flood_hearths(LIGHT_RADIUS_NIGHT, &mut out);
        out
    }

    /// Light from every lit hearth into `out`; a grated hearth reaches further.
    fn flood_hearths(&self, radius: i32, out: &mut [u8]) {
        let lit = |grate: bool| (0..self.buildings.len()).filter(|&i| self.hearth_lit(i) && self.hearth_grate[i] == grate).collect::<Vec<_>>();
        flood_light(self.width, self.height, &self.elements, &lit(false), radius, out);
        flood_light(self.width, self.height, &self.elements, &lit(true), radius + GRATE_RADIUS, out);
    }

    pub fn is_dark(&self, i: usize) -> bool {
        self.light[i] < DARK_BELOW
    }

    /// Lit by a hearth, so survivors here warm up. Lamp light alone does not count.
    pub fn is_warm(&self, i: usize) -> bool {
        self.firelight[i] >= DARK_BELOW
    }

    pub(crate) fn hearth_lit(&self, i: usize) -> bool {
        self.buildings[i] == Building::Hearth && self.hearth_fuel[i] > 0
    }

    /// Water as a volume per cell (`water`, 0..=WATER_FULL), ONI style:
    ///
    /// 1. Gravity: each cell, bottom row first, pours into the open cell below
    ///    until that is full. Water falls one cell a tick.
    /// 2. Spreading: a resting cell (nothing to fall into) gives each lower
    ///    side neighbour half the difference, so a cell never gives away more
    ///    than it has. All sideways flows are worked out from the same
    ///    snapshot, so the order of cells does not matter. A pool therefore
    ///    levels out and then holds still (differences of 1 are left alone).
    /// 3. Resting cells below WATER_MIN dry up, counted in `water_lost`.
    ///
    /// 4. Pressure: `water_pressure` levels connected full columns, so water
    ///    does rise up a side pipe.
    ///
    /// Elements follow volume (see [`WATER_WET`]); heat stays put.
    pub(crate) fn water_tick(&mut self) {
        let (w, h) = (self.width as usize, self.height as usize);
        let fluid = |e: Element| matches!(e, Element::Floor | Element::Water);
        // Gravity, in place from the bottom up. Water in a cell that is no
        // longer open (rock laid over it in a test, say) is lost.
        let mut any = false;
        for y in (0..h).rev() {
            for x in 0..w {
                let i = y * w + x;
                let v = self.water[i];
                if v == 0 {
                    continue;
                }
                if !fluid(self.elements[i]) {
                    self.water_lost += v as i64;
                    self.water[i] = 0;
                    continue;
                }
                any = true;
                if y + 1 < h && fluid(self.elements[i + w]) {
                    let m = v.min(WATER_FULL - self.water[i + w]);
                    self.water[i] -= m;
                    self.water[i + w] += m;
                }
            }
        }
        if !any {
            return;
        }
        // A cell rests when it cannot fall any further.
        let rests = |s: &Sim, i: usize| i / w + 1 >= h || !fluid(s.elements[i + w]) || s.water[i + w] >= WATER_FULL;
        self.water_flow.fill(0);
        for y in 0..h {
            for x in 0..w.saturating_sub(1) {
                let (a, b) = (y * w + x, y * w + x + 1);
                let (va, vb) = (self.water[a], self.water[b]);
                if va == vb || !fluid(self.elements[a]) || !fluid(self.elements[b]) {
                    continue;
                }
                let (from, to, diff) = if va > vb { (a, b, va - vb) } else { (b, a, vb - va) };
                if diff < 2 || !rests(self, from) {
                    continue;
                }
                let f = diff / 2;
                self.water_flow[from] -= f;
                self.water_flow[to] += f;
            }
        }
        for i in 0..self.water.len() {
            self.water[i] += self.water_flow[i];
        }
        self.water_pressure(w, h);
        for i in 0..self.water.len() {
            let v = self.water[i];
            if v > 0 && v < WATER_MIN && rests(self, i) {
                self.water_lost += v as i64;
                self.water[i] = 0;
            }
            self.sync_water_element(i);
        }
    }

    /// Communicating vessels. Full cells (at least WATER_PRESSURED, since sideways
    /// spreading leaves gradients of a unit a cell) joined side to side or top to bottom
    /// form one body of water under pressure, and its surfaces (the cells
    /// resting on top of it) must end up at one height. Per body and tick, a
    /// quarter of the height difference between its highest surface that has
    /// water to give and its lowest surface moves from one to the other, in
    /// thousandths of a cell (smaller level = higher). Bodies are found in
    /// index order, so the result is fixed, and one transfer per body per tick
    /// keeps it from overshooting.
    fn water_pressure(&mut self, w: usize, h: usize) {
        let fluid = |e: Element| matches!(e, Element::Floor | Element::Water);
        let seen = &mut self.water_level; // 0 = unvisited, 1 = in a body already
        seen.fill(0);
        let mut stack: Vec<usize> = Vec::new();
        for start in 0..w * h {
            if self.water[start] < WATER_PRESSURED || self.water_level[start] != 0 {
                continue;
            }
            // (level, cell) of the highest surface holding water, and of the lowest surface.
            let mut donor: Option<(i32, usize)> = None;
            let mut taker: Option<(i32, usize)> = None;
            self.water_level[start] = 1;
            stack.push(start);
            while let Some(c) = stack.pop() {
                let (x, y) = (c % w, c / w);
                // The surface of this column of the body, if `c` is its top: `c` itself when
                // it is not quite full, else the cell above it (when that is open).
                let above_in_body = y > 0 && self.water[c - w] >= WATER_PRESSURED;
                // A full top cell can give from itself, and take into the open cell above it.
                let surface = if above_in_body {
                    None
                } else if self.water[c] < WATER_FULL {
                    Some((c, c, (y as i32 + 1) * WATER_FULL - self.water[c]))
                } else if y > 0 && fluid(self.elements[c - w]) {
                    Some((c, c - w, (y as i32) * WATER_FULL - self.water[c - w]))
                } else {
                    None
                };
                if let Some((give, take, level)) = surface {
                    if donor.map_or(true, |d| (level, give) < d) {
                        donor = Some((level, give));
                    }
                    if taker.map_or(true, |t| (level, usize::MAX - take) > (t.0, usize::MAX - t.1)) {
                        taker = Some((level, take));
                    }
                }
                let mut visit = |n: usize, this: &mut Sim| {
                    if this.water[n] >= WATER_PRESSURED && this.water_level[n] == 0 {
                        this.water_level[n] = 1;
                        stack.push(n);
                    }
                };
                if x > 0 {
                    visit(c - 1, self);
                }
                if x + 1 < w {
                    visit(c + 1, self);
                }
                if y > 0 {
                    visit(c - w, self);
                }
                if y + 1 < h {
                    visit(c + w, self);
                }
            }
            if let (Some((dl, src)), Some((tl, dst))) = (donor, taker) {
                // A fresh film under WATER_MIN would dry up at once, so open a cell only with that much.
                let least = if self.water[dst] == 0 { WATER_MIN } else { 1 };
                let diff = tl - dl;
                if src == dst || diff < 2 * least {
                    continue;
                }
                let f = (diff / 4).max(least).min(self.water[src]).min(WATER_FULL - self.water[dst]);
                if f >= least {
                    self.water[src] -= f;
                    self.water[dst] += f;
                }
            }
        }
    }

    /// Make the cell's element agree with its water: wet enough means [`Element::Water`].
    fn sync_water_element(&mut self, i: usize) {
        match self.elements[i] {
            Element::Floor if self.water[i] >= WATER_WET => self.elements[i] = Element::Water,
            Element::Water if self.water[i] < WATER_WET => self.elements[i] = Element::Floor,
            _ => {}
        }
    }

    /// Remove up to `amount` water from cell `i` (a bucket, a pump) and return what came out.
    pub fn take_water(&mut self, i: usize, amount: i32) -> i32 {
        let taken = amount.clamp(0, self.water[i]);
        self.water[i] -= taken;
        self.sync_water_element(i);
        taken
    }

    /// Pour up to `amount` water into cell `i` (a drip, a refund) and return what fitted.
    /// Cells that are not open hold none.
    pub fn add_water(&mut self, i: usize, amount: i32) -> i32 {
        if !matches!(self.elements[i], Element::Floor | Element::Water) {
            return 0;
        }
        let added = amount.clamp(0, WATER_FULL - self.water[i]);
        self.water[i] += added;
        self.sync_water_element(i);
        added
    }

    pub(crate) fn conduct_heat(&mut self) {
        let (w, h) = (self.width as usize, self.height as usize);
        let t = &mut self.temperature;
        self.scratch.copy_from_slice(t);
        for y in 0..h {
            for x in 0..w {
                let i = y * w + x;
                for j in [if x + 1 < w { Some(i + 1) } else { None }, if y + 1 < h { Some(i + w) } else { None }]
                    .into_iter()
                    .flatten()
                {
                    let k = self.elements[i].conductivity().min(self.elements[j].conductivity()) as i64;
                    let flux = ((self.scratch[i] - self.scratch[j]) as i64 * k / 1024 / 5) as i32;
                    t[i] -= flux;
                    t[j] += flux;
                }
            }
        }
    }
}

/// Breadth-first light from `sources` through open cells, raising `light` to
/// each cell's level. Sources are visited in index order, so the result is fixed.
fn flood_light(width: u32, height: u32, elements: &[Element], sources: &[usize], radius: i32, light: &mut [u8]) {
    let (w, h) = (width as i32, height as i32);
    let mut dist = vec![i32::MAX; light.len()];
    let mut queue = std::collections::VecDeque::new();
    for &i in sources {
        dist[i] = 0;
        queue.push_back(i);
    }
    while let Some(i) = queue.pop_front() {
        let d = dist[i];
        let level = (255 * (radius - d) / radius).max(0) as u8;
        light[i] = light[i].max(level);
        if d >= radius || !elements[i].is_open() {
            continue;
        }
        let (x, y) = ((i as i32) % w, (i as i32) / w);
        for (dx, dy) in [(1, 0), (-1, 0), (0, 1), (0, -1)] {
            let (nx, ny) = (x + dx, y + dy);
            if nx < 0 || ny < 0 || nx >= w || ny >= h {
                continue;
            }
            let j = (ny * w + nx) as usize;
            if dist[j] > d + 1 {
                dist[j] = d + 1;
                queue.push_back(j);
            }
        }
    }
}
