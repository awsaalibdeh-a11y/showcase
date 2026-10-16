/* Demos, part 2: Crosswind, Platter, Tripmate, Cramly, Womanten, Totally Normal Website. Invented data on purpose. */
(() => {
  "use strict";
  const { h, s, rand, shuffle, clamp, toggle, range, DEMOS, reduce } = window.DM;

  /* ---------------------------------------------------------------- Crosswind: why a wing lifts, and why it stalls */
  DEMOS.crosswind = ctx => {
    const RHO = 1.225, AREA = 16, WEIGHT = 1100 * 9.81;                                  // air density, wing area (m2), weight of a small plane (N)
    const cl = a => (a <= 15 ? 0.25 + 0.095 * a : 1.675 - (a - 15) * 0.2);              // lift coefficient: climbs with angle, then falls off a cliff at the stall
    let alpha = 5, kt = 80, alt = 0;
    const plane = s("g"), arrows = s("g"), streams = s("g");
    for (let i = 0; i < 9; i++) streams.append(s("line", { x1: 0, x2: 34, y1: 30 + i * 22, y2: 30 + i * 22, stroke: "#2b2b2b", "stroke-width": 2, "stroke-linecap": "round" }));
    const chart = s("polyline", { fill: "none", stroke: "#d8b878", "stroke-width": 2 }), mark = s("circle", { r: 5, fill: "#f2d49a" });
    const svg = s("svg", { viewBox: "0 0 400 260", class: "dm-svg", role: "img", "aria-label": "A wing with lift and weight arrows" }, s("rect", { width: 400, height: 260, fill: "#0d0d0d" }), streams, plane, arrows,
      s("g", { transform: "translate(250 150)" }, s("rect", { width: 140, height: 100, rx: 8, fill: "#101010", stroke: "#262626" }), chart, mark, s("text", { x: 70, y: 94, "text-anchor": "middle", "font-size": 9, fill: "#777" }, "lift coefficient vs angle")));
    plane.append(s("g", { id: "pl" }, s("ellipse", { cx: 0, cy: 0, rx: 70, ry: 10, fill: "#cfcfcf" }), s("polygon", { points: "-70,-3 -92,-22 -84,-22 -58,-3", fill: "#a9a9a9" }), s("rect", { x: -24, y: -6, width: 70, height: 5, rx: 2, fill: "#ececec" }), s("circle", { cx: 38, cy: -2, r: 5, fill: "#6a6a6a" })));
    const pts = []; for (let a = 0; a <= 20; a += 1) pts.push(`${(8 + a * 6).toFixed(1)},${(84 - cl(a) * 38).toFixed(1)}`); chart.setAttribute("points", pts.join(" "));
    const info = h("div.dm-col"), verdict = h("div.dm-out"), aLab = h("b"), vLab = h("b");
    const aIn = range(0, 20, alpha, 0.5, v => { alpha = v; calc(); }), vIn = range(40, 140, kt, 1, v => { kt = v; calc(); });
    ctx.stage.append(h("div.dm-two", svg, h("div.dm-col", h("div.dm-card", h("div.dm-lab", { style: "margin-top:0" }, "Angle of attack", aLab), aIn, h("div.dm-lab", "Airspeed", vLab), vIn), info, verdict)));
    ctx.foot("The real Crosswind flies the same maths: lift, stall, drag and thrust in SI units on a 16 km island.");
    function calc() {
      const v = kt * 0.5144, lift = 0.5 * RHO * v * v * AREA * cl(alpha), ratio = lift / WEIGHT;
      aLab.textContent = alpha.toFixed(1) + "°"; vLab.textContent = kt + " kt";
      plane.firstChild.setAttribute("transform", `translate(130 ${130 - alt}) rotate(${-alpha * 1.1})`);
      arrows.textContent = "";
      const L = clamp(ratio, 0, 2.2) * 46;
      arrows.append(s("line", { x1: 130, y1: 126 - alt, x2: 130, y2: 126 - alt - L, stroke: "#8fd7a8", "stroke-width": 4, "stroke-linecap": "round" }), s("text", { x: 138, y: 124 - alt - L, "font-size": 11, fill: "#8fd7a8" }, "lift"),
        s("line", { x1: 130, y1: 136 - alt, x2: 130, y2: 136 - alt + 46, stroke: "#e0907f", "stroke-width": 4, "stroke-linecap": "round" }), s("text", { x: 138, y: 190 - alt, "font-size": 11, fill: "#e0907f" }, "weight"));
      mark.setAttribute("cx", 8 + alpha * 6); mark.setAttribute("cy", 84 - cl(alpha) * 38);
      info.textContent = ""; info.append(h("div.dm-card", h("div.dm-lab", { style: "margin-top:0" }, "Lift", h("b", (lift / 1000).toFixed(1) + " kN")), h("div.dm-lab", { style: "margin-top:0" }, "Weight", h("b", (WEIGHT / 1000).toFixed(1) + " kN")), h("div.dm-bar", h("i", { style: "width:" + clamp(ratio / 2.2 * 100, 0, 100) + "%" }))));
      if (alpha > 15) { verdict.className = "dm-out dm-bad"; verdict.textContent = "STALL: the air can no longer follow the wing, so lift collapses. Lower the nose."; }
      else if (ratio < 0.95) { verdict.className = "dm-out dm-warm"; verdict.textContent = "Not enough lift: you are sinking. More speed or a bit more angle."; }
      else if (ratio > 1.08) { verdict.className = "dm-out dm-ok"; verdict.textContent = "Lift beats weight: you are climbing."; }
      else { verdict.className = "dm-out dm-ok"; verdict.textContent = "Lift matches weight: level flight."; }
      calc.ratio = ratio;
    }
    let t = 0;
    ctx.every(() => {                                                                 // streamlines drift past, and the plane rises or sinks with the lift
      t = (t + kt / 14) % 60; [...streams.children].forEach((l, i) => { const x = ((t + i * 23) % 360) - 20; l.setAttribute("x1", x); l.setAttribute("x2", x + 34); });
      alt = clamp(alt + (calc.ratio - 1) * 1.3, -42, 42); calc();
    }, 60);
    calc();
  };

  /* ---------------------------------------------------------------- Platter: one recipe, scaled and converted */
  DEMOS.platter = ctx => {
    const BASE = 4, ING = [["Bell peppers", 600, "g"], ["Onion", 1, ""], ["Garlic cloves", 3, ""], ["Ripe tomatoes", 250, "g"], ["Olive oil", 45, "ml"], ["Ground cumin", 1, "tsp"], ["Salt", 0, "to taste"]], PRICE = 4.6;
    let serv = BASE, us = false;
    const list = h("div.dm-col"), price = h("div"), count = h("b", { style: "font-size:22px;min-width:2ch;text-align:center" });
    const fmt = n => (n >= 100 ? Math.round(n / 5) * 5 : n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
    const step = d => h("button.dm-btn", { type: "button", "aria-label": d > 0 ? "More servings" : "Fewer servings", onclick: () => { serv = clamp(serv + d, 1, 12); render(); } }, d > 0 ? "+" : "−");
    ctx.stage.append(h("p.dm-muted", "Algerian Flafla, a smoky bell-pepper salad. Change the servings or the units and every amount updates, with a price estimate."), h("div", { style: "height:12px" }),
      h("div.dm-row", { style: "gap:14px" }, step(-1), count, h("span.dm-muted", "servings"), step(1), h("span", { style: "flex:1" }), toggle("US units", false, v => { us = v; render(); })), h("div", { style: "height:14px" }), h("div.dm-card", list), h("div", { style: "height:12px" }), price);
    ctx.foot("The real Platter has 1,100+ recipes, an AI helper, a weekly planner, a pantry and it works offline.");
    function render() {
      const k = serv / BASE; count.textContent = String(serv); list.textContent = "";
      ING.forEach(([n, a, u]) => {
        let v = a * k, unit = u;
        if (us && u === "g") { v /= 28.35; unit = "oz"; } else if (us && u === "ml") { v /= 29.57; unit = "fl oz"; }
        list.append(h("div", { style: "display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid rgba(255,255,255,.05);padding:6px 0" }, h("span", n), h("b", a ? `${fmt(v)} ${unit}`.trim() : unit)));
      });
      price.textContent = ""; price.append(h("span.dm-pill", "About SAR " + (PRICE * k).toFixed(2) + " in total"), " ", h("span.dm-pill", "SAR " + (PRICE / BASE).toFixed(2) + " a serving"), h("div.dm-muted", { style: "margin-top:6px" }, "Prices are estimates and change with the shop."));
    }
    render();
  };

  /* ---------------------------------------------------------------- Tripmate: a budget trip, added up */
  const TRIPS = {
    Istanbul: { e: "🕌", fl: 650, ho: 280, da: 140, plan: ["Old city walk, Hagia Sophia and a long lunch", "Ferry across the Bosphorus and the spice bazaar", "Galata Tower sunset and street food"] },
    Dubai: { e: "🏙️", fl: 420, ho: 450, da: 220, plan: ["Dubai Mall and the fountain show", "Old Dubai creek by abra boat", "Desert evening with a camel ride"] },
    Maldives: { e: "🏝️", fl: 1500, ho: 900, da: 300, plan: ["Arrive by seaplane, snorkel the house reef", "Sandbank picnic and dolphin cruise", "Sunset fishing, then a beach dinner"] },
    Paris: { e: "🗼", fl: 1800, ho: 520, da: 260, plan: ["Eiffel Tower and the Seine at dusk", "The Louvre in the morning, croissants after", "Montmartre and a quiet bookshop"] },
    Tokyo: { e: "🗾", fl: 2900, ho: 480, da: 240, plan: ["Shibuya crossing and an arcade night", "Asakusa temple and a ramen crawl", "A day trip to the mountains"] },
  };
  DEMOS.tripmate = ctx => {
    let dest = "Istanbul", nights = 4, trav = 2, budget = 4500, tue = false, three = false;
    const out = h("div.dm-col"), nLab = h("b"), tLab = h("b"), bLab = h("b"), chips = h("div.dm-row");
    Object.keys(TRIPS).forEach(k => chips.append(h("button.dm-chip", { type: "button", onclick: ev => { dest = k; [...chips.children].forEach(c => c.classList.toggle("on", c === ev.currentTarget)); render(); } }, TRIPS[k].e + " " + k)));
    chips.firstChild.classList.add("on");
    ctx.stage.append(h("div.dm-two", h("div.dm-col", h("div.dm-h", "Where to?"), chips, h("div.dm-card", h("div.dm-lab", { style: "margin-top:0" }, "Nights", nLab), range(2, 8, nights, 1, v => { nights = v; render(); }), h("div.dm-lab", "Travellers", tLab), range(1, 4, trav, 1, v => { trav = v; render(); }), h("div.dm-lab", "Budget (SAR)", bLab), range(1000, 9000, budget, 100, v => { budget = v; render(); })),
      h("div.dm-row", toggle("Fly Tuesday", false, v => { tue = v; render(); }), toggle("3-star hotel", false, v => { three = v; render(); }))), out));
    ctx.foot("These are example prices. The real Tripmate searches real flights and hotels and plans every day.");
    function render() {
      const T = TRIPS[dest], flight = T.fl * (tue ? 0.88 : 1) * trav, hotel = T.ho * (three ? 0.78 : 1) * nights * Math.ceil(trav / 2), food = T.da * nights * trav, total = Math.round(flight + hotel + food), left = budget - total;
      nLab.textContent = nights; tLab.textContent = trav; bLab.textContent = budget.toLocaleString();
      out.textContent = "";
      out.append(h("div.dm-card.dm-pop", h("div.dm-h", `${T.e} ${dest} · ${nights} nights · ${trav} traveller${trav > 1 ? "s" : ""}`),
        ...[["Flights", flight], ["Hotel", hotel], ["Food and getting around", food]].map(([l, v]) => h("div.dm-lab", { style: "margin:4px 0" }, l, h("b", "SAR " + Math.round(v).toLocaleString()))),
        h("div.dm-lab", { style: "border-top:1px solid #2a2a2a;padding-top:8px" }, "Total", h("b", "SAR " + total.toLocaleString())), h("div.dm-bar", h("i", { style: "width:" + clamp(total / budget * 100, 0, 100) + "%" })),
        h("div." + (left >= 0 ? "dm-ok" : "dm-bad"), { style: "margin-top:8px" }, left >= 0 ? `Within budget, SAR ${left.toLocaleString()} to spare.` : `SAR ${(-left).toLocaleString()} over. Try Tuesday flights or a 3-star hotel.`)),
        h("div.dm-card.dm-pop", h("div.dm-h", "Day by day"), ...Array.from({ length: Math.min(nights, 4) }, (_, i) => h("div.dm-muted", { style: "margin:4px 0" }, h("b", { style: "color:#ddd" }, "Day " + (i + 1) + ": "), T.plan[i % T.plan.length]))));
    }
    render();
  };

  /* ---------------------------------------------------------------- Cramly: notes in, flashcards and a quiz out */
  DEMOS.cramly = ctx => {
    const NOTES = "Photosynthesis is the process plants use to make food from sunlight. Chlorophyll is the green pigment that absorbs light. Stomata are tiny pores that let gases move in and out of a leaf. Glucose is the sugar a plant makes and stores as energy. Chloroplasts are the parts of a cell where photosynthesis happens.";
    const area = h("textarea", { rows: 5, style: "width:100%;padding:12px 14px;border-radius:14px;border:1px solid #333;background:#121212;color:#eee;font:inherit;resize:vertical", "aria-label": "Your notes" }), out = h("div.dm-col"); area.value = NOTES;
    let aura = 0; const auraEl = h("span.dm-pill", "✨ 0 aura");
    ctx.stage.append(h("div.dm-row", h("div.dm-h", { style: "margin:0;flex:1" }, "Your notes"), auraEl), area, h("div", { style: "height:10px" }), h("div.dm-row", h("button.dm-btn.solid", { type: "button", onclick: cards }, "Make flashcards"), h("span.dm-muted", "Edit the notes: write sentences like “X is Y.”")), h("div", { style: "height:14px" }), out);
    ctx.foot("The real Cramly reads PDFs, slides and photos, and adds a tutor, quizzes, a daily review and focus tools.");
    function parse() {
      return area.value.split(/(?<=[.!?])\s+/).map(sn => sn.trim().match(/^([A-Z][\w\- ]{1,32}?) (is|are) (.{6,})[.!?]$/)).filter(Boolean).map(m => ({ term: m[1], verb: m[2], def: m[3] })).slice(0, 6);
    }
    function addAura(n) { aura += n; auraEl.textContent = "✨ " + aura + " aura"; }
    function cards() {
      const list = parse(); out.textContent = "";
      if (list.length < 2) { out.append(h("div.dm-bad", "I need at least two sentences like “A cell is the smallest unit of life.”")); return; }
      out.append(h("div.dm-h", "Flashcards, tap to flip"), h("div.dm-two", { style: "grid-template-columns:repeat(auto-fill,minmax(210px,1fr))" }, list.map(c => { const w = h("div.dm-flip", h("div", h("div.f", `What ${c.verb} ${c.term.toLowerCase()}?`), h("div.b", `${c.term} ${c.verb} ${c.def}.`))); w.addEventListener("click", () => w.classList.toggle("back")); return w; })),
        h("div", { style: "height:8px" }), h("button.dm-btn", { type: "button", onclick: () => quiz(list) }, "Quiz me"));
    }
    function quiz(list) {
      const qs = shuffle(list).slice(0, 3); let i = 0; const box = h("div.dm-card.dm-pop"); out.append(box);
      (function ask() {
        box.textContent = ""; if (i >= qs.length) { box.append(h("b", "Quiz done."), h("div.dm-muted", "Every right answer earned aura. The real app tracks it as a streak and builds a daily review of what you missed.")); return; }
        const q = qs[i], opts = shuffle([q, ...shuffle(list.filter(x => x !== q)).slice(0, 2)]);
        box.append(h("div.dm-h", `Question ${i + 1} of ${qs.length}`), h("div", { style: "margin-bottom:10px" }, `Which one ${q.verb === "is" ? "is" : "are"} this? “${q.def}”`),
          h("div.dm-row", opts.map(o => h("button.dm-chip", { type: "button", onclick: ev => { const ok = o === q; ev.currentTarget.classList.add("on"); box.append(h("div." + (ok ? "dm-ok" : "dm-bad"), { style: "margin-top:10px" }, ok ? "Right! +10 aura" : `Not quite. It was ${q.term}.`)); if (ok) addAura(10); [...box.querySelectorAll("button")].forEach(b => { b.disabled = true; }); i++; ctx.later(ask, 1100); } }, o.term))));
      })();
    }
    cards();
  };

  /* ---------------------------------------------------------------- Womanten: earn your scrolls with a push-up */
  DEMOS.womanten = ctx => {
    let angle = 175, phase = "up", reps = 0, scrolls = 0, auto = 0;
    const arm = s("polyline", { fill: "none", stroke: "#e8a198", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }), body = s("polyline", { fill: "none", stroke: "#ececec", "stroke-width": 9, "stroke-linecap": "round" }), head = s("circle", { r: 9, fill: "#ececec" });
    const svg = s("svg", { viewBox: "0 0 400 220", class: "dm-svg", role: "img", "aria-label": "A stick figure doing a push-up" }, s("rect", { width: 400, height: 220, fill: "#0d0d0d" }), s("line", { x1: 20, y1: 196, x2: 380, y2: 196, stroke: "#2a2a2a", "stroke-width": 3 }), body, arm, head);
    const lock = h("div.dm-card", { style: "text-align:center;padding:22px" }), slider = range(70, 175, angle, 1, v => { angle = v; update(); });
    const repsEl = h("b", "0"), angEl = h("b");
    ctx.stage.append(h("div.dm-two", h("div.dm-col", svg, h("div.dm-lab", "Elbow angle", angEl), slider, h("div.dm-row", h("button.dm-btn.solid", { type: "button", onclick: doRep }, "Do a push-up for me"), h("span.dm-muted", "or drag the slider down and back up"))), h("div.dm-col", lock, h("div.dm-card", h("div.dm-lab", { style: "margin:0" }, "Push-ups counted", repsEl), h("div.dm-muted", "Down below 90°, then all the way back up counts as one. That is the same elbow-angle rule the real app uses with your camera.")))));
    ctx.foot("The real app locks TikTok, Instagram and YouTube until you do a push-up on camera (Android and Windows).");
    function update() {
      const hh = 28 + (angle - 70) / 105 * 52, sx = 130, sy = 196 - hh, hx = 104, hy = 196, a = 58, dx = sx - hx, dy = sy - hy, d = Math.min(Math.hypot(dx, dy), 2 * a - 1), k = Math.sqrt(a * a - d * d / 4), ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
      const ex = hx + dx / 2 + uy * k * -1, ey = hy + dy / 2 + ux * k;
      arm.setAttribute("points", `${hx},${hy} ${ex.toFixed(1)},${ey.toFixed(1)} ${sx},${sy.toFixed(1)}`);
      body.setAttribute("points", `${sx},${sy.toFixed(1)} ${(sx + 100).toFixed(1)},${(sy + (196 - sy) * 0.55).toFixed(1)} 330,192`);
      head.setAttribute("cx", sx - 16); head.setAttribute("cy", (sy - 8).toFixed(1)); angEl.textContent = Math.round(angle) + "°"; slider.value = angle;
      if (phase === "up" && angle < 90) phase = "down"; else if (phase === "down" && angle > 160) { phase = "up"; reps++; repsEl.textContent = String(reps); if (scrolls === 0) { scrolls = 10; } drawLock(); }
    }
    function drawLock() {
      lock.textContent = "";
      if (scrolls > 0) lock.append(h("div", { style: "font-size:34px" }, "🔓"), h("b", { style: "font-size:18px" }, "Unlocked: " + scrolls + " scrolls left"), h("div.dm-muted", { style: "margin:6px 0 12px" }, "Each scroll in the locked app uses one."), h("button.dm-btn", { type: "button", onclick: () => { scrolls--; drawLock(); } }, "Scroll the feed"));
      else lock.append(h("div", { style: "font-size:34px" }, "🔒"), h("b", { style: "font-size:18px" }, "Instagram is locked"), h("div.dm-muted", { style: "margin-top:6px" }, "Do a push-up to earn 10 scrolls."));
    }
    function doRep() { if (auto) return; let t = 0; auto = ctx.every(() => { t += 0.045; angle = 122 + 53 * Math.cos(t * Math.PI); update(); if (t >= 2) { clearInterval(auto); auto = 0; angle = 175; update(); } }, 30); }
    update(); drawLock();
  };

  /* ---------------------------------------------------------------- Totally Normal Website: a button that runs away */
  DEMOS.nonsense = ctx => {
    const FACTS = ["Bananas are berries. Strawberries are not.", "This website has been under construction since forever.", "You are visitor number -1967.", "The potato is not available right now. Please hold.", "Normal is a setting on the washing machine.", "Cookies are not the eating kind. We ate them all."];
    let calm = false, clicks = 0;
    const field = h("div", { style: "position:relative;height:270px;border-radius:18px;overflow:hidden;background:repeating-linear-gradient(45deg,#1b1b1b 0 16px,#222 16px 32px);border:3px dashed #d8b878" });
    const btn = h("button", { type: "button", style: "position:absolute;left:42%;top:42%;padding:14px 20px;font:700 17px 'Comic Sans MS','Comic Neue',cursive;background:#ffe14d;color:#c4160a;border:4px outset #fff;cursor:pointer;transition:left .18s,top .18s" }, "PRESS FOR KNOWLEDGE");
    const out = h("div.dm-out", { style: "text-align:center;font:600 18px 'Comic Sans MS','Comic Neue',cursive;color:#ffe14d" }, "Try to press the button.");
    function dodge() { const fw = field.clientWidth - btn.offsetWidth, fh = field.clientHeight - btn.offsetHeight; btn.style.left = Math.random() * fw + "px"; btn.style.top = Math.random() * fh + "px"; }
    ctx.on(field, "pointermove", e => { if (calm) return; const b = btn.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2; if (Math.hypot(e.clientX - cx, e.clientY - cy) < 90) dodge(); });
    btn.addEventListener("pointerdown", e => { if (!calm && ++clicks % 3 !== 0) { e.preventDefault(); dodge(); } });
    btn.addEventListener("click", () => { out.textContent = rand(FACTS); });
    field.append(btn);
    ctx.stage.append(h("div.dm-row", { style: "margin-bottom:10px" }, toggle("Calm mode (nothing moves)", false, v => { calm = v; })), field, h("div", { style: "height:12px" }), out);
    ctx.foot("The real site is loud on purpose, with a photosensitivity warning and a Calm mode that turns all of it off.");
  };
})();
