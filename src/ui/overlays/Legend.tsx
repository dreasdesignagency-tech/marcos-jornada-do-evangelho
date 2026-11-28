import { useState } from 'react';
import { legendStatus, hasFlag } from '../../core/story';
import { LetterView } from './Letter';
import { useStore } from '../../core/store';
import { Bar } from '../common';

/** Missões especiais registradas (ocultas e lendárias). */
export function SpecialMissions() {
  useStore();
  const rastro = hasFlag('rastro');
  const legend = hasFlag('legend');
  if (!rastro && !legend) return null;
  return (
    <div className="mt-3">
      <h4 className="title font-bold">Missões ocultas e lendárias</h4>
      <ul className="text-sm">
        {rastro && (
          <li>{hasFlag('letter-read') ? '✔' : '◆'} <b>O Rastro Esquecido</b> <span className="opacity-75">· oculta · lendária — {hasFlag('letter-read') ? 'fragmento de Abigail encontrado' : 'siga a reação do pingente até a caverna ao norte'}</span></li>
        )}
        {legend && <li>◆ <b>O Último Chamado</b> <span className="opacity-75">· lendária · múltiplas campanhas — {legendStatus().fragments}/16 fragmentos de Marcos</span></li>}
      </ul>
    </div>
  );
}

/** Painel da missão lendária "O Último Chamado". */
export default function LegendContent() {
  const s = useStore();
  const st = legendStatus();
  const frags = s.save?.story?.fragments ?? [];
  const [reading, setReading] = useState<string | null>(null);
  const letters = s.save?.story?.letters ?? [];
  if (!st.known) {
    return <p className="text-sm opacity-80">Nenhuma missão lendária registrada ainda. Talvez o pingente de Abigail tenha algo a mostrar…</p>;
  }
  const rows: [string, string][] = [
    ['Fragmentos de Marcos', `${st.fragments}/16`],
    ['Localização de Abigail', st.abigail],
    ['Projeto REFÚGIO', st.refugio],
    ['Livros posteriores', st.later],
  ];
  return (
    <div>
      <p className="ref">Raridade: Lendária · Duração: múltiplas campanhas e livros bíblicos</p>
      <h3 className="title mb-1 text-2xl font-bold">◆ O ÚLTIMO CHAMADO</h3>
      <p className="mb-3 text-sm">
        Abigail descobriu que os dados capazes de levar as Escrituras às últimas comunidades sem acesso à Palavra foram divididos em fragmentos e escondidos nos livros bíblicos da simulação. Siga os rastros dela, compreenda cada capítulo e ajude quem precisa.
      </p>
      <Bar value={st.fragments / 16} color="#7af6ff" />
      <table className="mt-3 w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-[#7a5230]/30"><td className="py-1">{k}</td><td className="text-right font-bold">{v}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 grid grid-cols-8 gap-1.5">
        {Array.from({ length: 16 }, (_, i) => {
          const have = frags.includes(i + 1);
          return (
            <div key={i} title={`Marcos ${i + 1}`} className={`flex aspect-square items-center justify-center rounded border text-xs font-bold ${have ? 'border-[#2bf2ff] bg-[#0e3a44] text-[#7af6ff] shadow-[0_0_8px_#2bf2ff88]' : 'border-[#7a5230]/50 opacity-50'}`}>
              {have ? '◆' : i + 1}
            </div>
          );
        })}
      </div>
      {letters.length > 0 && (
        <button className="btn mt-3 w-full text-sm" onClick={() => setReading(letters[letters.length - 1])}>✉ Reler a carta de Abigail</button>
      )}
      {reading && <LetterView id={reading} replay onDone={() => setReading(null)} />}
      <p className="mt-3 text-xs opacity-75">
        Inspiração: Mateus 24:14 e Marcos 13:10. Elias não é o salvador da humanidade nem controla o tempo da volta de Cristo — isso pertence à soberania de Deus. A missão é de fidelidade, serviço e testemunho.
      </p>
    </div>
  );
}
