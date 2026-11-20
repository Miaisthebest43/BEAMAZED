/* ============================================================
   SNACK SYNC 3000 — Site Interactions (Florida Edition)
   ============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- Theme ---------- */
const themeBtn = $('#themeBtn');
const savedTheme = localStorage.getItem('ss3k-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
themeBtn.textContent = document.documentElement.dataset.theme === 'light' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  themeBtn.textContent = next === 'light' ? '☀️' : '🌙';
  localStorage.setItem('ss3k-theme', next);
});

/* ---------- Print ---------- */
$('#printBtn').addEventListener('click', () => {
  toast('Opening print dialog…');
  setTimeout(() => window.print(), 250);
});

/* ---------- Scroll progress + nav highlight + FAB ---------- */
const progressBar = $('#progressBar');
const fabTop = $('#fabTop');
const navLinks = $$('.nav-links a');
const sections = $$('main section');

function onScroll() {
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = pct + '%';
  fabTop.classList.toggle('show', h.scrollTop > 600);

  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 140) current = sec.id;
  });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

fabTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Focus mode (rehearsal dimming) ---------- */
const focusLabel = $('#focusLabel');

function setFocus(char) {
  if (!char || document.body.dataset.focus === char) {
    delete document.body.dataset.focus;
    focusLabel.textContent = 'off';
    $$('.cast-card').forEach(c => c.classList.remove('focused'));
    return;
  }
  document.body.dataset.focus = char;
  focusLabel.textContent = char;
  $$('.cast-card').forEach(c => c.classList.toggle('focused', c.dataset.char === char));
  document.getElementById('script').scrollIntoView({ behavior: 'smooth' });
}

$$('[data-focus]').forEach(btn => {
  btn.addEventListener('click', () => setFocus(btn.dataset.focus));
});

$$('[data-printfocus]').forEach(btn => {
  btn.addEventListener('click', () => {
    setFocus(btn.dataset.printfocus);
    toast(`Printing ${btn.dataset.printfocus}'s part…`);
    setTimeout(() => window.print(), 400);
  });
});

$('#clearFocusBtn').addEventListener('click', () => {
  delete document.body.dataset.focus;
  focusLabel.textContent = 'off';
  $$('.cast-card').forEach(c => c.classList.remove('focused'));
  toast('Everyone visible again 👁️');
});

/* ---------- Copy helpers ---------- */
async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast(msg);
  }
}

$('#copyAllBtn').addEventListener('click', () => {
  const scenes = $$('.scene').map(s => s.innerText.trim()).join('\n\n— — —\n\n');
  copyText('THE SNACK SYNC 3000 — FULL SCRIPT (FLORIDA EDITION)\n\n' + scenes, '📋 Full script copied!');
});

$$('.copy-scene').forEach(btn => {
  btn.addEventListener('click', () => {
    const scene = btn.closest('.scene');
    copyText(scene.innerText.trim(), `📋 ${scene.querySelector('h3').textContent} copied!`);
  });
});

/* ---------- Checklist with persistence ---------- */
const boxes = $$('#checklistList input');
const ring = $('.ring');
const ringPct = $('#ringPct');
const doneCount = $('#doneCount');
$('#totalCount').textContent = boxes.length;

function refreshChecklist() {
  const done = boxes.filter(b => b.checked).length;
  const pct = Math.round(done / boxes.length * 100);
  doneCount.textContent = done;
  ringPct.textContent = pct + '%';
  ring.style.background = `conic-gradient(var(--lime) ${pct}%, var(--line) ${pct}%)`;
}

const savedChecks = JSON.parse(localStorage.getItem('ss3k-checks') || '{}');
boxes.forEach(b => {
  b.checked = !!savedChecks[b.dataset.check];
  b.addEventListener('change', () => {
    const state = {};
    boxes.forEach(x => state[x.dataset.check] = x.checked);
    localStorage.setItem('ss3k-checks', JSON.stringify(state));
    refreshChecklist();
  });
});
refreshChecklist();

/* ---------- Random slogan generator (with Florida bonuses) ---------- */
const slogans = [
  'Snack Sync 3000: study smart, snack hard.',
  "Homework's a bore? Hit the snack drawer!",
  "One problem, one snack. That's the deal.",
  'Snack Sync 3000 — because fractions are better with crackers.',
  "Don't study hungry. Don't study sad. Study SNACK.",
  "DING! That's the sound of good grades.",
  'Snack Sync 3000: turning sighs into snacks since today.',
  'Get it done. Get a snack. Get the Snack Sync 3000.',
  "For the student who'd rather eat than do algebra.",
  "Life's too short for boring homework. Snack it up!",
  'Snack Sync 3000: banned in Florida, beloved everywhere else.',
  "Alligators hate it. Florida Man fears it. Students love it.",
  'Snack Sync 3000: the only thing not allowed in Florida.',
  "We can't ship to Florida, but we CAN ship to your desk."
];

$('#sloganBtn').addEventListener('click', () => {
  const out = $('#sloganOut');
  let next = out.textContent;
  while (next === out.textContent) next = slogans[Math.floor(Math.random() * slogans.length)];
  out.textContent = next;
  out.animate(
    [{ transform: 'scale(.94)', opacity: .4 }, { transform: 'scale(1)', opacity: 1 }],
    { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1.4)' }
  );
});

/* ============================================================
   BEAT PLAYER (Web Audio API — no files needed)
   ============================================================ */
let audioCtx = null;
let beatTimer = null;
let beatIndex = 0;
let playing = false;

const BPM = 112;
const BEAT_MS = 60000 / BPM;
const jingleLines = $$('#jingleStage .jl');
const beatDots = $$('#beatDots i');

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playClick(strong) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = strong ? 'square' : 'triangle';
  osc.frequency.setValueAtTime(strong ? 1400 : 880, t);
  osc.frequency.exponentialRampToValueAtTime(strong ? 500 : 320, t + 0.05);
  gain.gain.setValueAtTime(strong ? 0.24 : 0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.09);

  if (strong) {
    const noise = audioCtx.createBufferSource();
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.06, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
    }
    noise.buffer = buf;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.18, t);
    noise.connect(ng).connect(audioCtx.destination);
    noise.start(t);
  }
}

function tick() {
  const isDownbeat = beatIndex % 4 === 0;
  playClick(isDownbeat);

  const dot = beatIndex % 4;
  beatDots.forEach((d, i) => d.classList.toggle('on', i === dot));

  if (isDownbeat) {
    const lineIdx = Math.floor(beatIndex / 4) % jingleLines.length;
    jingleLines.forEach((l, i) => l.classList.toggle('active', i === lineIdx));
    const active = jingleLines[lineIdx];
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  beatIndex++;
}

function startBeat() {
  initAudio();
  playing = true;
  beatIndex = 0;
  beatTimer = setInterval(tick, BEAT_MS);
  $('#beatBtn').textContent = '⏸️ Stop the Beat';
  $('#beatBtn').classList.add('playing');
  tick();
}

function stopBeat() {
  playing = false;
  clearInterval(beatTimer);
  beatTimer = null;
  beatIndex = 0;
  $('#beatBtn').textContent = '▶️ Play the Beat';
  $('#beatBtn').classList.remove('playing');
  beatDots.forEach(d => d.classList.remove('on'));
  jingleLines.forEach(l => l.classList.remove('active'));
}

$('#beatBtn').addEventListener('click', () => playing ? stopBeat() : startBeat());
$('#jingleHeroBtn').addEventListener('click', () => {
  document.getElementById('jingle').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => { if (!playing) startBeat(); }, 700);
});

/* ---------- Read the jingle aloud ---------- */
$('#speakBtn').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {
    toast("Sorry — your browser can't speak. Sing it yourself! 🎤");
    return;
  }
  window.speechSynthesis.cancel();
  jingleLines.forEach((line, i) => {
    const utter = new SpeechSynthesisUtterance(line.textContent.replace(/[🎵🔔]/g, '').trim());
    utter.rate = 0.92;
    utter.pitch = i >= 4 ? 1.35 : 1.05;
    utter.volume = 1;
    utter.onstart = () => {
      jingleLines.forEach(l => l.classList.remove('active'));
      line.classList.add('active');
    };
    utter.onend = () => line.classList.remove('active');
    window.speechSynthesis.speak(utter);
  });
  toast('🗣️ Reading the jingle…');
});

/* ---------- Keyboard shortcuts ---------- */
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;
  if (e.key === 'p' || e.key === 'P') { if (!e.metaKey && !e.ctrlKey) { window.print(); } }
  if (e.key === 'Escape') {
    delete document.body.dataset.focus;
    focusLabel.textContent = 'off';
    $$('.cast-card').forEach(c => c.classList.remove('focused'));
  }
});

/* ---------- Console easter egg ---------- */
console.log('%c🍪 SNACK SYNC 3000','font-size:20px;font-weight:900;color:#ffb020');
console.log('%cStudy smart. Snack hard.','color:#39e6ff;font-size:12px');
console.log('%c🌴 NOT AVAILABLE IN FLORIDA. 🌴','color:#ff3d68;font-size:13px;font-weight:700');