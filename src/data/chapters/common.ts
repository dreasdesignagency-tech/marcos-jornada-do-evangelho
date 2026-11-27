import type { Line, SceneAction, NpcDef, Pt, Look } from '../types';

export const narr = (text: string, ref?: string): Line => ({ who: 'narrador', text, ref });
export const say = (who: string, text: string, ref?: string): Line => ({ who, text, ref });
export const N = (text: string, ref?: string): SceneAction => ({ t: 'narr', text, ref });
export const S = (who: string, text: string, ref?: string): SceneAction => ({ t: 'say', who, text, ref });
export const mv = (id: string, to: Pt, speed?: number): SceneAction => ({ t: 'move', id, to, speed });
export const show = (id: string, at?: Pt): SceneAction => ({ t: 'show', id, at });
export const hide = (id: string): SceneAction => ({ t: 'hide', id });
export const cam = (to: Pt | 'player', ms?: number): SceneAction => ({ t: 'cam', to, ms });
export const fx = (name: any, on?: boolean): SceneAction => ({ t: 'fx', name, on });
export const wait = (ms: number): SceneAction => ({ t: 'wait', ms });

export function npc(id: string, name: string, look: string | Look, at: Pt, o: Partial<NpcDef> = {}): NpcDef {
  return { id, name, look, at, ...o };
}

import type { ChapterDef } from '../types';
/** Registra que um NPC reage a um item trazido de um capítulo anterior. */
export function addUse(ch: ChapterDef, npcId: string, item: string, lines: Line[]) {
  const n = ch.npcs.find((x) => x.id === npcId);
  if (!n) throw new Error(`NPC ${npcId} não existe em Marcos ${ch.n}`);
  (n.uses ??= []).push({ item, lines });
}
