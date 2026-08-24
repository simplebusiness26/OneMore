// ONE MORE gameplay tuning layer.
// Keeps control/level balance tweaks isolated from the core renderer and save system.

// FIRST LIGHT: the original first gap forced a near-maximum-range jump directly
// into a spike. Give the player a fair landing window before the next hazard.
const firstLightGap = levels[0].map.find(item => item.kind === 'gap' && item.x === 930);
if (firstLightGap) firstLightGap.w = 80;

const firstLightPostGapSpike = levels[0].map.find(item => item.kind === 'spikes' && item.x === 1125);
if (firstLightPostGapSpike) firstLightPostGapSpike.x = 1210;

// Hold-to-bounce: while the player keeps a finger/key held, jump again on every
// valid landing. jump() remains the single authority for whether a jump is legal.
let holdBounceActive = false;
let heldPointerId = null;
const heldJumpKeys = new Set();

function setHoldBounce(active) {
  holdBounceActive = active;
  if (active) jump();
}

canvas.addEventListener('pointerdown', event => {
  heldPointerId = event.pointerId;
  setHoldBounce(true);
  try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
});

function releaseHeldPointer(event) {
  if (heldPointerId === null || event.pointerId === heldPointerId) {
    heldPointerId = null;
    if (heldJumpKeys.size === 0) setHoldBounce(false);
  }
}

canvas.addEventListener('pointerup', releaseHeldPointer);
canvas.addEventListener('pointercancel', releaseHeldPointer);
window.addEventListener('pointerup', releaseHeldPointer);
window.addEventListener('pointercancel', releaseHeldPointer);
window.addEventListener('blur', () => {
  heldPointerId = null;
  heldJumpKeys.clear();
  setHoldBounce(false);
});

// Match hold-to-bounce on keyboard for browser testing too.
document.addEventListener('keydown', event => {
  if (!['Space', 'ArrowUp'].includes(event.code)) return;
  heldJumpKeys.add(event.code);
  setHoldBounce(true);
});

document.addEventListener('keyup', event => {
  if (!['Space', 'ArrowUp'].includes(event.code)) return;
  heldJumpKeys.delete(event.code);
  if (heldPointerId === null && heldJumpKeys.size === 0) setHoldBounce(false);
});

function holdBounceLoop() {
  if (holdBounceActive && state === 'playing' && !paused && p.alive && p.onGround) {
    jump();
  }
  requestAnimationFrame(holdBounceLoop);
}
requestAnimationFrame(holdBounceLoop);
