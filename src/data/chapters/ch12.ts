import type { ChapterDef } from '../types';
import { narr, say, N, S, show, hide, fx, mv, npc, addUse } from './common';

// Marcos 12 — O maior mandamento (Templo de Jerusalém)
const ch: ChapterDef = {
  n: 12,
  title: 'O maior mandamento',
  ref: 'Marcos 12',
  setting: 'Templo de Jerusalém',
  intro:
    'Nos pátios do templo, Jesus ensina todos os dias. Sacerdotes, fariseus, herodianos e saduceus se aproximam com perguntas difíceis — algumas sinceras, outras feitas para tentar apanhá-lo em alguma palavra.',
  map: {
    kind: 'proc', w: 70, h: 56, base: 'stone', ambience: 'day', seed: 12,
    features: [
      { f: 'rect', tile: 'marble', x: 14, y: 4, w: 42, h: 30 },
      { f: 'rect', tile: 'wall', x: 0, y: 0, w: 70, h: 2 },
      { f: 'rect', tile: 'wall', x: 0, y: 0, w: 2, h: 56 },
      { f: 'rect', tile: 'wall', x: 68, y: 0, w: 2, h: 56 },
      { f: 'obj', o: 'temple', x: 35, y: 16, w: 14, h: 10 },
      { f: 'obj', o: 'stairs', x: 35, y: 18 },
      { f: 'obj', o: 'altar', x: 50, y: 22 },
      { f: 'obj', o: 'altar', x: 54, y: 22 },
      { f: 'obj', o: 'pillar', x: 16, y: 10 }, { f: 'obj', o: 'pillar', x: 16, y: 18 }, { f: 'obj', o: 'pillar', x: 16, y: 26 },
      { f: 'obj', o: 'pillar', x: 54, y: 10 }, { f: 'obj', o: 'pillar', x: 54, y: 30 },
      { f: 'obj', o: 'pillar', x: 22, y: 34 }, { f: 'obj', o: 'pillar', x: 30, y: 34 }, { f: 'obj', o: 'pillar', x: 40, y: 34 }, { f: 'obj', o: 'pillar', x: 48, y: 34 },
      { f: 'obj', o: 'pillar', x: 6, y: 8 }, { f: 'obj', o: 'pillar', x: 6, y: 20 }, { f: 'obj', o: 'pillar', x: 6, y: 32 }, { f: 'obj', o: 'pillar', x: 6, y: 44 },
      { f: 'obj', o: 'pillar', x: 63, y: 8 }, { f: 'obj', o: 'pillar', x: 63, y: 20 }, { f: 'obj', o: 'pillar', x: 63, y: 32 }, { f: 'obj', o: 'pillar', x: 63, y: 44 },
      { f: 'obj', o: 'bench', x: 24, y: 44 }, { f: 'obj', o: 'bench', x: 46, y: 44 },
      { f: 'scatter', o: 'palm', x: 3, y: 36, w: 64, h: 18, n: 8 },
      { f: 'scatter', o: 'jar', x: 3, y: 36, w: 64, h: 18, n: 8 },
      { f: 'scatter', o: 'crate', x: 3, y: 3, w: 10, h: 50, n: 5 },
    ],
  },
  cell: 16,
  spawn: [35, 52],
  music: 'temple',
  messageAt: [35, 26],
  zones: [
    { id: 'gentios', name: 'Pátio dos Gentios', at: [35, 44], r: 7 },
    { id: 'colunata', name: 'Colunata', at: [10, 26], r: 5 },
    { id: 'tesouro', name: 'Gazofilácio (arca das ofertas)', at: [52, 24], r: 4 },
    { id: 'santuario', name: 'Escadaria do santuário', at: [35, 22], r: 4 },
  ],
  npcs: [
    npc('jesus', 'Jesus', 'jesus', [30, 38], { role: 'O Mestre no templo' }),
    npc('herodiano', 'Herodiano', 'homem', [42, 40], {
      gives: 'selo', role: 'Partidário de Herodes',
      uses: [{ item: 'moeda', lines: [narr('Você mostra a moeda de tributo de Levi. Nela há a imagem e a inscrição de César.'), say('jesus', 'Dai, pois, a César o que é de César e a Deus o que é de Deus.', 'Marcos 12:17')] }],
      lines: [say('herodiano', 'Ninguém o apanha numa palavra! Tome este selo de cera; documentos com selo ainda serão importantes em Jerusalém.')],
    }),
    npc('saduceu', 'Saduceu', 'sacerdote', [20, 30], {
      gives: 'perfume_frasco', role: 'Não cria na ressurreição',
      lines: [
        say('saduceu', 'Nós, saduceus, dizemos que não há ressurreição. Jesus respondeu: "Ele não é Deus de mortos, mas sim Deus de vivos" (Mc 12:27). Teste: o que Ele disse que nos fazia errar?'),
        { who: 'saduceu', text: 'Segundo Marcos 12:24, vocês erram porque...', choices: [
          { text: 'Não sabem as Escrituras nem o poder de Deus', ok: true, reply: 'Correto (Mc 12:24). Leve este frasco de perfume — ele terá lugar numa manhã de ressurreição.' },
          { text: 'Não vão ao templo', ok: false, reply: 'Não foi isso. Releia Marcos 12:24.' },
          { text: 'Não pagam impostos', ok: false, reply: 'Não. Tente de novo.' },
        ] },
      ],
    }),
    npc('fariseu', 'Fariseu', 'fariseu', [50, 30], {
      gives: 'chave', role: 'Mestre fariseu',
      uses: [{ item: 'filacterio', lines: [say('fariseu', 'Um filactério! Dentro dele está o "Ouve, Israel". Hoje Ele disse que esse é o primeiro mandamento.')] }],
      lines: [
        say('fariseu', 'Ele perguntou: "Como dizem os escribas que o Cristo é filho de Davi?". Quem o chamou de Senhor, segundo Marcos 12:36?'),
        { who: 'fariseu', text: 'Responda:', choices: [
          { text: 'O próprio Davi, pelo Espírito Santo', ok: true, reply: 'Isso (Mc 12:36-37). Leve esta chave de bronze; uma casa em Jerusalém tem um salão mobiliado.' },
          { text: 'Moisés', ok: false, reply: 'Não. Releia Marcos 12:36.' },
          { text: 'César', ok: false, reply: 'Não. Tente de novo.' },
        ] },
      ],
    }),
    npc('doutor', 'Doutor da Lei', 'escriba', [12, 40], {
      gives: 'tinteiro', role: 'Estudioso da Lei',
      uses: [{ item: 'prumo', lines: [say('doutor', 'Um prumo de construtor... "A pedra que os edificadores rejeitaram, esta foi posta por cabeça de esquina" (Mc 12:10).')] }],
      lines: [
        say('doutor', 'Na parábola dos lavradores maus, a quem o dono da vinha enviou por último?'),
        { who: 'doutor', text: 'Segundo Marcos 12:6:', choices: [
          { text: 'Um exército', ok: false, reply: 'Não. Releia Marcos 12:6.' },
          { text: 'O seu filho amado', ok: true, reply: 'Correto. "Tendo ele, pois, ainda um, o seu filho amado, enviou-o também a estes por derradeiro" (Mc 12:6). Leve este tinteiro.' },
          { text: 'Ninguém', ok: false, reply: 'Não. Tente de novo.' },
        ] },
      ],
    }),
    npc('escriba', 'Escriba sincero', 'escriba', [24, 24], {
      gives: 'tefilin', role: 'Não estava longe do Reino',
      uses: [{ item: 'pergaminho_lei', lines: [say('escriba', 'A cópia da Lei! Veja: "Ouve, Israel"... Está tudo aqui.')] }],
      lines: [say('escriba', 'Amar a Deus e ao próximo é mais do que todos os holocaustos e sacrifícios. Guarde este cordão de oração.')],
    }),
    npc('levita', 'Jovem levita', 'joao', [58, 40], { role: 'Servidor do templo', lines: [say('levita', 'Hoje o templo está agitado...')] }),
    npc('viuva', 'Viúva pobre', 'viuva', [48, 26], {
      showFrom: 'viuva', role: 'Deu tudo o que tinha',
      uses: [
        { item: 'leptos', lines: [say('viuva', 'Duas pequenas moedas... como as minhas. Deus vê o coração de quem dá.')] },
        { item: 'farinha', lines: [say('viuva', 'Farinha? Para mim? Que Deus te abençoe, meu filho.')] },
        { item: 'anel', lines: [narr('Você se lembra do anel do homem rico. A viúva deu menos do que ele tinha — mas deu tudo.')] },
      ],
      lines: [say('viuva', 'Dei o que tinha para o meu sustento. Deus cuida de mim.')],
    }),
  ],
  steps: [
    {
      id: 'patios', title: 'Explorar os pátios do templo', kind: 'reach', at: [35, 40], r: 3,
      hint: 'Suba pelo Pátio dos Gentios em direção ao santuário.',
      lines: [narr('E tornaram a Jerusalém. E, andando ele pelo templo, chegaram-se a ele os principais dos sacerdotes, e os escribas, e os anciãos.', 'Marcos 11:27')],
    },
    {
      id: 'lavradores', title: 'Ouvir a parábola dos lavradores', kind: 'talk', npc: 'jesus',
      hint: 'Jesus ensina perto da colunata do pátio.',
      lines: [
        say('jesus', 'Um homem plantou uma vinha, e cercou-a de um valado, e fundou nela um lagar, e edificou uma torre, e arrendou-a a uns lavradores, e partiu para fora da terra.', 'Marcos 12:1'),
        narr('Na parábola, os lavradores maltrataram os servos enviados pelo dono e, por fim, rejeitaram até o filho amado.', 'Resumo de Marcos 12:2-8'),
        say('jesus', 'Ainda não lestes esta Escritura: A pedra que os edificadores rejeitaram, esta foi posta por cabeça de esquina?', 'Marcos 12:10'),
      ],
    },
    {
      id: 'tributo', title: 'Acompanhar o diálogo sobre os tributos', kind: 'talk', npc: 'herodiano',
      hint: 'Um grupo de fariseus e herodianos prepara uma pergunta difícil.',
      lines: [
        say('herodiano', 'É lícito pagar o tributo a César, ou não? Daremos, ou não daremos?', 'Marcos 12:14-15'),
        say('jesus', 'Trazei-me uma moeda, para que a veja.', 'Marcos 12:15'),
        say('jesus', 'De quem é esta imagem e inscrição? E eles lhe disseram: De César.', 'Marcos 12:16'),
        say('jesus', 'Dai, pois, a César o que é de César e a Deus o que é de Deus.', 'Marcos 12:17'),
      ],
      scene: [show('jesus', [40, 38])],
    },
    {
      id: 'desafios', title: 'Desafio: as perguntas dos doutores', kind: 'challenge',
      hint: 'Converse com o saduceu, o fariseu e o doutor da Lei e responda a cada pergunta.',
      challenge: { type: 'trial', npcs: ['saduceu', 'fariseu', 'doutor'] },
    },
    {
      id: 'mandamento', title: 'Descobrir o maior mandamento', kind: 'talk', npc: 'escriba',
      hint: 'Um escriba sincero se aproxima com uma pergunta.',
      lines: [
        say('escriba', 'Qual é o primeiro de todos os mandamentos?', 'Marcos 12:28'),
        say('jesus', 'O primeiro de todos os mandamentos é: Ouve, Israel, o Senhor, nosso Deus, é o único Senhor.', 'Marcos 12:29'),
        say('jesus', 'Amarás, pois, ao Senhor, teu Deus, de todo o teu coração, e de toda a tua alma, e de todo o teu entendimento, e de todas as tuas forças; este é o primeiro mandamento.', 'Marcos 12:30'),
        say('jesus', 'E o segundo, semelhante a este, é: Amarás o teu próximo como a ti mesmo. Não há outro mandamento maior do que estes.', 'Marcos 12:31'),
        say('jesus', 'Não estás longe do Reino de Deus.', 'Marcos 12:34'),
      ],
      scene: [show('jesus', [26, 25])],
    },
    {
      id: 'viuva', title: 'Observar a oferta da viúva', kind: 'scene', at: [50, 26], r: 3,
      hint: 'Vá até a arca das ofertas, à direita do santuário.',
      scene: [
        show('jesus', [46, 28]),
        show('viuva', [48, 25]),
        N('E, estando Jesus assentado defronte da arca do tesouro, observava a maneira como a multidão lançava o dinheiro na arca do tesouro; e muitos ricos deitavam muito.', 'Marcos 12:41'),
        N('Vindo, porém, uma pobre viúva, deitou duas pequenas moedas, que valiam meio centavo.', 'Marcos 12:42'),
        S('jesus', 'Em verdade vos digo que esta pobre viúva deitou mais do que todos os que deitaram na arca do tesouro.', 'Marcos 12:43'),
        S('jesus', 'Porque todos ali deitaram do que lhes sobejava, mas esta, da sua pobreza, deitou tudo o que tinha, todo o seu sustento.', 'Marcos 12:44'),
      ],
    },
  ],
  side: [
    {
      id: 'incenso', title: 'O incenso do levita', giver: 'levita', needs: 'incenso', needsFrom: 'Marcos 11',
      hint: 'Um jovem levita perdeu o incenso para a oração da tarde.',
      ask: [say('levita', 'Na confusão das mesas viradas, perdi o incenso da oração da tarde. Você teria um pouco?')],
      thanks: [say('levita', 'Incenso! A oração subirá na hora certa. Leve este frasco de óleo de unção; em Betânia, alguém vai ungir o Mestre.')],
      reward: 'oleo_uncao',
    },
  ],
  scrolls: [
    { id: 's1', at: [4, 50], ref: 'Marcos 12:17', text: 'Dai, pois, a César o que é de César e a Deus o que é de Deus.' },
    { id: 's2', at: [64, 50], ref: 'Marcos 12:30-31', text: 'Amarás, pois, ao Senhor, teu Deus, de todo o teu coração... E o segundo, semelhante a este, é: Amarás o teu próximo como a ti mesmo.' },
    { id: 's3', at: [60, 4], ref: 'Marcos 12:43', text: 'Esta pobre viúva deitou mais do que todos os que deitaram na arca do tesouro.' },
  ],
  message: {
    title: 'Amar a Deus, amar ao próximo e entregar-se com sinceridade',
    summary:
      'No templo, Jesus contou a parábola dos lavradores e respondeu a perguntas difíceis sobre tributos, ressurreição e as Escrituras. A um escriba sincero, resumiu toda a Lei em dois mandamentos: amar a Deus de todo o coração e amar o próximo como a si mesmo. Depois, mostrou que a pequena oferta da viúva valeu mais do que todas, pois ela deu tudo.',
    verses: [
      { ref: 'Marcos 12:30', text: 'Amarás, pois, ao Senhor, teu Deus, de todo o teu coração, e de toda a tua alma, e de todo o teu entendimento, e de todas as tuas forças.' },
      { ref: 'Marcos 12:31', text: 'Amarás o teu próximo como a ti mesmo.' },
    ],
    reflection:
      'Deus não mede a oferta pelo tamanho, mas pelo coração. E toda a fé se resume em amor: para cima, a Deus; para os lados, ao próximo. Que gesto simples de amor você pode oferecer hoje, de coração inteiro?',
  },
  quiz: [
    { q: 'Qual é o primeiro mandamento segundo Jesus?', options: ['Guardar o sábado', 'Amar a Deus de todo o coração, alma, entendimento e forças', 'Pagar o tributo', 'Oferecer sacrifícios'], correct: 1, explain: 'Marcos 12:29-30.' },
    { q: 'O que Jesus respondeu sobre o tributo a César?', options: ['"Não pagueis nada"', '"Dai a César o que é de César e a Deus o que é de Deus"', '"Pagai em dobro"', '"Perguntai aos sacerdotes"'], correct: 1, explain: 'Marcos 12:17.' },
    { q: 'Por que a oferta da viúva valeu mais?', options: ['Porque eram moedas de ouro', 'Porque ela deu tudo o que tinha', 'Porque ela era sacerdotisa', 'Porque foi a primeira a ofertar'], correct: 1, explain: 'Marcos 12:44: "da sua pobreza, deitou tudo o que tinha, todo o seu sustento".' },
  ],
};
addUse(ch, 'levita', 'balanca', [say('levita', 'A balança do cambista... Deus pesa os corações, não as moedas.')]);
export default ch;
