import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc, addUse } from './common';

// Marcos 10 — O caminho do servo (estradas da Judeia e Jericó)
const ch: ChapterDef = {
  n: 10,
  title: 'O caminho do servo',
  ref: 'Marcos 10',
  setting: 'Estradas da Judeia e Jericó',
  intro:
    'Jesus segue pelas estradas da Judeia, rumo a Jerusalém. Pelo caminho, pais trazem crianças, um homem rico faz uma pergunta sincera e, já perto de Jericó, um mendigo cego não para de clamar.',
  map: {
    kind: 'proc', w: 100, h: 40, base: 'sand', ambience: 'day', seed: 10,
    features: [
      { f: 'rect', tile: 'grass', x: 0, y: 8, w: 22, h: 24 },
      { f: 'village', x: 2, y: 4, w: 18, h: 10, n: 3 },
      { f: 'path', tile: 'dirt', pts: [[0, 20], [30, 20], [50, 22], [70, 19], [100, 20]], w: 3 },
      { f: 'blob', tile: 'rock', x: 36, y: 6, r: 6 },
      { f: 'blob', tile: 'rock', x: 58, y: 34, r: 6 },
      { f: 'blob', tile: 'rock', x: 66, y: 6, r: 5 },
      { f: 'rect', tile: 'cliff', x: 30, y: 0, w: 40, h: 2 },
      { f: 'rect', tile: 'cliff', x: 40, y: 38, w: 30, h: 2 },
      { f: 'rect', tile: 'grass', x: 78, y: 0, w: 22, h: 40 },
      { f: 'rect', tile: 'stone', x: 80, y: 16, w: 20, h: 9 },
      { f: 'village', x: 80, y: 2, w: 18, h: 12, n: 4 },
      { f: 'village', x: 80, y: 27, w: 18, h: 12, n: 3 },
      { f: 'blob', tile: 'water', x: 90, y: 10, r: 2 },
      { f: 'obj', o: 'gate', x: 79, y: 14 },
      { f: 'obj', o: 'well', x: 12, y: 24 },
      { f: 'obj', o: 'tent', x: 52, y: 15 },
      { f: 'obj', o: 'donkey', x: 32, y: 24 },
      { f: 'scatter', o: 'palm', x: 78, y: 0, w: 22, h: 40, n: 16, on: ['grass'] },
      { f: 'scatter', o: 'olive', x: 0, y: 8, w: 22, h: 24, n: 8, on: ['grass'] },
      { f: 'scatter', o: 'deadtree', x: 24, y: 2, w: 52, h: 36, n: 10, on: ['sand'] },
      { f: 'scatter', o: 'bigrock', x: 24, y: 2, w: 52, h: 36, n: 12, on: ['sand', 'rock'] },
      { f: 'scatter', o: 'bush', x: 0, y: 0, w: 100, h: 40, n: 20, on: ['sand', 'grass'] },
      { f: 'scatter', o: 'flower', x: 0, y: 8, w: 22, h: 24, n: 12, on: ['grass'] },
    ],
  },
  cell: 16,
  spawn: [3, 20],
  music: 'pastoral',
  messageAt: [88, 22],
  zones: [
    { id: 'aldeia', name: 'Aldeia da Judeia', at: [10, 16], r: 6 },
    { id: 'estrada', name: 'Estrada do deserto', at: [44, 21], r: 6 },
    { id: 'tenda', name: 'Pouso dos viajantes', at: [54, 18], r: 4 },
    { id: 'jerico', name: 'Jericó', at: [88, 20], r: 7 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [15, 20], { role: 'O Mestre que veio para servir' }),
    npc('crianca', 'Menino da aldeia', 'crianca', [12, 17], {
      gives: 'piao', role: 'Criança abençoada por Jesus',
      uses: [{ item: 'pedrinha', lines: [say('crianca', 'Uma pedrinha colorida! O menino da montanha mandou para mim? Obrigado!')] }],
      lines: [say('crianca', 'Ele nos abraçou e nos abençoou! Toma meu pião de madeira — no jardim, de manhã, dá pra brincar.')],
    }),
    npc('menina', 'Menina da aldeia', 'menina', [13, 18], { role: 'Criança abençoada por Jesus', lines: [say('menina', 'Os discípulos queriam nos mandar embora, mas Jesus não deixou!')] }),
    npc('rico', 'O homem rico', 'rico', [32, 19], {
      gives: 'anel', role: 'Perguntou sobre a vida eterna',
      lines: [say('rico', 'Guardei os mandamentos desde a minha mocidade... mas uma coisa me falta. Leve este anel. Talvez você entenda, no templo, o que é dar tudo.')],
    }),
    npc('tiago', 'Tiago', 'tiago', [46, 23], {
      gives: 'calice', role: 'Apóstolo',
      lines: [say('tiago', 'João e eu pedimos para sentar à direita e à esquerda dele. Ele perguntou se poderíamos beber o cálice que Ele beberia. Guarde este cálice.')],
    }),
    npc('sedento', 'Viajante sedento', 'viajante', [56, 24], { role: 'Peregrino', lines: [say('sedento', 'Água... a estrada de Jericó é tão quente...')] }),
    npc('bartimeu', 'Bartimeu', 'cego', [86, 23], {
      gives: 'capa', role: 'Filho de Timeu, curado em Jericó',
      uses: [
        { item: 'unguento', lines: [say('bartimeu', 'Unguento para os olhos, do cego de Betsaida? Agora vejo, mas guardarei como lembrança de que Ele cura de muitas maneiras.')] },
        { item: 'copo', lines: [say('bartimeu', 'Um copo de água em nome dele... obrigado!')] },
      ],
      lines: [say('bartimeu', 'Lancei de mim a minha capa e fui até Ele! Fique com ela — em Jerusalém, alguém vai estendê-la no caminho do Rei.')],
    }),
  ],
  steps: [
    {
      id: 'criancas', title: 'Encontrar as crianças que se aproximam de Jesus', kind: 'talk', npc: 'jesus',
      hint: 'Na aldeia, crianças querem chegar perto de Jesus.',
      lines: [
        narr('E traziam-lhe meninos para que lhes tocasse, mas os discípulos repreendiam aos que lhos traziam.', 'Marcos 10:13'),
        say('jesus', 'Deixai vir os meninos a mim, e não os impeçais, porque dos tais é o reino de Deus.', 'Marcos 10:14'),
        narr('E, tomando-os nos seus braços e impondo-lhes as mãos, os abençoou.', 'Marcos 10:16'),
      ],
    },
    {
      id: 'rico', title: 'Ouvir o diálogo com o homem rico', kind: 'talk', npc: 'rico',
      hint: 'Um homem correu ao encontro de Jesus na estrada.',
      lines: [
        say('rico', 'Bom Mestre, que farei para herdar a vida eterna?', 'Marcos 10:17'),
        narr('E Jesus, olhando para ele, o amou e disse:', 'Marcos 10:21'),
        say('jesus', 'Falta-te uma coisa: vai, e vende tudo quanto tens, e dá-o aos pobres, e terás um tesouro no céu; e vem, e segue-me.', 'Marcos 10:21'),
        narr('Mas ele, pesaroso desta palavra, retirou-se triste; porque possuía muitas propriedades.', 'Marcos 10:22'),
      ],
      scene: [show('jesus', [30, 21])],
    },
    {
      id: 'servir', title: 'Acompanhar os ensinamentos sobre servir', kind: 'talk', npc: 'tiago',
      hint: 'Mais adiante na estrada, Tiago e João fazem um pedido.',
      lines: [
        narr('E aproximaram-se dele Tiago e João, filhos de Zebedeu, pedindo para assentar-se, um à sua direita e outro à sua esquerda, na sua glória.', 'Marcos 10:35-37'),
        say('jesus', 'Qualquer que entre vós quiser ser grande será vosso serviçal.', 'Marcos 10:43'),
        say('jesus', 'Porque o Filho do Homem também não veio para ser servido, mas para servir e dar a sua vida em resgate de muitos.', 'Marcos 10:45'),
      ],
      scene: [show('jesus', [44, 22])],
    },
    {
      id: 'estrada', title: 'Percorrer a estrada de Jericó', kind: 'reach', at: [76, 20], r: 3,
      hint: 'Siga para o leste pela estrada do deserto até as portas de Jericó.',
      lines: [narr('Depois foram para Jericó. E, saindo ele de Jericó com seus discípulos e uma grande multidão...', 'Marcos 10:46')],
      scene: [hide('jesus')],
    },
    {
      id: 'bartimeu', title: 'Desafio: encontrar Bartimeu', kind: 'challenge',
      hint: 'No meio da multidão, alguém clama. Siga a voz — o medidor "Ouvindo" mostra se você está perto.',
      challenge: { type: 'hotcold', target: [86, 23], call: 'Jesus, Filho de Davi, tem misericórdia de mim!', npc: 'bartimeu' },
      scene: [
        show('jesus', [84, 21]),
        N('E muitos o repreendiam, para que se calasse; mas ele clamava cada vez mais: Filho de Davi, tem misericórdia de mim!', 'Marcos 10:48'),
        S('jesus', 'Que queres que te faça?', 'Marcos 10:51'),
        S('bartimeu', 'Mestre, que eu tenha vista.', 'Marcos 10:51'),
        S('jesus', 'Vai, a tua fé te salvou.', 'Marcos 10:52'),
        fx('sparkle'),
        N('E logo viu, e seguiu a Jesus pelo caminho.', 'Marcos 10:52'),
      ],
    },
  ],
  side: [
    {
      id: 'odre', title: 'Água no deserto', giver: 'sedento', needs: 'odre', needsFrom: 'Marcos 1',
      hint: 'Um viajante sedento descansa perto do pouso da estrada.',
      ask: [say('sedento', 'Minha água acabou no meio do caminho para Jericó. Você teria um odre?')],
      thanks: [say('sedento', 'O odre do deserto! Você salvou minha viagem. Tome estas duas pequenas moedas; é tudo o que eu tenho, mas dou de coração.')],
      reward: 'leptos',
    },
  ],
  scrolls: [
    { id: 's1', at: [6, 30], ref: 'Marcos 10:14', text: 'Deixai vir os meninos a mim, e não os impeçais, porque dos tais é o reino de Deus.' },
    { id: 's2', at: [62, 30], ref: 'Marcos 10:27', text: 'Para os homens é impossível, mas não para Deus, porque para Deus todas as coisas são possíveis.' },
    { id: 's3', at: [96, 34], ref: 'Marcos 10:45', text: 'Porque o Filho do Homem também não veio para ser servido, mas para servir e dar a sua vida em resgate de muitos.' },
  ],
  message: {
    title: 'Seguir Jesus é entrega e serviço',
    summary:
      'Jesus acolheu as crianças e disse que o Reino pertence aos que são como elas. Amou o homem rico e o convidou a deixar tudo e segui-lo, mas ele foi embora triste. Ensinou que a verdadeira grandeza está em servir, pois Ele mesmo veio para servir. Em Jericó, Bartimeu clamou, foi curado e seguiu Jesus pelo caminho.',
    verses: [
      { ref: 'Marcos 10:45', text: 'O Filho do Homem também não veio para ser servido, mas para servir.' },
      { ref: 'Marcos 10:52', text: 'Vai, a tua fé te salvou. E logo viu, e seguiu a Jesus pelo caminho.' },
    ],
    reflection:
      'O rico tinha muito e foi embora triste; Bartimeu tinha só uma capa, jogou-a fora e seguiu Jesus alegre. Às vezes, o que seguramos com força é o que nos impede de caminhar. O que você precisaria "largar" para seguir mais livre?',
  },
  quiz: [
    { q: 'O que Jesus disse quando os discípulos repreenderam quem trazia as crianças?', options: ['"Levai-as embora"', '"Deixai vir os meninos a mim"', '"Voltai amanhã"', '"Só os adultos entendem"'], correct: 1, explain: 'Marcos 10:14.' },
    { q: 'Por que o homem rico foi embora triste?', options: ['Porque estava doente', 'Porque possuía muitas propriedades', 'Porque Jesus não falou com ele', 'Porque perdeu o caminho'], correct: 1, explain: 'Marcos 10:22: "retirou-se triste; porque possuía muitas propriedades".' },
    { q: 'O que Bartimeu fez depois de ser curado?', options: ['Voltou para casa', 'Seguiu a Jesus pelo caminho', 'Foi ao templo', 'Continuou mendigando'], correct: 1, explain: 'Marcos 10:52: "E logo viu, e seguiu a Jesus pelo caminho".' },
  ],
};
addUse(ch, 'tiago', 'mapa', [say('tiago', 'Um mapa das estradas! Veja: daqui até Jericó, e depois Jerusalém.')]);
export default ch;
