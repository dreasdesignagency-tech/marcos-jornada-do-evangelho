// Sistema de áudio 100% original e gerado em tempo real (Web Audio API):
// trilhas instrumentais (lira + bordão + flauta) e efeitos sonoros.
import type { MusicMood } from '../data/types';

let ctx: AudioContext | null = null;
let master: GainNode, musicBus: GainNode, sfxBus: GainNode, reverb: ConvolverNode;
let vol = { music: 0.6, sfx: 0.8 };
let current: { mood: MusicMood; stop: () => void } | null = null;

function ensure() {
  if (ctx) return ctx;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC() as AudioContext;
  master = ctx.createGain();
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  sfxBus = ctx.createGain();
  reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  musicBus.connect(master);
  musicBus.connect(reverb);
  reverb.connect(wet).connect(master);
  sfxBus.connect(master);
  applyVol();
  return ctx;
}

function impulse(c: AudioContext, sec: number) {
  const len = c.sampleRate * sec;
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return b;
}

function applyVol() {
  if (!ctx) return;
  musicBus.gain.value = vol.music * 0.5;
  sfxBus.gain.value = vol.sfx * 0.6;
}

export function setVolumes(music: number, sfxV: number) {
  vol = { music, sfx: sfxV };
  applyVol();
}

export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
}

const NOTE = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface MoodDef { root: number; scale: number[]; bpm: number; density: number; flute: boolean; drone: boolean; bright: number }
const MOODS: Record<MusicMood, MoodDef> = {
  pastoral: { root: 62, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 84, density: 0.7, flute: true, drone: true, bright: 1 },
  village: { root: 64, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 96, density: 0.8, flute: false, drone: true, bright: 1.1 },
  sea: { root: 57, scale: [0, 2, 4, 7, 9], bpm: 72, density: 0.55, flute: true, drone: true, bright: 0.9 },
  mystery: { root: 57, scale: [0, 1, 4, 5, 7, 8, 11], bpm: 66, density: 0.45, flute: true, drone: true, bright: 0.8 },
  joy: { root: 67, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 104, density: 0.85, flute: true, drone: false, bright: 1.2 },
  temple: { root: 60, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 70, density: 0.5, flute: false, drone: true, bright: 0.9 },
  night: { root: 55, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 58, density: 0.35, flute: true, drone: true, bright: 0.7 },
  lament: { root: 52, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 50, density: 0.3, flute: true, drone: true, bright: 0.6 },
  dawn: { root: 65, scale: [0, 2, 4, 7, 9], bpm: 78, density: 0.6, flute: true, drone: true, bright: 1.15 },
};

function pluck(t: number, freq: number, gain: number, bright: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const o2 = c.createOscillator();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  o.type = 'triangle';
  o2.type = 'sawtooth';
  o.frequency.value = freq;
  o2.frequency.value = freq * 1.002;
  f.type = 'lowpass';
  f.frequency.setValueAtTime(2400 * bright, t);
  f.frequency.exponentialRampToValueAtTime(500, t + 0.9);
  const g2 = c.createGain();
  g2.gain.value = 0.18;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  o.connect(f);
  o2.connect(g2).connect(f);
  f.connect(g).connect(musicBus);
  o.start(t);
  o2.start(t);
  o.stop(t + 1.7);
  o2.stop(t + 1.7);
}

function flute(t: number, freq: number, dur: number, gain: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const lfo = c.createOscillator();
  const lg = c.createGain();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  lfo.frequency.value = 5;
  lg.gain.value = freq * 0.006;
  lfo.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.12);
  g.gain.setValueAtTime(gain, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(musicBus);
  o.start(t);
  lfo.start(t);
  o.stop(t + dur + 0.05);
  lfo.stop(t + dur + 0.05);
}

function drone(freq: number) {
  const c = ctx!;
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.05, c.currentTime + 3);
  const oscs = [freq, freq * 1.5, freq * 2.003].map((f, i) => {
    const o = c.createOscillator();
    o.type = i === 0 ? 'sawtooth' : 'sine';
    o.frequency.value = f;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    o.connect(lp).connect(g);
    o.start();
    return o;
  });
  g.connect(musicBus);
  return () => {
    g.gain.cancelScheduledValues(c.currentTime);
    g.gain.setValueAtTime(g.gain.value, c.currentTime);
    g.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
    oscs.forEach((o) => o.stop(c.currentTime + 1.6));
  };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function music(mood: MusicMood | null) {
  const c = ensure();
  if (!c) return;
  if (current?.mood === mood) return;
  current?.stop();
  current = null;
  if (!mood) return;
  const m = MOODS[mood];
  const r = rng(mood.length * 977 + m.root);
  const beat = 60 / m.bpm;
  // motivo de 8 notas, repetido com variações
  const motif: number[] = [];
  let deg = 0;
  for (let i = 0; i < 8; i++) {
    deg = Math.max(-2, Math.min(9, deg + Math.floor(r() * 5) - 2));
    motif.push(deg);
  }
  const deg2midi = (d: number) => {
    const L = m.scale.length;
    const oct = Math.floor(d / L);
    const idx = ((d % L) + L) % L;
    return m.root + oct * 12 + m.scale[idx];
  };
  const stopDrone = m.drone ? drone(NOTE(m.root - 24)) : () => {};
  let next = c.currentTime + 0.2;
  let step = 0;
  let alive = true;
  const timer = setInterval(() => {
    if (!alive || !ctx) return;
    while (next < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 8);
      const i = step % 8;
      const variation = bar % 4 === 3 ? 2 : bar % 2 === 1 ? 1 : 0;
      if (r() < m.density) {
        const d = motif[i] + (variation === 2 && i > 4 ? -1 : 0) + (variation === 1 && i % 3 === 0 ? 2 : 0);
        pluck(next, NOTE(deg2midi(d)), 0.11, m.bright);
        if (i === 0) pluck(next, NOTE(deg2midi(0) - 12), 0.08, m.bright * 0.7);
      }
      if (m.flute && bar % 4 >= 2 && i % 4 === 0 && r() < 0.6) {
        flute(next, NOTE(deg2midi(motif[(i + bar) % 8] + 7)), beat * 3.5, 0.035);
      }
      next += beat / 2;
      step++;
    }
  }, 120);
  current = {
    mood,
    stop: () => {
      alive = false;
      clearInterval(timer);
      stopDrone();
    },
  };
}

export type Sfx = 'blip' | 'item' | 'quest' | 'step' | 'scroll' | 'achievement' | 'error' | 'select' | 'open' | 'thunder' | 'chime' | 'pray' | 'splash';

export function sfx(name: Sfx) {
  const c = ensure();
  if (!c || vol.sfx <= 0) return;
  const t = c.currentTime;
  const tone = (f: number, d: number, type: OscillatorType = 'square', g = 0.08, at = 0) => {
    const o = c.createOscillator();
    const gg = c.createGain();
    o.type = type;
    o.frequency.value = f;
    gg.gain.setValueAtTime(g, t + at);
    gg.gain.exponentialRampToValueAtTime(0.0001, t + at + d);
    o.connect(gg).connect(sfxBus);
    o.start(t + at);
    o.stop(t + at + d + 0.02);
  };
  const noise = (d: number, g: number, freq = 800) => {
    const len = c.sampleRate * d;
    const b = c.createBuffer(1, len, c.sampleRate);
    const data = b.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource();
    s.buffer = b;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    const gg = c.createGain();
    gg.gain.value = g;
    s.connect(f).connect(gg).connect(sfxBus);
    s.start(t);
  };
  switch (name) {
    case 'blip': tone(660 + Math.random() * 60, 0.03, 'square', 0.025); break;
    case 'select': tone(880, 0.06, 'square', 0.05); break;
    case 'open': tone(440, 0.08, 'triangle', 0.08); tone(660, 0.1, 'triangle', 0.06, 0.06); break;
    case 'item': [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'triangle', 0.09, i * 0.07)); break;
    case 'scroll': [587, 740, 880, 1175].forEach((f, i) => tone(f, 0.25, 'sine', 0.08, i * 0.08)); break;
    case 'quest': [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.09, i * 0.09)); break;
    case 'achievement': [523, 784, 1046, 1318].forEach((f, i) => tone(f, 0.4, 'sine', 0.09, i * 0.1)); break;
    case 'error': tone(196, 0.18, 'square', 0.06); tone(147, 0.22, 'square', 0.05, 0.1); break;
    case 'step': noise(0.04, 0.05, 600); break;
    case 'thunder': noise(1.8, 0.5, 220); break;
    case 'splash': noise(0.4, 0.2, 1800); break;
    case 'chime': [1046, 1318, 1568].forEach((f, i) => tone(f, 0.8, 'sine', 0.05, i * 0.12)); break;
    case 'pray': [392, 494, 587].forEach((f) => tone(f, 1.6, 'sine', 0.035)); break;
  }
}
