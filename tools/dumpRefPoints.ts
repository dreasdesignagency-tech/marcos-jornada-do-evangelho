// Exporta (JSON) os pontos de missão dos capítulos no mapa da Galileia, em células de 32 px.
import { CHAPTERS } from '../src/data/chapters/index';
const out: { ch: number; name: string; p: [number, number]; r?: number }[] = [];
for (const d of CHAPTERS.filter((c) => c.map.kind === 'ref')) {
  const add = (name: string, p?: any, r?: number) => p && out.push({ ch: d.n, name, p, r });
  add('spawn', d.spawn); add('mensagem', d.messageAt);
  d.npcs.forEach((n) => add('npc ' + n.id, n.at));
  d.scrolls.forEach((s) => add('pergaminho ' + s.id, s.at));
  d.side.forEach((s) => add('achado ' + s.id, s.findAt));
  d.steps.forEach((s) => {
    if (s.at) add('passo ' + s.id, s.at, s.r);
    const c: any = s.challenge;
    if (!c) return;
    for (const k of ['at', 'targets', 'path']) (c[k] ?? []).forEach((p: any, i: number) => Array.isArray(p) && typeof p[0] === 'number' && add(`${s.id} ${k}${i}`, p));
    if (c.plots) c.plots.forEach((p: any, i: number) => add(`${s.id} plot${i}`, p.at));
    for (const k of ['source', 'target', 'start']) if (c[k]) add(`${s.id} ${k}`, c[k]);
  });
}
out.push({ ch: 1, name: 'portal caverna', p: [41, 4] });
console.log(JSON.stringify(out));
