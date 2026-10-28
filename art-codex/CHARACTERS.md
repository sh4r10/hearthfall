# The survivors, and how to build them

Six survivors. Esk and Mara are the starting pair and come in batch 1; the other four arrive as refugees in batch 2. They all share one body plan and one rig, so every animation works for everyone; they differ in silhouette, clothes, colour and face.

## The shared body

Every survivor is drawn to the same template, so parts line up with the rig.

| | |
|---|---|
| Height | 250 px from the bottom of the boots (y = 304) to the top of the hood or hat, in a 320 x 320 frame, centred on x = 160. The game scales some people a little (see each character). |
| Proportions | About 2.5 heads tall: head and hood about 105 px tall (y 54-160), coat body about 95 px (collar y 160 to hem y 254), legs about 50 px (hem 254 to sole 304). |
| Build | Round, stubby, sturdy. Short arms that reach the hip. Mittens, never fingers. Big boots. |
| Coat | Hip-to-mid-thigh length, **never past y = 262**, so legs stay visible and can swing freely. Fur trim at the cuffs, hem and hood edge. |
| Joints | Shoulders at y 186, hips at y 254, neck at y 168 (exact points in `rig.json`). |

### Face construction (the same for everyone)

- The face is a soft rounded shape set **low** in the head, framed by the hood or hair; skin shows as one flat tone with one shadow tone under the hood edge.
- **Eyes:** two small solid ovals of the outline colour, about 7 x 10 px, with one tiny square catchlight top-left. Set wide apart, at about 60% of the face height. No irises, no lashes (except Ostra's lines), no eyelid shading.
- **Brows:** one short thick stroke each. Brows carry most of the expression.
- **Nose:** a small bump or a short curved line. **Mouth:** a short line, a small open oval, or a tiny triangle. Never teeth except Pim's gap.
- **Cheeks:** one soft pink-red dab each (`#d77a68` at about 50%). This is the only soft-edged thing on the character.
- In profile the face is one clean curve with the nose bump; the near eye only.

### Clothing construction

Draw clothing as **big flat shapes with one patch, seam or strap each**, not as rendered fabric. Fur is a scalloped edge with a few tufts. Every character has exactly one bright accent, their scarf (or Tobin's mittens), so you can tell people apart at 40 px.

## The cast

### Esk, the digger

- **Who:** 24, the colony's best digger, quiet, stubborn, always the first into a new tunnel. Default expression: determined, brows low.
- **Silhouette hook:** a **tall pointed hood** that flops slightly forward at the tip, and **mining goggles** pushed up on the hood.
- **Head:** grey wolf-fur ruff (`#8f8476`) around a slate-blue hood (`#3e5566`). Dark brown fringe (`#3a2a20`) poking out over the brow in three chunky locks. Light skin `#e8b996`. Goggles: brass rims `#b08d4a`, amber-tinted lenses `#c9a66b`, a leather strap.
- **Coat:** slate-blue parka (`#3e5566`), a darker blue-grey leather patch on the near elbow, two wooden toggles, a rope belt with a small hammer loop (empty).
- **Scarf:** rust red `#b23a2e`, wrapped twice, one tail hanging behind.
- **Legs:** patched brown trousers (`#70553a`, one square patch on the knee), heavy dark boots `#3a2a20` with fur cuffs.
- **In game:** scale 1.00. Holds the pickaxe.

### Mara, the firekeeper

- **Who:** 31, keeps the hearths alive and the colony in line, warm but bossy. Default expression: a confident half-smile, one brow raised.
- **Silhouette hook:** **no hood**: a **knitted ochre beanie with ear flaps and a bobble**, and a **thick auburn braid** over the near shoulder.
- **Head:** beanie `#c98a2b` with two cream stripes `#d9cdb8`, bobble on top, ear flaps with ties. Braid `#8a3f22`, fat and rope-like, three segments, tied with a scrap of cloth. Medium-brown skin `#c68863`, a soot smudge on one cheek (`#4a3a34`, flat).
- **Coat:** moss-green parka (`#56603e`) with cream fur trim, and a **sooty leather apron** (`#6b4a2f`) over the front, from chest to hem, with one pocket holding fire tongs (handles poking up).
- **Scarf:** teal `#2f7f7a`.
- **Legs:** dark grey trousers `#4a4a4f`, brown boots with laces.
- **In game:** scale 1.02. Carries the lantern and the coal sack.

### Tobin, the builder

- **Who:** 40, big, gentle, hums while he works, can fix anything with rope. Default expression: content, eyes closed-happy (curved lines) when idle is fine on the portrait only; normal eyes everywhere else.
- **Silhouette hook:** the **widest** survivor (fill the torso out to about 120 px wide in front view), a **round fur trapper hat with big ear flaps** (no hood), and a **bushy ginger beard** that covers his scarf knot.
- **Head:** trapper hat brown fur `#6b5440` with a dark leather crown `#4a3628`. Beard and brows ginger `#b8642e`, beard a big rounded scalloped shape. Deep brown skin `#8d5a3b`.
- **Coat:** brown canvas work coat `#70553a` with a sheepskin collar `#d9cdb8`, a tool belt with a measuring rope coil, two big patch pockets.
- **Accent:** **mustard mittens** `#d1a23a` (oversized) and a mustard scarf mostly hidden by the beard.
- **Legs:** dark blue work trousers `#2f3b4a`, huge boots.
- **In game:** scale 1.00 (his size comes from width, not height). Holds the hammer.

### Ostra, the elder

- **Who:** 70, the colony's memory, tells the old stories about the sun, grows the mushrooms. Default expression: kind, knowing, eyes as two little upturned arcs.
- **Silhouette hook:** **small and hunched** (lean the torso forward about 5 degrees in the drawing), wrapped in a **patchwork quilt shawl** over her shoulders that hangs to the hem in a rounded triangle, **round wire spectacles**, white hair in a bun showing over a low hood.
- **Head:** a low, soft hood in faded plum `#6e4a6e` pushed back far enough to show a white-grey bun `#d8d4cc`. Spectacles: two thin round rims `#b08d4a`. Two short wrinkle lines at each eye corner. Light olive skin `#d9a07a`.
- **Coat and shawl:** coat `#8c8a80` grey wool. Shawl of six large flat patches (plum, ochre, teal, cream, rust, moss: muted versions of the cast's scarf colours, a nice nod), with visible stitch lines between patches.
- **Scarf:** plum `#7d4a8c`, knitted, short.
- **Legs:** a long wool skirt over boots is NOT allowed (it would break the leg swing): give her baggy brown trousers `#6a4a3a` tucked into felt boots `#8c8a80`.
- **In game:** scale 0.90.

### Pim, the scavenger

- **Who:** 19, fast, cheeky, always finding things in the rubble. Default expression: a wide grin with one tooth gap, brows high.
- **Silhouette hook:** an **oversized hand-me-down coat** with the sleeves rolled up in thick cuffs, **huge round earmuffs** (no hood), a **sticking plaster across the nose**, and a **bulging satchel** on the far hip.
- **Head:** spiky dark hair `#2a2420` sticking up in five clumps. Earmuffs: big fluffy discs in cream `#e8e0d0` on a brass band. Plaster `#e6c8a0` with two cross lines. Warm brown skin `#a86b4a`, freckles (three dots each cheek).
- **Coat:** faded red-brown `#7a4636`, too big: shoulders drooping, hem wide, cuffs rolled into fat rings.
- **Scarf:** cornflower blue `#4f7fbf`, long, tail flying.
- **Satchel:** tan leather `#a8835a` with a buckle, a bent spoon and a gear poking out. Painted as part of the torso (side and back views show it on the far hip).
- **Legs:** grey trousers with both knees patched, mismatched boots (one brown, one grey). Mismatched boots are deliberate.
- **In game:** scale 0.92.

### Ruta, the medic

- **Who:** 35, calm, dry humour, patches everyone up. Default expression: level, slightly tired eyes, a small straight mouth.
- **Silhouette hook:** the **tallest** look: a long narrow **tunnel hood** (an Inuit-style snorkel hood) with a deep circular fur ring so her face sits back in a round frame, and a **long pale felt coat** with a red cross stitched slightly crooked on the near shoulder.
- **Head:** hood off-white felt `#cfc8b8` with a thick cream-grey fur ring `#d9cdb8`. Dark curly hair just visible inside the ring. Dark brown skin `#6b4330`.
- **Coat:** pale felt `#bdb5a3` with darker felt panels at the sides `#9a917f`, the red cross `#b23a2e` on the near shoulder, a strap across the chest to a medical roll on the back (a rolled cloth bundle with bandage ends).
- **Scarf:** cream with two red stripes (`#e3dccb`, `#b23a2e`), tucked in.
- **Legs:** charcoal trousers `#3a3a40`, tall lace-up boots.
- **In game:** scale 1.06.

## How to build a survivor

Each survivor is **painted as separate parts** that the game (and our compositor) rotates on a shared skeleton. This is what keeps animation smooth and stops the jitter the current game has. Do these steps in order for each character.

### 1. Turnaround (the model sheet)

Make `turnaround.png` (960 x 320): front, side facing right, and back views in three 320 px cells, each 250 px tall with feet on y = 304, in the neutral pose from `rig.json` (arms hanging, legs straight, looking ahead). Every later image of this character is generated with this attached as the reference.

### 2. Parts, one view at a time

*Correction after batch 1: Mara's head and torso had a visible gap. Before batch 2, redo Mara's `head` and `head-blink` in all three views with the neck rule below, re-run the compositor for her, and check that `check_art.py --id mara` passes.*

For each view (side, front, back), generate one **parts sheet** with the turnaround attached: the parts from the list below, laid out apart with space between them, at the same scale as the turnaround, on a plain background. Ask for parts to be **complete**: the bit of the torso normally hidden under the arm is still painted, the top of the leg that tucks under the coat is still painted.

| View | Parts |
|---|---|
| side | `head`, `head-blink`, `torso`, `scarf` (the trailing tail only), `arm-front`, `arm-back`, `leg-front`, `leg-back` |
| front | `head`, `head-blink`, `torso`, `arm-left`, `arm-right`, `leg-left`, `leg-right` |
| back | `head`, `torso`, `arm-left`, `arm-right`, `leg-left`, `leg-right` |

Then cut each part out and **place it on its own 320 x 320 transparent canvas exactly where it sits in the neutral pose**. The simplest way: scale the turnaround cell to the rig size, then move each part until it lines up with the same part in the turnaround. The test: stacking all parts of a view in the `layers_back_to_front` order from `rig.json` must reproduce the turnaround figure.

**Joint rules** (these matter more than anything else for animation):

- Each limb's top end is a **rounded cap that extends about 12 px past its pivot** into the body (shoulder into the torso, hip up under the coat). When the limb rotates, the cap keeps the joint covered and no gap opens.
- Limbs are **straight and rigid** in the neutral pose: arms hang straight down, legs straight. No bent elbows or knees; the animation bends them by rotation.
- The torso's hem overlaps the tops of the legs by at least 12 px.
- **The neck:** every `head` (and `head-blink`) ends in a painted neck stub in skin or collar colour that reaches down to **y = 188**, about 20 px below the neck pivot, under the torso's collar and scarf. The torso's collar reaches up to y = 160 over it. So the head and torso overlap by about 25 px and no gap ever shows, even when the head tilts. This matters most for the survivors without a hood (Mara, Tobin, Pim), whose head would otherwise end at the chin or hat brim.
- The checker fails a view if stacking its parts leaves any piece detached, or if a part overlaps its neighbour by less than 60 px around its joint, and fails any animation frame where a joint opens. Fix those by extending the part, not by moving pivots.
- `arm-back` and `leg-back` (side view) are one shadow-tone darker than the front ones, because they are on the far side.
- `head-blink` is the same image as `head` with only the eyes changed to closed lines. Same outline, same position, pixel for pixel elsewhere. Make it by editing `head`, not by regenerating.
- Front-view left and right limbs are painted, not mirrored, so patches and toggles stay on the right side.

### 3. Props

The props in `out/props/` (pickaxe, hammer, coal sack, lantern) are shared by everyone. Each is painted on a 320 x 320 canvas with its **grip point exactly at (172, 238)**, where the near mitten is in the side neutral pose, with the handle pointing straight up from the grip (the coal sack instead hangs down from its knot). Keep tools compact: no more than 100 px from the grip to the far end, or they leave the frame mid-swing. Draw the grip end so it sits inside the mitten: the mitten is layered on top.

### 4. Whole-body poses

Some poses can't be made by rotating parts, so they are painted whole, with the turnaround attached: `sleep-ground`, `sleep-back`, `eat` (3 frames), `cold`, `collapse` (4 frames) and `dead`. The descriptions are in ASSETS.md. These replace the current game's sideways-rotated standing sprite, which looks wrong, so get them right:

- **Sleeping** must read as asleep at a glance: closed eyes, a soft round curled shape, the coat pulled over like a blanket, a calm face. Lying on the ground, not floating.
- **Dying** is sad, not gruesome: the body folds down in four clear steps and ends lying on its side. `dead` is that last frame with a thin pale frost crust along the top edges. No blood, no skull, no x-eyes.
- Keep the same scale as the rig figure. A survivor lying down is about 1.4 cells (about 270 px) long and its lowest point rests on y = 304.

### 5. Animations

Run `python3 art-codex/tools/compose_character.py <name>` (for example `esk`). It reads `rig.json`, `poses.json`, the parts, poses and props, and writes the `anim/` strips: idle, walk, dig, build, carry, climb, celebrate, cold and sleep, plus a GIF of each. Watch the GIFs. If a joint opens, a part looks detached, or the figure looks broken mid-swing, fix the **part** (longer joint cap, better placement) and run it again. The poses were tuned on placeholder shapes, so small changes to the tool and arm angles in `poses.json` are expected once real parts exist; make them, and note each change in the log. Arms have no elbow, so paint arms that still read well as one straight piece when raised.

### 6. Portrait

`portrait.png`, 256 x 256: head and shoulders, three-quarter view facing right, default expression. Used on the roster and on the refugee card.
