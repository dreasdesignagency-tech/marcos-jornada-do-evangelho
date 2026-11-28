import { useEffect, type ReactNode } from 'react';
import type { Look } from '../data/types';
import { portraitCached } from '../game/gfx/recolor';
import { getChapter } from '../data/chapters';
import { LOOKS, resolveLook } from '../data/looks';
import { store } from '../core/store';
import { sfx } from '../audio/audio';

export function Portrait({ look, size = 64, id = 'p', className = '' }: { look: Look; size?: number; id?: string; className?: string }) {
  return (
    <img
      src={portraitCached(id, look, 96)}
      width={size}
      height={size}
      className={`pixelated rounded-sm border-2 border-[#2a1a10] bg-[#c9a874] ${className}`}
      alt=""
      draggable={false}
    />
  );
}

/** Quem está falando: nome e aparência. */
export function speaker(who: string | undefined, chapter: number): { name: string; look: Look | null } {
  if (!who || who === 'narrador') return { name: 'Narrador', look: null };
  if (who === 'marcos') return { name: store.save?.player.name ?? 'Elias', look: store.save?.player.look ?? null };
  if (who === 'sistema') return { name: 'REFÚGIO · Sistema', look: null };
  if (who === 'eden') return { name: 'ÉDEN', look: null };
  if (who === 'porteiro') return { name: 'Porteiro', look: LOOKS.agente };
  const def = getChapter(chapter);
  const n = def?.npcs.find((x) => x.id === who);
  if (n) return { name: n.name, look: resolveLook(n.look) };
  // personagens recorrentes da história em outros cenários
  const cast: Record<string, [string, string]> = { abigail: ['Abigail', 'abigail'], noe: ['Noé', 'noe'], sara: ['Sara', 'sara'], samuel: ['Samuel', 'samuel'] };
  if (cast[who]) return { name: cast[who][0], look: LOOKS[cast[who][1]] };
  if (who === 'jesus') return { name: 'Jesus', look: LOOKS.jesus };
  return { name: who, look: LOOKS[who] ?? null };
}

export function Panel({ title, onClose, children, wide = false }: { title: string; onClose?: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-3 fade-in" onClick={onClose}>
      <div
        className={`parch relative flex max-h-[92vh] w-full flex-col ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[#7a5230]/50 px-5 py-3">
          <h2 className="title text-xl font-bold text-[#5a2a10] sm:text-2xl">{title}</h2>
          {onClose && (
            <button className="btn px-3 py-1 text-sm" onClick={() => { sfx('select'); onClose(); }} aria-label="Fechar">
              ✕
            </button>
          )}
        </div>
        <div className="scrollbar overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function useKey(key: string, fn: (e: KeyboardEvent) => void, deps: any[] = []) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase() || e.code === key) fn(e);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m.toString().padStart(2, '0')}min` : `${m}min ${(s % 60).toString().padStart(2, '0')}s`;
}

export function Bar({ value, color = '#d9a441', className = '' }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-2.5 overflow-hidden rounded-sm border border-[#2a1a10] bg-[#2a1a10]/60 ${className}`}>
      <div className="h-full transition-all duration-500" style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, background: color }} />
    </div>
  );
}

export function Motes({ n = 24 }: { n?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="mote"
          style={{ left: `${(i * 37) % 100}%`, bottom: `-${(i * 13) % 20}px`, animationDuration: `${9 + ((i * 7) % 9)}s`, animationDelay: `${(i * 0.7) % 8}s` }}
        />
      ))}
    </div>
  );
}
