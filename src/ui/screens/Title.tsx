import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { music, sfx, unlockAudio } from '../../audio/audio';
import { Motes, Portrait } from '../common';
import { chaptersDone, totalBest, playerLevel, unlockAchievement } from '../../core/progression';
import { CHAPTERS } from '../../data/chapters';

export function goChapter(n: number) {
  const s = store.save;
  if (!s) return;
  store.setUi({ chapter: n, screen: 'game', panel: null, dialog: null, message: false, minigame: null, counter: null, cinematic: null });
  unlockAchievement('first-step');
}

export function continueChapter() {
  const s = store.save;
  if (!s) return 1;
  for (let i = 1; i <= s.unlocked; i++) if (!s.chapters[i]?.completed) return i;
  return Math.min(16, s.unlocked);
}

export default function Title() {
  const s = useStore();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    music('pastoral');
  }, []);
  const save = s.save;
  const go = (screen: any) => {
    sfx('select');
    unlockAudio();
    music('pastoral');
    store.setUi({ screen });
  };
  const items: { label: string; act: () => void; disabled?: boolean; gold?: boolean }[] = [
    { label: 'Nova jornada', gold: !save, act: () => (save ? setConfirm(true) : go('create')) },
    { label: 'Continuar', gold: !!save, disabled: !save, act: () => { sfx('select'); unlockAudio(); goChapter(continueChapter()); } },
    { label: 'Capítulos', disabled: !save, act: () => go('chapters') },
    { label: 'Diário do Evangelho', disabled: !save, act: () => go('diary') },
    { label: 'Ranking', act: () => go('ranking') },
    { label: 'Conquistas', disabled: !save, act: () => go('achievements') },
    { label: 'Configurações', act: () => go('settings') },
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a120c]">
      <div
        className="absolute inset-[-10%] bg-cover bg-center opacity-80"
        style={{ backgroundImage: 'url(assets/maps/galileia.webp)', imageRendering: 'pixelated', animation: 'pan 60s ease-in-out infinite alternate' }}
      />
      <style>{`@keyframes pan { from { transform: scale(1.15) translate(-3%, -2%); } to { transform: scale(1.25) translate(3%, 2%); } }`}</style>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f08]/80 via-[#1a0f08]/30 to-[#1a0f08]/90" />
      <Motes n={30} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-8">
        <div className="text-center fade-in">
          <p className="pixel mb-3 text-[9px] tracking-[0.3em] text-[#f2d68a]/80 sm:text-[10px]">✦ UMA AVENTURA PELOS 16 CAPÍTULOS ✦</p>
          <h1 className="title text-6xl font-black tracking-[0.15em] text-[#f6e3b0] drop-shadow-[0_4px_0_#3a2010] sm:text-8xl">MARCOS</h1>
          <p className="title mt-2 text-xl text-[#f2d68a] drop-shadow-[0_2px_0_#3a2010] sm:text-3xl">A Jornada do Evangelho</p>
        </div>
        {save && (
          <div className="wood flex items-center gap-3 px-4 py-2 fade-in">
            <Portrait look={save.player.look} size={44} id="title" />
            <div className="text-left text-sm leading-tight">
              <div className="title font-bold">{save.player.name}</div>
              <div className="opacity-85">{playerLevel().title} · {chaptersDone()}/16 capítulos · {totalBest().toLocaleString('pt-BR')} PJ</div>
            </div>
          </div>
        )}
        <div className="flex w-full max-w-xs flex-col gap-2.5 fade-in">
          {items.map((it) => (
            <button key={it.label} className={`btn text-base sm:text-lg ${it.gold ? 'btn-gold' : ''}`} disabled={it.disabled} onClick={it.act}>
              {it.label}
            </button>
          ))}
        </div>
        <p className="max-w-md text-center text-xs text-[#f2e4c0]/70">
          Textos bíblicos: tradução de João Ferreira de Almeida (edição de domínio público), com ortografia atualizada. Música e arte originais.
        </p>
      </div>
      {confirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4" onClick={() => setConfirm(false)}>
          <div className="parch max-w-sm p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="title mb-2 text-lg font-bold">Começar uma nova jornada?</p>
            <p className="mb-4 text-sm">O progresso salvo de <b>{save?.player.name}</b> será substituído. Os recordes do ranking local continuam guardados.</p>
            <div className="flex justify-center gap-2">
              <button className="btn" onClick={() => setConfirm(false)}>Cancelar</button>
              <button className="btn btn-gold" onClick={() => { setConfirm(false); go('create'); }}>Nova jornada</button>
            </div>
          </div>
        </div>
      )}
      <span className="sr-only">{CHAPTERS.length} capítulos</span>
    </div>
  );
}
