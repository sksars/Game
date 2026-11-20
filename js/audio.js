// Lightweight Web Audio API sound synthesizer (no external audio files required)
import { Storage } from './storage.js';

let audioCtx = null;

function getCtx() {
  if (Storage.isMuted()) return null;
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const AudioFX = {
  tone(freq = 440, duration = 0.08, type = 'sine', gainVal = 0.08) {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors when autoplay is restricted
    }
  },
  click() {
    this.tone(520, 0.045, 'triangle', 0.06);
  },
  score() {
    this.tone(660, 0.07, 'sine', 0.08);
    setTimeout(() => this.tone(880, 0.09, 'sine', 0.07), 55);
  },
  bounce() {
    this.tone(360, 0.05, 'triangle', 0.07);
  },
  error() {
    this.tone(180, 0.14, 'sawtooth', 0.06);
  },
  win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, 0.14, 'triangle', 0.08), idx * 80);
    });
  }
};
