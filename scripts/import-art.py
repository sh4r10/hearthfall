#!/usr/bin/env python3
"""Clean up an AI-generated image and drop it into apps/client/art/.

Sprites: removes a plain background by flood-filling from the corners,
trims to the content, and scales to the target height.
Textures (--texture): crops to a centred square and resizes, no cut-out.

    python3 scripts/import-art.py upload.png ladder --height 128
    python3 scripts/import-art.py upload.png rock --texture --size 512
"""
import argparse
from collections import deque
from pathlib import Path

from PIL import Image

ART = Path(__file__).resolve().parent.parent / "apps" / "client" / "art"


def remove_background(img: Image.Image, tolerance: int) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    queue = deque()
    for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        queue.append((x, y, px[x, y]))
    while queue:
        x, y, ref = queue.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y * w + x]:
            continue
        r, g, b, a = px[x, y]
        if max(abs(r - ref[0]), abs(g - ref[1]), abs(b - ref[2])) > tolerance:
            continue
        seen[y * w + x] = 1
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            queue.append((x + dx, y + dy, ref))
    return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("name", help="file name in apps/client/art, without .png")
    ap.add_argument("--texture", action="store_true", help="seamless texture: no cut-out")
    ap.add_argument("--size", type=int, default=512, help="texture size in px")
    ap.add_argument("--height", type=int, default=128, help="sprite height in px")
    ap.add_argument("--tolerance", type=int, default=28, help="background colour tolerance")
    args = ap.parse_args()

    img = Image.open(args.source)
    if args.texture:
        side = min(img.size)
        left, top = (img.width - side) // 2, (img.height - side) // 2
        img = img.convert("RGB").crop((left, top, left + side, top + side)).resize((args.size, args.size), Image.LANCZOS)
    else:
        img = remove_background(img, args.tolerance)
        img = img.crop(img.getbbox())
        img = img.resize((round(img.width * args.height / img.height), args.height), Image.LANCZOS)
    ART.mkdir(parents=True, exist_ok=True)
    out = ART / f"{args.name}.png"
    img.save(out)
    print(f"{out} {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
