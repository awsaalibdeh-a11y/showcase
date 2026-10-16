/* Demos, part 1: Whatif, Alibi, Scout, Homebase, Unwritten, Cookify. Everything here is invented on purpose (fake places, fake family, made-up prices). */
(() => {
  "use strict";
  const { h, s, rand, shuffle, clamp, toggle, range, DEMOS, reduce } = window.DM;

  /* ---------------------------------------------------------------- Whatif: a timeline that writes itself */
  const STORIES = [
    { q: "What if the Titanic never hit the iceberg?", title: "The Ship That Made It", score: 72, why: "Many ships crossed safely, so a lucky escape is easy to believe.",
      chain: ["Safe voyage", "No shock", "Slow rule changes", "Later disaster", "Safety anyway"],
      ev: [["April 1912", "🚢", "A triumph in New York", "The Titanic docks on schedule and the voyage is celebrated. Nobody asks how many lifeboats she carried."],
        ["1913", "⚓", "Bigger ships, same old rules", "Rivals build even larger liners. Without a shocking disaster, the lifeboat rules probably stay as they were for longer."],
        ["1914", "📡", "Radio stays a bit optional", "Many ships keep their radio rooms closed at night. Listening around the clock spreads slowly instead of becoming law."],
        ["1920s", "🌊", "Another ship learns the lesson", "Sooner or later a big liner meets trouble in the icy North Atlantic. The lesson still arrives, just years later."],
        ["Today", "🎬", "No haunted legend", "Films and museums look very different. She is remembered as an old luxury liner, not a legend."]] },
    { q: "What if the Moon never existed?", title: "Earth Without a Moon", score: 55, why: "Scientists agree the Moon matters, but how much is still argued about.",
      chain: ["No Moon", "Weak tides", "Unsteady tilt", "Odd climate", "Different life"],
      ev: [["4.5 billion years ago", "🌍", "A lonely young Earth", "There is no giant impact, so the Earth spins on without a partner."],
        ["Early oceans", "🌊", "Tides shrink to a whisper", "Only the Sun pulls on the oceans, so tides are far weaker. Tidal pools, which some scientists think helped early life, would be rarer."],
        ["Millions of years", "🌀", "A wobbling planet", "Without the Moon holding it steady, Earth's tilt could drift and swing the climate, though scientists debate how much."],
        ["Human history", "🗓️", "Calendars change", "The word month comes from the Moon. Calendars and countless myths would be built around the Sun and stars instead."],
        ["Today", "🚀", "A different space race", "There is no Apollo and no footprints. Humans would aim straight for the planets, if they got there at all."]] },
    { q: "What if the dinosaurs never went extinct?", title: "A Planet of Dinosaurs", score: 40, why: "Mammals needed the extinction to spread, but how far dinosaurs would evolve is anyone's guess.",
      chain: ["Asteroid misses", "Dinosaurs stay big", "Mammals stay small", "Few primates", "No humans"],
      ev: [["66 million years ago", "☄️", "The asteroid misses", "The sky stays clear and the big reptiles keep their world, while small furry mammals hide in burrows."],
        ["Next 30 million years", "🐭", "Mammals stay small", "With the big roles already taken, mammals probably stay small and come out at night."],
        ["5 million years ago", "🐒", "No ape family tree", "Primates may never become common or clever without the great mammal boom."],
        ["Today", "🦖", "Who runs the planet?", "Perhaps clever feathered dinosaurs, perhaps nobody intelligent at all. Either way, nobody is asking this question."]] },
  ];
  DEMOS.whatif = ctx => {
    const out = h("div.dm-col"), pills = h("div.dm-row"); let run = 0;
    STORIES.forEach((st, i) => pills.append(h("button.dm-chip", { type: "button", onclick: () => play(i) }, st.q)));
    ctx.stage.append(h("p.dm-muted", "Pick a what-if and watch the timeline write itself. These three are hand-written; the real site writes any question with AI."), h("div", { style: "height:10px" }), pills, h("div", { style: "height:14px" }), out);
    ctx.foot("The real Whatif lets you change any event to branch a new story.");
    async function play(i) {
      const my = ++run, st = STORIES[i]; [...pills.children].forEach((b, k) => b.classList.toggle("on", k === i)); out.textContent = "";
      const tl = h("div.dm-col"); out.append(h("h4", { style: "font:500 26px/1.1 Georgia,serif;margin:2px 0 4px" }, st.title), tl);
      for (const [when, icon, head, text] of st.ev) {
        tl.append(h("div.dm-card.dm-pop", { style: "display:flex;gap:12px" }, h("div", { style: "font-size:24px" }, icon), h("div", h("div.dm-h", { style: "margin:0 0 2px" }, when), h("b", head), h("div.dm-muted", text))));
        await ctx.sleep(900); if (my !== run) return;
      }
      out.append(h("div.dm-card.dm-pop", h("div.dm-h", "The domino chain"), h("div.dm-row", st.chain.flatMap((c, k) => [k ? "→" : null, h("span.dm-pill", c)]))),
        h("div.dm-card.dm-pop", { style: "margin-top:12px" }, h("div.dm-lab", { style: "margin-top:0" }, "How believable", h("b", st.score + "/100")), h("div.dm-bar", h("i", { style: "width:" + st.score + "%" })), h("div.dm-muted", { style: "margin-top:8px" }, st.why)));
    }
    play(0);
  };

  /* ---------------------------------------------------------------- Alibi: find the killer by deduction */
  DEMOS.alibi = ctx => {
    const TRAIT = { shoes: ["muddy", "clean"], ticket: ["torn", "whole"], drink: ["wine", "tea"] }, ICON = { shoes: "👞", ticket: "🎫", drink: "🥂" };
    const PEOPLE = [["🧑‍🍳", "The Chef"], ["🕴️", "The Banker"], ["👩‍⚕️", "The Doctor"], ["🎩", "The Conductor"]];
    const ROOMS = [["🍽️", "Dining car", "shoes", t => `Footprints on the carpet. Whoever made them wore ${t} shoes.`], ["🛏️", "Sleeper cabin", "ticket", t => `A ${t} ticket is lying under the seat, still warm.`], ["🍸", "Bar car", "drink", t => `A half-finished glass of ${t} stands by the body.`]];
    let sus, killer, found, over;
    const left = h("div.dm-col"), right = h("div.dm-col"), msg = h("div.dm-out");
    ctx.stage.append(h("p.dm-muted", "The Midnight Express. A guest is dead and one of the four suspects did it. Search the train for clues, compare them with each suspect, then accuse."), h("div", { style: "height:12px" }), h("div.dm-two", left, right));
    ctx.foot("In the real Alibi a human can be the killer, and you play it with friends on your phones.");
    function start() {
      const combos = shuffle(TRAIT.shoes.flatMap(a => TRAIT.ticket.flatMap(b => TRAIT.drink.map(c => ({ shoes: a, ticket: b, drink: c }))))).slice(0, 4);
      sus = PEOPLE.map((p, i) => ({ icon: p[0], name: p[1], t: combos[i] })); killer = Math.floor(Math.random() * 4); found = {}; over = false; draw(); msg.textContent = ""; msg.className = "dm-out";
    }
    function match(x) { return Object.keys(found).every(k => x.t[k] === found[k]); }
    function draw() {
      left.textContent = ""; right.textContent = "";
      left.append(h("div.dm-h", "Suspects"));
      sus.forEach((x, i) => left.append(h("div.dm-card", { style: "display:flex;gap:12px;align-items:center;transition:opacity .3s;" + (Object.keys(found).length && !match(x) ? "opacity:.4" : "") + (over && i === killer ? ";border-color:#e0907f" : "") },
        h("div", { style: "font-size:28px" }, x.icon), h("div", { style: "flex:1" }, h("b", x.name), h("div.dm-row", { style: "margin-top:4px" }, Object.keys(TRAIT).map(k => h("span.dm-pill", ICON[k] + " " + x.t[k])))),
        h("button.dm-btn", { type: "button", disabled: over, onclick: () => accuse(i) }, "Accuse"))));
      right.append(h("div.dm-h", "Search the train"), ...ROOMS.map(r => h("button.dm-item", { type: "button", disabled: over, onclick: () => { found[r[2]] = sus[killer].t[r[2]]; draw(); log(r); } }, h("span", { style: "font-size:22px" }, r[0]), h("span", h("b", r[1]), h("div.dm-muted", found[r[2]] ? "Searched" : "Look for clues")))), msg);
      if (over) right.append(h("button.dm-btn.solid", { type: "button", onclick: start }, "Play again"));
    }
    function log(r) { msg.textContent = ""; ctx.type(msg, r[3](found[r[2]]), 90); }
    function accuse(i) {
      over = true; draw(); const ok = i === killer, k = sus[killer];
      msg.className = "dm-out " + (ok ? "dm-ok" : "dm-bad");
      msg.textContent = ok ? `Caught! ${k.name} had ${k.t.shoes} shoes, a ${k.t.ticket} ticket and drank ${k.t.drink}.` : `Wrong. It was ${k.name}, with ${k.t.shoes} shoes, a ${k.t.ticket} ticket and ${k.t.drink}.`;
    }
    start();
  };

  /* ---------------------------------------------------------------- Scout: ask in your own words */
  const PLACES = [
    ["Burger Barn", "burger fast food", 1, true, 4.3, 262, 96], ["Grill & Co", "burger restaurant steak", 3, true, 4.6, 120, 62], ["Bean There", "cafe coffee quiet", 2, true, 4.5, 300, 170],
    ["Quiet Cup", "cafe coffee quiet books", 2, false, 4.7, 90, 190], ["Cedar Pharmacy", "pharmacy medicine", 1, true, 4.2, 214, 214], ["Night Pharmacy", "pharmacy medicine 24h", 1, true, 4.0, 340, 60],
    ["Sweet Spot", "dessert ice cream", 1, true, 4.4, 150, 120], ["Cocoa Corner", "dessert chocolate cafe", 2, false, 4.8, 330, 130], ["Falafel Hub", "falafel fast food cheap lunch", 1, true, 4.5, 60, 100],
    ["Pizza Pier", "pizza fast food", 2, true, 4.1, 280, 40], ["Green Bowl", "salad healthy lunch", 2, true, 4.3, 70, 150], ["Daily Mart", "grocery store", 1, true, 3.9, 190, 30],
  ].map(p => ({ n: p[0], t: p[1], price: p[2], open: p[3], r: p[4], x: p[5], y: p[6], d: Math.round(Math.hypot(p[5] - 200, p[6] - 130) * 4.2 / 10) * 10 }));
  DEMOS.scout = ctx => {
    const input = h("input", { type: "search", placeholder: 'Ask Scout, e.g. "a burger, cheap and close"', "aria-label": "Ask Scout", style: "flex:1;min-width:200px;padding:11px 16px;border-radius:99px;border:1px solid #333;background:#121212;color:#eee;font:inherit" });
    const list = h("div.dm-list"), note = h("div.dm-muted"), pins = s("g"); let open = false, sel = -1, shown = [];
    const map = s("svg", { viewBox: "0 0 400 260", class: "dm-svg", role: "img", "aria-label": "A made-up map with places" },
      s("rect", { width: 400, height: 260, fill: "#0d0d0d" }), ...[[0, 130, 400, 130], [200, 0, 200, 260], [0, 60, 400, 90], [90, 0, 120, 260], [300, 0, 280, 260], [0, 200, 400, 190]].map(l => s("line", { x1: l[0], y1: l[1], x2: l[2], y2: l[3], stroke: "#222", "stroke-width": 7, "stroke-linecap": "round" })),
      s("circle", { cx: 200, cy: 130, r: 78, fill: "none", stroke: "#2a2a2a", "stroke-dasharray": "3 5" }), pins, s("circle", { cx: 200, cy: 130, r: 7, fill: "#8fd7a8" }), s("circle", { cx: 200, cy: 130, r: 14, fill: "none", stroke: "#8fd7a8", opacity: ".4" }));
    const chips = h("div.dm-row", ["a burger, cheap and close", "quiet cafe open now", "pharmacy", "dessert nearby", "healthy lunch"].map(q => h("button.dm-chip", { type: "button", onclick: () => { input.value = q; search(); } }, q)));
    const openSwitch = toggle("Open now", false, v => { open = v; search(); });
    ctx.stage.append(h("div.dm-row", input, openSwitch), h("div", { style: "height:10px" }), chips, h("div", { style: "height:14px" }), h("div.dm-two", map, h("div.dm-col", list, note)));
    ctx.foot("The real Scout searches millions of real places around you and draws a search area you can sketch.");
    function search() {
      const words = input.value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean), stop = new Set(["a", "an", "the", "and", "me", "show", "find", "some", "i", "want", "need", "to", "for", "please"]);
      let cheap = false, near = false, needOpen = open, terms = [];
      words.forEach(w => { if (w === "cheap" || w === "budget") cheap = true; else if (["close", "near", "nearby", "nearest"].includes(w)) near = true; else if (w === "open") needOpen = true; else if (w === "now") { /* part of "open now" */ } else if (!stop.has(w)) terms.push(w); });
      shown = PLACES.filter(p => (!cheap || p.price <= 1) && (!needOpen || p.open) && terms.every(w => (p.t + " " + p.n.toLowerCase()).includes(w.replace(/s$/, ""))));
      shown.sort((a, b) => a.d - b.d); shown = shown.slice(0, 5); sel = -1; render();
      const bits = [cheap && "cheap", needOpen && "open now", near && "closest first"].filter(Boolean);
      note.textContent = shown.length ? `${shown.length} place${shown.length > 1 ? "s" : ""}${bits.length ? " · understood: " + bits.join(", ") : ""}` : "Nothing matches. Try fewer words.";
    }
    function render() {
      list.textContent = ""; pins.textContent = "";
      shown.forEach((p, i) => {
        list.append(h("button.dm-item" + (i === sel ? ".on" : ""), { type: "button", onclick: () => { sel = i; render(); } }, h("div", { style: "flex:1" }, h("b", p.n), h("div.dm-muted", "★ " + p.r + " · " + "$".repeat(p.price) + " · " + (p.open ? "Open" : "Closed"))), h("span.dm-pill", p.d + " m")));
        pins.append(s("circle", { cx: p.x, cy: p.y, r: i === sel ? 11 : 8, fill: i === sel ? "#f2d49a" : "#e0907f", stroke: "#0d0d0d", "stroke-width": 2 }), s("text", { x: p.x, y: p.y + 3.5, "text-anchor": "middle", "font-size": 9, "font-weight": 700, fill: "#111" }, String(i + 1)));
      });
    }
    input.addEventListener("input", search); input.value = "a burger, cheap and close"; search();
  };

  /* ---------------------------------------------------------------- Homebase: a family on a map, honest about what is shared */
  DEMOS.homebase = ctx => {
    const WHO = [{ n: "Mum", c: "#e0907f", r: 70, sp: 0.7, cx: 150, cy: 110, ph: 0 }, { n: "Dad", c: "#d8b878", r: 55, sp: -0.5, cx: 260, cy: 150, ph: 2 }, { n: "Sam (you)", c: "#8fd7a8", r: 26, sp: 0.35, cx: 205, cy: 120, ph: 4 }];
    const pinEls = WHO.map(w => s("g", s("circle", { r: 9, fill: w.c, stroke: "#0d0d0d", "stroke-width": 2 }), s("text", { y: -14, "text-anchor": "middle", "font-size": 10, fill: "#ddd" }, w.n)));
    const map = s("svg", { viewBox: "0 0 400 260", class: "dm-svg", role: "img", "aria-label": "A made-up family map" }, s("rect", { width: 400, height: 260, fill: "#0d0d0d" }),
      ...[[0, 130, 400, 120], [190, 0, 210, 260], [0, 50, 400, 70], [60, 0, 90, 260], [320, 0, 300, 260]].map(l => s("line", { x1: l[0], y1: l[1], x2: l[2], y2: l[3], stroke: "#222", "stroke-width": 7, "stroke-linecap": "round" })), ...pinEls);
    const status = h("div.dm-out"), sosBar = h("i", { style: "width:0%" }), screen = h("div.dm-muted");
    let sharing = true, t0 = 0, sosTimer = 0, mins = 72;
    const shareSwitch = toggle("Share my location", true, v => { sharing = v; status.textContent = v ? "Sharing again. The family sees you." : "Paused. The family sees that you are paused, not a stale dot."; status.className = "dm-out dm-warm"; });
    const sos = h("button.dm-btn", { type: "button", style: "position:relative;overflow:hidden", "aria-label": "Hold for two seconds to send an SOS" }, h("span", { style: "position:relative" }, "🆘 Hold 2 s for SOS"));
    const stopSos = () => { clearInterval(sosTimer); sosBar.style.width = "0%"; };
    sos.addEventListener("pointerdown", () => { t0 = Date.now(); sosTimer = setInterval(() => { const p = clamp((Date.now() - t0) / 2000, 0, 1); sosBar.style.width = p * 100 + "%"; if (p >= 1) { stopSos(); status.className = "dm-out dm-bad"; status.textContent = "SOS sent. Everyone is told, with your location."; } }, 40); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(e => sos.addEventListener(e, stopSos));
    sos.prepend(h("div.dm-bar", { style: "position:absolute;inset:0;height:100%;border-radius:0;background:transparent" }, sosBar)); sosBar.style.background = "rgba(224,144,127,.5)";
    const chat = h("div.dm-col"), callBox = h("div.dm-out");
    const msgBtn = h("button.dm-btn", { type: "button", onclick: async () => { chat.textContent = ""; const b = h("div.dm-card.dm-pop", h("div.dm-h", "You → Mum"), h("div", "")); chat.append(b); await ctx.type(b.lastChild, "I'm at the library, home by 5.", 60); await ctx.sleep(500); const r = h("div.dm-card.dm-pop", h("div.dm-h", "Mum"), h("div", "")); chat.append(r); ctx.type(r.lastChild, "Perfect, see you then ❤️", 60); } }, "💬 Message");
    const callBtn = h("button.dm-btn", { type: "button", onclick: async () => { callBox.className = "dm-out dm-warm"; callBox.textContent = "📞 Calling Dad… it rings in his own window."; await ctx.sleep(1800); callBox.className = "dm-out dm-ok"; callBox.textContent = "Connected · 00:03"; await ctx.sleep(1500); callBox.textContent = "Call ended. He could have said not now, and you would have seen that."; } }, "📞 Call");
    ctx.stage.append(h("div.dm-two", map, h("div.dm-col", h("div.dm-card", h("div.dm-h", "Me"), shareSwitch, h("div", { style: "height:10px" }), h("div.dm-row", h("button.dm-btn", { type: "button", onclick: () => { status.className = "dm-out dm-ok"; status.textContent = "✅ Everyone is told you are OK."; } }, "✅ I'm OK"), sos), status),
      h("div.dm-card", h("div.dm-h", "Family"), h("div.dm-row", msgBtn, callBtn), chat, callBox), h("div.dm-card", h("div.dm-h", "Screen time today"), screen))));
    ctx.foot("The real Homebase has Android, Windows and web apps. The child sees everything the family sees.");
    ctx.every(() => { mins += 1; render(); }, 2500);
    function render() { screen.textContent = ""; screen.append(h("b", { style: "color:#fff;font-size:20px" }, Math.floor(mins / 60) + " h " + String(mins % 60).padStart(2, "0") + " min"), " · most on Minecraft", h("div", "Counts only play and watch time, never homework. The child sees this too.")); }
    render();
    let tick = 0;
    ctx.every(() => {
      tick += 0.04;
      WHO.forEach((w, i) => { const a = tick * w.sp + w.ph, x = w.cx + Math.cos(a) * w.r, y = w.cy + Math.sin(a) * w.r * 0.55; pinEls[i].setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`); pinEls[i].setAttribute("opacity", i === 2 && !sharing ? ".25" : "1"); });
    }, 50);
  };

  /* ---------------------------------------------------------------- Unwritten: a life, one year at a time */
  const LIFE = [
    { text: "Your best friend asks you to the school football match on the same night as your piano recital.", a: ["Go to the match", { hap: 8, smarts: -2 }, "You cheered until you lost your voice. The recital went on without you, and nobody remembers."], b: ["Play the recital", { smarts: 6, hap: -3 }, "Your hands shook, then steadied. Afterwards your teacher said you had played with real courage."] },
    { text: "You find a wallet on the bus stop bench. There is cash inside, and an address.", a: ["Hand it in", { hap: 4, smarts: 1 }, "The owner cried and bought you an ice cream. It tasted better than any you had had."], b: ["Keep the cash", { hap: -6, money: 20 }, "The money felt heavier than it looked. You did not sleep well."] },
    { text: "A new kid joins your class and sits alone at lunch.", a: ["Sit with them", { hap: 7 }, "You talked for an hour. They became the person you tell everything to."], b: ["Stay with your group", { hap: -2 }, "It was fine. Later you saw them laughing with someone else, and wondered."] },
    { text: "Exam week. You have not studied, and a friend offers you their notes.", a: ["Study all night", { smarts: 8, health: -4 }, "You were a zombie, but you knew the answers. The marks were your best yet."], b: ["Copy the notes", { smarts: 1, hap: -4 }, "You passed. Nobody knew, but you did."] },
    { text: "You are offered a weekend job washing cars.", a: ["Take the job", { money: 60, health: 2, hap: -2 }, "Your arms ached, but you came home with your first pay and a sunburn."], b: ["Sleep in", { hap: 6, health: 2 }, "Best Saturday ever. Your bank account disagreed."] },
    { text: "Your class goes on a trip and a storm starts halfway up the hill.", a: ["Keep walking", { health: -5, hap: 4 }, "Soaked to the bone, you reached the top and the clouds opened for ten seconds. Worth it."], b: ["Turn back", { health: 1, hap: -1 }, "Dry and safe. Somebody else got the photo, and kept it."] },
  ];
  DEMOS.unwritten = ctx => {
    const st = { age: 7, hap: 70, health: 80, smarts: 50, money: 0 }, used = [];
    const log = h("div.dm-col", { style: "max-height:210px;overflow:auto" }), choices = h("div.dm-row"), bars = h("div.dm-col"), head = h("div"), go = h("button.dm-btn.solid", { type: "button", onclick: nextYear }, "+1 Age");
    ctx.stage.append(h("div.dm-two", h("div.dm-col", h("div.dm-card", head, bars), go), h("div.dm-col", log, choices)));
    ctx.foot("In the real Unwritten an AI types every year of your life live, so no two lives are the same.");
    function paint() {
      head.textContent = ""; head.append(h("b", { style: "font-size:20px" }, "Sam"), h("span.dm-pill", { style: "margin-left:8px" }, "Age " + st.age), h("span.dm-pill", { style: "margin-left:6px" }, "$" + st.money));
      bars.textContent = ""; [["Happiness", "hap"], ["Health", "health"], ["Smarts", "smarts"]].forEach(([l, k]) => bars.append(h("div.dm-lab", { style: "margin:8px 0 3px" }, l, h("b", String(clamp(st[k], 0, 100)))), h("div.dm-bar", h("i", { style: "width:" + clamp(st[k], 0, 100) + "%" }))));
    }
    async function nextYear() {
      go.disabled = true; st.age++; paint(); choices.textContent = "";
      if (st.age > 18) { log.prepend(h("div.dm-card.dm-pop", h("b", "Sam is an adult."), h("div.dm-muted", "Careers, relationships and the rest of the life are in the real game."))); return; }
      let pool = LIFE.filter((_, i) => !used.includes(i)); if (!pool.length) { used.length = 0; pool = LIFE; }
      const ev = rand(pool); used.push(LIFE.indexOf(ev));
      const card = h("div.dm-card.dm-pop", h("div.dm-h", "Age " + st.age), h("div", "")); log.prepend(card);
      await ctx.type(card.lastChild, ev.text, 80);
      [ev.a, ev.b].forEach(o => choices.append(h("button.dm-btn", { type: "button", onclick: async () => {
        choices.textContent = ""; Object.entries(o[1]).forEach(([k, v]) => { st[k] += v; }); paint();
        const res = h("div.dm-muted", { style: "margin-top:6px" }); card.append(res); await ctx.type(res, o[2], 80); go.disabled = false; } }, o[0])));
    }
    paint();
  };

  /* ---------------------------------------------------------------- Cookify: recipes checked ingredient by ingredient */
  const RECIPES = [
    ["Chicken curry", "🍛", [["chicken"], ["coconut milk"], ["onion"], ["garlic"], ["curry spices"]]], ["Pad thai", "🍜", [["rice noodles"], ["peanuts", "peanut"], ["egg", "egg"], ["shrimp", "shellfish"], ["lime"]]],
    ["Margherita pizza", "🍕", [["dough", "gluten"], ["mozzarella", "dairy"], ["tomato"], ["basil"]]], ["Pancakes", "🥞", [["flour", "gluten"], ["milk", "dairy"], ["egg", "egg"], ["butter", "dairy"]]],
    ["Lentil soup", "🍲", [["lentils"], ["carrot"], ["onion"], ["cumin"]]], ["Chicken Caesar", "🥗", [["chicken"], ["romaine"], ["parmesan", "dairy"], ["croutons", "gluten"], ["dressing", "egg"]]],
    ["Shrimp tacos", "🌮", [["shrimp", "shellfish"], ["corn tortillas"], ["cabbage"], ["lime"]]], ["Veggie stir-fry", "🥦", [["broccoli"], ["peppers"], ["soy sauce", "gluten"], ["rice"], ["ginger"]]],
  ].map(r => ({ n: r[0], e: r[1], ing: r[2].map(i => ({ n: i[0], a: i[1] || "" })) }));
  const ALLERGENS = [["peanut", "Peanuts"], ["dairy", "Dairy"], ["gluten", "Gluten"], ["egg", "Eggs"], ["shellfish", "Shellfish"]];
  const SWAP = { peanut: "sunflower seeds", dairy: "oat milk or vegan cheese", gluten: "rice, or gluten-free flour", egg: "a flax egg", shellfish: "tofu" };
  DEMOS.cookify = ctx => {
    const on = new Set(), list = h("div.dm-list"), count = h("div.dm-muted"), detail = h("div.dm-card"); let pick = -1;
    const chips = h("div.dm-row", ALLERGENS.map(([k, l]) => h("button.dm-chip", { type: "button", "aria-pressed": "false", onclick: ev => { on.has(k) ? on.delete(k) : on.add(k); ev.currentTarget.classList.toggle("on", on.has(k)); ev.currentTarget.setAttribute("aria-pressed", String(on.has(k))); render(); } }, l)));
    ctx.stage.append(h("p.dm-muted", "Tick your allergies. Every recipe is checked ingredient by ingredient."), h("div", { style: "height:8px" }), chips, h("div", { style: "height:12px" }), count, h("div", { style: "height:8px" }), h("div.dm-two", list, detail));
    ctx.foot("The real Cookify has 1,000+ recipes, diets, swaps and a step-by-step cook mode.");
    const bad = r => [...new Set(r.ing.filter(i => on.has(i.a)).map(i => i.a))];
    function render() {
      list.textContent = ""; const safe = RECIPES.filter(r => !bad(r).length).length;
      count.textContent = on.size ? `${safe} of ${RECIPES.length} recipes are safe for you.` : "No allergies ticked, so everything is shown as safe.";
      RECIPES.forEach((r, i) => { const b = bad(r); list.append(h("button.dm-item" + (i === pick ? ".on" : ""), { type: "button", style: b.length ? "opacity:.55" : "", onclick: () => { pick = i; render(); } },
        h("span", { style: "font-size:24px" }, r.e), h("div", { style: "flex:1" }, h("b", r.n), h("div." + (b.length ? "dm-bad" : "dm-ok"), { style: "font-size:12.5px" }, b.length ? "Contains: " + b.join(", ") : "✓ Safe for you")))); });
      detail.textContent = "";
      if (pick < 0) { detail.append(h("div.dm-muted", "Tap a recipe to see its ingredients.")); return; }
      const r = RECIPES[pick], b = bad(r);
      detail.append(h("div.dm-h", r.n), h("div.dm-col", r.ing.map(i => h("div", { style: "display:flex;gap:8px;justify-content:space-between" }, h("span", { style: on.has(i.a) ? "text-decoration:line-through;color:#f09a8c" : "" }, i.n), on.has(i.a) ? h("span.dm-warm", { style: "font-size:12.5px" }, "swap: " + SWAP[i.a]) : h("span.dm-ok", "✓")))),
        h("div.dm-muted", { style: "margin-top:10px" }, b.length ? "Cookify suggests a swap for each flagged ingredient." : "Nothing to change."));
    }
    render();
  };
})();
