import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { CHAPTERS, getChapter } from '../../data/chapters';
import { breakdown, commit, completeChapter, unlockAchievement } from '../../core/progression';
import { music, sfx } from '../../audio/audio';
import { bus } from '../../core/bus';
import { goChapter } from '../screens/Title';
import { Motes } from '../common';

const PER_Q = [67, 67, 66];

export default function Message() {
  const s = useStore();
  const n = s.ui.chapter;
  const def = getChapter(n);
  const [stage, setStage] = useState(0); // 0 resumo, 1 versículos, 2 reflexão, 3 perguntas, 4 resultado
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState<number[]>([0, 0, 0]);
  const [points, setPoints] = useState(0);
  const [first, setFirst] = useState(0);

  useEffect(() => {
    music(def.solemn ? 'lament' : 'temple');
    sfx('scroll');
    return () => music(def.music);
  }, []);

  const next = () => {
    sfx('select');
    if (stage === 2) {
      const p = store.progress(n);
      if (!p.messageRead) {
        p.messageRead = true;
        commit(n);
        store.toast('Mensagem do Capítulo registrada (+100 PJ)', '📜');
      }
    }
    setStage((x) => x + 1);
  };

  const answer = (i: number) => {
    if (picked !== null && picked === def.quiz[q].correct) return;
    setPicked(i);
    const ok = i === def.quiz[q].correct;
    const t = [...tries];
    t[q]++;
    setTries(t);
    const st = store.save!;
    st.quizStats.total++;
    if (ok) {
      st.quizStats.correct++;
      sfx('quest');
      const gain = t[q] === 1 ? PER_Q[q] : Math.round(PER_Q[q] / 2);
      setPoints((x) => x + gain);
      if (t[q] === 1) setFirst((x) => x + 1);
    } else sfx('error');
    store.persist();
  };

  const nextQ = () => {
    setPicked(null);
    if (q < 2) setQ(q + 1);
    else {
      const p = store.progress(n);
      p.quiz = { done: true, points: Math.max(p.quiz.points, points), firstTry: Math.max(p.quiz.firstTry, first) };
      completeChapter(n);
      if (first === 3) unlockAchievement('perfect-quiz');
      if (n === 16) store.mutate((sv) => { sv.finished = true; });
      sfx('achievement');
      setStage(4);
    }
  };

  const close = (go?: 'next' | 'chapters' | 'ending' | 'stay') => {
    store.setUi({ message: false });
    bus.emit('message-closed');
    if (go === 'next') goChapter(n + 1);
    else if (go === 'chapters') store.setUi({ screen: 'chapters' });
    else if (go === 'ending') store.setUi({ screen: 'ending' });
  };

  const p = s.progress(n);
  const b = breakdown(def, p);
  const quiz = def.quiz[q];
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(40,24,12,.78),rgba(10,6,3,.95))] p-3 fade-in">
      <Motes n={20} />
      <div className="parch relative z-10 flex max-h-[94vh] w-full max-w-2xl flex-col p-5 sm:p-7">
        <p className="ref text-center">Mensagem do Capítulo · {def.ref}</p>
        <h2 className="title mb-3 text-center text-2xl font-bold text-[#5a2a10] sm:text-3xl">{def.message.title}</h2>
        <div className="scrollbar flex-1 overflow-y-auto text-[17px] leading-relaxed">
          {stage === 0 && <p className="fade-in">{def.message.summary}</p>}
          {stage === 1 && (
            <div className="fade-in space-y-3">
              {def.message.verses.map((v) => (
                <blockquote key={v.ref} className="border-l-4 border-[#d9a441] pl-4 text-lg italic">“{v.text}”<div className="ref not-italic">{v.ref}</div></blockquote>
              ))}
              <p className="text-xs opacity-70">Tradução: João Ferreira de Almeida (edição de domínio público), ortografia atualizada.</p>
            </div>
          )}
          {stage === 2 && (
            <div className="fade-in">
              <p className="title mb-1 font-bold">Reflexão</p>
              <p>{def.message.reflection}</p>
            </div>
          )}
          {stage === 3 && (
            <div className="fade-in">
              <p className="title mb-2 text-sm font-bold">Desafio de conhecimento · Pergunta {q + 1} de 3</p>
              <p className="mb-3 text-lg font-semibold">{quiz.q}</p>
              <div className="flex flex-col gap-2">
                {quiz.options.map((o, i) => {
                  const right = picked !== null && i === quiz.correct && picked === quiz.correct;
                  const wrong = picked === i && i !== quiz.correct;
                  return (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      className="btn text-left text-sm"
                      style={right ? { background: '#3f7a2a' } : wrong ? { background: '#8a2a1a' } : undefined}
                    >
                      {String.fromCharCode(65 + i)}) {o}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className={`mt-3 rounded border-2 p-3 text-sm ${picked === quiz.correct ? 'border-[#3f7a2a] bg-[#e4f2d0]' : 'border-[#8a2a1a] bg-[#f6dcd0]'}`}>
                  <b>{picked === quiz.correct ? '✔ Correto!' : '✘ Ainda não.'}</b> {quiz.explain}
                  {picked !== quiz.correct && <div className="mt-1 font-bold">Escolha outra alternativa.</div>}
                </div>
              )}
            </div>
          )}
          {stage === 4 && (
            <div className="fade-in text-center">
              <p className="title text-xl font-bold">Capítulo concluído!</p>
              <p className="mb-3">Acertos na primeira tentativa: {first}/3 · Desafio: +{points} PJ</p>
              <table className="mx-auto mb-3 text-left text-sm">
                <tbody>
                  {[['Exploração', b.explore], ['Missões principais', b.main], ['Missões secundárias', b.side], ['Diálogos', b.dialog], ['Pergaminhos', b.scroll], ['Conhecimento', b.quiz], ['Mensagem final', b.message]].map(([k, v]) => (
                    <tr key={k as string}><td className="pr-6">{k}</td><td className="text-right font-bold">{v}</td></tr>
                  ))}
                  <tr className="border-t-2 border-[#7a5230]"><td className="title pr-6 font-bold">Total</td><td className="title text-right text-lg font-bold">{b.total} / 1.000</td></tr>
                </tbody>
              </table>
              {b.total < 1000 && <p className="text-xs opacity-75">Dica: missões secundárias, conversas e lugares ainda não descobertos completam os 1.000 PJ. Você pode continuar explorando este capítulo.</p>}
              {n < 16 && <p className="mt-2 font-bold text-[#2f6e22]">🔓 Marcos {n + 1} desbloqueado!</p>}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {stage < 3 && <button className="btn btn-gold" onClick={next}>{stage === 2 ? 'Responder às perguntas ➜' : 'Continuar ➜'}</button>}
          {stage === 3 && picked !== null && picked === quiz.correct && <button className="btn btn-gold" onClick={nextQ}>{q < 2 ? 'Próxima pergunta ➜' : 'Concluir ➜'}</button>}
          {stage === 4 && (
            <>
              <button className="btn" onClick={() => close('stay')}>Continuar explorando</button>
              <button className="btn" onClick={() => close('chapters')}>Capítulos</button>
              {n < 16 ? (
                <button className="btn btn-gold" onClick={() => close('next')}>Marcos {n + 1} ➜</button>
              ) : (
                <button className="btn btn-gold" onClick={() => close('ending')}>Encerramento ➜</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
