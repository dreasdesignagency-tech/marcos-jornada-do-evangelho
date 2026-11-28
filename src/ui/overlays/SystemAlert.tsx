import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { sfx } from '../../audio/audio';

/** Alerta do sistema: linhas digitadas em estilo terminal. Toque para continuar. */
export default function SystemAlert() {
  const s = useStore();
  const a = s.ui.alert;
  const [n, setN] = useState(0); // linhas visíveis
  const [chars, setChars] = useState(0);
  useEffect(() => { setN(0); setChars(0); if (a) sfx(a.tone === 'danger' ? 'error' : 'glitch'); }, [a]);
  useEffect(() => {
    if (!a || n >= a.lines.length) return;
    const line = a.lines[n];
    if (chars < line.length) {
      const t = setTimeout(() => setChars((c) => c + 2), 18);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setN((x) => x + 1); setChars(0); sfx('blip'); }, 380);
    return () => clearTimeout(t);
  }, [a, n, chars]);
  if (!a) return null;
  const done = n >= a.lines.length;
  const color = a.tone === 'danger' ? '#ff4a5a' : a.tone === 'legend' ? '#ffd86a' : '#7af6ff';
  const close = () => {
    if (!done) { setN(a.lines.length); return; }
    const r = a.resolve;
    store.setUi({ alert: null });
    r();
  };
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={close}>
      <div
        className="relative w-full max-w-xl overflow-hidden rounded border-2 bg-[#07060c]/95 p-5 shadow-2xl"
        style={{ borderColor: color, boxShadow: `0 0 28px ${color}55` }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(0deg, #fff1 0 1px, transparent 1px 3px)' }} />
        <p className="sys-line mb-3 opacity-60" style={{ color }}>◈ REDE REFÚGIO · TRANSMISSÃO</p>
        {a.lines.map((l, i) => i <= n && (
          <p key={i} className={`sys-line ${i === n && !done ? 'caret' : ''} ${l.startsWith('◆') ? 'glitch' : ''}`} style={{ color }}>
            {i < n ? l : l.slice(0, chars)}
          </p>
        ))}
        {done && <p className="sys-line mt-4 animate-pulse text-right text-[9px] text-white/70">▼ toque para continuar</p>}
      </div>
    </div>
  );
}
