#!/usr/bin/env python3
"""Copy the Codex art batches into apps/client/art/ under the names the game loads.

    python3 scripts/import-codex-art.py path/to/art-codex/out

The art is made on the `art/codex` branch (see art-codex/BRIEF.md there), already
cut out, cleaned and at exact sizes, so this only picks files, renames them and
scales the survivor strips down to the size the game draws them at. Survivor N
is the Nth name in CAST. Needs Pillow.
"""
import shutil
import sys
from pathlib import Path

from PIL import Image

ART = Path(__file__).resolve().parent.parent / "apps" / "client" / "art"
CAST = ["esk", "mara", "tobin", "ostra", "pim", "ruta"]
FRAME = 320  # survivor frame size in the Codex art
SHOWN = 192  # survivor frame size in the game

# game name: Codex path
COPY = {
    "rock": "terrain/rock.png",
    "dirt": "terrain/dirt.png",
    "coal": "terrain/coal.png",
    "backwall": "terrain/backwall.png",
    "water": "terrain/water.png",
    "hearth": "buildings/hearth.png",
    "flame": "buildings/flame.png",
    "ladder": "buildings/ladder.png",
    "mushroom-bed": "buildings/mushroom-bed-ready.png",
    "mushroom-bed-growing": "buildings/mushroom-bed-growing.png",
    "mushroom-bed-seedling": "buildings/mushroom-bed-seedling.png",
    "cairn": "buildings/grave.png",
    "bed": "buildings/bed-empty.png",
    "lamp": "buildings/lamp-on.png",
    "stockpile": "buildings/stockpile-empty.png",
    "stockpile-half": "buildings/stockpile-half.png",
    "stockpile-full": "buildings/stockpile-full.png",
    "pile-coal": "items/coal-chunk.png",
    "pile-ore": "items/iron-ore-pile.png",
    "pile-crystal": "items/crystal-pile.png",
    "iron-ore": "terrain/iron-ore.png",
    "crystal": "terrain/crystal.png",
    "hearth-grate": "buildings/hearth-grate.png",
    "workbench": "buildings/workbench-idle.png",
    "workbench-working": "buildings/workbench-working.png",
    "coke-oven": "buildings/coke-oven-off.png",
    "coke-oven-on": "buildings/coke-oven-on.png",
    "smelter": "buildings/smelter-off.png",
    "smelter-on": "buildings/smelter-on.png",
    "crystal-lamp": "buildings/crystal-lamp-on.png",
}
# Props cut to their painted area, for markers and icons in the world.
CROP = {"pickaxe": "props/pickaxe.png"}
# Strips of FRAME x FRAME cells, scaled to SHOWN.
ANIMS = ["idle", "walk", "dig", "build", "carry", "climb", "celebrate", "cold", "sleep"]
POSES = ["eat", "collapse", "dead", "sleep-back"]
# Batch 1 painted some whole-body poses bigger than the rigged animations.
# Shrink them about the feet so heads match the walk cycle. Drop an entry once
# Codex repaints that pose at the right scale.
POSE_SCALE = {
    ("esk", "eat"): 0.7, ("esk", "collapse"): 0.8, ("esk", "dead"): 0.8,
    ("mara", "eat"): 0.8, ("mara", "collapse"): 0.8, ("mara", "dead"): 0.8,
    ("tobin", "eat"): 0.75, ("ostra", "eat"): 0.75, ("pim", "eat"): 0.75, ("ruta", "eat"): 0.75,
}
FEET = 304  # feet row in a survivor frame


def rescale(img, k):
    """Scale every frame of a strip by k about the centre of its feet row."""
    out = Image.new("RGBA", img.size)
    side = round(FRAME * k)
    for f in range(img.width // FRAME):
        frame = img.crop((f * FRAME, 0, (f + 1) * FRAME, FRAME)).resize((side, side), Image.LANCZOS)
        out.paste(frame, (f * FRAME + (FRAME - side) // 2, FEET - round(FEET * k)), frame)
    return out


# Effects, kept at their own size: game name, Codex path.
FX = {name: f"fx/{name}.png" for name in
      ["debris-rock", "debris-dirt", "debris-coal", "smoke-puff", "breath-mist", "falling-water", "splash"]}
# Shade strips, 320 px frames scaled like the survivors.
SHADE = ["drift", "lunge", "recoil"]
# Interface glyphs used now: game name: Codex icon. The coal, food, survivors
# and hearth glyphs blur at 20 px and are repainted in batch 3, so the drawn
# icons stay for those until then (see docs/art-usage.md).
ICONS = {"dig": "dig", "ladder": "ladder", "mushroom": "mushroom-bed", "cancel": "cancel", "sun": "day", "moon": "night",
         "warmth": "warmth", "energy": "energy", "mood": "mood", "sleep": "sleep", "lamp": "lamp", "bed": "bed",
         "skull": "death", "research": "research", "coke": "coke", "crystal": "crystal", "ore": "iron", "iron": "iron-bar",
         "grate": "tech-burner", "crystal-lamp": "tech-crystal-lamp"}


def save(img, path):
    """Flat-colour art survives a 256-colour palette well and the files shrink
    to about a third, which keeps the one-file demo small."""
    img.convert("RGBA").quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(path, optimize=True)


def shrink(img, width):
    return img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)


def sources():
    """Every Codex file this script brings into the game, relative to art-codex/out."""
    out = list(COPY.values()) + list(CROP.values()) + list(FX.values())
    for who in CAST:
        out += [f"characters/{who}/anim/{a}.png" for a in ANIMS] + [f"characters/{who}/poses/{p}.png" for p in POSES]
        out.append(f"characters/{who}/portrait.png")
    out += ["fx/frost-overlay.png", "ui/wordmark.png", "story/6.png"] + [f"creatures/shade/{a}.png" for a in SHADE]
    return out + [f"ui/icons/{i}.png" for i in ICONS.values()]


def main():
    src = Path(sys.argv[1])
    for old in ART.glob("survivor-*"):
        old.unlink()
    for name, path in COPY.items():
        shutil.copyfile(src / path, ART / f"{name}.png")
    for name, path in CROP.items():
        img = Image.open(src / path)
        img.crop(img.getbbox()).save(ART / f"{name}.png", optimize=True)
    for v, who in enumerate(CAST):
        base = src / "characters" / who
        strips = {a: base / "anim" / f"{a}.png" for a in ANIMS} | {p: base / "poses" / f"{p}.png" for p in POSES}
        for name, path in strips.items():
            img = Image.open(path).convert("RGBA")
            if (who, name) in POSE_SCALE:
                img = rescale(img, POSE_SCALE[(who, name)])
            frames = img.width // FRAME
            save(img.resize((frames * SHOWN, SHOWN), Image.LANCZOS), ART / f"survivor-{v}-{name}.png")
        Image.open(base / "portrait.png").resize((128, 128), Image.LANCZOS).save(ART / f"survivor-{v}-portrait.png", optimize=True)
    frost = Image.open(src / "fx/frost-overlay.png").convert("RGBA")
    frost.resize((SHOWN, SHOWN), Image.LANCZOS).save(ART / "frost-overlay.png", optimize=True)
    for name, path in FX.items():
        shutil.copyfile(src / path, ART / f"{name}.png")
    for anim in SHADE:
        img = Image.open(src / "creatures/shade" / f"{anim}.png").convert("RGBA")
        save(img.resize((img.width // FRAME * SHOWN, SHOWN), Image.LANCZOS), ART / f"shade-{anim}.png")
    for old in ART.glob("icon-*"):
        old.unlink()
    for name, icon in ICONS.items():
        Image.open(src / "ui/icons" / f"{icon}.png").resize((64, 64), Image.LANCZOS).save(ART / f"icon-{name}.png", optimize=True)
    save(shrink(Image.open(src / "ui/wordmark.png"), 800), ART / "wordmark.png")
    # The title scene leaves its top third empty for the wordmark.
    shrink(Image.open(src / "story/6.png").convert("RGB"), 1600).save(ART / "story-title.jpg", quality=82, optimize=True)


if __name__ == "__main__":
    main()
