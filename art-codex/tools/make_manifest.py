#!/usr/bin/env python3
"""Build art-codex/assets.json and art-codex/ASSETS.md from the lists below.

    python3 art-codex/tools/make_manifest.py

This file is the source of truth for every asset: id, save path, size, frames,
transparency and what to paint. Edit here, never in the generated files.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CELL = 192  # sprite pixels per grid cell; terrain textures use 128 (4 cells per 512 px tile)

CAST = ["esk", "mara", "tobin", "ostra", "pim", "ruta"]
FIRST_TWO = ["esk", "mara"]

assets = []


def add(id, path, w, h, *, batch, kind, prompt, frames=1, alpha=True, seamless=False,
        anchor="bottom-centre", source="generate", character=None, notes=""):
    assets.append(dict(id=id, path=path, batch=batch, kind=kind, width=w, height=h, frames=frames,
                       alpha=alpha, seamless=seamless, anchor=anchor, source=source,
                       character=character, prompt=prompt, notes=notes))


# ---------------------------------------------------------------- survivors

SIDE_PARTS = {
    "head": "Head with hood or hat, in profile facing right, eyes open. Includes the hood's fur ruff and any hair or hat. Neck stub at the bottom so it tucks into the collar.",
    "head-blink": "Exactly the same head, same position and outline, with the eyes closed (two short curved lines). Nothing else changes.",
    "torso": "Coat body in profile facing right, from the collar to the coat hem, including the front half of the scarf wrapped at the neck, belt and pockets. No arms, no legs, no head.",
    "scarf": "Only the loose scarf tail that hangs and trails behind the neck. Small. It sways in animation.",
    "arm-front": "Near arm, hanging straight down: sleeve with fur cuff and a mitten. Shoulder at the top. Full colour.",
    "arm-back": "Far arm, the same shape as the near arm, painted one shade darker because it is in shadow.",
    "leg-front": "Near leg, straight: trouser leg from the hip and a heavy boot, toe pointing right. Hidden part tucks under the coat hem.",
    "leg-back": "Far leg, same as the near leg, one shade darker.",
}
FRONT_PARTS = {
    "head": "Head facing the viewer, eyes open, with hood or hat.",
    "head-blink": "Exactly the same front head with the eyes closed. Nothing else changes.",
    "torso": "Coat body facing the viewer, collar to hem, scarf wrapped and hanging down the front. No arms, legs or head.",
    "arm-left": "Arm on the image's left side, hanging down slightly away from the body, sleeve and mitten.",
    "arm-right": "Arm on the image's right side, mirror of the left one but painted, not flipped (buttons and patches stay on the correct side).",
    "leg-left": "Leg on the image's left, trouser and boot, facing the viewer.",
    "leg-right": "Leg on the image's right.",
}
BACK_PARTS = {
    "head": "Back of the head: the hood (or hat and hair) from behind. No face.",
    "torso": "Back of the coat, collar to hem, scarf knot or tail visible at the neck.",
    "arm-left": "Arm on the image's left, seen from behind, reaching straight down.",
    "arm-right": "Arm on the image's right, seen from behind.",
    "leg-left": "Leg on the image's left from behind, boot heel showing.",
    "leg-right": "Leg on the image's right from behind.",
}
POSES = {
    # name: (frames, prompt)
    "sleep-ground": (1, "Curled up asleep on the ground on their side, knees drawn up, the coat pulled over them like a blanket, hood up, cheek on a folded mitten. Eyes closed, calm face. Bottom of the body resting on y=304. About 1.4 cells long."),
    "sleep-back": (1, "Lying flat on their back asleep, facing up and slightly toward the viewer, hands folded on the chest, eyes closed, a small 'cosy' smile. Painted to lie on a cot: the body's lowest point on y=304, head on the left."),
    "eat": (3, "Sitting cross-legged on the ground facing right, a wooden bowl of mushrooms in the far hand. Frame 1: spoon in the bowl. Frame 2: spoon lifted halfway. Frame 3: spoon at the mouth, cheeks round. Same body in every frame, only the near arm, spoon and face change."),
    "cold": (1, "Standing facing the viewer, hugging themselves tightly against the cold, shoulders up to the ears, knees together, teeth gritted, eyes squeezed. A few frost flecks on the hood fur. (The game adds the shiver and breath mist.)"),
    "collapse": (4, "Collapsing from cold, side view facing right. Frame 1: standing, swaying, eyes half shut. Frame 2: knees buckling, one hand reaching down. Frame 3: on their knees, slumping forward. Frame 4: lying on their side on the ground, face toward the viewer, eyes closed. Feet or body always resting on y=304."),
    "dead": (1, "Lying still on their side on the ground, the last collapse frame, curled a little, eyes closed, with a thin layer of frost: pale blue-white crust along the top edges of the hood, shoulders and boots, and frost on the eyelashes. Calm, sad, not gruesome. No blood."),
}
BUILT_ANIMS = {
    # name: (view, frames, what)
    "idle": ("front", 4, "Breathing: torso rises and settles, one blink on frame 3."),
    "walk": ("side", 6, "Walk cycle facing right: legs swing, arms counter-swing, torso bobs, scarf trails."),
    "dig": ("side", 4, "Pickaxe: raised over the head, swing, impact low in front, recover."),
    "build": ("side", 3, "Hammering in front at chest height with the hammer."),
    "carry": ("side", 6, "Walk cycle with the coal sack over the near shoulder, near arm holding it."),
    "climb": ("back", 4, "Climbing a ladder from behind: arms and legs alternate reaching up."),
    "celebrate": ("front", 3, "Both arms thrown up, a little hop."),
    "cold": ("front", 3, "Built from poses/cold: shiver offsets of a pixel or two."),
    "sleep": ("side", 2, "Built from poses/sleep-ground: slow breathing."),
}

CHAR_TEXT = {
    "esk": "Esk (the digger, see CHARACTERS.md)",
    "mara": "Mara (the firekeeper, see CHARACTERS.md)",
    "tobin": "Tobin (the builder, see CHARACTERS.md)",
    "ostra": "Ostra (the elder, see CHARACTERS.md)",
    "pim": "Pim (the scavenger, see CHARACTERS.md)",
    "ruta": "Ruta (the medic, see CHARACTERS.md)",
}

# Whole-body poses are painted, not built from the rig, so they drift in scale.
POSE_SCALE_RULE = ("Same scale as the turnaround: the head is exactly as wide and tall as in the turnaround's side view, "
                   "so nothing grows or shrinks when the game switches from walking to this pose. A seated figure is about "
                   "0.7 of the standing height, a kneeling one about 0.75, a lying one about 0.35; never stretch a pose to fill the frame.")

# Batch 3: ladder climbing (painted per character so getting on and off reads) and research at a bench.
CLIMB_POSES = {
    "climb-up": (4, "Climbing up a ladder, seen from behind and slightly to the side: mittens on the rungs, one knee raised, alternating. The body stays centred on x=160 over the ladder; feet move up and down within the frame, the frame does not move."),
    "climb-down": (4, "Climbing down a ladder, seen from behind and slightly to the side, looking down past one shoulder, feet reaching for the rung below, alternating."),
    "ladder-on": (3, "Stepping from the floor onto a ladder, side view turning to back view: frame 1 standing facing right with a hand on a rail, frame 2 one boot on the bottom rung, frame 3 both feet on, seen from behind."),
    "research": (3, "Side view facing right, standing and leaning over a waist-high workbench (not painted: leave the bench out, the game draws it). Frame 1 reading, frame 2 turning a page with the near mitten, frame 3 nodding and making a note. Body and feet stay put; only the arms, head and page move."),
    "ladder-off": (3, "Stepping off the top of a ladder onto a ledge to the right: frame 1 seen from behind at the top rung, frame 2 one knee on the ledge, frame 3 standing on the ledge facing right."),
}

for name in CAST:
    b = 1 if name in FIRST_TWO else 2
    who = CHAR_TEXT[name]
    base = f"characters/{name}"
    add(f"{name}-turnaround", f"{base}/turnaround.png", 960, 320, batch=b, kind="reference", character=name,
        anchor="none",
        prompt=f"{who}. Turnaround: front view, side view facing right, back view, each centred in its own 320 px third, feet on y=304, neutral pose. This is the reference every other image of this character is matched to. Make this first and get it right.")
    add(f"{name}-portrait", f"{base}/portrait.png", 256, 256, batch=b, kind="sprite", character=name, anchor="centre",
        prompt=f"{who}. Head and shoulders, three-quarter view facing right, their usual expression, on transparent. For the roster and the refugee card.")
    for view, parts in [("side", SIDE_PARTS), ("front", FRONT_PARTS), ("back", BACK_PARTS)]:
        for part, text in parts.items():
            add(f"{name}-{view}-{part}", f"{base}/{view}/{part}.png", 320, 320, batch=b, kind="part", character=name,
                anchor="rig", prompt=f"{who}. {view.capitalize()} view part: {text}",
                notes=f"Painted in place on the full 320x320 frame, positioned exactly where it sits in the {view} neutral pose (rig.json). Everything else transparent.")
    for pose, (frames, text) in POSES.items():
        add(f"{name}-pose-{pose}", f"{base}/poses/{pose}.png", 320, 320, frames=frames, batch=b, kind="pose", character=name,
            prompt=f"{who}. {text} {POSE_SCALE_RULE}",
            notes="Generate all frames of a pose in one image so they match, then split into the 320x320 cells." if frames > 1 else "")
    for pose, (frames, text) in CLIMB_POSES.items():
        add(f"{name}-pose-{pose}", f"{base}/poses/{pose}.png", 320, 320, frames=frames, batch=3, kind="pose", character=name,
            prompt=f"{who}. {text} {POSE_SCALE_RULE}" + ("" if pose == "research" else " Paint them on the batch 3 ladder (buildings/ladder-middle.png) as a guide, then remove the ladder so only the survivor remains."),
            notes="Generate all frames in one image so they match." + ("" if pose == "research" else " The ladder rails sit at x=112 and x=208, so mittens and boots land on them."))
    for anim, (view, frames, text) in BUILT_ANIMS.items():
        add(f"{name}-anim-{anim}", f"{base}/anim/{anim}.png", 320, 320, frames=frames, batch=b, kind="anim", character=name,
            source="compose", prompt=f"{text} ({view} view)",
            notes="Built by tools/compose_character.py from the parts and poses. Do not paint.")

# ---------------------------------------------------------------- props held or carried (shared by everyone)

for pid, text in [
    ("pickaxe", "A worn pickaxe: ash handle wrapped with cord at the grip, chipped iron head with one pointed end and one flat chisel end."),
    ("hammer", "A short builder's hammer, wooden handle, square iron head, a nail stuck in the handle wrap."),
    ("coal-sack", "A lumpy hessian sack of coal, knotted at the top, black lumps showing at the neck, grip at the knot. Unlike the other props it HANGS: the knot is at the grip and the sack body hangs straight down below it, about 70 px tall."),
    ("crowbar", "A short iron crowbar for taking buildings apart: a bent claw at the top end, a strip of cloth wrapped at the grip, worn paint. Used for the deconstruct marker too, so it must read at 40 px."),
    ("lantern", "A small tin lantern with a wire handle (grip at the handle top), a dim ember inside, soot on the glass."),
]:
    add(f"prop-{pid}", f"props/{pid}.png", 320, 320, batch=3 if pid == "crowbar" else 1, kind="prop", anchor="grip",
        prompt=f"{text} Held: the grip point is exactly at (172, 238)." + ("" if pid == "coal-sack" else " The handle points straight up from it and the whole tool reaches no more than 100 px above the grip, so it stays inside the frame when swung."))

# ---------------------------------------------------------------- items on the ground

for iid, text in [
    ("coal-chunk", "A single fist-sized lump of coal, faceted, near-black with two small warm glints."),
    ("ration", "A mushroom ration: three pale lavender cave mushrooms tied with twine on a scrap of cloth."),
    ("stone-pile", "A small heap of grey rubble stones."),
    ("coal-pile", "A small heap of coal lumps on the ground, the hauled-and-dropped version of the coal chunk, five or six lumps."),
    ("iron-ore-pile", "A small heap of rust-red iron ore lumps (#8a4a2c #b8693a) with dull metallic flecks."),
    ("crystal-pile", "A small heap of pale teal crystal shards (#7fd1c8 #c8f0ea), each a clean faceted shape."),
    ("coke-pile", "A neat stack of grey-black coke briquettes, rounded rectangles with a dull sheen, stacked three high."),
    ("iron-bar-stack", "Three small iron ingots stacked in a little pyramid, dark grey metal with a pale highlight edge."),
    ("stone-chunk", "A single fist-sized rough grey stone (#5a5b5f #7a7873), a few flat faces, one chip. The stone resource, carried and stockpiled like coal."),
    ("scrap-pile", "A small heap of scrap: bent pipe, a gear, rusty plates."),
]:
    add(f"item-{iid}", f"items/{iid}.png", 96, 96, batch=1 if iid in ("coal-chunk", "ration") else 3, kind="sprite",
        prompt=text + " Sitting on the ground at the bottom of the canvas.")

# ---------------------------------------------------------------- terrain (redo) and new layers

TEX = [
    ("rock", 1, "Cave rock: big blocky slabs and rounded boulders fitted together, cool blue-grey (#3d3f45 #5a5b5f #7a7873). Three values only, clean painted shapes, a few cracks. Readable from far away."),
    ("dirt", 1, "Packed soil: warm browns (#5e3f28 #7d5638 #9c7350), soft horizontal bands, a few pebbles and one or two pale roots. Simple and quiet."),
    ("coal", 1, "Coal seam: chunky near-black facets (#1c1b1e #2e2c31) with crisp lighter facet edges and rare small warm glints (#c9a66b). Bold shapes, not noise."),
    ("backwall", 1, "Distant cave back wall: very dark warm brown (#241d18 #33291f), soft layered strata, very low contrast, no hard detail. Background only."),
    ("water", 1, "Water body fill: deep blue-green (#1e4a63 #2a5f78), two or three soft painted caustic ribbons. Even overall value, no gradient from top to bottom (the game darkens deep water itself)."),
    ("ice", 3, "Ice: pale blue blocks (#9cc4e4 #5f7fa8 #e4f1fb) with straight fracture lines and a few trapped bubbles."),
    ("gravel", 3, "Loose gravel: rounded grey-brown pebbles of three sizes, packed tight."),
    ("deep-rock", 3, "Deep basalt: dark slate (#2a2c33 #3a3d46) in tall angular columns."),
    ("iron-ore", 3, "Rock with rust-red and orange iron ore veins (#8a4a2c #b8693a) and dull metallic flecks."),
    ("crystal", 3, "Rock with clusters of pale teal crystals (#7fd1c8 #c8f0ea), each crystal a clean faceted shape."),
    ("magma-rock", 4, "Hot rock: black crust plates (#1d1716) split by thin glowing seams (#ff7a1f #ffc24a). Glow is painted flat, no bloom."),
    ("ruin-brick", 4, "Old mine brick wall: worn dark red-brown bricks, crumbling mortar, one timber beam crossing."),
]
for tid, b, text in TEX:
    add(f"tex-{tid}", f"terrain/{tid}.png", 512, 512, batch=b, kind="texture", alpha=False, seamless=True, anchor="none",
        prompt=f"Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. {text} One tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.")
for lid, b, text in [
    ("backwall-1", 3, "Layer 1 back wall: cold blue-brown."),
    ("backwall-2", 3, "Layer 2 back wall: grey-brown with faint gravel."),
    ("backwall-3", 3, "Layer 3 back wall: dark slate with faint columns."),
    ("backwall-4", 4, "Layer 4 back wall: old mine, dark planks and brick behind."),
    ("backwall-5", 4, "Layer 5 back wall: warm dark red-brown, faint orange glow in the cracks."),
]:
    add(f"tex-{lid}", f"terrain/{lid}.png", 512, 512, batch=b, kind="texture", alpha=False, seamless=True, anchor="none",
        prompt=f"Seamless tileable cave back wall, very low contrast, soft strata, background only. {text}")
add("water-surface", "terrain/water-surface.png", 512, 64, frames=4, batch=1, kind="strip", anchor="none", seamless=True,
    prompt="The top edge of a pool of water as a strip: a bright pale line (#9cc4e4 to #e4f1fb) along the top with small rolling ripples, fading to transparent below within 40 px. Four frames of a slow ripple loop. Each frame tiles left to right.",
    notes="Seamless horizontally only (each frame's left and right edges must join).")

# ---------------------------------------------------------------- buildings

BUILD = [
    # id, batch, cells w x h, canvas h, states, text
    ("hearth", 1, 2, 1, 160, ["base"], "A campfire hearth: a ring of rough flat stones around a shallow pit with two crossed charred logs. No flame (separate). Wider than tall."),
    ("ladder", 1, 1, 1, 192, ["base"], "One section of a scavenged wooden ladder: two side rails and two rungs lashed with rope. Must tile vertically: the rails touch the top and bottom edges exactly."),
    ("mushroom-bed", 1, 2, 1, 160, ["seedling", "growing", "ready"], "A low planter box of rough planks full of dark soil. seedling: tiny pale sprouts. growing: half-size mushrooms. ready: plump pale lavender cave mushrooms of different heights, caps faintly luminous (painted, no glow effect)."),
    ("diffuser", 1, 1, 2, 320, ["off", "on"], "A small scrap-built oxygen machine: teal riveted canister, pressure gauge, vent on top. on: needle up, a few round bubbles above the vent, small green indicator lit."),
    ("bed", 1, 2, 1, 128, ["empty"], "A low cot: wooden frame, stretched canvas, a rolled fur blanket and a lumpy pillow. A survivor's sleep-back pose lies on it in game, so leave the top clear."),
    ("lamp", 1, 1, 2, 320, ["off", "on"], "A small coal lantern hanging from a wooden post with a cross-arm. on: lantern glass warm yellow inside (painted, no glow halo)."),
    ("grave", 1, 1, 1, 160, ["base"], "A grave cairn: a small pile of stacked stones with a red scarf tied around the top stone, a little snow on it."),
    ("stockpile", 1, 2, 1, 128, ["empty", "half", "full"], "A coal stockpile: a low plank pallet with a hand-painted marker stake. half: a heap of coal lumps. full: a big heap."),
    ("ladder-top", 3, 1, 1, 192, ["base"], "LADDER REDESIGN (replaces the batch 1 ladder, which reads as a floating block). The top section of a timber ladder: two split-log rails and lashed rungs, the rails ending in iron hooks bent over the lip of the floor above, the lashing rope tails hanging. The rails sit at x=112 and x=208. Joins the middle piece below with no seam."),
    ("ladder-middle", 3, 1, 1, 192, ["base"], "Middle section of the same timber ladder: two rails, two rungs lashed with rope. Tiles vertically: the rails touch the top and bottom edges exactly at x=112 and x=208, and any rung sits so that stacked pieces keep an even rung spacing. No pegs (those are separate)."),
    ("ladder-bottom", 3, 1, 1, 192, ["base"], "Bottom section of the same ladder: the rail feet resting in a small scatter of rubble and dirt on the floor, one wedge stone under a foot. Joins the middle piece above with no seam."),
    ("ladder-peg-dirt", 3, 1, 1, 192, ["left", "right"], "Wooden stakes driven into packed dirt to hold the ladder: two short sharpened stakes with rope lashed back to the rail. left: the stakes come out of the left edge of the cell (the wall is on the left) and reach the rail at x=112. right: mirrored, from the right edge to the rail at x=208. Only the stakes, rope and a little crumbled dirt at the edge, nothing else."),
    ("ladder-peg-rock", 3, 1, 1, 192, ["left", "right"], "Iron spikes hammered into rock to hold the ladder: two flat iron brackets with a ring, a few chips of rock at the edge. left: from the left edge of the cell to the rail at x=112. right: mirrored to x=208. Only the brackets."),
    ("stockpile-stone", 3, 2, 1, 128, ["half", "full"], "The stockpile pallet from batch 1 (same outline and stake) piled with grey rubble stone instead of coal. half: a low heap. full: a big heap."),
    ("coke-oven", 3, 1, 2, 320, ["off", "on"], "A squat clay kiln for baking coal into coke: a domed clay body with an iron door at the front and a short stack. on: the door seams and the stack mouth glow orange (painted flat)."),
    ("smelter", 3, 2, 2, 384, ["off", "on"], "A stone bloomery for smelting iron: a round stone furnace with a clay chimney, leather bellows on the left side, a tap hole at the bottom front. on: the tap hole glows, the bellows are squeezed, a little smoke at the chimney."),
    ("lens-bench", 3, 2, 1, 192, ["idle", "working"], "A lens-grinder's bench: a plank bench with a treadle grinding wheel and a small vice holding a teal crystal. working: the wheel blurred with two motion lines, a few bright crystal sparks."),
    ("hearth-grate", 3, 2, 1, 160, ["base"], "The better-burner upgrade of the batch 1 hearth: exactly the same stone ring, footprint and outline as building-hearth, with black iron fire-bars laid across the pit. No flame (separate)."),
    ("crystal-lamp", 3, 1, 2, 320, ["off", "on"], "The lamp upgrade: the same wooden post and cross-arm as the batch 1 lamp, the lantern now holding a cut teal crystal lens. on: the lens painted bright cool white (no glow halo)."),
    ("workbench", 3, 2, 2, 384, ["idle", "working"], "A research workbench: heavy planks, a vice, scattered tools, scraps of paper, a small oil lamp. working: lamp lit, papers spread out."),
    ("crate", 3, 1, 1, 192, ["empty", "half", "full"], "A storage crate of nailed planks. empty: open and empty. half: some coal and stones. full: overflowing."),
    ("kitchen", 3, 2, 2, 320, ["off", "cooking"], "A cooking pot hung from a tripod over a small stone fire ring. cooking: steam curls and a low painted flame under the pot."),
    ("medbay", 3, 2, 1, 160, ["empty"], "A medical cot: white-grey sheet, a red cross stitched on a hanging cloth, bandages and a bottle on a crate beside it."),
    ("door", 3, 1, 2, 384, ["closed", "open"], "A rough plank door in a timber frame with iron straps. open: the door swung to the side, frame empty."),
    ("heater", 3, 1, 2, 320, ["off", "on"], "An iron stove heater with a grille front and a chimney stub. on: grille glowing orange (painted)."),
    ("water-pump", 3, 2, 2, 384, ["off", "on"], "A hand pump on a tank with a spout. on: a stream at the spout."),
    ("barricade", 4, 1, 2, 384, ["intact", "damaged", "broken"], "A barricade of sharpened stakes and planks lashed together. damaged: missing planks. broken: splinters."),
    ("flare-lamp", 4, 1, 2, 384, ["off", "on"], "A tall pole with a magnesium flare cage on top. on: white-hot core (painted flat)."),
    ("spike-trap", 4, 1, 1, 96, ["set", "sprung"], "A floor plate with iron spikes. set: spikes hidden in slots. sprung: spikes up."),
    ("brazier", 4, 1, 2, 320, ["off", "on"], "An iron fire basket on three legs. on: coals glowing orange inside."),
    ("turret-base", 4, 2, 2, 256, ["base"], "Crossbow turret base: a wooden tripod platform with a swivel plate on top, no bow."),
    ("deep-hearth", 4, 6, 4, 768, ["unlit"], "The Deep Hearth: an enormous ancient furnace built into the cave, carved dark stone with a huge round grate mouth, old runes worn smooth (no readable text), brass pipes running into the rock. Unlit, cold, dusty."),
]
for bid, b, cw, ch, h, states, text in BUILD:
    for st in states:
        suffix = "" if st == "base" else f"-{st}"
        add(f"building-{bid}{suffix}", f"buildings/{bid}{suffix}.png", cw * CELL, h, batch=b, kind="sprite",
            prompt=f"{text}" + ("" if st == "base" else f" State: {st}."),
            notes=f"Footprint {cw} x {ch} cells. Front view, ground at the bottom edge. Every state of this building has the same outline and position, only the changing parts differ.")

for aid, b, w, h, frames, text in [
    ("flame", 1, 192, 256, 8, "A campfire flame loop, bright yellow-white core, orange body, red tips, a few sparks. Base centred at the bottom. Flat painted shapes, crisp edges, no blur, no glow halo."),
    ("deep-hearth-lighting", 4, 1152, 768, 6, "The Deep Hearth catching fire: embers in the grate, flames spreading, light filling the carvings, roaring. Same framing as the unlit sprite."),
    ("deep-hearth-lit", 4, 1152, 768, 8, "The Deep Hearth roaring, flame loop inside the grate. Same framing as the unlit sprite."),
    ("turret-bow", 4, 256, 256, 3, "The crossbow for the turret, side view pointing right, pivot at the canvas centre. Frames: loaded, firing, reloading."),
]:
    add(f"anim-{aid}", f"buildings/{aid}.png", w, h, frames=frames, batch=b, kind="strip", prompt=text)

# ---------------------------------------------------------------- creatures

for cid, b, w, h, anims, text in [
    ("shade", 2, 320, 320, {"drift": 4, "lunge": 3, "recoil": 3}, "A Shade: a hunched, child-sized figure of thick black smoke, edges breaking into wisps, two pale cold eyes (#e4f1fb), long thin arms. Never solid or detailed. recoil: shrinking from light, arm over eyes."),
    ("heat-leech", 3, 160, 160, {"crawl": 4, "latch": 2, "feed": 2, "burst": 4}, "A Heat-leech: a fist-sized translucent slug with a round sucker mouth. Empty it is dull grey-pink; feeding and full it glows orange from inside (painted). burst: pops in a spray of sparks."),
    ("burrower", 3, 384, 256, {"dig": 4, "surface": 3, "attack": 3, "retreat": 3}, "A Burrower: a mole-like beast the size of a dog, armoured overlapping plates, eyeless, huge shovel claws. Side view facing right."),
    ("deep-thing-eye", 4, 384, 384, {"blink": 4}, "A huge eye opening in the rock wall: cracked stone lids, a pale amber iris. Only the eye and the rock around it."),
    ("deep-thing-limb", 4, 768, 512, {"reach": 4}, "A huge pale segmented limb reaching out of a hole in the rock from the left, ending in three hooked fingers. Only the limb."),
]:
    for anim, frames in anims.items():
        add(f"creature-{cid}-{anim}", f"creatures/{cid}/{anim}.png", w, h, frames=frames, batch=b, kind="strip",
            prompt=f"{text} Animation: {anim}, {frames} frames.",
            notes="Generate all frames of one animation in one image so they match.")
SHADE = "A Shade (the same figure as the batch 2 drift strip: hunched black smoke, wisping edges, pale cold eyes #e4f1fb, long thin arms)."
for anim, frames, text in [
    ("idle", 4, "Idle loop: hovering in place, the smoke body slowly swelling and settling, wisps curling off the shoulders, eyes blinking once on frame 3."),
    ("dissolve", 5, "Dissolving in firelight: frame 1 recoiling, frames 2 to 4 the smoke coming apart from the edges into drifting wisps and flakes, the eyes last to go, frame 5 only a few faint wisps."),
]:
    add(f"creature-shade-{anim}", f"creatures/shade/{anim}.png", 320, 320, frames=frames, batch=3, kind="strip",
        prompt=f"{SHADE} Animation: {anim}, {frames} frames. {text}",
        notes="Generate all frames in one image so they match, with the batch 2 drift strip attached as the reference.")
add("refugee", "creatures/refugee/wave.png", 320, 320, frames=2, batch=3, kind="strip",
    prompt="A refugee in a ragged, snow-caked coat at the edge of the light, holding up a dim lantern and waving, facing left. Generic look, hood up, face in shadow. Two frames: arm up, arm higher.")

# ---------------------------------------------------------------- effects

for eid, b, w, h, frames, text in [
    ("debris-rock", 1, 128, 128, 4, "Dig debris burst of grey rock chips flying up and out, then falling."),
    ("debris-dirt", 1, 128, 128, 4, "Dig debris burst of brown dirt clods and dust."),
    ("debris-coal", 1, 128, 128, 4, "Dig debris burst of black coal chips with one or two warm glints."),
    ("smoke-puff", 1, 128, 128, 4, "A soft grey smoke puff rising and fading."),
    ("breath-mist", 1, 64, 64, 4, "A small white breath cloud puffing out to the right and fading."),
    ("frost-overlay", 1, 320, 320, 1, "Frost crust to lay over a survivor: pale blue-white crystals in a rough body-sized patch, mostly transparent, for frost creeping over a freezing survivor."),
    ("falling-water", 1, 64, 256, 4, "A thin stream of falling water, pale blue, centred, splash-free, loop."),
    ("splash", 1, 128, 96, 4, "A small splash where a stream hits a pool."),
]:
    add(f"fx-{eid}", f"fx/{eid}.png", w, h, frames=frames, batch=b, kind="strip", anchor="centre", prompt=text)

# ---------------------------------------------------------------- interface

ICONS = ["dig", "cancel", "ladder", "hearth", "mushroom-bed", "diffuser", "bed", "lamp", "coal", "food", "survivors",
         "warmth", "breath", "energy", "hunger", "mood", "sleep", "death", "day", "night"]
ICON_TEXT = {
    "dig": "a pickaxe", "cancel": "a red X", "ladder": "a short ladder", "hearth": "a campfire", "mushroom-bed": "a glowing mushroom",
    "diffuser": "a teal canister with bubbles", "bed": "a cot", "lamp": "a lantern", "coal": "a lump of coal", "food": "a mushroom ration",
    "survivors": "two hooded heads", "warmth": "a flame", "breath": "a puff of breath", "energy": "a lightning bolt", "hunger": "an empty bowl",
    "mood": "a smiling face", "sleep": "a crescent moon with Zz", "death": "a small cairn of stones", "day": "a pale dim sun", "night": "a crescent moon and stars",
}
UI_ICON = ("Flat interface glyph in a clean modern style: one solid pure-white shape (#ffffff) on transparent, no outline, "
           "no shading, no texture, no painted detail, rounded geometric forms, stroke-like parts 10 px thick, the glyph filling "
           "the central 96 px with 16 px clear margin. Readable at 20 px. The game tints it, so colour is ignored.")
for i in ICONS:
    add(f"icon-{i}", f"ui/icons/{i}.png", 128, 128, batch=2, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Subject: {ICON_TEXT[i]}.")
for i, sym in [("pause", "two rounded vertical bars"), ("speed", "one forward chevron (the game repeats it for 2x and 3x)"),
               ("priority", "three rising bars"), ("alert", "an exclamation mark in a rounded triangle"),
               ("inspect", "a magnifying glass"), ("research", "a flask over an open book"), ("haul", "a sack over a shoulder"),
               ("iron", "a lump of ore"), ("crystal", "a faceted shard"), ("coke", "a rounded rectangular briquette"),
               ("iron-bar", "an ingot"), ("lens", "a round cut lens with one highlight"),
               ("tech-burner", "fire-bars over a flame"), ("tech-crystal-lamp", "a lantern with a diamond shape inside"),
               ("tech-heater", "a stove with a chimney and three heat waves")]:
    add(f"icon-{i}", f"ui/icons/{i}.png", 128, 128, batch=3, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Subject: {sym}. Same family as the batch 2 icons.")
for i, sym in [("stone", "a rough rock with two flat faces"), ("deconstruct", "a crowbar prying up a plank"),
               ("area", "a dashed rounded rectangle with a small arrow cursor at its corner (drag to select an area)"),
               ("cancel-area", "a dashed rounded rectangle with an X inside")]:
    add(f"icon-{i}", f"ui/icons/{i}.png", 128, 128, batch=3, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Subject: {sym}. Same family as the batch 2 icons.")
ROLE_TEXT = {"hauler": "a sack", "digger": "a pickaxe", "builder": "a hammer", "firekeeper": "a flame over tongs", "farmer": "a mushroom",
             "medic": "a cross", "guard": "a crossbow"}
for r, sym in ROLE_TEXT.items():
    add(f"badge-{r}", f"ui/roles/{r}.png", 128, 128, batch=3, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Role glyph for the {r}: {sym}.")
TRAIT_TEXT = {"hardy": "a shield with a snowflake", "night-owl": "an owl head", "glutton": "a bowl overflowing", "brave": "a raised fist",
              "nervous": "a wobbly droplet of sweat", "afraid-of-dark": "a crossed-out moon",
              "quick": "a boot with speed lines", "lazy": "a hammock", "kind": "a heart in an open hand"}
for t, sym in TRAIT_TEXT.items():
    add(f"trait-{t}", f"ui/traits/{t}.png", 128, 128, batch=3, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Trait glyph for '{t.replace('-', ' ')}': {sym}.")
# ---------------------------------------------------------------- batch 4 additions: rooms and tiles, cooking, toolbar categories, day cycle
# The game has code-built fallbacks for all of these, so nothing waits on them.

add("tex-tile", "terrain/tile.png", 512, 512, batch=4, kind="texture", alpha=False, seamless=True, anchor="none",
    prompt="Seamless tileable texture, fills the whole square, no outlines around the tile, flat even light. Built stone tile: laid cut-stone blocks with thin mortar lines, "
           "in rows like a neat wall, cool grey (#5a5b5f #7a7873 with a lighter block here and there) a shade lighter than the cave rock, one crisp shadow edge on each block. "
           "Survivors stack it to make platforms, bridges and walls; the game draws it through the terrain shader like rock, dirt and coal. "
           "Same 4x4-cell tiling rules as tex-rock: one tile covers 4x4 cells (128 px per cell), so no feature bigger than about 180 px.")
for i, sym, extra in [
    ("tile", "a stack of three blocks", ""),
    ("door", "a doorway with the door ajar", ""),
    ("room-bedroom", "a bed under a small roof or arch (a room label for the inspect panel)", "Optional."),
    ("room-hearth", "a campfire under a small roof or arch (a room label for the inspect panel)", "Optional."),
    ("room-cellar", "a barrel under a small roof or arch (a room label for the inspect panel)", "Optional."),
    ("meal", "a skewer with roast mushrooms, for the food stat and the morale breakdown", ""),
    ("skill-dig", "a pickaxe head (skill glyph for the Colony screen and the stranger card)", "Optional."),
    ("skill-build", "a hammer (skill glyph for the Colony screen and the stranger card)", "Optional."),
    ("skill-fire", "a flame (skill glyph for the Colony screen and the stranger card)", "Optional."),
    ("skill-haul", "a sack (skill glyph for the Colony screen and the stranger card)", "Optional."),
    ("cat-build", "a ladder crossed with a stone block (toolbar category: building)", ""),
    ("cat-fire", "a flame over a small lantern (toolbar category: fire and light)", ""),
    ("cat-living", "a bedroll with a mushroom (toolbar category: living)", ""),
    ("cat-industry", "an anvil with a flask (toolbar category: industry)", ""),
    ("dusk", "a sun half-sunk under a horizon line with a down arrow (clock glyph: dusk)", ""),
    ("dawn", "a sun half-risen over a horizon line with an up arrow (clock glyph: dawn)", ""),
]:
    add(f"icon-{i}", f"ui/icons/{i}.png", 128, 128, batch=4, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Subject: {sym}. Same family as the batch 2 and 3 icons.",
        notes=extra)

add("prop-spit", "props/spit.png", 384, 160, batch=4, kind="sprite",
    prompt="A green-stick roasting spit set across the front of a hearth: two forked green sticks standing in the ground at either end of the hearth's stone ring, "
           "a straight green stick laid across them with three skewered roast mushrooms (pale lilac caps #c9b6e4 #9d86c4 gone browned at the edges) and a small cord crank loop at one end. "
           "Same canvas, scale and ground line as buildings/hearth.png (384x160), so it lines up exactly when drawn over the hearth. No flame, no stones (the hearth is a separate sprite).",
    notes="Drawn over the hearth only while a cooking errand is under way. Paint it on top of building-hearth as a guide, then remove the hearth so only the spit remains.")
for name in CAST:
    add(f"{name}-pose-cook", f"characters/{name}/poses/cook.png", 320, 320, frames=4, batch=4, kind="pose", character=name,
        prompt=f"{CHAR_TEXT[name]}. Crouched at a hearth, side view facing right, turning a roasting spit: the far mitten steadies the stick, the near mitten turns the crank, "
               "the spit itself and the hearth are not painted (the game draws them: leave them out). Frame 1: mitten at the top of the turn. Frame 2: a quarter turn, mitten forward. "
               "Frame 3: mitten at the bottom. Frame 4: mitten coming back up, a small satisfied smile. Same crouch and feet in every frame; only the near arm and face change. "
               + POSE_SCALE_RULE,
        notes="Generate all four frames in one image so they match. Same frame and feet line (y=304) as the other poses; the spit sits about one cell in front of the figure.")

# Water (batch 4): see BRIEF.md "Water". The hand pump is building-water-pump (batch 3) and is reused.
SAME_OUTLINE = "Front view, ground at the bottom edge. Every state of this building has the same outline and position, only the changing parts differ."
for bid, cw, ch, h, states, text in [
    ("water-barrel", 1, 1, 192, ["empty", "half", "full"],
     "A stout wooden barrel with two iron hoops and a lid left ajar, the colony's starting water supply in the start cave. empty: dark inside the gap under the lid, nothing visible. half: a band of water just visible under the lid. full: the water close to the rim and showing bright under the lid (water painted flat, pale blue #9cc4e4 over deep #2a5f78)."),
    ("cistern", 2, 1, 192, ["empty", "half", "full"],
     "A squat tank of fitted stone with timber bands and a plank lid, a ladle hanging on a hook at one side. One gap between two boards in the front shows the water level inside. empty: the gap shows dark. half: water fills the lower half of the gap. full: water fills the gap to the top (painted flat, pale blue #9cc4e4 over deep #2a5f78)."),
    ("drip-catcher", 1, 1, 192, ["dry", "dripping"],
     "A small wooden trough on four short legs with a funnel of oiled hide pegged on a thin frame above it, built under wet rock. dry: funnel and trough empty and dull. dripping: two or three drops in the funnel and one falling, a little water shining in the trough (painted flat, pale blue)."),
]:
    for st in states:
        add(f"building-{bid}-{st}", f"buildings/{bid}-{st}.png", cw * CELL, h, batch=4, kind="sprite",
            prompt=f"{text} State: {st}.",
            notes=f"Footprint {cw} x {ch} cells. {SAME_OUTLINE}")
add("building-mushroom-bed-dry", "buildings/mushroom-bed-dry.png", 2 * CELL, 160, batch=4, kind="sprite",
    prompt="The batch 1 mushroom bed (building-mushroom-bed-seedling, -growing, -ready) from a dry spell: exactly the same plank box, outline and position, but the soil is cracked and pale grey-brown, "
           "and the few mushrooms in it have drooping, wrinkled caps leaning over. State: dry.",
    notes=f"Footprint 2 x 1 cells. {SAME_OUTLINE} Paint it on top of building-mushroom-bed-growing as a guide so the planks line up.")
add("prop-bucket", "props/bucket.png", 320, 320, batch=4, kind="prop", anchor="grip",
    prompt="A wooden bucket with two iron bands and a rope handle (grip at the rope loop), water visible near the rim, a bright pale-blue surface. "
           "Held: the grip point is exactly at (172, 238). The bucket hangs from the grip, so it falls below the rope loop and the whole bucket stays inside the frame.",
    notes="Hangs from the grip like coal-sack, rather than pointing up like the tools.")
for name in CAST:
    add(f"{name}-pose-drink", f"characters/{name}/poses/drink.png", 320, 320, frames=4, batch=4, kind="pose", character=name,
        prompt=f"{CHAR_TEXT[name]}. Crouched side view facing right, drinking from cupped hands (or a wooden ladle): the water source is not painted, the game draws it. "
               "Frame 1: crouched, cupped mittens held out in front, a little water in them. Frame 2: hands raised to the mouth. Frame 3: head tipped back a little, drinking. "
               "Frame 4: lowering the hands, a relieved breath. Same crouch and feet in every frame; only the arms, head and face change. " + POSE_SCALE_RULE,
        notes="Generate all four frames in one image so they match. Same frame and feet line (y=304) as the other poses.")
add("fx-drip", "fx/drip.png", 64, 128, frames=6, batch=4, kind="strip", anchor="centre",
    prompt="A single water drop forming on a rock ceiling at the top of the frame: frames 1 and 2 it swells and hangs, frame 3 it lets go, frame 4 it falls as a stretched drop, "
           "frames 5 and 6 it splashes into a few droplets at the bottom. Pale blue (#9cc4e4 #e4f1fb), small, flat painted shapes, loop.")
for i, sym in [("water", "a single water drop"),
               ("thirst", "a single water drop with a jagged crack running through it (thirst: the need is unmet)"),
               ("cistern", "a squat tank with a horizontal level line inside it"),
               ("drip-catcher", "a water drop above a small trough"),
               ("tech-pumps", "a hand pump handle with its spout")]:
    add(f"icon-{i}", f"ui/icons/{i}.png", 128, 128, batch=4, kind="icon", anchor="centre",
        prompt=f"{UI_ICON} Subject: {sym}. Same family as the batch 2 and 3 icons.")

add("wordmark", "ui/wordmark.png", 1600, 480, batch=2, kind="sprite", anchor="centre",
    prompt="The word HEARTHFALL as a painted logo: chunky hand-cut capital letters like carved, charred wood, warm ember light catching the top edges, frost on the bottom edges, a small flame rising from the crossbar of the first A. Transparent background. The text must be spelled exactly HEARTHFALL, and nothing else may be written.")

# ---------------------------------------------------------------- story

STORY = [
    ("1", 2, "The last warm day: a small mountain mining town at midday, people in coats in the square, the sun pale and too small in a washed-out sky, light cold and thin. A child points up at it."),
    ("2", 2, "Frozen fields: a farm under deep snow, a broken frozen windmill, a family in heavy coats standing in a dead field looking up at the weak sun."),
    ("3", 2, "The walk: a long line of survivors crossing deep snow at dusk, small and dark against a huge blue landscape, each carrying a lantern or a clay pot of embers, the lights making a dotted line."),
    ("4", 2, "The descent: the line entering a mine mouth in a cliff face, timber frame, warm light spilling out of the tunnel onto the snow."),
    ("5", 2, "The first hearth: underground, Esk, Mara, Tobin and Ostra (from CHARACTERS.md, recognisable by their hats, hoods and scarves) kneeling round a new campfire on a cave floor, Mara striking the flint, faces lit warm orange, deep blue darkness all around, breath mist."),
    ("6", 2, "Title scene: a lone hearth glowing at the bottom of a vast dark cave, tiny figures around it, the cave walls fading up into blackness, empty dark space in the top third for the wordmark."),
    ("win", 4, "The Deep Hearth relit: a huge cavern flooded with warm light, the six survivors from CHARACTERS.md cheering on a ledge, frost melting off the rocks."),
    ("lose", 4, "The colony gone cold: a dark, frosted hearth with grey ash, an abandoned mitten and a red scarf in the snow-dusted cave, blue light only."),
]
for sid, b, text in STORY:
    add(f"story-{sid}", f"story/{sid}.png", 1920, 1080, batch=b, kind="illustration", alpha=False, anchor="none",
        prompt=text)
    for layer, ltext in [("back", "sky or far background only, fully opaque"),
                         ("mid", "middle ground on transparent"),
                         ("front", "foreground figures and nearest objects on transparent")]:
        add(f"story-{sid}-{layer}", f"story/{sid}-{layer}.png", 1920, 1080, batch=b, kind="layer",
            alpha=(layer != "back"), anchor="none",
            prompt=f"Parallax layer '{layer}' of story scene {sid}: {ltext}. Stacked back, mid, front they must reproduce story/{sid}.png exactly.",
            notes="Painted extensions: the back layer continues behind the cut-out mid and front so there are no holes when the layers slide.")

# ---------------------------------------------------------------- write

for a in assets:
    a["path"] = "art-codex/out/" + a["path"]
ids = [a["id"] for a in assets]
assert len(ids) == len(set(ids)), "duplicate ids"
(ROOT / "assets.json").write_text(json.dumps({"assets": assets}, indent=1) + "\n")

lines = ["# Asset list", "",
         "Generated from `tools/make_manifest.py`; do not edit by hand. Sizes are per frame; a strip of N frames is N times as wide.",
         "`compose` rows are built by `tools/compose_character.py`, not painted.", ""]
titles = {1: "Batch 1: fix what looks bad now", 2: "Batch 2: the full cast, the story and the interface",
          3: "Batch 3: a deeper, bigger colony, and fixes from play-testing", 4: "Batch 4: the endgame, rooms and tiles, cooking, toolbar categories and the day cycle"}
for b in (1, 2, 3, 4):
    group = [a for a in assets if a["batch"] == b]
    lines += [f"## {titles[b]} ({len(group)} files)", "",
              "| id | save as | size | frames | alpha | what |", "|---|---|---|---|---|---|"]
    for a in group:
        what = a["prompt"].replace("|", "/") + (f" *{a['notes']}*" if a["notes"] else "")
        if a["source"] == "compose":
            what = "**compose:** " + what
        lines.append(f"| `{a['id']}` | `{a['path']}` | {a['width']}x{a['height']} | {a['frames']} | {'yes' if a['alpha'] else 'no'} | {what} |")
    lines.append("")
(ROOT / "ASSETS.md").write_text("\n".join(lines))
print(f"{len(assets)} assets")
