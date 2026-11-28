import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { bus, worldInfo } from '../../core/bus';
import { getChapter } from '../../data/chapters';
import { legendStatus, hasFlag } from '../../core/story';
import { breakdown, percent, playerLevel, totalBest } from '../../core/progression';
import { sfx } from '../../audio/audio';
import { Bar, Portrait } from '../common';

export function useWorldTick() {
  const [, set] = useState(0);
  useEffect(() => { const off = bus.on('world-tick', () => set((x) => x + 1)); return () => { off(); }; }, []);
}

export function MiniMap({ size = 150, big = false }: { size?: number; big?: boolean }) {
  useWorldTick();
  const w = worldInfo;
  if (!w.minimap) return null;
  const H = Math.round((size * w.h) / w.w);
  const pos = (x: number, y: number) => ({ left: (x / w.w) * size, top: (y / w.h) * H });
  return (
    <div className="relative overflow-hidden rounded border-2 border-[#2a1a10] shadow-lg" style={{ width: size, height: H }}>
      <img src={w.minimap} className="pixelated absolute inset-0 h-full w-full" alt="" draggable={false} />
      {big && w.zones.map((z) => (
        <span key={z.name} className="pixel absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/55 px-1 text-[7px] text-[#fbe9c4]" style={pos(z.x, z.y)}>
          {z.found ? z.name : '???'}
        </span>
      ))}
      {w.scrolls.map((sc, i) => (
        <span key={i} className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#ffe08a] ring-1 ring-[#7a5230]" style={pos(sc.x, sc.y)} title="Pergaminho" />
      ))}
      {w.npcs.map((n, i) => (
        <span key={i} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${n.important ? 'h-2.5 w-2.5 bg-[#ff6a3a]' : 'h-1.5 w-1.5 bg-white/80'}`} style={pos(n.x, n.y)} />
      ))}
      {w.objective && <span className="absolute -translate-x-1/2 -translate-y-full text-[12px] leading-none" style={pos(w.objective.x, w.objective.y)}>⭐</span>}
      <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#2a7ad8] shadow" style={pos(w.player.x, w.player.y)} />
    </div>
  );
}

export default function Hud() {
  const s = useStore();
  const save = s.save!;
  const u = s.ui;
  const def = getChapter(u.chapter);
  const p = s.progress(u.chapter);
  const b = breakdown(def, p);
  const pct = percent(def, p);
  const lvl = playerLevel();
  const cur = def.steps.find((x) => !p.steps.includes(x.id));
  const [questOpen, setQuestOpen] = useState(false);
  const open = (panel: any) => { sfx('open'); store.setUi({ panel }); };
  const legend = legendStatus();
  const trail = def.n === 1 && hasFlag('rastro') && !hasFlag('letter-read');
  const objective = trail ? '◆ O Rastro Esquecido: siga o pingente até a caverna' : cur ? cur.title : def.story ? 'Concluído ✔' : p.messageRead ? 'Capítulo concluído ✔' : 'Abra a Mensagem do Capítulo';
  return (
    <>
      {/* topo: personagem + minimapa */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2">
        <div className="pointer-events-auto flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="wood flex items-center gap-2 px-2 py-1.5">
            <Portrait look={save.player.look} size={40} id="hud" />
            <div className="min-w-0 flex-1 text-[11px] leading-tight">
              <div className="title truncate text-[15px] font-bold">{save.player.name}</div>
              <div className="opacity-90">Nv {lvl.level} · {lvl.title}</div>
              <Bar value={lvl.xp} className="my-0.5" color="#7ad86a" />
              <div className="flex justify-between gap-1">
                <span>⭐ {def.story ? totalBest().toLocaleString('pt-BR') : b.total} PJ</span>
                {!def.story && <span className="opacity-75">Total {totalBest().toLocaleString('pt-BR')}</span>}
              </div>
            </div>
          </div>
          {/* missão: uma linha sempre visível, toque para ver a lista */}
          <button className="wood w-full px-2 py-1 text-left text-[11px] leading-tight" onClick={() => setQuestOpen((x) => !x)}>
            <div className="flex justify-between"><span className="title font-bold">📜 MISSÃO · {pct}%</span><span>{questOpen ? '▾' : '▸'}</span></div>
            <div className="truncate opacity-95">➤ {objective}</div>
          </button>
          {questOpen && (
            <div className="parch max-h-[46vh] overflow-y-auto p-2 text-xs leading-snug fade-in">
              {cur && (
                <>
                  <div className="title text-[13px] font-bold text-[#5a2a10]">{cur.title}</div>
                  <div className="mb-1.5">{cur.hint}</div>
                </>
              )}
              {!cur && !def.story && !p.messageRead && (
                <div className="mb-1"><b className="title">Mensagem do Capítulo</b><br />Encontre o grande pergaminho brilhante{def.scrolls.length > p.scrolls.length ? ` — e os ${def.scrolls.length - p.scrolls.length} registro(s) que faltam` : ''}.</div>
              )}
              <Bar value={pct / 100} className="my-1" />
              <ul className="mt-1 space-y-0.5">
                {def.steps.map((st) => (
                  <li key={st.id} className={p.steps.includes(st.id) ? 'line-through opacity-55' : st === cur ? 'font-bold' : 'opacity-70'}>
                    {p.steps.includes(st.id) ? '✔' : st === cur ? '➤' : '○'} {st.title}
                  </li>
                ))}
                {def.scrolls.length > 0 && <li className="opacity-80">📜 Pergaminhos: {p.scrolls.length}/{def.scrolls.length}</li>}
              </ul>
            </div>
          )}
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-1">
          <button onClick={() => open('map')} aria-label="Abrir mapa"><MiniMap size={104} /></button>
          <div className="wood max-w-[8.5rem] px-2 py-0.5 text-right text-[10px] leading-tight">
            <div className="title truncate font-bold">📍 {u.location}</div>
            <div className="truncate opacity-85">{def.story ? def.story.label : `Marcos ${def.n} · ${def.title}`}</div>
          </div>
          {legend.known && (
            <button className="wood px-2 py-0.5 text-[10px] font-bold" onClick={() => open('legend')} aria-label="Missão lendária">
              ◆ {legend.fragments}/16
            </button>
          )}
        </div>
      </div>

      {/* contador de desafio */}
      {u.counter && (
        <div className="parch pointer-events-none absolute left-1/2 top-[8.6rem] z-30 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-center fade-in">
          <div className="title text-xs font-bold">🏆 {u.counter.label}</div>
          <div className="pixel text-[10px]">
            {u.counter.have}/{u.counter.need}
            {u.counter.time !== undefined && <span className={u.counter.time <= 10 ? 'ml-3 text-red-700' : 'ml-3'}>⏳ {u.counter.time}s</span>}
          </div>
        </div>
      )}
      {u.hotcold !== null && (
        <div className="wood pointer-events-none absolute left-1/2 top-[11.4rem] z-30 w-52 -translate-x-1/2 px-3 py-1 text-center text-[11px]">
          {u.hotcoldLabel ?? '👂 Ouvindo a voz…'}
          <Bar value={u.hotcold} color={u.hotcold > 0.75 ? '#ff6a3a' : u.hotcold > 0.45 ? '#e8b84e' : '#6aa8d8'} className="mt-1" />
        </div>
      )}
    </>
  );
}
