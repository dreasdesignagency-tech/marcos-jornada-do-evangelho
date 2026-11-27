// Verificação da corrente de itens (executar com: npx tsx src/data/ledger.test.ts)
import { CHAPTERS } from './chapters';
const given = new Map<string, number>();
const used = new Map<string, number[]>();
const add = (i: string, n: number) => { if (!used.has(i)) used.set(i, []); used.get(i)!.push(n); };
for (const c of CHAPTERS) {
  for (const n of c.npcs) { if (n.gives) given.set(n.gives, c.n); n.uses?.forEach((u) => add(u.item, c.n)); }
  for (const q of c.side) { add(q.needs, c.n); if (q.reward) given.set(q.reward, c.n); if (q.findAt) given.set(q.needs, Math.min(given.get(q.needs) ?? 99, c.n)); }
  for (const s of c.steps) if (s.helpItem) add(s.helpItem, c.n);
}
const all = new Set([...given.keys(), ...used.keys()]);
for (const i of [...all].sort()) {
  const g = given.get(i); const u = used.get(i) ?? [];
  const later = u.filter((x) => g !== undefined && x > g);
  const flag = g === undefined ? 'NUNCA DADO' : g === 16 ? 'final' : later.length ? 'ok' : 'SEM USO POSTERIOR';
  console.log(`${i.padEnd(18)} dado:${g ?? '-'} usado:${u.join(',') || '-'}  ${flag}`);
}
