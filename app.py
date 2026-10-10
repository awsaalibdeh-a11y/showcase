import os
import threading
import time
import urllib.request

from flask import Flask, jsonify, render_template, send_from_directory

import data

app = Flask(__name__)
import hubguard  # noqa: E402  (the owner's universal switches, kept in Cramly)
hubguard.install(app, "showcase")


@app.get("/")
def home():
    return render_template("index.html", projects=data.PROJECTS, github=data.GITHUB, homebase_url=data.HOMEBASE_URL, process=data.PROCESS, credits=data.CREDITS)


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


@app.get("/health")
def health():
    return jsonify(ok=True)


@app.after_request
def headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5145)))
