//! Environment: light, smoke, water and heat.

use crate::{Building, Element, Sim, DARK_BELOW, EVENT_SMOKE, SMOKE_MAX, SMOKE_SOAK_DIV, SMOKY, VENT_CLEAR, LAMP_RADIUS_DAY, LAMP_RADIUS_NIGHT, LIGHT_RADIUS_DAY, LIGHT_RADIUS_NIGHT};
use crate::world::water_outlet;

impl Sim {
    /// Flood light outwards from every lit hearth and every lamp through
    /// open cells, so walls cast real shadows. The first solid cell hit is lit
    /// too, so cave walls show at the edge of the light. Hearth light is also
    /// kept on its own in `firelight`, since only firelight warms.
    pub(crate) fn update_light(&mut self) {
        let night = self.is_night();
        let (radius, lamp_radius) = if night { (LIGHT_RADIUS_NIGHT, LAMP_RADIUS_NIGHT) } else { (LIGHT_RADIUS_DAY, LAMP_RADIUS_DAY) };
        self.firelight.iter_mut().for_each(|l| *l = 0);
        let hearths: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.hearth_lit(i)).collect();
        flood_light(self.width, self.height, &self.elements, &hearths, radius, &mut self.firelight);
        self.light.copy_from_slice(&self.firelight);
        let lamps: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.buildings[i] == Building::Lamp).collect();
        flood_light(self.width, self.height, &self.elements, &lamps, lamp_radius, &mut self.light);
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
        let open = |i: usize| self.elements[i].is_open();
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
                    .any(|j| matches!(self.elements[j], Element::Dirt | Element::Rock));
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
        let hearths: Vec<usize> = (0..self.buildings.len()).filter(|&i| self.hearth_lit(i)).collect();
        flood_light(self.width, self.height, &self.elements, &hearths, LIGHT_RADIUS_NIGHT, &mut out);
        out
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

    /// Water falls into open cells below, and flows sideways towards drops.
    /// Moving water swaps places with the open cell it fills, taking its heat along.
    pub(crate) fn water_tick(&mut self) {
        let (w, h) = (self.width as i32, self.height as i32);
        let mut moved = vec![false; self.elements.len()];
        let left_first = self.tick % 2 == 0;
        for y in (0..h).rev() {
            for k in 0..w {
                let x = if left_first { k } else { w - 1 - k };
                let i = self.idx(x as u32, y as u32);
                if self.elements[i] != Element::Water || moved[i] {
                    continue;
                }
                let target = if self.open(x, y + 1) {
                    Some((x, y + 1))
                } else {
                    let dir = if self.rng.below(2) == 0 { -1 } else { 1 };
                    [dir, -dir].into_iter().find_map(|d| water_outlet(&self.elements, w, h, x, y, d))
                };
                if let Some((tx, ty)) = target {
                    let j = self.idx(tx as u32, ty as u32);
                    self.elements.swap(i, j);
                    self.temperature.swap(i, j);
                    moved[j] = true;
                }
            }
        }
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
