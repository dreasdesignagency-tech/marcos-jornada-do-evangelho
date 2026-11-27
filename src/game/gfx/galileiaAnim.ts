// Cenário animado da Galileia: anima a imagem original (1536x1024) pixel a pixel.
// Água, cachoeira, fogueira, toldos, barcos, vegetação, pássaros e borboletas.
// Usado como fundo dos capítulos 1–5 e pela página cenario.html.

export const ANIM_W = 1536, ANIM_H = 1024;
const W = ANIM_W, H = ANIM_H, P = 3; // P = tamanho do "pixel" da arte

const R = (p: number) => p & 255, G = (p: number) => (p >>> 8) & 255, B = (p: number) => (p >>> 16) & 255;
const pack = (r: number, g: number, b: number) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const mix = (p: number, r2: number, g2: number, b2: number, k: number) =>
  pack((R(p) + (r2 - R(p)) * k) | 0, (G(p) + (g2 - G(p)) * k) | 0, (B(p) + (b2 - B(p)) * k) | 0);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const isWaterRGB = (r: number, g: number, b: number) => (b > r + 55 && b >= g - 25 && b > 110) || (b > 200 && g > 185 && b > r + 35);

// ---------- regiões do cenário (coordenadas da imagem) ----------
export const FIRE = { x: 466, y: 288 };
const FALL = { x0: 100, x1: 172, y0: 24, y1: 130, scroll0: 44 };
const TREES = [
  [31, 46, 50], [215, 50, 55], [369, 46, 60], [553, 60, 95], [268, 115, 45], [430, 138, 35], [323, 177, 60],
  [46, 253, 70], [438, 430, 58], [31, 470, 55], [154, 610, 82], [31, 727, 50], [515, 795, 70], [46, 965, 55],
  [192, 973, 35], [799, 323, 55], [538, 643, 25],
];
const BUSHES = [[1175, 73, 35], [1117, 138, 25], [1198, 204, 35], [1336, 192, 25], [1482, 192, 25], [906, 12, 25], [730, 61, 30], [1375, 589, 25]];
const PALMS = [[1075, 361, 55], [1175, 369, 50], [1444, 307, 58], [868, 399, 45], [614, 581, 48], [799, 596, 48], [845, 712, 48], [1313, 627, 55]];
const AWNINGS = [[1065, 470, 1173, 512], [924, 541, 1015, 584], [698, 603, 786, 652], [1347, 655, 1457, 698], [1431, 450, 1536, 490]];
const TARP = [398, 150, 531, 206];
const CLOTH = [849, 481, 885, 528];
const NET = [1229, 690, 1299, 742];
const REEDS = [[253, 272, 385, 354], [138, 304, 216, 386], [104, 164, 133, 196], [675, 928, 703, 986], [1470, 752, 1536, 802]];
const BOATS: { rect: number[]; seed: number[]; sail?: number[]; phase: number }[] = [
  { rect: [1046, 778, 1234, 924], seed: [1140, 890], sail: [1096, 786, 1182, 870], phase: 0 },
  { rect: [1270, 786, 1400, 890], seed: [1335, 842], phase: 1.9 },
];
const FLOWERS = [[108, 727], [154, 865], [184, 888], [399, 827], [353, 911], [307, 996], [100, 950], [560, 340]];
const PLAZA = [880, 520, 1360, 770];
const BIRD = [
  ['X.....X', '.X...X.', '..XXX..', '...X...'],
  ['.......', 'XXXXXXX', '..XXX..', '...X...'],
  ['.......', '.......', 'XXXXXXX', 'X..X..X'],
];

type Warp = { x0: number; y0: number; x1: number; y1: number; w: Float32Array; ux: Float32Array; uy: Float32Array; kind: string; amp: number; ph: number; f: number };
type Boat = { rect: number[]; sail?: number[]; phase: number; pix: Int32Array; col: Uint32Array; isSail: Uint8Array };
type Pt = { x: number; y: number; vx?: number; vy?: number; life: number; max: number; big?: boolean };

export class GalileiaAnim {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** segundos de animação, tempo do vento, contador de quadros */
  t = 0; tw = 0; frame = 0;
  /** 0 = calmaria, 1 = brisa, 2 = ventania */
  wind = 1;
  /** 0 = dia, 0.5 = entardecer, 1 = noite (só a página do cenário usa) */
  tod = 0;

  private base: Uint32Array;
  private out: ImageData;
  private dst: Uint32Array;
  private water = new Uint8Array(W * H);
  private shore = new Uint8Array(W * H);
  private fall: Int32Array;
  private boats: Boat[] = [];
  private warps: Warp[] = [];
  private fire: Pt[] = []; private ember: Pt[] = []; private smoke: Pt[] = []; private foam: Pt[] = [];
  private dust: { x: number; y: number; ph: number; s: number }[] = [];
  private birds: { x: number; y: number; vx: number; ph: number }[] = [];
  private butter: { ax: number; ay: number; ph: number; a: number; b: number; c: string }[] = [];
  private flies: { x: number; y: number; ph: number; s: number }[] = [];
  private birdTimer = 3;

  constructor(img: CanvasImageSource, canvas?: HTMLCanvasElement) {
    this.canvas = canvas ?? document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true })!;
    x.drawImage(img, 0, 0, W, H);
    this.base = new Uint32Array(x.getImageData(0, 0, W, H).data.buffer.slice(0));
    this.out = this.ctx.createImageData(W, H);
    this.dst = new Uint32Array(this.out.data.buffer);
    this.prepWater();
    this.prepBoats();
    this.prepShore();
    const fall: number[] = [];
    for (let y = FALL.scroll0; y < FALL.y1; y++) for (let xx = FALL.x0; xx < FALL.x1; xx++) {
      const p = this.base[y * W + xx];
      if (B(p) > 130 && G(p) > 130 && B(p) >= R(p) - 5) fall.push(y * W + xx);
    }
    this.fall = Int32Array.from(fall);
    this.prepWarps();
    this.initParticles();
  }

  // ---------- preparação ----------
  private prepWater() {
    const { base, water } = this;
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
      const inRiver = xx >= 40 && xx < 500 && y >= 20 && y < 500;
      const inSea = xx >= 560 && y >= 730;
      if (!inRiver && !inSea) continue;
      if (xx >= FALL.x0 - 2 && xx < FALL.x1 + 2 && y < FALL.y1 - 4) continue;
      const p = base[y * W + xx];
      if (isWaterRGB(R(p), G(p), B(p))) water[y * W + xx] = inSea ? 2 : 1;
    }
    // reflexos claros no meio da água também são água (fecha buracos pequenos)
    for (const [rx0, ry0, rx1, ry1, code] of [[40, 20, 500, 500, 1], [560, 730, W, H, 2]]) {
      const seen = new Uint8Array(W * H);
      for (let y = ry0; y < ry1; y++) for (let xx = rx0; xx < rx1; xx++) {
        const s0 = y * W + xx;
        if (water[s0] || seen[s0]) continue;
        const comp: number[] = [], stack = [s0];
        let edge = false;
        seen[s0] = 1;
        while (stack.length) {
          const i = stack.pop()!;
          comp.push(i);
          const px = i % W, py = (i / W) | 0;
          if (px <= rx0 || px >= rx1 - 1 || py <= ry0 || py >= ry1 - 1) { edge = true; continue; }
          for (const j of [i + 1, i - 1, i + W, i - W]) if (!water[j] && !seen[j]) { seen[j] = 1; stack.push(j); }
        }
        if (!edge && comp.length < 600) for (const i of comp) water[i] = code;
      }
    }
  }

  private prepBoats() {
    const { base, water } = this;
    for (const bd of BOATS) {
      const [x0, y0, x1, y1] = bd.rect;
      const seen = new Uint8Array(W * H);
      const stack = [bd.seed[1] * W + bd.seed[0]];
      const pix: number[] = [];
      while (stack.length) {
        const i = stack.pop()!;
        if (seen[i]) continue;
        seen[i] = 1;
        const px = i % W, py = (i / W) | 0;
        if (px < x0 || px >= x1 || py < y0 || py >= y1 || water[i]) continue;
        pix.push(i);
        stack.push(i + 1, i - 1, i + W, i - W);
      }
      const col = new Uint32Array(pix.length);
      pix.forEach((i, k) => (col[k] = base[i]));
      const isSail = new Uint8Array(pix.length);
      if (bd.sail) {
        const [sx0, sy0, sx1, sy1] = bd.sail;
        pix.forEach((i, k) => {
          const px = i % W, py = (i / W) | 0, p = base[i];
          if (px >= sx0 && px < sx1 && py >= sy0 && py < sy1 && R(p) > 150 && G(p) > 140) isSail[k] = 1;
        });
      }
      // preenche o lugar do barco espelhando a água ao lado
      const mark = new Uint8Array(W * H);
      pix.forEach((i) => (mark[i] = 1));
      for (const i of pix) {
        const px = i % W, py = (i / W) | 0;
        let l = px; while (l > x0 && mark[py * W + l]) l--;
        let r = px; while (r < x1 && mark[py * W + r]) r++;
        let sx = l - (px - l);
        if (sx < 0 || !water[py * W + sx]) sx = r + (r - px);
        if (sx >= W || !water[py * W + sx]) sx = px + 260;
        base[i] = base[py * W + clamp(sx, 0, W - 1)];
        water[i] = 2;
      }
      this.boats.push({ rect: bd.rect, sail: bd.sail, phase: bd.phase, pix: Int32Array.from(pix), col, isSail });
    }
  }

  private prepShore() {
    const { water, shore } = this;
    const MAXD = 14;
    for (let i = 0; i < W * H; i++) if (water[i]) shore[i] = MAXD;
    for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) {
      const i = y * W + xx;
      if (!water[i]) continue;
      const n = Math.min(shore[i - 1], shore[i - W], shore[i - W - 1], shore[i - W + 1]);
      if (n + 1 < shore[i]) shore[i] = n + 1;
    }
    for (let y = H - 2; y > 0; y--) for (let xx = W - 2; xx > 0; xx--) {
      const i = y * W + xx;
      if (!water[i]) continue;
      const n = Math.min(shore[i + 1], shore[i + W], shore[i + W + 1], shore[i + W - 1]);
      if (n + 1 < shore[i]) shore[i] = n + 1;
    }
    // as bordas da imagem não são margem
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
      const i = y * W + xx;
      if (water[i] === 2 && (y > H - 16 || xx > W - 16)) shore[i] = Math.max(shore[i], Math.min(MAXD, Math.min(H - y, W - xx) + 6));
    }
  }

  private addWarp(x0: number, y0: number, x1: number, y1: number, fn: (x: number, y: number) => number[], extra: { kind: string; amp: number; ph: number; f?: number }) {
    x0 = clamp(x0 | 0, 0, W); x1 = clamp(x1 | 0, 0, W); y0 = clamp(y0 | 0, 0, H); y1 = clamp(y1 | 0, 0, H);
    const n = (x1 - x0) * (y1 - y0);
    const w = new Float32Array(n), ux = new Float32Array(n), uy = new Float32Array(n);
    let k = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++, k++) {
      const r = fn(x, y);
      w[k] = r[0]; ux[k] = r[1] || 0; uy[k] = r[2] || 0;
    }
    this.warps.push({ x0, y0, x1, y1, w, ux, uy, f: 1, ...extra });
  }

  private prepWarps() {
    const tree = (cx: number, cy: number, r: number, amp: number, kind: string, i: number) => {
      const RR = r * 1.18;
      this.addWarp(cx - RR, cy - RR, cx + RR, cy + RR, (x, y) => {
        const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) / RR;
        if (d >= 1) return [0];
        let w = 1 - d * d;
        const anchor = clamp((cy + r * 0.65 - y) / (r * 1.2), 0, 1); // tronco fixo embaixo
        w *= kind === 'palm' ? clamp((cy + r * 0.45 - y) / (r * 0.5), 0, 1) : 0.35 + 0.65 * anchor;
        const flap = kind === 'palm' ? Math.sin(Math.PI * clamp(d * 1.15, 0, 1)) : 0;
        const dd = Math.hypot(dx, dy) || 1;
        return [w, (dx / dd) * flap, (dy / dd) * flap];
      }, { kind, amp, ph: i * 1.731 + cx * 0.013, f: 0.8 + ((i * 37) % 11) / 22 });
    };
    TREES.forEach(([x, y, r], i) => tree(x, y, r, 2.2, 'tree', i));
    BUSHES.forEach(([x, y, r], i) => tree(x, y, r, 1.4, 'tree', i + 40));
    PALMS.forEach(([x, y, r], i) => tree(x, y, r, 2.6, 'palm', i + 80));

    for (const [x0, y0, x1, fy] of AWNINGS) {
      const pad = 5;
      this.addWarp(x0, y0, x1, fy + pad, (_x, y) => [y <= fy ? Math.pow((y - y0) / (fy - y0), 1.6) : clamp(1 - (y - fy) / pad, 0, 1)], { kind: 'awning', amp: 2.2, ph: x0 * 0.01 });
    }
    this.addWarp(TARP[0], TARP[1], TARP[2], TARP[3], (x, y) => {
      const u = (x - TARP[0]) / (TARP[2] - TARP[0]), v = (y - TARP[1]) / (TARP[3] - TARP[1]);
      return [Math.sin(Math.PI * u) * Math.sin(Math.PI * clamp(v * 1.1, 0, 1))];
    }, { kind: 'tarp', amp: 2.6, ph: 0.4 });
    for (const [rect, amp, ph] of [[CLOTH, 3, 1.1], [NET, 1.6, 2.3]] as [number[], number, number][]) {
      this.addWarp(rect[0] - 4, rect[1], rect[2] + 4, rect[3] + 3, (_x, y) => {
        const k = clamp((y - rect[1]) / (rect[3] - rect[1]), 0, 1);
        const edge = clamp(1 - (y - rect[3]) / 3, 0, 1);
        return [Math.pow(k, 1.3) * edge];
      }, { kind: 'cloth', amp, ph });
    }
    for (const [x0, y0, x1, y1] of REEDS) {
      this.addWarp(x0, y0 - 4, x1, y1, (_x, y) => [Math.pow(clamp((y1 - y) / (y1 - y0), 0, 1), 1.3)], { kind: 'reed', amp: 2.4, ph: x0 * 0.02 });
    }
  }

  private initParticles() {
    for (let i = 0; i < 46; i++) this.dust.push({ x: rnd(PLAZA[0], PLAZA[2]), y: rnd(PLAZA[1], PLAZA[3]), ph: rnd(0, 6.28), s: rnd(0.5, 1.2) });
    const cols = ['#fffaf0', '#ffe066', '#ff9f43', '#9fd3ff', '#f7b2e6'];
    for (let i = 0; i < 9; i++) {
      const [x, y] = FLOWERS[i % FLOWERS.length];
      this.butter.push({ ax: x + rnd(-10, 10), ay: y + rnd(-10, 6), ph: rnd(0, 6.28), a: rnd(0.7, 1.3), b: rnd(1.1, 1.9), c: cols[i % cols.length] });
    }
    for (let i = 0; i < 30; i++) {
      const river = i < 18;
      this.flies.push({ x: river ? rnd(80, 480) : rnd(380, 640), y: river ? rnd(140, 480) : rnd(160, 340), ph: rnd(0, 6.28), s: rnd(0.6, 1.4) });
    }
  }

  // ---------- animação ----------
  /** avança o tempo e as partículas em dt segundos */
  step(dt: number) {
    this.t += dt;
    this.tw += dt * (0.55 + 0.6 * this.wind);
    this.frame++;
    const { t, wind } = this;
    for (let n = 0; n < 6; n++) this.fire.push({ x: FIRE.x + rnd(-9, 9) * (0.6 + Math.random() * 0.4), y: FIRE.y + rnd(-2, 2), vy: -rnd(26, 46), life: 0, max: rnd(0.35, 0.7) });
    if (Math.random() < dt * 4) this.ember.push({ x: FIRE.x + rnd(-6, 6), y: FIRE.y - 10, vy: -rnd(30, 55), vx: rnd(-6, 6), life: 0, max: rnd(0.9, 1.8) });
    if (Math.random() < dt * 5) this.smoke.push({ x: FIRE.x + rnd(-4, 4), y: FIRE.y - 24, vy: -rnd(18, 26), life: 0, max: rnd(1.8, 2.8) });
    for (let n = 0; n < 3; n++) this.foam.push({ x: rnd(FALL.x0 + 4, FALL.x1 - 2), y: FALL.y1 - rnd(2, 10), vx: rnd(-14, 14), vy: -rnd(6, 22), life: 0, max: rnd(0.35, 0.8), big: Math.random() < 0.2 });
    const upd = (arr: Pt[], f: (p: Pt) => void) => {
      for (let i = arr.length - 1; i >= 0; i--) { const p = arr[i]; p.life += dt; if (p.life > p.max) { arr.splice(i, 1); continue; } f(p); }
    };
    upd(this.fire, (p) => { p.y += p.vy! * dt; p.x += (wind * 8 + Math.sin(t * 9 + p.y * 0.3) * 6) * dt * (p.life / p.max); });
    upd(this.ember, (p) => { p.y += p.vy! * dt; p.x += (p.vx! + wind * 14) * dt + Math.sin(t * 7 + p.max * 10) * 0.4; });
    upd(this.smoke, (p) => { p.y += p.vy! * dt; p.x += (wind * 16 + Math.sin(t + p.max) * 3) * dt; });
    upd(this.foam, (p) => { p.x += p.vx! * dt; p.y += p.vy! * dt; p.vy! += 30 * dt; });
    for (const d of this.dust) {
      d.x += (3 + wind * 9) * d.s * dt; d.y += Math.sin(t * 0.8 + d.ph) * 4 * dt;
      if (d.x > PLAZA[2]) { d.x = PLAZA[0]; d.y = rnd(PLAZA[1], PLAZA[3]); }
    }
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.birdTimer = rnd(7, 14);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const y = rnd(60, 620), n = 2 + ((Math.random() * 4) | 0);
      for (let i = 0; i < n; i++) this.birds.push({ x: dir > 0 ? -40 - i * 26 : W + 40 + i * 26, y: y + (i % 2 ? 1 : -1) * i * 14, vx: dir * rnd(85, 105), ph: rnd(0, 6.28) });
    }
    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x += (b.vx + wind * 10 * Math.sign(b.vx)) * dt; b.y += Math.sin(t * 2 + b.ph) * 6 * dt;
      if (b.x < -120 || b.x > W + 120) this.birds.splice(i, 1);
    }
  }

  /** desenha o quadro atual no canvas */
  render() {
    const { t, tw } = this;
    const wind = this.wind * (0.8 + 0.2 * Math.sin(tw * 0.37) + 0.12 * Math.sin(tw * 1.13));
    this.dst.set(this.base);
    this.applyWater(t, wind);
    this.applyFall(t);
    this.applyWarps(tw, wind);
    this.applyBoats(t, wind);
    this.ctx.putImageData(this.out, 0, 0);
    const night = this.tod <= 0.5 ? 0 : (this.tod - 0.5) / 0.5;
    this.drawLowerFx(t, 1 - night * 0.9);
    this.drawGrade(t, this.tod);
    this.drawFire(t);
    this.drawFlies(t, night);
  }

  private applyWater(t: number, wind: number) {
    const { water, shore, base, dst } = this;
    const amp = 0.7 + 0.4 * wind;
    for (let y = 0; y < H; y++) {
      const sh = Math.round(Math.sin(y * 0.21 + t * 2.2) * amp + Math.sin(y * 0.05 - t * 0.9) * 0.6);
      const by = (y / P) | 0;
      const row = y * W;
      for (let x = 0; x < W; x++) {
        const i = row + x;
        const wv = water[i];
        if (!wv) continue;
        const j = i - sh;
        let p = water[j] ? base[j] : base[i];
        const bx = (x / P) | 0;
        // brilhos que deslizam na superfície
        const g = Math.sin(bx * 0.27 + t * 1.3 + Math.sin(by * 0.39) * 2) * Math.sin(by * 0.93 - t * 2.1 + bx * 0.06);
        if (g > 0.9) p = mix(p, 235, 252, 255, wv === 2 ? 0.55 : 0.4);
        else if (g < -0.93) p = mix(p, 10, 40, 90, 0.18);
        // espuma das ondas na margem
        const d = shore[i];
        if (d < 14) {
          const front = (wv === 2 ? 2.5 : 1.5) + (wv === 2 ? 4.5 : 2) * (0.5 + 0.5 * Math.sin(t * 1.6 - bx * 0.11 + by * 0.07));
          if (d <= front && d >= front - 2.2) p = mix(p, 245, 252, 255, 0.55);
          else if (d <= 2) p = mix(p, 220, 240, 245, 0.18);
        }
        dst[i] = p;
      }
    }
  }

  private applyFall(t: number) {
    const { fall, base, dst } = this;
    const h = FALL.y1 - FALL.scroll0;
    const off = Math.floor(t * 70) % h;
    for (let k = 0; k < fall.length; k++) {
      const i = fall[k];
      const x = i % W, y = (i / W) | 0;
      const sy = FALL.scroll0 + ((y - FALL.scroll0 - off + h * 4) % h);
      let p = base[sy * W + x];
      if (!(B(p) > 130 && G(p) > 130)) p = base[i];
      if (Math.sin((y - t * 90) * 0.35 + x * 0.6) > 0.85) p = mix(p, 255, 255, 255, 0.45);
      dst[i] = p;
    }
  }

  private applyWarps(t: number, wind: number) {
    const { base, dst } = this;
    for (const wp of this.warps) {
      const { x0, y0, x1, y1, w, ux, uy, kind, amp, ph } = wp;
      let sx = 0, sy = 0, fl = 0;
      if (kind === 'tree' || kind === 'palm') {
        const f = wp.f;
        sx = amp * wind * (Math.sin(t * f + ph) * 0.75 + Math.sin(t * f * 2.3 + ph * 1.7) * 0.35 + 0.25);
        sy = amp * 0.45 * wind * Math.sin(t * f * 1.3 + ph * 0.7);
        if (kind === 'palm') fl = 1.6 * wind * Math.sin(t * 1.9 + ph);
      }
      let k = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++, k++) {
          const wk = w[k];
          if (wk <= 0.02) continue;
          let dx: number, dy: number;
          if (kind === 'tree' || kind === 'palm') {
            dx = sx * wk + fl * ux[k]; dy = sy * wk + fl * uy[k];
          } else if (kind === 'awning') {
            dx = amp * 0.35 * wind * Math.sin(t * 1.3 + ph) * wk;
            dy = -amp * wk * (0.35 + 0.65 * wind) * Math.sin((x - x0) * 0.11 - t * (2.4 + wind) + ph);
          } else if (kind === 'tarp') {
            dy = -amp * wk * (0.3 + 0.7 * wind) * (0.6 + 0.4 * Math.sin((x - x0) * 0.05 - t * 2.1)) * Math.sin(t * 1.4 + ph);
            dx = 0.6 * wk * wind * Math.sin(t * 0.9);
          } else if (kind === 'cloth') {
            dx = amp * wk * (wind * (0.6 + 0.4 * Math.sin(t * 1.2 + ph)) + 0.5 * Math.sin((y - y0) * 0.25 - t * 4 + ph));
            dy = 0;
          } else {
            dx = amp * wk * (0.4 * wind + wind * Math.sin(t * 2.1 + (x - x0) * 0.07 + ph) * 0.8);
            dy = 0;
          }
          const ix = clamp(x - Math.round(dx), 0, W - 1), iy = clamp(y - Math.round(dy), 0, H - 1);
          dst[y * W + x] = base[iy * W + ix];
        }
      }
    }
  }

  private applyBoats(t: number, wind: number) {
    const { dst } = this;
    for (const b of this.boats) {
      const ph = t * 1.5 + b.phase;
      const bob = Math.round(Math.sin(ph) * (1 + 0.4 * wind));
      const roll = Math.sin(ph * 0.8 + 1) * (0.6 + 0.5 * wind);
      const cy = (b.rect[1] + b.rect[3]) / 2;
      const bulge = wind * (1.4 + 0.8 * Math.sin(t * 1.7 + b.phase));
      for (let pass = 0; pass < 2; pass++) {
        for (let k = 0; k < b.pix.length; k++) {
          if (b.isSail[k] !== pass) continue;
          const i = b.pix[k];
          const x = i % W, y = (i / W) | 0;
          let dx = Math.round((roll * (cy - y)) / 40);
          if (pass === 1 && b.sail) {
            const [sx0, sy0, sx1, sy1] = b.sail;
            const v = (y - sy0) / (sy1 - sy0), u = (x - sx0) / (sx1 - sx0);
            dx += Math.round(bulge * Math.sin(Math.PI * v) * (0.4 + 0.6 * u) + 0.6 * wind * Math.sin(t * 5 + y * 0.2) * v);
          }
          const nx = x + dx, ny = y + bob;
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          dst[ny * W + nx] = b.col[k];
        }
      }
    }
  }

  // ---------- camadas desenhadas por cima ----------
  private px(x: number, y: number, s: number, c: string) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(Math.round(x / P) * P, Math.round(y / P) * P, s, s);
  }

  private drawBird(x: number, y: number, f: number, c: string, s: number) {
    const ctx = this.ctx, spr = BIRD[f];
    ctx.fillStyle = c;
    const ox = Math.round(x / s) * s - 3 * s, oy = Math.round(y / s) * s;
    for (let r = 0; r < spr.length; r++) for (let q = 0; q < spr[r].length; q++) if (spr[r][q] === 'X') ctx.fillRect(ox + q * s, oy + r * s, s, s);
  }

  private drawLowerFx(t: number, day: number) {
    const ctx = this.ctx;
    for (const p of this.smoke) {
      const k = p.life / p.max;
      ctx.globalAlpha = 0.32 * (1 - k) * (k < 0.15 ? k / 0.15 : 1);
      this.px(p.x, p.y, P * (1 + Math.floor(k * 2.5)), '#b8b0a2');
    }
    for (const p of this.foam) {
      ctx.globalAlpha = 0.9 * (1 - p.life / p.max);
      this.px(p.x, p.y, p.big ? P * 2 : P, p.big ? '#e6f7ff' : '#ffffff');
    }
    ctx.fillStyle = '#fff1bf';
    for (const d of this.dust) {
      ctx.globalAlpha = (0.15 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.2 + d.ph))) * day;
      ctx.fillRect(Math.round(d.x), Math.round(d.y), 2, 2);
    }
    for (const b of this.butter) {
      ctx.globalAlpha = day;
      const x = b.ax + Math.sin(t * b.a + b.ph) * 22 + Math.sin(t * 2.7 + b.ph) * 4;
      const y = b.ay + Math.sin(t * b.b + b.ph * 2) * 10 - 6;
      const open = (this.frame + ((b.ph * 3) | 0)) % 4 < 2;
      ctx.fillStyle = b.c;
      const X = Math.round(x / 2) * 2, Y = Math.round(y / 2) * 2;
      if (open) { ctx.fillRect(X - 4, Y, 3, 3); ctx.fillRect(X + 2, Y, 3, 3); }
      else { ctx.fillRect(X - 2, Y, 2, 3); ctx.fillRect(X + 1, Y, 2, 3); }
      ctx.fillStyle = '#2b1d14'; ctx.fillRect(X - 1, Y, 2, 3);
    }
    for (const b of this.birds) {
      const f = Math.floor(this.frame / 2 + b.ph * 3) % 3;
      ctx.globalAlpha = 0.18;
      this.drawBird(b.x + 28, b.y + 70, f, '#1b120a', 3);
      ctx.globalAlpha = 1;
      this.drawBird(b.x, b.y, f, '#f6f2e6', 3);
      ctx.fillStyle = '#7c7468';
      ctx.fillRect(Math.round(b.x / 3) * 3, Math.round(b.y / 3) * 3 + 6, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  private drawGrade(t: number, tod: number) {
    const ctx = this.ctx;
    const sunset = tod <= 0.5 ? tod / 0.5 : 1 - (tod - 0.5) / 0.5;
    const night = tod <= 0.5 ? 0 : (tod - 0.5) / 0.5;
    if (tod > 0.005) {
      const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
      const day = [255, 255, 255], dusk = [255, 172, 112], nite = [64, 84, 150];
      const c = tod <= 0.5 ? day.map((v, i) => lerp(v, dusk[i], sunset)) : dusk.map((v, i) => lerp(v, nite[i], night));
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgb(${c.map((v) => v | 0).join(',')})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createLinearGradient(W, H, 0, 0);
      g.addColorStop(0, `rgba(255,120,50,${0.3 * sunset})`);
      g.addColorStop(1, 'rgba(255,120,50,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // brilho da fogueira
    ctx.globalCompositeOperation = 'lighter';
    const flick = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
    const rad = (70 + 50 * night) * flick;
    const fg = ctx.createRadialGradient(FIRE.x, FIRE.y - 8, 4, FIRE.x, FIRE.y - 8, rad);
    fg.addColorStop(0, `rgba(255,150,50,${(0.18 + 0.4 * night + 0.1 * sunset) * flick})`);
    fg.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(FIRE.x - rad, FIRE.y - 8 - rad, rad * 2, rad * 2);
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawFire(t: number) {
    const ctx = this.ctx;
    for (const p of this.ember) {
      const k = p.life / p.max;
      ctx.globalAlpha = (1 - k) * (0.6 + 0.4 * Math.sin(t * 30 + p.max * 50));
      ctx.fillStyle = k < 0.4 ? '#ffe08a' : '#ff8a2a';
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    for (const p of this.fire) {
      const k = p.life / p.max;
      ctx.globalAlpha = k > 0.85 ? 0.6 : 1;
      this.px(p.x, p.y, k < 0.6 ? P : 2, k < 0.2 ? '#fff4b8' : k < 0.45 ? '#ffd23f' : k < 0.72 ? '#ff8c1a' : '#d9431c');
    }
    ctx.globalAlpha = 1;
  }

  private drawFlies(t: number, night: number) {
    if (night < 0.15) return;
    const ctx = this.ctx;
    for (const f of this.flies) {
      const a = 0.5 + 0.5 * Math.sin(t * 2.5 * f.s + f.ph);
      if (a < 0.35) continue;
      const x = f.x + Math.sin(t * 0.6 * f.s + f.ph) * 26, y = f.y + Math.sin(t * 0.9 * f.s + f.ph * 2) * 14;
      ctx.globalAlpha = a * night * 0.35; ctx.fillStyle = '#d8ff7a';
      ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 6, 6);
      ctx.globalAlpha = a * night; ctx.fillStyle = '#f2ffb0';
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}
