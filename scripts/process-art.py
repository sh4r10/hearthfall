#!/usr/bin/env python3
"""Turn the raw AI art batch into game-ready files in apps/client/art/.

    python3 scripts/process-art.py /mnt/project-files/hearthfall/art-src

The raw images are kept outside the repo (they are large). This script:
- cuts sprites out of their plain grey backgrounds, including enclosed
  pockets of background (between an arm and the body, inside a ladder),
  and trims a pixel of grey fringe off the edges;
- splits sheets (character turnarounds, body parts, the flame strip) into
  separate pieces by finding each drawing;
- makes the terrain textures tile seamlessly;
- scales everything to the sizes the game expects (see apps/client/art/README.md).

Needs Pillow, numpy and scipy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ART = Path(__file__).resolve().parent.parent / "apps" / "client" / "art"


def cut_out(img: Image.Image, tolerance: int = 26) -> Image.Image:
    """Make the plain background transparent."""
    rgb = np.asarray(img.convert("RGB")).astype(np.int16)
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    ref = np.median(border, axis=0)
    dist = np.abs(rgb - ref).max(axis=2)
    candidate = dist < tolerance
    labels, count = ndimage.label(candidate)
    background = np.zeros_like(candidate)
    edge_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    sizes = ndimage.sum(candidate, labels, range(1, count + 1))
    means = ndimage.mean(dist, labels, range(1, count + 1))
    for i in range(1, count + 1):
        # Enclosed pockets count too when they are big, flat and grey, which painted parts never are.
        if i in edge_labels or (sizes[i - 1] > 300 and means[i - 1] < 9):
            background |= labels == i
    alpha = ~background
    alpha = ndimage.binary_erosion(alpha, iterations=1)
    alpha = ndimage.binary_opening(alpha, iterations=1)
    a = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    out = img.convert("RGBA")
    out.putalpha(a)
    return out


def pieces(img: Image.Image, min_area: int = 2000, join: int = 6):
    """Bounding boxes of the separate drawings on a cut-out sheet, top to bottom, left to right."""
    alpha = np.asarray(img)[:, :, 3] > 40
    grown = ndimage.binary_dilation(alpha, iterations=join)
    labels, count = ndimage.label(grown)
    boxes = []
    for sl in ndimage.find_objects(labels):
        y, x = sl
        if (y.stop - y.start) * (x.stop - x.start) >= min_area:
            boxes.append((x.start, y.start, x.stop, y.stop))
    rows = sorted(boxes, key=lambda b: b[1])
    # Group into rows by vertical overlap, then sort each row left to right.
    grouped, current = [], []
    for b in rows:
        if current and b[1] > max(c[3] for c in current) - 20:
            grouped.append(current)
            current = []
        current.append(b)
    if current:
        grouped.append(current)
    return [b for row in grouped for b in sorted(row, key=lambda b: b[0])]


def trim(img: Image.Image) -> Image.Image:
    return img.crop(img.getbbox())


def to_height(img: Image.Image, height: int) -> Image.Image:
    return img.resize((max(1, round(img.width * height / img.height)), height), Image.LANCZOS)


def seamless(img: Image.Image, size: int) -> Image.Image:
    """Blend the image with a half-offset copy of itself so its edges wrap."""
    side = min(img.size)
    left, top = (img.width - side) // 2, (img.height - side) // 2
    img = img.convert("RGB").crop((left, top, left + side, top + side)).resize((size, size), Image.LANCZOS)
    a = np.asarray(img).astype(np.float32)
    rolled = np.roll(a, (size // 2, size // 2), axis=(0, 1))
    t = np.abs(np.linspace(-1, 1, size))
    edge = np.clip((np.maximum.outer(t, t) - 0.55) / 0.4, 0, 1)  # 0 in the middle, 1 at the edges
    edge = edge * edge * (3 - 2 * edge)
    out = a * (1 - edge[..., None]) + rolled * edge[..., None]
    return Image.fromarray(out.astype(np.uint8))


def flame_frames(img: Image.Image, height: int = 192):
    """The flame strip is on black: brightness becomes alpha. Returns one strip of equal frames."""
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    alpha = rgb.max(axis=2)
    alpha = np.clip((alpha - 12) * 1.15, 0, 255)
    colour = np.clip(rgb * 255 / np.maximum(rgb.max(axis=2, keepdims=True), 1), 0, 255)
    rgba = np.dstack([colour, alpha]).astype(np.uint8)
    sheet = Image.fromarray(rgba, "RGBA")
    # Eight frames in equal columns; stray sparks would split a frame if we searched for drawings.
    n = 8
    frames = [trim(sheet.crop((round(i * sheet.width / n), 0, round((i + 1) * sheet.width / n), sheet.height))) for i in range(n)]
    fw = max(f.width for f in frames)
    fh = max(f.height for f in frames)
    # Bottom-align every frame in a fixed cell so the flame base stays put.
    cells = []
    for f in frames:
        cell = Image.new("RGBA", (fw, fh))
        cell.paste(f, ((fw - f.width) // 2, fh - f.height))
        cells.append(to_height(cell, height))
    strip = Image.new("RGBA", (cells[0].width * len(cells), height))
    for i, c in enumerate(cells):
        strip.paste(c, (i * c.width, 0))
    return strip, len(cells)


def main():
    src = Path(sys.argv[1])
    ART.mkdir(parents=True, exist_ok=True)
    save = lambda img, name: img.save(ART / f"{name}.png", optimize=True)
    load = lambda name: Image.open(src / name)

    for name, file, size in [("rock", "03-rock-texture.png", 512), ("dirt", "04-dirt.png", 512), ("coal", "05-coal.png", 512), ("backwall", "06-cave-wall.png", 512)]:
        save(seamless(load(file), size), name)

    for name, file, height in [("hearth", "07-hearth.png", 160), ("ladder", "09-ladder.png", 160), ("mushroom-bed", "10-mushroom-planter.png", 128), ("diffuser", "11-oxygen-diffuser.png", 256)]:
        save(to_height(trim(cut_out(load(file))), height), name)

    strip, count = flame_frames(load("08-flame.png"))
    save(strip, "flame")

    # Survivors: front and side views from the turnaround sheets, and boots
    # from the parts sheets for walking legs.
    for variant, (sheet_file, parts_file) in enumerate([("01-character-sheet.png", "02-body-parts-male.png"), ("01-character-sheet-female.png", "02-body-parts-female.png")]):
        sheet = cut_out(load(sheet_file))
        # The full-body turnaround is the three tallest drawings on the top half: front, side, back.
        tall = sorted((b for b in pieces(sheet, join=1) if b[1] < sheet.height // 2 and b[3] < sheet.height * 0.62), key=lambda b: b[3] - b[1])[-3:]
        boxes = sorted(tall, key=lambda b: b[0])
        front, side = (sheet.crop(b) for b in boxes[:2])
        save(to_height(trim(front), 256), f"survivor-{variant}-front")
        save(to_height(trim(side), 256), f"survivor-{variant}-side")
        parts = cut_out(load(parts_file))
        half = parts.crop((parts.width // 2 + 10, 0, parts.width, parts.height))
        part_boxes = pieces(half, min_area=4000)
        # The two boots are the last row of the parts layout.
        boots = sorted(part_boxes, key=lambda b: b[1])[-2:]
        for k, b in enumerate(sorted(boots, key=lambda b: b[0])):
            save(to_height(trim(half.crop(b)), 96), f"survivor-{variant}-leg{k}")

    story = load("12-story.png").convert("RGB")
    story.thumbnail((1600, 900), Image.LANCZOS)
    story.save(ART / "story-1.jpg", quality=86)


if __name__ == "__main__":
    main()
