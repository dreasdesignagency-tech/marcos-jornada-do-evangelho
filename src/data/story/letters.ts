// Cartas e transmissões de Abigail. Texto oficial em docs/STORY.md.
export interface LetterDef {
  id: string;
  title: string;
  author: string;
  to: string;
  body: string[];
  signature: string[];
  /** linhas do sistema exibidas depois da leitura */
  after: string[];
}

export const LETTERS: Record<string, LetterDef> = {
  'abigail-1': {
    id: 'abigail-1',
    title: 'Fragmento de memória · Marcos 1',
    author: 'Abigail',
    to: 'Elias',
    body: [
      'Meu irmão,',
      'Se você está lendo isso, significa que finalmente encontrou o caminho.',
      'Eu sei que provavelmente disseram que estou morta. Sei que você cresceu sem entender por que precisei partir. Mas quero que saiba que nunca me esqueci de você.',
      'Existe algo muito maior acontecendo aqui.',
      'Durante minha jornada pelas Escrituras, descobri que o Sistema está tentando impedir que a última geração conheça a verdade.',
      'Existem pessoas esperando por nós. Pessoas que ainda precisam ouvir sobre Cristo.',
      'Deixei fragmentos ao longo da minha jornada. Siga meus passos. Aprenda tudo o que puder. Encontre aqueles que precisam de ajuda.',
      'Não tente pular etapas. Você precisará compreender cada uma delas para entender o que está por vir.',
      'Ainda estou viva. E espero que possamos nos encontrar novamente.',
      'Permaneça firme.',
    ],
    signature: ['Com amor,', 'Sua irmã, Abigail.'],
    after: [
      'ÚLTIMA LOCALIZAÇÃO REGISTRADA: CRIPTOGRAFADA.',
      'CAPÍTULO ATUAL DA USUÁRIA: INDISPONÍVEL.',
      'PROGRESSÃO DETECTADA: LIVROS POSTERIORES.',
      'STATUS DA CONEXÃO: DESCONHECIDO.',
      'Observação: mensagem gravada anteriormente. Não confirma a localização nem a condição atual da autora.',
    ],
  },
};
