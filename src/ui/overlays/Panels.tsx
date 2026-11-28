import { store, useStore } from '../../core/store';
import { getChapter } from '../../data/chapters';
import { breakdown, percent, requirements, resetChapterRun } from '../../core/progression';
import { restartChapter } from '../../game/PhaserGame';
import { Panel, Bar } from '../common';
import { ItemsList } from '../screens/Diary';
import { MiniMap } from '../hud/Hud';
import { SettingsContent } from '../screens/Misc';
import { DiaryContent } from '../screens/Diary';
import LegendContent, { SpecialMissions } from './Legend';

export default function Panels() {
  const s = useStore();
  const u = s.ui;
  if (!u.panel) return null;
  const close = () => store.setUi({ panel: null });
  const def = getChapter(u.chapter);
  const p = s.progress(u.chapter);

  if (u.panel === 'inventory') {
    return (
      <Panel title="Inventário" onClose={close}>
        <p className="mb-3 text-sm opacity-80">Cada personagem entrega um item. Ele será útil em um capítulo seguinte — mostre-o a quem precisar.</p>
        <ItemsList />
      </Panel>
    );
  }
  if (u.panel === 'map') {
    return (
      <Panel title={`Mapa — ${def.setting}`} onClose={close} wide>
        <div className="flex flex-col items-center gap-3">
          <div className="hidden sm:block"><MiniMap size={720} big /></div>
          <div className="sm:hidden"><MiniMap size={300} big /></div>
          <p className="text-sm">🔵 Você · ⭐ Objetivo · 🟠 Personagem da missão · 🟡 Pergaminho · ⚪ Personagens</p>
        </div>
      </Panel>
    );
  }
  if (u.panel === 'legend') {
    return (
      <Panel title="Missão lendária" onClose={close}>
        <LegendContent />
      </Panel>
    );
  }
  if (u.panel === 'journal' && def.story) {
    return (
      <Panel title="Diário de Missões" onClose={close} wide>
        <p className="ref">{def.story.label} · {def.setting}</p>
        <h3 className="title mb-2 text-xl font-bold">{def.title}</h3>
        <Bar value={percent(def, p) / 100} />
        <h4 className="title mt-3 font-bold">Missão principal</h4>
        <ul className="text-sm">
          {def.steps.map((st) => (
            <li key={st.id} className={p.steps.includes(st.id) ? 'opacity-60' : ''}>{p.steps.includes(st.id) ? '✔' : '○'} {st.title}</li>
          ))}
        </ul>
        {def.side.length > 0 && (
          <>
            <h4 className="title mt-3 font-bold">Missões secundárias</h4>
            <ul className="text-sm">{def.side.map((q) => <li key={q.id}>{p.side.includes(q.id) ? '✔' : '○'} {q.title} — <span className="opacity-75">{q.hint}</span></li>)}</ul>
          </>
        )}
        <SpecialMissions />
        <h4 className="title mt-3 font-bold">Lugares</h4>
        <ul className="text-sm">{def.zones.map((z) => <li key={z.id}>{p.zones.includes(z.id) ? '🧭 ' + z.name : '○ ???'}</li>)}</ul>
      </Panel>
    );
  }
  if (u.panel === 'journal') {
    const b = breakdown(def, p);
    const req = requirements(def, p);
    return (
      <Panel title="Diário de Missões" onClose={close} wide>
        <p className="ref">{def.ref} · {def.setting}</p>
        <h3 className="title mb-2 text-xl font-bold">{def.title}</h3>
        <Bar value={percent(def, p) / 100} />
        <p className="mb-3 mt-1 text-sm">{percent(def, p)}% concluído · {b.total}/1.000 PJ</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="title font-bold">Missões principais</h4>
            <ul className="text-sm">
              {def.steps.map((st) => (
                <li key={st.id} className={p.steps.includes(st.id) ? 'opacity-60' : ''}>
                  {p.steps.includes(st.id) ? '✔' : '○'} {st.title}
                </li>
              ))}
            </ul>
            <h4 className="title mt-3 font-bold">Missões secundárias</h4>
            <ul className="text-sm">
              {def.side.map((q) => (
                <li key={q.id}>{p.side.includes(q.id) ? '✔' : '○'} {q.title} — <span className="opacity-75">{q.hint}</span></li>
              ))}
            </ul>
            <h4 className="title mt-3 font-bold">Para desbloquear o próximo capítulo</h4>
            <ul className="text-sm">
              <li>{req.main ? '✔' : '○'} Concluir as missões principais</li>
              <li>{req.scrolls ? '✔' : '○'} Encontrar os registros bíblicos ({p.scrolls.length}/{def.scrolls.length})</li>
              <li>{req.message ? '✔' : '○'} Ler a Mensagem do Capítulo</li>
              <li>{req.quiz ? '✔' : '○'} Concluir o desafio de conhecimento</li>
            </ul>
            <SpecialMissions />
          </div>
          <div>
            <h4 className="title font-bold">Pontos de Jornada</h4>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Exploração', b.explore, 100, `${p.zones.length}/${def.zones.length} lugares`],
                  ['Missões principais', b.main, 250, ''],
                  ['Missões secundárias', b.side, 150, ''],
                  ['Diálogos e ensinamentos', b.dialog, 100, ''],
                  ['Pergaminhos', b.scroll, 100, ''],
                  ['Desafio de conhecimento', b.quiz, 200, ''],
                  ['Mensagem final', b.message, 100, ''],
                ].map(([k, v, m, x]) => (
                  <tr key={k as string} className="border-t border-[#7a5230]/30"><td>{k} <span className="text-xs opacity-60">{x}</span></td><td className="text-right font-bold">{v}/{m}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs opacity-70">Cada atividade pontua uma única vez. A melhor pontuação do capítulo fica salva.</p>
            <h4 className="title mt-3 font-bold">Lugares</h4>
            <ul className="text-sm">{def.zones.map((z) => <li key={z.id}>{p.zones.includes(z.id) ? '🧭 ' + z.name : '○ ???'}</li>)}</ul>
          </div>
        </div>
      </Panel>
    );
  }
  if (u.panel === 'scrolls') {
    return (
      <Panel title="Pergaminhos e Diário do Evangelho" onClose={close} wide>
        <DiaryContent />
      </Panel>
    );
  }
  // pausa
  return (
    <Panel title="Pausa" onClose={close}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button className="btn btn-gold" onClick={close}>▶ Continuar</button>
        <button className="btn" onClick={() => { store.persist(); store.toast('Jogo salvo', '💾'); }}>💾 Salvar</button>
        <button className="btn" onClick={() => { resetChapterRun(u.chapter); store.setUi({ panel: null }); restartChapter(u.chapter); }}>↺ Reiniciar capítulo</button>
        <button className="btn" onClick={() => { store.persist(); store.setUi({ panel: null, screen: 'chapters' }); }}>🗺 Capítulos</button>
        <button className="btn" onClick={() => { store.persist(); store.setUi({ panel: null, screen: 'title' }); }}>⌂ Menu principal</button>
      </div>
      <SettingsContent />
      <p className="mt-3 text-xs opacity-70">O jogo salva automaticamente a cada ação importante.</p>
    </Panel>
  );
}
