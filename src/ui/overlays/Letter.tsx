import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { music, sfx } from '../../audio/audio';
import { LETTERS } from '../../data/story';
import { addFragment, addLetter, hasFlag, setFlag } from '../../core/story';
import { giveItem } from '../../core/progression';
import { goChapter } from '../screens/Title';
import { Motes } from '../common';

/** Abre a carta da Abigail (também usada pelo Diário para reler, com `replay`). */
export function LetterView({ id, onDone, replay = false }: { id: string; onDone: () => void; replay?: boolean }) {
  const l = LETTERS[id];
  const [shown, setShown] = useState(replay ? l.body.length + 1 : 0); // parágrafos visíveis
  const [after, setAfter] = useState(replay ? l.after.length : 0);
  const readingDone = shown > l.body.length;
  useEffect(() => {
    if (readingDone) return;
    const t = setTimeout(() => setShown((x) => x + 1), shown === 0 ? 1200 : 2600);
    return () => clearTimeout(t);
  }, [shown, readingDone]);
  useEffect(() => {
    if (!readingDone || after >= l.after.length) return;
    const t = setTimeout(() => { setAfter((x) => x + 1); sfx('glitch'); }, 900);
    return () => clearTimeout(t);
  }, [readingDone, after]);
  const tap = () => {
    if (!readingDone) { setShown(l.body.length + 1); return; }
    if (after < l.after.length) { setAfter(l.after.length); return; }
    onDone();
  };
  return (
    <div className="absolute inset-0 z-[75] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#1a2430,#05060a)] p-3" onClick={tap}>
      <Motes n={24} />
      <div className="pointer-events-none absolute inset-0 opacity-15" style={{ background: 'repeating-linear-gradient(0deg, #7af6ff22 0 1px, transparent 1px 4px)' }} />
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-xl flex-col">
        <p className="sys-line mb-2 text-center text-[#7af6ff]">FRAGMENTO DE MEMÓRIA ENCONTRADO · AUTORA: {l.author.toUpperCase()} · DESTINATÁRIO: {(store.save?.player.name ?? l.to).toUpperCase()}</p>
        <div className="scrollbar overflow-y-auto rounded border-2 border-[#d9a441aa] bg-[linear-gradient(180deg,#f6e9c8ee,#e8d4a2ee)] p-5 text-[#2a1a10] shadow-[0_0_40px_rgba(122,246,255,.25)] sm:p-7">
          {l.body.slice(0, shown).map((p, i) => (
            <p key={i} className={`fade-in mb-3 text-[17px] leading-relaxed sm:text-lg ${i === 0 ? 'title font-bold' : ''} ${p === 'Ainda estou viva. E espero que possamos nos encontrar novamente.' ? 'font-semibold' : ''}`} style={{ fontFamily: 'var(--font-body, Georgia), serif' }}>
              {p}
            </p>
          ))}
          {readingDone && (
            <div className="fade-in mt-4 text-right">
              {l.signature.map((s) => <p key={s} className="title text-lg italic">{s}</p>)}
            </div>
          )}
        </div>
        {readingDone && (
          <div className="mt-3 rounded border border-[#2bf2ff66] bg-black/70 p-3">
            {l.after.slice(0, after).map((a) => <p key={a} className="sys-line fade-in text-[#7af6ff]">{a}</p>)}
          </div>
        )}
        <p className="sys-line mt-2 animate-pulse text-center text-[9px] text-white/60">
          {!readingDone ? 'toque para ler tudo' : after < l.after.length ? '…' : replay ? 'toque para fechar' : 'toque para continuar'}
        </p>
      </div>
    </div>
  );
}

/** Carta em tela cheia ao abrir a caixa da caverna; em seguida registra a missão lendária. */
export default function Letter() {
  const s = useStore();
  const id = s.ui.letter;
  useEffect(() => { if (id) music('memory'); }, [id]);
  if (!id) return null;
  const done = async () => {
    store.setUi({ letter: null });
    const first = !hasFlag('letter-read');
    addLetter(id);
    setFlag('letter-read');
    if (first) {
      await store.dialog([
        { who: 'marcos', text: 'Abigail… você esteve aqui?' },
        { who: 'marcos', text: 'Todos disseram que você tinha morrido.' },
        { who: 'marcos', text: 'Eu vou encontrar você.' },
      ]);
      await store.systemAlert([
        'MISSÃO LENDÁRIA REGISTRADA.',
        '◆ O ÚLTIMO CHAMADO',
        'Fragmentos de Marcos: 1/16.',
        'Localização de Abigail: desconhecida.',
        'Projeto REFÚGIO: informações bloqueadas.',
        'Inspiração: Mateus 24:14 · Marcos 13:10.',
      ], 'legend');
      setFlag('legend');
      giveItem('fragmento_1');
      addFragment(1);
      await store.dialog([{ who: 'narrador', text: 'O caminho continua em Marcos 1. Leia a Mensagem do Capítulo e siga adiante: cada capítulo guarda um fragmento — e talvez um novo rastro de Abigail.' }]);
    }
    goChapter(1);
  };
  return <LetterView id={id} onDone={done} />;
}
