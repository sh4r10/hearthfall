// Messages between the main thread and the simulation worker.

export type Tool = 'dig' | 'ladder' | 'hearth' | 'diffuser';

export type ToWorker =
  | { type: 'init'; seed: number; width: number; height: number; ticksPerSecond: number }
  | { type: 'command'; tool: Tool; x: number; y: number };

export interface Frame {
  type: 'frame';
  tick: number;
  hash: string;
  width: number;
  height: number;
  fuel: number;
  night: boolean;
  elements: Uint8Array;
  buildings: Uint8Array;
  light: Uint8Array;
  oxygen: Int32Array;
  co2: Int32Array;
  temperature: Int32Array;
  /** Flat [x, y, breath, warmth, ...]. */
  colonists: Int32Array;
}

export type FromWorker = Frame;

export const COLONIST_STRIDE = 4;
/** Must match DAY_TICKS in crates/sim/src/lib.rs. */
export const DAY_TICKS = 1200;

// Mirror the enums in crates/sim/src/world.rs.
export const Element = { Floor: 0, Dirt: 1, Rock: 2, Water: 3, Coal: 4 } as const;
export const Building = { None: 0, OxygenDiffuser: 1, Ladder: 2, Hearth: 3 } as const;
