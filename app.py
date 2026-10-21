import datetime
import io
import os
import threading
import time
import urllib.request

from flask import Flask, jsonify, render_template, request, send_from_directory

import data

SITE_URL = os.environ.get("SITE_URL", "https://showcase-hub-pu62.onrender.com")
app = Flask(__name__)
import hubguard  # noqa: E402  (the owner's universal switches, kept in Cramly)
hubguard.install(app, "showcase")


SHOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "shots")


def shots():
    """Projects that have a real picture (static/shots/<id>.jpg); the others get a designed card made in CSS."""
    try:
        return {f[:-4] for f in os.listdir(SHOT_DIR) if f.endswith(".jpg")}
    except OSError:
        return set()


def build_timeline():
    """The 'how fast I built it' chart: one bar per project from its first to its last commit, on a shared date axis."""
    day = lambda s: datetime.date.fromisoformat(s).toordinal()
    by_id = {p["id"]: p for p in data.PROJECTS}
    start = min(day(r[1]) for r in data.TIMELINE)
    end = max(day(r[2]) for r in data.TIMELINE)
    span = end - start + 1                                              # inclusive: the first day and the last day both count
    rows = []
    for pid, first, last, commits in sorted(data.TIMELINE, key=lambda r: (r[1], r[0])):
        p = by_id[pid]
        days = day(last) - day(first) + 1
        rows.append({"id": pid, "name": p["name"], "emoji": p["emoji"], "hue": data.WARM_HUE.get(pid, p["hue"]), "commits": commits, "first": first, "last": last,
                     "left": round(100 * (day(first) - start) / span, 2), "width": round(max(100 * days / span, 2.4), 2), "days": days,
                     "when": datetime.date.fromisoformat(first).strftime("%b %-d" if os.name != "nt" else "%b %#d")})
    first_day = datetime.date.fromordinal(start)
    ticks = []
    for k in range(0, span, 7):
        d = datetime.date.fromordinal(start + k)
        ticks.append({"pct": round(100 * k / span, 2), "label": d.strftime("%b %-d" if os.name != "nt" else "%b %#d")})
    return {"rows": rows, "ticks": ticks, "days": span, "commits": sum(r["commits"] for r in rows), "week": round(100 * 7 / span, 3), "snapshot": data.SNAPSHOT,
            "from": first_day.isoformat()}


@app.get("/")
def home():
    tech = {}
    for p in data.PROJECTS:
        for t in p["stack"]:
            tech.setdefault(t, []).append(p["name"])
    tech = sorted(tech.items(), key=lambda kv: (-len(kv[1]), kv[0]))
    return render_template("index.html", news=data.NEWS, faq=data.FAQ, tech=tech, features=data.HOMEBASE_FEATURES, projects=data.PROJECTS, github=data.GITHUB, homebase_url=data.HOMEBASE_URL, process=data.PROCESS, credits=data.CREDITS,
                           shots=shots(), tl=build_timeline(), warm=data.WARM_HUE, noor_features=data.NOOR_FEATURES)


@app.get("/reveal")
def reveal():
    """The animation, on its own page. The site embeds this same page in a frame."""
    return render_template("reveal.html", projects=data.PROJECTS, process=data.PROCESS, credits=data.CREDITS)


_status, _status_at, _busy = {}, 0.0, False


def _probe(url):
    """Is the site up? A free-tier site that is asleep takes 20-30 s, so a short timeout means 'waking up', not 'broken'."""
    t = time.time()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "showcase-status"}), timeout=7) as r:
            return {"state": "online" if r.status < 400 else "down", "ms": int((time.time() - t) * 1000)}
    except Exception:
        return {"state": "waking", "ms": int((time.time() - t) * 1000)}


def _refresh():
    global _status, _status_at, _busy
    try:
        urls = {p["id"]: p["url"] for p in data.PROJECTS if p["url"]}
        out = {}
        threads = [threading.Thread(target=lambda k=k, u=u: out.__setitem__(k, _probe(u))) for k, u in urls.items()]
        [t.start() for t in threads]; [t.join(12) for t in threads]
        _status, _status_at = {**_status, **out}, time.time()
    finally:
        _busy = False


@app.get("/api/status")
def status():
    """Cached for 3 minutes. The first visitor starts a background check and gets whatever is known so far."""
    global _busy
    if not _busy and time.time() - _status_at > 180:
        _busy = True
        threading.Thread(target=_refresh, daemon=True).start()
    return jsonify(status=_status, checked=_status_at)


@app.get("/api/projects")
def projects():
    return jsonify(projects=data.PROJECTS)


@app.get("/qr.svg")
def qr():
    """A QR code for the showcase or one of its projects (only those links, so it cannot be used to make codes for anything else)."""
    import segno
    pid = request.args.get("id", "")
    links = {p["id"]: p["url"] for p in data.PROJECTS if p.get("url") and not p.get("private")}
    url = links.get(pid) or SITE_URL
    buf = io.BytesIO()
    segno.make(url, error="h").save(buf, kind="svg", scale=8, border=2, dark="#0a0a0b", light="#ffffff", xmldecl=False, svgns=True)
    resp = app.response_class(buf.getvalue(), mimetype="image/svg+xml")
    resp.headers["Cache-Control"] = "public, max-age=86400"
    if request.args.get("download"):
        resp.headers["Content-Disposition"] = f'attachment; filename="{pid or "showcase"}-qr.svg"'
    return resp


@app.get("/health")
def health():
    return jsonify(ok=True)


@app.after_request
def headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5145)))
