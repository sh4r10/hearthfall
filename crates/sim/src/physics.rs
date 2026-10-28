//! Environment: light, water, gases and heat.

use crate::{Building, Element, Sim, DARK_BELOW, LIGHT_RADIUS_DAY, LIGHT_RADIUS_NIGHT};

impl Sim {
    /// Flood light outwards from every lit hearth through open cells, so
    /// walls cast real shadows. The first solid cell hit is lit too, so cave
    /// walls show at the edge of the light.
    pub(crate) fn update_light(&mut self) {
        let (w, h) = (self.width as i32, self.height as i32);
        let radius = if self.is_night() { LIGHT_RADIUS_NIGHT } else { LIGHT_RADIUS_DAY };
        self.light.iter_mut().for_each(|l| *l = 0);
        let mut dist = vec![i32::MAX; self.light.len()];
        let mut queue = std::collections::VecDeque::new();
        for i in 0..self.buildings.len() {
            if self.hearth_lit(i) {
                dist[i] = 0;
                queue.push_back(i);
            }
        }
        while let Some(i) = queue.pop_front() {
            let d = dist[i];
            let level = (255 * (radius - d) / radius).max(0) as u8;
            self.light[i] = self.light[i].max(level);
            if d >= radius || !self.elements[i].is_open() {
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

    pub fn is_dark(&self, i: usize) -> bool {
        self.light[i] < DARK_BELOW
    }

    pub(crate) fn hearth_lit(&self, i: usize) -> bool {
        self.buildings[i] == Building::Hearth && self.hearth_fuel[i] > 0 && self.oxygen[i] >= crate::HEARTH_MIN_OXYGEN_MG
    }

    /// Water falls into open cells below, and flows sideways towards drops.
    /// Moving water swaps places with the gas it displaces, so mass is conserved.
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
                    [dir, -dir].into_iter().map(|d| (x + d, y)).find(|&(sx, sy)| {
                        // Flow sideways towards a drop, or occasionally level out.
                        self.open(sx, sy) && (self.open(sx, sy + 1) || self.rng.below(4) == 0)
                    })
                };
                if let Some((tx, ty)) = target {
                    let j = self.idx(tx as u32, ty as u32);
                    self.elements.swap(i, j);
                    self.oxygen.swap(i, j);
                    self.co2.swap(i, j);
                    self.temperature.swap(i, j);
                    moved[j] = true;
                }
            }
        }
    }

    pub(crate) fn diffuse_gases(&mut self) {
        diffuse_gas(self.width, self.height, &self.elements, &mut self.oxygen, &mut self.scratch);
        diffuse_gas(self.width, self.height, &self.elements, &mut self.co2, &mut self.scratch);
        self.settle_gases();
    }

    /// Carbon dioxide is heavier than oxygen: let it sink by trading places
    /// with oxygen in the cell below. Both gases are conserved.
    fn settle_gases(&mut self) {
        let (w, h) = (self.width as usize, self.height as usize);
        self.scratch.copy_from_slice(&self.oxygen);
        self.scratch2.copy_from_slice(&self.co2);
        for y in 0..h - 1 {
            for x in 0..w {
                let (above, below) = (y * w + x, (y + 1) * w + x);
                if self.elements[above].is_open() && self.elements[below].is_open() {
                    let flow = self.scratch2[above].min(self.scratch[below]) / 8;
                    self.co2[above] -= flow;
                    self.co2[below] += flow;
                    self.oxygen[below] -= flow;
                    self.oxygen[above] += flow;
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

/// Mass-conserving gas exchange between open neighbours. Fluxes are computed
/// from a snapshot so the result does not depend on iteration order.
fn diffuse_gas(width: u32, height: u32, elements: &[Element], gas: &mut [i32], snapshot: &mut [i32]) {
    let (w, h) = (width as usize, height as usize);
    snapshot.copy_from_slice(gas);
    for y in 0..h {
        for x in 0..w {
            let i = y * w + x;
            if !elements[i].is_open() {
                continue;
            }
            for j in [if x + 1 < w { Some(i + 1) } else { None }, if y + 1 < h { Some(i + w) } else { None }]
                .into_iter()
                .flatten()
            {
                if elements[j].is_open() {
                    // Dividing by 5 caps a cell's total outflow at 4/5 of its
                    // mass, so gas never goes negative.
                    let flux = (snapshot[i] - snapshot[j]) / 5;
                    gas[i] -= flux;
                    gas[j] += flux;
                }
            }
        }
    }
}
