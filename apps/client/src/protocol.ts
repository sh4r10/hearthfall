// Messages between the main thread and the simulation worker.

export type ToWorker =
  | { type: 'init'; seed: number; width: number; height: number; ticksPerSecond: number }
  | { type: 'command'; kind: 'dig' | 'diffuser'; x: number; y: number };

export interface Frame {
  type: 'frame';
  tick: number;
  hash: string;
  width: number;
  height: number;
  elements: Uint8Array;
  buildings: Uint8Array;
  oxygen: Int32Array;
  co2: Int32Array;
  temperature: Int32Array;
  /** Flat [x, y, breath, ...]. */
  colonists: Int32Array;
}

export type FromWorker = Frame;

// Mirrors the enums in crates/sim/src/world.rs.
export const Element = { Floor: 0, Dirt: 1, Rock: 2, Water: 3 } as const;
export const Building = { None: 0, OxygenDiffuser: 1 } as const;
