// Estado da campanha "O Último Chamado": marcos narrativos (flags), fragmentos
// da missão lendária e cartas de Abigail. Persistido junto com o save.
import { store, type StoryState } from './store';
import { sfx } from '../audio/audio';

/** Ordem do prólogo (segmentos jogáveis antes de Marcos 1). */
export const PROLOGUE = [101, 102, 103, 104] as const;
export const CAVE = 105;

export function story(): StoryState {
  const s = store.save!;
  if (!s.story) s.story = { flags: [], fragments: [], letters: [] };
  return s.story;
}

export const hasFlag = (f: string) => !!store.save?.story?.flags.includes(f);

export function setFlag(f: string) {
  if (!store.save) return;
  const st = story();
  if (!st.flags.includes(f)) st.flags.push(f);
  store.persist();
}

export function addFragment(ch: number) {
  if (!store.save) return;
  const st = story();
  if (st.fragments.includes(ch)) return;
  st.fragments.push(ch);
  st.fragments.sort((a, b) => a - b);
  if (hasFlag('legend')) {
    store.toast(`Fragmento de Marcos ${ch} recuperado · ${st.fragments.length}/16`, '◆');
    sfx('achievement');
  }
  store.persist();
}

export function addLetter(id: string) {
  const st = story();
  if (!st.letters.includes(id)) st.letters.push(id);
  store.persist();
}

/** Próximo ponto da campanha para o botão "Continuar". */
export function nextStoryChapter(): number | null {
  const s = store.save;
  if (!s) return null;
  for (const n of PROLOGUE) if (!s.chapters[n]?.completed) return n;
  return null;
}

/** Situação da missão lendária para a interface. */
export function legendStatus() {
  const st = store.save?.story ?? { flags: [], fragments: [], letters: [] };
  const done = st.fragments.length;
  return {
    known: st.flags.includes('legend'),
    fragments: done,
    abigail: st.flags.includes('letter-read') ? 'Criptografada' : 'Desconhecida',
    refugio: done >= 16 ? 'Nova conexão detectada' : 'Informações bloqueadas',
    later: done >= 16 ? 'Mateus — em breve' : 'Bloqueados',
  };
}
