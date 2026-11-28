import { useEffect, useRef, useState } from 'react';
import Stamina from './hud/Stamina';
import { enterLandscapeFullscreen, isTouchDevice, toggleFullscreen } from './fullscreen';
import { store, useStore } from '../core/store';
import { startGame, stopGame } from '../game/PhaserGame';
import { sfx } from '../audio/audio';
import Hud from './hud/Hud';
import Touch from './hud/Touch';
import Dialogue from './overlays/Dialogue';
import Panels from './overlays/Panels';
import Message from './overlays/Message';
import Cinematic from './overlays/Cinematic';
import Minigame from './minigames/Minigame';
import SystemAlert from './overlays/SystemAlert';
import NeuralLink from './overlays/NeuralLink';
import Letter from './overlays/Letter';
import { getChapter } from '../data/chapters';
import { rainAmbience } from '../audio/audio';

export default function GameScreen() {
  const s = useStore();
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (host.current) startGame(host.current, s.ui.chapter);
    const st = getChapter(s.ui.chapter).story;
    rainAmbience(!!st && st.world === 'real' && st.rain !== false);
    return () => {
      rainAmbience(false, 600);
      stopGame();
      store.persist();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const u = store.ui;
      if (u.dialog || u.message || u.minigame || u.cinematic || u.neural || u.letter || u.alert) return;
      const k = e.key.toLowerCase();
      const toggle = (p: NonNullable<typeof u.panel>) => {
        sfx('open');
        store.setUi({ panel: u.panel === p ? null : p });
      };
      if (k === 'i') toggle('inventory');
      else if (k === 'm') toggle('map');
      else if (k === 'j') toggle('journal');
      else if (k === 'p') toggle('scrolls');
      else if (k === 'l') toggle('legend');
      else if (k === 'escape') toggle(u.panel ? (u.panel as any) : 'pause');
      else if (k === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  // celular/tablet: no primeiro toque entra em tela cheia deitada
  useEffect(() => {
    if (!isTouchDevice()) return;
    const once = () => { enterLandscapeFullscreen(); window.removeEventListener('pointerdown', once); };
    window.addEventListener('pointerdown', once);
    return () => window.removeEventListener('pointerdown', once);
  }, []);
  // Ctrl corre: se Ctrl+W escapar (fora da tela cheia), o navegador pergunta antes de fechar
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { store.persist(); e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, []);
  // aviso para girar o aparelho quando estiver em pé
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const check = () => setPortrait(isTouchDevice() && window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const u = s.ui;
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {portrait && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#1a120c]/95 p-6 text-center text-[#fbe9c4]">
          <div className="rotate-90 animate-pulse text-6xl">📱</div>
          <div className="title text-xl font-bold">Gire o aparelho</div>
          <div className="text-sm opacity-85">O jogo é feito para jogar deitado (na horizontal), em tela cheia.</div>
          <button className="btn btn-gold px-4 py-2" onClick={() => enterLandscapeFullscreen()}>Tela cheia</button>
        </div>
      )}
      <div ref={host} className="absolute inset-0" />
      {/* faixas cinematográficas durante cenas */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 bg-black transition-all duration-700 ${u.cutscene ? 'h-[9vh]' : 'h-0'}`} />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-black transition-all duration-700 ${u.cutscene ? 'h-[9vh]' : 'h-0'}`} />
      {!u.cutscene && !u.message && <Hud />}
      {!u.cutscene && !u.message && !u.panel && !u.dialog && !u.minigame && !u.alert && !u.neural && !u.letter && <Stamina />}
      {!u.cutscene && !u.message && !u.panel && !u.dialog && !u.minigame && !u.alert && !u.neural && !u.letter && <Touch />}
      <Dialogue />
      <Panels />
      {u.message && <Message />}
      {u.minigame && <Minigame />}
      <Cinematic />
      <SystemAlert />
      <Letter />
      <NeuralLink />
      <div className="pointer-events-none absolute left-1/2 top-24 z-50 flex -translate-x-1/2 flex-col items-center gap-1.5 sm:top-20">
        {u.toast.map((t) => (
          <div key={t.id} className="wood fade-in flex items-center gap-2 px-3 py-1.5 text-sm">
            {t.icon && <span className="text-lg">{t.icon}</span>}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
