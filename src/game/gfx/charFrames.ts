// Gera a folha completa do personagem a partir da skin 4 direções (32x48, 4x4):
// - 8 direções: as 4 diagonais são montadas com o tronco da vista de frente/costas
//   (virado 1–2px para o lado) e as pernas da vista lateral;
// - variantes de altura: normal, "subida" de 1px (balanço da passada) e 3 níveis
//   de agachamento (o tronco desce e as pernas dobram), para agachar suave.

export const FW = 32;
export const FH = 48;

/** linhas de cada direção na folha gerada */
export type Dir8 = 'down' | 'left' | 'right' | 'up' | 'downright' | 'downleft' | 'upright' | 'upleft';
export const ROW8: Record<Dir8, number> = {
  down: 0, left: 1, right: 2, up: 3, downright: 4, downleft: 5, upright: 6, upleft: 7,
};
export const DIRS8 = Object.keys(ROW8) as Dir8[];

/** variantes (blocos de 32 quadros) */
export const V_NORMAL = 0;
export const V_LIFT = 1;
export const V_CROUCH = [2, 3, 4]; // agachamento leve → completo
const CROUCH_PX = [2, 4, 6];
export const VARIANTS = 2 + CROUCH_PX.length;

export const frameIndex = (variant: number, dir: Dir8, col: number) => variant * 32 + ROW8[dir] * 4 + col;

// anatomia da skin (linhas dentro do quadro)
const HEAD_END = 26; // cabeça: até a linha 25
const LEG_START = 40; // pernas da vista lateral a partir daqui
const HIP = 36; // quadril (dobra ao agachar)
const FEET = 44; // pés (preservados ao agachar)

function cell(src: HTMLCanvasElement, row: number, col: number) {
  const c = document.createElement('canvas');
  c.width = FW; c.height = FH;
  const g = c.getContext('2d')!;
  g.drawImage(src, col * FW, row * FH, FW, FH, 0, 0, FW, FH);
  return c;
}

/** quadro diagonal: tronco de `body` (frente/costas) + pernas de `side` */
function diagonal(body: HTMLCanvasElement, side: HTMLCanvasElement, sign: number) {
  const c = document.createElement('canvas');
  c.width = FW; c.height = FH;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // pernas da vista lateral (passada na direção do movimento)
  g.drawImage(side, 0, LEG_START, FW, FH - LEG_START, 0, LEG_START, FW, FH - LEG_START);
  // tronco virado 1px e cabeça 2px para o lado (dá a sensação de 3/4)
  g.drawImage(body, 0, HEAD_END, FW, LEG_START - HEAD_END, sign, HEAD_END, FW, LEG_START - HEAD_END);
  g.drawImage(body, 0, 0, FW, HEAD_END, sign * 2, 0, FW, HEAD_END);
  return c;
}

/** desloca o quadro para cima `n` px (balanço da passada) */
function lifted(src: HTMLCanvasElement, n = 1) {
  const c = document.createElement('canvas');
  c.width = FW; c.height = FH;
  c.getContext('2d')!.drawImage(src, 0, n, FW, FH - n, 0, 0, FW, FH - n);
  return c;
}

/** agachado: o corpo desce `n` px e as pernas (quadril→pés) se dobram */
function crouched(src: HTMLCanvasElement, n: number) {
  const c = document.createElement('canvas');
  c.width = FW; c.height = FH;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // pés no lugar
  g.drawImage(src, 0, FEET, FW, FH - FEET, 0, FEET, FW, FH - FEET);
  // pernas comprimidas (amostragem por vizinho mais próximo: sem borrar)
  const legH = FEET - HIP;
  const newH = legH - n;
  for (let y = 0; y < newH; y++) {
    const sy = HIP + Math.floor(((y + 0.5) * legH) / newH);
    g.drawImage(src, 0, sy, FW, 1, 0, HIP + n + y, FW, 1);
  }
  // tronco e cabeça descem; levemente mais largos no agachamento completo
  const widen = n >= 6 ? 1 : 0;
  g.drawImage(src, 0, 0, FW, HIP, -widen, n, FW + widen * 2, HIP);
  return c;
}

/** Monta a folha (128 x 48*8*VARIANTS) a partir da skin recolorida 4x4. */
export function buildCharSheet(sheet: HTMLCanvasElement): HTMLCanvasElement {
  // 8 direções, variante normal
  const base: HTMLCanvasElement[] = []; // índice: row8*4 + col
  for (let r = 0; r < 4; r++) for (let col = 0; col < 4; col++) base[r * 4 + col] = cell(sheet, r, col);
  const diag: [Dir8, number, number, number][] = [
    ['downright', 0, 2, 1], ['downleft', 0, 1, -1], ['upright', 3, 2, 1], ['upleft', 3, 1, -1],
  ];
  for (const [d, bodyRow, sideRow, sign] of diag) {
    for (let col = 0; col < 4; col++) {
      base[ROW8[d] * 4 + col] = diagonal(base[bodyRow * 4 + col], base[sideRow * 4 + col], sign);
    }
  }
  const out = document.createElement('canvas');
  out.width = FW * 4;
  out.height = FH * 8 * VARIANTS;
  const g = out.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const put = (variant: number, i: number, c: HTMLCanvasElement) =>
    g.drawImage(c, (i % 4) * FW, variant * 8 * FH + Math.floor(i / 4) * FH);
  base.forEach((c, i) => {
    put(V_NORMAL, i, c);
    put(V_LIFT, i, lifted(c));
    CROUCH_PX.forEach((n, k) => put(V_CROUCH[k], i, crouched(c, n)));
  });
  return out;
}
