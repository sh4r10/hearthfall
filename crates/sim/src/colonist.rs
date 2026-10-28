//! Survivors: their needs, moods and what they decide to do each tick.

use crate::nav::UNREACHED;
use crate::{Building, Sim, BREATH_MG, EVENT_DEATH, SHADE_DRAIN, SUFFOCATE_BELOW_MG};

/// Every need runs from 0 (empty) to this.
pub const STAT_MAX: i32 = 10_000;

/// Values of [`Colonist::cause`]: why they died.
pub const CAUSE_ALIVE: u8 = 0;
pub const CAUSE_FROZE: u8 = 1;
pub const CAUSE_SUFFOCATED: u8 = 2;
pub const CAUSE_TAKEN: u8 = 3;

/// Warmth lost per tick in lamp light: not warm, but not the biting dark either.
pub const LIT_COLD_DRAIN: i32 = 5;
/// A tired survivor walks at most this many steps to a free bed.
pub const BED_REACH: i32 = 40;

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Role {
    Digger = 0,
    Builder = 1,
    Firekeeper = 2,
}

impl Role {
    pub fn from_u8(v: u8) -> Option<Role> {
        [Role::Digger, Role::Builder, Role::Firekeeper].get(v as usize).copied()
    }
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Activity {
    Idle = 0,
    Walking = 1,
    Working = 2,
    Sleeping = 3,
    Eating = 4,
    Dead = 5,
}

#[derive(Clone, Debug)]
pub struct Colonist {
    pub x: u32,
    pub y: u32,
    pub role: Role,
    pub activity: Activity,
    pub breath: i32,
    /// Drops in the dark, recovers near a hearth.
    pub warmth: i32,
    /// Drains while awake, refilled by sleep.
    pub energy: i32,
    /// Drains over time, refilled by eating.
    pub fullness: i32,
    /// Drifts towards how well their needs are met. Low mood slows work.
    pub mood: i32,
    /// How restful their last sleep was: warm, lit spots sleep best.
    pub sleep_quality: i32,
    /// Id of the claimed job, if any.
    pub job: Option<u32>,
    pub path: Vec<(u32, u32)>,
    /// Cell index of the bed they have claimed, on the way to it or asleep in it.
    pub bed: Option<u32>,
    /// Why they died, one of the `CAUSE_` values. `CAUSE_ALIVE` until then.
    pub cause: u8,
    /// What the current walk is for when it is not a job: one of the `HEADING_` values.
    pub heading: u8,
    timer: u32,
}

/// Just walking (fleeing the dark, or nothing).
pub const HEADING_NONE: u8 = 0;
/// Going to the fire to warm up.
pub const HEADING_WARM: u8 = 1;
/// Stepping back out of stale air to breathe.
pub const HEADING_AIR: u8 = 2;
/// Below this breath a survivor leaves stale air for somewhere they can breathe.
pub const BREATHLESS_BELOW: i32 = STAT_MAX / 2;
/// Below this warmth a survivor drops what they are doing and goes to the fire.
pub const COLD_BELOW: i32 = STAT_MAX * 4 / 10;
/// A survivor warming up by the fire takes no work until this warm again.
pub const WARMED_ABOVE: i32 = STAT_MAX * 7 / 10;

impl Colonist {
    pub fn new(x: u32, y: u32, role: Role) -> Self {
        Colonist {
            x,
            y,
            role,
            activity: Activity::Idle,
            breath: STAT_MAX,
            warmth: STAT_MAX,
            energy: STAT_MAX * 8 / 10,
            fullness: STAT_MAX * 7 / 10,
            mood: STAT_MAX * 7 / 10,
            sleep_quality: STAT_MAX * 7 / 10,
            job: None,
            path: Vec::new(),
            bed: None,
            cause: CAUSE_ALIVE,
            heading: HEADING_NONE,
            timer: 0,
        }
    }

    pub fn alive(&self) -> bool {
        self.activity != Activity::Dead
    }

    pub(crate) fn drop_job(&mut self) {
        self.job = None;
        self.path.clear();
        if matches!(self.activity, Activity::Walking | Activity::Working) {
            self.activity = Activity::Idle;
        }
    }

    pub(crate) fn hash_into(&self, eat: &mut impl FnMut(&[u8])) {
        for v in [self.x as i32, self.y as i32, self.role as i32, self.activity as i32, self.breath, self.warmth, self.energy, self.fullness, self.mood, self.sleep_quality, self.job.map_or(-1, |j| j as i32), self.path.len() as i32, self.bed.map_or(-1, |b| b as i32), self.cause as i32, self.heading as i32, self.timer as i32] {
            eat(&v.to_le_bytes());
        }
    }
}

/// Ticks between steps while walking (10 ticks per second).
const STEP_TICKS: u32 = 2;
const EAT_TICKS: u32 = 30;
/// A ration's worth of fullness.
const MEAL: i32 = 6_000;

impl Sim {
    pub(crate) fn colonists_tick(&mut self) {
        for c in 0..self.colonists.len() {
            if self.colonists[c].alive() {
                self.update_needs(c);
            }
            if self.colonists[c].alive() {
                self.decide(c);
            }
        }
    }

    fn update_needs(&mut self, c: usize) {
        let i = self.idx(self.colonists[c].x, self.colonists[c].y);
        let dark = self.is_dark(i);
        let warm = self.is_warm(i);
        let night = self.is_night();
        let attacked = self.under_attack(c);
        let inhaled = self.oxygen[i].min(BREATH_MG);
        self.oxygen[i] -= inhaled;
        self.co2[i] += inhaled;
        let low_air = self.oxygen[i] < SUFFOCATE_BELOW_MG;

        let col = &mut self.colonists[c];
        col.breath = if low_air { col.breath - 60 } else { col.breath + 150 }.min(STAT_MAX);
        let starving = col.fullness == 0;
        let starve = if starving { 10 } else { 0 };
        col.warmth = if warm {
            col.warmth + 40 - starve
        } else if !dark {
            col.warmth - LIT_COLD_DRAIN - starve // lamp light: cold, but the dark isn't biting
        } else {
            col.warmth - if night { 24 } else { 12 } - starve
        }
        .min(STAT_MAX)
            - if attacked { SHADE_DRAIN } else { 0 };
        col.fullness = (col.fullness - 4).max(0);
        if col.activity == Activity::Sleeping {
            // Warm, lit spots give a good night's sleep. A bed in the light
            // sleeps as well as anywhere even when a little cold, and rests faster.
            let in_bed = col.bed == Some(i as u32) && self.buildings[i] == Building::Bed;
            let quality = match (in_bed, dark) {
                (true, false) => STAT_MAX,
                (true, true) => 7_000,
                (false, true) => 3_500,
                (false, false) if col.warmth > STAT_MAX * 7 / 10 => STAT_MAX,
                (false, false) => 7_000,
            };
            col.sleep_quality += (quality - col.sleep_quality) / 50;
            let rest = if in_bed { 45 } else { 30 };
            col.energy = (col.energy + rest * col.sleep_quality / STAT_MAX).min(STAT_MAX);
        } else {
            col.energy = (col.energy - if col.activity == Activity::Working { 10 } else { 6 }).max(0);
        }
        let comfort = (col.warmth + col.fullness + col.energy + col.sleep_quality) / 4 - if dark { 2_500 } else { 0 };
        col.mood += (comfort.clamp(0, STAT_MAX) - col.mood) / 200;

        if col.breath <= 0 || col.warmth <= 0 {
            // Running out of air takes precedence if both give out at once.
            col.cause = if col.breath <= 0 {
                CAUSE_SUFFOCATED
            } else if attacked {
                CAUSE_TAKEN
            } else {
                CAUSE_FROZE
            };
            col.breath = col.breath.max(0);
            col.warmth = col.warmth.max(0);
            col.activity = Activity::Dead;
            col.path.clear();
            col.bed = None;
            if let Some(id) = col.job.take() {
                if let Some(job) = self.jobs.iter_mut().find(|j| j.id == id) {
                    job.claimed_by = None;
                }
            }
            // The body comes to rest on the ground, and a cairn goes up there if
            // it has room, never in mid-air or over another building.
            let (x, mut y) = (col.x as i32, col.y as i32);
            while !self.supported(x, y) && self.open(x, y + 1) {
                y += 1;
            }
            self.colonists[c].y = y as u32;
            if self.room_for(x as u32, y as u32, Building::Cairn) {
                let i = self.idx(x as u32, y as u32);
                self.buildings[i] = Building::Cairn;
            }
            self.push_event(EVENT_DEATH, c as u32);
        }
    }

    fn release_job(&mut self, c: usize) {
        if let Some(id) = self.colonists[c].job {
            if let Some(job) = self.jobs.iter_mut().find(|j| j.id == id) {
                job.claimed_by = None;
            }
        }
        self.colonists[c].drop_job();
    }

    fn decide(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x as i32, self.colonists[c].y as i32);

        // Gravity wins over everything.
        if !self.supported(x, y) && self.open(x, y + 1) {
            self.colonists[c].y += 1;
            self.colonists[c].path.clear();
            return;
        }

        let col = &self.colonists[c];
        match col.activity {
            Activity::Sleeping => {
                let rested = col.energy >= STAT_MAX * 95 / 100 || (!self.is_night() && col.energy >= STAT_MAX * 7 / 10);
                // Nobody sleeps through a Shade.
                if rested || self.under_attack(c) {
                    let col = &mut self.colonists[c];
                    col.activity = Activity::Idle;
                    col.bed = None;
                }
                return;
            }
            Activity::Eating => {
                let col = &mut self.colonists[c];
                col.timer += 1;
                if col.timer >= EAT_TICKS {
                    col.fullness = (col.fullness + MEAL).min(STAT_MAX);
                    col.activity = Activity::Idle;
                }
                return;
            }
            _ => {}
        }

        // On the way to bed.
        if let Some(bed) = col.bed {
            let bed = bed as usize;
            let usable = matches!(self.buildings[bed], Building::Bed | Building::None);
            if usable && self.idx(col.x, col.y) == bed {
                self.colonists[c].activity = Activity::Sleeping;
                return;
            }
            if usable && !col.path.is_empty() {
                if !self.step_along(c) {
                    self.colonists[c].path.clear();
                }
                return;
            }
            // The bed is gone or the way changed: think again below.
            let col = &mut self.colonists[c];
            col.bed = None;
            col.path.clear();
            col.activity = Activity::Idle;
        }

        // Already on the way somewhere for a need: keep going, then act on arrival.
        if self.colonists[c].heading != HEADING_NONE {
            if !self.colonists[c].path.is_empty() && !self.step_along(c) {
                self.colonists[c].path.clear();
            }
            if self.colonists[c].path.is_empty() {
                let col = &mut self.colonists[c];
                col.activity = Activity::Idle;
                col.heading = HEADING_NONE;
            }
            return;
        }

        let col = &self.colonists[c];
        let here = self.idx(col.x, col.y);
        // Needs come before errands.
        if col.breath < BREATHLESS_BELOW && self.oxygen[here] < SUFFOCATE_BELOW_MG {
            // Can't breathe here: back out to fresh air, whatever the job.
            self.release_job(c);
            if self.seek_air(c) {
                return;
            }
        }
        let col = &self.colonists[c];
        if col.warmth < COLD_BELOW && !self.is_warm(here) {
            // Too cold to carry on: back to the fire, whatever the job.
            self.release_job(c);
            if self.seek_warmth(c, HEADING_WARM) {
                return;
            }
        }
        let col = &self.colonists[c];
        if col.fullness < STAT_MAX * 35 / 100 && self.food > 0 && col.activity != Activity::Working {
            self.release_job(c);
            self.food -= 1;
            let col = &mut self.colonists[c];
            col.activity = Activity::Eating;
            col.timer = 0;
            return;
        }
        let tired = col.energy < STAT_MAX / 4 || (self.is_night() && col.energy < STAT_MAX / 2);
        if tired && col.activity != Activity::Working {
            self.release_job(c);
            if !self.go_to_bed(c) && !self.go_to_floor(c) {
                // Nowhere free in reach: lie down right here, unless that is on
                // top of someone else, in which case stay up and look again.
                let col = &self.colonists[c];
                let (x, y) = (col.x, col.y);
                let crowded = self.colonists.iter().enumerate().any(|(o, other)| {
                    o != c && other.alive() && other.y == y && other.x.abs_diff(x) <= 1 && (other.activity == Activity::Sleeping || other.bed.is_some())
                });
                if !crowded {
                    self.colonists[c].activity = Activity::Sleeping;
                }
            }
            return;
        }
        // Miserable survivors refuse to work.
        if col.mood < STAT_MAX / 10 && col.job.is_some() {
            self.release_job(c);
        }

        match self.colonists[c].job {
            Some(id) => self.pursue_job(c, id),
            None => {
                if !self.colonists[c].path.is_empty() {
                    // Running for the light.
                    if !self.step_along(c) {
                        self.colonists[c].path.clear();
                    }
                    if self.colonists[c].path.is_empty() {
                        self.colonists[c].activity = Activity::Idle;
                    }
                    return;
                }
                self.colonists[c].timer += 1;
                // Someone still thawing out by the fire, or catching their breath, stays put.
                let thawing = (self.colonists[c].warmth < WARMED_ABOVE && self.is_warm(here)) || self.colonists[c].breath < STAT_MAX * 9 / 10;
                if !thawing && self.colonists[c].timer % 10 == 0 && self.colonists[c].mood >= STAT_MAX / 10 && self.claim_job(c) {
                    return;
                }
                if self.colonists[c].timer % 10 == 5 && self.flee_to_light(c) {
                    return;
                }
                if self.colonists[c].timer % 6 == 0 {
                    self.wander(c);
                }
            }
        }
    }

    /// Pick the closest doable job, preferring ones that match the survivor's role.
    fn claim_job(&mut self, c: usize) -> bool {
        if self.jobs.iter().all(|j| j.claimed_by.is_some()) {
            return false;
        }
        let col = &self.colonists[c];
        let role_taken = |role| self.colonists.iter().any(|o| o.alive() && o.role == role);
        let field = self.field_from(col.x, col.y);
        let mut best: Option<(u8, i32, usize, usize)> = None; // (priority, score, job index, stand cell)
        for (k, job) in self.jobs.iter().enumerate() {
            if job.claimed_by.is_some() || !self.job_doable(job) {
                continue;
            }
            // Leave work to the right specialist for a while, if there is one.
            let role = job.kind.role();
            if role != col.role && role_taken(role) && self.tick < job.created + crate::jobs::ROLE_PRIORITY_TICKS {
                continue;
            }
            let Some(stand) = self.stand_cell(&field.dist, job.x as i32, job.y as i32) else { continue };
            let mut score = field.dist[stand];
            if job.kind.role() != col.role {
                score += 25;
            }
            // Higher priority first, then the nearest.
            if best.map_or(true, |(p, s, _, _)| job.priority > p || (job.priority == p && score < s)) {
                best = Some((job.priority, score, k, stand));
            }
        }
        let Some((_, _, k, stand)) = best else { return false };
        let path = self.path_to(&field, stand);
        let job = &mut self.jobs[k];
        job.claimed_by = Some(c as u32);
        let col = &mut self.colonists[c];
        col.job = Some(job.id);
        col.path = path;
        col.activity = Activity::Walking;
        col.timer = 0;
        true
    }

    /// Nearest reachable, supported cell next to (or at) a job.
    fn stand_cell(&self, dist: &[i32], jx: i32, jy: i32) -> Option<usize> {
        let mut best: Option<usize> = None;
        for dy in -1..=1 {
            for dx in -1..=1 {
                let (x, y) = (jx + dx, jy + dy);
                if !self.open(x, y) || !self.supported(x, y) {
                    continue;
                }
                let i = self.idx(x as u32, y as u32);
                if dist[i] != UNREACHED && best.map_or(true, |b| dist[i] < dist[b]) {
                    best = Some(i);
                }
            }
        }
        best
    }

    fn pursue_job(&mut self, c: usize, id: u32) {
        let Some(k) = self.jobs.iter().position(|j| j.id == id) else {
            self.colonists[c].drop_job();
            return;
        };
        if !self.job_doable(&self.jobs[k]) {
            self.release_job(c);
            return;
        }
        if !self.colonists[c].path.is_empty() {
            if !self.step_along(c) {
                // The way changed under them; let the job go and choose again.
                self.release_job(c);
            }
            return;
        }

        // Nothing left to walk, but not beside the job (a fall, or a path
        // cleared for a need): find the way again, or let the job go.
        let (jx, jy) = (self.jobs[k].x, self.jobs[k].y);
        let col = &self.colonists[c];
        if col.x.abs_diff(jx) > 1 || col.y.abs_diff(jy) > 1 {
            let field = self.field_from(col.x, col.y);
            match self.stand_cell(&field.dist, jx as i32, jy as i32) {
                Some(stand) if stand != self.idx(col.x, col.y) => {
                    let path = self.path_to(&field, stand);
                    let col = &mut self.colonists[c];
                    col.path = path;
                    col.timer = 0;
                    col.activity = Activity::Walking;
                }
                _ => self.release_job(c),
            }
            return;
        }

        // Arrived: work it off. Role specialists work faster, low mood slows everyone.
        let col = &mut self.colonists[c];
        col.activity = Activity::Working;
        let mut speed = if self.jobs[k].kind.role() == col.role { 3 } else { 2 };
        if col.mood < STAT_MAX * 3 / 10 {
            speed = 1;
        }
        self.jobs[k].progress += speed;
        if self.jobs[k].progress >= self.work_needed(&self.jobs[k]) {
            let job = self.jobs.remove(k);
            self.finish_job(&job);
            self.colonists[c].drop_job();
        }
    }

    /// Take the next step along the survivor's path once it is due. Returns
    /// false if that step is no longer possible.
    fn step_along(&mut self, c: usize) -> bool {
        let col = &mut self.colonists[c];
        let Some(&(nx, ny)) = col.path.first() else { return true };
        col.activity = Activity::Walking;
        col.timer += 1;
        if col.timer < STEP_TICKS {
            return true;
        }
        col.timer = 0;
        let (x, y) = (col.x as i32, col.y as i32);
        let (moves, n) = self.moves(x, y);
        if !moves[..n].contains(&(nx as i32, ny as i32)) {
            return false;
        }
        let col = &mut self.colonists[c];
        col.x = nx;
        col.y = ny;
        col.path.remove(0);
        true
    }

    /// Claim the nearest free bed within [`BED_REACH`] and head for it.
    /// Returns false if there is none.
    fn go_to_bed(&mut self, c: usize) -> bool {
        let col = &self.colonists[c];
        let field = self.field_from(col.x, col.y);
        let taken = |i: usize| self.colonists.iter().any(|o| o.alive() && o.bed == Some(i as u32));
        let mut best: Option<usize> = None;
        for i in 0..self.buildings.len() {
            let d = field.dist[i];
            if self.buildings[i] == Building::Bed && d <= BED_REACH && best.map_or(true, |b| d < field.dist[b]) && !taken(i) {
                best = Some(i);
            }
        }
        let Some(bed) = best else { return false };
        let path = self.path_to(&field, bed);
        let col = &mut self.colonists[c];
        col.bed = Some(bed as u32);
        col.timer = 0;
        col.activity = if path.is_empty() { Activity::Sleeping } else { Activity::Walking };
        col.path = path;
        true
    }

    /// Without a bed, lie down on a free patch of floor: where they stand if it
    /// is free, else the nearest free one within [`BED_REACH`], by the fire if
    /// possible, else at least in the light.
    /// A spot is free when nothing is built there, no hearth is beside it and
    /// nobody else sleeps (or means to) within a cell of it, so sleepers never
    /// pile up on each other or on the fire. Returns false if there is none.
    fn go_to_floor(&mut self, c: usize) -> bool {
        let col = &self.colonists[c];
        let here = self.idx(col.x, col.y);
        let field = self.field_from(col.x, col.y);
        let mut best: Option<(bool, bool, i32, usize)> = None; // (cold, dark, distance, cell): lower is better
        for i in 0..self.buildings.len() {
            let d = field.dist[i];
            if d > BED_REACH || !self.floor_free(c, i) {
                continue;
            }
            let key = (!self.is_warm(i), self.is_dark(i), d, i);
            if best.map_or(true, |b| key < b) {
                best = Some(key);
            }
        }
        let Some((cold, dark, _, spot)) = best else { return false };
        // Stay put if here is free and no warmer or better lit spot is on offer.
        let spot = if self.floor_free(c, here) && (cold || self.is_warm(here)) && (dark || !self.is_dark(here)) { here } else { spot };
        let path = self.path_to(&field, spot);
        let col = &mut self.colonists[c];
        col.bed = Some(spot as u32);
        col.timer = 0;
        col.activity = if path.is_empty() { Activity::Sleeping } else { Activity::Walking };
        col.path = path;
        true
    }

    /// On a hearth or right beside it, where a survivor would stand in the flames.
    pub(crate) fn by_hearth(&self, x: i32, y: i32) -> bool {
        (-1..=1).any(|dx| {
            let nx = x + dx;
            nx >= 0 && nx < self.width as i32 && y >= 0 && y < self.height as i32 && self.buildings[self.idx(nx as u32, y as u32)] == Building::Hearth
        })
    }

    fn floor_free(&self, c: usize, i: usize) -> bool {
        let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
        if self.buildings[i] != Building::None || !self.open(x, y) || self.ladder(x, y + 1) || !self.supported(x, y) {
            return false;
        }
        let near = |j: usize| {
            let (jx, jy) = ((j as u32 % self.width) as i32, (j as u32 / self.width) as i32);
            jy == y && (jx - x).abs() <= 1
        };
        let w = self.width as i32;
        for dx in -2..=2 {
            let nx = x + dx;
            if nx >= 0 && nx < w && self.buildings[(y * w + nx) as usize] == Building::Hearth {
                return false;
            }
        }
        !self.colonists.iter().enumerate().any(|(o, other)| {
            o != c && other.alive() && (other.bed.map_or(false, |b| near(b as usize)) || (other.activity == Activity::Sleeping && near(self.idx(other.x, other.y))))
        })
    }

    /// Head for the nearest cell in firelight they can stand in, to warm up. Returns false if they are already in firelight or none is
    /// in reach.
    fn seek_warmth(&mut self, c: usize, heading: u8) -> bool {
        let col = &self.colonists[c];
        if self.is_warm(self.idx(col.x, col.y)) {
            return false;
        }
        let field = self.field_from(col.x, col.y);
        let mut best: Option<usize> = None;
        for i in 0..self.firelight.len() {
            let d = field.dist[i];
            if d != UNREACHED && d <= BED_REACH && self.is_warm(i) && best.map_or(true, |b| d < field.dist[b]) {
                let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
                if self.supported(x, y) {
                    best = Some(i);
                }
            }
        }
        let Some(to) = best else { return false };
        let path = self.path_to(&field, to);
        let col = &mut self.colonists[c];
        col.path = path;
        col.heading = heading;
        col.timer = 0;
        col.activity = Activity::Walking;
        true
    }

    /// Head for the nearest cell with enough air to breathe. Returns false if
    /// there is none in reach.
    fn seek_air(&mut self, c: usize) -> bool {
        let col = &self.colonists[c];
        let field = self.field_from(col.x, col.y);
        let mut best: Option<usize> = None;
        for i in 0..self.oxygen.len() {
            let d = field.dist[i];
            if d != UNREACHED && d <= BED_REACH && self.oxygen[i] >= SUFFOCATE_BELOW_MG * 2 && best.map_or(true, |b| d < field.dist[b]) {
                let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
                if self.supported(x, y) {
                    best = Some(i);
                }
            }
        }
        let Some(to) = best else { return false };
        let path = self.path_to(&field, to);
        let col = &mut self.colonists[c];
        col.path = path;
        col.heading = HEADING_AIR;
        col.timer = 0;
        col.activity = Activity::Walking;
        true
    }

    /// An idle survivor caught in the dark heads for the nearest lit cell they
    /// can stand in. Returns false if they are already lit or no light is in reach.
    fn flee_to_light(&mut self, c: usize) -> bool {
        let col = &self.colonists[c];
        if !self.is_dark(self.idx(col.x, col.y)) {
            return false;
        }
        let field = self.field_from(col.x, col.y);
        let mut best: Option<usize> = None;
        for i in 0..self.light.len() {
            let d = field.dist[i];
            if d != UNREACHED && !self.is_dark(i) && best.map_or(true, |b| d < field.dist[b]) {
                let (x, y) = ((i as u32 % self.width) as i32, (i as u32 / self.width) as i32);
                if self.supported(x, y) {
                    best = Some(i);
                }
            }
        }
        let Some(to) = best else { return false };
        let path = self.path_to(&field, to);
        let col = &mut self.colonists[c];
        col.path = path;
        col.timer = 0;
        col.activity = Activity::Walking;
        true
    }

    /// Idle survivors potter about, but won't step out of the light on their own.
    /// Idle survivors shuffle about in the light, but don't loiter in the fire
    /// or on top of each other: from such a spot every step away is taken first.
    fn wander(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x as i32, self.colonists[c].y as i32);
        let here_lit = !self.is_dark(self.idx(x as u32, y as u32));
        let crowded = |px: i32, py: i32| {
            self.by_hearth(px, py)
                || self.colonists.iter().enumerate().any(|(o, other)| o != c && other.alive() && (other.x as i32, other.y as i32) == (px, py))
        };
        let (moves, n) = self.moves(x, y);
        let mut options = [(x, y); 7];
        let mut m = 1;
        if crowded(x, y) {
            m = 0;
        }
        for &(mx, my) in &moves[..n] {
            // Pottering never takes anyone off a ledge or onto a ladder.
            let floor = self.supported(mx, my) && !self.ladder(mx, my) && my == y;
            if floor && (!here_lit || !self.is_dark(self.idx(mx as u32, my as u32))) && !crowded(mx, my) {
                options[m] = (mx, my);
                m += 1;
            }
        }
        if m == 0 {
            m = 1; // boxed in: stay put
        }
        let (nx, ny) = options[self.rng.below(m as u32) as usize];
        let col = &mut self.colonists[c];
        col.x = nx as u32;
        col.y = ny as u32;
        col.activity = Activity::Idle;
    }
}
