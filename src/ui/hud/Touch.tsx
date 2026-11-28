import { useRef, useState } from 'react';
import { store, useStore } from '../../core/store';
import { bus } from '../../core/bus';
import { sfx } from '../../audio/audio';
import { hasFlag } from '../../core/story';

const isTouch = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 640);

export default function Touch() {
  const s = useStore();
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);
  if (!isTouch()) return null;
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
        className="absolute bottom-6 left-6 z-30 h-32 w-32 touch-none rounded-full border-4 border-[#2a1a10]/70 bg-[#f2e4c0]/25 backdrop-blur-[1px]"
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
      <div className="absolute bottom-6 right-4 z-30 flex flex-col items-end gap-2">
        {s.ui.interactHint && <div className="wood max-w-[11rem] px-2 py-1 text-right text-xs">{s.ui.interactHint}</div>}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-2">
            {btn('🎒', () => open('inventory'), 'h-11 w-11')}
            {btn('📖', () => open('journal'), 'h-11 w-11')}
          </div>
          <div className="flex flex-col gap-2">
            {btn('📜', () => open('scrolls'), 'h-11 w-11')}
            {btn('🙏', () => bus.emit('pray'), 'h-11 w-11')}
          </div>
          {btn('E', () => bus.emit('interact'), `btn-gold h-20 w-20 text-2xl title ${s.ui.interactHint ? 'animate-pulse' : ''}`)}
        </div>
        <div className="flex gap-2">
          {hasFlag('legend') && btn('◆', () => open('legend'), 'h-9 w-9 text-sm')}
          {btn('🗺', () => open('map'), 'h-9 w-9 text-sm')}
          {btn('⏸', () => open('pause'), 'h-9 w-9 text-sm')}
        </div>
      </div>
    </>
  );
}
