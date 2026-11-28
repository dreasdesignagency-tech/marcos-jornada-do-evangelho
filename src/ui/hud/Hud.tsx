import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { bus, worldInfo } from '../../core/bus';
import { getChapter } from '../../data/chapters';
import { legendStatus, hasFlag } from '../../core/story';
import { ITEMS } from '../../data/items';
import { breakdown, percent, playerLevel, totalBest } from '../../core/progression';
import { sfx } from '../../audio/audio';
import { Bar, Portrait } from '../common';
import { toggleFullscreen } from '../fullscreen';

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
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const [questOpen, setQuestOpen] = useState(window.innerWidth > 700 && !touch);
  const open = (panel: any) => { sfx('open'); store.setUi({ panel }); };
  const recent = save.inventory.slice(-4).reverse();
  return (
    <>
      {/* superior esquerdo */}
      <div className="wood pointer-events-auto absolute left-2 top-2 z-30 flex items-center gap-2 px-2 py-1.5 sm:gap-3">
        <Portrait look={save.player.look} size={44} id="hud" />
        <div className="min-w-[8.5rem] text-xs leading-tight sm:min-w-[11rem]">
          <div className="title truncate text-sm font-bold">{save.player.name}</div>
          <div className="opacity-90">Nv {lvl.level} · {lvl.title}</div>
          <Bar value={lvl.xp} className="my-1" color="#7ad86a" />
          <div className="flex justify-between gap-2">{def.story ? <span>⭐ {totalBest().toLocaleString('pt-BR')} PJ</span> : <><span>⭐ {b.total} PJ</span><span className="opacity-75">Total {totalBest().toLocaleString('pt-BR')}</span></>}</div>
        </div>
      </div>

      {/* superior direito */}
      <div className="pointer-events-auto absolute right-2 top-2 z-30 flex flex-col items-end gap-1">
        <button onClick={() => open('map')} aria-label="Abrir mapa" className="hidden sm:block"><MiniMap size={150} /></button>
        <button onClick={() => open('map')} aria-label="Abrir mapa" className="sm:hidden"><MiniMap size={96} /></button>
        <div className="wood px-2 py-1 text-right text-[11px] leading-tight">
          <div className="title font-bold">📍 {u.location}</div>
          <div className="opacity-85">{def.story ? def.story.label : `Marcos ${def.n} · ${def.title}`}</div>
        </div>
        {legendStatus().known && (
          <button className="wood px-2 py-0.5 text-[11px] font-bold" onClick={() => open('legend')} aria-label="Missão lendária">
            ◆ O Último Chamado · {legendStatus().fragments}/16
          </button>
        )}
      </div>

      {/* lateral esquerda: missão */}
      <div className="pointer-events-auto absolute left-2 top-[5.9rem] z-30 w-[min(18rem,calc(100vw-1rem))]">
        <button className="wood w-full px-2 py-1 text-left text-xs" onClick={() => setQuestOpen((x) => !x)}>
          <span className="title font-bold">📜 Missão · {pct}%</span> <span className="float-right">{questOpen ? '▾' : '▸'}</span>
        </button>
        {questOpen && (
          <div className="parch mt-1 p-2 text-xs leading-snug fade-in">
            {def.n === 1 && hasFlag('rastro') && !hasFlag('letter-read') && (
              <div className="mb-1.5 font-bold text-[#1a6a7a]">◆ O Rastro Esquecido: siga a reação do pingente até a caverna ao norte.</div>
            )}
            {cur ? (
              <>
                <div className="title text-[13px] font-bold text-[#5a2a10]">{cur.title}</div>
                <div className="mb-1.5">{cur.hint}</div>
              </>
            ) : def.story ? (
              <div className="title font-bold">Concluído ✔</div>
            ) : p.messageRead ? (
              <div className="title font-bold text-[#2f6e22]">Capítulo concluído! ✔</div>
            ) : (
              <div><b className="title">Mensagem do Capítulo</b><br />Encontre o grande pergaminho brilhante{def.scrolls.length > p.scrolls.length ? ` — e os ${def.scrolls.length - p.scrolls.length} registro(s) que faltam` : ''}.</div>
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

      {/* contador de desafio */}
      {u.counter && (
        <div className="parch pointer-events-none absolute left-1/2 top-2 z-30 -translate-x-1/2 px-4 py-1.5 text-center fade-in">
          <div className="title text-sm font-bold">🏆 {u.counter.label}</div>
          <div className="pixel text-[11px]">
            {u.counter.have}/{u.counter.need}
            {u.counter.time !== undefined && <span className={u.counter.time <= 10 ? 'ml-3 text-red-700' : 'ml-3'}>⏳ {u.counter.time}s</span>}
          </div>
        </div>
      )}
      {u.hotcold !== null && (
        <div className="wood pointer-events-none absolute left-1/2 top-16 z-30 w-56 -translate-x-1/2 px-3 py-1.5 text-center text-xs">
          {u.hotcoldLabel ?? '👂 Ouvindo a voz…'}
          <Bar value={u.hotcold} color={u.hotcold > 0.75 ? '#ff6a3a' : u.hotcold > 0.45 ? '#e8b84e' : '#6aa8d8'} className="mt-1" />
        </div>
      )}

      {/* parte inferior */}
      {!touch && <div className="pointer-events-auto absolute bottom-2 left-1/2 z-30 hidden -translate-x-1/2 items-end gap-2 sm:flex">
        <div className="wood flex items-center gap-1 px-2 py-1">
          {recent.map((id) => (
            <span key={id} title={ITEMS[id]?.name} className="flex h-9 w-9 items-center justify-center rounded border border-[#2a1a10] bg-[#2a1a10]/40 text-xl">{ITEMS[id]?.icon}</span>
          ))}
          {Array.from({ length: Math.max(0, 4 - recent.length) }).map((_, i) => <span key={i} className="h-9 w-9 rounded border border-[#2a1a10] bg-[#2a1a10]/30" />)}
          <button className="btn ml-1 px-2 py-1 text-xs" onClick={() => open('inventory')}>🎒 I</button>
        </div>
        <button
          className={`btn btn-gold min-w-[10rem] px-3 py-2 text-sm ${u.interactHint ? 'animate-pulse' : 'opacity-60'}`}
          onClick={() => bus.emit('interact')}
        >
          {u.interactHint ? `E · ${u.interactHint}` : 'E · Interagir'}
        </button>
        <div className="wood flex gap-1 px-2 py-1">
          <button className="btn px-2 py-1 text-xs" onClick={() => open('journal')}>📖 J</button>
          <button className="btn px-2 py-1 text-xs" onClick={() => open('scrolls')}>📜 P</button>
          {legendStatus().known && <button className="btn px-2 py-1 text-xs" onClick={() => open('legend')}>◆ L</button>}
          <button className="btn px-2 py-1 text-xs" onClick={() => open('pause')}>⏸ Esc</button>
          <button className="btn px-2 py-1 text-xs" title="Tela cheia (F)" onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); toggleFullscreen(); }}>⛶ F</button>
        </div>
      </div>}
    </>
  );
}
