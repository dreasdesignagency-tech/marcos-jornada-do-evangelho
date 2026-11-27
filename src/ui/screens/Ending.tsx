import { useEffect, useRef, useState } from 'react';
import { store, useStore } from '../../core/store';
import { CHAPTERS } from '../../data/chapters';
import { chaptersDone, totalBest, saveRecord } from '../../core/progression';
import { music, sfx } from '../../audio/audio';
import { fmtTime, Motes } from '../common';
import { recolor } from '../../game/gfx/recolor';

function stats() {
  const s = store.save!;
  const ch = Object.values(s.chapters);
  return {
    name: s.player.name,
    score: totalBest(),
    chapters: chaptersDone(),
    missions: ch.reduce((a, c) => a + c.steps.length + c.side.length, 0),
    missionsTotal: CHAPTERS.reduce((a, c) => a + c.steps.length + c.side.length, 0),
    scrolls: ch.reduce((a, c) => a + c.scrolls.length, 0),
    scrollsTotal: CHAPTERS.reduce((a, c) => a + c.scrolls.length, 0),
    quiz: s.quizStats,
    time: s.playMs,
    achievements: s.achievements.length,
  };
}

function drawCertificate(c: HTMLCanvasElement) {
  const st = stats();
  const s = store.save!;
  const W = 1200, H = 850;
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#f8ecce');
  grd.addColorStop(1, '#e8d1a0');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#7a5230';
  g.lineWidth = 14;
  g.strokeRect(24, 24, W - 48, H - 48);
  g.strokeStyle = '#d9a441';
  g.lineWidth = 4;
  g.strokeRect(46, 46, W - 92, H - 92);
  g.textAlign = 'center';
  g.fillStyle = '#5a2a10';
  g.font = '700 30px Cinzel, serif';
  g.fillText('CERTIFICADO DE CONCLUSÃO', W / 2, 120);
  g.font = '900 64px Cinzel, serif';
  g.fillText('MARCOS', W / 2, 200);
  g.font = '600 28px Cinzel, serif';
  g.fillText('A Jornada do Evangelho', W / 2, 240);
  g.fillStyle = '#3a2414';
  g.font = 'italic 26px "EB Garamond", serif';
  g.fillText('Certificamos que', W / 2, 310);
  g.font = '700 54px Cinzel, serif';
  g.fillStyle = '#8a3a1a';
  g.fillText(st.name, W / 2, 380);
  g.fillStyle = '#3a2414';
  g.font = '700 34px "EB Garamond", serif';
  g.fillText('Completei a Jornada do Evangelho de Marcos.', W / 2, 445);
  g.font = '24px "EB Garamond", serif';
  const lines = [
    `${st.chapters} capítulos concluídos · ${st.score.toLocaleString('pt-BR')} Pontos de Jornada`,
    `${st.missions} missões realizadas · ${st.scrolls} pergaminhos encontrados · ${st.quiz.correct} acertos nas perguntas`,
    `${st.achievements} conquistas · tempo de jornada: ${fmtTime(st.time)}`,
  ];
  lines.forEach((l, i) => g.fillText(l, W / 2, 510 + i * 38));
  // personagem
  const sheet = recolor(s.player.look);
  g.imageSmoothingEnabled = false;
  g.drawImage(sheet, 0, 0, 32, 48, 120, 560, 128, 192);
  g.drawImage(sheet, 0, 0, 32, 48, W - 248, 560, 128, 192);
  g.font = 'italic 22px "EB Garamond", serif';
  g.fillText('“Ide por todo o mundo, pregai o evangelho a toda criatura.”', W / 2, 680);
  g.font = '18px "EB Garamond", serif';
  g.fillText(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), W / 2, 740);
  g.font = '14px "EB Garamond", serif';
  g.fillStyle = '#6a4a2a';
  g.fillText('Os pontos e títulos são conquistas do jogo e não representam mérito espiritual.', W / 2, 780);
}

export default function Ending() {
  useStore();
  const st = stats();
  const [phase, setPhase] = useState(0);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    music('dawn');
    saveRecord();
    const t = setTimeout(() => setPhase(1), 9000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase === 1 && ref.current) {
      document.fonts?.ready.then(() => ref.current && drawCertificate(ref.current));
      sfx('achievement');
    }
  }, [phase]);
  const download = () => {
    const a = document.createElement('a');
    a.download = `certificado-marcos-${st.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = ref.current!.toDataURL('image/png');
    a.click();
  };
  const share = async () => {
    const c = ref.current!;
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/png'));
    const text = `Completei a Jornada do Evangelho de Marcos! ${st.score} PJ em ${st.chapters} capítulos.`;
    try {
      const file = blob ? new File([blob], 'certificado-marcos.png', { type: 'image/png' }) : null;
      if (file && (navigator as any).canShare?.({ files: [file] })) await navigator.share({ files: [file], text, title: 'Marcos — A Jornada do Evangelho' });
      else if (navigator.share) await navigator.share({ text, title: 'Marcos — A Jornada do Evangelho' });
      else { await navigator.clipboard.writeText(text); store.toast('Texto copiado para compartilhar!', '📋'); }
    } catch { /* cancelado */ }
  };
  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,#e8a050,#5a2a20_45%,#120b06)]">
      <Motes n={40} />
      {phase === 0 ? (
        <div className="relative z-10 flex h-full cursor-pointer flex-col items-center justify-center px-6 text-center text-[#fbe9c4]" onClick={() => setPhase(1)}>
          <div className="fade-in space-y-4" style={{ animationDuration: '2.5s' }}>
            <p className="title text-4xl font-bold sm:text-6xl">Ele ressuscitou!</p>
            <p className="mx-auto max-w-xl text-lg sm:text-xl">Do Jordão ao jardim do sepulcro, {st.name} percorreu os 16 capítulos do Evangelho de Marcos e completou o seu pergaminho.</p>
            <p className="italic opacity-90">“Princípio do evangelho de Jesus Cristo, Filho de Deus.” — Marcos 1:1</p>
            <p className="pixel pt-6 text-[9px] opacity-70">toque para continuar</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 h-full overflow-y-auto p-3">
          <div className="mx-auto max-w-4xl space-y-3 fade-in">
            <div className="parch grid grid-cols-2 gap-2 p-4 text-center text-sm sm:grid-cols-4">
              {[
                ['Jogador', st.name], ['Pontuação', `${st.score.toLocaleString('pt-BR')} PJ`], ['Capítulos', `${st.chapters}/16`],
                ['Missões', `${st.missions}/${st.missionsTotal}`], ['Pergaminhos', `${st.scrolls}/${st.scrollsTotal}`],
                ['Acertos', `${st.quiz.correct}/${st.quiz.total}`], ['Tempo', fmtTime(st.time)], ['Conquistas', `${st.achievements}`],
              ].map(([k, v]) => (
                <div key={k}><div className="ref">{k}</div><div className="title text-lg font-bold">{v}</div></div>
              ))}
            </div>
            <canvas ref={ref} className="w-full rounded shadow-2xl" />
            <div className="flex flex-wrap justify-center gap-2 pb-6">
              <button className="btn btn-gold" onClick={download}>⬇ Baixar certificado</button>
              <button className="btn" onClick={share}>↗ Compartilhar</button>
              <button className="btn" onClick={() => store.setUi({ screen: 'diary' })}>Diário do Evangelho</button>
              <button className="btn" onClick={() => store.setUi({ screen: 'title' })}>Menu principal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
