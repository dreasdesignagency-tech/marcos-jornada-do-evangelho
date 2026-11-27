import { useMemo, useState } from 'react';
import { CHAPTERS } from '../../data/chapters';
import type { ChapterDef } from '../../data/types';
import { store, useStore } from '../../core/store';
import { breakdown, percent, resetChapterRun } from '../../core/progression';
import { buildMap } from '../../game/maps/builder';
import { PAL } from '../../game/gfx/procgen';
import { sfx } from '../../audio/audio';
import { goChapter } from './Title';
import { Bar } from '../common';

const ICON = ['🌊', '🏠', '⛰️', '🌾', '🕯️', '🍞', '❤️', '🧭', '✨', '🛤️', '🌴', '🏛️', '🔥', '🌙', '✝️', '🌅'];

const thumbs = new Map<number, string>();
export function thumbnail(def: ChapterDef): string {
  if (thumbs.has(def.n)) return thumbs.get(def.n)!;
  let url = 'assets/maps/galileia.webp';
  if (def.map.kind === 'proc') {
    const m = buildMap(def.map);
    const c = document.createElement('canvas');
    c.width = m.w;
    c.height = m.h;
    const g = c.getContext('2d')!;
    const col: Record<string, string> = {
      grass: PAL.grass[1], grass2: PAL.grass[2], dgrass: PAL.dgrass[1], darkgrass: PAL.darkgrass[1], sand: PAL.sand[0], dirt: PAL.dirt[0],
      stone: PAL.stone[0], marble: PAL.marble[0], rock: PAL.rock[0], water: PAL.water[0], deep: PAL.deep[0], field: '#8a6a3a', soil: '#7a5a34',
      cliff: PAL.rock[2], wall: PAL.adobe[2], flowers: '#7ab04a', mountain: '#b49a78', floor: '#9a7a5a', snow: '#f0f0f4',
    };
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { g.fillStyle = col[m.grid[y][x]] ?? '#888'; g.fillRect(x, y, 1, 1); }
    for (const o of m.objects) {
      if (['house', 'temple', 'tower', 'gate'].includes(o.o)) {
        g.fillStyle = o.o === 'temple' ? '#efe4c8' : '#e2c08e';
        g.fillRect(o.x - (o.w ?? 4) / 2, o.y - (o.h ?? 3) + 1, o.w ?? 4, o.h ?? 3);
      } else if (['tree', 'olive', 'palm', 'fig'].includes(o.o)) {
        g.fillStyle = o.o === 'olive' ? '#5a7a4a' : '#2f6e22';
        g.fillRect(o.x - 1, o.y - 1, 2, 2);
      }
    }
    url = c.toDataURL();
  }
  thumbs.set(def.n, url);
  return url;
}

export default function Chapters() {
  const s = useStore();
  const save = s.save!;
  const [sel, setSel] = useState<number | null>(null);
  const cards = useMemo(() => CHAPTERS.map((d) => ({ d, thumb: thumbnail(d) })), []);
  return (
    <div className="h-full w-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,#3a2616,#120b06)] px-3 py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="title text-3xl font-bold text-[#f6e3b0]">Capítulos</h1>
          <button className="btn" onClick={() => store.setUi({ screen: 'title' })}>← Menu</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ d, thumb }) => {
            const p = save.chapters[d.n];
            const locked = d.n > save.unlocked;
            const pct = p ? Math.max(p.bestPct, percent(d, p)) : 0;
            const best = p ? Math.max(p.best, breakdown(d, p).total) : 0;
            const isRef = d.map.kind === 'ref';
            const z = d.zones[0];
            return (
              <button
                key={d.n}
                disabled={locked}
                onClick={() => { sfx('select'); setSel(d.n); }}
                className={`parch group relative overflow-hidden p-0 text-left transition ${locked ? 'opacity-60 grayscale' : 'hover:-translate-y-1'}`}
              >
                <div
                  className="pixelated relative h-28 w-full border-b-2 border-[#7a5230] bg-cover"
                  style={{
                    backgroundImage: `url(${thumb})`,
                    backgroundPosition: isRef ? `${(z.at[0] / 48) * 100}% ${(z.at[1] / 32) * 100}%` : 'center',
                    backgroundSize: isRef ? '300%' : 'cover',
                    imageRendering: 'pixelated',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute left-2 top-2 text-2xl drop-shadow">{locked ? '🔒' : ICON[d.n - 1]}</span>
                  {p?.completed && <span className="pixel absolute right-2 top-2 rounded bg-[#d9a441] px-1.5 py-1 text-[8px] text-[#2a1a10]">CONCLUÍDO</span>}
                  <span className="title absolute bottom-1 left-2 text-sm font-bold text-[#fbe9c4]">Marcos {d.n}</span>
                </div>
                <div className="p-3">
                  <div className="title text-base font-bold leading-tight">{d.title}</div>
                  <div className="mb-2 text-xs opacity-75">{d.setting}</div>
                  <Bar value={pct / 100} />
                  <div className="mt-1 flex justify-between text-xs">
                    <span>{pct}% concluído</span>
                    <span className="font-bold">{best} / 1.000 PJ</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {sel !== null && (() => {
        const d = CHAPTERS[sel - 1];
        const p = save.chapters[sel];
        const started = p && (p.steps.length || p.zones.length);
        return (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={() => setSel(null)}>
            <div className="parch w-full max-w-md p-5 fade-in" onClick={(e) => e.stopPropagation()}>
              <p className="ref">{d.ref} · {d.setting}</p>
              <h2 className="title mb-2 text-2xl font-bold">{d.title}</h2>
              <p className="mb-4 text-sm">{d.intro}</p>
              <div className="flex flex-wrap justify-end gap-2">
                <button className="btn" onClick={() => setSel(null)}>Fechar</button>
                {p?.completed && (
                  <button className="btn" onClick={() => { resetChapterRun(sel); goChapter(sel); }}>Rejogar</button>
                )}
                <button className="btn btn-gold" onClick={() => goChapter(sel)}>{started ? 'Continuar' : 'Jogar'}</button>
              </div>
              {p?.completed && <p className="mt-3 text-xs opacity-75">Ao rejogar, a fase recomeça, mas sua melhor pontuação continua salva.</p>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
