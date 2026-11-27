import { useState } from 'react';
import { CHAPTERS } from '../../data/chapters';
import { ITEMS, usedIn } from '../../data/items';
import { ACHIEVEMENTS } from '../../data/levels';
import { store, useStore } from '../../core/store';
import { breakdown, percent, totalBest } from '../../core/progression';
import { resolveLook } from '../../data/looks';
import { Portrait } from '../common';

const TABS = ['Capítulos', 'Pergaminhos', 'Personagens', 'Lugares', 'Itens', 'Conquistas', 'Pontuação'] as const;

export function DiaryContent() {
  const s = useStore();
  const save = s.save!;
  const [tab, setTab] = useState<(typeof TABS)[number]>('Capítulos');
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn px-3 py-1 text-xs sm:text-sm ${tab === t ? 'btn-gold' : ''}`}>{t}</button>
        ))}
      </div>
      {tab === 'Capítulos' && (
        <div className="space-y-3">
          {CHAPTERS.map((d) => {
            const p = save.chapters[d.n];
            if (!p?.messageRead) {
              return (
                <div key={d.n} className="rounded border border-dashed border-[#7a5230]/60 p-3 text-sm opacity-60">
                  <span className="title font-bold">Marcos {d.n}</span> — registro ainda não escrito. Complete o capítulo para desbloquear.
                </div>
              );
            }
            return (
              <article key={d.n} className="rounded border-2 border-[#7a5230]/60 bg-[#fbf2da]/60 p-4">
                <p className="ref">{d.ref} · {d.setting}</p>
                <h3 className="title text-lg font-bold">{d.message.title}</h3>
                <p className="my-2 text-[15px] leading-relaxed">{d.message.summary}</p>
                {d.message.verses.map((v) => (
                  <blockquote key={v.ref} className="my-1 border-l-4 border-[#d9a441] pl-3 italic">“{v.text}” <span className="ref not-italic">{v.ref}</span></blockquote>
                ))}
                <p className="mt-2 text-sm"><b>Reflexão:</b> {d.message.reflection}</p>
              </article>
            );
          })}
        </div>
      )}
      {tab === 'Pergaminhos' && (
        <div className="space-y-2">
          {CHAPTERS.map((d) => (
            <div key={d.n}>
              <h3 className="title mt-2 font-bold">Marcos {d.n}</h3>
              {d.scrolls.map((sc) => {
                const got = save.chapters[d.n]?.scrolls.includes(sc.id);
                return got ? (
                  <p key={sc.id} className="text-[15px]">📜 “{sc.text}” <span className="ref">{sc.ref}</span></p>
                ) : (
                  <p key={sc.id} className="text-sm opacity-50">📜 Pergaminho ainda não encontrado</p>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {tab === 'Personagens' && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHAPTERS.flatMap((d) => d.npcs.filter((n) => save.seenCharacters.includes(n.name) && n.role).map((n) => ({ n, d })))
            .filter((x, i, arr) => arr.findIndex((y) => y.n.name === x.n.name) === i)
            .map(({ n, d }) => (
              <div key={n.name} className="flex items-center gap-3 rounded border border-[#7a5230]/50 bg-[#fbf2da]/50 p-2">
                <Portrait look={resolveLook(n.look)} size={44} id={n.id} />
                <div className="text-sm leading-tight"><b className="title">{n.name}</b><br />{n.role}<br /><span className="ref">Marcos {d.n}</span></div>
              </div>
            ))}
          {!save.seenCharacters.length && <p className="text-sm opacity-70">Converse com os personagens para registrá-los aqui.</p>}
        </div>
      )}
      {tab === 'Lugares' && (
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {save.seenPlaces.map((p) => <li key={p}>🧭 {p}</li>)}
          {!save.seenPlaces.length && <p className="text-sm opacity-70">Explore os mapas para descobrir lugares.</p>}
        </ul>
      )}
      {tab === 'Itens' && <ItemsList />}
      {tab === 'Conquistas' && <AchievementsList />}
      {tab === 'Pontuação' && (
        <div>
          <p className="title mb-2 text-lg font-bold">Total: {totalBest().toLocaleString('pt-BR')} / 16.000 PJ</p>
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>Cap.</th><th>Melhor</th><th>%</th><th className="hidden sm:table-cell">Expl.</th><th className="hidden sm:table-cell">Missões</th><th className="hidden sm:table-cell">Sec.</th><th className="hidden sm:table-cell">Diál.</th><th className="hidden sm:table-cell">Perg.</th><th className="hidden sm:table-cell">Desafio</th><th className="hidden sm:table-cell">Msg.</th></tr></thead>
            <tbody>
              {CHAPTERS.map((d) => {
                const p = save.chapters[d.n];
                if (!p) return <tr key={d.n} className="opacity-50"><td>{d.n}</td><td colSpan={9}>—</td></tr>;
                const b = breakdown(d, p);
                return (
                  <tr key={d.n} className="border-t border-[#7a5230]/30">
                    <td>{d.n}</td><td className="font-bold">{Math.max(p.best, b.total)}</td><td>{Math.max(p.bestPct, percent(d, p))}%</td>
                    <td className="hidden sm:table-cell">{b.explore}</td><td className="hidden sm:table-cell">{b.main}</td><td className="hidden sm:table-cell">{b.side}</td><td className="hidden sm:table-cell">{b.dialog}</td><td className="hidden sm:table-cell">{b.scroll}</td><td className="hidden sm:table-cell">{b.quiz}</td><td className="hidden sm:table-cell">{b.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs opacity-75">Os Pontos de Jornada representam progresso, dedicação e aprendizado no jogo. Não representam mérito espiritual.</p>
        </div>
      )}
    </div>
  );
}

export function ItemsList() {
  const save = store.save!;
  if (!save.inventory.length) return <p className="text-sm opacity-70">Sua bolsa está vazia. Converse com os personagens: cada um tem algo para lhe entregar.</p>;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {save.inventory.map((id) => {
        const it = ITEMS[id];
        if (!it) return null;
        const u = usedIn(CHAPTERS, id);
        const done = (save.usedItems ?? []).filter((k) => k.endsWith(':' + id)).length;
        return (
          <div key={id} className="flex gap-2 rounded border border-[#7a5230]/50 bg-[#fbf2da]/60 p-2">
            <span className="text-2xl">{it.icon}</span>
            <div className="text-sm leading-tight">
              <b className="title">{it.name}</b>
              <div>{it.desc}</div>
              <div className="ref mt-0.5">{u.length ? `Útil em: ${u.map((n) => 'Marcos ' + n).join(', ')}` : 'Lembrança da jornada'}{done ? ' · já usado' : ''}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AchievementsList() {
  const save = store.save;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {ACHIEVEMENTS.map((a) => {
        const got = save?.achievements.includes(a.id);
        return (
          <div key={a.id} className={`flex items-center gap-3 rounded border-2 p-2 ${got ? 'border-[#d9a441] bg-[#fff3cc]' : 'border-[#7a5230]/30 opacity-55'}`}>
            <span className="text-2xl">{got ? a.icon : '🔒'}</span>
            <div className="text-sm leading-tight"><b className="title">{a.title}</b><br />{a.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Diary() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,#3a2616,#120b06)] p-3">
      <div className="parch mx-auto max-w-4xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="title text-2xl font-bold text-[#5a2a10] sm:text-3xl">Diário do Evangelho</h1>
          <button className="btn" onClick={() => store.setUi({ screen: 'title' })}>← Menu</button>
        </div>
        <DiaryContent />
      </div>
    </div>
  );
}
