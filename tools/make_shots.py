"""Builds the project card pictures in static/shots/ from raw browser screenshots in _shots_src/ (not committed).

    python tools/make_shots.py

Each picture is the screenshot (or a cropped part of it) inside a small browser window, on a dark panel tinted with the project's colour.
Only apps whose first screen shows nothing personal are photographed; Scout (a map of the owner's street), Homebase (a family),
Tripmate (saved trips) and Cramly (study sets) get a designed card in CSS instead, so no picture is made for them."""

import colorsys
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import data  # noqa: E402

SRC = os.path.join(HERE, "_shots_src")
OUT = os.path.join(HERE, "static", "shots")
W, H = 960, 520
# project id -> (source file, crop box in source pixels or None, kind)  kind: "window" (browser) or "phone" (portrait column)
SHOTS = {
    "alibi": ("alibi.jpg", (424, 24, 1100, 452), "window"),
    "unwritten": ("unwritten.jpg", (528, 0, 1008, 730), "phone"),
    "cookify": ("cookify.jpg", None, "window"),
    "crosswind": ("crosswind.jpg", None, "window"),
    "platter": ("platter.jpg", None, "window"),
    "womanten": ("womanten.jpg", None, "window"),
    "whatif": ("whatif.jpg", None, "window"),
    "nonsense": ("nonsense.jpg", None, "window"),
}
URLS = {p["id"]: p["url"].replace("https://", "") for p in data.PROJECTS if p.get("url")}
HUE = {p["id"]: p["hue"] for p in data.PROJECTS}


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, l, s)
    return int(r * 255), int(g * 255), int(b * 255)


def background(hue):
    """Near-black with a soft glow of the project's colour at the top."""
    bg = Image.new("RGB", (W, H), (10, 10, 10))
    glow = Image.new("RGB", (W, H), hsl(hue, 0.45, 0.22))
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).ellipse((W * 0.1, -H * 0.9, W * 0.9, H * 0.55), fill=150)
    return Image.composite(glow, bg, mask.filter(ImageFilter.GaussianBlur(90)))


def rounded(img, radius):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(m)
    return out


def shadowed(canvas, win, xy):
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((xy[0], xy[1] + 14, xy[0] + win.width, xy[1] + win.height + 14), 16, fill=(0, 0, 0, 170))
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    canvas.alpha_composite(sh)
    canvas.alpha_composite(win, xy)


def browser(shot, url, max_w, max_h):
    bar = 30
    scale = min(max_w / shot.width, (max_h - bar) / shot.height)
    shot = shot.resize((int(shot.width * scale), int(shot.height * scale)), Image.LANCZOS)
    win = Image.new("RGB", (shot.width, shot.height + bar), (24, 24, 24))
    d = ImageDraw.Draw(win)
    for i, c in enumerate(((95, 95, 95), (80, 80, 80), (65, 65, 65))):                 # neutral dots on purpose: no red/yellow/green
        d.ellipse((14 + i * 18, 10, 24 + i * 18, 20), fill=c)
    d.rounded_rectangle((78, 6, win.width - 14, bar - 6), 9, fill=(14, 14, 14))
    d.text((92, 9), url, fill=(150, 150, 150))
    win.paste(shot, (0, bar))
    return rounded(win, 14)


def phone(shot, max_h):
    scale = max_h / shot.height
    shot = shot.resize((int(shot.width * scale), int(shot.height * scale)), Image.LANCZOS)
    pad = 7
    win = Image.new("RGB", (shot.width + pad * 2, shot.height + pad * 2), (30, 30, 30))
    win.paste(shot, (pad, pad))
    return rounded(win, 30)


def make(pid):
    name, box, kind = SHOTS[pid]
    shot = Image.open(os.path.join(SRC, name)).convert("RGB")
    if box:
        shot = shot.crop(box)
    canvas = background(HUE.get(pid, 220)).convert("RGBA")
    if kind == "phone":
        win = phone(shot, H - 44)
        xy = ((W - win.width) // 2, 28)
    else:
        win = browser(shot, URLS.get(pid, ""), W - 110, H - 56)
        xy = ((W - win.width) // 2, 34)
    shadowed(canvas, win, xy)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, pid + ".jpg")
    canvas.convert("RGB").save(path, quality=84, optimize=True, progressive=True)
    return path, os.path.getsize(path)


if __name__ == "__main__":
    for pid in SHOTS:
        if not os.path.exists(os.path.join(SRC, SHOTS[pid][0])):
            print("missing source for", pid)
            continue
        p, n = make(pid)
        print(f"{pid:10} {n / 1024:5.0f} KB  {p}")
