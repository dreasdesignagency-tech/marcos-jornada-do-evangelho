import type { ChapterDef } from '../types';
import c1 from './ch01'; import c2 from './ch02'; import c3 from './ch03'; import c4 from './ch04';
import c5 from './ch05'; import c6 from './ch06'; import c7 from './ch07'; import c8 from './ch08';
import c9 from './ch09'; import c10 from './ch10'; import c11 from './ch11'; import c12 from './ch12';
import c13 from './ch13'; import c14 from './ch14'; import c15 from './ch15'; import c16 from './ch16';
import { STORY } from '../story';

/** Os 16 capítulos de Marcos (Temporada 1). */
export const CHAPTERS: ChapterDef[] = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16];

/** Capítulo bíblico (1–16) ou segmento de história (101+). */
export function getChapter(n: number): ChapterDef {
  return n >= 100 ? STORY[n] : CHAPTERS[n - 1];
}

export const isStory = (n: number) => n >= 100;
