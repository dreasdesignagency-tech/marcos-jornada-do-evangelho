import { useEffect, useRef } from 'react';
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

export default function GameScreen() {
  const s = useStore();
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (host.current) startGame(host.current, s.ui.chapter);
    return () => {
      stopGame();
      store.persist();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const u = store.ui;
      if (u.dialog || u.message || u.minigame || u.cinematic) return;
      const k = e.key.toLowerCase();
      const toggle = (p: NonNullable<typeof u.panel>) => {
        sfx('open');
        store.setUi({ panel: u.panel === p ? null : p });
      };
      if (k === 'i') toggle('inventory');
      else if (k === 'm') toggle('map');
      else if (k === 'j') toggle('journal');
      else if (k === 'p') toggle('scrolls');
      else if (k === 'escape') toggle(u.panel ? (u.panel as any) : 'pause');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  const u = s.ui;
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div ref={host} className="absolute inset-0" />
      {/* faixas cinematográficas durante cenas */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-20 bg-black transition-all duration-700 ${u.cutscene ? 'h-[9vh]' : 'h-0'}`} />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-black transition-all duration-700 ${u.cutscene ? 'h-[9vh]' : 'h-0'}`} />
      {!u.cutscene && !u.message && <Hud />}
      {!u.cutscene && !u.message && !u.panel && !u.dialog && !u.minigame && <Touch />}
      <Dialogue />
      <Panels />
      {u.message && <Message />}
      {u.minigame && <Minigame />}
      <Cinematic />
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
