//! Who each survivor is: which of the cast they are, their traits and
//! temperament (rolled from the seeded rng, so two Esks in two runs differ),
//! their skills, which grow with use, and their morale against what they
//! expect. Also the strangers who turn up at the edge of the light, whom the
//! player takes in or turns away.

use crate::colonist::{Colonist, Role, COLD_BELOW, STAT_MAX};
use crate::jobs::JobKind;
use crate::rng::Rng;
use crate::{Building, Sim, DAY_TICKS, EVENT_ARRIVAL};

/// The cast, in art order: survivor-N art is cast member N.
pub const CAST: [&str; 6] = ["Esk", "Mara", "Tobin", "Ostra", "Pim", "Ruta"];
/// The colony never grows past the cast.
pub const MAX_COLONISTS: usize = CAST.len();

// --- Skills ----------------------------------------------------------------------

/// Skills, one per kind of errand. Indexes into [`Colonist::xp`].
pub const SKILL_DIG: usize = 0;
pub const SKILL_BUILD: usize = 1;
/// Refuelling hearths and cooking.
pub const SKILL_FIRE: usize = 2;
pub const SKILL_HAUL: usize = 3;
/// Study at the research bench.
pub const SKILL_RESEARCH: usize = 4;
pub const SKILLS: usize = 5;
/// No skill goes past this level.
pub const MAX_LEVEL: i32 = 10;
/// Experience for level `n` is `LEVEL_XP * n * (n + 1) / 2`: level 1 after
/// about 20 s of work, level 5 after several days of it.
pub const LEVEL_XP: i32 = 200;

/// Level reached with `xp` experience.
pub fn level(xp: i32) -> i32 {
    let mut n = 0;
    while n < MAX_LEVEL && xp >= xp_for(n + 1) {
        n += 1;
    }
    n
}

/// Experience needed for level `n`.
pub fn xp_for(n: i32) -> i32 {
    LEVEL_XP * n * (n + 1) / 2
}

impl JobKind {
    /// The skill this errand uses and trains, which is also its errand group
    /// in [`Colonist::prefs`].
    pub fn skill(self) -> usize {
        match self {
            JobKind::Dig => SKILL_DIG,
            JobKind::Build(_) | JobKind::Deconstruct | JobKind::Upgrade => SKILL_BUILD,
            JobKind::Refuel | JobKind::Cook | JobKind::Refine => SKILL_FIRE,
            JobKind::Haul | JobKind::Water | JobKind::Fetch | JobKind::Pump => SKILL_HAUL,
            JobKind::Research => SKILL_RESEARCH,
        }
    }
}

/// The role that leans on each skill.
pub fn skill_role(skill: usize) -> Role {
    [Role::Digger, Role::Builder, Role::Firekeeper, Role::Hauler, Role::Researcher][skill]
}

// --- Errand preferences ----------------------------------------------------------

/// How keen a survivor is on a group of errands, the player's per-person
/// priority. Off means never; among errands they would take, a higher
/// preference wins over the order's own priority.
pub const PREF_OFF: u8 = 0;
pub const PREF_LOW: u8 = 1;
pub const PREF_NORMAL: u8 = 2;
pub const PREF_HIGH: u8 = 3;

// --- Traits -------------------------------------------------------------------------

/// Bit flags in [`Colonist::traits`]. Everyone gets one good and one bad.
pub const TRAIT_IRON_LUNGS: u16 = 1 << 0;
pub const TRAIT_FROSTBORN: u16 = 1 << 1;
pub const TRAIT_QUICK_LEARNER: u16 = 1 << 2;
pub const TRAIT_HARD_WORKER: u16 = 1 << 3;
pub const TRAIT_CHEERFUL: u16 = 1 << 4;
pub const TRAIT_SOUND_SLEEPER: u16 = 1 << 5;
pub const TRAIT_LIGHT_EATER: u16 = 1 << 6;
pub const TRAIT_NIGHT_OWL: u16 = 1 << 7;
pub const TRAIT_AFRAID_OF_DARK: u16 = 1 << 8;
pub const TRAIT_BIG_APPETITE: u16 = 1 << 9;
pub const TRAIT_GLOOMY: u16 = 1 << 10;
pub const TRAIT_DAWDLER: u16 = 1 << 11;
pub const TRAIT_LIGHT_SLEEPER: u16 = 1 << 12;
pub const TRAIT_PICKY_EATER: u16 = 1 << 13;
pub const TRAIT_THIN_BLOODED: u16 = 1 << 14;

const GOOD: [u16; 8] = [TRAIT_IRON_LUNGS, TRAIT_FROSTBORN, TRAIT_QUICK_LEARNER, TRAIT_HARD_WORKER, TRAIT_CHEERFUL, TRAIT_SOUND_SLEEPER, TRAIT_LIGHT_EATER, TRAIT_NIGHT_OWL];
const BAD: [u16; 7] = [TRAIT_AFRAID_OF_DARK, TRAIT_BIG_APPETITE, TRAIT_GLOOMY, TRAIT_DAWDLER, TRAIT_LIGHT_SLEEPER, TRAIT_PICKY_EATER, TRAIT_THIN_BLOODED];

// --- Food -------------------------------------------------------------------------

/// Values of [`Colonist::last_meal`].
pub const MEAL_NONE: u8 = 0;
/// A raw mushroom ration from the stockpile.
pub const MEAL_RAW: u8 = 1;
/// Mushrooms roasted at a hearth by a firekeeper.
pub const MEAL_ROAST: u8 = 2;
/// A cook turns this many raw rations and one coal into [`COOK_MEALS`] roast meals.
pub const COOK_RAW: i32 = 2;
pub const COOK_MEALS: i32 = 3;
/// Cooking only uses coal when the stockpile has at least this much (enough to
/// refill a hearth twice over, and more than the colony starts with), so it
/// never competes with the fire and waits until coal has been dug.
pub const COOK_COAL_RESERVE: i32 = 25;
/// Firekeepers cook until the colony has this many roast meals per survivor.
pub const MEALS_PER_HEAD: i32 = 2;

// --- Morale ------------------------------------------------------------------------

/// The parts morale is summed from, in this order in [`Sim::morale_parts`].
pub const MORALE_FOOD: usize = 0;
pub const MORALE_SLEEP: usize = 1;
pub const MORALE_FIRE: usize = 2;
pub const MORALE_DARK: usize = 3;
pub const MORALE_SMOKE: usize = 4;
pub const MORALE_HARDSHIP: usize = 5;
pub const MORALE_TEMPER: usize = 6;
pub const MORALE_THIRST: usize = 7;
pub const MORALE_PARTS: usize = 8;
/// Mood settles here when morale exactly meets expectations, and moves this
/// much per point above or below.
pub const MOOD_AT_PAR: i32 = STAT_MAX * 6 / 10;
pub const MOOD_PER_POINT: i32 = STAT_MAX / 10;

/// Values of [`Colonist::slept`]: where they last slept.
pub const SLEPT_NOWHERE: u8 = 0;
pub const SLEPT_FLOOR_DARK: u8 = 1;
pub const SLEPT_FLOOR_LIT: u8 = 2;
pub const SLEPT_BED_DARK: u8 = 3;
pub const SLEPT_BED_LIT: u8 = 4;
/// In a bed in a bedroom: a closed room with no fire (see `crate::ROOM_BEDROOM`).
pub const SLEPT_BEDROOM: u8 = 5;

// --- Arrivals ----------------------------------------------------------------------

/// Strangers can turn up at dawn from this day on, every other day.
pub const REFUGEE_FIRST_DAY: u64 = 3;
/// A stranger only asks to join a colony with this much food to spare.
pub const REFUGEE_FOOD: i32 = 5;
/// [`crate::Event::kind`] for a stranger at the edge of the light, waiting for an answer.
pub const EVENT_STRANGER: u8 = 7;
/// [`crate::Event::kind`] for a stranger turned away, or tired of waiting at nightfall.
pub const EVENT_TURNED_AWAY: u8 = 8;

/// Who someone is beyond their role: rolled once when they appear.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Temper {
    /// Warmth at which they give up and go to the fire. The bold push on longer.
    pub cold_at: i32,
    /// Fullness at which they stop to eat.
    pub hungry_at: i32,
    /// Energy at which they go to bed by day (by night it is twice this).
    pub tired_at: i32,
    /// Ticks between looking for work while idle: eager ones look often.
    pub eagerness: u32,
    /// Ticks between shuffles while idle.
    pub fidget: u32,
}

impl Temper {
    pub fn roll(rng: &mut Rng) -> Temper {
        let spread = |rng: &mut Rng, mid: i32, half: i32| mid - half + rng.below(2 * half as u32 + 1) as i32;
        Temper {
            cold_at: spread(rng, COLD_BELOW, STAT_MAX / 10),
            hungry_at: spread(rng, STAT_MAX * 35 / 100, STAT_MAX / 20),
            tired_at: spread(rng, STAT_MAX / 4, STAT_MAX / 20),
            eagerness: 6 + rng.below(9),
            fidget: 4 + rng.below(6),
        }
    }

    pub(crate) fn hash_into(&self, eat: &mut impl FnMut(&[u8])) {
        for v in [self.cold_at, self.hungry_at, self.tired_at, self.eagerness as i32, self.fidget as i32] {
            eat(&v.to_le_bytes());
        }
    }
}

impl Colonist {
    /// A new survivor: cast member `who`, good at `knack`. Their traits,
    /// temperament and starting skills come from `rng`.
    pub fn roll(x: u32, y: u32, who: u8, knack: usize, rng: &mut Rng) -> Colonist {
        let mut c = Colonist::new(x, y, skill_role(knack));
        c.who = who;
        c.knack = knack as u8;
        c.traits = GOOD[rng.below(GOOD.len() as u32) as usize] | BAD[rng.below(BAD.len() as u32) as usize];
        c.temper = Temper::roll(rng);
        for s in 0..SKILLS {
            let lvl = if s == knack { 2 + rng.below(2) as i32 } else { rng.below(2) as i32 };
            c.xp[s] = xp_for(lvl);
        }
        c
    }

    pub fn has(&self, t: u16) -> bool {
        self.traits & t != 0
    }

    pub fn level(&self, skill: usize) -> i32 {
        level(self.xp[skill])
    }

    /// What they expect out of life: the more skilled, the more they expect,
    /// as in Oxygen Not Included. Starts low, so the first days are easy.
    pub fn expectation(&self) -> i32 {
        (0..SKILLS).map(|s| self.level(s)).sum::<i32>() / 3
    }

    /// Experience from a tick of work with `skill`: double for quick learners,
    /// and a bit more at their knack.
    pub(crate) fn train(&mut self, skill: usize) {
        let mut gain = if self.has(TRAIT_QUICK_LEARNER) { 2 } else { 1 };
        if skill == self.knack as usize {
            gain += 1;
        }
        self.xp[skill] = (self.xp[skill] + gain).min(xp_for(MAX_LEVEL));
    }
}

impl Sim {
    /// Work done per tick on a job, in tenths of a unit of `work_needed`.
    /// Role specialists and skilled hands work faster, low mood and smoke
    /// slow everyone, and night owls come alive after dark.
    pub(crate) fn work_speed(&self, c: usize, kind: JobKind, coughing: bool) -> i32 {
        let col = &self.colonists[c];
        let mut speed = 20 + col.level(kind.skill()) * 2;
        if kind.role() == col.role {
            speed += 10;
        }
        if col.has(TRAIT_HARD_WORKER) {
            speed += 4;
        }
        if col.has(TRAIT_DAWDLER) {
            speed -= 4;
        }
        if col.has(TRAIT_NIGHT_OWL) && self.is_night() {
            speed += 6;
        }
        if col.mood < STAT_MAX * 3 / 10 {
            speed /= 2;
        }
        // Parched: nothing left to drink for a while, and it shows.
        if col.thirst == 0 {
            speed /= 2;
        }
        if coughing {
            speed -= 10;
        }
        speed.max(5)
    }

    /// What makes up a survivor's morale right now, part by part (see the
    /// `MORALE_` indexes). Their mood drifts towards how this compares to
    /// what they expect.
    pub fn morale_parts(&self, c: usize) -> [i32; MORALE_PARTS] {
        let col = &self.colonists[c];
        let i = self.idx(col.x, col.y);
        let mut p = [0; MORALE_PARTS];
        p[MORALE_FOOD] = match col.last_meal {
            MEAL_ROAST => 2,
            MEAL_RAW if col.has(TRAIT_PICKY_EATER) => -2,
            _ => 0,
        };
        p[MORALE_SLEEP] = match col.slept {
            SLEPT_BEDROOM => 3,
            SLEPT_BED_LIT => 2,
            SLEPT_BED_DARK => 1,
            SLEPT_FLOOR_DARK if !col.has(TRAIT_SOUND_SLEEPER) => -1,
            _ => 0,
        };
        p[MORALE_FIRE] = self.is_warm(i) as i32;
        // Thirsty: below the point where they would go for a drink.
        p[MORALE_THIRST] = if col.thirst < col.temper.hungry_at { -2 } else { 0 };
        if self.is_dark(i) {
            p[MORALE_DARK] = if col.has(TRAIT_AFRAID_OF_DARK) { -4 } else if col.has(TRAIT_NIGHT_OWL) { -1 } else { -2 };
        }
        if self.smoke[i] >= crate::SMOKY && !col.has(TRAIT_IRON_LUNGS) {
            p[MORALE_SMOKE] = -2;
        }
        p[MORALE_HARDSHIP] = -2 * ((col.warmth < STAT_MAX * 4 / 10) as i32 + (col.fullness < STAT_MAX / 4) as i32 + (col.energy < STAT_MAX / 5) as i32);
        let at_knack = col.job.and_then(|id| self.jobs.iter().find(|j| j.id == id)).map_or(false, |j| j.kind.skill() == col.knack as usize)
            && col.activity == crate::Activity::Working;
        p[MORALE_TEMPER] = at_knack as i32 + if col.has(TRAIT_CHEERFUL) { 2 } else { 0 } - if col.has(TRAIT_GLOOMY) { 2 } else { 0 };
        p
    }

    pub fn morale(&self, c: usize) -> i32 {
        self.morale_parts(c).iter().sum()
    }

    /// Where a survivor's mood is heading: [`MOOD_AT_PAR`] when morale meets
    /// expectations, up or down a tenth per point of difference.
    pub(crate) fn mood_target(&self, c: usize) -> i32 {
        (MOOD_AT_PAR + (self.morale(c) - self.colonists[c].expectation()) * MOOD_PER_POINT).clamp(0, STAT_MAX)
    }

    /// Esk and Mara, rolled from the sim's rng: Esk digs and Mara keeps the fire.
    pub(crate) fn first_two(&mut self, cx: u32, cy: u32) {
        let esk = Colonist::roll(cx - 3, cy, 0, SKILL_DIG, &mut self.rng);
        let mara = Colonist::roll(cx + 3, cy, 1, SKILL_FIRE, &mut self.rng);
        self.colonists = vec![esk, mara];
    }

    /// At dawn every other day from [`REFUGEE_FIRST_DAY`], a stranger drawn by
    /// the firelight waits at the edge of the light, if there is a free bed,
    /// food to spare and a fire to stand by. They are one of the cast not yet
    /// in the colony, with their own rolled traits and skills. They wait
    /// until nightfall for the player to take them in or turn them away.
    pub(crate) fn strangers_tick(&mut self) {
        if self.stranger.is_some() && self.is_night() {
            self.stranger = None;
            self.push_event(EVENT_TURNED_AWAY, self.colonists.len() as u32);
            return;
        }
        let day = self.day();
        if self.stranger.is_some() || self.tick % DAY_TICKS != 0 || day < REFUGEE_FIRST_DAY || (day - REFUGEE_FIRST_DAY) % 2 != 0 {
            return;
        }
        if self.colonists.len() >= MAX_COLONISTS || self.food + self.meals < REFUGEE_FOOD || !self.bed_free() || self.arrival_spot().is_none() {
            return;
        }
        let missing: Vec<u8> = (0..CAST.len() as u8).filter(|&w| !self.colonists.iter().any(|c| c.who == w)).collect();
        let who = missing[self.rng.below(missing.len() as u32) as usize];
        let knack = self.rng.below(SKILLS as u32) as usize;
        self.stranger = Some(Colonist::roll(0, 0, who, knack, &mut self.rng));
        self.push_event(EVENT_STRANGER, self.colonists.len() as u32);
    }

    fn bed_free(&self) -> bool {
        (0..self.buildings.len()).any(|i| self.buildings[i] == Building::Bed && !self.colonists.iter().any(|c| c.alive() && c.bed == Some(i as u32)))
    }

    /// A free patch of floor in the firelight, away from the fire.
    fn arrival_spot(&self) -> Option<usize> {
        let w = self.width as i32;
        (0..self.buildings.len()).find(|&i| {
            let (x, y) = (i as i32 % w, i as i32 / w);
            self.is_warm(i) && self.open(x, y) && self.supported(x, y) && self.buildings[i] == Building::None && !self.by_hearth(x, y)
                && !self.colonists.iter().any(|c| c.alive() && (c.x as i32, c.y as i32) == (x, y))
        })
    }

    /// The player's answer to the stranger waiting at the edge of the light.
    pub(crate) fn answer_stranger(&mut self, accept: bool) {
        let Some(mut c) = self.stranger.take() else { return };
        let spot = if accept { self.arrival_spot() } else { None };
        match spot {
            Some(spot) => {
                c.x = spot as u32 % self.width;
                c.y = spot as u32 / self.width;
                self.colonists.push(c);
                self.push_event(EVENT_ARRIVAL, self.colonists.len() as u32 - 1);
            }
            None => self.push_event(EVENT_TURNED_AWAY, self.colonists.len() as u32),
        }
    }

    /// Raise a cooking errand at a lit hearth when there are raw rations to
    /// roast, coal to spare and too few meals. One at a time.
    pub(crate) fn raise_cook_job(&mut self) {
        if self.jobs.iter().any(|j| j.kind == JobKind::Cook) {
            return;
        }
        let want = MEALS_PER_HEAD * self.alive_colonists() as i32;
        if self.food < COOK_RAW || self.coal < COOK_COAL_RESERVE || self.meals >= want {
            return;
        }
        if let Some(i) = (0..self.buildings.len()).find(|&i| self.buildings[i] == Building::Hearth && self.hearth_lit(i)) {
            self.add_job(i as u32 % self.width, i as u32 / self.width, JobKind::Cook);
        }
    }
}
