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
CAST = ["esk", "mara"]
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
    "diffuser": "buildings/diffuser-on.png",
    "diffuser-off": "buildings/diffuser-off.png",
    "cairn": "buildings/grave.png",
    "bed": "buildings/bed-empty.png",
    "lamp": "buildings/lamp-on.png",
    "lamp-off": "buildings/lamp-off.png",
}
# Props cut to their painted area, for markers and icons in the world.
CROP = {"pickaxe": "props/pickaxe.png"}
# Strips of FRAME x FRAME cells, scaled to SHOWN.
ANIMS = ["idle", "walk", "dig", "build", "carry", "climb", "celebrate", "cold", "sleep"]
POSES = ["eat", "collapse", "dead"]


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
            img = Image.open(path)
            frames = img.width // FRAME
            img.resize((frames * SHOWN, SHOWN), Image.LANCZOS).save(ART / f"survivor-{v}-{name}.png", optimize=True)
        Image.open(base / "portrait.png").resize((128, 128), Image.LANCZOS).save(ART / f"survivor-{v}-portrait.png", optimize=True)


if __name__ == "__main__":
    main()
