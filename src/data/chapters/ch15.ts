import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, cam, npc, addUse } from './common';

// Marcos 15 — O preço do amor (Jerusalém, pretório e Gólgota)
// Capítulo narrativo e reflexivo: sem combate, sem violência gráfica, sem recompensas por sofrimento.
const ch: ChapterDef = {
  n: 15,
  title: 'O preço do amor',
  ref: 'Marcos 15',
  setting: 'Jerusalém, pretório e Gólgota',
  solemn: true,
  intro:
    'Este capítulo é vivido em silêncio e respeito. Não há pressa nem disputa aqui: apenas caminhar, observar e registrar com reverência o que o Evangelho conta sobre o dia em que Jesus deu a sua vida.',
  map: {
    kind: 'proc', w: 90, h: 50, base: 'stone', ambience: 'dark', seed: 15,
    features: [
      { f: 'rect', tile: 'marble', x: 8, y: 4, w: 22, h: 18 },
      { f: 'village', x: 2, y: 28, w: 44, h: 18, n: 6 },
      { f: 'obj', o: 'pillar', x: 9, y: 6 }, { f: 'obj', o: 'pillar', x: 9, y: 14 }, { f: 'obj', o: 'pillar', x: 28, y: 6 }, { f: 'obj', o: 'pillar', x: 28, y: 14 },
      { f: 'obj', o: 'altar', x: 18, y: 8 },
      { f: 'rect', tile: 'wall', x: 50, y: 0, w: 2, h: 22 },
      { f: 'rect', tile: 'wall', x: 50, y: 29, w: 2, h: 21 },
      { f: 'rect', tile: 'sand', x: 52, y: 0, w: 38, h: 30 },
      { f: 'blob', tile: 'rock', x: 70, y: 13, r: 7 },
      { f: 'rect', tile: 'darkgrass', x: 56, y: 30, w: 34, h: 20 },
      { f: 'path', tile: 'dirt', pts: [[30, 26], [52, 25], [58, 22], [64, 17], [68, 16]], w: 3 },
      { f: 'path', tile: 'dirt', pts: [[64, 20], [70, 32], [76, 44]], w: 2 },
      { f: 'obj', o: 'cross', x: 66, y: 11 }, { f: 'obj', o: 'cross', x: 70, y: 9 }, { f: 'obj', o: 'cross', x: 74, y: 11 },
      { f: 'obj', o: 'tomb', x: 78, y: 43 },
      { f: 'obj', o: 'stone', x: 78, y: 44, solid: false },
      { f: 'obj', o: 'lamp', x: 20, y: 22 }, { f: 'obj', o: 'lamp', x: 40, y: 24 },
      { f: 'scatter', o: 'olive', x: 56, y: 30, w: 34, h: 20, n: 14 },
      { f: 'scatter', o: 'flower', x: 56, y: 30, w: 34, h: 20, n: 10 },
      { f: 'scatter', o: 'deadtree', x: 52, y: 0, w: 38, h: 28, n: 5, on: ['sand'] },
      { f: 'scatter', o: 'rock', x: 52, y: 0, w: 38, h: 28, n: 12, on: ['sand', 'rock'] },
    ],
  },
  cell: 16,
  spawn: [20, 24],
  music: 'lament',
  messageAt: [72, 36],
  zones: [
    { id: 'pretorio', name: 'Pretório', at: [19, 13], r: 6 },
    { id: 'ruas', name: 'Ruas de Jerusalém', at: [30, 26], r: 6 },
    { id: 'golgota', name: 'Gólgota', at: [68, 16], r: 5 },
    { id: 'jardim', name: 'Jardim do sepulcro', at: [76, 40], r: 6 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [19, 15], { hideAfter: 'julgamento', role: 'O Rei dos Judeus' }),
    npc('pilatos', 'Pôncio Pilatos', 'pilatos', [19, 10], { role: 'Governador romano' }),
    npc('soldado', 'Soldado romano', 'soldado', [15, 16], { role: 'Guarda do pretório' }),
    npc('simao', 'Simão de Cirene', 'simaoCirene', [32, 26], {
      gives: 'pao_campo', role: 'Pai de Alexandre e de Rufo',
      lines: [say('simao', 'Eu vinha do campo e me fizeram carregar a cruz dele. Nunca esquecerei este dia. Leve este pão que eu trazia do campo.')],
    }),
    npc('centuriao', 'Centurião', 'centuriao', [68, 19], {
      gives: 'registro', role: 'Reconheceu o Filho de Deus',
      lines: [say('centuriao', 'Eu vi como Ele morreu. Escreva o que eu disse, escriba: Verdadeiramente este homem era o Filho de Deus.')],
    }),
    npc('jose', 'José de Arimateia', 'joseArimateia', [66, 26], {
      gives: 'mirra', role: 'Membro do conselho que esperava o Reino',
      uses: [
        { item: 'linho', lines: [say('jose', 'Um pano de linho tecido por mãos curadas... Comprei linho fino para envolvê-lo; este também será guardado com honra.')] },
        { item: 'toalha', lines: [say('jose', 'A toalha da casa de Simão. Obrigado, ajudará no cuidado com o corpo.')] },
        { item: 'selo', lines: [say('jose', 'Um selo de cera... Pilatos concedeu o corpo. Tudo foi feito com permissão.')] },
      ],
      lines: [say('jose', 'Ousei pedir o corpo a Pilatos. Leve esta mirra; as mulheres vão querer completar o cuidado depois do sábado.')],
    }),
    npc('madalena', 'Maria Madalena', 'madalena', [73, 40], {
      gives: 'especiarias', role: 'Seguidora de Jesus',
      uses: [{ item: 'lamparina_ceia', lines: [say('madalena', 'Uma lamparina... obrigada. Vamos ficar observando onde o colocam.')] }],
      lines: [say('madalena', 'Nós o seguíamos desde a Galileia. Guarde estas especiarias; passado o sábado, voltaremos.')],
    }),
    npc('mariaj', 'Maria, mãe de José', 'mulher2', [74, 42], { role: 'Seguidora de Jesus', lines: [say('mariaj', 'Observamos onde O puseram.')] }),
  ],
  steps: [
    {
      id: 'julgamento', title: 'Acompanhar o julgamento diante de Pilatos', kind: 'scene', at: [19, 18], r: 4,
      hint: 'Vá até o pretório, o pátio de colunas ao norte.',
      scene: [
        N('E, logo ao amanhecer, os principais dos sacerdotes levaram Jesus amarrado e o entregaram a Pilatos.', 'Marcos 15:1'),
        S('pilatos', 'Tu és o Rei dos Judeus?', 'Marcos 15:2'),
        S('jesus', 'Tu o dizes.', 'Marcos 15:2'),
        N('Mas Jesus nada mais respondeu, de maneira que Pilatos se maravilhava.', 'Marcos 15:5'),
        N('Então, Pilatos, querendo satisfazer a multidão, soltou-lhes Barrabás e entregou Jesus para ser crucificado.', 'Marcos 15:15'),
        hide('jesus'),
      ],
    },
    {
      id: 'simao', title: 'Conhecer Simão de Cirene', kind: 'talk', npc: 'simao',
      hint: 'Nas ruas, um homem que vinha do campo foi obrigado a ajudar.',
      lines: [narr('E constrangeram um certo Simão, cireneu, pai de Alexandre e de Rufo, que por ali passava, vindo do campo, a que levasse a cruz.', 'Marcos 15:21')],
    },
    {
      id: 'caminho', title: 'Percorrer o caminho até o Gólgota', kind: 'challenge',
      hint: 'Caminhe em silêncio, perto de Simão, até o lugar chamado Gólgota.',
      challenge: { type: 'follow', npc: 'simao', radius: 4, path: [[38, 26], [46, 25], [52, 25], [58, 22], [63, 18], [66, 16]] },
      scene: [N('E levaram-no ao lugar do Gólgota, que se traduz por lugar da Caveira.', 'Marcos 15:22')],
    },
    {
      id: 'cruz', title: 'Acompanhar a crucificação', kind: 'scene', at: [67, 17], r: 4,
      hint: 'Permaneça no alto do Gólgota, em silêncio.',
      scene: [
        cam([70, 12]),
        N('E, havendo-o crucificado, repartiram as suas vestes.', 'Marcos 15:24'),
        N('E por cima dele estava escrita a sua acusação: O REI DOS JUDEUS.', 'Marcos 15:26'),
        fx('dark'),
        N('E, chegada a hora sexta, houve trevas sobre toda a terra até à hora nona.', 'Marcos 15:33'),
        N('E, à hora nona, Jesus exclamou com grande voz, dizendo: Eloí, Eloí, lamá sabactâni? Isso, traduzido, é: Deus meu, Deus meu, por que me desamparaste?', 'Marcos 15:34'),
        N('E Jesus, dando um grande brado, expirou.', 'Marcos 15:37'),
        fx('tear'),
        N('E o véu do templo se rasgou em dois, de alto a baixo.', 'Marcos 15:38'),
        cam('player'),
      ],
    },
    {
      id: 'centuriao', title: 'Registrar a declaração do centurião', kind: 'talk', npc: 'centuriao',
      hint: 'O centurião que estava defronte da cruz quer dizer algo.',
      lines: [say('centuriao', 'Verdadeiramente, este homem era o Filho de Deus.', 'Marcos 15:39')],
    },
    {
      id: 'registro', title: 'Desafio: registrar os acontecimentos', kind: 'challenge',
      hint: 'No seu pergaminho, coloque os acontecimentos na ordem em que Marcos os narra.',
      challenge: {
        type: 'sequence',
        prompt: 'Organize o registro conforme Marcos 15.',
        items: [
          'Jesus é levado a Pilatos',
          'Simão de Cirene é obrigado a levar a cruz',
          'Jesus é crucificado no Gólgota',
          'Trevas da hora sexta até a hora nona',
          'O véu do templo se rasga de alto a baixo',
          'O centurião declara: "Verdadeiramente este homem era o Filho de Deus"',
          'José de Arimateia coloca o corpo num sepulcro',
        ],
      },
    },
    {
      id: 'sepulcro', title: 'Acompanhar José de Arimateia até o sepulcro', kind: 'talk', npc: 'jose',
      hint: 'José de Arimateia, membro do conselho, vai pedir o corpo de Jesus.',
      lines: [
        narr('Chegou José de Arimateia, senador honrado, que também esperava o Reino de Deus, e ousadamente foi a Pilatos e pediu o corpo de Jesus.', 'Marcos 15:43'),
      ],
      scene: [
        mv('jose', [76, 45], 35),
        N('E ele, tendo comprado um lençol fino, o tirou da cruz, envolveu-o no lençol e o depositou num sepulcro lavrado numa rocha; e revolveu uma pedra para a porta do sepulcro.', 'Marcos 15:46'),
        N('E Maria Madalena e Maria, mãe de José, observavam onde o punham.', 'Marcos 15:47'),
        { t: 'pose', pose: 'pray' },
      ],
    },
  ],
  side: [
    {
      id: 'luz', title: 'Luz para as mulheres', giver: 'mariaj', needs: 'lamparina', needsFrom: 'Marcos 1',
      hint: 'As mulheres que observam o sepulcro estão no escuro.',
      ask: [say('mariaj', 'Está tão escuro... Queremos ficar perto, mas não enxergamos o caminho.')],
      thanks: [say('mariaj', 'A lamparina dos filhos de Zebedeu... Obrigada. Leve este lenço; vamos precisar de esperança daqui a três dias.')],
      reward: 'lenco',
    },
  ],
  scrolls: [
    { id: 's1', at: [6, 4], ref: 'Marcos 15:2', text: 'E perguntou-lhe Pilatos: Tu és o Rei dos Judeus? E ele, respondendo, disse-lhe: Tu o dizes.' },
    { id: 's2', at: [86, 4], ref: 'Marcos 15:34', text: 'Deus meu, Deus meu, por que me desamparaste?' },
    { id: 's3', at: [86, 48], ref: 'Marcos 15:39', text: 'Verdadeiramente, este homem era o Filho de Deus.' },
  ],
  message: {
    title: 'O sacrifício de Cristo',
    summary:
      'Jesus foi julgado diante de Pilatos e entregue para ser crucificado. Simão de Cirene carregou a cruz até o Gólgota. Ao meio-dia, trevas cobriram a terra; Jesus clamou ao Pai e entregou a vida. O véu do templo se rasgou, e um centurião romano declarou que Ele era o Filho de Deus. José de Arimateia o sepultou, e as mulheres observaram onde o puseram.',
    verses: [
      { ref: 'Marcos 10:45', text: 'O Filho do Homem também não veio para ser servido, mas para servir e dar a sua vida em resgate de muitos.' },
      { ref: 'Marcos 15:39', text: 'Verdadeiramente, este homem era o Filho de Deus.' },
    ],
    reflection:
      'Este não é um capítulo para ser "vencido", mas contemplado. Jesus não foi derrotado: Ele deu a sua vida, como havia anunciado. O véu rasgado lembra que o caminho até Deus foi aberto. Fique um momento em silêncio e pense no tamanho desse amor.',
  },
  quiz: [
    { q: 'Quem foi obrigado a levar a cruz de Jesus?', options: ['Pedro', 'Simão de Cirene', 'José de Arimateia', 'Um soldado'], correct: 1, explain: 'Marcos 15:21.' },
    { q: 'O que aconteceu com o véu do templo?', options: ['Foi queimado', 'Rasgou-se em dois, de alto a baixo', 'Foi retirado', 'Nada aconteceu'], correct: 1, explain: 'Marcos 15:38.' },
    { q: 'O que disse o centurião?', options: ['"Ele era um profeta"', '"Verdadeiramente, este homem era o Filho de Deus"', '"Ele era inocente"', '"Ele vai voltar"'], correct: 1, explain: 'Marcos 15:39.' },
  ],
};
addUse(ch, 'jose', 'cinzel', [say('jose', 'Um cinzel de pedreiro. O meu sepulcro novo foi lavrado na rocha com ferramentas assim.')]);
addUse(ch, 'madalena', 'amendoas', [say('madalena', 'Amêndoas de Betânia... obrigada pelo cuidado.')]);
export default ch;
