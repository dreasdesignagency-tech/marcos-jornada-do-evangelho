import type { ChapterDef } from '../types';
import { narr, say, N, S, npc } from '../chapters/common';

// Arena Clandestina A-17 — instalação subterrânea conectada à rede REFÚGIO.
const ch: ChapterDef = {
  n: 104,
  story: {
    world: 'real',
    label: 'Prólogo · Arena A-17',
    end: { kind: 'neural' },
    rain: false,
    props: [
      { at: [5, 13], label: 'Olhar o painel de conexões', lines: [
        { who: 'sistema', text: 'REDE REFÚGIO · nós ativos: 2.418 · regiões: 61 · latência: instável.' },
        narr('Pontinhos de luz espalhados por um mapa-múndi rachado. Cada um é uma pessoa escondida, conectada agora.'),
      ] },
      { at: [33, 9], label: 'Examinar a parede da manutenção', lines: [
        narr('Atrás de um servidor, gravado no metal: um peixe, uma cruz e uma frase: "Até aos confins da terra."'),
      ] },
      { at: [36, 4], label: 'Saída de emergência', lines: [narr('Uma escotilha com tranca dupla. Placa: "Somente se as luzes ficarem vermelhas."')] },
    ],
  },
  title: 'Arena Clandestina A-17',
  ref: 'Subsolo do Setor Refúgio',
  setting: 'Arena Clandestina A-17',
  intro: 'Uma estrutura subterrânea abandonada, remendada com cabos e telas recuperadas. Aqui, pessoas sem rosto e sem nome se conectam a um lugar onde a Palavra ainda pode ser lida.',
  map: {
    kind: 'proc', w: 40, h: 30, base: 'cwall', ambience: 'neon', seed: 104,
    features: [
      { f: 'rect', tile: 'grate', x: 18, y: 23, w: 5, h: 6 },
      { f: 'rect', tile: 'metal', x: 13, y: 17, w: 14, h: 6 },
      { f: 'rect', tile: 'metal', x: 3, y: 10, w: 9, h: 13 },
      { f: 'rect', tile: 'metal', x: 12, y: 18, w: 1, h: 3 },
      { f: 'rect', tile: 'grate', x: 13, y: 4, w: 15, h: 13 },
      { f: 'rect', tile: 'metal', x: 28, y: 9, w: 2, h: 3 },
      { f: 'rect', tile: 'concrete', x: 30, y: 6, w: 8, h: 10 },
      { f: 'rect', tile: 'concrete', x: 34, y: 2, w: 4, h: 4 },
      { f: 'obj', o: 'barrier', x: 18, y: 23 },
      { f: 'obj', o: 'locker', x: 22, y: 25 },
      { f: 'obj', o: 'console', x: 15, y: 19 },
      { f: 'obj', o: 'neon', x: 20, y: 17, v: 1 },
      { f: 'obj', o: 'bench', x: 6, y: 16 },
      { f: 'obj', o: 'bench', x: 6, y: 20 },
      { f: 'obj', o: 'screen', x: 6, y: 12 },
      { f: 'obj', o: 'cables', x: 8, y: 22 },
      { f: 'obj', o: 'capsule', x: 15, y: 8 },
      { f: 'obj', o: 'capsule', x: 19, y: 8 },
      { f: 'obj', o: 'capsule', x: 23, y: 8 },
      { f: 'obj', o: 'capsule', x: 26, y: 8 },
      { f: 'obj', o: 'server', x: 14, y: 14 },
      { f: 'obj', o: 'server', x: 26, y: 14 },
      { f: 'obj', o: 'console', x: 20, y: 12 },
      { f: 'obj', o: 'cables', x: 17, y: 10 },
      { f: 'obj', o: 'cables', x: 22, y: 11 },
      { f: 'obj', o: 'generator', x: 33, y: 14 },
      { f: 'obj', o: 'server', x: 31, y: 8 },
      { f: 'obj', o: 'server', x: 33, y: 8 },
      { f: 'obj', o: 'server', x: 35, y: 8 },
      { f: 'obj', o: 'locker', x: 37, y: 12 },
      { f: 'obj', o: 'scrap', x: 31, y: 15 },
      { f: 'obj', o: 'hatch', x: 36, y: 3 },
    ],
  },
  cell: 16,
  spawn: [20, 27],
  music: 'arena',
  zones: [
    { id: 'recepcao', name: 'Recepção', at: [20, 20], r: 4 },
    { id: 'espera', name: 'Área de espera', at: [7, 16], r: 4 },
    { id: 'salao', name: 'Salão das cápsulas', at: [20, 10], r: 5 },
    { id: 'manutencao', name: 'Sala de manutenção', at: [33, 11], r: 3 },
  ],
  npcs: [
    npc('porteiro', 'Porteiro', 'agente', [20, 24], { face: 'down', role: 'Segurança clandestina', lines: [say('porteiro', 'Sem nomes aqui dentro. Sem rostos lá fora.')] }),
    npc('rute', 'Rute', 'operadora', [17, 20], {
      role: 'Operadora da resistência',
      lines: [say('rute', 'Bem-vindo à A-17. Se as luzes ficarem vermelhas, não corra: siga a faixa verde no chão.')],
    }),
    npc('noe', 'Noé', 'noe', [20, 14], { face: 'down', role: 'Engenheiro, ex-Sistema, operador da arena' }),
    npc('espera1', 'Usuária encapuzada', 'refugiada', [9, 18], {
      role: 'Aguarda conexão',
      lines: [say('espera1', 'Lá dentro eu tenho nome de novo. Aqui fora eu sou só um número que o Sistema ainda não achou.')],
    }),
    npc('espera2', 'Rapaz de óculos remendados', 'refugiado', [4, 14], {
      role: 'Aguarda conexão',
      lines: [say('espera2', 'Nunca tive uma Bíblia na mão. Na simulação, eu ouvi o Sermão do Monte com o vento batendo no rosto. Você vai entender.')],
    }),
    npc('tecnico', 'Técnico', 'mecanico', [32, 11], {
      role: 'Mantém os servidores vivos',
      lines: [say('tecnico', 'Cada servidor aqui foi roubado de um prédio do governo. Ironia, né? As máquinas deles carregando a Palavra.')],
    }),
  ],
  steps: [
    {
      id: 'noe', title: 'Conversar com Noé', hint: 'O homem de cabelo grisalho no salão das cápsulas.', kind: 'talk', npc: 'noe',
      lines: [
        say('noe', 'Você sabe o que acontece com quem é encontrado usando essa tecnologia?'),
        say('marcos', 'Já não existe muita coisa lá fora que valha a pena.'),
        say('noe', 'Talvez você encontre aqui algo que faça valer a pena voltar.'),
        say('noe', 'Meu nome é Noé. Eu construía sistemas de vigilância para o governo. Hoje eu construo uma arca de outro tipo.'),
        say('noe', 'A máquina se chama REFÚGIO. Ela recria os acontecimentos das Escrituras numa realidade virtual compartilhada. Tão real que você vai sentir a areia nos pés.'),
        say('noe', 'E você não estará sozinho: pessoas do mundo inteiro estão conectadas agora, escondidas como você.'),
        say('marcos', 'Pingente com pomba… o senhor já viu um desses?'),
        narr('Noé olha para o pingente por um segundo longo demais.'),
        say('noe', 'Vamos primeiro te conectar. Algumas respostas só fazem sentido no tempo certo.'),
      ],
    },
    {
      id: 'maquina', title: 'Conhecer a máquina', hint: 'Veja o console central diante das cápsulas.', kind: 'use', at: [20, 12], label: 'Examinar o console central',
      lines: [
        { who: 'sistema', text: 'REFÚGIO v7.3 · núcleo de reconstrução narrativa · arquivos das Escrituras: íntegros.' },
        say('noe', 'Os personagens bíblicos lá dentro são reconstruções da simulação, feitas a partir do texto. As outras pessoas que você encontrar são reais.'),
        say('noe', 'E uma regra: você pode explorar, ajudar, perguntar… mas não pode mudar o que está escrito. Ninguém pode.'),
      ],
    },
    {
      id: 'perfil', title: 'Configurar o perfil', hint: 'Registre-se no terminal de Rute, na recepção.', kind: 'use', at: [15, 19], label: 'Configurar o perfil',
      lines: [
        { who: 'sistema', text: 'NOVO PERFIL · identidade civil: OCULTA · rastreio: BLOQUEADO.' },
        { who: 'sistema', text: 'Nome de usuário na rede: {nome}. Avatar sincronizado com o corpo do usuário.' },
        say('rute', 'Pronto. Lá dentro, só quem você escolher vai saber quem você é.'),
      ],
    },
    {
      id: 'objeto', title: 'Registrar um objeto pessoal', hint: 'O scanner fica no console central.', kind: 'use', at: [20, 12], label: 'Registrar um objeto pessoal',
      lines: [
        say('noe', 'A rede precisa de um objeto pessoal para ancorar a sua mente. Algo que só você carregaria.'),
        narr('Elias coloca a fotografia de Abigail no scanner. Um feixe azul percorre a imagem.'),
        { who: 'sistema', text: 'OBJETO 01 REGISTRADO · fotografia · vínculo afetivo: ALTO.' },
      ],
    },
    {
      id: 'pingente', title: 'Registrar o pingente de Abigail', hint: 'Coloque o pingente no scanner.', kind: 'use', at: [20, 12], label: 'Registrar o pingente',
      lines: [
        narr('Elias hesita. Depois tira o pingente do pescoço pela primeira vez em doze anos.'),
        { who: 'sistema', text: 'OBJETO 02 REGISTRADO · pingente metálico · gravação: pomba.' },
        { who: 'sistema', text: '…IDENTIFICADOR SECUNDÁRIO ENCONTRADO NOS ARQUIVOS DA REDE…' },
        { who: 'sistema', text: 'ACESSO RESTRITO.' },
        say('marcos', 'O que foi isso?'),
        say('noe', 'Interferência. Acontece.'),
        narr('Mas Noé não tira os olhos da tela.'),
      ],
    },
    {
      id: 'capsula', title: 'Entrar na cápsula', hint: 'A cápsula do centro está pronta.', kind: 'use', at: [19, 9], label: 'Entrar na cápsula',
      lines: [
        say('noe', 'Deite e respire devagar. No começo parece que você está caindo. Depois… parece que você chegou em casa.'),
        say('marcos', 'E se eu não quiser voltar?'),
        say('noe', 'É por isso que você vai voltar. Lá dentro você vai aprender por que vale a pena.'),
      ],
    },
    {
      id: 'conexao', title: 'Iniciar a conexão neural', hint: 'Conectando…', kind: 'scene',
      scene: [
        S('noe', 'Iniciando conexão. Boa jornada, Elias.'),
        N('A tampa de vidro se fecha. O zumbido dos servidores aumenta. A chuva lá fora parece cada vez mais distante…'),
      ],
    },
  ],
  side: [],
  scrolls: [],
  message: { title: '', summary: '', verses: [], reflection: '' },
  quiz: [],
};

export default ch;
