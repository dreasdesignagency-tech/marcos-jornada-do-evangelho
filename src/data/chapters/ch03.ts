import type { ChapterDef } from '../types';
import { narr, say, N, S, mv, show, hide, fx, cam, npc } from './common';

// Marcos 3 — O chamado dos doze (sinagoga, montanha e margens da Galileia)
const ch: ChapterDef = {
  n: 3,
  title: 'O chamado dos doze',
  ref: 'Marcos 3',
  setting: 'Sinagoga, montanha e margens da Galileia',
  intro:
    'É sábado em Cafarnaum. Na sinagoga, todos observam Jesus com atenção — alguns com esperança, outros procurando um motivo para acusá-lo. Entre os presentes há um homem que tem uma das mãos ressequida...',
  map: { kind: 'ref', key: 'galileia', ambience: 'day' },
  cell: 32,
  spawn: [30, 22],
  music: 'temple',
  messageAt: [32, 23],
  zones: [
    { id: 'sinagoga', name: 'Sinagoga de Cafarnaum', at: [41, 17], r: 2.5 },
    { id: 'trilha', name: 'Trilha da montanha', at: [27, 8], r: 2.5 },
    { id: 'cume', name: 'Cume do monte', at: [34, 2], r: 2 },
    { id: 'margem', name: 'Margens da Galileia', at: [33, 24], r: 3 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [40, 17], { role: 'O Mestre' }),
    npc('homemMao', 'Homem da mão ressequida', 'homem3', [42, 18], {
      gives: 'linho', role: 'Curado no sábado',
      lines: [say('homemMao', 'Minha mão está sã como a outra! Tome este pano de linho que eu mesmo teci — é a primeira obra das minhas mãos curadas.')],
    }),
    npc('fariseu', 'Fariseu da sinagoga', 'fariseu', [39, 18], {
      gives: 'filacterio', role: 'Observador da Lei',
      lines: [say('fariseu', 'Guardo os mandamentos junto ao coração e à testa. Leve este filactério; um dia você ouvirá qual é o maior mandamento.')],
    }),
    npc('pedro', 'Simão (Pedro)', 'pedro', [33, 3], {
      showFrom: 'doze', gives: 'pedra', role: 'Apóstolo',
      uses: [{ item: 'corda', lines: [say('pedro', 'Minha corda de pescador! Ela ajudou a baixar o paralítico pelo telhado? Que bom uso!')] }],
      lines: [say('pedro', 'Jesus me deu um novo nome: Pedro. Guarde esta pedra lisa da montanha — ela vai lembrar você de uma pergunta importante.')],
    }),
    npc('mateus', 'Mateus (Levi)', 'levi', [35, 3], {
      showFrom: 'doze', gives: 'pena', role: 'Apóstolo',
      uses: [{ item: 'moeda', lines: [say('mateus', 'Ainda guarda a moeda da coletoria? Agora conto outras riquezas.')] }],
      lines: [say('mateus', 'Eu também escrevia registros. Leve esta pena de escrever: quem registra palavras precisa de uma boa pena.')],
    }),
    npc('maria', 'Maria, mãe de Jesus', 'maria', [29, 24], {
      showFrom: 'familia', gives: 'novelo', role: 'Mãe de Jesus',
      lines: [say('maria', 'Viemos de Nazaré procurá-lo. Leve este novelo de lã — em Nazaré todos conhecem o trabalho das nossas mãos.')],
    }),
    npc('peregrino', 'Peregrino cansado', 'viajante', [27, 8], { role: 'Viajante na trilha', lines: [say('peregrino', 'A subida é longa e o sol é forte...')] }),
  ],
  steps: [
    {
      id: 'sinagoga', title: 'Explorar a sinagoga', kind: 'reach', at: [41, 17], r: 1.8,
      hint: 'A sinagoga é o grande edifício de colunas ao norte da praça.',
      lines: [narr('E outra vez entrou na sinagoga, e estava ali um homem que tinha uma das mãos mirrada. E estavam observando-o, se curaria no sábado, para o acusarem.', 'Marcos 3:1-2')],
    },
    {
      id: 'mao', title: 'Acompanhar a cura da mão ressequida', kind: 'talk', npc: 'homemMao',
      hint: 'Fale com o homem da mão ressequida, ao lado de Jesus.',
      lines: [say('homemMao', 'Não posso trabalhar com esta mão... Será que hoje, no sábado, ele fará algo?')],
      scene: [
        S('jesus', 'Levanta-te e vem para o meio.', 'Marcos 3:3'),
        S('jesus', 'É lícito no sábado fazer bem, ou fazer mal? salvar a vida, ou matar? E eles calaram-se.', 'Marcos 3:4'),
        S('jesus', 'Estende a tua mão.', 'Marcos 3:5'),
        fx('sparkle'),
        N('E ele a estendeu, e foi-lhe restituída a sua mão, sã como a outra.', 'Marcos 3:5'),
        hide('jesus'),
      ],
    },
    {
      id: 'subida', title: 'Percorrer o caminho até a montanha', kind: 'reach', at: [34, 2], r: 1.6,
      hint: 'Vá até a trilha do deserto e suba ao cume rochoso, ao norte.',
      lines: [narr('E subiu ao monte, e chamou para si os que ele quis; e vieram a ele.', 'Marcos 3:13')],
    },
    {
      id: 'doze', title: 'Conhecer os doze apóstolos', kind: 'scene', at: [34, 2], r: 2.5,
      hint: 'No cume, Jesus reúne os que escolheu.',
      scene: [
        show('jesus', [34, 3]),
        show('pedro'),
        show('mateus'),
        N('E nomeou doze para que estivessem com ele e os mandasse a pregar, e para que tivessem o poder de curar as enfermidades e expulsar os demônios.', 'Marcos 3:14-15'),
        S('pedro', 'Ele nos chamou pelo nome. Agora somos doze!'),
      ],
    },
    {
      id: 'nomes', title: 'Desafio: registrar os nomes dos doze', kind: 'challenge', helpItem: 'tabuinha',
      hint: 'Selecione no pergaminho os nomes dos doze apóstolos (Marcos 3:16-19).',
      challenge: {
        type: 'select',
        prompt: 'Marque os 12 apóstolos citados em Marcos 3:16-19.',
        options: [
          { text: 'Simão, a quem pôs o nome de Pedro', ok: true },
          { text: 'Tiago, filho de Zebedeu', ok: true },
          { text: 'João, irmão de Tiago', ok: true },
          { text: 'André', ok: true },
          { text: 'Filipe', ok: true },
          { text: 'Bartolomeu', ok: true },
          { text: 'Mateus', ok: true },
          { text: 'Tomé', ok: true },
          { text: 'Tiago, filho de Alfeu', ok: true },
          { text: 'Tadeu', ok: true },
          { text: 'Simão, o Cananeu', ok: true },
          { text: 'Judas Iscariotes', ok: true },
          { text: 'Paulo', ok: false },
          { text: 'Barnabé', ok: false },
          { text: 'Lucas', ok: false },
          { text: 'Nicodemos', ok: false },
        ],
      },
    },
    {
      id: 'familia', title: 'Ouvir os ensinamentos de Jesus', kind: 'scene', at: [32, 24], r: 2.5,
      hint: 'Desça até as margens do mar, onde a multidão está assentada ao redor de Jesus.',
      scene: [
        show('jesus', [33, 23]),
        fx('crowd'),
        S('jesus', 'E, se um reino se dividir contra si mesmo, tal reino não pode subsistir.', 'Marcos 3:24'),
        N('E chegaram então seus irmãos e sua mãe; e, estando de fora, mandaram-no chamar.', 'Marcos 3:31'),
        S('jesus', 'Quem é minha mãe e meus irmãos?', 'Marcos 3:33'),
        S('jesus', 'Porquanto qualquer que fizer a vontade de Deus, esse é meu irmão, e minha irmã, e minha mãe.', 'Marcos 3:35'),
      ],
    },
  ],
  side: [
    {
      id: 'mel', title: 'Força para a subida', giver: 'peregrino', needs: 'mel', needsFrom: 'Marcos 1',
      hint: 'Um peregrino exausto descansa na trilha da montanha.',
      ask: [say('peregrino', 'Estou sem forças para continuar subindo. Se ao menos tivesse algo doce para comer...')],
      thanks: [say('peregrino', 'Mel silvestre! Como o que João Batista comia no deserto. Recobrei as forças! Leve este pão de viagem.')],
      reward: 'pao',
    },
  ],
  scrolls: [
    { id: 's1', at: [2, 22], ref: 'Marcos 3:4', text: 'É lícito no sábado fazer bem, ou fazer mal? salvar a vida, ou matar?' },
    { id: 's2', at: [22, 2], ref: 'Marcos 3:14', text: 'E nomeou doze para que estivessem com ele e os mandasse a pregar.' },
    { id: 's3', at: [12, 29], ref: 'Marcos 3:35', text: 'Porquanto qualquer que fizer a vontade de Deus, esse é meu irmão, e minha irmã, e minha mãe.' },
  ],
  message: {
    title: 'Fazer parte da família de Deus',
    summary:
      'Num sábado, Jesus curou o homem da mão ressequida, mostrando que fazer o bem está no coração da Lei. Depois subiu ao monte e escolheu doze homens para estarem com Ele e serem enviados. Diante da multidão, ensinou que sua verdadeira família é formada por quem faz a vontade de Deus.',
    verses: [
      { ref: 'Marcos 3:14', text: 'E nomeou doze para que estivessem com ele e os mandasse a pregar.' },
      { ref: 'Marcos 3:35', text: 'Qualquer que fizer a vontade de Deus, esse é meu irmão, e minha irmã, e minha mãe.' },
    ],
    reflection:
      'O primeiro propósito do chamado foi "para que estivessem com ele". Antes de qualquer tarefa, Jesus convida à amizade e à convivência. Os doze eram pessoas bem diferentes entre si — e mesmo assim foram chamados para caminhar juntos.',
  },
  quiz: [
    { q: 'O que Jesus perguntou na sinagoga antes de curar o homem?', options: ['"Quem pecou?"', '"É lícito no sábado fazer bem, ou fazer mal?"', '"Onde está o sacerdote?"', '"Você tem fé?"'], correct: 1, explain: 'Marcos 3:4: Jesus perguntou se era lícito no sábado fazer bem ou fazer mal, salvar a vida ou matar.' },
    { q: 'Para que Jesus nomeou os doze, segundo Marcos 3:14?', options: ['Para governarem Israel', 'Para estarem com Ele e serem enviados a pregar', 'Para cobrarem impostos', 'Para guardarem o templo'], correct: 1, explain: 'Marcos 3:14: "para que estivessem com ele e os mandasse a pregar".' },
    { q: 'Quem Jesus chamou de "minha mãe e meus irmãos"?', options: ['Apenas seus parentes', 'Os sacerdotes', 'Qualquer que fizer a vontade de Deus', 'Os moradores de Nazaré'], correct: 2, explain: 'Marcos 3:35: "qualquer que fizer a vontade de Deus, esse é meu irmão, e minha irmã, e minha mãe".' },
  ],
};
export default ch;
