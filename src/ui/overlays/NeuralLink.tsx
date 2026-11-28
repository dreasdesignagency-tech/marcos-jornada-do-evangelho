import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { music, rainAmbience, sfx } from '../../audio/audio';
import { setFlag } from '../../core/story';
import { goChapter } from '../screens/Title';

const STEPS = [
  'INICIANDO CONEXÃO NEURAL',
  'VERIFICANDO IDENTIDADE',
  'ESTABELECENDO CONEXÃO SEGURA',
  'ACESSANDO REDE REFÚGIO',
  'CARREGANDO ARQUIVOS DAS ESCRITURAS',
  'EVANGELHO DE MARCOS',
  'CAPÍTULO 01',
  'SINCRONIZAÇÃO CONCLUÍDA',
];
const FLASHES = ['Abi e Eli para sempre', '“Nunca deixe de procurar a verdade.”', '12 anos', '◆', 'a colina · a árvore', 'ÉDEN VÊ'];

/** Sequência audiovisual da arena até Marcos 1. */
export default function NeuralLink() {
  const s = useStore();
  const on = s.ui.neural;
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'boot' | 'verse'>('boot');
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!on) return;
    setI(0); setPhase('boot');
    music(null);
    rainAmbience(true, 400);
    sfx('boot');
  }, [on]);

  useEffect(() => {
    if (!on || phase !== 'boot') return;
    if (i >= STEPS.length) {
      const t = setTimeout(() => { setPhase('verse'); music('dawn'); sfx('chime'); }, 900);
      return () => clearTimeout(t);
    }
    if (i === 3) rainAmbience(false, 5000); // a chuva da cidade some aos poucos
    const t = setTimeout(() => {
      setI((x) => x + 1);
      sfx(i % 2 ? 'glitch' : 'blip');
      if (Math.random() < 0.7) {
        setFlash(FLASHES[(i + Math.floor(Math.random() * 3)) % FLASHES.length]);
        setTimeout(() => setFlash(null), 260);
      }
    }, i === STEPS.length - 1 ? 1300 : 850);
    return () => clearTimeout(t);
  }, [on, i, phase]);

  useEffect(() => {
    if (!on || phase !== 'verse') return;
    const t = setTimeout(finish, 6500);
    return () => clearTimeout(t);
  }, [on, phase]);

  const finish = () => {
    if (!store.ui.neural) return;
    setFlag('connected');
    store.setUi({ neural: false });
    goChapter(1);
  };

  if (!on) return null;
  const pct = Math.min(1, i / STEPS.length);
  return (
    <div className="absolute inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden bg-black text-center" onClick={() => phase === 'verse' && finish()}>
      {phase === 'boot' ? (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: 'repeating-linear-gradient(0deg, #2bf2ff22 0 1px, transparent 1px 4px)' }} />
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: 'url(assets/maps/galileia.webp)', imageRendering: 'pixelated', opacity: pct > 0.55 ? (pct - 0.55) * 0.9 : 0, filter: 'blur(1px) saturate(1.2)' }}
          />
          <div className="relative z-10 w-full max-w-md px-6">
            {STEPS.slice(0, i + 1).map((l, k) => (
              <p key={l} className={`sys-line text-left ${k === i ? 'caret' : 'opacity-60'} ${k === i && k % 3 === 1 ? 'glitch' : ''}`} style={{ color: k >= 5 ? '#ffd86a' : '#7af6ff' }}>
                {k < i ? '✓ ' : '› '}{l}
              </p>
            ))}
            <div className="mt-5 h-2 w-full overflow-hidden rounded border border-[#2bf2ff88] bg-[#0a1a22]">
              <div className="h-full bg-gradient-to-r from-[#2bf2ff] via-[#ff2bd6] to-[#ffd86a] transition-all duration-700" style={{ width: `${pct * 100}%` }} />
            </div>
          </div>
          {flash && <p className="title glitch absolute left-1/2 top-1/3 -translate-x-1/2 whitespace-nowrap text-2xl text-white/80">{flash}</p>}
        </>
      ) : (
        <div className="fade-in px-6">
          <p className="title mx-auto max-w-xl text-2xl leading-relaxed text-[#f6e3b0] sm:text-3xl" style={{ animation: 'fadeIn 2.4s ease both' }}>
            “Princípio do evangelho de Jesus Cristo, Filho de Deus.”
          </p>
          <p className="ref mt-4 text-base" style={{ color: '#d9a441' }}>Marcos 1:1</p>
          <p className="sys-line mt-10 animate-pulse text-[9px] text-white/50">toque para continuar</p>
        </div>
      )}
    </div>
  );
}
