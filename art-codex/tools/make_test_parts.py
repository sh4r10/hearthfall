#!/usr/bin/env python3
"""Draw flat placeholder art for a fake survivor so the art tools can be tested without real art.

    python3 art-codex/tools/make_test_parts.py [--out /tmp/claude-0/arttest] [--name test]

Writes, under --out (an "out" root like art-codex/out, never art-codex/out itself by default):
  characters/<name>/{side,front,back}/<part>.png   rig parts in the neutral pose (rig.json)
  characters/<name>/poses/<pose>.png               simple pose shapes (cold, sleep-ground, ...)
  props/{pickaxe,hammer,coal-sack,lantern}.png     grip at (172, 238), handle up
Then:  compose_character.py <name> --root <out>  and  check_art.py --root <out> --character <name>
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

SS = 4  # supersample for smooth edges
W = H = 320
INK = (34, 26, 30, 255)
OUTLINE = 4  # px at 1x

C = {
    "coat": (176, 92, 58), "coat_dark": (132, 66, 44), "skin": (236, 196, 160), "hood": (120, 84, 60),
    "fur": (214, 200, 176), "leg": (70, 80, 104), "leg_dark": (52, 60, 80), "boot": (82, 56, 40),
    "boot_dark": (60, 42, 30), "mitten": (190, 60, 52), "mitten_dark": (150, 46, 40), "scarf": (196, 48, 48),
    "wood": (150, 110, 70), "iron": (110, 116, 124), "sack": (150, 126, 88), "coal": (40, 38, 44), "tin": (160, 160, 150),
}


class Canvas:
    def __init__(self):
        self.img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def s(self, v):
        return v * SS

    def capsule(self, p0, p1, width, fill):
        for col, w in ((INK, width + 2 * OUTLINE), (fill + (255,), width)):
            r = w / 2
            self.d.line([self.s(p0[0]), self.s(p0[1]), self.s(p1[0]), self.s(p1[1])], fill=col, width=int(self.s(w)))
            for x, y in (p0, p1):
                self.d.ellipse([self.s(x - r), self.s(y - r), self.s(x + r), self.s(y + r)], fill=col)

    def ellipse(self, box, fill, outline=True):
        x0, y0, x1, y1 = box
        if outline:
            o = OUTLINE
            self.d.ellipse([self.s(x0 - o), self.s(y0 - o), self.s(x1 + o), self.s(y1 + o)], fill=INK)
        self.d.ellipse([self.s(x0), self.s(y0), self.s(x1), self.s(y1)], fill=fill + (255,))

    def rrect(self, box, fill, radius=14, outline=True):
        x0, y0, x1, y1 = box
        if outline:
            o = OUTLINE
            self.d.rounded_rectangle([self.s(x0 - o), self.s(y0 - o), self.s(x1 + o), self.s(y1 + o)],
                                     radius=self.s(radius + o), fill=INK)
        self.d.rounded_rectangle([self.s(x0), self.s(y0), self.s(x1), self.s(y1)], radius=self.s(radius), fill=fill + (255,))

    def poly(self, pts, fill):
        sp = [(self.s(x), self.s(y)) for x, y in pts]
        self.d.polygon(sp, fill=fill + (255,), outline=INK, width=int(self.s(OUTLINE)))

    def line(self, p0, p1, w=3, col=INK):
        self.d.line([self.s(p0[0]), self.s(p0[1]), self.s(p1[0]), self.s(p1[1])], fill=col, width=int(self.s(w)))

    def dot(self, x, y, r, col=INK):
        self.d.ellipse([self.s(x - r), self.s(y - r), self.s(x + r), self.s(y + r)], fill=col)

    def save(self, path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.img.resize((W, H), Image.Resampling.LANCZOS).save(path)


# ------------------------------------------------------------------ side view (facing right)

def side_head(blink):
    c = Canvas()
    c.capsule((160, 162), (160, 176), 22, C["skin"])            # neck stub
    c.ellipse((108, 58, 220, 168), C["hood"])                    # hood, top ~54 with outline
    c.ellipse((150, 84, 214, 152), C["skin"], outline=False)     # face opening toward +x
    c.capsule((146, 70), (146, 160), 12, C["fur"])               # fur ruff edge
    if blink:
        c.line((188, 112), (200, 112), 3)
    else:
        c.dot(194, 110, 5)
    c.line((200, 134), (210, 132), 3)                            # mouth
    return c


def side_parts():
    out = {}
    out["head"] = side_head(False)
    out["head-blink"] = side_head(True)
    t = Canvas()
    t.rrect((132, 160, 190, 264), C["coat"], radius=18)
    t.rrect((128, 160, 194, 180), C["scarf"], radius=9)           # wrapped scarf at the neck
    t.line((134, 228), (188, 228), 4)                            # belt
    out["torso"] = t
    s = Canvas()
    s.poly([(144, 172), (156, 176), (140, 222), (126, 216)], C["scarf"])
    out["scarf"] = s
    for name, x, col, mit in (("arm-front", 170, C["coat"], C["mitten"]), ("arm-back", 152, C["coat_dark"], C["mitten_dark"])):
        a = Canvas()
        a.capsule((x, 186), (x + 2, 230), 20, col)
        a.ellipse((x + 2 - 12, 228, x + 2 + 12, 250), mit)
        out[name] = a
    for name, x, col, boot in (("leg-front", 168, C["leg"], C["boot"]), ("leg-back", 154, C["leg_dark"], C["boot_dark"])):
        g = Canvas()
        g.capsule((x, 250), (x, 288), 22, col)
        g.rrect((x - 14, 284, x + 22, 302), boot, radius=7)       # boot, toe right, sole on y=304 with outline
        out[name] = g
    return out


# ------------------------------------------------------------------ front and back views

def front_parts(back):
    out = {}
    for blink in ((False, True) if not back else (False,)):
        h = Canvas()
        h.capsule((160, 162), (160, 176), 24, C["skin"])
        h.ellipse((104, 58, 216, 168), C["hood"])
        if not back:
            h.ellipse((124, 84, 196, 152), C["skin"], outline=False)
            if blink:
                h.line((140, 114), (152, 114), 3)
                h.line((168, 114), (180, 114), 3)
            else:
                h.dot(146, 112, 5)
                h.dot(174, 112, 5)
            h.line((152, 134), (168, 134), 3)
        else:
            h.line((160, 70), (160, 150), 3)                     # hood seam
        out["head-blink" if blink else "head"] = h
    t = Canvas()
    t.rrect((126, 160, 194, 266), C["coat"], radius=18)
    t.rrect((124, 160, 196, 180), C["scarf"], radius=9)
    if not back:
        t.poly([(170, 178), (182, 178), (184, 226), (170, 222)], C["scarf"])
        for y in (198, 216, 234):
            t.dot(156, y, 3)
    else:
        t.line((160, 184), (160, 260), 3)
    out["torso"] = t
    for name, p0, p1 in (("arm-left", (128, 188), (122, 232)), ("arm-right", (192, 188), (198, 232))):
        a = Canvas()
        a.capsule(p0, p1, 20, C["coat_dark"] if back else C["coat"])
        a.ellipse((p1[0] - 12, 228, p1[0] + 12, 250), C["mitten"])
        out[name] = a
    for name, x in (("leg-left", 148), ("leg-right", 172)):
        g = Canvas()
        g.capsule((x, 252), (x, 288), 22, C["leg"])
        g.rrect((x - 14, 284, x + 14, 302), C["boot"], radius=7)
        out[name] = g
    return out


# ------------------------------------------------------------------ poses and props

def pose_cold():
    c = Canvas()
    for x in (152, 168):
        c.capsule((x, 250), (x, 288), 22, C["leg"])
        c.rrect((x - 14, 284, x + 14, 302), C["boot"], radius=7)
    c.rrect((126, 150, 194, 262), C["coat"], radius=18)
    c.capsule((132, 190), (184, 206), 20, C["coat_dark"])        # arms hugging
    c.capsule((188, 186), (136, 210), 20, C["coat_dark"])
    c.ellipse((104, 50, 216, 160), C["hood"])
    c.ellipse((124, 76, 196, 144), C["skin"], outline=False)
    c.line((140, 106), (152, 110), 3); c.line((168, 110), (180, 106), 3)
    c.line((150, 128), (170, 128), 4)
    return c


def pose_sleep_ground():
    c = Canvas()
    c.ellipse((90, 236, 250, 300), C["coat"])                    # body under the coat
    c.ellipse((40, 222, 120, 300), C["hood"])                    # head on the left
    c.ellipse((58, 246, 104, 290), C["skin"], outline=False)
    c.line((70, 262), (82, 262), 3)
    return c


def simple_pose(frames, shift):
    img = Image.new("RGBA", (W * frames, H), (0, 0, 0, 0))
    for i in range(frames):
        c = Canvas()
        c.rrect((124, 196 - shift * i, 196, 302), C["coat"], radius=18)
        c.ellipse((112, 100 - shift * i, 208, 196 - shift * i), C["hood"])
        img.paste(c.img.resize((W, H), Image.Resampling.LANCZOS), (i * W, 0))
    return img


def props():
    out = {}
    gx, gy = 172, 238
    p = Canvas()
    p.capsule((gx, gy + 10), (gx, 142), 12, C["wood"])
    p.poly([(gx - 34, 146), (gx - 8, 134), (gx + 10, 134), (gx + 50, 154), (gx + 12, 148), (gx - 8, 150)], C["iron"])
    out["pickaxe"] = p
    h = Canvas()
    h.capsule((gx, gy + 10), (gx, 168), 12, C["wood"])
    h.rrect((gx - 16, 150, gx + 30, 172), C["iron"], radius=3)
    out["hammer"] = h
    s = Canvas()
    s.ellipse((gx - 40, gy + 6, gx + 40, 316), C["sack"])
    s.dot(gx - 10, gy + 16, 6, C["coal"] + (255,)); s.dot(gx + 8, gy + 14, 5, C["coal"] + (255,))
    s.ellipse((gx - 9, gy - 8, gx + 9, gy + 12), C["sack"])     # knot (grip)
    out["coal-sack"] = s
    l = Canvas()
    l.d.arc([l.s(gx - 16), l.s(gy - 8), l.s(gx + 16), l.s(gy + 24)], 180, 360, fill=INK, width=int(l.s(3)))
    l.rrect((gx - 18, gy + 10, gx + 18, gy + 56), C["tin"], radius=5)
    l.ellipse((gx - 8, gy + 24, gx + 8, gy + 44), (240, 170, 80), outline=False)
    out["lantern"] = l
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="/tmp/claude-0/arttest")
    ap.add_argument("--name", default="test")
    a = ap.parse_args()
    root = Path(a.out)
    cd = root / "characters" / a.name
    for view, parts in (("side", side_parts()), ("front", front_parts(False)), ("back", front_parts(True))):
        for part, cv in parts.items():
            cv.save(cd / view / f"{part}.png")
    pose_cold().save(cd / "poses" / "cold.png")
    pose_sleep_ground().save(cd / "poses" / "sleep-ground.png")
    sleep_back = pose_sleep_ground()
    sleep_back.save(cd / "poses" / "sleep-back.png")
    sleep_back.save(cd / "poses" / "dead.png")
    (cd / "poses").mkdir(parents=True, exist_ok=True)
    simple_pose(3, 0).save(cd / "poses" / "eat.png")
    simple_pose(4, 0).save(cd / "poses" / "collapse.png")
    for pid, cv in props().items():
        cv.save(root / "props" / f"{pid}.png")
    print(f"placeholder art for '{a.name}' in {root}")


if __name__ == "__main__":
    main()
