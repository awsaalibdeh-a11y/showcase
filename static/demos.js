/* "Try a demo": each app gets a small scripted version you can play with inside the Showcase. Nothing is sent anywhere and nothing real is shown
   (fake places, fake families, invented prices), so it works instantly even when the real sites are asleep.
   Core here; the demos themselves live in demos-a.js and demos-b.js and register in DM.DEMOS[<project id>] = ctx => { ... }. */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* tiny element builders: h("div.a.b", {onclick}, ...children) and s("circle", {r: 4}) for SVG. Text always goes in as text, never as HTML. */
  function fill(e, props, kids, svg) {
    if (props && typeof props === "object" && !(props instanceof Node) && !Array.isArray(props)) {
      for (const [k, v] of Object.entries(props)) {
        if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
        else if (k === "style" && !svg) e.style.cssText = v;
        else if (v === true) e.setAttribute(k, "");
        else if (v !== false && v != null) e.setAttribute(k, v);
      }
    } else if (props != null) kids.unshift(props);
    for (const k of kids.flat(2)) if (k != null && k !== false) e.append(k instanceof Node ? k : document.createTextNode(String(k)));
    return e;
  }
  const h = (sel, props, ...kids) => { const [tag, ...cls] = sel.split("."); const e = document.createElement(tag || "div"); if (cls.length) e.className = cls.join(" "); return fill(e, props, kids, false); };
  const s = (tag, props, ...kids) => fill(document.createElementNS(NS, tag), props, kids, true);
  const rand = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const toggle = (label, on, change) => {                                  // an accessible on/off switch
    const t = h("button.dm-toggle", { type: "button", role: "switch", "aria-checked": String(!!on) }, h("i"), label);
    const set = v => { t.classList.toggle("on", v); t.setAttribute("aria-checked", String(v)); };
    set(!!on); t.addEventListener("click", () => { const v = !t.classList.contains("on"); set(v); change(v); });
    t.set = set; return t;
  };
  const range = (min, max, value, step, input) => { const r = h("input.dm-range", { type: "range", min, max, value, step: step || 1 }); r.addEventListener("input", () => input(+r.value)); return r; };

  const DEMOS = {};
  const DM = { h, s, rand, shuffle, clamp, toggle, range, reduce, DEMOS };
  window.DM = DM;

  /* ---------------------------------------------------------------- the window */
  let box = null, current = null;
  function build() {
    box = h("div.demo", { hidden: true, role: "dialog", "aria-modal": "true", "aria-labelledby": "demo-title" },
      h("div.demo-box", h("div.demo-head", h("div.tile", { id: "demo-tile" }), h("div", h("h3", { id: "demo-title" }), h("div.demo-note", "A scripted, playable taste. Nothing is sent anywhere.")), h("button.demo-x", { type: "button", "aria-label": "Close the demo", id: "demo-x" }, "×")),
        h("div.demo-stage", { id: "demo-stage", tabindex: "-1" }), h("div.demo-foot", h("span", { id: "demo-foot" }), h("span.dm-row", h("a.btn", { id: "demo-open", target: "_blank", rel: "noopener" }, "Open the real one ↗"), h("button.btn.solid", { type: "button", id: "demo-close" }, "Close")))));
    document.body.append(box);
    box.addEventListener("mousedown", e => { if (e.target === box) close(); });
    box.querySelector("#demo-x").onclick = box.querySelector("#demo-close").onclick = () => close();
  }

  function info(id) {                                                         // the project's name, picture, colour and link, read from its card
    const card = document.getElementById("p-" + id);
    if (!card) return { name: id, emoji: "✨", url: "", hue: 32 };
    const a = card.querySelector(".links a.open");
    return { name: card.querySelector("h3").textContent, emoji: card.querySelector(".tile").textContent, url: a ? a.href : "", hue: parseInt(card.style.getPropertyValue("--h"), 10) || 32,
      real: a ? a.textContent.replace("↗", "").trim() : "Open it" };
  }

  function open(id, fromHash) {
    if (!DEMOS[id]) return false;
    if (!box) build();
    close(true);
    const p = info(id);
    const me = { id, timers: [], off: [] };
    current = me;
    const ctx = {
      id, name: p.name, url: p.url, stage: box.querySelector("#demo-stage"), foot: t => { box.querySelector("#demo-foot").textContent = t || ""; },
      alive: () => current === me,
      later(fn, ms) { const t = setTimeout(() => { if (current === me) fn(); }, ms); me.timers.push(["t", t]); return t; },
      every(fn, ms) { const t = setInterval(() => { if (current === me) fn(); }, ms); me.timers.push(["i", t]); return t; },
      sleep: ms => new Promise(res => ctx.later(res, reduce ? Math.min(ms, 30) : ms)),
      on(target, ev, fn, opt) { target.addEventListener(ev, fn, opt); me.off.push(() => target.removeEventListener(ev, fn, opt)); },
      async type(node, text, cps) {                                           // typewriter that stops when the demo closes
        if (reduce) { node.textContent += text; return; }
        const rate = cps || 70, t0 = performance.now(); let shown = 0;                // paced by the clock, not by timer ticks, so a busy or throttled page catches up instead of lagging
        while (shown < text.length) {
          await ctx.sleep(30); if (current !== me) return;
          const n = Math.min(text.length, Math.floor((performance.now() - t0) * rate / 1000));
          if (n > shown) { node.textContent += text.slice(shown, n); shown = n; }
        }
      },
    };
    box.querySelector(".demo-box").style.setProperty("--h", p.hue);
    box.querySelector("#demo-tile").textContent = p.emoji;
    box.querySelector("#demo-title").textContent = "Demo: " + p.name;
    const real = box.querySelector("#demo-open"); real.hidden = !p.url; if (p.url) { real.href = p.url; real.textContent = (p.real || "Open it") + " ↗"; }
    ctx.stage.textContent = ""; ctx.foot("");
    box.hidden = false; document.documentElement.style.overflow = "hidden";
    try { DEMOS[id](ctx); } catch (e) { ctx.stage.textContent = "This demo hit a problem. The real app is one click away."; console.error(e); }
    ctx.stage.scrollTop = 0; box.querySelector("#demo-x").focus({ preventScroll: true });
    if (!fromHash) history.replaceState(null, "", "#demo-" + id);
    return true;
  }

  function close(keepHash) {
    if (current) { for (const [k, t] of current.timers) (k === "t" ? clearTimeout : clearInterval)(t); current.off.forEach(f => f()); current = null; }
    if (box && !box.hidden) {
      box.hidden = true; box.querySelector("#demo-stage").textContent = ""; document.documentElement.style.overflow = "";
      if (!keepHash && /^#demo-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    }
  }

  document.addEventListener("click", e => { const b = e.target.closest("[data-demo]"); if (b) { e.preventDefault(); open(b.dataset.demo); } });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && current) { e.preventDefault(); close(); } });
  const fromHash = () => { const m = location.hash.match(/^#demo-([\w-]+)$/); if (m) open(m[1], true); else if (current) close(true); };
  addEventListener("hashchange", fromHash);
  DM.open = open; DM.close = close;
  addEventListener("DOMContentLoaded", () => setTimeout(fromHash, 60));
})();
