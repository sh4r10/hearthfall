// Messages between the main thread and the simulation worker.

export type Tool = 'dig' | 'cancel' | 'ladder' | 'hearth' | 'mushroom' | 'diffuser' | 'lamp' | 'bed';

export type ToWorker =
  | { type: 'init'; seed: number; width: number; height: number; ticksPerSecond: number }
  | { type: 'command'; tool: Tool; x: number; y: number }
  /** Order any building by its Building number, e.g. Building.Lamp or Building.Bed. */
  | { type: 'build'; building: number; x: number; y: number }
  | { type: 'role'; colonist: number; role: number };

export interface Frame {
  type: 'frame';
  tick: number;
  hash: string;
  width: number;
  height: number;
  coal: number;
  food: number;
  night: boolean;
  elements: Uint8Array;
  buildings: Uint8Array;
  light: Uint8Array;
  /** Hearth light only, 0..255; a survivor warms up where it is at least DARK_BELOW. */
  firelight: Uint8Array;
  /** Where hearth light will reach tonight if the fires stay fed. */
  nightFirelight: Uint8Array;
  hearthFuel: Int32Array;
  oxygen: Int32Array;
  co2: Int32Array;
  temperature: Int32Array;
  /** Flat, COLONIST_STRIDE each; see WebSim::colonists in crates/sim-wasm. */
  colonists: Int32Array;
  /** Flat, JOB_STRIDE each; see WebSim::jobs. */
  jobs: Int32Array;
  /** Flat, EVENT_STRIDE each (tick, kind, colonist), last 32, oldest first; see WebSim::events. */
  events: Int32Array;
  /** Flat, SHADE_STRIDE each (x, y, state: SHADE_DRIFTING or SHADE_ATTACKING); empty by day. See WebSim::shades. */
  shades: Int32Array;
}

export type FromWorker = Frame;

export const COLONIST_STRIDE = 14;
export const JOB_STRIDE = 6;
export const EVENT_STRIDE = 3;
export const SHADE_STRIDE = 3;
/** Event kinds, matching sim::EVENT_*. */
export const EVENT_DEATH = 1;
export const EVENT_SHADE_ATTACK = 2;
/** Shade states, matching sim::SHADE_*. */
export const SHADE_DRIFTING = 0;
export const SHADE_ATTACKING = 1;
/** Colonist.cause, the 14th colonist field. */
export const CAUSES: Record<number, string> = { 1: 'froze to death', 2: 'suffocated', 3: 'was taken by a Shade' };
export const STAT_MAX = 10_000;
/** Must match DAY_TICKS in crates/sim/src/lib.rs. */
export const DAY_TICKS = 1200;
/** Light below this counts as dark; must match DARK_BELOW in crates/sim/src/lib.rs. */
export const DARK_BELOW = 40;
/** Oxygen (mg) below which survivors suffocate and hearths go out; must match SUFFOCATE_BELOW_MG and HEARTH_MIN_OXYGEN_MG. */
export const SUFFOCATE_BELOW_MG = 300;
export const HEARTH_MIN_OXYGEN_MG = 150;
/** Oxygen a fresh cave cell starts with; must match START_OXYGEN_MG. */
export const START_OXYGEN_MG = 2400;

// Mirror the enums in crates/sim/src/world.rs.
export const Element = { Floor: 0, Dirt: 1, Rock: 2, Water: 3, Coal: 4 } as const;
export const Building = { None: 0, OxygenDiffuser: 1, Ladder: 2, Hearth: 3, MushroomBed: 4, Cairn: 5, Lamp: 6, Bed: 7 } as const;
export const ROLES = ['Digger', 'Builder', 'Firekeeper'] as const;
export const ACTIVITIES = ['Idle', 'Walking', 'Working', 'Sleeping', 'Eating', 'Dead'] as const;
export const JOB_NAMES = ['digging', 'building', 'refuelling a hearth'] as const;
/** Coal a hearth costs; must match HEARTH_COST in crates/sim/src/jobs.rs. */
export const HEARTH_COST = 8;
/** Coal a lamp costs; must match LAMP_COST in crates/sim/src/jobs.rs. */
export const LAMP_COST = 2;
/** Fuel a full hearth holds, and ticks each unit burns for; must match HEARTH_CAPACITY and HEARTH_BURN_TICKS. */
export const HEARTH_CAPACITY = 40;
export const HEARTH_BURN_TICKS = 40;
