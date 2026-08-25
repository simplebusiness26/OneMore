// ONE MORE gameplay tuning layer.
// Keeps control/level balance tweaks isolated from the core renderer and save system.

// FIRST LIGHT fairness pass.
// The first gap -> spike -> raised block sequence was technically too compressed:
// moving the spike farther from the gap in the first patch left too little room
// between the spike and the block. Rebalance the whole sequence so the player can
// land after the gap, take one clear jump, and cleanly clear both hazards.
const firstLightGap = levels[0].map.find(item => item.kind === 'gap' && item.x === 930);
if (firstLightGap) firstLightGap.w = 80;

const firstLightPostGapSpike = levels[0].map.find(item => item.kind === 'spikes' && item.x === 1125);
if (firstLightPostGapSpike) firstLightPostGapSpike.x = 1185;

const firstLightPostSpikeBlock = levels[0].map.find(item => item.kind === 'block' && item.x === 1320);
if (firstLightPostSpikeBlock) {
  firstLightPostSpikeBlock.w = 56;
  firstLightPostSpikeBlock.h = 40;
}

// Falling into a floor gap must always be a death.
// Previously the scrolling world could move the gap past the player while they
// were falling, causing the normal ground collision to snap them safely back up.
// Check before the core update: once a descending player reaches floor height
// while their centre is over a gap, commit the death immediately.
const coreUpdate = update;
update = function oneMoreFairnessUpdate(dt) {
  if (state === 'playing' && !paused && p.alive) {
    const worldX = worldPlayerX();
    const reachedFloorWhileFalling = p.vy >= 0 && p.y + p.h >= GROUND - 0.5;
    if (reachedFloorWhileFalling && isOverGap(worldX)) {
      die();
      return;
    }
  }

  coreUpdate(dt);
};

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
