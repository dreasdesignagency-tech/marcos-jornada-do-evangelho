import { useEffect, useState } from 'react';
import { useStore } from './core/store';
import { loadBase } from './game/gfx/recolor';
import { setVolumes, unlockAudio } from './audio/audio';
import Title from './ui/screens/Title';
import Create from './ui/screens/Create';
import Chapters from './ui/screens/Chapters';
import Diary from './ui/screens/Diary';
import { Ranking, Achievements, Settings } from './ui/screens/Misc';
import Ending from './ui/screens/Ending';
import GameScreen from './ui/GameScreen';

export default function App() {
  const s = useStore();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadBase().then(() => setReady(true));
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);
  useEffect(() => {
    const st = s.save?.settings;
    if (st) setVolumes(st.music, st.sfx);
  }, [s.save?.settings.music, s.save?.settings.sfx]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1a120c] text-[#f2e4c0]">
        <p className="title animate-pulse text-xl tracking-widest">Desenrolando o pergaminho…</p>
      </div>
    );
  }
  const scr = s.ui.screen;
  return (
    <div className="relative h-full w-full">
      {scr === 'title' && <Title />}
      {scr === 'create' && <Create />}
      {scr === 'chapters' && <Chapters />}
      {scr === 'diary' && <Diary />}
      {scr === 'ranking' && <Ranking />}
      {scr === 'achievements' && <Achievements />}
      {scr === 'settings' && <Settings />}
      {scr === 'ending' && <Ending />}
      {scr === 'game' && <GameScreen key={s.ui.chapter} />}
    </div>
  );
}
