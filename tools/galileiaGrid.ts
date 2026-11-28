// Recalcula a grade de colisão da Galileia (capítulos 1–5): adiciona copas de árvores,
// palmeiras e arbustos (posições medidas na imagem) e garante que pontos de missão,
// NPCs e pergaminhos continuem livres e alcançáveis. Executar: npx tsx tools/galileiaGrid.ts [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { CHAPTERS } from '../src/data/chapters/index';
import { TREES, PALMS, BUSHES } from '../src/game/gfx/galileiaAnim';
import type { Pt } from '../src/data/types';

const file = 'src/game/maps/galileia.ts';
const src = readFileSync(file, 'utf8');
const rows = [...src.matchAll(/'([#.~]{48})'/g)].map((m) => m[1].split(''));
const C = 32;
const cand = new Set<string>();
const block = (x: number, y: number) => { if (rows[y]?.[x] === '.') cand.add(x + ',' + y); };
const cells = (fn: (px: number, py: number) => boolean) => {
  for (let y = 0; y < 32; y++) for (let x = 0; x < 48; x++) if (fn(x * C + 16, y * C + 16)) block(x, y);
};
// árvores: copa (elipse) + tronco
for (const [cx, cy, r] of TREES) {
  cells((px, py) => ((px - cx) / (r * 0.88)) ** 2 + ((py - cy) / (r * 0.8)) ** 2 < 1);
  cells((px, py) => Math.abs(px - cx) < Math.max(14, r * 0.22) && py > cy && py < cy + r * 1.05);
}
for (const [cx, cy, r] of BUSHES) cells((px, py) => ((px - cx) / (r * 0.8)) ** 2 + ((py - cy) / (r * 0.75)) ** 2 < 1);
// palmeiras: copa + tronco até o chão
for (const [cx, cy, r] of PALMS) {
  cells((px, py) => ((px - cx) / (r * 0.7)) ** 2 + ((py - cy) / (r * 0.55)) ** 2 < 1);
  cells((px, py) => Math.abs(px - cx) < 16 && py > cy && py < cy + r * 2.4);
}

// passagens que precisam existir (corrigem bolsões isolados no mapa original)
const OPEN: [number, number][] = [[26, 22], [26, 23], [30, 16], [44, 10]];
for (const [x, y] of OPEN) rows[y][x] = '.';
// pontos que precisam ficar livres
const keep: [string, Pt][] = [];
for (const d of CHAPTERS.filter((c) => c.map.kind === 'ref')) {
  const add = (n: string, p?: Pt) => p && keep.push([`M${d.n} ${n}`, p]);
  add('spawn', d.spawn); add('mensagem', d.messageAt);
  d.npcs.forEach((n) => add('npc ' + n.id, n.at));
  d.scrolls.forEach((s) => add('pergaminho ' + s.id, s.at));
  d.side.forEach((s) => add('achado ' + s.id, s.findAt));
  d.zones.forEach((z) => add('zona ' + z.id, z.at));
  d.steps.forEach((s) => {
    add('passo ' + s.id, s.at);
    const c: any = s.challenge;
    if (!c) return;
    for (const k of ['at', 'targets', 'path']) (c[k] ?? []).forEach((p: any, i: number) => Array.isArray(p) && typeof p[0] === 'number' && add(`${s.id} ${k}${i}`, p));
    if (c.plots) c.plots.forEach((p: any, i: number) => add(`${s.id} plot${i}`, p.at));
    for (const k of ['source', 'target', 'start']) if (c[k]) add(`${s.id} ${k}`, c[k]);
  });
  
}
keep.push(['portal da caverna', [41, 4]]);
const keyCells = new Set(keep.map(([, [x, y]]) => Math.floor(x) + ',' + Math.floor(y)));
const reach = () => {
  const seen = new Set<string>();
  const st = CHAPTERS[0].spawn;
  const q: number[][] = [[Math.floor(st[0]), Math.floor(st[1])]];
  while (q.length) {
    const [x, y] = q.pop()!;
    const k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= 48 || y >= 32 || rows[y][x] !== '.') continue;
    seen.add(k);
    q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return seen;
};
const base = reach();
const need = [...keyCells].filter((k) => base.has(k));
let added = 0, skipped = 0, curSize = base.size;
for (const k of cand) {
  if (keyCells.has(k)) { skipped++; continue; }
  const [x, y] = k.split(',').map(Number);
  rows[y][x] = '#';
  const r = reach();
  // não pode isolar nenhum ponto de missão nem fechar mais de 2 células livres além da própria
  if (need.some((n) => !r.has(n))) { rows[y][x] = '.'; skipped++; continue; }
  added++;
  // bolsões que ficaram presos entre copa, penhasco ou casa também viram bloqueio
  if (curSize - r.size > 1) {
    for (let yy = 0; yy < 32; yy++) for (let xx = 0; xx < 48; xx++) if (rows[yy][xx] === '.' && !r.has(xx + ',' + yy) && base.has(xx + ',' + yy)) rows[yy][xx] = '#';
  }
  curSize = r.size;
}
const seen = reach();
console.log(`candidatas: ${cand.size} · bloqueadas: ${added} · mantidas livres: ${skipped} · pontos alcançáveis antes: ${need.length}/${keyCells.size}`);
const bad = keep.filter(([, [x, y]]) => !seen.has(Math.floor(x) + ',' + Math.floor(y)) && !rows[Math.floor(y)]?.[Math.floor(x)]?.includes('~'));
console.log(`pontos: ${keep.length} · inalcançáveis (já eram antes): ${bad.length}`);
bad.forEach(([n, p]) => console.log('  ✗', n, p.join(',')));
const out = rows.map((r) => r.join(''));
console.log(out.map((r, i) => String(i).padStart(2) + ' ' + r).join('\n'));
if (process.argv.includes('--write')) {
  const body = out.map((r) => `  '${r}',`).join('\n');
  writeFileSync(file, src.replace(/export const GALILEIA_GRID = \[[\s\S]*?\];/, `export const GALILEIA_GRID = [\n${body}\n];`));
  console.log('gravado em', file);
}
