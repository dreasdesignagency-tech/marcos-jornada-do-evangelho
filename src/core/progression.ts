// Pontos de Jornada (PJ): calculados a partir do progresso registrado,
// por isso a mesma atividade nunca pontua duas vezes.
import type { ChapterDef } from '../data/types';
import { CHAPTERS, getChapter } from '../data/chapters';
import { store, type ChapterProgress, pushRecord } from './store';
import { levelFor, ACHIEVEMENTS } from '../data/levels';
import { ITEMS } from '../data/items';
import { sfx } from '../audio/audio';
import { addFragment } from './story';

export const PJ = { explore: 100, main: 250, side: 150, dialog: 100, scroll: 100, quiz: 200, message: 100 };

export function talkers(def: ChapterDef) {
  return def.npcs.filter((n) => n.lines && n.lines.length);
}

export function breakdown(def: ChapterDef, p: ChapterProgress) {
  const frac = (have: number, total: number, pts: number) => (total ? Math.round((Math.min(have, total) / total) * pts) : pts);
  const t = talkers(def);
  const b = {
    explore: frac(p.zones.filter((z) => def.zones.some((d) => d.id === z)).length, def.zones.length, PJ.explore),
    main: frac(p.steps.filter((s) => def.steps.some((d) => d.id === s)).length, def.steps.length, PJ.main),
    side: frac(p.side.length, def.side.length, PJ.side),
    dialog: frac(p.talked.filter((x) => t.some((n) => n.id === x)).length, t.length, PJ.dialog),
    scroll: frac(p.scrolls.length, def.scrolls.length, PJ.scroll),
    quiz: Math.min(PJ.quiz, p.quiz.points),
    message: p.messageRead ? PJ.message : 0,
  };
  const total = Object.values(b).reduce((a, c) => a + c, 0);
  return { ...b, total };
}

export function percent(def: ChapterDef, p: ChapterProgress) {
  const t = talkers(def);
  const totalItems = def.zones.length + def.steps.length + def.side.length + t.length + def.scrolls.length + 2;
  const done =
    Math.min(p.zones.length, def.zones.length) +
    Math.min(p.steps.length, def.steps.length) +
    Math.min(p.side.length, def.side.length) +
    Math.min(p.talked.filter((x) => t.some((n) => n.id === x)).length, t.length) +
    Math.min(p.scrolls.length, def.scrolls.length) +
    (p.quiz.done ? 1 : 0) +
    (p.messageRead ? 1 : 0);
  return Math.round((done / totalItems) * 100);
}

export function chapterScore(n: number) {
  const def = getChapter(n);
  const p = store.progress(n);
  return breakdown(def, p).total;
}

export function totalBest() {
  const s = store.save;
  if (!s) return 0;
  let t = 0;
  for (let i = 1; i <= 16; i++) {
    const p = s.chapters[i];
    if (p) t += Math.max(p.best, breakdown(CHAPTERS[i - 1], p).total);
  }
  return t;
}

/** Progresso apenas dos capítulos bíblicos (ignora prólogo e segmentos de história). */
export function bibleProgress(s = store.save) {
  if (!s) return [];
  return Object.entries(s.chapters).filter(([k]) => +k >= 1 && +k <= 16).map(([, v]) => v);
}

export function chaptersDone() {
  return bibleProgress().filter((c) => c.completed).length;
}

export function playerLevel() {
  const done = chaptersDone();
  const { cur, next } = levelFor(done);
  // XP: progresso até o próximo título, incluindo a porcentagem do capítulo atual
  const curCh = store.ui.chapter;
  const partial = store.save?.chapters[curCh] && !store.save.chapters[curCh].completed
    ? percent(getChapter(curCh), store.save.chapters[curCh]) / 100
    : 0;
  const xp = next ? Math.min(1, (done - cur.chapters + partial) / (next.chapters - cur.chapters)) : 1;
  return { ...cur, next, xp };
}

/** Atualiza recorde do capítulo, conquistas e ranking. Chamar após qualquer mudança de progresso. */
export function commit(n: number) {
  const s = store.save;
  if (!s) return;
  const def = getChapter(n);
  const p = store.progress(n);
  const b = breakdown(def, p);
  const pct = percent(def, p);
  if (b.total > p.best) p.best = b.total;
  if (pct > p.bestPct) p.bestPct = pct;
  checkAchievements();
  store.persist();
}

export function unlockAchievement(id: string) {
  const s = store.save;
  if (!s || s.achievements.includes(id)) return;
  s.achievements.push(id);
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (a) {
    store.toast(`Conquista: ${a.title}`, a.icon);
    sfx('achievement');
  }
  store.persist();
}

export function checkAchievements() {
  const s = store.save;
  if (!s) return;
  const done = chaptersDone();
  for (const k of [1, 4, 8, 12, 16]) if (s.chapters[k]?.completed) unlockAchievement('ch' + k);
  const scrolls = bibleProgress(s).reduce((a, c) => a + c.scrolls.length, 0);
  const allScrolls = CHAPTERS.reduce((a, c) => a + c.scrolls.length, 0);
  if (scrolls >= 10) unlockAchievement('scrolls-10');
  if (scrolls >= allScrolls) unlockAchievement('scrolls-all');
  const perfect = bibleProgress(s).filter((c) => c.quiz.done && c.quiz.firstTry === 3).length;
  if (perfect >= 1) unlockAchievement('perfect-quiz');
  if (perfect >= 5) unlockAchievement('perfect-5');
  if (bibleProgress(s).some((c) => c.best >= 1000)) unlockAchievement('full-chapter');
  const sides = bibleProgress(s).reduce((a, c) => a + c.side.length, 0);
  if (sides >= 5) unlockAchievement('side-5');
  if (s.inventory.filter((i) => ITEMS[i]).length >= 20) unlockAchievement('items-20');
  const talks = bibleProgress(s).reduce((a, c) => a + c.talked.length, 0);
  if (talks >= 50) unlockAchievement('talk-50');
  if (done >= 16) unlockAchievement('complete');
}

export function saveRecord() {
  const s = store.save;
  if (!s) return;
  pushRecord({ name: s.player.name, score: totalBest(), chapters: chaptersDone(), ms: s.playMs, at: s.created });
}

export function giveItem(id: string) {
  const s = store.save;
  if (!s || s.inventory.includes(id)) return false;
  s.inventory.push(id);
  const it = ITEMS[id];
  if (it) {
    store.toast(`Item recebido: ${it.name}`, it.icon);
    sfx('item');
  }
  store.persist();
  return true;
}

export function hasItem(id: string) {
  return !!store.save?.inventory.includes(id);
}

export function resetChapterRun(n: number) {
  const s = store.save;
  if (!s) return;
  const old = s.chapters[n];
  const p = store.progress(n);
  if (old) {
    // Rejogar: mantém melhor pontuação e conclusão; reinicia a jornada da fase.
    Object.assign(p, {
      steps: [], side: [], zones: [], talked: [], scrolls: [],
      quiz: { done: false, points: 0, firstTry: 0 }, messageRead: false,
    });
  }
  p.runs++;
  store.persist();
}

/** Pode desbloquear o próximo capítulo? */
export function requirements(def: ChapterDef, p: ChapterProgress) {
  return {
    main: def.steps.every((s) => p.steps.includes(s.id)),
    scrolls: def.scrolls.every((s) => p.scrolls.includes(s.id)),
    message: p.messageRead,
    quiz: p.quiz.done,
  };
}

export function completeChapter(n: number) {
  const s = store.save;
  if (!s) return;
  const p = store.progress(n);
  p.completed = true;
  if (n > 16) { store.persist(); return; }
  if (s.unlocked < n + 1) s.unlocked = Math.min(16, n + 1);
  // cada capítulo concluído guarda um fragmento da missão lendária (o de Marcos 1 vem da caverna)
  if (n >= 2) addFragment(n);
  s.scoreHistory.push({ ch: n, score: chapterScore(n), at: Date.now() });
  commit(n);
  saveRecord();
}
