// Confere os mapas dos segmentos de história: pontos importantes em chão livre e
// alcançáveis a partir do spawn (sem contar objetos sólidos).
// Executar: npx tsx tools/checkmaps.ts
import { STORY } from '../src/data/story/index';
import { buildMap, clearAround } from '../src/game/maps/builder';
import type { Pt } from '../src/data/types';

const SOLID = new Set(['water', 'deep', 'cliff', 'wall', 'cwall', 'cavewall']);
let bad = 0;
for (const def of Object.values(STORY)) {
  if (def.map.kind !== 'proc') continue;
  const keep: Pt[] = [def.spawn, ...def.npcs.map((n) => n.at)];
  def.steps.forEach((s) => s.at && keep.push(s.at));
  const m = buildMap(def.map, keep as any);
  clearAround(m, keep as any, 1.5);
  // grade de bloqueio: tiles sólidos + pegada aproximada de objetos sólidos
  const blocked = m.grid.map((row) => row.map((t) => SOLID.has(t)));
  for (const o of m.objects) {
    if (!o.solid) continue;
    const fw = Math.max(1, Math.round((o.w ?? 2) / 2));
    for (let dx = -Math.floor(fw / 2); dx <= Math.floor(fw / 2); dx++) {
      const x = o.x + dx, y = o.y;
      if (blocked[y]?.[x] !== undefined) blocked[y][x] = true;
    }
  }
  const seen = new Set<string>();
  const q: Pt[] = [[Math.round(def.spawn[0]), Math.round(def.spawn[1])]];
  while (q.length) {
    const [x, y] = q.pop()!;
    const k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= m.w || y >= m.h || blocked[y][x]) continue;
    seen.add(k);
    q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const pts: [string, Pt][] = [['spawn', def.spawn], ...def.npcs.map((n) => [`npc ${n.id}`, n.at] as [string, Pt]), ...def.steps.filter((s) => s.at).map((s) => [`step ${s.id}`, s.at!] as [string, Pt]),
    ...(def.story?.props ?? []).map((p) => [`prop ${p.label}`, p.at] as [string, Pt]), ...def.side.filter((q) => q.findAt).map((q) => [`find ${q.id}`, q.findAt!] as [string, Pt])];
  for (const st of def.steps) {
    const c: any = st.challenge;
    if (!c) continue;
    (c.at ?? []).forEach((p: Pt, i: number) => Array.isArray(p) && pts.push([`${st.id} item ${i}`, p]));
    if (c.start) pts.push([`${st.id} start`, c.start]);
    if (c.goal) pts.push([`${st.id} goal`, c.goal]);
    (c.path ?? []).forEach((p: Pt, i: number) => pts.push([`${st.id} path ${i}`, p]));
  }
  const near = ([x, y]: Pt) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (seen.has(Math.round(x + dx) + ',' + Math.round(y + dy))) return true;
    return false;
  };
  const fails = pts.filter(([, p]) => !near(p));
  console.log(`${def.n} ${def.title}: ${seen.size} células livres alcançáveis, ${pts.length} pontos${fails.length ? ' — PROBLEMAS: ' + fails.map(([n, p]) => `${n}@${p}`).join(', ') : ' ok'}`);
  bad += fails.length;
}
process.exit(bad ? 1 : 0);
