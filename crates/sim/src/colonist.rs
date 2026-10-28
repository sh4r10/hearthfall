//! Survivors: their needs, moods and what they decide to do each tick.

use crate::nav::UNREACHED;
use crate::{Building, Sim, BREATH_MG, EVENT_DEATH, SUFFOCATE_BELOW_MG};

/// Every need runs from 0 (empty) to this.
pub const STAT_MAX: i32 = 10_000;

/// Values of [`Colonist::cause`]: why they died.
pub const CAUSE_ALIVE: u8 = 0;
pub const CAUSE_FROZE: u8 = 1;
pub const CAUSE_SUFFOCATED: u8 = 2;

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
    /// Why they died, one of the `CAUSE_` values. `CAUSE_ALIVE` until then.
    pub cause: u8,
    timer: u32,
}

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
            cause: CAUSE_ALIVE,
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
        for v in [self.x as i32, self.y as i32, self.role as i32, self.activity as i32, self.breath, self.warmth, self.energy, self.fullness, self.mood, self.sleep_quality, self.job.map_or(-1, |j| j as i32), self.path.len() as i32, self.cause as i32, self.timer as i32] {
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
        let night = self.is_night();
        let inhaled = self.oxygen[i].min(BREATH_MG);
        self.oxygen[i] -= inhaled;
        self.co2[i] += inhaled;
        let low_air = self.oxygen[i] < SUFFOCATE_BELOW_MG;

        let col = &mut self.colonists[c];
        col.breath = if low_air { col.breath - 60 } else { col.breath + 150 }.min(STAT_MAX);
        let starving = col.fullness == 0;
        col.warmth = if dark {
            col.warmth - if night { 30 } else { 15 } - if starving { 10 } else { 0 }
        } else {
            col.warmth + 40 - if starving { 10 } else { 0 }
        }
        .min(STAT_MAX);
        col.fullness = (col.fullness - 4).max(0);
        if col.activity == Activity::Sleeping {
            // Warm, lit spots give a good night's sleep.
            let quality = if dark { 3_500 } else if col.warmth > STAT_MAX * 7 / 10 { STAT_MAX } else { 7_000 };
            col.sleep_quality += (quality - col.sleep_quality) / 50;
            col.energy = (col.energy + 30 * col.sleep_quality / STAT_MAX).min(STAT_MAX);
        } else {
            col.energy = (col.energy - if col.activity == Activity::Working { 10 } else { 6 }).max(0);
        }
        let comfort = (col.warmth + col.fullness + col.energy + col.sleep_quality) / 4 - if dark { 2_500 } else { 0 };
        col.mood += (comfort.clamp(0, STAT_MAX) - col.mood) / 200;

        if col.breath <= 0 || col.warmth <= 0 {
            // Running out of air takes precedence if both give out at once.
            col.cause = if col.breath <= 0 { CAUSE_SUFFOCATED } else { CAUSE_FROZE };
            col.breath = col.breath.max(0);
            col.warmth = col.warmth.max(0);
            col.activity = Activity::Dead;
            col.path.clear();
            if let Some(id) = col.job.take() {
                if let Some(job) = self.jobs.iter_mut().find(|j| j.id == id) {
                    job.claimed_by = None;
                }
            }
            // Leave a cairn where they fell, unless something already stands there.
            if self.buildings[i] == Building::None {
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
                if rested {
                    self.colonists[c].activity = Activity::Idle;
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

        // Needs come before errands.
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
            self.colonists[c].activity = Activity::Sleeping;
            return;
        }
        // Miserable survivors refuse to work.
        if col.mood < STAT_MAX / 10 && col.job.is_some() {
            self.release_job(c);
        }

        match self.colonists[c].job {
            Some(id) => self.pursue_job(c, id),
            None => {
                self.colonists[c].timer += 1;
                if self.colonists[c].timer % 10 == 0 && self.colonists[c].mood >= STAT_MAX / 10 && self.claim_job(c) {
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
        let mut best: Option<(i32, usize, usize)> = None; // (score, job index, stand cell)
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
            if best.map_or(true, |(s, _, _)| score < s) {
                best = Some((score, k, stand));
            }
        }
        let Some((_, k, stand)) = best else { return false };
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
        let col = &mut self.colonists[c];
        if let Some(&(nx, ny)) = col.path.first() {
            col.activity = Activity::Walking;
            col.timer += 1;
            if col.timer < STEP_TICKS {
                return;
            }
            col.timer = 0;
            let (x, y) = (col.x as i32, col.y as i32);
            let (moves, n) = self.moves(x, y);
            if moves[..n].contains(&(nx as i32, ny as i32)) {
                let col = &mut self.colonists[c];
                col.x = nx;
                col.y = ny;
                col.path.remove(0);
            } else {
                // The way changed under them; let the job go and choose again.
                self.release_job(c);
            }
            return;
        }

        // Arrived: work it off. Role specialists work faster, low mood slows everyone.
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

    /// Idle survivors potter about, but won't step out of the light on their own.
    fn wander(&mut self, c: usize) {
        let (x, y) = (self.colonists[c].x as i32, self.colonists[c].y as i32);
        let here_lit = !self.is_dark(self.idx(x as u32, y as u32));
        let (moves, n) = self.moves(x, y);
        let mut options = [(x, y); 7];
        let mut m = 1;
        for &(mx, my) in &moves[..n] {
            if !here_lit || !self.is_dark(self.idx(mx as u32, my as u32)) {
                options[m] = (mx, my);
                m += 1;
            }
        }
        let (nx, ny) = options[self.rng.below(m as u32) as usize];
        let col = &mut self.colonists[c];
        col.x = nx as u32;
        col.y = ny as u32;
        col.activity = Activity::Idle;
    }
}
