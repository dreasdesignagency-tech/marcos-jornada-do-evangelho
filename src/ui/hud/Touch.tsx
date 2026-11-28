import { useRef, useState } from 'react';
import { store, useStore } from '../../core/store';
import { bus } from '../../core/bus';
import { sfx } from '../../audio/audio';
import { hasFlag } from '../../core/story';

export default function Touch() {
  const s = useStore();
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);
  const R = 48;
  const move = (cx: number, cy: number) => {
    const r = base.current!.getBoundingClientRect();
    let dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
    setKnob({ x: dx, y: dy });
    store.ui.touch = { x: dx / R, y: dy / R }; // lido a cada quadro pela cena (sem re-render)
  };
  const end = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    store.ui.touch = { x: 0, y: 0 };
  };
  const btn = (label: string, fn: () => void, cls = '') => (
    <button
      className={`btn flex items-center justify-center rounded-full p-0 text-lg ${cls}`}
      onPointerDown={(e) => { e.preventDefault(); fn(); }}
    >
      {label}
    </button>
  );
  const open = (panel: any) => { sfx('open'); store.setUi({ panel }); };
  return (
    <>
      <div
        ref={base}
        className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-5 z-30 h-32 w-32 touch-none rounded-full border-4 border-[#2a1a10]/70 bg-[#f2e4c0]/20 backdrop-blur-[1px]"
        onPointerDown={(e) => { active.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e.clientX, e.clientY); }}
        onPointerMove={(e) => active.current === e.pointerId && move(e.clientX, e.clientY)}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-4 border-[#2a1a10] bg-[#d9a441] shadow-lg"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <div className="absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-3 z-30 flex flex-col items-end gap-2">
        {s.ui.interactHint && <div className="wood max-w-[12rem] px-2 py-1 text-right text-xs font-bold">{s.ui.interactHint}</div>}
        <div className="grid grid-cols-3 gap-1.5">
          {btn('🎒', () => open('inventory'), 'h-10 w-10 text-base')}
          {btn('📖', () => open('journal'), 'h-10 w-10 text-base')}
          {btn('📜', () => open('scrolls'), 'h-10 w-10 text-base')}
          {btn('🙏', () => bus.emit('pray'), 'h-10 w-10 text-base')}
          {hasFlag('legend') ? btn('◆', () => open('legend'), 'h-10 w-10 text-base') : btn('🗺', () => open('map'), 'h-10 w-10 text-base')}
          {btn('⏸', () => open('pause'), 'h-10 w-10 text-sm')}
        </div>
        {btn('E', () => bus.emit('interact'), `btn-gold h-[4.5rem] w-[4.5rem] text-2xl title ${s.ui.interactHint ? 'animate-pulse' : 'opacity-80'}`)}
      </div>
    </>
  );
}
