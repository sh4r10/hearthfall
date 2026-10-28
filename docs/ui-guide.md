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
| `--edge-hi` | `#5a4532` | Key badges, tooltips, portraits |
| `--panel-hi` | `rgba(42, 33, 25, 0.9)` | Top of the panel gradient |
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

- **Panel (`.panel`):** a vertical gradient from `--panel-hi` to `--panel`, 1 px `--edge` border, 10 px radius, a faint warm inner highlight along the top edge, and a light backdrop blur. No drop shadows.
- **Button:** transparent until hovered. Active is an ember border and text on a faint ember tint with a soft glow. **Primary** buttons (title screen, game over) are solid ember with dark display text.
- **Tool button:** a 22 px line icon over a short label, with the key in a small `kbd` badge in the corner and the cost (if any) under it. Hovering shows a tooltip: bold name, then one plain sentence.
- **Icons:** line icons from `apps/client/src/icons.ts`, 24 px grid, `currentColor`, 1.8 px stroke. Painted icons can replace them by name later.
- **Need bar:** a 14 px icon and a 6 px bar. Ember when fine, amber under 50%, frost under 25%.
- **Survivor card:** round portrait, name (display face), role picker, one italic line saying what they're doing, then the need bars in two columns. The card border turns frost when any need is under 25%.
- **Game over:** a centred panel with a frost display heading, one line on how long the colony lasted, and a primary button to start again.

## Layout

- Title screen: the story illustration full-bleed, slowly drifting, darkened towards the bottom left where the title, one paragraph and the buttons sit.
- Top bar: title, a day clock (a dial that is amber by day and blue by night, plus "Night in Ns"), and a stats panel (coal, food, survivors) that pulses frost when one runs low.
- Right edge: survivor roster.
- Bottom centre: one toolbar panel, order tools then a divider then view overlays.
- Bottom left, above the toolbar: a hint for the selected tool. Hidden on narrow screens.
- At night a faint frost vignette creeps in at the screen edges.
