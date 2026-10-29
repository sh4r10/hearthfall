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
    meals: s.meals(),
    stranger: s.stranger(),
    ...(([ore, iron, crystal, coke]) => ({ ore, iron, crystal, coke }))(s.rare_stock()),
    known: s.known(),
    researching: s.researching(),
    researchPoints: s.research_points(),
    night: s.is_night(),
    elements: s.elements(),
    buildings: s.buildings(),
    light: s.light(),
    firelight: s.firelight(),
    nightFirelight: s.night_firelight(),
    hearthFuel: s.hearth_fuel(),
    hearthClean: s.hearth_clean(),
    hearthGrate: s.hearth_grate(),
    refuelPriority: s.refuel_priority(),
    pileItem: s.pile_item(),
    pileAmount: s.pile_amount(),
    temperature: s.temperature(),
    smoke: s.smoke(),
    bedWater: s.bed_water(),
    rooms: s.rooms(),
    colonists: s.colonists(),
    jobs: s.jobs(),
    events: s.events(),
    shades: s.shades(),
  };
  const buffers = [frame.elements, frame.buildings, frame.light, frame.firelight, frame.nightFirelight, frame.hearthFuel, frame.hearthClean, frame.hearthGrate, frame.researchPoints, frame.refuelPriority, frame.pileItem, frame.pileAmount, frame.temperature, frame.smoke, frame.bedWater, frame.rooms, frame.colonists, frame.jobs, frame.events, frame.shades, frame.stranger].map(
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
      lamp: () => s.build(x, y, Building.Lamp),
      vent: () => s.build(x, y, Building.Vent),
      bed: () => s.build(x, y, Building.Bed),
      stockpile: () => s.build(x, y, Building.Stockpile),
      bench: () => s.build(x, y, Building.ResearchBench),
      coke: () => s.build(x, y, Building.CokeOven),
      smelter: () => s.build(x, y, Building.Smelter),
      'crystal-lamp': () => s.build(x, y, Building.CrystalLamp),
      grate: () => s.upgrade(x, y),
      tile: () => s.build(x, y, Building.Tile),
      door: () => s.build(x, y, Building.Door),
    })[msg.tool]();
  } else if (msg.type === 'build' && sim) {
    sim.build(msg.x, msg.y, msg.building);
  } else if (msg.type === 'role' && sim) {
    sim.set_role(msg.colonist, msg.role);
  } else if (msg.type === 'answer') {
    sim.answer_stranger(msg.accept);
  } else if (msg.type === 'pref') {
    sim.set_pref(msg.colonist, msg.skill, msg.pref);
  } else if (msg.type === 'research' && sim) {
    sim.research(msg.tech);
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
