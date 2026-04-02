/**
 * Refresh sound feedback via Web Audio API.
 * 3 distinct sounds: success (no new alerts), attention (new alerts), error.
 * No external audio files needed.
 */

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.15) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/**
 * Short gentle "ding" — refresh OK, no new alerts.
 */
export function playSuccessSound() {
  const ctx = getContext();
  playTone(880, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(1320, 0.2, 'sine', 0.1), 100);
}

/**
 * Rising two-tone alert — refresh OK, new alerts detected.
 */
export function playAttentionSound() {
  const ctx = getContext();
  playTone(440, 0.15, 'triangle', 0.18);
  setTimeout(() => playTone(660, 0.15, 'triangle', 0.18), 120);
  setTimeout(() => playTone(880, 0.25, 'triangle', 0.15), 240);
}

/**
 * Low buzzy tone — refresh failed.
 */
export function playErrorSound() {
  playTone(220, 0.3, 'sawtooth', 0.1);
  setTimeout(() => playTone(180, 0.4, 'sawtooth', 0.08), 250);
}

/**
 * FLASH alert — urgent siren, two rapid descending tones.
 */
export function playFlashSound() {
  playTone(1200, 0.1, 'square', 0.14);
  setTimeout(() => playTone(900, 0.1, 'square', 0.14), 120);
  setTimeout(() => playTone(1200, 0.1, 'square', 0.14), 240);
  setTimeout(() => playTone(900, 0.15, 'square', 0.12), 360);
}

/**
 * PRIORITY alert — firm double-beep notification.
 */
export function playPrioritySound() {
  playTone(800, 0.12, 'triangle', 0.16);
  setTimeout(() => playTone(1000, 0.18, 'triangle', 0.14), 150);
}

/**
 * ROUTINE alert — soft single ding (same as success but lower pitch).
 */
export function playRoutineSound() {
  playTone(660, 0.2, 'sine', 0.1);
}
