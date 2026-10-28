// Runs the Rust/WebAssembly simulation at a fixed tick rate, off the main thread.
import init, { WebSim } from '../../../crates/sim-wasm/pkg/sim_wasm.js';
import type { Frame, ToWorker } from './protocol';

let sim: WebSim | undefined;

function sendFrame(s: WebSim) {
  const frame: Frame = {
    type: 'frame',
    tick: Number(s.tick()),
    hash: s.state_hash().toString(16),
    width: s.width(),
    height: s.height(),
    elements: s.elements(),
    buildings: s.buildings(),
    oxygen: s.oxygen(),
    co2: s.co2(),
    temperature: s.temperature(),
    colonists: s.colonists(),
  };
  const buffers = [frame.elements, frame.buildings, frame.oxygen, frame.co2, frame.temperature, frame.colonists].map(
    (a) => a.buffer as ArrayBuffer,
  );
  postMessage(frame, { transfer: buffers });
}

self.onmessage = async (event: MessageEvent<ToWorker>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    await init();
    const s = new WebSim(BigInt(msg.seed), msg.width, msg.height);
    sim = s;
    sendFrame(s);
    setInterval(() => {
      s.step();
      sendFrame(s);
    }, 1000 / msg.ticksPerSecond);
  } else if (msg.type === 'command' && sim) {
    // Commands are queued and applied at the start of the next tick, the same
    // way lockstep multiplayer will schedule them.
    if (msg.kind === 'dig') sim.dig(msg.x, msg.y);
    else sim.build_diffuser(msg.x, msg.y);
  }
};
