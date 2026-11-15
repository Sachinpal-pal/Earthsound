// ============================================================
// EarthSound v2
// Each image has a "mode" (profile). A profile says:
//   1) how pixel colours are grouped into classes   (classify)
//   2) what each class is called                     (names)
//   3) what each class sounds like                   (voices)
// Imagery: NASA Scientific Visualization Studio (see credits in README)
// ============================================================

// ---------- Config ----------
const COLS = 60;                       // scan columns
const BASE = 130.81;                   // C3
const SCALES = { pentatonic:[0,2,4,7,9], major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10] };

// ---------- Colour helper ----------
function hsv(R, G, B){                 // returns [hue 0-360, saturation 0-1, value 0-255]
  const mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn;
  let h = 0;
  if (d){
    if (mx === R) h = ((G - B) / d) % 6;
    else if (mx === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, mx ? d / mx : 0, mx];
}

// ---------- Sonification profiles ----------
// voice types: drone, wind, notes, soft, crackle, blip, chime
// voice options: p = 'y' (higher in image = higher pitch) or a number 0..1 (fixed pitch)
//                min = smallest fraction of the column that triggers it
//                boost = makes rare classes louder
const PROFILES = {

  // Forest height and general Earth maps
  earth: {
    classify(R, G, B){
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), br = (R + G + B) / 3;
      if (br < 28) return 'space';
      if (mx > 170 && mx - mn < 45) return 'cloud';
      if (R > 170 && G < 150 && B < 120 && R - G > 50) return 'hot';
      if (G > R + 8 && G >= B) return 'veg';
      if (B > R + 10 && B >= G - 10) return 'water';
      return 'land';
    },
    names:  { water:'ocean', veg:'vegetation', cloud:'cloud or ice', land:'land', hot:'hot spots' },
    voices: { water:{t:'drone'}, veg:{t:'notes', p:'y'}, cloud:{t:'wind'}, land:{t:'soft', p:'y'}, hot:{t:'crackle', min:.005} },
    legend: [['#3b82f6','Ocean: deep drone'], ['#22c55e','Vegetation: notes (higher in image = higher pitch)'],
             ['#e5e7eb','Cloud or ice: airy wind'], ['#b8864b','Land: soft low notes'], ['#ff7a45','Hot spots: crackle']]
  },

  // Carbon dioxide (brown haze, orange plumes, snow)
  plume: {
    classify(R, G, B){
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), br = (R + G + B) / 3;
      if (br < 28) return 'space';
      if (mx > 170 && mx - mn < 45) return 'snow';
      if (R > 170 && R - B > 110 && G < R - 35) return 'plume';
      return 'haze';
    },
    names:  { haze:'brown haze', snow:'snow and cloud', plume:'dense orange plumes' },
    voices: { haze:{t:'drone'}, snow:{t:'wind', min:.02}, plume:{t:'crackle', min:.005, boost:1.5} },
    legend: [['#a0826d','Brown haze: low drone'], ['#e5e7eb','Snow and cloud: airy wind'], ['#ff7a45','Dense orange plumes: crackle']]
  },

  // Night lights change 2012 to 2023
  lights: {
    classify(R, G, B){
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      if (mx < 55) return 'space';
      if (B > R + 8 && B > G + 12) return 'rise';
      if (R > B + 30 && R >= G - 5) return 'fall';
      if (mx > 150 && mx - mn < 60) return 'steady';
      return 'space';
    },
    names:  { rise:'lights brighter (purple)', fall:'lights dimmer (orange)', steady:'unchanged lights (white)' },
    voices: { rise:{t:'chime', p:'y', min:.002, boost:20}, fall:{t:'notes', p:.12, min:.002, boost:20}, steady:{t:'soft', p:'y', min:.002, boost:20} },
    legend: [['#a78bfa','Purple, brighter since 2012: high chime'], ['#fb923c','Orange, dimmer since 2012: low note'], ['#f1f5f9','White, unchanged: soft note']]
  },

  // Sea surface: colour streaks, each colour range gets its own pitch
  temp: {
    classify(R, G, B){
      const [h, s, v] = hsv(R, G, B);
      if (s < 0.3 || v < 45) return 'none';
      if (h >= 190 && h <= 270) return 'blue';
      if (h >= 80 && h < 190) return 'green';
      if (h >= 28 && h < 80) return 'yellow';
      return 'red';
    },
    names:  { blue:'blue streaks', green:'green streaks', yellow:'yellow and orange streaks', red:'red streaks' },
    voices: { blue:{t:'notes', p:.08, min:.01, boost:3}, green:{t:'notes', p:.3, min:.01, boost:3},
              yellow:{t:'notes', p:.55, min:.01, boost:3}, red:{t:'notes', p:.85, min:.01, boost:3} },
    legend: [['#3b82f6','Blue: lowest note'], ['#22c55e','Green: low-middle note'], ['#facc15','Yellow and orange: high-middle note'], ['#ef4444','Red: highest note']]
  },

  // Aerosols: colour = type of particle
  aerosol: {
    classify(R, G, B){
      const [h, s, v] = hsv(R, G, B);
      if (v < 45) return 'none';
      if (s < 0.25) return v > 140 ? 'bright' : 'none';
      if (h >= 255 && h <= 325 && s > 0.2) return 'purple';
      if (h >= 70 && h <= 175 && s > 0.4) return 'green';
      if ((h < 45 || h > 335) && s > 0.4) return 'orange';
      return 'none';
    },
    names:  { purple:'purple particles', green:'green particles', orange:'orange and red particles', bright:'bright white swirls' },
    voices: { purple:{t:'drone', min:.01, boost:6}, green:{t:'wind', min:.01, boost:2.5},
              orange:{t:'crackle', min:.003, boost:2}, bright:{t:'soft', p:'y', min:.01, boost:3} },
    legend: [['#c084fc','Purple: deep drone'], ['#22c55e','Green: airy wind'], ['#f97316','Orange and red: crackle'], ['#e5e7eb','White: soft notes']]
  },

  // Lightning flashes on a grey globe
  flash: {
    classify(R, G, B){
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), br = (R + G + B) / 3;
      if (R > 190 && G > 150 && B < 120 && R - B > 90) return 'flash';
      if (br < 28) return 'space';
      if (mx > 150 && mx - mn < 40) return 'cloud';
      return 'land';
    },
    names:  { flash:'lightning flashes', cloud:'clouds' },
    voices: { flash:{t:'blip', p:'y', min:.0003}, cloud:{t:'wind', min:.01} },
    legend: [['#facc15','Lightning flash: short percussive blip (higher in image = higher pitch)'], ['#e5e7eb','Clouds: airy wind']]
  }
};

// ---------- Images (put the files inside the images/ folder) ----------
const IMAGES = [
  { file:'images/gedi_forest.jpg', title:'Forest height', mode:'earth',
    desc:'Global map of forest height measured by the GEDI instrument on the International Space Station. Brown and dark green are shorter vegetation, bright green and white are taller.' },
  { file:'images/co2.jpg', title:'Carbon dioxide', mode:'plume',
    desc:'Model of carbon dioxide moving through the atmosphere from January to March 2020, zoomed in on the eastern United States.' },
  { file:'images/night_lights.jpg', title:'Night lights', mode:'lights',
    desc:'Change in night lights across the world between 2012 and 2023. Orange areas lost light and purple areas gained light.' },
  { file:'images/sea_surface.jpg', title:'Sea surface', mode:'temp',
    desc:'Global ocean currents and sea surface temperature, shown as colored streaks.' },
  { file:'images/aerosols.jpg', title:'Aerosols', mode:'aerosol',
    desc:'Smoke, dust and other particles moving through the atmosphere, shown in different colors by type.' },
  { file:'images/lightning.jpg', title:'Lightning', mode:'flash',
    desc:'Lightning flashes detected from space by a sensor on the International Space Station.' },
];

// ---------- State ----------
const $ = id => document.getElementById(id);
const cv = $('stage'), g = cv.getContext('2d');
const off = document.createElement('canvas');          // clean copy of the image for analysis
const og = off.getContext('2d', { willReadFrequently:true });
let img = null, meta = null, prof = PROFILES.earth;
let col = 0, timer = null, playing = false, stepMs = 260, lastText = '';
let A = null;                                          // audio nodes

// ---------- Image loading ----------
function setLegend(){
  const ul = document.querySelector('.legend');
  if (!ul) return;
  ul.innerHTML = '';
  prof.legend.forEach(([color, text]) => {
    const li = document.createElement('li');
    const dot = document.createElement('i'); dot.style.background = color;
    li.appendChild(dot); li.appendChild(document.createTextNode(' ' + text));
    ul.appendChild(li);
  });
}
function loadSrc(src, m){
  const im = new Image();
  im.onload = () => {
    img = im; meta = m;
    prof = PROFILES[m.mode] || PROFILES.earth;
    setLegend();
    const s = Math.min(1, 1400 / im.naturalWidth);
    cv.width = off.width = Math.round(im.naturalWidth * s);
    cv.height = off.height = Math.round(im.naturalHeight * s);
    og.drawImage(im, 0, 0, off.width, off.height);
    col = 0; draw(-1);
    $('empty').hidden = true;
    $('imgDesc').textContent = m.desc || '';
    $('readout').textContent = 'Image loaded. Press Play.';
  };
  im.onerror = () => { $('readout').textContent = 'Could not load this image.'; };
  im.src = src;
}
function draw(c){
  g.drawImage(off, 0, 0);
  if (c < 0) return;
  const w = cv.width / COLS, x = c * w;
  g.fillStyle = 'rgba(60,255,214,.22)'; g.fillRect(x, 0, w, cv.height);
  g.fillStyle = 'rgba(60,255,214,.95)'; g.fillRect(x + w/2 - 1.5, 0, 3, cv.height);
}

// ---------- Analysis ----------
function analyze(c){
  const w = Math.floor(off.width / COLS), h = off.height;
  const d = og.getImageData(c * w, 0, w, h).data;
  const n = {}, ys = {};
  let total = 0;
  for (let y = 0; y < h; y += 2){
    for (let x = 0; x < w; x += 2){
      const i = (y * w + x) * 4;
      const k = prof.classify(d[i], d[i+1], d[i+2]);
      n[k] = (n[k] || 0) + 1;
      ys[k] = (ys[k] || 0) + y;
      total++;
    }
  }
  const frac = {}, yAvg = {};
  for (const k in n){ frac[k] = n[k] / total; yAvg[k] = ys[k] / n[k] / h; }
  return { frac, yAvg };
}
function describe(res){
  const parts = [];
  for (const k in prof.voices){
    const f = res.frac[k] || 0, min = prof.voices[k].min ?? 0.03;
    if (f >= Math.max(min, 0.0005)) parts.push([k, f]);
  }
  parts.sort((a, b) => b[1] - a[1]);
  const txt = parts.slice(0, 3).map(([k, f]) => `${prof.names[k]} ${f < 0.01 ? '<1' : Math.round(f * 100)}%`);
  return `Column ${col + 1} of ${COLS}: ${txt.join(', ') || 'quiet here (mostly dark)'}.`;
}

// ---------- Audio (Web Audio API) ----------
function initAudio(){
  if (A){ if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = +$('vol').value;
  const an = ctx.createAnalyser(); an.fftSize = 256;
  // compressor keeps stacked notes and crackles from clipping (distortion)
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 6;
  comp.attack.value = .003; comp.release.value = .25;
  master.connect(comp); comp.connect(an); an.connect(ctx.destination);

  const drone = ctx.createGain(); drone.gain.value = 0; drone.connect(master);
  [[65.41,.5],[98,.3],[130.81,.2]].forEach(([f,a]) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const gg = ctx.createGain(); gg.gain.value = a;
    o.connect(gg); gg.connect(drone); o.start();
  });

  const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const dd = nb.getChannelData(0);
  for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;

  const wind = ctx.createBufferSource(); wind.buffer = nb; wind.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = .6;
  const windG = ctx.createGain(); windG.gain.value = 0;
  wind.connect(bp); bp.connect(windG); windG.connect(master); wind.start();

  A = { ctx, master, an, drone, windG, nb };
  drawViz();
}
function freqFor(pos){                 // pos: 0 (low) .. 1 (high), snapped to the chosen scale
  const sc = SCALES[$('scale').value], steps = sc.length * 3;
  const k = Math.max(0, Math.min(steps - 1, Math.floor(pos * steps)));
  return BASE * Math.pow(2, (sc[k % sc.length] + 12 * Math.floor(k / sc.length)) / 12);
}
function note(freq, vol, type, dur){
  const { ctx, master } = A, t = ctx.currentTime;
  const o = ctx.createOscillator(), gn = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  gn.gain.setValueAtTime(0, t);
  gn.gain.linearRampToValueAtTime(vol, t + .02);
  gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + .05);
}
function crackle(vol){
  const { ctx, master, nb } = A, t = ctx.currentTime;
  const s = ctx.createBufferSource(); s.buffer = nb;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
  const gn = ctx.createGain(); gn.gain.value = vol;
  s.connect(hp); hp.connect(gn); gn.connect(master);
  s.start(t, Math.random() * 1.5, .04);
}
function sonify(res){
  const t = A.ctx.currentTime;
  let drone = 0, wind = 0;
  for (const k in prof.voices){
    const v = prof.voices[k], f = res.frac[k] || 0, min = v.min ?? 0.04, boost = v.boost || 1;
    if (f < min) continue;
    const pos = v.p === 'y' ? 1 - (res.yAvg[k] ?? 0.5) : (typeof v.p === 'number' ? v.p : 0.5);
    if (v.t === 'drone') drone = Math.max(drone, Math.min(.4, f * .35 * boost));
    else if (v.t === 'wind') wind = Math.max(wind, Math.min(.3, f * .25 * boost));
    else if (v.t === 'notes') note(freqFor(pos), Math.min(.35, f * .5 * boost + .08), 'triangle', .5);
    else if (v.t === 'soft'){ if (col % 2 === 0) note(freqFor(pos * .4 + .1), Math.min(.3, f * .25 * boost + .05), 'sine', .7); }
    else if (v.t === 'chime') note(freqFor(pos) * 2, Math.min(.3, f * .5 * boost + .1), 'sine', .9);
    else if (v.t === 'crackle'){
      const n = Math.min(6, Math.ceil(f * 40 * boost));
      for (let i = 0; i < n; i++) setTimeout(() => crackle(.12), Math.random() * stepMs * .8);
    }
    else if (v.t === 'blip'){
      const n = Math.min(6, Math.ceil(f * 300 * boost));
      for (let i = 0; i < n; i++){
        const fr = freqFor(Math.min(1, pos + Math.random() * .1)) * 2;
        setTimeout(() => note(fr, .22, 'sine', .12), Math.random() * stepMs * .8);
      }
    }
  }
  A.drone.gain.setTargetAtTime(drone, t, .1);
  A.windG.gain.setTargetAtTime(wind, t, .1);
}
function fadeOut(){
  if (!A) return;
  const t = A.ctx.currentTime;
  A.drone.gain.setTargetAtTime(0, t, .1);
  A.windG.gain.setTargetAtTime(0, t, .1);
}
function drawViz(){
  const c = $('viz'), x = c.getContext('2d'), buf = new Uint8Array(A.an.frequencyBinCount);
  (function loop(){
    A.an.getByteFrequencyData(buf);
    x.clearRect(0, 0, c.width, c.height);
    const bw = c.width / buf.length;
    for (let i = 0; i < buf.length; i++){
      const h = buf[i] / 255 * c.height;
      x.fillStyle = `hsl(${170 + i * 1.2},90%,60%)`;
      x.fillRect(i * bw, c.height - h, bw - 1, h);
    }
    requestAnimationFrame(loop);
  })();
}

// ---------- Playback ----------
function step(){
  const res = analyze(col);
  lastText = describe(res);
  draw(col); sonify(res);
  $('readout').textContent = lastText;
  col = (col + 1) % COLS;
}
function play(){
  if (!img || playing) return;
  initAudio();
  playing = true;
  $('play').innerHTML = '&#10074;&#10074; Pause';
  $('play').setAttribute('aria-pressed', 'true');
  stepMs = Math.max(70, 260 / +$('speed').value);
  timer = setInterval(step, stepMs);
}
function pause(){
  clearInterval(timer); playing = false;
  $('play').innerHTML = '&#9654; Play';
  $('play').setAttribute('aria-pressed', 'false');
  fadeOut();
}
function stop(){ pause(); col = 0; if (img) draw(-1); $('readout').textContent = 'Stopped.'; }
function seek(dir){
  if (!img || playing) return;
  initAudio();
  const target = (col + dir + COLS) % COLS;
  col = target; step(); col = target;
  setTimeout(fadeOut, 350);
}
function say(){
  const txt = ((meta && meta.desc) || '') + ' ' + lastText;
  if (!txt.trim() || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
}

// ---------- UI wiring ----------
IMAGES.forEach((m, i) => {
  const o = document.createElement('option'); o.value = i; o.textContent = m.title; $('pick').appendChild(o);
});
$('pick').onchange = e => { const m = IMAGES[e.target.value]; if (m){ stop(); loadSrc(m.file, m); } };
$('upload').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  stop(); loadSrc(URL.createObjectURL(f), { title: f.name, mode:'earth', desc: 'Image uploaded by the user.' });
};
$('play').onclick = () => playing ? pause() : play();
$('stop').onclick = stop;
$('say').onclick = say;
$('speed').oninput = e => {
  $('speedOut').textContent = (+e.target.value).toFixed(1) + 'x';
  if (playing){ clearInterval(timer); stepMs = Math.max(70, 260 / +e.target.value); timer = setInterval(step, stepMs); }
};
$('vol').oninput = e => { if (A) A.master.gain.value = +e.target.value; };
$('contrastBtn').onclick = e => {
  const on = document.body.classList.toggle('hc');
  e.target.setAttribute('aria-pressed', on);
};
$('helpBtn').onclick = () => $('help').showModal();
$('closeHelp').onclick = () => $('help').close();

document.addEventListener('keydown', e => {
  if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
  if (e.code === 'Space' && e.target.tagName !== 'BUTTON'){ e.preventDefault(); playing ? pause() : play(); }
  else if (e.key === 'ArrowRight') seek(1);
  else if (e.key === 'ArrowLeft') seek(-1);
  else if (e.key.toLowerCase() === 'd') say();
  else if (e.key === '?') $('help').showModal();
});

setLegend();
if (IMAGES.length) loadSrc(IMAGES[0].file, IMAGES[0]);