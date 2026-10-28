#!/usr/bin/env python3
"""Check generated art against art-codex/assets.json and rig.json.

    python3 art-codex/tools/check_art.py [--batch N] [--id PREFIX] [--strict] [--report out.md]
                                         [--root DIR] [--character NAME] [--no-sheet]

Every manifest asset (after filters) that exists is checked; missing ones are listed
(a warning, or a FAIL with --strict). Prints a PASS/WARN/FAIL table and exits 1 on any FAIL.
Also writes <root>/contact-sheet-<batchN|id|all>.png to eyeball the set.

--root      art out dir to check (default art-codex/out); manifest paths art-codex/out/... map into it.
--character check a survivor that is not in the cast (e.g. the placeholder 'test'): its rows are
            cloned from esk's and only that character is checked.
Only Pillow and numpy are needed.
"""
import argparse
import json
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
CODEX = HERE.parent
MANIFEST_PREFIX = "art-codex/out/"

OPAQUE = 128          # alpha at/above this counts as content
CLEAR = 16            # alpha below this counts as transparent
# assets allowed to touch given edges (t=top b=bottom l=left r=right) besides bottom-centre's bottom
EDGE_OK = {"building-ladder": "tb", "creature-deep-thing-limb-reach": "l"}
SOFT_FX = ("fx-", "water-surface")       # pale, soft by design: halo check only warns
CHAR_KINDS = ("pose", "anim")


# ------------------------------------------------------------------ results

class Result:
    def __init__(self, asset):
        self.asset = asset
        self.fails, self.warns, self.notes = [], [], []

    def fail(self, msg):
        self.fails.append(msg)

    def warn(self, msg):
        self.warns.append(msg)

    def check(self, cond, msg, hard=True):
        if not cond:
            (self.fail if hard else self.warn)(msg)

    @property
    def status(self):
        return "FAIL" if self.fails else ("WARN" if self.warns else "PASS")


# ------------------------------------------------------------------ image helpers

def rgba_arrays(img):
    a = np.asarray(img.convert("RGBA")).astype(np.int16)
    return a[..., :3], a[..., 3]


def frames_of(img, a):
    w, h = a["width"], a["height"]
    return [img.crop((i * w, 0, (i + 1) * w, h)) for i in range(a["frames"])]


def sat_val(rgb):
    mx = rgb.max(axis=-1).astype(float)
    mn = rgb.min(axis=-1).astype(float)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    return sat, mx / 255.0


def neighbours_transparent(alpha):
    t = alpha < OPAQUE
    p = np.pad(t, 1, constant_values=True)
    return p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]


def bbox(alpha, thresh=OPAQUE):
    ys, xs = np.where(alpha >= thresh)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def main_share(alpha, thresh=OPAQUE):
    """Share of the opaque pixels that belong to the largest 8-connected piece. Below ~0.97 a part has come loose."""
    m = alpha >= thresh
    total = int(m.sum())
    if total == 0:
        return 1.0
    h, w = m.shape
    seen = np.zeros_like(m)
    best = 0
    from collections import deque
    for y0, x0 in zip(*np.nonzero(m)):
        if seen[y0, x0]:
            continue
        seen[y0, x0] = True
        q, n = deque([(y0, x0)]), 0
        while q:
            y, x = q.popleft()
            n += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and m[yy, xx] and not seen[yy, xx]:
                        seen[yy, xx] = True
                        q.append((yy, xx))
        best = max(best, n)
        if best * 2 > total:
            break
    return best / total


def joint_overlap(child, parent, pivot, radius=28):
    """Pixels where both parts are opaque within `radius` of the joint pivot."""
    h, w = child.shape
    yy, xx = np.mgrid[0:h, 0:w]
    near = (xx - pivot[0]) ** 2 + (yy - pivot[1]) ** 2 <= radius ** 2
    return int(((child >= OPAQUE) & (parent >= OPAQUE) & near).sum())


def border_mask(h, w, edges, width=2):
    m = np.zeros((h, w), bool)
    if "t" in edges:
        m[:width] = True
    if "b" in edges:
        m[-width:] = True
    if "l" in edges:
        m[:, :width] = True
    if "r" in edges:
        m[:, -width:] = True
    return m


# ------------------------------------------------------------------ individual checks

def check_alpha_frame(r, fr, a, label):
    """Corners/border clear, real content, not fully opaque, no halo, no flat background."""
    rgb, al = rgba_arrays(fr)
    h, w = al.shape
    exempt = EDGE_OK.get(a["id"], "")
    if a["anchor"] == "bottom-centre":
        exempt += "b"
    edges = "".join(e for e in "tblr" if e not in exempt)
    hard_border = a["kind"] in ("part", "pose", "prop", "sprite", "icon", "anim", "reference")
    if a["kind"] == "layer":
        edges = ""     # story parallax layers run off the canvas by design

    opaque_px = int((al >= OPAQUE).sum())
    r.check(opaque_px > 0.002 * h * w, f"{label}: empty (almost no opaque pixels)")
    r.check(not (al >= 250).all(), f"{label}: fully opaque, background not removed")

    if edges:
        bm = border_mask(h, w, edges)
        frac = float((al[bm] >= OPAQUE).mean())
        if frac > 0.25:
            r.check(False, f"{label}: {frac:.0%} of the outer 2 px border ({edges}) is opaque", hard_border)
        elif frac > 0.05:
            r.warn(f"{label}: content touches the frame border ({frac:.0%} of edges {edges})")
        corners = {"t": [(0, 0), (0, w - 2)], "b": [(h - 2, 0), (h - 2, w - 2)]}
        bad = 0
        for e, pts in corners.items():
            if e in edges:
                for y, x in pts:
                    if (al[y:y + 2, x:x + 2] >= OPAQUE).any():
                        bad += 1
        if bad >= 3:
            r.check(False, f"{label}: {bad} corners opaque (background left?)", hard_border)
        elif bad:
            r.warn(f"{label}: {bad} corner(s) opaque")

    # halo: outline / semi-transparent pixels that are light neutral grey or white
    if a["kind"] != "icon":
        edge = (al >= OPAQUE) & neighbours_transparent(al)
        semi = (al >= CLEAR) & (al < 240)
        rim = edge | semi
        n = int(rim.sum())
        if n > 50:
            sat, val = sat_val(rgb[rim])
            light = float(((sat < 0.14) & (val > 0.72)).mean())
            soft = a["id"].startswith(SOFT_FX)
            if light > 0.40:
                r.check(False, f"{label}: light grey/white halo on {light:.0%} of the outline", not soft)
            elif light > 0.20:
                r.warn(f"{label}: some light fringe on the outline ({light:.0%})")

    # flat background region touching the border
    if a["kind"] != "layer" and not a["seamless"]:
        share = flat_border_region(rgb, al)
        if share > 0.08:
            r.fail(f"{label}: flat single-colour region touching the border covers {share:.0%} (background not removed)")
        elif share > 0.03:
            r.warn(f"{label}: flat region touching the border covers {share:.0%}")


def flat_border_region(rgb, al, tol=10, max_side=200):
    """Share of the frame covered by the largest near-uniform opaque region connected to the border."""
    h, w = al.shape
    step = max(1, int(np.ceil(max(h, w) / max_side)))
    rgb, al = rgb[::step, ::step], al[::step, ::step]
    h, w = al.shape
    opaque = al >= 240
    bm = border_mask(h, w, "tblr", 1) & opaque
    if not bm.any():
        return 0.0
    cols = (rgb[bm] // 16).astype(np.int32)
    keys = cols[:, 0] * 256 + cols[:, 1] * 16 + cols[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    best = 0.0
    for k in vals[np.argsort(-counts)][:3]:
        seed_px = rgb[bm][keys == k]
        c = np.median(seed_px, axis=0)
        mask = opaque & (np.abs(rgb - c).max(axis=-1) <= tol)
        seeds = mask & border_mask(h, w, "tblr", 1)
        best = max(best, flood(mask, seeds).sum() / (h * w))
    return float(best)


def flood(mask, seeds):
    """Connected part of mask reachable from seeds (4-neighbour), BFS on a small grid."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    q = deque(zip(*np.where(seeds)))
    for y, x in q:
        seen[y, x] = True
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def seam_scores(arr, axis):
    """Wrap-seam diff and interior reference along an axis (1 = columns, 0 = rows).

    The reference is the larger of the mean adjacent-line difference and its 99th percentile
    divided by 2.5, so a smooth image with a few 1 px steps is not punished for one more step.
    """
    arr = arr.astype(float)
    other = tuple(i for i in range(arr.ndim) if i != axis)
    per_pair = np.abs(np.diff(arr, axis=axis)).mean(axis=other)
    s = np.abs(np.take(arr, -1, axis=axis) - np.take(arr, 0, axis=axis)).mean()
    ref = max(per_pair.mean(), np.percentile(per_pair, 99) / 2.5, 0.5)
    return s, ref


def check_seamless(r, img, a):
    if a["kind"] == "strip":   # water surface: horizontal wrap per frame, premultiplied
        for i, fr in enumerate(frames_of(img, a)):
            px = np.asarray(fr.convert("RGBA")).astype(float)
            pm = px[..., :3] * px[..., 3:4] / 255.0
            arr = np.concatenate([pm, px[..., 3:4]], axis=-1)
            s, d = seam_scores(arr, 1)
            r.check(s <= 2.5 * d, f"frame {i}: left/right edges do not wrap (seam {s:.1f} vs interior {d:.1f})")
        return
    arr = np.asarray(img.convert("RGB")).astype(float)
    for axis, name in ((1, "left/right"), (0, "top/bottom")):
        s, d = seam_scores(arr, axis)
        r.check(s <= 2.5 * d, f"{name} edges do not wrap (seam {s:.1f} vs interior {d:.1f})")
    lum = arr.mean(axis=-1)
    rim = np.concatenate([lum[:3].ravel(), lum[-3:].ravel(), lum[:, :3].ravel(), lum[:, -3:].ravel()]).mean()
    if abs(rim - lum.mean()) > 0.15 * max(lum.mean(), 1):
        r.warn(f"tile border is {'darker' if rim < lum.mean() else 'lighter'} than the middle (frame/vignette?)")


def check_style(r, img, a):
    rgb, al = rgba_arrays(img)
    m = al >= OPAQUE
    if not m.any():
        return
    sat, val = sat_val(rgb[m])
    if a["kind"] == "icon":
        white = float((rgb[m].min(axis=-1) >= 225).mean())
        r.check(white >= 0.9, f"icon is not white-on-transparent ({white:.0%} white pixels)", hard=False)
        return
    neon = float(((sat > 0.9) & (val > 0.9)).mean())
    if neon > 0.05:
        r.warn(f"{neon:.0%} of pixels are neon-saturated (palette is muted)")
    if a["kind"] not in ("strip",) and float((rgb[m].min(axis=-1) > 250).mean()) > 0.3:
        r.warn("over 30% pure white (blown out?)")


def check_strip(r, img, a, ground, airborne):
    frames = frames_of(img, a)
    lows, cents, lower_cents = [], [], []
    is_char = a["kind"] in CHAR_KINDS and a["character"]
    for i, fr in enumerate(frames):
        al = np.asarray(fr.getchannel("A"))
        n = int((al >= OPAQUE).sum())
        r.check(n > 0.002 * al.size, f"frame {i} is empty")
        if n == 0:
            lows.append(None); cents.append(None); lower_cents.append(None)
            continue
        ys, xs = np.where(al >= OPAQUE)
        lows.append(int(ys.max()))
        cents.append(float(xs.mean()))
        band = ys >= ys.max() - 20
        lower_cents.append(float(xs[band].mean()))

    if a["anchor"] == "bottom-centre":
        target = ground if is_char else a["height"] - 1
        tol = 4 if is_char else 6
        lenient = "collapse" in a["id"] or "dead" in a["id"]
        for i, lo in enumerate(lows):
            if lo is None:
                continue
            want = target + airborne.get(i, 0)
            off = abs(lo - want) > tol if is_char else not (want - tol <= lo <= want)
            if off:
                r.check(False, f"frame {i}: lowest opaque row {lo}, expected {'ground y=' if is_char else 'bottom '}{want} (±{tol})", not lenient)
        grounded = [lo - airborne.get(i, 0) for i, lo in enumerate(lows) if lo is not None]
        if len(grounded) > 1 and max(grounded) - min(grounded) > 3:
            r.check(False, f"feet/bottom row drifts {max(grounded) - min(grounded)} px between frames (max 3)", not lenient)

    if a["kind"] == "anim":
        for i, fr in enumerate(frames):
            share = main_share(np.asarray(fr.getchannel("A")))
            r.check(share >= 0.97, f"frame {i}: {100 * (1 - share):.0f}% of the figure is detached (a joint opens a gap); "
                                   "lengthen the joint caps of the parts")

    if a["frames"] > 1:
        if is_char:
            c = [x for x in lower_cents if x is not None]
            if c and max(c) - min(c) > 12:
                hard = "collapse" not in a["id"]
                r.check(False, f"lower body drifts {max(c) - min(c):.0f} px sideways between frames (max 12, jitter)", hard)
        else:
            c = [x for x in cents if x is not None]
            if c and max(c) - min(c) > 12:
                r.warn(f"centre of mass drifts {max(c) - min(c):.0f} px between frames (jitter?)")


def view_part(a):
    p = Path(a["path"])
    return p.parent.name, p.stem


def check_rig_part(r, img, a, rig):
    view, part = view_part(a)
    spec = rig["views"].get(view, {}).get("parts", {})
    key = "head" if part == "head-blink" else part
    if key not in spec:
        r.fail(f"'{part}' is not a part of the {view} view in rig.json")
        return
    al = np.asarray(img.getchannel("A"))
    ys, xs = np.where(al >= OPAQUE)
    if len(xs) == 0:
        return
    px, py = spec[key]["pivot"]
    d = float(np.sqrt((xs - px) ** 2 + (ys - py) ** 2).min())
    r.check(d <= 30, f"pivot {spec[key]['pivot']} is {d:.0f} px from the part (max 30): painted out of place?")


def stack_view(root, char, view, rig):
    layers = [p for p in rig["views"][view]["layers_back_to_front"] if p != "tool"]
    base = root / "characters" / char / view
    paths = [base / f"{p}.png" for p in layers]
    if not all(p.exists() for p in paths):
        return None
    W, H = rig["frame"]["width"], rig["frame"]["height"]
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for p in paths:
        im = Image.open(p).convert("RGBA")
        if im.size != (W, H):
            return None
        canvas.alpha_composite(im)
    return canvas


def check_figures(root, chars, rig, results):
    """Stacked parts per view: feet on ground, height in range; head-blink matches head; views agree."""
    ground = rig["frame"]["ground_y"]
    out = []
    for char in chars:
        heights = {}
        for view in rig["views"]:
            fig = stack_view(root, char, view, rig)
            if fig is None:
                continue
            r = Result({"id": f"{char}-{view}-stacked", "path": f"(parts of {char}/{view})", "kind": "figure",
                        "batch": None, "character": char})
            b = bbox(np.asarray(fig.getchannel("A")))
            if b is None:
                r.fail("stacked figure is empty")
            else:
                x0, y0, x1, y1 = b
                hgt = y1 - y0 + 1
                heights[view] = hgt
                r.check(abs(y1 - ground) <= 4, f"feet at y={y1}, ground is {ground} (±4)")
                r.check(230 <= hgt <= 270, f"figure is {hgt} px tall (want 230-270)")
                r.check(x0 > 2 and x1 < fig.width - 3 and y0 > 2, "stacked figure touches the frame edge")
                share = main_share(np.asarray(fig.getchannel("A")))
                r.check(share >= 0.97, f"{100 * (1 - share):.0f}% of the stacked figure is detached: a gap between parts")
                # A neck gap: rows between the head and the coat that only a braid or a scarf tail bridges.
                al = np.asarray(fig.getchannel("A")) >= OPAQUE
                widths = [int(np.ptp(np.nonzero(row)[0])) + 1 if row.any() else 0 for row in al]
                torso_w = max(widths[200:250]) if max(widths[200:250]) else 1
                solid = [int(row.sum()) for row in al]
                neck = min(solid[150:200])
                r.check(neck >= 0.3 * torso_w, f"the figure pinches to {neck} px between y=150 and 200 "
                                               f"(coat is {torso_w} px wide): a gap between head and torso")
                spec = rig["views"][view]["parts"]
                alphas = {}
                for part in spec:
                    pp = root / "characters" / char / view / f"{part}.png"
                    if pp.exists():
                        alphas[part] = np.asarray(Image.open(pp).convert("RGBA").getchannel("A"))
                for part, info in spec.items():
                    parent = info["parent"] if info["parent"] != "root" else "torso"
                    if part in ("torso", "tool") or part not in alphas or parent not in alphas:
                        continue
                    ov = joint_overlap(alphas[part], alphas[parent], info["pivot"])
                    r.check(ov >= 60, f"{part} overlaps {parent} by only {ov} px around the joint {info['pivot']} "
                                      "(need 60+): extend the part under its neighbour so no gap shows when it moves")
            hb = root / "characters" / char / view / "head-blink.png"
            hd = root / "characters" / char / view / "head.png"
            if hb.exists() and hd.exists():
                b1 = bbox(np.asarray(Image.open(hd).convert("RGBA").getchannel("A")))
                b2 = bbox(np.asarray(Image.open(hb).convert("RGBA").getchannel("A")))
                if b1 and b2:
                    diff = max(abs(u - v) for u, v in zip(b1, b2))
                    r.check(diff <= 4, f"head-blink bbox {b2} differs from head {b1} by {diff} px (max 4)")
            r.figure = fig
            out.append(r)
        if len(heights) > 1:
            lo, hi = min(heights.values()), max(heights.values())
            if hi > lo * 1.08:
                out[-1].warn(f"{char}: view heights differ more than 8% ({heights})")
    results.extend(out)


def check_turnaround(r, img, rig):
    ground = rig["frame"]["ground_y"]
    al = np.asarray(img.getchannel("A"))
    hs = []
    for i, name in enumerate(("front", "side", "back")):
        b = bbox(al[:, i * 320:(i + 1) * 320])
        if b is None:
            r.fail(f"{name} third is empty")
            continue
        hs.append(b[3] - b[1] + 1)
        r.check(abs(b[3] - ground) <= 4, f"{name}: feet at y={b[3]}, expected {ground}", hard=False)
    if hs and max(hs) > min(hs) * 1.08:
        r.warn(f"turnaround heights differ more than 8%: {hs}")


# ------------------------------------------------------------------ per asset

def check_asset(path, a, rig, airborne):
    r = Result(a)
    try:
        img = Image.open(path)
        img.load()
    except Exception as e:  # noqa: BLE001
        r.fail(f"cannot open: {e}")
        return r, None
    r.check(img.format == "PNG", f"file is {img.format}, must be PNG")
    W, H = a["width"] * a["frames"], a["height"]
    if img.size != (W, H):
        r.fail(f"size {img.size[0]}x{img.size[1]}, expected {W}x{H}")
        return r, img
    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    rgba = img.convert("RGBA")
    if a["alpha"]:
        r.check(img.mode == "RGBA", f"mode {img.mode}, must be RGBA")
        frames = frames_of(rgba, a) if a["frames"] > 1 else [rgba]
        border_free = (a["seamless"] and a["kind"] in ("texture", "strip"))
        for i, fr in enumerate(frames):
            label = f"frame {i}" if len(frames) > 1 else "image"
            if border_free:
                al = np.asarray(fr.getchannel("A"))
                r.check((al >= OPAQUE).sum() > 0.002 * al.size, f"{label}: empty")
            else:
                check_alpha_frame(r, fr, a, label)
    else:
        al = np.asarray(rgba.getchannel("A"))
        r.check(not has_alpha or (al == 255).all(), "has transparency, must be fully opaque")
        if img.mode not in ("RGB",):
            r.warn(f"mode {img.mode}; RGB preferred for opaque art")
    if a["seamless"]:
        check_seamless(r, rgba, a)
    if a["frames"] > 1 or a["anchor"] == "bottom-centre":
        check_strip(r, rgba, a, rig["frame"]["ground_y"], airborne.get(Path(a["path"]).stem, {})
                    if a["kind"] == "anim" else {})
    if a["anchor"] == "rig":
        check_rig_part(r, rgba, a, rig)
    if a["anchor"] == "grip":
        al = np.asarray(rgba.getchannel("A"))
        ys, xs = np.where(al >= OPAQUE)
        d = float(np.sqrt((xs - 172) ** 2 + (ys - 238) ** 2).min()) if len(xs) else 1e9
        r.check(d <= 12, f"nothing opaque within 12 px of the grip (172,238) (nearest {d:.0f} px)")
    if a["kind"] == "reference":
        check_turnaround(r, rgba, rig)
    check_style(r, rgba, a)
    return r, rgba


# ------------------------------------------------------------------ contact sheet and report

def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def contact_sheet(items, out_path, cell=200, cols=8):
    """Grid of thumbnails with id and status; a strip spans up to 4 cells so its frames stay readable."""
    if not items:
        return
    f = font(12)
    label_h = 30
    placed, x, y = [], 0, 0
    for ident, status, img, frames in items:
        span = max(1, min(frames, 4, cols))
        if x + span > cols:
            x, y = 0, y + 1
        placed.append((x, y, span, ident, status, img))
        x += span
    rows = y + 1
    sheet = Image.new("RGBA", (cols * cell, rows * (cell + label_h)), (52, 54, 60, 255))
    d = ImageDraw.Draw(sheet)
    colours = {"PASS": (120, 200, 120), "WARN": (230, 190, 90), "FAIL": (240, 90, 80)}
    for cx, cy, span, ident, status, img in placed:
        px, py, w = cx * cell, cy * (cell + label_h), span * cell
        d.rectangle([px + 2, py + 2, px + w - 3, py + cell - 3], fill=(64, 66, 74, 255))
        if img is not None:
            t = img.copy()
            t.thumbnail((w - 8, cell - 8), Image.Resampling.LANCZOS)
            sheet.alpha_composite(t, (px + (w - t.width) // 2, py + (cell - t.height) // 2))
        d.text((px + 4, py + cell + 1), ident[:30 * span], fill=(230, 230, 230), font=f)
        d.text((px + 4, py + cell + 15), status, fill=colours.get(status, (200, 200, 200)), font=f)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(out_path)


def write_report(path, results, missing, args):
    n = {s: sum(1 for r in results if r.status == s) for s in ("PASS", "WARN", "FAIL")}
    lines = ["# Art check", "",
             f"Filters: batch={args.batch or 'all'} id={args.id or '*'} character={args.character or '*'}  ",
             f"**{n['PASS']} pass, {n['WARN']} warn, {n['FAIL']} fail, {len(missing)} missing**", "",
             "| id | status | problems |", "|---|---|---|"]
    for r in results:
        msgs = [f"FAIL: {m}" for m in r.fails] + [f"warn: {m}" for m in r.warns]
        lines.append(f"| `{r.asset['id']}` | {r.status} | {'<br>'.join(m.replace('|', '/') for m in msgs)} |")
    if missing:
        lines += ["", f"## Missing ({len(missing)})", ""] + [f"- `{a['id']}` -> `{a['path']}`" for a in missing]
    Path(path).write_text("\n".join(lines) + "\n")


# ------------------------------------------------------------------ main

def load_assets(args):
    assets = json.loads((CODEX / "assets.json").read_text())["assets"]
    if args.character:
        cast = {a["character"] for a in assets if a["character"]}
        if args.character not in cast:
            tmpl = [a for a in assets if a["character"] == "esk"]
            for t in tmpl:
                c = dict(t)
                c["id"] = args.character + t["id"][len("esk"):]
                c["path"] = t["path"].replace("/characters/esk/", f"/characters/{args.character}/")
                c["character"] = args.character
                assets.append(c)
        assets = [a for a in assets if a["character"] == args.character
                  or (a["kind"] == "prop")]
    if args.batch:
        assets = [a for a in assets if a["batch"] == args.batch]
    if args.id:
        assets = [a for a in assets if a["id"].startswith(args.id)]
    return assets


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--batch", type=int)
    ap.add_argument("--id", help="only ids starting with this prefix")
    ap.add_argument("--character", help="only this character (+ props); clones esk's rows for a non-cast name")
    ap.add_argument("--strict", action="store_true", help="missing files are FAIL")
    ap.add_argument("--report", help="write a markdown report here")
    ap.add_argument("--root", default=str(CODEX / "out"))
    ap.add_argument("--no-sheet", action="store_true", help="skip the contact sheet")
    args = ap.parse_args()

    root = Path(args.root)
    rig = json.loads((CODEX / "rig.json").read_text())
    try:
        poses = json.loads((CODEX / "poses.json").read_text())["anims"]
    except FileNotFoundError:
        poses = {}
    airborne = {k: {i: f.get("root_dy", 0) + f.get("dy", 0) for i, f in enumerate(v["frames"])
                    if f.get("root_dy", 0) + f.get("dy", 0) < 0} for k, v in poses.items()}

    assets = load_assets(args)
    results, missing, sheet_items = [], [], []
    for a in assets:
        rel = a["path"][len(MANIFEST_PREFIX):] if a["path"].startswith(MANIFEST_PREFIX) else a["path"]
        path = root / rel
        if not path.exists():
            wrong = [p for p in path.parent.glob(path.stem + ".*") if p.suffix.lower() != ".png"] if path.parent.exists() else []
            if wrong:
                r = Result(a)
                r.fail(f"found {wrong[0].name}: must be saved as PNG at {rel}")
                results.append(r)
                sheet_items.append((a["id"], r.status, None, 1))
            else:
                missing.append(a)
            continue
        r, img = check_asset(path, a, rig, airborne)
        results.append(r)
        sheet_items.append((a["id"], r.status, img, a["frames"]))

    chars = sorted({a["character"] for a in assets if a["character"] and a["kind"] == "part"})
    before = len(results)
    check_figures(root, chars, rig, results)
    for r in results[before:]:
        sheet_items.append((r.asset["id"], r.status, getattr(r, "figure", None), 1))

    if not args.batch and not args.id and not args.character:
        known = {(root / a["path"][len(MANIFEST_PREFIX):]).resolve() for a in assets}
        for p in sorted(root.rglob("*.png")) if root.exists() else []:
            if p.resolve() not in known and not p.name.startswith("contact-sheet"):
                print(f"note: {p.relative_to(root)} is not in the manifest (misnamed?)")

    # table
    idw = max([len(r.asset["id"]) for r in results] + [10])
    print(f"{'id'.ljust(idw)}  status  problems")
    print("-" * (idw + 40))
    for r in results:
        msgs = [f"FAIL {m}" for m in r.fails] + [f"warn {m}" for m in r.warns]
        print(f"{r.asset['id'].ljust(idw)}  {r.status:<6}  {msgs[0] if msgs else ''}")
        for m in msgs[1:]:
            print(f"{''.ljust(idw)}          {m}")
    if missing:
        tag = "FAIL" if args.strict else "warn"
        print(f"\nmissing ({len(missing)}, {tag}):")
        for a in missing:
            hint = "  (run compose_character.py)" if a["source"] == "compose" else ""
            print(f"  {a['id']}  {a['path']}{hint}")
    n = {s: sum(1 for r in results if r.status == s) for s in ("PASS", "WARN", "FAIL")}
    print(f"\n{n['PASS']} PASS, {n['WARN']} WARN, {n['FAIL']} FAIL, {len(missing)} missing")

    if args.report:
        write_report(args.report, results, missing, args)
        print(f"report: {args.report}")
    if not args.no_sheet and sheet_items:
        tag = f"batch{args.batch}" if args.batch and not args.id else (args.id or args.character or "all")
        if args.batch and args.id:
            tag = f"batch{args.batch}-{args.id}"
        out = root / f"contact-sheet-{tag}.png"
        contact_sheet(sheet_items, out)
        print(f"contact sheet: {out}")
    failed = n["FAIL"] > 0 or (args.strict and missing)
    print("RESULT:", "FAIL" if failed else "PASS")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
