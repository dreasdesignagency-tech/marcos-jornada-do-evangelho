import type { Look } from './types';

// Paletas para a personalização do jogador
export const SKIN = ['#f1c08a', '#e0a46e', '#c3834f', '#9a6238', '#6e4326'];
export const HAIR = ['#6b3a1e', '#3a2418', '#1e1512', '#8a5a2b', '#b07a3a', '#5a5a5a'];
export const TUNIC = ['#d9c3a0', '#e8e0cc', '#b89a72', '#a7b08a', '#c9a77c', '#9c8a7a'];
export const MANTLE = ['#4a5f86', '#7a2f2f', '#4f6b3a', '#7d5a2c', '#5d3f6e', '#2f5f63', '#8c6d2f'];

export const DEFAULT_LOOK: Look = {
  skin: SKIN[0],
  hair: HAIR[0],
  tunic: TUNIC[0],
  mantle: MANTLE[0],
};

/** Presets dos personagens do Evangelho (recolorações da skin base). */
export const LOOKS: Record<string, Look> = {
  jesus: { skin: '#d9a06a', hair: '#3b2416', tunic: '#efe8da', mantle: '#8e2f2b', beard: true, scale: 1.14 },
  joaoBatista: { skin: '#b97a47', hair: '#2a1a12', tunic: '#8a6436', mantle: '#5e4423', leather: '#3d2a18', beard: true, scale: 1.12 },
  pedro: { skin: '#c98b58', hair: '#4a3020', tunic: '#a88f6c', mantle: '#3f5a6a', beard: true, scale: 1.14 },
  andre: { skin: '#c98b58', hair: '#5a3a22', tunic: '#b9a27a', mantle: '#5a6e3e', beard: true, scale: 1.1 },
  tiago: { skin: '#d39a63', hair: '#2f1e14', tunic: '#c2a983', mantle: '#7a4a2a', beard: true, scale: 1.12 },
  joao: { skin: '#e0a46e', hair: '#5a341c', tunic: '#d8c7a5', mantle: '#4c6f8a', scale: 1.04 },
  levi: { skin: '#d9a06a', hair: '#2b1d14', tunic: '#b7a3c9', mantle: '#4b3a6b', beard: true, scale: 1.1 },
  judas: { skin: '#c98b58', hair: '#1f1612', tunic: '#a9926e', mantle: '#4a4a3a', beard: true, scale: 1.1 },
  fariseu: { skin: '#d9a06a', hair: '#5a5a5a', tunic: '#e6dfcf', mantle: '#3c4f7a', beard: true, scale: 1.12 },
  escriba: { skin: '#d9a06a', hair: '#3a2a20', tunic: '#cfc4a8', mantle: '#5a4a7a', beard: true, scale: 1.1 },
  sacerdote: { skin: '#d39a63', hair: '#6a6a6a', tunic: '#f2efe6', mantle: '#2f4c7a', leather: '#c9a64a', beard: true, scale: 1.14 },
  soldado: { skin: '#d9a06a', hair: '#2a1d14', tunic: '#a8322c', mantle: '#7a2420', leather: '#8a7a5a', scale: 1.14 },
  centuriao: { skin: '#d9a06a', hair: '#2a1d14', tunic: '#b03a30', mantle: '#5a1a16', leather: '#c9a64a', beard: true, scale: 1.16 },
  pilatos: { skin: '#e8b88a', hair: '#5a4a3a', tunic: '#f4f0e6', mantle: '#6a1f4a', leather: '#c9a64a', scale: 1.14 },
  pescador: { skin: '#b97a47', hair: '#3a2418', tunic: '#b8a07c', mantle: '#566b78', beard: true, scale: 1.1 },
  idoso: { skin: '#d39a63', hair: '#cfcfcf', tunic: '#bfae8e', mantle: '#6a5a44', beard: true, scale: 1.06 },
  idosa: { skin: '#d39a63', hair: '#c9c4b8', tunic: '#9c8a7a', mantle: '#5a4a5a', veil: '#d8d0c0', scale: 1.02 },
  mulher: { skin: '#e0a46e', hair: '#3a2418', tunic: '#c48a5a', mantle: '#7a3a4a', veil: '#b56a4a', scale: 1.04 },
  mulher2: { skin: '#c98b58', hair: '#2a1a12', tunic: '#8aa0a8', mantle: '#3a5a6a', veil: '#5a7a8a', scale: 1.04 },
  mulher3: { skin: '#e8b88a', hair: '#3a2418', tunic: '#e4d6b8', mantle: '#8a6a2a', veil: '#efe4cc', scale: 1.04 },
  maria: { skin: '#e0a46e', hair: '#2a1a12', tunic: '#d8cbb0', mantle: '#3a5a8a', veil: '#4a6a9a', scale: 1.06 },
  madalena: { skin: '#e0a46e', hair: '#5a2a14', tunic: '#d9c3a0', mantle: '#8a2f4a', veil: '#a85a6a', scale: 1.06 },
  crianca: { skin: '#f1c08a', hair: '#6b3a1e', tunic: '#d9c3a0', mantle: '#7a8a4a', scale: 0.86 },
  crianca2: { skin: '#c98b58', hair: '#1e1512', tunic: '#c8b090', mantle: '#8a4a3a', scale: 0.84 },
  menina: { skin: '#e0a46e', hair: '#3a2418', tunic: '#e8dcc0', mantle: '#b06a7a', veil: '#d89aa8', scale: 0.88 },
  rico: { skin: '#e8b88a', hair: '#2b1d14', tunic: '#e8d8a8', mantle: '#6a2a7a', leather: '#c9a64a', beard: true, scale: 1.1 },
  cego: { skin: '#c98b58', hair: '#4a3a2a', tunic: '#8a7a64', mantle: '#5a4a3a', beard: true, scale: 1.08 },
  enfermo: { skin: '#c9a080', hair: '#4a3a2a', tunic: '#a89c88', mantle: '#6a6458', beard: true, scale: 1.08 },
  mercador: { skin: '#d39a63', hair: '#2a1a12', tunic: '#c9a74a', mantle: '#2f6a5a', beard: true, scale: 1.12 },
  campones: { skin: '#b97a47', hair: '#3a2418', tunic: '#a88f6c', mantle: '#6a7a3a', beard: true, scale: 1.1 },
  jairo: { skin: '#d9a06a', hair: '#4a4a4a', tunic: '#e0d8c4', mantle: '#2f4f6a', beard: true, scale: 1.12 },
  simaoCirene: { skin: '#7a4a2a', hair: '#1a1210', tunic: '#b8a07c', mantle: '#4a6a3a', beard: true, scale: 1.14 },
  joseArimateia: { skin: '#d9a06a', hair: '#8a8a8a', tunic: '#f0ead8', mantle: '#3a3a5a', beard: true, scale: 1.12 },
  anjo: { skin: '#f1d0a8', hair: '#d8b870', tunic: '#ffffff', mantle: '#f2f2ff', leather: '#e8d8a0', scale: 1.08 },
  viajante: { skin: '#c3834f', hair: '#3a2418', tunic: '#9c8a6a', mantle: '#7a6a3a', beard: true, scale: 1.08 },
  homem: { skin: '#d39a63', hair: '#2f1e14', tunic: '#b09070', mantle: '#4a5a6a', beard: true, scale: 1.1 },
  homem2: { skin: '#b97a47', hair: '#1e1512', tunic: '#c4b494', mantle: '#7a5a3a', beard: true, scale: 1.1 },
  homem3: { skin: '#e0a46e', hair: '#6a4a2a', tunic: '#9aa08a', mantle: '#5a3a3a', scale: 1.08 },
  atormentado: { skin: '#b08a6a', hair: '#2a2420', tunic: '#7a7064', mantle: '#4a443a', beard: true, scale: 1.1 },
  sirofenicia: { skin: '#c98b58', hair: '#1e1512', tunic: '#7a3a6a', mantle: '#c9a64a', veil: '#9a4a8a', scale: 1.04 },
  viuva: { skin: '#d39a63', hair: '#9a9a9a', tunic: '#5a5450', mantle: '#3a3634', veil: '#4a4440', scale: 1.0 },
};

export function resolveLook(l: string | Look): Look {
  if (typeof l === 'string') return LOOKS[l] ?? LOOKS.homem;
  return l;
}
