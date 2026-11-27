import { useEffect, useMemo, useRef, useState } from 'react';
import type { Look } from '../../data/types';
import { DEFAULT_LOOK, SKIN, HAIR, TUNIC, MANTLE } from '../../data/looks';
import { recolor, FW, FH } from '../../game/gfx/recolor';
import { store } from '../../core/store';
import { sfx } from '../../audio/audio';
import { goChapter } from './Title';
import { Motes } from '../common';

export function SpritePreview({ look, scale = 5 }: { look: Look; scale?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sheet = useMemo(() => recolor(look), [look]);
  useEffect(() => {
    let f = 0, raf = 0, last = 0, t0 = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 140) return;
      last = now;
      const c = ref.current;
      if (!c) return;
      const g = c.getContext('2d')!;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, c.width, c.height);
      const row = Math.floor((now - t0) / 2400) % 4; // gira: frente, esquerda, costas, direita
      const order = [0, 1, 3, 2][row];
      f = (f + 1) % 4;
      g.fillStyle = 'rgba(30,20,10,.3)';
      g.beginPath();
      g.ellipse(c.width / 2, c.height - 6, 12 * scale * 0.6, 3 * scale * 0.6, 0, 0, Math.PI * 2);
      g.fill();
      g.drawImage(sheet, f * FW, order * FH, FW, FH, 0, 0, FW * scale, FH * scale);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [sheet, scale]);
  return <canvas ref={ref} width={FW * scale} height={FH * scale} className="pixelated" />;
}

function Swatches({ label, colors, value, onPick }: { label: string; colors: string[]; value: string; onPick: (c: string) => void }) {
  return (
    <div>
      <div className="title mb-1 text-sm font-bold">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            aria-label={`${label} ${c}`}
            onClick={() => { sfx('blip'); onPick(c); }}
            className={`h-8 w-8 rounded border-2 transition ${value === c ? 'scale-110 border-[#2a1a10] ring-2 ring-[#d9a441]' : 'border-[#7a5230]'}`}
            style={{ background: c }}
          />
        ))}
        <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded border-2 border-dashed border-[#7a5230] text-center text-lg leading-7" title="Cor personalizada">
          +
          <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={value} onChange={(e) => onPick(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export default function Create() {
  const [name, setName] = useState('João Marcos');
  const [look, setLook] = useState<Look>({ ...DEFAULT_LOOK });
  const set = (k: keyof Look, v: any) => setLook((l) => ({ ...l, [k]: v }));
  const random = () => {
    const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
    setLook({ skin: pick(SKIN), hair: pick(HAIR), tunic: pick(TUNIC), mantle: pick(MANTLE), beard: Math.random() < 0.3 });
    sfx('select');
  };
  const start = () => {
    const nm = name.trim().slice(0, 20) || 'João Marcos';
    store.startNew(nm, look);
    sfx('quest');
    goChapter(1);
  };
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_center,#3a2616,#120b06)] p-3">
      <Motes n={14} />
      <div className="parch relative z-10 my-auto grid w-full max-w-3xl gap-5 p-5 sm:grid-cols-[auto_1fr] fade-in">
        <div className="flex flex-col items-center gap-2">
          <h2 className="title text-center text-2xl font-bold text-[#5a2a10]">Seu peregrino</h2>
          <div className="rounded-lg border-2 border-[#7a5230] bg-[#c9b07a]/50 p-3">
            <SpritePreview look={look} />
          </div>
          <button className="btn text-sm" onClick={random}>🎲 Aleatório</button>
          <p className="max-w-[15rem] text-center text-xs opacity-80">Baseado na skin de João Marcos: túnica, manto, sandálias, bolsa de couro e pergaminho.</p>
        </div>
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="title text-sm font-bold">Nome do jogador</span>
            <input
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border-2 border-[#7a5230] bg-[#fbf2da] px-3 py-2 text-lg outline-none focus:border-[#2a1a10]"
            />
          </label>
          <Swatches label="Tom de pele" colors={SKIN} value={look.skin} onPick={(c) => set('skin', c)} />
          <Swatches label="Cabelo" colors={HAIR} value={look.hair} onPick={(c) => set('hair', c)} />
          <Swatches label="Túnica" colors={TUNIC} value={look.tunic} onPick={(c) => set('tunic', c)} />
          <Swatches label="Manto" colors={MANTLE} value={look.mantle} onPick={(c) => set('mantle', c)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!look.beard} onChange={(e) => set('beard', e.target.checked)} className="h-4 w-4 accent-[#7a5230]" />
            Barba
          </label>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button className="btn" onClick={() => store.setUi({ screen: 'title' })}>Voltar</button>
            <button className="btn btn-gold" onClick={start}>Iniciar a jornada ➜</button>
          </div>
        </div>
      </div>
    </div>
  );
}
