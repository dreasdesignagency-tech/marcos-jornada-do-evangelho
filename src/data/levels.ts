// Títulos de progressão. São conquistas do jogo, não classificações espirituais.
export const LEVELS = [
  { level: 1, title: 'Viajante', chapters: 0 },
  { level: 2, title: 'Explorador', chapters: 2 },
  { level: 3, title: 'Aprendiz', chapters: 4 },
  { level: 4, title: 'Peregrino', chapters: 6 },
  { level: 5, title: 'Mensageiro', chapters: 8 },
  { level: 6, title: 'Guardião dos Pergaminhos', chapters: 11 },
  { level: 7, title: 'Cronista', chapters: 14 },
  { level: 8, title: 'Jornada Completa', chapters: 16 },
];

export function levelFor(chaptersDone: number) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (chaptersDone >= l.chapters) cur = l;
  const next = LEVELS.find((l) => l.chapters > chaptersDone) ?? null;
  return { cur, next };
}

export const ACHIEVEMENTS: { id: string; title: string; desc: string; icon: string }[] = [
  { id: 'first-step', title: 'Primeiros passos', desc: 'Comece a Jornada do Evangelho.', icon: '👣' },
  { id: 'ch1', title: 'O princípio', desc: 'Conclua Marcos 1.', icon: '🌊' },
  { id: 'ch4', title: 'Terreno fértil', desc: 'Conclua Marcos 4.', icon: '🌾' },
  { id: 'ch8', title: 'Quem Ele é', desc: 'Conclua Marcos 8.', icon: '🧭' },
  { id: 'ch12', title: 'O maior mandamento', desc: 'Conclua Marcos 12.', icon: '❤️' },
  { id: 'ch16', title: 'Ele ressuscitou!', desc: 'Conclua Marcos 16.', icon: '🌅' },
  { id: 'scrolls-10', title: 'Colecionador', desc: 'Encontre 10 pergaminhos.', icon: '📜' },
  { id: 'scrolls-all', title: 'Guardião dos registros', desc: 'Encontre todos os pergaminhos.', icon: '🏛️' },
  { id: 'perfect-quiz', title: 'Coração atento', desc: 'Acerte as 3 perguntas de um capítulo na primeira tentativa.', icon: '✨' },
  { id: 'perfect-5', title: 'Estudioso', desc: 'Acerte tudo de primeira em 5 capítulos.', icon: '📖' },
  { id: 'full-chapter', title: 'Jornada plena', desc: 'Faça 1.000 PJ em um capítulo.', icon: '🏅' },
  { id: 'side-5', title: 'Mão amiga', desc: 'Conclua 5 missões secundárias.', icon: '🤝' },
  { id: 'items-20', title: 'Bolsa cheia', desc: 'Reúna 20 itens diferentes.', icon: '🎒' },
  { id: 'talk-50', title: 'Bom ouvinte', desc: 'Converse com 50 personagens.', icon: '💬' },
  { id: 'pray', title: 'Momento de oração', desc: 'Pare para orar durante a jornada (tecla R).', icon: '🙏' },
  { id: 'complete', title: 'Jornada completa', desc: 'Conclua os 16 capítulos.', icon: '👑' },
];
