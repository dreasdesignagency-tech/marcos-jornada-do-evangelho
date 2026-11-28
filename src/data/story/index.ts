// Segmentos de história da campanha "O Último Chamado" (fora dos capítulos bíblicos).
import type { ChapterDef } from '../types';
import p101 from './p101_memoria';
import p102 from './p102_abrigo';
import p103 from './p103_distrito';
import p104 from './p104_arena';
import p105 from './p105_caverna';

export const STORY: Record<number, ChapterDef> = { 101: p101, 102: p102, 103: p103, 104: p104, 105: p105 };
export { LETTERS } from './letters';
