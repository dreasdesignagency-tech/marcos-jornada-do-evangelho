import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, cam, npc, addUse } from './common';

// Marcos 16 — Ele ressuscitou! (jardim do sepulcro ao amanhecer)
const ch: ChapterDef = {
  n: 16,
  title: 'Ele ressuscitou!',
  ref: 'Marcos 16',
  setting: 'Jardim do sepulcro ao amanhecer',
  intro:
    'Passado o sábado, muito cedo, no primeiro dia da semana, o sol começa a nascer. Pássaros cantam no jardim. Três mulheres caminham com especiarias nas mãos e uma pergunta no coração.',
  map: {
    kind: 'proc', w: 80, h: 50, base: 'grass', ambience: 'dawn', seed: 16,
    features: [
      { f: 'blob', tile: 'flowers', x: 20, y: 16, r: 5 },
      { f: 'blob', tile: 'flowers', x: 36, y: 38, r: 6 },
      { f: 'blob', tile: 'flowers', x: 52, y: 30, r: 4 },
      { f: 'blob', tile: 'grass2', x: 30, y: 24, r: 10 },
      { f: 'path', tile: 'dirt', pts: [[2, 26], [20, 26], [34, 28], [48, 24], [60, 22], [64, 20]], w: 3 },
      { f: 'blob', tile: 'rock', x: 66, y: 12, r: 7 },
      { f: 'rect', tile: 'cliff', x: 56, y: 2, w: 22, h: 3 },
      { f: 'blob', tile: 'water', x: 14, y: 40, r: 3 },
      { f: 'obj', o: 'tomb', x: 65, y: 17 },
      { f: 'obj', o: 'stone', x: 65, y: 19, solid: false },
      { f: 'obj', o: 'bench', x: 30, y: 30 },
      { f: 'scatter', o: 'olive', x: 0, y: 0, w: 56, h: 50, n: 22, on: ['grass', 'grass2'] },
      { f: 'scatter', o: 'tree', x: 0, y: 0, w: 56, h: 50, n: 10, on: ['grass'] },
      { f: 'scatter', o: 'palm', x: 50, y: 26, w: 30, h: 24, n: 6, on: ['grass'] },
      { f: 'scatter', o: 'bush', x: 0, y: 0, w: 80, h: 50, n: 20, on: ['grass', 'grass2'] },
      { f: 'scatter', o: 'flower', x: 0, y: 0, w: 80, h: 50, n: 50, on: ['grass', 'grass2'] },
      { f: 'scatter', o: 'rock', x: 56, y: 6, w: 24, h: 14, n: 8, on: ['rock'] },
    ],
  },
  cell: 16,
  spawn: [4, 27],
  music: 'dawn',
  messageAt: [60, 24],
  zones: [
    { id: 'entrada', name: 'Entrada do jardim', at: [8, 26], r: 5 },
    { id: 'flores', name: 'Jardim florido', at: [34, 34], r: 7 },
    { id: 'fonte', name: 'Fonte do jardim', at: [14, 40], r: 4 },
    { id: 'sepulcro', name: 'Sepulcro novo', at: [64, 20], r: 4 },
  ],
  npcs: [
    npc('madalena', 'Maria Madalena', 'madalena', [10, 25], {
      gives: 'flor_alvorada', role: 'Primeira testemunha da ressurreição',
      uses: [
        { item: 'especiarias', lines: [say('madalena', 'As especiarias! Compramos depois do sábado para ungir o corpo.')] },
        { item: 'nardo', lines: [say('madalena', 'O perfume de Betânia... Ela ungiu o corpo dele antecipadamente para a sepultura.')] },
        { item: 'mirra', lines: [say('madalena', 'A mirra de José de Arimateia. Ele foi tão corajoso.')] },
        { item: 'lenco', lines: [say('madalena', 'Este lenço... era para enxugar lágrimas. Hoje, talvez sejam de alegria.')] },
      ],
      lines: [say('madalena', 'Leve esta flor que desabrochou ao amanhecer.')],
    }),
    npc('mariaj', 'Maria, mãe de Tiago', 'mulher2', [12, 27], {
      gives: 'perfume_alvorada', role: 'Seguidora de Jesus',
      uses: [{ item: 'perfume_frasco', lines: [say('mariaj', 'Mais perfume para o cuidado! Obrigada.')] }],
      lines: [say('mariaj', 'Passamos o sábado em silêncio e oração. Agora vamos ao sepulcro.')],
    }),
    npc('salome', 'Salomé', 'mulher3', [8, 28], {
      gives: 'semente_jardim', role: 'Seguidora de Jesus',
      uses: [{ item: 'sementes', lines: [say('salome', 'Sementes do semeador da Galileia! Vamos plantá-las aqui neste jardim — vida nova.')] }],
      lines: [say('salome', 'Quem nos revolverá a pedra da porta do sepulcro? É grande demais para nós.')],
    }),
    npc('jardineiro', 'Jardineiro', 'campones', [30, 22], {
      gives: 'regador', role: 'Cuida do jardim',
      uses: [
        { item: 'flauta', lines: [narr('Você toca a flauta do pastor Zacarias. O som se mistura ao canto dos pássaros.')] },
        { item: 'lira', lines: [narr('Você dedilha a pequena lira da Decápolis: "Tudo faz bem!".')] },
        { item: 'hino', lines: [narr('Você lê baixinho o hino da ceia. Agora ele soa como canção de esperança.')] },
        { item: 'piao', lines: [narr('O pião do menino da Judeia gira na terra macia do jardim.')] },
        { item: 'concha', lines: [narr('A concha de Tiro reflete a luz dourada do amanhecer.')] },
        { item: 'flor', lines: [narr('A flor da filha de Jairo também desabrochou outra vez.')] },
      ],
      lines: [say('jardineiro', 'Nunca vi um amanhecer tão bonito neste jardim.')],
    }),
    npc('anjo', 'Jovem vestido de branco', 'anjo', [66, 20], {
      showFrom: 'anjo', role: 'Mensageiro da ressurreição',
      uses: [
        { item: 'recado_pedro', lines: [say('anjo', 'Dizei a seus discípulos, e a Pedro...', 'Marcos 16:7'), narr('Pedro foi lembrado pelo nome. A negação não foi o fim da sua história.')] },
        { item: 'registro', lines: [narr('O registro do centurião e a mensagem do anjo se completam: o Filho de Deus morreu e ressuscitou.')] },
      ],
      lines: [say('anjo', 'Ide, dizei a seus discípulos que ele vai adiante de vós para a Galileia.')],
    }),
  ],
  steps: [
    {
      id: 'mulheres', title: 'Encontrar as mulheres a caminho do sepulcro', kind: 'talk', npc: 'madalena',
      hint: 'Três mulheres caminham pela entrada do jardim com especiarias.',
      lines: [
        narr('E, passado o sábado, Maria Madalena, e Maria, mãe de Tiago, e Salomé compraram aromas para irem ungi-lo.', 'Marcos 16:1'),
        narr('E, no primeiro dia da semana, foram ao sepulcro, de manhã cedo, ao nascer do sol.', 'Marcos 16:2'),
        say('madalena', 'Quem nos revolverá a pedra da porta do sepulcro?', 'Marcos 16:3'),
      ],
    },
    {
      id: 'jardim', title: 'Percorrer o jardim', kind: 'reach', at: [34, 28], r: 3,
      hint: 'Siga a trilha entre as flores até o centro do jardim.',
      lines: [narr('O jardim desperta: orvalho nas folhas, pássaros cantando e a luz dourada da manhã.')],
      scene: [fx('birds')],
    },
    {
      id: 'pedra', title: 'Descobrir a pedra removida', kind: 'scene', at: [62, 22], r: 3,
      hint: 'Continue até o sepulcro escavado na rocha, a leste.',
      scene: [
        cam([65, 18]),
        fx('stone'),
        N('E, olhando, viram que já a pedra estava revolvida; e era ela muito grande.', 'Marcos 16:4'),
        fx('dawn'),
        cam('player'),
      ],
    },
    {
      id: 'entrar', title: 'Entrar no sepulcro', kind: 'reach', at: [65, 19], r: 1.6,
      hint: 'Aproxime-se da entrada aberta do sepulcro.',
      lines: [narr('E, entrando no sepulcro, viram um jovem assentado à direita, vestido de uma roupa comprida, branca; e ficaram espantadas.', 'Marcos 16:5')],
      scene: [show('anjo', [66, 20])],
    },
    {
      id: 'anjo', title: 'Receber a mensagem da ressurreição', kind: 'talk', npc: 'anjo',
      hint: 'Ouça o jovem vestido de branco.',
      lines: [
        say('anjo', 'Não vos assusteis; buscais a Jesus, o Nazareno, que foi crucificado; já ressuscitou, não está aqui; eis aqui o lugar onde o puseram.', 'Marcos 16:6'),
        say('anjo', 'Mas ide, dizei a seus discípulos e a Pedro que ele vai adiante de vós para a Galileia; ali o vereis, como ele vos disse.', 'Marcos 16:7'),
        narr('E, saindo elas apressadamente, fugiram do sepulcro, porque estavam possuídas de temor e assombro.', 'Marcos 16:8'),
      ],
      scene: [fx('sparkle'), fx('birds')],
    },
    {
      id: 'ultimo', title: 'Desafio: completar o último pergaminho', kind: 'challenge', helpItem: 'registro',
      hint: 'Marque apenas as frases que estão na mensagem do anjo (Marcos 16:6-7).',
      challenge: {
        type: 'select',
        prompt: 'Complete o último pergaminho: marque o que o jovem vestido de branco disse em Marcos 16:6-7.',
        options: [
          { text: '"Não vos assusteis"', ok: true },
          { text: '"Buscais a Jesus, o Nazareno, que foi crucificado"', ok: true },
          { text: '"Já ressuscitou, não está aqui"', ok: true },
          { text: '"Eis aqui o lugar onde o puseram"', ok: true },
          { text: '"Dizei a seus discípulos e a Pedro"', ok: true },
          { text: '"Ele vai adiante de vós para a Galileia"', ok: true },
          { text: '"Voltai amanhã com mais especiarias"', ok: false },
          { text: '"Não conteis a ninguém, nem aos discípulos"', ok: false },
          { text: '"Ele foi levado para Roma"', ok: false },
        ],
      },
    },
    {
      id: 'final', title: 'Finalizar a jornada pelo Evangelho', kind: 'scene', at: [60, 24], r: 4,
      hint: 'Afaste-se um pouco do sepulcro e contemple o amanhecer.',
      scene: [
        { t: 'pose', pose: 'write' },
        N('Observação textual: os manuscritos mais antigos de Marcos terminam no versículo 8. Os versículos 9 a 20 aparecem em muitos manuscritos e estão presentes em diversas traduções, geralmente acompanhados de uma nota explicativa.'),
        N('Esse trecho relata que Jesus ressuscitado apareceu primeiro a Maria Madalena e depois aos discípulos, e que os enviou com esta missão:'),
        S('jesus', 'Ide por todo o mundo, pregai o evangelho a toda criatura.', 'Marcos 16:15 (trecho com nota textual)'),
        fx('sparkle'),
        S('marcos', 'A morte foi vencida. Jesus ressuscitou! Meu pergaminho está completo.'),
      ],
    },
  ],
  side: [
    {
      id: 'agua', title: 'Água para as flores', giver: 'jardineiro', needs: 'agua_fonte', needsFrom: 'Marcos 8',
      hint: 'O jardineiro quer regar as flores antes que o sol fique forte.',
      ask: [say('jardineiro', 'A fonte do jardim está baixa. Se eu tivesse água fresca para as flores do sepulcro...')],
      thanks: [say('jardineiro', 'Água da fonte de Cesareia, tão longe daqui! As flores vão brilhar. Leve esta coroa de flores como lembrança da jornada.')],
      reward: 'coroa_flores',
    },
  ],
  scrolls: [
    { id: 's1', at: [4, 6], ref: 'Marcos 16:6', text: 'Não vos assusteis; buscais a Jesus, o Nazareno, que foi crucificado; já ressuscitou, não está aqui.' },
    { id: 's2', at: [40, 46], ref: 'Marcos 16:7', text: 'Ide, dizei a seus discípulos e a Pedro que ele vai adiante de vós para a Galileia; ali o vereis.' },
    { id: 's3', at: [76, 40], ref: 'Marcos 16:15 (nota textual)', text: 'Ide por todo o mundo, pregai o evangelho a toda criatura.' },
  ],
  message: {
    title: 'A morte foi vencida. Jesus ressuscitou!',
    summary:
      'No primeiro dia da semana, ao nascer do sol, as mulheres foram ao sepulcro com especiarias e encontraram a grande pedra já removida. Um jovem vestido de branco anunciou: "Já ressuscitou, não está aqui", e as enviou para avisar os discípulos — e a Pedro — que Jesus iria adiante deles para a Galileia. O Evangelho termina com um túmulo vazio e um recomeço.',
    verses: [
      { ref: 'Marcos 16:6', text: 'Não vos assusteis; buscais a Jesus, o Nazareno, que foi crucificado; já ressuscitou, não está aqui.' },
      { ref: 'Marcos 16:7', text: 'Ide, dizei a seus discípulos e a Pedro que ele vai adiante de vós para a Galileia.' },
    ],
    reflection:
      'A história começou na Galileia e o anjo manda voltar para a Galileia: onde tudo começou, agora com o Ressuscitado indo à frente. E repare no "e a Pedro" — aquele que negou é chamado pelo nome. A ressurreição é a notícia de que nenhuma queda e nem mesmo a morte têm a última palavra.',
  },
  quiz: [
    { q: 'Quando as mulheres foram ao sepulcro?', options: ['No sábado à noite', 'No primeiro dia da semana, ao nascer do sol', 'Uma semana depois', 'Ao meio-dia de sexta-feira'], correct: 1, explain: 'Marcos 16:2.' },
    { q: 'O que as mulheres se perguntavam no caminho?', options: ['"Onde está Pedro?"', '"Quem nos revolverá a pedra?"', '"Que horas são?"', '"Onde compraremos especiarias?"'], correct: 1, explain: 'Marcos 16:3.' },
    { q: 'Para onde o anjo disse que Jesus iria adiante dos discípulos?', options: ['Roma', 'Egito', 'Galileia', 'Babilônia'], correct: 2, explain: 'Marcos 16:7: "ele vai adiante de vós para a Galileia; ali o vereis".' },
  ],
};
addUse(ch, 'salome', 'pao_campo', [say('salome', 'O pão de Simão de Cirene! Vamos reparti-lo no caminho da Galileia.')]);
addUse(ch, 'jardineiro', 'folha_palmeira', [narr('A folha de palmeira do Hosana ainda está verde.')]);
export default ch;
