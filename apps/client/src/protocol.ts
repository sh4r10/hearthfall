// Messages between the main thread and the simulation worker.

export type Tool = 'dig' | 'cancel' | 'ladder' | 'hearth' | 'mushroom' | 'diffuser';

export type ToWorker =
  | { type: 'init'; seed: number; width: number; height: number; ticksPerSecond: number }
  | { type: 'command'; tool: Tool; x: number; y: number }
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
}

export type FromWorker = Frame;

export const COLONIST_STRIDE = 14;
export const JOB_STRIDE = 6;
export const EVENT_STRIDE = 3;
/** Event kinds, matching sim::EVENT_*. */
export const EVENT_DEATH = 1;
/** Colonist.cause, the 14th colonist field. */
export const CAUSES: Record<number, string> = { 1: 'froze to death', 2: 'suffocated' };
export const STAT_MAX = 10_000;
/** Must match DAY_TICKS in crates/sim/src/lib.rs. */
export const DAY_TICKS = 1200;

// Mirror the enums in crates/sim/src/world.rs.
export const Element = { Floor: 0, Dirt: 1, Rock: 2, Water: 3, Coal: 4 } as const;
export const Building = { None: 0, OxygenDiffuser: 1, Ladder: 2, Hearth: 3, MushroomBed: 4, Cairn: 5 } as const;
export const ROLES = ['Digger', 'Builder', 'Firekeeper'] as const;
export const ACTIVITIES = ['Idle', 'Walking', 'Working', 'Sleeping', 'Eating', 'Dead'] as const;
export const JOB_NAMES = ['digging', 'building', 'refuelling a hearth'] as const;
/** Coal a hearth costs; must match HEARTH_COST in crates/sim/src/jobs.rs. */
export const HEARTH_COST = 8;
