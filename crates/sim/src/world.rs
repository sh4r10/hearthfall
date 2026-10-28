use crate::rng::hash2;

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Element {
    /// Open ground: walkable, gas can flow through it.
    Floor = 0,
    Dirt = 1,
    Rock = 2,
    Water = 3,
}

impl Element {
    pub fn is_open(self) -> bool {
        self == Element::Floor
    }

    pub fn is_diggable(self) -> bool {
        matches!(self, Element::Dirt | Element::Rock)
    }

    /// Thermal conductivity on a 0..=1024 scale.
    pub fn conductivity(self) -> i32 {
        match self {
            Element::Floor => 160,
            Element::Dirt => 300,
            Element::Rock => 600,
            Element::Water => 800,
        }
    }
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Building {
    None = 0,
    OxygenDiffuser = 1,
}

/// Gas masses are in milligrams per cell, temperatures in centi-kelvin.
pub const START_OXYGEN_MG: i32 = 1_000;
pub const START_TEMP_CK: i32 = 29_315; // 20 C

/// Smooth integer value noise in 0..=255, cell size `1 << shift`.
fn value_noise(seed: u64, x: i32, y: i32, shift: u32) -> i32 {
    let size = 1 << shift;
    let (gx, gy) = (x >> shift, y >> shift);
    let (fx, fy) = (x & (size - 1), y & (size - 1));
    let corner = |cx, cy| (hash2(seed, cx, cy) & 255) as i32;
    let top = corner(gx, gy) * (size - fx) + corner(gx + 1, gy) * fx;
    let bottom = corner(gx, gy + 1) * (size - fx) + corner(gx + 1, gy + 1) * fx;
    (top * (size - fy) + bottom * fy) >> (2 * shift)
}

pub fn generate(seed: u64, width: u32, height: u32) -> Vec<Element> {
    let (w, h) = (width as i32, height as i32);
    let (cx, cy) = (w / 2, h / 2);
    let mut cells = Vec::with_capacity((w * h) as usize);
    for y in 0..h {
        for x in 0..w {
            let n = (value_noise(seed, x, y, 4) * 3 + value_noise(seed ^ 0xA5A5, x, y, 2)) / 4;
            let (dx, dy) = (x - cx, y - cy);
            let element = if dx * dx + dy * dy < 64 {
                Element::Floor // guaranteed open starting area
            } else if n < 70 {
                Element::Floor
            } else if n < 90 {
                Element::Water
            } else if n < 160 {
                Element::Dirt
            } else {
                Element::Rock
            };
            cells.push(element);
        }
    }
    cells
}
