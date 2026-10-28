# Hearthfall

A side-on browser colony-survival game. The sun has dimmed, the surface has frozen, and a handful of survivors dig into the rock with the last of their fire. Keep the hearths burning, dig coal for fuel, and get through the nights. See [docs/design.md](docs/design.md). Solo, co-op and competitive multiplayer with a leaderboard are planned.

## Layout

| Path | What it is |
|---|---|
| `crates/sim` | Deterministic simulation core in Rust (map generation, gas and water with gravity, heat, hearth light, colonists). Integer-only maths and a seeded RNG, so the same seed and commands always produce the same state hash. Not tied to any renderer, so it can also run on the server or in Godot via GDExtension. |
| `crates/sim-wasm` | wasm-bindgen wrapper that exposes the sim to the browser. |
| `apps/client` | TypeScript + Three.js client: side-on, low-poly 3D built in code (`src/models.ts` registry), with firelight shadows and bloom. The sim runs in a Web Worker at a fixed 10 ticks per second; the renderer interpolates between ticks. `pnpm --filter client build:single` packs it into one HTML file. |

## Running it

Needs Rust (with the `wasm32-unknown-unknown` target), [wasm-pack](https://rustwasm.github.io/wasm-pack/), Node 20+ and pnpm.

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
pnpm install
pnpm dev          # builds the sim to WebAssembly and starts Vite
```

Add `?seed=123` to the URL to play a specific map.

Controls: drag to pan, scroll to zoom, click (or shift-drag) to mark orders that survivors carry out. `1` dig, `2` ladder, `3` hearth, `4` mushroom bed, `5` oxygen diffuser, `X` cancel. `O`, `C` and `T` toggle the oxygen, CO2 and heat overlays.

## Tests

```sh
pnpm test                                        # Rust tests + client typecheck
cargo run --release -p sim --example bench       # tick cost on a 256x256 map
```

The determinism test is the important one: lockstep multiplayer and leaderboard replay checks depend on it.

## Roadmap

1. **Solo slice** (in progress): pathfinding and job queue for colonists, more buildables, save and load, more models and animations.
2. **Co-op**: server-relayed deterministic lockstep through Nakama.
3. **Competitive and leaderboard**: same-seed races, a native replay verifier, Nakama leaderboards.
