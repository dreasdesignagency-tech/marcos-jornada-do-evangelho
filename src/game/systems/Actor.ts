// Personagem animado (jogador ou NPC) com sombra, rótulo e movimentação.
import Phaser from 'phaser';
import type { Dir, Look } from '../../data/types';
import { recolor } from '../gfx/recolor';

const ROW: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };

export function lookKey(look: Look) {
  const s = JSON.stringify(look);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'char_' + (h >>> 0).toString(36);
}

export function ensureCharTexture(scene: Phaser.Scene, look: Look) {
  const key = lookKey(look);
  if (!scene.textures.exists(key)) {
    const canvas = recolor(look);
    const tex = scene.textures.addCanvas(key, canvas)!;
    for (let i = 0; i < 16; i++) tex.add(i, 0, (i % 4) * 32, Math.floor(i / 4) * 48, 32, 48);
    for (const d of Object.keys(ROW) as Dir[]) {
      const r = ROW[d];
      scene.anims.create({
        key: `${key}_walk_${d}`,
        frames: [0, 1, 2, 3].map((f) => ({ key, frame: r * 4 + f })),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
  return key;
}

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
  facing: Dir = 'down';
  moving = false;
  home: { x: number; y: number };
  wander = 0;
  nextWander = 0;
  target: { x: number; y: number; speed: number; resolve?: () => void } | null = null;
  baseScale: number;
  hidden = false;

  constructor(scene: Phaser.Scene, id: string, name: string, look: Look, x: number, y: number, isPlayer = false) {
    this.scene = scene;
    this.id = id;
    this.name = name;
    this.look = look;
    this.key = ensureCharTexture(scene, look);
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
    if (!this.moving) this.sprite.setFrame(ROW[d] * 4);
  }

  faceTo(x: number, y: number) {
    const dx = x - this.x, dy = y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.face(dx > 0 ? 'right' : 'left');
    else this.face(dy > 0 ? 'down' : 'up');
  }

  walk(vx: number, vy: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body || !this.sprite.active) return;
    body.setVelocity(vx, vy);
    const m = Math.abs(vx) > 1 || Math.abs(vy) > 1;
    if (m) {
      let d: Dir = this.facing;
      if (Math.abs(vx) > Math.abs(vy) * 1.1) d = vx > 0 ? 'right' : 'left';
      else if (Math.abs(vy) > 0) d = vy > 0 ? 'down' : 'up';
      if (!this.moving || d !== this.facing) this.sprite.anims.play(`${this.key}_walk_${d}`, true);
      this.facing = d;
      this.moving = true;
    } else if (this.moving) {
      this.moving = false;
      this.sprite.anims.stop();
      this.sprite.setFrame(ROW[this.facing] * 4);
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

  update(time: number) {
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
    this.sprite.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y - 1).setDepth(this.y - 2);
    const top = this.y - 50 * this.baseScale;
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
