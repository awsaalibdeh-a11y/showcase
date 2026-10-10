"use strict";
/* The score for the reveal, made live with the Web Audio API: no audio files, so nothing to download and nothing to get out of sync.
   Every voice takes a start time, so it can play live or be rendered offline for testing. */
window.RevealAudio = (() => {
  const A = {};
  let ctx = null, master = null, bus = null, rev = null, noise = null, pad = null, muted = false;
  const hz = (semi, base = 220) => base * Math.pow(2, semi / 12);               // semitones from A3
  const PENT = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22];                              // A minor pentatonic, so any order sounds good
  const CHORDS = [[0, 3, 7, 14], [-4, 0, 3, 7], [-9, -2, 3, 7], [-2, 5, 10, 14]];  // Am9, Fmaj7, Cmaj7, G6/9: the "reveal" progression
  A.PENT = PENT; A.CHORDS = CHORDS;

  function impulse(sec, decay) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }
  A.init = c => {
    ctx = c || new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : .3;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = .005; comp.release.value = .3;
    const lim = ctx.createWaveShaper(), curve = new Float32Array(2048);        // a soft limiter: nothing can ever clip, however many sounds overlap
    for (let i = 0; i < curve.length; i++) { const x = i / (curve.length - 1) * 2 - 1; curve[i] = .95 * Math.tanh(x * 1.3) / Math.tanh(1.3); }
    lim.curve = curve; lim.oversample = "2x";
    master.connect(comp); comp.connect(lim); lim.connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(master);
    const conv = ctx.createConvolver(); conv.buffer = impulse(2.8, 2.4); rev = ctx.createGain(); rev.gain.value = .55; rev.connect(conv); conv.connect(master);
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noise = nb;
    return ctx;
  };
  A.ctx = () => ctx;
  A.ready = () => !!ctx;
  A.resume = () => ctx && ctx.state === "suspended" && ctx.resume();
  A.suspend = () => ctx && ctx.state === "running" && ctx.suspend();
  A.setMuted = m => { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : .3, ctx.currentTime, .08); };
  A.isMuted = () => muted;

  const out = (node, wet = .3) => { node.connect(bus); if (wet) { const g = ctx.createGain(); g.gain.value = wet; node.connect(g); g.connect(rev); } };
  function env(g, at, a, peak, hold, rel) { g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(peak, at + a); g.gain.setValueAtTime(peak, at + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, at + a + hold + rel); }

  /* a soft pluck, like a glass marimba: used when each step appears */
  A.pluck = (semi = 0, at = ctx.currentTime, vel = 1) => {
    if (!ctx) return;
    const f = hz(semi, 440), g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
    [[1, "triangle", .6], [2, "sine", .25], [3.01, "sine", .08]].forEach(([m, type, v]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f * m; og.gain.value = v; o.connect(og); og.connect(lp); o.start(at); o.stop(at + 1.6); });
    lp.connect(g); env(g, at, .006, .22 * vel, 0, 1.3); out(g, .55);
  };
  /* a fast tick, for the counting numbers */
  A.tick = (pitch = 1, at = ctx.currentTime) => {
    if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = 1500 + 700 * pitch;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900; o.connect(hp); hp.connect(g); env(g, at, .002, .05, 0, .05); o.start(at); o.stop(at + .08); out(g, .1);
  };
  /* a deep, soft hit: the headline landing */
  A.boom = (at = ctx.currentTime, vel = 1) => {
    if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(34, at + .9);
    env(g, at, .004, .75 * vel, .05, 1.5); o.connect(g); o.start(at); o.stop(at + 1.8); out(g, .25);
    const n = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), ng = ctx.createGain(); n.buffer = noise; lp.type = "lowpass"; lp.frequency.value = 220; env(ng, at, .002, .3 * vel, 0, .35); n.connect(lp); lp.connect(ng); n.start(at); n.stop(at + .6); out(ng, .1);
  };
  /* air moving past: between scenes */
  A.whoosh = (at = ctx.currentTime, dur = 1, rising = true, vel = 1) => {
    if (!ctx) return; const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noise; n.loop = true; bp.type = "bandpass"; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(rising ? 250 : 3200, at); bp.frequency.exponentialRampToValueAtTime(rising ? 3200 : 250, at + dur);
    env(g, at, dur * .45, .22 * vel, 0, dur * .55); n.connect(bp); bp.connect(g); n.start(at); n.stop(at + dur + .1); out(g, .35);
  };
  /* a swelling build-up before something lands */
  A.riser = (at = ctx.currentTime, dur = 1.8) => {
    if (!ctx) return; const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain(); n.buffer = noise; n.loop = true; hp.type = "highpass"; hp.Q.value = 3;
    hp.frequency.setValueAtTime(300, at); hp.frequency.exponentialRampToValueAtTime(5200, at + dur); g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(.3, at + dur); g.gain.linearRampToValueAtTime(0, at + dur + .04);
    n.connect(hp); hp.connect(g); n.start(at); n.stop(at + dur + .1); out(g, .3);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(440, at + dur); og.gain.setValueAtTime(.0001, at); og.gain.exponentialRampToValueAtTime(.06, at + dur); og.gain.linearRampToValueAtTime(0, at + dur + .04);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(400, at); lp.frequency.exponentialRampToValueAtTime(3000, at + dur); o.connect(lp); lp.connect(og); o.start(at); o.stop(at + dur + .1); out(og, .3);
  };
  /* a warm chord that blooms and fades */
  A.chord = (idx = 0, at = ctx.currentTime, dur = 4, vel = 1) => {
    if (!ctx) return;
    CHORDS[idx % CHORDS.length].forEach(s => [-6, 6].forEach(detune => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = hz(s, 220); o.detune.value = detune;
      lp.type = "lowpass"; lp.frequency.setValueAtTime(500, at); lp.frequency.linearRampToValueAtTime(1500, at + dur * .5); lp.frequency.linearRampToValueAtTime(600, at + dur);
      env(g, at, dur * .35, .035 * vel, dur * .15, dur * .5); o.connect(lp); lp.connect(g); o.start(at); o.stop(at + dur + .2); out(g, .7);
    }));
  };
  /* the quiet bed under everything: slowly changes chord from scene to scene */
  A.pad = (idx = 0, at = ctx.currentTime) => {
    if (!ctx) return;
    if (pad) { const old = pad; old.g.gain.cancelScheduledValues(at); old.g.gain.setValueAtTime(Math.max(old.g.gain.value, .0001), at); old.g.gain.exponentialRampToValueAtTime(.0001, at + 2.4); old.stop = at + 2.6; old.nodes.forEach(o => { try { o.stop(at + 2.6); } catch (e) { /* already stopped */ } }); }
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(), nodes = []; lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = .5;
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(.07, at + 2.6);
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .11; lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(at); nodes.push(lfo);
    CHORDS[idx % CHORDS.length].forEach(s => { [-9, 8].forEach(dt => { const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = hz(s - 12, 220); o.detune.value = dt; o.connect(lp); o.start(at); nodes.push(o); }); });
    lp.connect(g); out(g, .5); pad = { g, nodes };
  };
  A.padStop = (at = ctx.currentTime) => { if (!pad) return; pad.g.gain.cancelScheduledValues(at); pad.g.gain.setValueAtTime(Math.max(pad.g.gain.value, .0001), at); pad.g.gain.exponentialRampToValueAtTime(.0001, at + 1.2); pad.nodes.forEach(o => { try { o.stop(at + 1.3); } catch (e) { /* ignore */ } }); pad = null; };
  /* three bright notes falling like light */
  A.sparkle = (at = ctx.currentTime, base = 19) => { [0, -5, -12].forEach((d, i) => A.pluck(base + d, at + i * .11, .55)); };
  return A;
})();
