import { useEffect, useMemo, useRef, useState } from 'react';
import { store, useStore } from '../../core/store';
import type { ChallengeDef } from '../../data/types';
import { sfx } from '../../audio/audio';
import { Bar } from '../common';

type Props<T extends ChallengeDef['type']> = { def: Extract<ChallengeDef, { type: T }>; help: boolean; done: (ok: boolean) => void };

function shuffle<T>(a: T[], seed = 7) {
  const r = [...a];
  let s = seed;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function Sequence({ def, help, done }: Props<'sequence'>) {
  const pool = useMemo(() => shuffle(def.items, def.items.length * 13), [def]);
  const [order, setOrder] = useState<string[]>(help ? [def.items[0]] : []);
  const [wrong, setWrong] = useState<number[] | null>(null);
  const check = () => {
    const w = order.map((t, i) => (t !== def.items[i] ? i : -1)).filter((i) => i >= 0);
    if (!w.length && order.length === def.items.length) { sfx('quest'); done(true); }
    else { sfx('error'); setWrong(w); }
  };
  return (
    <div>
      <p className="mb-3">{def.prompt}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="title mb-1 text-sm font-bold">Acontecimentos</p>
          <div className="flex flex-col gap-1.5">
            {pool.filter((t) => !order.includes(t)).map((t) => (
              <button key={t} className="btn text-left text-sm" onClick={() => { sfx('blip'); setWrong(null); setOrder([...order, t]); }}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="title mb-1 text-sm font-bold">Seu registro</p>
          <ol className="space-y-1">
            {order.map((t, i) => (
              <li key={t} className={`rounded border-2 px-2 py-1 text-sm ${wrong?.includes(i) ? 'border-[#8a2a1a] bg-[#f6dcd0]' : 'border-[#7a5230]/50 bg-[#fbf2da]'}`}>
                {i + 1}. {t}
              </li>
            ))}
          </ol>
        </div>
      </div>
      {wrong && <p className="mt-2 text-sm font-bold text-[#8a2a1a]">{wrong.length} item(ns) fora de ordem (em vermelho). Reorganize e tente de novo.</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button className="btn" onClick={() => { setOrder(help ? [def.items[0]] : []); setWrong(null); }}>Recomeçar</button>
        <button className="btn btn-gold" disabled={order.length !== def.items.length} onClick={check}>Verificar</button>
      </div>
    </div>
  );
}

function Select({ def, help, done }: Props<'select'>) {
  const opts = useMemo(() => shuffle(def.options, def.options.length * 7), [def]);
  const lockedHelp = help ? def.options.find((o) => o.ok)!.text : null;
  const [sel, setSel] = useState<Set<string>>(new Set(lockedHelp ? [lockedHelp] : []));
  const [res, setRes] = useState<string | null>(null);
  const need = def.options.filter((o) => o.ok).length;
  const check = () => {
    const wrong = opts.filter((o) => sel.has(o.text) && !o.ok).length;
    const right = opts.filter((o) => sel.has(o.text) && o.ok).length;
    if (!wrong && right === need) { sfx('quest'); done(true); }
    else { sfx('error'); setRes(`Você marcou ${right} de ${need} corretos${wrong ? ` e ${wrong} que não pertence(m) a esta lista` : ''}. Tente de novo.`); }
  };
  return (
    <div>
      <p className="mb-3">{def.prompt} <span className="opacity-70">({sel.size}/{need} marcados)</span></p>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {opts.map((o) => {
          const on = sel.has(o.text);
          return (
            <button
              key={o.text}
              className={`btn text-left text-sm ${on ? 'btn-gold' : ''}`}
              disabled={o.text === lockedHelp}
              onClick={() => { sfx('blip'); setRes(null); const n = new Set(sel); on ? n.delete(o.text) : n.add(o.text); setSel(n); }}
            >
              {on ? '☑' : '☐'} {o.text}
            </button>
          );
        })}
      </div>
      {res && <p className="mt-2 text-sm font-bold text-[#8a2a1a]">{res}</p>}
      <div className="mt-3 flex justify-end"><button className="btn btn-gold" onClick={check}>Registrar no pergaminho</button></div>
    </div>
  );
}

function Sort({ def, help, done }: Props<'sort'>) {
  const items = useMemo(() => shuffle(def.items, 3), [def]);
  const [placed, setPlaced] = useState<Record<string, number>>(help ? { [items[0].text]: items[0].cat } : {});
  const [why, setWhy] = useState<string | null>(null);
  const left = items.filter((i) => placed[i.text] === undefined);
  const put = (it: (typeof items)[number], c: 0 | 1) => {
    if (it.cat === c) {
      sfx('item');
      const n = { ...placed, [it.text]: c };
      setPlaced(n);
      setWhy(`✔ ${it.why}`);
      if (Object.keys(n).length === items.length) setTimeout(() => { sfx('quest'); done(true); }, 700);
    } else {
      sfx('error');
      setWhy(`✘ Pense de novo: "${it.text}". ${it.why}`);
    }
  };
  const cur = left[0];
  return (
    <div>
      <p className="mb-3">{def.prompt}</p>
      {cur && (
        <div className="mb-3 rounded border-2 border-[#7a5230] bg-[#fbf2da] p-3 text-center">
          <p className="title mb-2 text-lg font-bold">{cur.text}</p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <button className="btn text-sm" onClick={() => put(cur, 0)}>{def.categories[0]}</button>
            <button className="btn text-sm" onClick={() => put(cur, 1)}>{def.categories[1]}</button>
          </div>
        </div>
      )}
      {why && <p className="mb-2 text-sm">{why}</p>}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[0, 1].map((c) => (
          <div key={c} className="rounded border border-[#7a5230]/50 p-2">
            <p className="title mb-1 text-xs font-bold">{def.categories[c]}</p>
            {items.filter((i) => placed[i.text] === c).map((i) => <div key={i.text}>• {i.text}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Balance({ def, help, done }: Props<'balance'>) {
  const cv = useRef<HTMLCanvasElement>(null);
  const input = useRef(0);
  const [prog, setProg] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let angle = 0, vel = 0, wind = 0, t = 0, p = 0, last = performance.now(), raf = 0, gust = 0;
    const k = (e: KeyboardEvent, d: boolean) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') { input.current = d ? -1 : 0; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') { input.current = d ? 1 : 0; e.preventDefault(); }
    };
    const kd = (e: KeyboardEvent) => k(e, true), ku = (e: KeyboardEvent) => k(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      gust -= dt;
      if (gust <= 0) { wind = (Math.random() - 0.5) * 2 * (help ? 22 : 30); gust = 0.8 + Math.random() * 1.4; }
      vel += (wind + input.current * -70 - angle * 0.6) * dt;
      vel *= 0.97;
      angle += vel * dt * 2;
      if (Math.abs(angle) > 40) {
        sfx('splash');
        setMsg('O barco quase virou! Equilibre de novo.');
        angle = 0; vel = 0; p = Math.max(0, p - def.duration * 0.35);
      }
      p += dt;
      setProg(p / def.duration);
      if (p >= def.duration) { cancelAnimationFrame(raf); done(true); return; }
      const c = cv.current;
      if (!c) return;
      const g = c.getContext('2d')!;
      const W = c.width, H = c.height;
      g.fillStyle = '#1a2a3a'; g.fillRect(0, 0, W, H);
      if (Math.random() < 0.01) { g.fillStyle = '#e0f0ff'; g.fillRect(0, 0, W, H); sfx('thunder'); }
      // chuva
      g.strokeStyle = 'rgba(170,210,255,.5)';
      for (let i = 0; i < 60; i++) { const x = (i * 53 + t * 400) % W, y = (i * 97 + t * 700) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 10); g.stroke(); }
      // ondas
      for (let l = 0; l < 3; l++) {
        g.fillStyle = ['#1f5a8a', '#2a72a8', '#3a8ac0'][l];
        g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) g.lineTo(x, H * 0.62 + l * 14 + Math.sin(x / 30 + t * (2 + l) ) * (10 + Math.abs(wind) / 4));
        g.lineTo(W, H); g.fill();
      }
      // barco
      g.save(); g.translate(W / 2, H * 0.6); g.rotate((angle * Math.PI) / 180);
      g.fillStyle = '#8a5a30'; g.beginPath(); g.moveTo(-90, -10); g.lineTo(90, -10); g.lineTo(65, 25); g.lineTo(-65, 25); g.closePath(); g.fill();
      g.fillStyle = '#6a4024'; g.fillRect(-2, -90, 5, 80);
      g.fillStyle = '#efe6d0'; g.beginPath(); g.moveTo(4, -86); g.lineTo(50 + wind / 2, -40); g.lineTo(4, -18); g.fill();
      g.restore();
      g.fillStyle = '#fff'; g.font = '14px Cinzel'; g.fillText(`Vento ${wind > 0 ? '→' : '←'}`, 10, 20);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);
  const hold = (d: number) => ({ onPointerDown: () => (input.current = d), onPointerUp: () => (input.current = 0), onPointerLeave: () => (input.current = 0) });
  return (
    <div>
      <p className="mb-2">{def.prompt}</p>
      <canvas ref={cv} width={520} height={260} className="w-full rounded border-2 border-[#2a1a10]" />
      <Bar value={prog} className="my-2" color="#6aa8d8" />
      {msg && <p className="text-sm font-bold text-[#8a2a1a]">{msg}</p>}
      <div className="mt-2 flex justify-center gap-4">
        <button className="btn h-14 w-24 text-2xl" {...hold(-1)}>←</button>
        <button className="btn h-14 w-24 text-2xl" {...hold(1)}>→</button>
      </div>
    </div>
  );
}

function Vigil({ def, help, done }: Props<'vigil'>) {
  const [sleep, setSleep] = useState(0);
  const [prog, setProg] = useState(0);
  const [line, setLine] = useState(0);
  const [msg, setMsg] = useState('');
  const sl = useRef(0);
  useEffect(() => {
    let p = 0, last = performance.now(), raf = 0, lt = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sl.current += dt * (help ? 14 : 20) * (1 + p / def.duration);
      if (sl.current >= 100) {
        sl.current = 30;
        p = Math.max(0, p - def.duration * 0.25);
        sfx('error');
        setMsg('Os olhos se fecharam... "Simão, dormes? Não podes vigiar uma hora?" (Mc 14:37). Continue vigiando.');
      }
      p += dt;
      lt += dt;
      if (lt > def.duration / def.lines.length) { lt = 0; setLine((x) => (x + 1) % def.lines.length); }
      setSleep(sl.current);
      setProg(p / def.duration);
      if (p >= def.duration) { cancelAnimationFrame(raf); sfx('pray'); done(true); }
    };
    raf = requestAnimationFrame(loop);
    const k = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); watch(); } };
    window.addEventListener('keydown', k);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', k); };
  }, []);
  const watch = () => { sl.current = Math.max(0, sl.current - 22); sfx('blip'); };
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-3 h-40 overflow-hidden rounded border-2 border-[#2a1a10] bg-[radial-gradient(ellipse_at_center,#2a3a2a,#05080a)]">
        <div className="absolute inset-0 bg-black transition-opacity" style={{ opacity: sleep / 110 }} />
        <p className="relative z-10 flex h-full items-center justify-center px-6 text-lg italic text-[#f2e4c0]">{def.lines[line]}</p>
      </div>
      <p className="mb-2 text-sm">{def.prompt}</p>
      <p className="text-xs">Sono</p>
      <Bar value={sleep / 100} color="#6a5aa8" />
      <p className="mt-2 text-xs">Vigília</p>
      <Bar value={prog} color="#d9a441" />
      {msg && <p className="mt-2 text-sm text-[#8a2a1a]">{msg}</p>}
      <button className="btn btn-gold mt-3 h-14 w-48 text-lg" onPointerDown={watch}>🙏 Vigiar</button>
    </div>
  );
}

const TITLES: Record<string, string> = { sequence: 'Registro dos acontecimentos', select: 'Pergaminho', sort: 'O que vem do coração?', balance: 'A tempestade', vigil: 'Vigília no Getsêmani' };

export default function Minigame() {
  const s = useStore();
  const m = s.ui.minigame;
  if (!m) return null;
  const finish = (ok: boolean) => {
    const r = m.resolve;
    store.setUi({ minigame: null });
    r(ok);
  };
  const d = m.def;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-3 fade-in">
      <div className="parch flex max-h-[94vh] w-full max-w-2xl flex-col p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="title text-xl font-bold text-[#5a2a10] sm:text-2xl">🏆 Desafio: {TITLES[d.type]}</h2>
          <button className="btn px-3 py-1 text-sm" onClick={() => finish(false)}>Sair</button>
        </div>
        {m.help && <p className="mb-2 rounded bg-[#e4f2d0] px-2 py-1 text-xs">🎒 Um item da sua bolsa está ajudando neste desafio.</p>}
        <div className="scrollbar overflow-y-auto">
          {d.type === 'sequence' && <Sequence def={d} help={m.help} done={finish} />}
          {d.type === 'select' && <Select def={d} help={m.help} done={finish} />}
          {d.type === 'sort' && <Sort def={d} help={m.help} done={finish} />}
          {d.type === 'balance' && <Balance def={d} help={m.help} done={finish} />}
          {d.type === 'vigil' && <Vigil def={d} help={m.help} done={finish} />}
        </div>
      </div>
    </div>
  );
}
