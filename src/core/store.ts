// Estado global simples (sem dependências) compartilhado entre React e Phaser,
// com salvamento automático no LocalStorage.
import { useSyncExternalStore } from 'react';
import type { Look, Line, ChallengeDef } from '../data/types';
import { DEFAULT_LOOK } from '../data/looks';

export interface ChapterProgress {
  steps: string[];
  side: string[];
  zones: string[];
  talked: string[];
  scrolls: string[];
  quiz: { done: boolean; points: number; firstTry: number };
  messageRead: boolean;
  completed: boolean;
  best: number;
  bestPct: number;
  runs: number;
}

export interface SaveData {
  version: 1;
  player: { name: string; look: Look };
  created: number;
  playMs: number;
  inventory: string[];
  chapters: Record<number, ChapterProgress>;
  unlocked: number;
  achievements: string[];
  seenCharacters: string[];
  seenPlaces: string[];
  quizStats: { correct: number; total: number };
  settings: { music: number; sfx: number; textSpeed: number };
  finished: boolean;
  scoreHistory: { ch: number; score: number; at: number }[];
  usedItems?: string[];
}

export interface RecordEntry { name: string; score: number; chapters: number; ms: number; at: number }

export type Screen =
  | 'title' | 'create' | 'chapters' | 'diary' | 'ranking' | 'achievements' | 'settings' | 'game' | 'ending';

export interface DialogState {
  lines: Line[];
  index: number;
  resolve: (choiceOk?: boolean) => void;
}

export interface UiState {
  screen: Screen;
  chapter: number;
  panel: null | 'inventory' | 'map' | 'journal' | 'pause' | 'scrolls';
  dialog: DialogState | null;
  toast: { id: number; text: string; icon?: string }[];
  message: boolean; // overlay da Mensagem do Capítulo
  minigame: { def: ChallengeDef; help: boolean; resolve: (ok: boolean) => void } | null;
  interactHint: string | null;
  location: string;
  counter: { label: string; have: number; need: number; time?: number } | null;
  cinematic: { title: string; sub: string } | null;
  fade: number;
  touch: { x: number; y: number };
  playerPos: { x: number; y: number };
  hotcold: number | null;
  cutscene: boolean;
}

const KEY = 'marcos-jornada-save-v1';
const REC_KEY = 'marcos-jornada-records-v1';

export function emptyProgress(): ChapterProgress {
  return {
    steps: [], side: [], zones: [], talked: [], scrolls: [],
    quiz: { done: false, points: 0, firstTry: 0 },
    messageRead: false, completed: false, best: 0, bestPct: 0, runs: 0,
  };
}

export function newSave(name: string, look: Look): SaveData {
  return {
    version: 1,
    player: { name, look },
    created: Date.now(),
    playMs: 0,
    inventory: [],
    chapters: {},
    unlocked: 1,
    achievements: [],
    seenCharacters: [],
    seenPlaces: [],
    quizStats: { correct: 0, total: 0 },
    settings: { music: 0.6, sfx: 0.8, textSpeed: 1 },
    finished: false,
    scoreHistory: [],
  };
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SaveData;
    if (s.version !== 1) return null;
    return s;
  } catch {
    return null;
  }
}

export function loadRecords(): RecordEntry[] {
  try {
    return JSON.parse(localStorage.getItem(REC_KEY) || '[]');
  } catch {
    return [];
  }
}
export function pushRecord(r: RecordEntry) {
  const list = loadRecords().filter((x) => !(x.name === r.name && x.at === r.at));
  // um registro por nome: mantém o melhor
  const same = list.findIndex((x) => x.name === r.name);
  if (same >= 0) {
    if (list[same].score > r.score || (list[same].score === r.score && list[same].chapters >= r.chapters)) return;
    list.splice(same, 1);
  }
  list.push(r);
  list.sort((a, b) => b.score - a.score || a.ms - b.ms);
  try {
    localStorage.setItem(REC_KEY, JSON.stringify(list.slice(0, 20)));
  } catch { /* armazenamento indisponível */ }
}

type Listener = () => void;

class Store {
  save: SaveData | null = loadSave();
  ui: UiState = {
    screen: 'title', chapter: 1, panel: null, dialog: null, toast: [], message: false, minigame: null,
    interactHint: null, location: '', counter: null, cinematic: null, fade: 0,
    touch: { x: 0, y: 0 }, playerPos: { x: 0, y: 0 }, hotcold: null, cutscene: false,
  };
  private listeners = new Set<Listener>();
  private version = 0;
  private toastId = 1;

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getVersion = () => this.version;
  emit() {
    this.version++;
    this.listeners.forEach((l) => l());
  }
  setUi(p: Partial<UiState>) {
    this.ui = { ...this.ui, ...p };
    this.emit();
  }
  persist() {
    if (!this.save) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.save));
    } catch { /* ignore */ }
    this.emit();
  }
  mutate(fn: (s: SaveData) => void) {
    if (!this.save) return;
    fn(this.save);
    this.persist();
  }
  startNew(name: string, look: Look) {
    const old = this.save;
    this.save = newSave(name, look);
    if (old) this.save.settings = old.settings;
    this.persist();
  }
  progress(ch: number): ChapterProgress {
    if (!this.save) return emptyProgress();
    if (!this.save.chapters[ch]) this.save.chapters[ch] = emptyProgress();
    return this.save.chapters[ch];
  }
  toast(text: string, icon?: string) {
    const id = this.toastId++;
    this.setUi({ toast: [...this.ui.toast, { id, text, icon }].slice(-4) });
    setTimeout(() => this.setUi({ toast: this.ui.toast.filter((t) => t.id !== id) }), 3600);
  }
  /** Mostra uma sequência de falas e resolve quando o jogador termina. */
  dialog(lines: Line[]): Promise<boolean | undefined> {
    return new Promise((resolve) => {
      if (!lines.length) return resolve(undefined);
      this.setUi({ dialog: { lines, index: 0, resolve } });
    });
  }
  minigame(def: ChallengeDef, help = false): Promise<boolean> {
    return new Promise((resolve) => this.setUi({ minigame: { def, help, resolve } }));
  }
  get blocking() {
    const u = this.ui;
    return !!(u.dialog || u.panel || u.message || u.minigame || u.cinematic);
  }
}

export const store = new Store();
(window as any).__store = store;

export function useStore() {
  useSyncExternalStore(store.subscribe, store.getVersion);
  return store;
}

export const DEFAULT = DEFAULT_LOOK;
