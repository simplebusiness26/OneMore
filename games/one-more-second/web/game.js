(() => {
  'use strict';

  const ROUND_MS = 1000;
  const PREVIEW_MS = 240;
  const STORAGE_KEY = 'oneMoreSecond.best.v1';

  const $ = (id) => document.getElementById(id);
  const app = $('app');
  const startCard = $('startCard');
  const challenge = $('challenge');
  const gameOver = $('gameOver');
  const pauseCard = $('pauseCard');
  const startButton = $('startButton');
  const restartButton = $('restartButton');
  const pauseButton = $('pauseButton');
  const resumeButton = $('resumeButton');
  const scoreEl = $('score');
  const bestScoreEl = $('bestScore');
  const streakEl = $('streak');
  const difficultyLabel = $('difficultyLabel');
  const timerRing = $('timerRing');
  const timerNumber = $('timerNumber');
  const promptEl = $('challengePrompt');
  const kickerEl = $('challengeKicker');
  const helpEl = $('challengeHelp');
  const stage = $('challengeStage');
  const failReason = $('failReason');
  const finalScore = $('finalScore');
  const newBest = $('newBest');

  const state = {
    running: false,
    paused: false,
    score: 0,
    best: Number(localStorage.getItem(STORAGE_KEY) || 0),
    roundToken: 0,
    roundStart: 0,
    roundTimer: 0,
    animationFrame: 0,
    lastType: '',
    cleanup: null,
    currentChallenge: null,
  };

  bestScoreEl.textContent = state.best;
  pauseButton.disabled = true;

  const randomInt = (max) => Math.floor(Math.random() * max);
  const pick = (arr) => arr[randomInt(arr.length)];

  function setView(name) {
    startCard.classList.toggle('hidden', name !== 'start');
    challenge.classList.toggle('hidden', name !== 'challenge');
    gameOver.classList.toggle('hidden', name !== 'gameover');
    pauseCard.classList.toggle('hidden', name !== 'pause');
  }

  function pulse(className) {
    app.classList.remove('success-flash', 'fail-flash');
    void app.offsetWidth;
    app.classList.add(className);
    setTimeout(() => app.classList.remove(className), 260);
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
  }

  function updateHud() {
    scoreEl.textContent = state.score;
    bestScoreEl.textContent = state.best;
    streakEl.textContent = state.score;
    if (state.score < 5) difficultyLabel.textContent = 'WARM UP';
    else if (state.score < 15) difficultyLabel.textContent = 'LOCK IN';
    else if (state.score < 30) difficultyLabel.textContent = 'FAST';
    else difficultyLabel.textContent = 'NO MERCY';
  }

  function clearRound() {
    clearTimeout(state.roundTimer);
    cancelAnimationFrame(state.animationFrame);
    if (typeof state.cleanup === 'function') state.cleanup();
    state.cleanup = null;
    stage.replaceChildren();
    state.currentChallenge = null;
  }

  function startGame() {
    clearRound();
    state.running = true;
    state.paused = false;
    state.score = 0;
    state.roundToken += 1;
    state.lastType = '';
    newBest.classList.add('hidden');
    pauseButton.disabled = false;
    timerNumber.textContent = '1';
    updateHud();
    setView('challenge');
    nextRound();
  }

  function endGame(reason = 'TOO SLOW') {
    if (!state.running) return;
    state.running = false;
    state.paused = false;
    state.roundToken += 1;
    clearRound();
    pauseButton.disabled = true;
    failReason.textContent = reason;
    finalScore.textContent = state.score;

    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem(STORAGE_KEY, String(state.best));
      bestScoreEl.textContent = state.best;
      newBest.classList.remove('hidden');
    } else {
      newBest.classList.add('hidden');
    }

    pulse('fail-flash');
    vibrate([35, 25, 60]);
    setView('gameover');
  }

  function success() {
    if (!state.running || state.paused) return;
    state.running = false;
    clearTimeout(state.roundTimer);
    cancelAnimationFrame(state.animationFrame);
    state.score += 1;
    updateHud();
    pulse('success-flash');
    vibrate(18);
    setTimeout(() => {
      state.running = true;
      if (!state.paused) nextRound();
    }, 105);
  }

  function fail(reason = 'WRONG MOVE') {
    endGame(reason);
  }

  function animateTimer(token) {
    const tick = (now) => {
      if (!state.running || state.paused || token !== state.roundToken) return;
      const elapsed = now - state.roundStart;
      const progress = Math.max(0, 1 - elapsed / ROUND_MS);
      timerRing.style.setProperty('--progress', progress.toFixed(4));
      timerRing.classList.toggle('danger', progress < .28);
      if (progress > 0) state.animationFrame = requestAnimationFrame(tick);
    };
    state.animationFrame = requestAnimationFrame(tick);
  }

  function nextRound() {
    if (!state.running || state.paused) return;
    clearRound();
    setView('challenge');
    state.roundToken += 1;
    const token = state.roundToken;
    const challengeFactory = chooseChallenge();
    state.currentChallenge = challengeFactory();
    state.roundStart = performance.now();
    timerRing.style.setProperty('--progress', '1');
    timerRing.classList.remove('danger');
    animateTimer(token);
    state.roundTimer = setTimeout(() => {
      if (state.running && !state.paused && token === state.roundToken) endGame('TOO SLOW');
    }, ROUND_MS);
  }

  function chooseChallenge() {
    const pool = [safeTile, direction, colorMatch];
    if (state.score >= 3) pool.push(tapCount);
    if (state.score >= 5) pool.push(memoryTile);
    if (state.score >= 8) pool.push(stopBar);
    let candidates = pool.filter((fn) => fn.name !== state.lastType);
    if (!candidates.length) candidates = pool;
    const chosen = pick(candidates);
    state.lastType = chosen.name;
    return chosen;
  }

  function safeTile() {
    kickerEl.textContent = 'REACT';
    promptEl.textContent = 'PICK THE SAFE TILE';
    helpEl.textContent = 'GREEN = GO';
    const safeIndex = randomInt(3);
    const row = document.createElement('div');
    row.className = 'tile-row';

    for (let i = 0; i < 3; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'game-tile';
      button.textContent = i === safeIndex ? '▲' : '×';
      button.classList.add(i === safeIndex ? 'safe-preview' : 'bad-preview');
      button.addEventListener('pointerdown', () => i === safeIndex ? success() : fail());
      row.appendChild(button);
    }

    stage.appendChild(row);
    return { type: 'safeTile' };
  }

  function direction() {
    const labels = { up: '↑', right: '→', down: '↓', left: '←' };
    const target = pick(Object.keys(labels));
    kickerEl.textContent = 'DIRECTION';
    promptEl.textContent = `TAP ${target.toUpperCase()}`;
    helpEl.textContent = 'DON’T FOLLOW THE WRONG ARROW';
    const grid = document.createElement('div');
    grid.className = 'direction-grid';

    Object.entries(labels).forEach(([dir, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'direction-button';
      button.dataset.dir = dir;
      button.textContent = label;
      button.addEventListener('pointerdown', () => dir === target ? success() : fail());
      grid.appendChild(button);
    });

    stage.appendChild(grid);
    return { type: 'direction', target };
  }

  function tapCount() {
    const target = state.score > 18 ? pick([2, 3, 4]) : pick([2, 3]);
    let taps = 0;
    kickerEl.textContent = 'COUNT';
    promptEl.textContent = `TAP ${target} TIMES`;
    helpEl.textContent = 'EXACTLY';
    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = 'tap-pad';
    pad.innerHTML = `<strong>0</strong><span>OF ${target}</span>`;
    const number = pad.querySelector('strong');

    pad.addEventListener('pointerdown', () => {
      taps += 1;
      number.textContent = taps;
      pad.classList.add('active');
      setTimeout(() => pad.classList.remove('active'), 60);
      if (taps === target) success();
      else if (taps > target) fail('TOO MANY');
    });

    stage.appendChild(pad);
    return { type: 'tapCount', target };
  }

  function colorMatch() {
    const colors = [
      { name: 'GREEN', key: 'green' },
      { name: 'RED', key: 'red' },
      { name: 'BLUE', key: 'blue' },
    ];
    const target = pick(colors);
    kickerEl.textContent = 'COLOUR';
    promptEl.textContent = `TAP ${target.name}`;
    helpEl.textContent = 'IGNORE POSITION';
    const row = document.createElement('div');
    row.className = 'color-row';

    [...colors].sort(() => Math.random() - .5).forEach((color) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'color-button';
      button.dataset.color = color.key;
      button.textContent = color.name;
      button.addEventListener('pointerdown', () => color.key === target.key ? success() : fail());
      row.appendChild(button);
    });

    stage.appendChild(row);
    return { type: 'colorMatch', target: target.key };
  }

  function memoryTile() {
    const target = randomInt(3);
    let armed = false;
    kickerEl.textContent = 'MEMORY';
    promptEl.textContent = 'REMEMBER THE FLASH';
    helpEl.textContent = 'THEN TAP ITS POSITION';
    const row = document.createElement('div');
    row.className = 'memory-row';
    const buttons = [];

    for (let i = 0; i < 3; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-cell';
      button.textContent = '•';
      button.disabled = true;
      button.addEventListener('pointerdown', () => {
        if (!armed) return;
        i === target ? success() : fail();
      });
      buttons.push(button);
      row.appendChild(button);
    }

    stage.appendChild(row);
    buttons[target].classList.add('flash');
    const revealTimer = setTimeout(() => {
      buttons[target].classList.remove('flash');
      buttons.forEach((button) => { button.disabled = false; });
      armed = true;
      promptEl.textContent = 'WHERE WAS IT?';
    }, PREVIEW_MS);
    state.cleanup = () => clearTimeout(revealTimer);
    return { type: 'memoryTile', target };
  }

  function stopBar() {
    kickerEl.textContent = 'TIMING';
    promptEl.textContent = 'STOP IN THE GREEN';
    helpEl.textContent = 'TAP THE BAR';
    const track = document.createElement('button');
    track.type = 'button';
    track.className = 'stop-track';
    track.setAttribute('aria-label', 'Stop moving marker in green zone');
    const zone = document.createElement('span');
    zone.className = 'stop-zone';
    const marker = document.createElement('span');
    marker.className = 'stop-marker';
    track.append(zone, marker);
    stage.appendChild(track);

    const zoneLeft = 58;
    const zoneRight = 80;
    const started = performance.now();
    let raf = 0;

    const move = (now) => {
      if (!state.running || state.paused) return;
      const phase = ((now - started) % 720) / 720;
      const triangle = phase < .5 ? phase * 2 : (1 - phase) * 2;
      marker.style.left = `calc(${triangle * 100}% - 4px)`;
      raf = requestAnimationFrame(move);
    };
    raf = requestAnimationFrame(move);

    track.addEventListener('pointerdown', () => {
      const markerRect = marker.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const percent = ((markerRect.left + markerRect.width / 2 - trackRect.left) / trackRect.width) * 100;
      if (percent >= zoneLeft && percent <= zoneRight) success();
      else fail('MISSED IT');
    });

    state.cleanup = () => cancelAnimationFrame(raf);
    return { type: 'stopBar' };
  }

  function pauseGame() {
    if (!state.running || state.paused) return;
    state.paused = true;
    state.running = false;
    state.roundToken += 1;
    clearRound();
    pauseButton.disabled = true;
    setView('pause');
  }

  function resumeGame() {
    if (!state.paused) return;
    state.paused = false;
    state.running = true;
    pauseButton.disabled = false;
    setView('challenge');
    nextRound();
  }

  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);
  pauseButton.addEventListener('click', pauseGame);
  resumeButton.addEventListener('click', resumeGame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running) pauseGame();
  });

  window.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !state.running && !state.paused) {
      event.preventDefault();
      startGame();
    }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  updateHud();
})();
