# Hearthfall UI guide

How the in-game interface looks and behaves, so every new panel and button matches. The art style for the world itself is in [art-brief.md](art-brief.md).

## Principles

- **The world comes first.** The painted world is warm and busy, so the UI is calm, cool and neutral: slate-blue glass panels at the edges, white text, one ice-blue accent. It never covers the middle of the screen during play.
- **Blue is the base, amber is a warning, red is death.** Ice blue marks what's active, selected or healthy. Amber marks what's running low (needs under 50%, low coal or food, the night countdown) and is used sparingly. Red is only for death and needs under 25%. Never use green for state.
- **Plain words.** Name things the way a survivor would ("Coal", "Food", "Warmth"), not the way the code does. Buttons say exactly what they do.
- **Every tool has a key.** Show it in a small, quiet `kbd` badge on the button.

## Tokens

Defined in `apps/client/src/style.css` and reused everywhere:

| Token | Value | Use |
|---|---|---|
| `--void` | `#0b1016` | Page background |
| `--panel` | `rgba(18, 26, 36, 0.78)` | Panel fill (with a 10 px backdrop blur) |
| `--panel-hi` | `rgba(255, 255, 255, 0.06)` | 1 px highlight along the top edge of panels |
| `--panel-solid` | `#141d28` | Opaque fill: tooltips, select menus |
| `--edge` | `rgba(255, 255, 255, 0.08)` | Panel borders, dividers |
| `--edge-hi` | `rgba(255, 255, 255, 0.16)` | Toolbar divider, tooltip and portrait rings, quiet button border |
| `--ink` | `#eef3f8` | Main text |
| `--muted` | `#8fa0b3` | Labels, hints, secondary text, key badges |
| `--accent` | `#7cc4ff` | Ice blue: active state, primary buttons, healthy bars, day on the dial |
| `--accent-tint` | `rgba(124, 196, 255, 0.08)` | Fill behind an active button |
| `--accent-edge` | `rgba(124, 196, 255, 0.55)` | Border of an active button |
| `--warn` | `#ffb454` | Amber: needs under 50%, low stats, "Dawn in" at night, struggling survivor |
| `--danger` | `#ff6b6b` | Death and needs under 25% only |
| `--night` | `#16223a` | Night on the day dial |
| `--radius` | `12px` | Panels and cards |
| `--radius-sm` | `8px` | Buttons |

## Type

- **One face:** Manrope (Google Fonts, weights 500, 600, 700 and 800) for everything, including the title. Fallback `system-ui, sans-serif`. Body is 14 px, weight 500.
- **Headings:** tight tracking, `letter-spacing: -0.01em` (the title wordmark is 800 at up to 96 px with `-0.035em`; the brand and game-over heading are 800).
- **Labels:** 10-11 px, weight 700, uppercase, `letter-spacing: 0.08em`, in `--muted` (stat labels). The title kicker uses the same treatment at 12 px in `--accent`.
- **Numbers:** `font-variant-numeric: tabular-nums` so values don't jitter as they change.

## Components

- **Panel (`.panel`):** `--panel` fill, 1 px `--edge` border, 12 px radius, an inset 1 px `--panel-hi` highlight along the top, a soft dark shadow and a 10 px backdrop blur.
- **Button:** a ghost (no fill, no border) until hovered, when it gets a faint white tint. Active is an `--accent-edge` border, `--accent` text and an `--accent-tint` fill, with no glow. **Primary** buttons (title screen, game over) are solid `--accent` with dark `#08131f` text in 700. **Quiet** buttons are muted text with an `--edge-hi` outline.
- **Key badge (`kbd`):** 9 px, weight 700, `--muted` on a 5% white fill, 4 px radius, no border. It turns ice blue on an active tool.
- **Tool button:** a 22 px line icon over a 12 px 600 label, with the key badge in the top-right corner and the cost (if any) as a tiny coal icon and number in the top-left. Hovering shows a tooltip: an opaque `--panel-solid` box with a bold name, then one plain sentence.
- **Icons:** line icons from `apps/client/src/icons.ts`, 24 px grid, `currentColor`, round caps. The stroke is 1.8 at 18 px and up, 2.1 at 13-16 px and 2.4 at 12 px and below, so small icons still read. Painted icons can replace them by name later.
- **Need bar:** a 14 px icon and a 4 px rounded bar on a 8% white track. Ice blue when fine, amber under 50%, red under 25%; the icon takes the same colour when low.
- **Survivor card:** a glass panel with a 38 px round portrait, the name in 600, the role picker as a quiet pill select (11 px, muted, hairline border, small chevron) on the right, one muted line saying what they're doing, then the need bars in two columns. The card border turns amber when any need is under 25%; a dead survivor's card greys out and their line turns red.
- **Day clock:** a 28 px dial, ice blue for day and `--night` navy for night, with a white hand and centre dot; next to it "Day N" in 700 and the countdown in muted 600 (amber at night).
- **Stats:** one panel of chips (icon, uppercase label, value in 16 px 700) separated by hairlines. A low stat turns amber and pulses gently.
- **Depth gauge:** a panel beside the stats with a down-arrow icon in ice blue, "N m down" in 700, the layer name and cells to the next layer in muted 600, and five stacked 14 x 4 px bars on the right: ice blue for layers passed, half-strength for the current one, 14% white for the rest.
- **Event log:** glass lines under the top bar on the left, one per event (a 16 px icon in `--danger` and one sentence with the name in 700). Warnings use a `--warn` icon and tips an `--accent` one, and stay 12 s. Each slides in from the left and fades out after 8 s.
- **Tutorial:** a 440 px panel centred under the top bar: an uppercase 11 px ice-blue kicker ("First night · 1 of 4"), one muted sentence with the action in white 700, and a quiet Skip button on the right. The tool button a step needs pulses with a 3 px `--accent` ring.
- **Area orders:** shift-drag or right-drag draws a 1.5 px box with 4 px corners over the map, `--accent` with a 10% fill, or `--danger` for Remove and Cancel. Cells marked for removal get a faint red square and a red crowbar marker, the way digs get an ember square and a pickaxe.
- **Map views:** toolbar buttons after the divider, toggled by click or key (Esc clears). A view's button is hidden until the view unlocks, then slides in once. A button pulses with the `--accent` ring only while something needs doing soon (the first evening, if the night will leave a survivor or bed in the cold), its tooltip adds the reason in `--warn`, and it stops once the view is opened or the problem is gone. The map draws flat zones with soft edges and a thin ink contour, behind the sprites, and darkens the rock so the caves read. Colours: firelight amber to pale gold, lamp light dim ice blue, dark `--night` navy, "goes cold tonight" as thin drifting navy hatching with a dashed pale-blue line, coal as a thin ember rim.
- **Map legend:** a 272 px panel bottom right, above the toolbar: the view's icon in ice blue, its name in 700 and its key, one row per colour (an 18 x 12 swatch, the name in white 600, one muted sentence), then under a hairline one live sentence on what the map means right now ("Tonight the warm area shrinks by 47%. Tobin is standing where it goes cold."), with numbers and names in amber when something needs doing.
- **Game over:** a centred, slightly more opaque panel with a white 800 heading, one muted line on how long the colony lasted, and a primary button to start again.

## Layout

- Title screen: the story illustration full-bleed, slowly drifting, darkened with a `--void` gradient from the bottom left where the kicker, the white wordmark, one paragraph and the buttons sit.
- Top bar: the white "Hearthfall" wordmark, the day clock, the stats panel and the depth gauge, all 46 px tall.
- Under the top bar: the event log on the left, the tutorial in the centre.
- Right edge: survivor roster.
- Bottom centre: one toolbar panel, order tools then a hairline divider then view overlays.
- Bottom left, above the toolbar: a hint for the selected tool, with its icon in ice blue. Hidden below 1100 px.
- Below 760 px the brand and stat labels hide, the roster narrows and moves below the top bar, and the toolbar scrolls sideways without a scrollbar. Nothing scrolls the page horizontally.
- At night a faint cool-blue vignette creeps in at the screen edges.
