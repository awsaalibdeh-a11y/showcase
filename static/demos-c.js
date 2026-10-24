/* Demos, part 3: Noor. The Quran text here is copied from Noor's own data (Tanzil Uthmani). */
(() => {
  "use strict";
  const { h, shuffle, DEMOS } = window.DM;
  const QUIZ = [{"ar": "قُلْ هُوَ ٱللَّهُ أَحَدٌ", "en": "Say, \"He is Allah, [who is] One,", "ok": "Al-Ikhlaas", "opts": ["Al-Ikhlaas", "Al-Falaq", "An-Naas", "Al-Kaafiroon"]}, {"ar": "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ", "en": "Indeed, We have granted you, [O Muhammad], al-Kawthar.", "ok": "Al-Kawthar", "opts": ["Al-Kawthar", "Al-Maa'un", "Al-Fil", "An-Nasr"]}, {"ar": "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", "en": "Say, \"I seek refuge in the Lord of mankind,", "ok": "An-Naas", "opts": ["An-Naas", "Al-Falaq", "Al-Ikhlaas", "Al-Asr"]}, {"ar": "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ", "en": "Indeed, mankind is in loss,", "ok": "Al-Asr", "opts": ["Al-Asr", "At-Takaathur", "Al-Qaari'a", "Al-Humaza"]}, {"ar": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ", "en": "[All] praise is [due] to Allah, Lord of the worlds -", "ok": "Al-Faatiha", "opts": ["Al-Faatiha", "Al-Ikhlaas", "An-Naas", "Al-Baqara"]}, {"ar": "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ", "en": "When the victory of Allah has come and the conquest,", "ok": "An-Nasr", "opts": ["An-Nasr", "Al-Masad", "Al-Kaafiroon", "Al-Kawthar"]}];
  const IKHLAS = ["قُلْ هُوَ ٱللَّهُ أَحَدٌ", "ٱللَّهُ ٱلصَّمَدُ", "لَمْ يَلِدْ وَلَمْ يُولَدْ", "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ"];
  DEMOS.noor = ctx => {
    const tabs = h("div.dm-row"), body = h("div.dm-col");
    const show = which => { body.textContent = ""; tabs.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.w === which)); ({ quiz, recite, tasbih })[which](); };
    [["quiz", "🧩 Which surah?"], ["recite", "🎙 Recite and get checked"], ["tasbih", "📿 Tasbih"]].forEach(([w, t]) => tabs.append(h("button.dm-btn", { type: "button", "data-w": w, onclick: () => show(w) }, t)));
    ctx.stage.append(tabs, body);
    ctx.foot("The real Noor has all 114 surahs, 20 reciters, tafsir, prayer times and works offline.");
    let qi = 0, score = 0;
    function quiz() {
      const q = QUIZ[qi % QUIZ.length];
      const card = h("div.dm-card", h("div.dm-h", "Question " + (qi % QUIZ.length + 1) + " · score " + score),
        h("div", { style: "font-family:'Amiri Quran','Noto Naskh Arabic',serif;font-size:28px;line-height:2;direction:rtl;text-align:right;color:#fff" }, q.ar),
        h("div.dm-muted", q.en));
      const opts = h("div.dm-col");
      shuffle(q.opts.slice()).forEach(o => opts.append(h("button.dm-btn", { type: "button", onclick: e => {
        const ok = o === q.ok; if (ok) score++;
        opts.querySelectorAll("button").forEach(b => { b.disabled = true; if (b.textContent === q.ok) b.style.borderColor = "#3fbf80"; });
        if (!ok) e.target.style.borderColor = "#e06b5e";
        ctx.later(() => { qi++; body.textContent = ""; quiz(); }, 1100);
      } }, o)));
      body.append(card, opts);
    }
    async function recite() {
      const words = IKHLAS.join(" ").split(" "), box = h("div", { style: "font-family:'Amiri Quran','Noto Naskh Arabic',serif;font-size:30px;line-height:2.2;direction:rtl;text-align:justify;text-align-last:center" });
      const spans = words.map(w => h("span", { style: "color:#6c6c74;border-radius:8px;padding:0 3px;transition:all .2s" }, w + " "));
      spans.forEach(s => box.append(s));
      const live = h("div.dm-out", "🎙 Listening… (a pretend reader is reciting Al-Ikhlas)"), card = h("div.dm-card", h("div.dm-h", "Correct me mode"), box, live);
      body.append(card);
      const wrongAt = 6;
      for (let i = 0; i < spans.length; i++) {
        await ctx.sleep(420); if (!ctx.alive()) return;
        if (i === wrongAt) { spans[i].style.color = "#ff6b5e"; spans[i].style.background = "rgba(255,107,94,.15)"; live.textContent = "That word was not right. Try again…"; await ctx.sleep(1100); live.textContent = "🎙 Listening…"; spans[i].style.color = "#e0a943"; spans[i].style.background = "transparent"; continue; }
        spans[i].style.color = "#3fbf80";
      }
      live.className = "dm-out dm-ok"; live.textContent = "Score: 94% · Excellent. One word to review, shown in amber.";
    }
    function tasbih() {
      let n = 0; const c = h("div", { style: "font-size:56px;font-weight:800;text-align:center;color:#fff" }, "0"), lab = h("div.dm-muted", { style: "text-align:center" }, "سُبْحَانَ ٱللَّهِ · 0 / 33");
      const tap = h("button.dm-btn", { type: "button", style: "width:150px;height:150px;border-radius:50%;margin:10px auto;display:block;font-size:20px;background:radial-gradient(circle at 35% 30%,#19a06a,#0b5c3b);color:#fff;border:0", onclick: () => { n++; c.textContent = n; lab.textContent = "سُبْحَانَ ٱللَّهِ · " + (n % 33) + " / 33" + (n % 33 === 0 ? " ✓" : ""); if (navigator.vibrate && n % 33 === 0) navigator.vibrate(50); } }, "Tap");
      body.append(h("div.dm-card", c, lab, tap));
    }
    show("quiz");
  };

  DEMOS.void = ctx => {
    const paints = [["Void Black", "#0a0a0c"], ["Blood Red", "#8b0e18"], ["Ghost White", "#e9e9ea"], ["Ion Blue", "#123a8c"], ["Ember Orange", "#c9480c"]];
    const car = h("div", { style: "height:120px;display:grid;place-items:center" });
    const draw = c => { car.innerHTML = `<svg viewBox="0 0 320 110" width="100%" height="110"><path d="M20 78 Q30 52 80 48 L130 30 Q170 20 210 34 L262 48 Q300 54 304 76 L304 84 L20 84 Z" fill="${c}" stroke="#c1121f" stroke-width="2"/><path d="M135 34 L205 38 L232 50 L120 50 Z" fill="#0b0e14" opacity=".85"/><circle cx="82" cy="84" r="17" fill="#111"/><circle cx="82" cy="84" r="8" fill="#c1121f"/><circle cx="246" cy="84" r="17" fill="#111"/><circle cx="246" cy="84" r="8" fill="#c1121f"/><rect x="292" y="62" width="10" height="4" fill="#e8fbff"/></svg>`; };
    const row = h("div.dm-row");
    paints.forEach(([n, c]) => row.append(h("button.dm-btn", { type: "button", onclick: () => draw(c) }, n)));
    draw(paints[0][1]);
    ctx.stage.append(h("div.dm-card", h("div.dm-h", "Hydra LTE242"), car, row, h("div.dm-muted", "790 hp · 0-100 km/h in 2.6 s · 335 km/h · four lift thrusters")));
    ctx.foot("The real VOID has a 3D film with music, a free-roam game in real Dammam and a full garage.");
  };
})();
