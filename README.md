# Hearthfall

A browser colony-survival game: Oxygen Not Included style simulation with a Don't Starve style look. Solo, co-op and competitive multiplayer with a leaderboard are planned.

## Layout

| Path | What it is |
|---|---|
| `crates/sim` | Deterministic simulation core in Rust (map generation, gas diffusion, heat, colonists). Integer-only maths and a seeded RNG, so the same seed and commands always produce the same state hash. Not tied to any renderer, so it can also run on the server or in Godot via GDExtension. |
| `crates/sim-wasm` | wasm-bindgen wrapper that exposes the sim to the browser. |
| `apps/client` | TypeScript + Three.js client. The sim runs in a Web Worker at a fixed 10 ticks per second; the renderer interpolates between ticks. |

## Running it

Needs Rust (with the `wasm32-unknown-unknown` target), [wasm-pack](https://rustwasm.github.io/wasm-pack/), Node 20+ and pnpm.

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
pnpm install
pnpm dev          # builds the sim to WebAssembly and starts Vite
```

Add `?seed=123` to the URL to play a specific map.

Controls: drag to pan, scroll to zoom, right-drag to rotate. `1` digs, `2` places an oxygen diffuser. `O`, `C` and `T` toggle the oxygen, CO2 and heat overlays.

## Tests

```sh
pnpm test                                        # Rust tests + client typecheck
cargo run --release -p sim --example bench       # tick cost on a 256x256 map
```

The determinism test is the important one: lockstep multiplayer and leaderboard replay checks depend on it.

## Roadmap

1. **Solo slice** (in progress): pathfinding and job queue for colonists, more buildables, save and load, real sprite art.
2. **Co-op**: server-relayed deterministic lockstep through Nakama.
3. **Competitive and leaderboard**: same-seed races, a native replay verifier, Nakama leaderboards.
