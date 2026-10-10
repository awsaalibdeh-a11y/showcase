import os

from flask import Flask, jsonify, render_template, send_from_directory

import data

app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html", projects=data.PROJECTS, github=data.GITHUB, homebase_url=data.HOMEBASE_URL, process=data.PROCESS, credits=data.CREDITS)


@app.get("/reveal")
def reveal():
    """The animation, on its own page. The site embeds this same page in a frame."""
    return render_template("reveal.html", projects=data.PROJECTS, process=data.PROCESS, credits=data.CREDITS)


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
