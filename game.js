const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const UI = id => document.getElementById(id);

const W = 390;
const H = 780;
const GROUND = 650;
const PLAYER_X = 95;
const PLAYER_SIZE = 30;
const GRAVITY = 1540;
const JUMP_VELOCITY = -570;

let state = 'menu';
let paused = false;
let practice = false;
let levelIndex = 0;
let last = 0;
let camera = 0;
let attempt = 0;
let checkpoint = 0;
let deathFlash = 0;
let shake = 0;

let save = JSON.parse(localStorage.getItem('onemore-save') || '{"attempts":0,"gems":0,"best":{},"unlocked":1,"sound":true}');

const S = (x, count = 1, y = GROUND) => ({ kind: 'spikes', x, count, top: y });
const B = (x, w = 62, h = 72) => ({ kind: 'block', x, w, h });
const P = (x, w, h) => ({ kind: 'platform', x, w, h });
const G = (x, w) => ({ kind: 'gap', x, w });
const M = (x, label) => ({ kind: 'marker', x, label });

const levels = [
  {
    name: 'FIRST LIGHT',
    speed: 300,
    length: 4300,
    accent: '#28b6ff',
    map: [
      M(260, 'WAKE UP'),
      S(430),
      S(660, 2),
      G(930, 95),
      S(1125),
      B(1320, 64, 68),
      S(1535, 2),
      P(1785, 160, 58),
      S(1835, 1, GROUND - 58),
      G(2050, 110),
      S(2265, 3),
      B(2535, 70, 88),
      S(2735),
      S(2860, 2),
      P(3115, 155, 82),
      S(3180, 1, GROUND - 82),
      G(3370, 125),
      S(3585, 2),
      B(3825, 72, 92),
      S(4040, 3)
    ]
  },
  {
    name: 'HOT WIRE',
    speed: 325,
    length: 4700,
    accent: '#ff8b18',
    map: [
      S(350, 2), G(610, 105), S(820), B(1010, 64, 82),
      S(1225, 3), P(1490, 145, 72), S(1540, 1, GROUND - 72),
      G(1720, 130), S(1935, 2), B(2140, 68, 100), S(2360),
      P(2550, 125, 52), S(2600, 2, GROUND - 52), G(2790, 120),
      S(3040, 3), B(3280, 74, 110), S(3495, 2), G(3720, 135),
      P(3950, 180, 88), S(4010, 2, GROUND - 88), S(4300, 3), S(4520)
    ]
  },
  {
    name: 'AFTERIMAGE',
    speed: 345,
    length: 5050,
    accent: '#8f6cff',
    map: [
      S(330), S(510, 2), G(760, 115), B(970, 68, 88), S(1180, 3),
      P(1420, 130, 65), S(1460, 1, GROUND - 65), G(1650, 135),
      S(1890, 2), B(2080, 74, 105), S(2290), S(2420, 2),
      G(2680, 145), P(2910, 155, 92), S(2965, 2, GROUND - 92),
      B(3250, 70, 76), S(3460, 3), G(3710, 150), S(3925),
      P(4120, 165, 72), S(4180, 2, GROUND - 72), S(4460, 3),
      G(4675, 125), S(4900, 2)
    ]
  },
  {
    name: 'REDLINE',
    speed: 365,
    length: 5350,
    accent: '#ff3d63',
    map: [
      S(310, 2), G(545, 115), S(750, 2), B(940, 70, 92), S(1150, 3),
      G(1390, 135), P(1605, 150, 85), S(1660, 2, GROUND - 85),
      S(1910), B(2070, 68, 110), G(2290, 150), S(2520, 3),
      P(2780, 130, 62), S(2825, 1, GROUND - 62), B(3070, 76, 95),
      S(3300, 2), G(3515, 145), S(3735, 3), P(3970, 165, 95),
      S(4025, 2, GROUND - 95), G(4260, 155), S(4480), B(4635, 72, 115),
      S(4860, 3), G(5090, 125)
    ]
  },
  {
    name: 'NO SIGNAL',
    speed: 385,
    length: 5700,
    accent: '#35e0a1',
    map: [
      S(300), G(475, 105), S(670, 3), B(900, 74, 105), G(1120, 130),
      P(1330, 130, 75), S(1370, 2, GROUND - 75), S(1600, 2),
      B(1800, 68, 120), G(2020, 155), S(2250, 3), P(2490, 165, 92),
      S(2550, 2, GROUND - 92), G(2790, 145), B(3010, 74, 100),
      S(3230, 3), S(3440), G(3590, 160), P(3840, 145, 72),
      S(3885, 2, GROUND - 72), B(4140, 76, 115), S(4380, 3),
      G(4620, 155), S(4860, 2), P(5060, 160, 96), S(5125, 2, GROUND - 96),
      S(5410, 3)
    ]
  },
  {
    name: 'ONE MORE',
    speed: 405,
    length: 6200,
    accent: '#ffd34d',
    map: [
      S(285, 2), G(500, 115), S(700, 3), B(920, 74, 110), S(1140),
      G(1300, 145), P(1520, 145, 90), S(1570, 2, GROUND - 90),
      S(1810, 3), B(2050, 74, 120), G(2270, 165), S(2510, 3),
      P(2745, 125, 65), S(2790, 2, GROUND - 65), B(3040, 78, 105),
      S(3270, 3), G(3500, 170), P(3750, 170, 105), S(3810, 2, GROUND - 105),
      G(4040, 150), S(4270, 3), B(4490, 82, 125), S(4740, 2),
      G(4940, 170), P(5190, 150, 88), S(5245, 2, GROUND - 88),
      B(5480, 76, 115), S(5720, 3), G(5935, 140)
    ]
  }
];

let p = freshPlayer();

function freshPlayer() {
  return { x: PLAYER_X, y: GROUND - PLAYER_SIZE, w: PLAYER_SIZE, h: PLAYER_SIZE, vy: 0, rot: 0, onGround: true, alive: true };
}

function persist() {
  localStorage.setItem('onemore-save', JSON.stringify(save));
  updateStats();
}

function updateStats() {
  UI('attemptStat').textContent = save.attempts;
  UI('gemStat').textContent = save.gems;
  UI('bestStat').textContent = Math.max(0, ...Object.values(save.best || {})) + '%';
  UI('soundBtn').textContent = 'SOUND: ' + (save.sound ? 'ON' : 'OFF');
}

function screen(id) {
  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  if (id) UI(id).classList.add('active');
}

function toast(text) {
  UI('toast').textContent = text;
  UI('toast').classList.add('show');
  setTimeout(() => UI('toast').classList.remove('show'), 950);
}

function reset(fromCheckpoint = false) {
  camera = fromCheckpoint ? checkpoint : 0;
  p = freshPlayer();
  attempt++;
  save.attempts++;
  persist();
  UI('attemptHud').textContent = attempt;
  paused = false;
  deathFlash = 0;
  shake = 0;
  state = 'playing';
  screen(null);
  UI('hud').classList.remove('hidden');
  tone(235, .025);
}

function start(i = levelIndex, isPractice = false) {
  levelIndex = i;
  practice = isPractice;
  attempt = 0;
  checkpoint = 0;
  reset(false);
}

function jump() {
  if (state !== 'playing' || paused || !p.alive) return;
  if (p.onGround) {
    p.vy = JUMP_VELOCITY;
    p.onGround = false;
    tone(560, .04);
  }
}

function tone(freq, dur) {
  if (!save.sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    window._ac = window._ac || new Audio();
    const o = _ac.createOscillator();
    const g = _ac.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.value = .025;
    o.connect(g);
    g.connect(_ac.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(.0001, _ac.currentTime + dur);
    o.stop(_ac.currentTime + dur);
  } catch (e) {}
}

function worldPlayerX() {
  return camera + p.x + p.w / 2;
}

function rectFor(item) {
  if (item.kind === 'block' || item.kind === 'platform') {
    return { x: item.x - camera, y: GROUND - item.h, w: item.w, h: item.h, kind: item.kind };
  }
  return null;
}

function spikeRects(item) {
  const width = 32;
  const topY = item.top - 34;
  return Array.from({ length: item.count }, (_, i) => ({
    x: item.x + i * width - camera,
    y: topY,
    w: width,
    h: 34,
    kind: 'spike'
  }));
}

function hit(a, b) {
  const pad = 5;
  return a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h - pad &&
    a.y + a.h - pad > b.y + pad;
}

function horizontalOverlap(a, b, pad = 5) {
  return a.x + a.w - pad > b.x + pad && a.x + pad < b.x + b.w - pad;
}

function canLand(a, b, previousBottom) {
  const tolerance = 10;
  return a.vy >= 0 && horizontalOverlap(a, b) && previousBottom <= b.y + tolerance && a.y + a.h >= b.y;
}

function settleRotation() {
  p.rot = Math.round(p.rot / (Math.PI / 2)) * (Math.PI / 2);
}

function isOverGap(worldX) {
  const gaps = levels[levelIndex].map.filter(item => item.kind === 'gap');
  return gaps.some(gap => worldX > gap.x && worldX < gap.x + gap.w);
}

function die() {
  if (!p.alive) return;
  p.alive = false;
  deathFlash = 1;
  shake = 10;
  tone(85, .12);
  const progress = Math.floor(camera / levels[levelIndex].length * 100);
  save.best[levelIndex] = Math.max(save.best[levelIndex] || 0, progress);
  persist();
  setTimeout(() => {
    if (state === 'playing') reset(practice && checkpoint > 0);
  }, 270);
}

function finish() {
  state = 'finish';
  UI('hud').classList.add('hidden');
  save.best[levelIndex] = 100;
  save.gems += 10;
  save.unlocked = Math.max(save.unlocked, Math.min(levels.length, levelIndex + 2));
  persist();
  tone(790, .16);
  UI('finishTitle').textContent = levels[levelIndex].name;
  UI('finishStats').textContent = `100% · +10 GEMS · ${attempt} ATTEMPT${attempt === 1 ? '' : 'S'}`;
  UI('nextBtn').style.display = levelIndex < levels.length - 1 ? 'block' : 'none';
  screen('finishScreen');
}

function update(dt) {
  if (state !== 'playing' || paused || !p.alive) return;

  const L = levels[levelIndex];
  const previousBottom = p.y + p.h;
  const previousWorldX = worldPlayerX();

  camera += L.speed * dt;
  p.vy += GRAVITY * dt;
  p.y += p.vy * dt;
  p.rot += dt * (7 + levelIndex * .45);
  p.onGround = false;

  let landed = false;

  for (const item of L.map) {
    if (item.kind !== 'block' && item.kind !== 'platform') continue;
    const r = rectFor(item);
    if (r.x < -120 || r.x > W + 120) continue;

    if (canLand(p, r, previousBottom)) {
      p.y = r.y - p.h;
      p.vy = 0;
      p.onGround = true;
      landed = true;
      settleRotation();
      break;
    }

    if (hit(p, r)) {
      die();
      return;
    }
  }

  const nowWorldX = worldPlayerX();
  const crossedGapEdge = previousWorldX !== nowWorldX;
  if (!landed && p.y + p.h >= GROUND) {
    if (!isOverGap(nowWorldX)) {
      p.y = GROUND - p.h;
      p.vy = 0;
      p.onGround = true;
      settleRotation();
    } else if (crossedGapEdge) {
      p.onGround = false;
    }
  }

  for (const item of L.map) {
    if (item.kind !== 'spikes') continue;
    for (const r of spikeRects(item)) {
      if (r.x < -80 || r.x > W + 80) continue;
      if (hit(p, r)) {
        die();
        return;
      }
    }
  }

  if (p.y > H + 50) {
    die();
    return;
  }

  if (practice && p.onGround && camera > checkpoint + 850 && camera < L.length - 650) {
    const worldX = worldPlayerX();
    const dangerNearby = L.map.some(item => {
      if (item.kind === 'gap') return worldX > item.x - 80 && worldX < item.x + item.w + 80;
      if (item.kind === 'spikes') return worldX > item.x - 95 && worldX < item.x + item.count * 32 + 95;
      if (item.kind === 'block' || item.kind === 'platform') return worldX > item.x - 70 && worldX < item.x + item.w + 70;
      return false;
    });
    if (!dangerNearby) {
      checkpoint = Math.max(0, camera - 25);
      toast('CHECKPOINT');
    }
  }

  if (camera >= L.length) {
    finish();
    return;
  }

  const pct = Math.min(100, Math.floor(camera / L.length * 100));
  UI('progressHud').textContent = pct + '%';
  UI('progressBar').style.width = pct + '%';

  deathFlash = Math.max(0, deathFlash - dt * 6);
  shake = Math.max(0, shake - dt * 40);
}

function drawBg(L) {
  ctx.fillStyle = '#030811';
  ctx.fillRect(0, 0, W, H);

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#071426');
  g.addColorStop(1, '#02050a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = .12;
  for (let i = 0; i < 10; i++) {
    const x = i * 62 - (camera * .08) % 62;
    const height = 120 + (i % 4) * 55;
    ctx.fillStyle = i % 2 ? L.accent : '#173556';
    ctx.fillRect(x, GROUND - height - 70, 20 + (i % 3) * 12, height);
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 30; i++) {
    const x = i * 83 - (camera * .22) % 83;
    const y = 180 + (i * 47) % 360;
    ctx.fillStyle = i % 4 ? '#15314d' : L.accent;
    ctx.fillRect(x, y, 3, 3);
  }
}

function drawSpike(x, y, w = 32, h = 34) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fillStyle = '#f7fbff';
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#9edcff';
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGround(L) {
  const gaps = L.map.filter(item => item.kind === 'gap');
  const visibleStart = camera - 20;
  const visibleEnd = camera + W + 20;
  let cursor = visibleStart;

  const visibleGaps = gaps
    .filter(g => g.x + g.w > visibleStart && g.x < visibleEnd)
    .sort((a, b) => a.x - b.x);

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#aee7ff';
  ctx.shadowBlur = 12;
  ctx.shadowColor = L.accent;

  for (const gap of visibleGaps) {
    const gx1 = Math.max(gap.x, visibleStart);
    if (gx1 > cursor) {
      ctx.beginPath();
      ctx.moveTo(cursor - camera, GROUND);
      ctx.lineTo(gx1 - camera, GROUND);
      ctx.stroke();
    }
    cursor = Math.max(cursor, gap.x + gap.w);

    const sx = gap.x - camera;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00030a';
    ctx.fillRect(sx, GROUND, gap.w, H - GROUND);
    ctx.fillStyle = L.accent;
    ctx.globalAlpha = .18;
    ctx.fillRect(sx, GROUND + 1, 3, H - GROUND);
    ctx.fillRect(sx + gap.w - 3, GROUND + 1, 3, H - GROUND);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 12;
  }

  if (cursor < visibleEnd) {
    ctx.beginPath();
    ctx.moveTo(cursor - camera, GROUND);
    ctx.lineTo(visibleEnd - camera, GROUND);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawMap(L) {
  for (const item of L.map) {
    if (item.kind === 'spikes') {
      for (const r of spikeRects(item)) {
        if (r.x < -80 || r.x > W + 80) continue;
        drawSpike(r.x, r.y, r.w, r.h);
      }
      continue;
    }

    if (item.kind === 'block' || item.kind === 'platform') {
      const r = rectFor(item);
      if (r.x < -140 || r.x > W + 140) continue;
      ctx.strokeStyle = '#f5fbff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = L.accent;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = '#08121e';
      ctx.fillRect(r.x + 3, r.y + 3, r.w - 6, r.h - 6);
      ctx.fillStyle = L.accent;
      ctx.fillRect(r.x, r.y, r.w, 5);
      ctx.shadowBlur = 0;
      continue;
    }

    if (item.kind === 'marker') {
      const x = item.x - camera;
      if (x < -100 || x > W + 100) continue;
      ctx.save();
      ctx.globalAlpha = .55;
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.fillStyle = L.accent;
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x, 250);
      ctx.strokeStyle = L.accent;
      ctx.setLineDash([4, 7]);
      ctx.beginPath();
      ctx.moveTo(x, 270);
      ctx.lineTo(x, GROUND - 18);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawPlayer(L) {
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.rotate(p.rot);
  ctx.fillStyle = '#fff';
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#33bfff';
  ctx.fillRect(-15, -15, 30, 30);
  ctx.fillStyle = L.accent;
  ctx.fillRect(-6, -6, 12, 12);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function draw() {
  const L = levels[levelIndex] || levels[0];
  ctx.save();

  if (shake > 0) {
    ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
  }

  drawBg(L);
  drawGround(L);

  if (state === 'playing' || state === 'finish') {
    drawMap(L);
    drawPlayer(L);

    if (practice && checkpoint) {
      const cx = checkpoint - camera + PLAYER_X;
      ctx.strokeStyle = '#ff8b18';
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, 220);
      ctx.lineTo(cx, GROUND);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  if (deathFlash > 0) {
    ctx.globalAlpha = deathFlash * .28;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function loop(ts) {
  const dt = Math.min(.028, (ts - last) / 1000 || 0);
  last = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function buildLevels() {
  const grid = UI('levelGrid');
  grid.innerHTML = '';
  levels.forEach((L, i) => {
    const b = document.createElement('button');
    b.className = 'level-card';
    b.disabled = i >= save.unlocked;
    b.innerHTML = `<b>${String(i + 1).padStart(2, '0')} · ${L.name}</b><small>${i < save.unlocked ? (save.best[i] || 0) + '% BEST · ${L.speed} SPEED' : 'LOCKED'}</small>`;
    b.onclick = () => start(i, false);
    grid.appendChild(b);
  });
}

UI('playBtn').onclick = () => start(Math.min(save.unlocked - 1, levels.length - 1), false);
UI('practiceBtn').onclick = () => start(Math.min(save.unlocked - 1, levels.length - 1), true);
UI('levelsBtn').onclick = () => { buildLevels(); screen('levelScreen'); };
document.querySelector('[data-back]').onclick = () => screen('menu');
UI('soundBtn').onclick = () => { save.sound = !save.sound; persist(); };
UI('pauseBtn').onclick = () => { paused = true; screen('pauseScreen'); };
UI('resumeBtn').onclick = () => { paused = false; screen(null); };
UI('restartBtn').onclick = () => reset(false);
UI('menuBtn').onclick = () => { state = 'menu'; UI('hud').classList.add('hidden'); screen('menu'); };
UI('finishMenuBtn').onclick = UI('menuBtn').onclick;
UI('replayBtn').onclick = () => start(levelIndex, practice);
UI('nextBtn').onclick = () => start(Math.min(levelIndex + 1, levels.length - 1), false);

canvas.addEventListener('pointerdown', jump);
document.addEventListener('keydown', e => {
  if (['Space', 'ArrowUp'].includes(e.code)) {
    e.preventDefault();
    jump();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'playing') {
    paused = true;
    screen('pauseScreen');
  }
});

updateStats();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
