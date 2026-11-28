// Personagem animado (jogador ou NPC) com sombra, rótulo e movimentação.
// Movimentos inspirados na animação de referência do João Marcos:
// caminhada com balanço em 8 direções, corrida inclinada com poeira e
// deslocamento de ar, agachar suave e pulo com antecipação e aterrissagem.
import Phaser from 'phaser';
import type { Dir, Look } from '../../data/types';
import { recolor } from '../gfx/recolor';
import { buildCharSheet, frameIndex, V_CROUCH, V_LIFT, V_NORMAL, VARIANTS, type Dir8 } from '../gfx/charFrames';

export const RUN_SPEED = 150; // px/s
export const WALK_SPEED = Math.round(RUN_SPEED * 0.45); // 45% da corrida (~68 px/s)
export const CROUCH_SPEED = 40; // andando agachado

const WALK_FPS = 9; // quadros/s na velocidade de caminhada
const SEQ_COLS = [1, 2, 3, 0]; // passo A, passagem, passo B, passagem
const BREATH_MS = 1900;
const CROUCH_RATE = 22; // níveis/s ao agachar/levantar (3 níveis ≈ 0,14 s)

// pulo
const JUMP_V = 215; // velocidade inicial para cima (px/s)
const GRAVITY = 920; // px/s²
const ANTICIPATION = 0.08; // s agachando antes de sair do chão
const LAND_TIME = 0.16; // s se recuperando ao tocar o chão

export function lookKey(look: Look) {
  const s = JSON.stringify(look);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'char_' + (h >>> 0).toString(36);
}

export function ensureCharTexture(scene: Phaser.Scene, look: Look) {
  const key = lookKey(look);
  if (!scene.textures.exists(key)) {
    const canvas = buildCharSheet(recolor(look));
    const tex = scene.textures.addCanvas(key, canvas)!;
    for (let i = 0; i < VARIANTS * 32; i++) tex.add(i, 0, (i % 4) * 32, Math.floor(i / 4) * 48, 32, 48);
  }
  return key;
}

/** Textura da nuvem de poeira (pixel art com volume: luz em cima, sombra embaixo). */
function ensurePuffTexture(scene: Phaser.Scene) {
  if (scene.textures.exists('dust_puff')) return;
  const S = 12;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d')!;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - S / 2, dy = y + 0.5 - S / 2;
      const d = Math.hypot(dx, dy * 1.08);
      if (d > S / 2 - 0.3) continue;
      // iluminação vinda de cima/esquerda
      const lit = -(dx * 0.55 + dy * 0.85) / (S / 2);
      let v = 222;
      if (lit > 0.35) v = 255;
      else if (lit > -0.15) v = 238;
      else if (lit < -0.6) v = 196;
      const a = d > S / 2 - 1.3 ? 200 : 255;
      g.fillStyle = `rgba(${v},${v},${v},${a / 255})`;
      g.fillRect(x, y, 1, 1);
    }
  }
  scene.textures.addCanvas('dust_puff', c);
}

/** Mistura uma cor com branco (0..1). */
function lighten(c: number, k: number) {
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  const m = (v: number) => Math.round(v + (255 - v) * k);
  return (m(r) << 16) | (m(g) << 8) | m(b);
}

type JumpPhase = 'ground' | 'crouch' | 'air' | 'land';

export class Actor {
  scene: Phaser.Scene;
  id: string;
  name: string;
  look: Look;
  key: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  shadow: Phaser.GameObjects.Ellipse;
  label?: Phaser.GameObjects.Text;
  emote?: Phaser.GameObjects.Text;
  /** direção cardeal (usada pela lógica do jogo) */
  facing: Dir = 'down';
  /** direção visual com diagonais */
  dir8: Dir8 = 'down';
  moving = false;
  home: { x: number; y: number };
  wander = 0;
  nextWander = 0;
  target: { x: number; y: number; speed: number; resolve?: () => void } | null = null;
  baseScale: number;
  hidden = false;
  isPlayer: boolean;
  breathPhase = Math.random() * Math.PI * 2;
  /** correndo / agachado (definidos pela cena) */
  running = false;
  crouching = false;
  /** cor do chão em (x, y) — a cena fornece; usada na poeira */
  groundColorAt?: (x: number, y: number) => number;

  // animação própria (permite trocar direção/postura sem perder o ritmo)
  private phase = 0; // posição contínua na sequência de passos
  private speedNow = 0;
  private crouchLevel = 0; // 0 em pé … 3 agachado
  private lastStep = -1;
  private trailT = 0;
  private windT = 0;
  private wasRunning = false;

  // pulo
  jumpPhase: JumpPhase = 'ground';
  z = 0; // altura acima do chão (px de mundo)
  private vz = 0;
  private phaseT = 0;
  private lean = 0;
  private lastTime = 0;

  constructor(scene: Phaser.Scene, id: string, name: string, look: Look, x: number, y: number, isPlayer = false) {
    this.scene = scene;
    this.isPlayer = isPlayer;
    this.id = id;
    this.name = name;
    this.look = look;
    this.key = ensureCharTexture(scene, look);
    ensurePuffTexture(scene);
    this.baseScale = look.scale ?? 1;
    this.home = { x, y };
    this.shadow = scene.add.ellipse(x, y, 20 * this.baseScale, 7 * this.baseScale, 0x1e140a, 0.3);
    this.sprite = scene.physics.add.sprite(x, y, this.key, 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.baseScale);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 8);
    body.setOffset(9, 39);
    if (!isPlayer) {
      body.setImmovable(true);
      body.pushable = false;
    }
    this.sprite.setData('actor', this);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get airborne() { return this.jumpPhase !== 'ground'; }
  get crouched() { return this.crouchLevel > 1.5; }

  // ---------------- efeitos ----------------

  private dustColor() {
    const c = this.groundColorAt ? this.groundColorAt(this.x, this.y) : 0xb8a27a;
    return lighten(c, 0.7); // bem clara: poeira quase branca, puxando a cor do chão
  }

  /** uma nuvem de poeira com volume */
  private puff(x: number, y: number, color: number, dx: number, dy: number, size: number, life: number, front = false) {
    const s = this.baseScale * size;
    const p = this.scene.add.image(x, y, 'dust_puff').setTint(color).setScale(0.45 * s).setAlpha(0.95);
    p.setOrigin(0.5, 0.75).setDepth(front ? this.y + 1 : this.y - 1);
    this.scene.tweens.add({
      targets: p, x: x + dx, y: y + dy, scale: (1.25 + Math.random() * 0.35) * s, duration: life, ease: 'Cubic.out',
    });
    this.scene.tweens.add({ targets: p, alpha: 0, duration: life, ease: 'Quad.in', onComplete: () => p.destroy() });
  }

  /** linhas de vento: deslocamento de ar atrás do corpo */
  private windLine(strength = 1) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const v = body.velocity.clone();
    if (v.length() < 1) return;
    v.normalize();
    const len = (8 + Math.random() * 10) * this.baseScale * strength;
    const h = (8 + Math.random() * 28) * this.baseScale;
    const sideOff = (Math.random() - 0.5) * 14 * this.baseScale;
    const x = this.x - v.x * 10 + -v.y * sideOff;
    const y = this.y - h - this.z + v.x * sideOff * 0.3;
    const line = this.scene.add.rectangle(x, y, len, 1, 0xffffff, 0.55).setDepth(this.y + 2);
    line.setRotation(Math.atan2(v.y, v.x));
    this.scene.tweens.add({
      targets: line, x: x - v.x * 22, y: y - v.y * 22, scaleX: 0.2, alpha: 0, duration: 260 + Math.random() * 120,
      ease: 'Quad.out', onComplete: () => line.destroy(),
    });
  }

  /** onda de ar no chão (sair do chão / aterrissar / arrancar) */
  private airRing(size: number, alpha = 0.6) {
    const r = this.scene.add.ellipse(this.x, this.y - 1, 26 * this.baseScale, 9 * this.baseScale)
      .setStrokeStyle(1.5, 0xffffff, alpha).setDepth(this.y - 1).setScale(0.35);
    this.scene.tweens.add({ targets: r, scale: size, alpha: 0, duration: 380, ease: 'Cubic.out', onComplete: () => r.destroy() });
  }

  /** poeira de um passo de corrida (pé de trás) */
  private stepDust() {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (this.hidden || body.velocity.length() < 40) return;
    const c = this.dustColor();
    const v = body.velocity.clone().normalize();
    const n = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const side = (Math.random() - 0.5) * 8;
      this.puff(
        this.x - v.x * (4 + i * 2) + -v.y * side,
        this.y - Math.random() * 2,
        c,
        -v.x * (10 + Math.random() * 12) + (Math.random() - 0.5) * 6,
        -4 - Math.random() * 6 - v.y * 6,
        0.7 + Math.random() * 0.6,
        420 + Math.random() * 260,
        i === 0 && v.y < 0,
      );
    }
  }

  /** nuvem em volta dos pés (pulo/aterrissagem) */
  private burstDust(n: number, spread: number, size = 1) {
    if (this.hidden) return;
    const c = this.dustColor();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const front = Math.sin(a) > 0.3;
      this.puff(
        this.x + Math.cos(a) * 5, this.y - 1 + Math.sin(a) * 2, c,
        Math.cos(a) * spread * (0.7 + Math.random() * 0.5), Math.sin(a) * spread * 0.35 - 3 - Math.random() * 4,
        (0.8 + Math.random() * 0.6) * size, 460 + Math.random() * 260, front,
      );
    }
  }

  // ---------------- ações ----------------

  /** Começa um pulo. Retorna false se já estiver no ar. */
  jump(): boolean {
    if (this.jumpPhase !== 'ground' || this.hidden) return false;
    this.jumpPhase = 'crouch';
    this.phaseT = 0;
    return true;
  }

  setLabel(show: boolean) {
    if (show && !this.label) {
      this.label = this.scene.add.text(0, 0, this.name, {
        fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#fff6dc', stroke: '#2a1a10', strokeThickness: 3, resolution: 3,
      }).setOrigin(0.5, 1);
    }
    if (this.label) this.label.setVisible(show && !this.hidden);
  }

  setEmote(text: string | null, color = '#ffd34a') {
    if (!text) {
      this.emote?.setVisible(false);
      return;
    }
    if (!this.emote) {
      this.emote = this.scene.add.text(0, 0, text, {
        fontFamily: '"Press Start 2P"', fontSize: '10px', color, stroke: '#2a1a10', strokeThickness: 3, resolution: 3,
      }).setOrigin(0.5, 1);
      this.scene.tweens.add({ targets: this.emote, scale: 1.25, yoyo: true, repeat: -1, duration: 500 });
    }
    this.emote.setText(text).setColor(color).setVisible(!this.hidden);
  }

  face(d: Dir) {
    this.facing = d;
    this.dir8 = d;
    this.applyFrame();
  }

  faceTo(x: number, y: number) {
    const dx = x - this.x, dy = y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.face(dx > 0 ? 'right' : 'left');
    else this.face(dy > 0 ? 'down' : 'up');
  }

  /** escolhe a direção visual (8 direções) com histerese para não piscar */
  private pickDir(vx: number, vy: number): Dir8 {
    const a = Math.atan2(vy, vx); // 0 = direita, π/2 = baixo
    const sector = Math.round(a / (Math.PI / 4)); // -4..4
    const names: Record<string, Dir8> = {
      '0': 'right', '1': 'downright', '2': 'down', '3': 'downleft', '4': 'left', '-4': 'left',
      '-3': 'upleft', '-2': 'up', '-1': 'upright',
    };
    const cand = names[String(sector)];
    if (!this.moving || cand === this.dir8) return cand;
    // só troca se o ângulo passou com folga da fronteira do setor atual
    const centers: Record<Dir8, number> = {
      right: 0, downright: 1, down: 2, downleft: 3, left: 4, upleft: -3, up: -2, upright: -1,
    };
    let cur = centers[this.dir8] * (Math.PI / 4);
    let diff = Math.abs(Phaser.Math.Angle.Wrap(a - cur));
    if (this.dir8 === 'left') { cur = Math.PI; diff = Math.abs(Phaser.Math.Angle.Wrap(a - cur)); }
    return diff > Math.PI / 8 + 0.12 ? cand : this.dir8;
  }

  walk(vx: number, vy: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body || !this.sprite.active) return;
    body.setVelocity(vx, vy);
    const m = Math.abs(vx) > 1 || Math.abs(vy) > 1;
    this.speedNow = Math.hypot(vx, vy) / this.baseScale;
    if (m) {
      if (!this.moving) this.phase = 0; // começa já no passo
      this.dir8 = this.pickDir(vx, vy);
      this.facing = Math.abs(vx) >= Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
      this.moving = true;
    } else if (this.moving) {
      this.moving = false;
    }
  }

  moveTo(x: number, y: number, speed = 60): Promise<void> {
    return new Promise((resolve) => {
      this.target = { x, y, speed, resolve };
    });
  }

  setVisible(v: boolean) {
    this.hidden = !v;
    this.sprite.setVisible(v);
    this.shadow.setVisible(v);
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = v;
    this.label?.setVisible(false);
    this.emote?.setVisible(v && this.emote.visible);
  }

  teleport(x: number, y: number) {
    this.sprite.setPosition(x, y);
    this.home = { x, y };
  }

  // ---------------- quadros ----------------

  private crouchVariant(level: number) {
    const l = Math.round(level);
    return l <= 0 ? V_NORMAL : V_CROUCH[Math.min(3, l) - 1];
  }

  /** escolhe o quadro certo para o estado atual */
  private applyFrame() {
    if (!this.sprite?.active) return;
    let variant = V_NORMAL;
    let col = 0;
    if (this.jumpPhase === 'air') {
      col = 1; // pernas abertas no ar
    } else if (this.jumpPhase === 'crouch' || this.jumpPhase === 'land') {
      // agacha antes de sair / ao tocar o chão (usa os quadros de agachar)
      const k = this.jumpPhase === 'crouch'
        ? Math.min(1, this.phaseT / ANTICIPATION)
        : 1 - Math.min(1, this.phaseT / LAND_TIME);
      variant = this.crouchVariant(Math.max(this.crouchLevel, k * 2.4));
      col = this.moving ? SEQ_COLS[Math.floor(this.phase) % 4] : 0;
    } else if (this.moving) {
      const p = Math.floor(this.phase) % 4;
      col = SEQ_COLS[p];
      if (this.crouchLevel >= 2.5) variant = p % 2 ? V_CROUCH[1] : V_CROUCH[2]; // agachado com balanço
      else if (this.crouchLevel >= 0.5) variant = this.crouchVariant(this.crouchLevel);
      else variant = p % 2 ? V_LIFT : V_NORMAL; // corpo sobe na passagem
    } else {
      variant = this.crouchVariant(this.crouchLevel);
    }
    const f = frameIndex(variant, this.dir8, col);
    if (this.sprite.frame.name !== String(f) && Number(this.sprite.frame.name) !== f) this.sprite.setFrame(f);
  }

  /** Avança o pulo e devolve a deformação (amassar/esticar) do momento. */
  private stepJump(dt: number): { sx: number; sy: number } {
    this.phaseT += dt;
    switch (this.jumpPhase) {
      case 'crouch': {
        const k = Math.min(1, this.phaseT / ANTICIPATION);
        if (this.phaseT >= ANTICIPATION) {
          this.jumpPhase = 'air';
          this.phaseT = 0;
          this.vz = JUMP_V;
          this.crouchLevel = 0;
          this.burstDust(8, 14, 1.1);
          this.airRing(1.5, 0.55);
          for (let i = 0; i < 3; i++) this.windLine(0.8);
        }
        return { sx: 1 + 0.06 * k, sy: 1 - 0.04 * k };
      }
      case 'air': {
        this.vz -= GRAVITY * dt;
        this.z += this.vz * dt;
        if (this.z <= 0) {
          this.z = 0;
          this.vz = 0;
          this.jumpPhase = 'land';
          this.phaseT = 0;
          this.burstDust(12, 20, 1.25);
          this.airRing(2, 0.7);
          return { sx: 1.14, sy: 0.88 };
        }
        const s = Phaser.Math.Clamp(this.vz / JUMP_V, -1, 1);
        return { sx: 1 - 0.05 * s, sy: 1 + 0.08 * s };
      }
      case 'land': {
        const k = Math.min(1, this.phaseT / LAND_TIME);
        if (k >= 1) this.jumpPhase = 'ground';
        const e = 1 - k;
        return { sx: 1 + 0.1 * e * e, sy: 1 - 0.08 * e * e };
      }
      default:
        return { sx: 1, sy: 1 };
    }
  }

  update(time: number) {
    const dt = this.lastTime ? Math.min(0.05, (time - this.lastTime) / 1000) : 0;
    this.lastTime = time;
    if (this.target) {
      const dx = this.target.x - this.x, dy = this.target.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 3) {
        this.walk(0, 0);
        const res = this.target.resolve;
        this.target = null;
        res?.();
      } else {
        this.walk((dx / d) * this.target.speed, (dy / d) * this.target.speed);
      }
    } else if (this.wander > 0 && !this.hidden) {
      if (time > this.nextWander) {
        this.nextWander = time + 1500 + Math.random() * 2500;
        if (Math.random() < 0.55) {
          const a = Math.random() * Math.PI * 2;
          const rr = Math.random() * this.wander;
          const tx = this.home.x + Math.cos(a) * rr, ty = this.home.y + Math.sin(a) * rr;
          this.target = { x: tx, y: ty, speed: 26 };
          setTimeout(() => {
            if (this.target && !this.target.resolve) { this.target = null; this.walk(0, 0); }
          }, 2200);
        }
      }
    }

    // agachar/levantar suave (passa pelos 3 níveis)
    const wantCrouch = this.crouching && !this.airborne ? 3 : 0;
    if (this.crouchLevel !== wantCrouch) {
      const step = CROUCH_RATE * dt;
      this.crouchLevel = wantCrouch > this.crouchLevel
        ? Math.min(wantCrouch, this.crouchLevel + step)
        : Math.max(wantCrouch, this.crouchLevel - step);
    }

    // relógio dos passos: cadência acompanha a velocidade
    const running = this.running && this.moving && !this.airborne;
    if (this.moving && this.jumpPhase !== 'air') {
      const rate = this.crouched ? 0.75 : Phaser.Math.Clamp(this.speedNow / WALK_SPEED, 0.45, 2.2);
      this.phase += dt * WALK_FPS * rate;
      const p = Math.floor(this.phase) % 4;
      if (p !== this.lastStep) {
        this.lastStep = p;
        if (running && p % 2 === 0) this.stepDust(); // pé tocando o chão
      }
    } else {
      this.lastStep = -1;
    }

    // corrida: poeira contínua atrás + vento; arrancada com onda de ar
    if (running && !this.hidden) {
      if (!this.wasRunning) { this.airRing(1.3, 0.45); this.burstDust(5, 10, 0.9); }
      this.trailT += dt;
      if (this.trailT > 0.07) {
        this.trailT = 0;
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        const v = body.velocity.clone().normalize();
        this.puff(this.x - v.x * 6, this.y - 1, this.dustColor(), -v.x * 8, -3 - Math.random() * 3, 0.55 + Math.random() * 0.3, 360);
      }
      this.windT += dt;
      if (this.windT > 0.09) { this.windT = 0; this.windLine(); }
    }
    this.wasRunning = running;

    const def = this.stepJump(dt);
    this.applyFrame();

    // corrida com mais movimento: amassa no contato e estica na passagem
    let rsx = 1, rsy = 1, bob = 0;
    if (running) {
      const s = Math.sin(this.phase * Math.PI); // 0 no contato, ±1 na passagem
      const a = Math.abs(s);
      rsx = 1.035 - 0.06 * a;
      rsy = 0.96 + 0.08 * a;
      bob = 2.2 * a; // pequenos saltos a cada passada
    }

    const sc = this.baseScale;
    if (!this.scene.tweens.isTweening(this.sprite)) {
      // respiração em repouso (todos os personagens, cada um no seu ritmo)
      const idle = !this.moving && !this.airborne;
      const b = idle ? Math.sin((time / BREATH_MS) * Math.PI * 2 + this.breathPhase) : 0;
      this.sprite.setScale(sc * def.sx * rsx, sc * def.sy * rsy * (1 + (this.crouched ? 0.012 : 0.02) * b));
    }

    // altura (pulo + saltinho da corrida): sobe só o desenho; o corpo físico fica no chão
    const lift = this.z + bob;
    const syNow = this.sprite.scaleY || 1;
    const hh = lift / syNow;
    this.sprite.setDisplayOrigin(16, 48 + hh);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setOffset(9, 39 + hh);

    // inclinação para frente ao correr (mais forte de lado, leve nas diagonais)
    const side = this.dir8.includes('right') ? 1 : this.dir8.includes('left') ? -1 : 0;
    const diag = side !== 0 && this.dir8 !== 'right' && this.dir8 !== 'left';
    const want = running ? side * (diag ? 7 : 11) : 0;
    this.lean += (want - this.lean) * Math.min(1, dt * 12);
    this.sprite.setAngle(Math.abs(this.lean) < 0.2 ? 0 : this.lean);

    this.sprite.setDepth(this.y);
    // sombra: acompanha passada, agachamento e altura
    const hk = Phaser.Math.Clamp(1 - lift / 70, 0.45, 1);
    const stepPulse = this.moving && !this.airborne ? 1 - 0.1 * Math.abs(Math.sin(this.phase * Math.PI)) : 1;
    this.shadow
      .setPosition(this.x, this.y - 1)
      .setDepth(this.y - 2)
      .setScale(stepPulse * hk * (1 + 0.12 * (this.crouchLevel / 3)), stepPulse * hk)
      .setAlpha(hk);
    const top = this.y - 50 * sc - this.z + this.crouchLevel * 2 * sc;
    this.label?.setPosition(this.x, top).setDepth(9050);
    this.emote?.setPosition(this.x, top - (this.label?.visible ? 10 : 0)).setDepth(9051);
  }

  destroy() {
    this.sprite.destroy();
    this.shadow.destroy();
    this.label?.destroy();
    this.emote?.destroy();
  }
}
