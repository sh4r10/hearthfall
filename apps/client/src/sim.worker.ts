// Runs the Rust/WebAssembly simulation at a fixed tick rate, off the main thread.
import init, { WebSim } from '../../../crates/sim-wasm/pkg/sim_wasm.js';
import wasmUrl from '../../../crates/sim-wasm/pkg/sim_wasm_bg.wasm?url';
import { Building, type Frame, type ToWorker } from './protocol';

let sim: WebSim | undefined;
let ticksPerSecond = 10;
let speed = 1;
let timer: ReturnType<typeof setInterval> | undefined;

/** Run at `speed` times the normal tick rate, or not at all when 0. */
function setSpeed(s: WebSim, next: number) {
  speed = next;
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
  if (speed > 0) {
    timer = setInterval(() => {
      s.step();
      sendFrame(s);
    }, 1000 / (ticksPerSecond * speed));
  }
}

function sendFrame(s: WebSim) {
  const frame: Frame = {
    type: 'frame',
    tick: Number(s.tick()),
    hash: s.state_hash().toString(16),
    width: s.width(),
    height: s.height(),
    coal: s.coal(),
    stone: s.stone(),
    food: s.food(),
    night: s.is_night(),
    elements: s.elements(),
    buildings: s.buildings(),
    light: s.light(),
    firelight: s.firelight(),
    nightFirelight: s.night_firelight(),
    hearthFuel: s.hearth_fuel(),
    refuelPriority: s.refuel_priority(),
    oxygen: s.oxygen(),
    co2: s.co2(),
    temperature: s.temperature(),
    colonists: s.colonists(),
    jobs: s.jobs(),
    events: s.events(),
    shades: s.shades(),
  };
  const buffers = [frame.elements, frame.buildings, frame.light, frame.firelight, frame.nightFirelight, frame.hearthFuel, frame.refuelPriority, frame.oxygen, frame.co2, frame.temperature, frame.colonists, frame.jobs, frame.events, frame.shades].map(
    (a) => a.buffer as ArrayBuffer,
  );
  postMessage(frame, { transfer: buffers });
}

self.onmessage = async (event: MessageEvent<ToWorker>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    // The wasm is inlined as a data URL so the game can ship as one file.
    const bytes = Uint8Array.from(atob(wasmUrl.split(',')[1]), (c) => c.charCodeAt(0));
    await init({ module_or_path: bytes });
    const s = new WebSim(BigInt(msg.seed), msg.width, msg.height);
    sim = s;
    ticksPerSecond = msg.ticksPerSecond;
    sendFrame(s);
    setSpeed(s, speed);
    return;
  }
  if (!sim) return;
  if (msg.type === 'speed') return setSpeed(sim, msg.speed);
  if (msg.type === 'command' && sim) {
    // Commands are queued and applied at the start of the next tick, the same
    // way lockstep multiplayer will schedule them.
    const { x, y } = msg;
    const s = sim;
    ({
      dig: () => s.dig(x, y),
      cancel: () => s.cancel(x, y),
      priority: () => {},
      deconstruct: () => s.deconstruct(x, y),
      ladder: () => s.build(x, y, Building.Ladder),
      hearth: () => s.build(x, y, Building.Hearth),
      mushroom: () => s.build(x, y, Building.MushroomBed),
      diffuser: () => s.build(x, y, Building.OxygenDiffuser),
      lamp: () => s.build(x, y, Building.Lamp),
      bed: () => s.build(x, y, Building.Bed),
    })[msg.tool]();
  } else if (msg.type === 'build' && sim) {
    sim.build(msg.x, msg.y, msg.building);
  } else if (msg.type === 'role' && sim) {
    sim.set_role(msg.colonist, msg.role);
  } else if (msg.type === 'priority' && sim) {
    sim.set_priority(msg.x, msg.y, msg.priority);
  }
  // Paused, nothing would step: apply orders now so they show. It is the same
  // as leaving them for the next tick, which applies its commands first.
  if (speed === 0) {
    sim.apply_queued();
    sendFrame(sim);
  }
};
