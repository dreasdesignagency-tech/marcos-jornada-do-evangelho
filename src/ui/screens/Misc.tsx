import { useState } from 'react';
import { store, useStore, loadRecords } from '../../core/store';
import { setVolumes, sfx, music } from '../../audio/audio';
import { saveRecord } from '../../core/progression';
import { AchievementsList } from './Diary';
import { fmtTime } from '../common';

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,#3a2616,#120b06)] p-3">
      <div className="parch mx-auto max-w-3xl p-5 fade-in">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="title text-2xl font-bold text-[#5a2a10] sm:text-3xl">{title}</h1>
          <button className="btn" onClick={() => store.setUi({ screen: 'title' })}>← Menu</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Ranking() {
  useStore();
  if (store.save) saveRecord();
  const list = loadRecords();
  return (
    <Frame title="Ranking">
      <p className="mb-3 text-sm opacity-80">Recordes locais deste dispositivo (não há servidor de contas configurado). Cada jogador aparece com sua melhor pontuação.</p>
      {list.length === 0 ? (
        <p>Nenhum recorde ainda. Comece uma jornada!</p>
      ) : (
        <table className="w-full text-left">
          <thead><tr><th>#</th><th>Jogador</th><th>PJ</th><th>Capítulos</th><th className="hidden sm:table-cell">Tempo</th></tr></thead>
          <tbody>
            {list.map((r, i) => (
              <tr key={r.name + r.at} className={`border-t border-[#7a5230]/30 ${r.name === store.save?.player.name ? 'font-bold text-[#8a3a1a]' : ''}`}>
                <td>{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td>
                <td>{r.name}</td>
                <td>{r.score.toLocaleString('pt-BR')}</td>
                <td>{r.chapters}/16</td>
                <td className="hidden sm:table-cell">{fmtTime(r.ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Frame>
  );
}

export function Achievements() {
  useStore();
  return (
    <Frame title="Conquistas">
      <AchievementsList />
    </Frame>
  );
}

export function SettingsContent() {
  const s = useStore();
  const st = s.save?.settings ?? local;
  const [, force] = useState(0);
  const update = (k: 'music' | 'sfx' | 'textSpeed', v: number) => {
    if (s.save) s.mutate((sv) => { sv.settings[k] = v; });
    else { (local as any)[k] = v; force((x) => x + 1); }
    const cur = s.save?.settings ?? local;
    setVolumes(cur.music, cur.sfx);
    if (k === 'sfx') sfx('blip');
  };
  return (
    <div className="space-y-4">
      {([['music', 'Volume da música'], ['sfx', 'Volume dos efeitos']] as const).map(([k, label]) => (
        <label key={k} className="block">
          <span className="title font-bold">{label}: {Math.round(st[k] * 100)}%</span>
          <input type="range" min={0} max={1} step={0.05} value={st[k]} onChange={(e) => update(k, +e.target.value)} className="w-full accent-[#7a5230]" />
        </label>
      ))}
      <label className="block">
        <span className="title font-bold">Velocidade do texto</span>
        <select value={st.textSpeed} onChange={(e) => update('textSpeed', +e.target.value)} className="ml-2 rounded border-2 border-[#7a5230] bg-[#fbf2da] px-2 py-1">
          <option value={0.5}>Lenta</option>
          <option value={1}>Normal</option>
          <option value={2}>Rápida</option>
          <option value={10}>Instantânea</option>
        </select>
      </label>
      <div className="rounded border border-[#7a5230]/40 bg-[#fbf2da]/50 p-3 text-sm">
        <p className="title mb-1 font-bold">Controles</p>
        <p>W A S D / setas: andar · E: interagir · Espaço: avançar diálogo · I: inventário · M: mapa · J: missões · R: orar · ESC: pausa</p>
        <p className="mt-1">No celular: joystick virtual e botões na tela.</p>
      </div>
      <button className="btn text-sm" onClick={() => music(null)}>Silenciar trilha agora</button>
    </div>
  );
}
const local = { music: 0.6, sfx: 0.8, textSpeed: 1 };

export function Settings() {
  return (
    <Frame title="Configurações">
      <SettingsContent />
    </Frame>
  );
}
