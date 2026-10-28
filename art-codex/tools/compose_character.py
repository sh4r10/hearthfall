#!/usr/bin/env python3
"""Build a survivor's animation strips from the painted rig parts, poses and props.

    python3 art-codex/tools/compose_character.py esk
    python3 art-codex/tools/compose_character.py --all
    python3 art-codex/tools/compose_character.py test --root /tmp/claude-0/arttest

Reads   <root>/characters/<name>/{side,front,back}/<part>.png   (rig.json parts)
        <root>/characters/<name>/poses/<pose>.png              (cold, sleep-ground)
        <root>/props/<prop>.png                                 (pickaxe, hammer, coal-sack)
Writes  <root>/characters/<name>/anim/<anim>.png  (horizontal strip of 320x320 frames)
        <root>/characters/<name>/anim/<anim>.gif  (preview on mid grey)

<root> defaults to art-codex/out. Motions live in art-codex/poses.json; rig in art-codex/rig.json.
Every part is transformed exactly once from its source with its fully composed affine matrix
(parent chain included), so nothing blurs cumulatively. Only Pillow and numpy are needed.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
CODEX = HERE.parent
GREY = (128, 128, 128, 255)


def load_json(p):
    return json.loads(Path(p).read_text())


# ------------------------------------------------------------------ affine helpers (3x3, forward: source -> screen)

def mat_t(dx, dy):
    return np.array([[1, 0, dx], [0, 1, dy], [0, 0, 1]], dtype=float)


def mat_r(deg, pivot):
    """Rotate about pivot. Positive = clockwise on screen (y points down)."""
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    px, py = pivot
    r = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], dtype=float)
    return mat_t(px, py) @ r @ mat_t(-px, -py)


def mat_s(sx, sy, pivot):
    px, py = pivot
    return mat_t(px, py) @ np.array([[sx, 0, 0], [0, sy, 0], [0, 0, 1]], dtype=float) @ mat_t(-px, -py)


def is_identity(m):
    return np.allclose(m, np.eye(3), atol=1e-9)


def apply(img, m, size):
    """Transform RGBA img by forward matrix m once, premultiplied so edges stay clean."""
    if is_identity(m):
        return img.copy()
    if np.allclose(m[:2, :2], np.eye(2), atol=1e-9) and np.allclose(m[:2, 2], np.round(m[:2, 2]), atol=1e-6):
        out = Image.new("RGBA", size, (0, 0, 0, 0))   # pure integer shift: paste, no resampling
        out.paste(img, (int(round(m[0, 2])), int(round(m[1, 2]))))
        return out
    inv = np.linalg.inv(m)
    coeffs = tuple(inv[0]) + tuple(inv[1])
    pm = img.convert("RGBa")
    out = pm.transform(size, Image.Transform.AFFINE, coeffs, resample=Image.Resampling.BICUBIC)
    return out.convert("RGBA")


def lowest_row(img, thresh=128):
    a = np.asarray(img.getchannel("A"))
    rows = np.where((a >= thresh).any(axis=1))[0]
    return int(rows[-1]) if len(rows) else None


# ------------------------------------------------------------------ composer

class Composer:
    def __init__(self, root, rig, poses, name):
        self.root = Path(root)
        self.rig = rig
        self.poses = poses
        self.name = name
        self.size = (rig["frame"]["width"], rig["frame"]["height"])
        self.ground = rig["frame"]["ground_y"]
        self.cache = {}

    def char_dir(self):
        return self.root / "characters" / self.name

    def load(self, path):
        path = Path(path)
        if path not in self.cache:
            if not path.exists():
                raise FileNotFoundError(path)
            self.cache[path] = Image.open(path).convert("RGBA")
        return self.cache[path]

    def part_img(self, view, part):
        return self.load(self.char_dir() / view / f"{part}.png")

    def world_matrices(self, view, frame):
        """Composed forward matrix for every part of a view (parents first)."""
        vparts = self.rig["views"][view]["parts"]
        rot = frame.get("rot", {})
        move = {k: list(v) for k, v in frame.get("move", {}).items()}
        if "torso_dy" in frame:
            mv = move.setdefault("torso", [0, 0])
            mv[1] += frame["torso_dy"]
        world = {"root": np.eye(3)}

        def resolve(p):
            if p in world:
                return world[p]
            spec = vparts[p]
            parent = resolve(spec["parent"])
            dx, dy = move.get(p, [0, 0])
            local = mat_t(dx, dy) @ mat_r(rot.get(p, 0.0), spec["pivot"])
            world[p] = parent @ local
            return world[p]

        for p in vparts:
            resolve(p)
        return world

    def render_rig_frame(self, anim, frame):
        view = anim["view"]
        layers = anim.get("layers") or self.rig["views"][view]["layers_back_to_front"]
        world = self.world_matrices(view, frame)
        prop = frame.get("prop", anim.get("prop"))
        head = frame.get("head", "head")
        canvas = Image.new("RGBA", self.size, (0, 0, 0, 0))
        legs = Image.new("RGBA", self.size, (0, 0, 0, 0))
        for part in layers:
            if part == "tool":
                if not prop:
                    continue
                src = self.load(self.root / "props" / f"{prop}.png")
            elif part == "head":
                src = self.part_img(view, head)
            else:
                src = self.part_img(view, part)
            img = apply(src, world[part], self.size)
            canvas.alpha_composite(img)
            if part.startswith("leg"):
                legs.alpha_composite(img)
        return canvas, legs

    def render_pose_frame(self, anim, frame):
        src = self.load(self.char_dir() / "poses" / f"{anim['pose']}.png")
        if src.size != self.size:  # multi-frame pose: take the requested cell
            i = frame.get("pose_frame", 0)
            src = src.crop((i * self.size[0], 0, (i + 1) * self.size[0], self.size[1]))
        cx = self.rig["frame"]["centre_x"]
        m = mat_s(frame.get("sx", 1.0), frame.get("sy", 1.0), (cx, self.ground))
        return apply(src, m, self.size), None

    def render(self, anim_name):
        anim = self.poses["anims"][anim_name]
        frames = []
        for frame in anim["frames"]:
            if "pose" in anim:
                img, legs = self.render_pose_frame(anim, frame)
            else:
                img, legs = self.render_rig_frame(anim, frame)
            dx = frame.get("root_dx", 0) + frame.get("dx", 0)
            dy = frame.get("root_dy", 0) + frame.get("dy", 0)
            if anim.get("ground_lock") and legs is not None:
                low = lowest_row(legs)
                if low is not None:
                    dy += self.ground - low
            if dx or dy:  # whole-frame shifts are integer pastes: no resampling
                img = apply(img, mat_t(int(round(dx)), int(round(dy))), self.size)
            frames.append(img)
        return frames, anim.get("fps", 8)


def write_outputs(frames, fps, out_png):
    w, h = frames[0].size
    strip = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        strip.paste(f, (i * w, 0))
    out_png.parent.mkdir(parents=True, exist_ok=True)
    strip.save(out_png)
    gif_frames = []
    for f in frames:
        bg = Image.new("RGBA", (w, h), GREY)
        bg.alpha_composite(f)
        gif_frames.append(bg.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=255))
    gif_frames[0].save(out_png.with_suffix(".gif"), save_all=True, append_images=gif_frames[1:],
                       duration=int(round(1000 / fps)), loop=0, disposal=2)


def expected_frames(name):
    """Frame counts from the manifest (any cast member's compose rows)."""
    try:
        assets = load_json(CODEX / "assets.json")["assets"]
    except FileNotFoundError:
        return {}
    out = {}
    for a in assets:
        if a["source"] == "compose":
            out[Path(a["path"]).stem] = a["frames"]
    return out


def compose(name, root, rig, poses, only=None):
    comp = Composer(root, rig, poses, name)
    want = expected_frames(name)
    ok = True
    for anim_name, anim in poses["anims"].items():
        if only and anim_name not in only:
            continue
        n = len(anim["frames"])
        if anim_name in want and want[anim_name] != n:
            print(f"  ! {anim_name}: poses.json has {n} frames, manifest wants {want[anim_name]}")
            ok = False
        try:
            frames, fps = comp.render(anim_name)
        except FileNotFoundError as e:
            print(f"  - {anim_name}: skipped, missing {e}")
            ok = False
            continue
        out = comp.char_dir() / "anim" / f"{anim_name}.png"
        write_outputs(frames, fps, out)
        print(f"  + {anim_name}: {n} frames -> {out}")
    return ok


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name", nargs="?", help="character folder name (esk, mara, ...)")
    ap.add_argument("--all", action="store_true", help="every character folder under <root>/characters")
    ap.add_argument("--root", default=str(CODEX / "out"), help="art out dir (default art-codex/out)")
    ap.add_argument("--anim", action="append", help="only build this animation (repeatable)")
    ap.add_argument("--poses", default=str(CODEX / "poses.json"))
    ap.add_argument("--rig", default=str(CODEX / "rig.json"))
    args = ap.parse_args()
    rig, poses = load_json(args.rig), load_json(args.poses)
    root = Path(args.root)
    if args.all:
        names = sorted(p.name for p in (root / "characters").iterdir() if p.is_dir()) if (root / "characters").is_dir() else []
    elif args.name:
        names = [args.name]
    else:
        ap.error("give a character name or --all")
    if not names:
        print(f"no characters under {root / 'characters'}")
        return 1
    ok = True
    for n in names:
        print(f"{n}:")
        ok &= compose(n, root, rig, poses, args.anim)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
