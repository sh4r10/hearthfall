// Messages between the main thread and the simulation worker.

export type Tool = 'dig' | 'cancel' | 'deconstruct' | 'priority' | 'ladder' | 'hearth' | 'mushroom' | 'lamp' | 'bed';

export type ToWorker =
  | { type: 'init'; seed: number; width: number; height: number; ticksPerSecond: number }
  | { type: 'command'; tool: Tool; x: number; y: number }
  /** Order any building by its Building number, e.g. Building.Lamp or Building.Bed. */
  | { type: 'build'; building: number; x: number; y: number }
  | { type: 'role'; colonist: number; role: number }
  /** Set the priority (1 to 9) of the order on a cell. */
  | { type: 'priority'; x: number; y: number; priority: number }
  /** Ticks per second as a multiple of the normal rate; 0 pauses. */
  | { type: 'speed'; speed: number };

export interface Frame {
  type: 'frame';
  tick: number;
  hash: string;
  width: number;
  height: number;
  coal: number;
  stone: number;
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
  /** Priority each hearth's refuel errands get, by cell. */
  refuelPriority: Uint8Array;
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

export const COLONIST_STRIDE = 13;
export const JOB_STRIDE = 8;
export const EVENT_STRIDE = 3;
export const SHADE_STRIDE = 3;
/** Event kinds, matching sim::EVENT_*. */
export const EVENT_DEATH = 1;
export const EVENT_SHADE_ATTACK = 2;
/** A building fell because its floor went; the event's colonist field is the Building number. */
export const EVENT_COLLAPSE = 3;
export const EVENT_ARRIVAL = 4;
/** Shade states, matching sim::SHADE_*. */
export const SHADE_DRIFTING = 0;
export const SHADE_ATTACKING = 1;
/** Colonist.cause, the 13th colonist field; must match sim::CAUSE_*. */
export const CAUSES: Record<number, string> = { 1: 'froze to death', 2: 'was taken by a Shade' };
export const STAT_MAX = 10_000;
/** Must match DAY_TICKS in crates/sim/src/lib.rs. */
export const DAY_TICKS = 1200;
/** Light below this counts as dark; must match DARK_BELOW in crates/sim/src/lib.rs. */
export const DARK_BELOW = 40;

// Mirror the enums in crates/sim/src/world.rs. Building 1 was the oxygen diffuser; the number stays unused.
export const Element = { Floor: 0, Dirt: 1, Rock: 2, Water: 3, Coal: 4 } as const;
export const Building = { None: 0, Ladder: 2, Hearth: 3, MushroomBed: 4, Cairn: 5, Lamp: 6, Bed: 7 } as const;
export const ROLES = ['Digger', 'Builder', 'Firekeeper'] as const;
export const ACTIVITIES = ['Idle', 'Walking', 'Working', 'Sleeping', 'Eating', 'Dead'] as const;
export const JOB_NAMES = ['digging', 'building', 'refuelling a hearth', 'taking a building down'] as const;
/** Job kinds, the third job field; must match JobKind::code in crates/sim/src/jobs.rs. */
export const JOB_DIG = 0, JOB_BUILD = 1, JOB_REFUEL = 2, JOB_DECONSTRUCT = 3;
/** Order priorities, the seventh job field; must match DEFAULT_PRIORITY and MAX_PRIORITY in crates/sim/src/jobs.rs. */
export const DEFAULT_PRIORITY = 5, MAX_PRIORITY = 9;
/** Why an order is stuck, the eighth job field; must match the BLOCK_ values in crates/sim/src/orders.rs. */
export const BLOCK_NONE = 0, BLOCK_UNREACHABLE = 1, BLOCK_NO_COAL = 2, BLOCK_NO_STONE = 3, BLOCK_UNDER_BUILDING = 4, BLOCK_NO_HANDS = 5;
export const BLOCK_REASONS: Record<number, string> = {
  [BLOCK_UNREACHABLE]: "can't be reached",
  [BLOCK_NO_COAL]: 'needs more coal',
  [BLOCK_NO_STONE]: 'needs more stone',
  [BLOCK_UNDER_BUILDING]: 'is under a building nobody is taking down',
  [BLOCK_NO_HANDS]: 'has nobody free to do it',
};
/** What each building costs as [coal, stone]; must match build_cost in crates/sim/src/jobs.rs. */
export const BUILD_COST: Record<number, [number, number]> = {
  [Building.Hearth]: [8, 4],
  [Building.Lamp]: [2, 1],
  [Building.Ladder]: [0, 1],
  [Building.MushroomBed]: [0, 2],
  [Building.Bed]: [0, 3],
};
export const HEARTH_COST = BUILD_COST[Building.Hearth][0];
export const LAMP_COST = BUILD_COST[Building.Lamp][0];
/** Fuel a full hearth holds, and ticks each unit burns for; must match HEARTH_CAPACITY and HEARTH_BURN_TICKS. */
export const HEARTH_CAPACITY = 40;
export const HEARTH_BURN_TICKS = 40;
/** How far hearth and lamp light reach by day and by night; must match LIGHT_RADIUS_* and LAMP_RADIUS_* in crates/sim/src/lib.rs. */
export const LIGHT_RADIUS_DAY = 13, LIGHT_RADIUS_NIGHT = 8, LAMP_RADIUS_DAY = 4, LAMP_RADIUS_NIGHT = 3;
/** A mushroom bed out of the firelight grows a ration this often; must match MUSHROOM_TICKS. */
export const MUSHROOM_TICKS = 400;
