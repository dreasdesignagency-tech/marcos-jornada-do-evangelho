import { useEffect, useState } from 'react';
import { store, useStore } from '../../core/store';
import { music, sfx, unlockAudio } from '../../audio/audio';
import { Motes, Portrait } from '../common';
import { chaptersDone, totalBest, playerLevel, unlockAchievement } from '../../core/progression';
import { CHAPTERS } from '../../data/chapters';
import { nextStoryChapter, hasFlag } from '../../core/story';

export function goChapter(n: number) {
  const s = store.save;
  if (!s) return;
  store.setUi({ chapter: n, screen: 'game', panel: null, dialog: null, message: false, minigame: null, counter: null, cinematic: null });
  unlockAchievement('first-step');
}

export function continueChapter() {
  const s = store.save;
  if (!s) return 1;
  // campanha: prólogo primeiro; depois a caverna, se a missão oculta estiver aberta
  const pro = nextStoryChapter();
  if (pro) return pro;
  if (hasFlag('rastro') && !hasFlag('letter-read') && s.chapters[1]) return 1;
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0610]/85 via-[#1a0f08]/30 to-[#0a0610]/95" />
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(0deg, #2bf2ff14 0 1px, transparent 1px 4px)' }} />
      <Motes n={30} />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-8 short:gap-2 short:py-2">
        <div className="text-center fade-in">
          <p className="pixel mb-3 text-[9px] tracking-[0.3em] text-[#7af6ff]/80 sm:text-[10px] short:mb-1">✦ TEMPORADA 1 · O EVANGELHO DE MARCOS ✦</p>
          <h1 className="title text-6xl font-black tracking-[0.15em] text-[#f6e3b0] drop-shadow-[0_4px_0_#3a2010] sm:text-8xl short:text-4xl">MARCOS</h1>
          <p className="title mt-2 text-xl text-[#f2d68a] drop-shadow-[0_2px_0_#3a2010] sm:text-3xl short:mt-0 short:text-lg">O Último Chamado</p>
        </div>
        {save && (
          <div className="wood flex items-center gap-3 px-4 py-2 fade-in short:py-1">
            <Portrait look={save.player.look} size={44} id="title" />
            <div className="text-left text-sm leading-tight">
              <div className="title font-bold">{save.player.name}</div>
              <div className="opacity-85">{playerLevel().title} · {chaptersDone()}/16 capítulos · {totalBest().toLocaleString('pt-BR')} PJ</div>
            </div>
          </div>
        )}
        <div className="flex w-full max-w-xs flex-col gap-2.5 fade-in short:grid short:max-w-xl short:grid-cols-3 short:gap-1.5">
          {items.map((it) => (
            <button key={it.label} className={`btn text-base sm:text-lg short:px-2 short:py-1.5 short:text-sm ${it.gold ? 'btn-gold' : ''}`} disabled={it.disabled} onClick={it.act}>
              {it.label}
            </button>
          ))}
        </div>
        <p className="max-w-md text-center text-xs text-[#f2e4c0]/70 short:hidden">
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
