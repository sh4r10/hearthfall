# Hearthfall UI guide

How the in-game interface looks and behaves, so every new panel and button matches. The art style for the world itself is in [art-brief.md](art-brief.md).

## Principles

- **The world comes first.** UI sits at the edges on dark translucent panels and never covers the middle of the screen during play.
- **Warm means good, cold means danger.** Ember orange marks what's active or healthy, and frost blue marks what's failing (low warmth, low fuel, a dying survivor). Don't use red and green for state.
- **Plain words.** Name things the way a survivor would ("Coal", "Food", "Warmth"), not the way the code does. Buttons say exactly what they do.
- **Every tool has a key.** Show it in a small `kbd` badge on the button.

## Tokens

Defined in `apps/client/src/style.css` and reused everywhere:

| Token | Value | Use |
|---|---|---|
| `--void` | `#050608` | Page background |
| `--panel` | `rgba(14, 12, 11, 0.82)` | Panel fill |
| `--edge` | `#3b2f24` | Panel borders, dividers |
| `--ink` | `#eadfcb` | Main text |
| `--muted` | `#a3968a` | Labels, hints, secondary text |
| `--ember` | `#f0a04b` | Active state, accent, healthy bars |
| `--frost` | `#9cc4e4` | Warnings, low needs, night |

## Type

- **Display:** Cinzel, for the title, survivor names and big banners only. Uppercase-feeling, letter-spaced.
- **Body:** Alegreya Sans, for everything else.
- **Labels:** 10-11 px, uppercase, `letter-spacing: 0.08em`, in `--muted`.
- **Numbers:** `font-variant-numeric: tabular-nums` so values don't jitter as they change.

## Components

- **Panel:** `--panel` fill, 1 px `--edge` border, 8 px radius. No drop shadows.
- **Button:** transparent until hovered. Active is an `--ember` border and text on a faint ember tint.
- **Need bar:** 5 px tall, rounded. Ember when fine, amber under 50%, frost under 25%.
- **Survivor card:** name (display face), role picker, one italic line saying what they're doing, then the need bars in two columns.
- **Banner:** large display text centred on screen, frost-coloured, for run-ending moments only.

## Layout

- Top bar: title and colony stats (day, time to night, coal, food, survivors).
- Right edge: survivor roster.
- Bottom centre: order tools and view overlays.
- Bottom left: a one-line contextual hint. Hidden on narrow screens.
