use crate::rng::hash2;

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Element {
    /// Open ground: walkable, light passes through it.
    Floor = 0,
    Dirt = 1,
    Rock = 2,
    Water = 3,
    /// Fuel for hearths. Digging it adds to the colony's fuel stock.
    Coal = 4,
    /// Iron ore, below the start cave. A smelter turns it into iron.
    Iron = 6,
    /// Crystal, deeper still. Focuses light.
    Crystal = 7,
    /// Cut stone laid by survivors: a platform, a bridge or a wall. Solid
    /// like rock, and dug out again like it (giving its stone back).
    Tile = 5,
}

impl Element {
    pub fn is_open(self) -> bool {
        self == Element::Floor
    }

    pub fn is_diggable(self) -> bool {
        matches!(self, Element::Dirt | Element::Rock | Element::Coal | Element::Tile | Element::Iron | Element::Crystal)
    }

    /// Solid ground or wall: anything that blocks light and smoke.
    pub fn is_wall(self) -> bool {
        matches!(self, Element::Dirt | Element::Rock | Element::Coal | Element::Tile | Element::Iron | Element::Crystal)
    }

    /// Thermal conductivity on a 0..=1024 scale.
    pub fn conductivity(self) -> i32 {
        match self {
            Element::Floor => 160,
            Element::Dirt => 300,
            Element::Rock => 600,
            Element::Water => 800,
            Element::Coal => 400,
            Element::Iron => 700,
            Element::Crystal => 500,
            Element::Tile => 600,
        }
    }
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Building {
    None = 0,
    /// A bored hole with a bellows: clears the smoke in its cell.
    Vent = 1,
    Ladder = 2,
    /// Burns fuel to light and warm the area around it.
    Hearth = 3,
    /// Grows food, but only in the dark.
    MushroomBed = 4,
    /// Marks where a survivor died. Placed by the sim, never built, and
    /// blocks nothing.
    Cairn = 5,
    /// A small light that needs no fuel once built. Gives no warmth.
    Lamp = 6,
    /// Somewhere to sleep well. One sleeper at a time, and blocks nothing.
    Bed = 7,
    /// Where hauled goods go. Coal and stone only count once they are here.
    Stockpile = 8,
    /// Where a survivor studies whatever the player picked to research.
    ResearchBench = 11,
    /// Bakes coal into coke, which burns twice as long with half the smoke.
    CokeOven = 12,
    /// Smelts iron ore into iron with a little coal.
    Smelter = 13,
    /// A lamp with a crystal lens: much further light, still no fuel.
    CrystalLamp = 14,
    /// A build order only: finishing it turns the cell into [`Element::Tile`].
    /// Never found in `Sim::buildings`.
    Tile = 9,
    /// A plank door in a timber frame, two cells tall. Survivors pass; smoke and Shades don't.
    /// The cells it closes off can make a room (see `rooms.rs`).
    Door = 10,
    /// The start cave's water barrel: holds the starting drinking water. Placed by
    /// the sim, never built, and never taken down.
    WaterBarrel = 15,
    /// A stone tank that holds drinking water carried over from a pool in buckets.
    Cistern = 16,
    /// Collects a slow trickle from wet rock above it, with no labour.
    DripCatcher = 17,
    /// A hand pump on a pool's edge: a survivor works it to fill the tanks beside it. Needs the Pumps research.
    HandPump = 18,
}

/// Temperatures are in centi-kelvin.
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

/// Coal seams in the start room's shell, as (x0, y0, x1, y1) boxes relative to
/// the hearth: one in each side wall and one under the floor. About 60 coal.
const START_SEAMS: [Seam; 3] = [Seam(-10, -3, -9, -1), Seam(9, -3, 10, -1), Seam(2, 1, 5, 2)];
/// A pocket of iron ore just under the start cave's shell, and one of crystal
/// a long dig further down, so the first of each is never a blind hunt.
const START_IRON: Seam = Seam(-6, 4, -4, 5);
const START_CRYSTAL: Seam = Seam(6, 16, 7, 17);
/// A sealed pocket of water (the first drinking water within reach), as a
/// shape and place relative to the hearth: it starts [`WATER_POCKET_RIGHT`]
/// cells right of it and [`WATER_POCKET_DEPTH`] rows below the floor, is
/// 4 to 6 cells wide and 2 or 3 tall by seed, and sits under a plug of dirt
/// that a dig down from the floor at [`WATER_POCKET_SHAFT`] goes through.
/// It lies well below the start floor and is sealed, so opening it never
/// lets water up into the start room.
const WATER_POCKET_RIGHT: i32 = 6;
const WATER_POCKET_DEPTH: i32 = 5;
const WATER_POCKET_SHAFT: i32 = 7;
struct Seam(i32, i32, i32, i32);
impl Seam {
    fn contains(&self, &(x, y): &(i32, i32)) -> bool {
        (self.0..=self.2).contains(&x) && (self.1..=self.3).contains(&y)
    }
}

pub fn generate(seed: u64, width: u32, height: u32) -> Vec<Element> {
    let (w, h) = (width as i32, height as i32);
    let (cx, cy) = (w / 2, h / 2);
    let mut cells = Vec::with_capacity((w * h) as usize);
    for y in 0..h {
        for x in 0..w {
            let n = (value_noise(seed, x, y, 4) * 3 + value_noise(seed ^ 0xA5A5, x, y, 2)) / 4;
            let (dx, dy) = (x - cx, y - cy);
            // Side view: y grows downwards. Carve a starting room and wrap it
            // in a shell of dirt two cells thick, so nobody wanders into a
            // random cave and falls somewhere they can't climb out of before
            // the player has dug anything. Coal seams sit in the shell where
            // they can be seen from inside, so the first fuel is never a hunt.
            let element = if dx.abs() <= 8 && (-5..=0).contains(&dy) {
                Element::Floor
            } else if START_SEAMS.iter().any(|s| s.contains(&(dx, dy))) {
                Element::Coal
            } else if (-8..=-2).contains(&dx) && dy == 2 {
                Element::Rock // the first stone, under the floor on the left
            } else if dx.abs() <= 10 && (-7..=2).contains(&dy) {
                Element::Dirt
            } else if START_IRON.contains(&(dx, dy)) {
                Element::Iron
            } else if START_CRYSTAL.contains(&(dx, dy)) {
                Element::Crystal
            } else if n < 70 {
                Element::Floor
            } else if n < 90 {
                Element::Water
            } else if value_noise(seed ^ 0xC0A1, x, y, 2) > 190 {
                Element::Coal // veins scattered through the rock
            } else if dy > 3 && value_noise(seed ^ 0x1205, x, y, 2) > 196 {
                Element::Iron // ore lies deeper than the first coal
            } else if dy > 14 && n >= 160 && value_noise(seed ^ 0xC257, x, y, 1) > 212 {
                Element::Crystal // and crystal deeper still, in hard rock
            } else if n < 160 {
                Element::Dirt
            } else {
                Element::Rock
            };
            cells.push(element);
        }
    }
    // Water spreads sideways into any cell dug open beside it, so no pocket may
    // sit within three cells of the start shell: digging the first coal seams
    // must never let a lake in. Deeper pockets stay as hazards.
    for y in 0..h {
        for x in 0..w {
            let (dx, dy) = (x - cx, y - cy);
            if dx.abs() <= 13 && (-10..=5).contains(&dy) && cells[(y * w + x) as usize] == Element::Water {
                cells[(y * w + x) as usize] = Element::Dirt;
            }
        }
    }
    water_pocket(&mut cells, seed, w, h, cx, cy);
    settle_water(&mut cells, w, h, cx, cy);
    cells
}

/// Size of the guaranteed water pocket for a seed: (width, height) in cells.
pub fn water_pocket_size(seed: u64) -> (i32, i32) {
    let k = hash2(seed ^ 0x57A7_E4, 3, 5);
    (4 + (k % 3) as i32, 2 + ((k >> 8) % 2) as i32)
}

/// Seal a full pocket of water in the dirt below and to the right of the
/// start room, a short dig from its floor, so the first drink is never a
/// blind hunt. Everything around it is made solid, so it is sealed and cannot
/// leak into caves: only natural ore keeps its place.
fn water_pocket(cells: &mut [Element], seed: u64, w: i32, h: i32, cx: i32, cy: i32) {
    let (pw, ph) = water_pocket_size(seed);
    let at = |x: i32, y: i32| (y * w + x) as usize;
    let (x0, y0) = (cx + WATER_POCKET_RIGHT, cy + WATER_POCKET_DEPTH);
    let (x1, y1) = (x0 + pw - 1, y0 + ph - 1);
    if x1 + 1 >= w || y1 + 1 >= h {
        return;
    }
    // A solid shell around the pocket and a plug of solid ground over it, up to the start shell.
    for y in cy + 1..=y1 + 1 {
        for x in x0 - 1..=x1 + 1 {
            if matches!(cells[at(x, y)], Element::Floor | Element::Water) {
                cells[at(x, y)] = Element::Dirt;
            }
        }
    }
    for y in y0..=y1 {
        for x in x0..=x1 {
            cells[at(x, y)] = Element::Water;
        }
    }
    debug_assert!(x0 <= cx + WATER_POCKET_SHAFT && cx + WATER_POCKET_SHAFT <= x1);
}

/// Water pressure: a surface cell that cannot fall looks along the row
/// below it, through the water there, for an open cell to flow into. This
/// levels pools out instead of leaving them stepped. Returns that cell.
pub(crate) fn water_outlet(cells: &[Element], w: i32, h: i32, x: i32, y: i32, dir: i32) -> Option<(i32, i32)> {
    const REACH: i32 = 24;
    let at = |x: i32, y: i32| (y * w + x) as usize;
    if y + 1 >= h || (y > 0 && cells[at(x, y - 1)] == Element::Water) {
        return None; // only the surface flows, and the bottom row has nowhere to go
    }
    // Step sideways onto a drop, as a single cell of water would.
    let sx = x + dir;
    if sx >= 0 && sx < w && cells[at(sx, y)] == Element::Floor && cells[at(sx, y + 1)] == Element::Floor {
        return Some((sx, y));
    }
    let mut nx = x;
    for _ in 0..REACH {
        nx += dir;
        if nx < 0 || nx >= w {
            return None;
        }
        match cells[at(nx, y + 1)] {
            Element::Water => continue,
            Element::Floor => return Some((nx, y + 1)),
            _ => return None,
        }
    }
    None
}

/// Let generated water fall to rest, then dry out any water that could flow
/// into the starting room. Water only moves down and sideways, so the only
/// water that can reach the room is water at or above the room's floor level
/// in caves that connect to it. Water in sealed caves stays as a hazard for
/// diggers to break into.
fn settle_water(cells: &mut [Element], w: i32, h: i32, cx: i32, cy: i32) {
    let at = |x: i32, y: i32| (y * w + x) as usize;
    // Pour the water down and level it out, using the same moves as the
    // game's water (fall, or step sideways towards a drop), until it rests.
    let open = |cells: &[Element], x: i32, y: i32| x >= 0 && y >= 0 && x < w && y < h && cells[at(x, y)] == Element::Floor;
    for pass in 0..2000 {
        let mut moved = false;
        let dir = if pass % 2 == 0 { 1 } else { -1 };
        for y in (0..h).rev() {
            for x in 0..w {
                if cells[at(x, y)] != Element::Water {
                    continue;
                }
                let target = if open(cells, x, y + 1) {
                    Some((x, y + 1))
                } else {
                    [dir, -dir].into_iter().find_map(|d| water_outlet(cells, w, h, x, y, d))
                };
                if let Some((tx, ty)) = target {
                    cells.swap(at(x, y), at(tx, ty));
                    moved = true;
                }
            }
        }
        if !moved {
            break;
        }
    }

    // Flood the start room's cave system through anything water can pass.
    let mut seen = vec![false; cells.len()];
    let mut stack = vec![(cx, cy)];
    seen[at(cx, cy)] = true;
    while let Some((x, y)) = stack.pop() {
        if y <= cy && cells[at(x, y)] == Element::Water {
            cells[at(x, y)] = Element::Floor;
        }
        for (nx, ny) in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)] {
            if nx < 0 || ny < 0 || nx >= w || ny >= h || seen[at(nx, ny)] {
                continue;
            }
            if matches!(cells[at(nx, ny)], Element::Floor | Element::Water) {
                seen[at(nx, ny)] = true;
                stack.push((nx, ny));
            }
        }
    }
}
