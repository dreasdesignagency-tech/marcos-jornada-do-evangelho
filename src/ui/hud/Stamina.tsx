// Barra de estamina (corrida/pulo) na parte de baixo da tela.
import { useEffect, useState } from 'react';
import { bus, staminaInfo } from '../../core/bus';

export default function Stamina() {
  const [, set] = useState(0);
  useEffect(() => {
    const off = bus.on('stamina', () => set((x) => x + 1));
    return () => { off(); };
  }, []);
  const { value, exhausted, running } = staminaInfo;
  const pct = Math.round(value * 100);
  const color = exhausted ? '#d8503a' : value < 0.3 ? '#e8b84e' : '#7ad86a';
  const full = value >= 1 && !running;
  return (
    <div
      className={`pointer-events-none absolute bottom-3 left-1/2 z-30 w-[min(16rem,46vw)] -translate-x-1/2 transition-opacity duration-500 sm:bottom-[4.4rem] ${full ? 'opacity-60' : 'opacity-100'}`}
      aria-label={`Estamina ${pct}%`}
    >
      <div className="wood flex items-center gap-2 px-2 py-1">
        <span className={`text-sm leading-none ${exhausted ? 'animate-pulse' : ''}`} title="Estamina (Shift para correr)">🏃</span>
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-sm border border-[#2a1a10] bg-[#2a1a10]/60">
          <div className="h-full transition-[width] duration-75 ease-linear" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="pixel w-7 text-right text-[8px] leading-none">{pct}%</span>
      </div>
    </div>
  );
}
