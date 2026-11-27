import { useEffect } from 'react';
import { store, useStore } from '../../core/store';
import { bus } from '../../core/bus';
import { sfx } from '../../audio/audio';
import { Motes } from '../common';

/** Transição cinematográfica de abertura de cada capítulo. */
export default function Cinematic() {
  const s = useStore();
  const c = s.ui.cinematic;
  useEffect(() => {
    if (!c) return;
    sfx('chime');
    const close = () => {
      if (!store.ui.cinematic) return;
      store.setUi({ cinematic: null });
      bus.emit('cinematic-closed');
    };
    const t = setTimeout(close, 5200);
    const k = (e: KeyboardEvent) => { if (e.code === 'Space' || e.key === 'Enter' || e.key === 'e') { e.stopPropagation(); close(); } };
    window.addEventListener('keydown', k, true);
    (window as any).__closeCine = close;
    return () => { clearTimeout(t); window.removeEventListener('keydown', k, true); };
  }, [c]);
  if (!c) return null;
  return (
    <div
      className="absolute inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center bg-black text-center text-[#f6e3b0]"
      style={{ animation: 'cine 5.2s ease both' }}
      onClick={() => (window as any).__closeCine?.()}
    >
      <style>{`@keyframes cine { 0% { opacity: 1 } 85% { opacity: 1 } 100% { opacity: 0 } } @keyframes rise { from { opacity: 0; letter-spacing: .5em } to { opacity: 1; letter-spacing: .08em } }`}</style>
      <Motes n={18} />
      <p className="pixel mb-4 text-[10px] tracking-[0.4em] text-[#d9a441]" style={{ animation: 'rise 1.6s ease both' }}>✦ ✦ ✦</p>
      <h1 className="title px-4 text-3xl font-bold sm:text-5xl" style={{ animation: 'rise 1.8s ease both' }}>{c.title}</h1>
      <p className="mt-3 px-4 text-lg italic opacity-90" style={{ animation: 'rise 2.4s ease both' }}>{c.sub}</p>
    </div>
  );
}
