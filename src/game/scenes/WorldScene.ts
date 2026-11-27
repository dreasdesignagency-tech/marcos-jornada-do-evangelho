// Cena principal: mapa, colisões, câmera, NPCs, missões, desafios, cutscenes e iluminação.
import Phaser from 'phaser';
import type { ChapterDef, StepDef, NpcDef, SceneAction, Pt, Line, ChallengeDef, FxName, Look } from '../../data/types';
import { CHAPTERS } from '../../data/chapters';
import { resolveLook, LOOKS } from '../../data/looks';
import { ITEMS } from '../../data/items';
import { store } from '../../core/store';
import { bus, worldInfo } from '../../core/bus';
import { commit, giveItem, hasItem, unlockAchievement } from '../../core/progression';
import { music, sfx } from '../../audio/audio';
import { Actor } from '../systems/Actor';
import { GALILEIA_GRID } from '../maps/galileia';
import { buildMap, clearAround, type BuiltMap } from '../maps/builder';
import {
  buildTileset, drawObject, drawPickup, drawScroll, tileIndex, waterIndex, TILE_ORDER, VARIANTS, SOLID_TILES, PAL, T,
} from '../gfx/procgen';

export const MS = 1.5; // escala do mundo (mapas e objetos)

interface Interactable {
  x: number; y: number; r: number; label: string;
  act: () => void | Promise<void>;
  enabled?: () => boolean;
}

interface ChallengeRT {
  step: StepDef;
  def: ChallengeDef;
  objs: Phaser.GameObjects.GameObject[];
  actors: Actor[];
  have: number;
  need: number;
  timeLeft?: number;
  data: any;
}

const CROWD_LOOKS = ['homem', 'homem2', 'homem3', 'mulher', 'mulher2', 'mulher3', 'idoso', 'idosa', 'crianca', 'crianca2', 'pescador', 'campones', 'viajante'];

export class WorldScene extends Phaser.Scene {
  def!: ChapterDef;
  cellW = 48; // tamanho da célula em px de mundo
  worldW = 0;
  worldH = 0;
  player!: Actor;
  npcs = new Map<string, Actor>();
  walls!: Phaser.Physics.Arcade.StaticGroup;
  layer?: Phaser.Tilemaps.TilemapLayer;
  waterTiles: { x: number; y: number; deep: boolean; edge: boolean }[] = [];
  waterFrame = 0;
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  interactables: Interactable[] = [];
  nearest: Interactable | null = null;
  busy = false;
  marker!: Phaser.GameObjects.Image;
  ring!: Phaser.GameObjects.Ellipse;
  light?: Phaser.GameObjects.RenderTexture;
  lightAlpha = 0;
  lightColor = 0x0a1030;
  glows: { x: number; y: number; r: number; on?: () => boolean }[] = [];
  rain?: Phaser.GameObjects.Particles.ParticleEmitter;
  overlay!: Phaser.GameObjects.Rectangle;
  ch: ChallengeRT | null = null;
  startedStep = '';
  messageScroll?: Phaser.GameObjects.Image;
  scrollSprites = new Map<string, Phaser.GameObjects.Image>();
  forcedVisible = new Map<string, boolean>();
  lastHint = '';
  stepTimer = 0;
  saveTimer = 0;
  uiTimer = 0;
  carrying?: Phaser.GameObjects.Image;
  unsub: (() => void)[] = [];
  extras: Actor[] = [];
  built?: BuiltMap;

  constructor() {
    super('world');
  }

  init(data: { chapter: number }) {
    this.def = CHAPTERS[data.chapter - 1];
    this.npcs = new Map();
    this.interactables = [];
    this.ch = null;
    this.startedStep = '';
    this.busy = false;
    this.glows = [];
    this.waterTiles = [];
    this.scrollSprites = new Map();
    this.forcedVisible = new Map();
    this.extras = [];
    this.messageScroll = undefined;
    this.carrying = undefined;
  }

  get prog() {
    return store.progress(this.def.n);
  }

  /** converte célula do capítulo em coordenadas do mundo */
  w(p: Pt): { x: number; y: number } {
    return { x: (p[0] + 0.5) * this.cellW, y: (p[1] + 0.5) * this.cellW };
  }

  preload() {
    if (this.def.map.kind === 'ref' && !this.textures.exists('galileia')) {
      this.load.image('galileia', 'assets/maps/galileia.webp');
    }
  }

  create() {
    this.makeTextures();
    this.walls = this.physics.add.staticGroup();
    if (this.def.map.kind === 'ref') this.buildRef();
    else this.buildProc();
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    // jogador
    const s = store.save!;
    const sp = this.w(this.def.spawn);
    this.player = new Actor(this, 'marcos', s.player.name, s.player.look, sp.x, sp.y, true);
    (this.player.sprite.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.walls);
    if (this.layer) this.physics.add.collider(this.player.sprite, this.layer);
    // respiração em repouso
    this.tweens.add({ targets: this.player.sprite, scaleY: 1.02, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });

    this.spawnNpcs();
    this.restoreSceneState();
    this.spawnScrolls();
    this.spawnSide();
    this.setupZones();

    // câmera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldW, this.worldH);
    cam.startFollow(this.player.sprite, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    this.fitZoom();
    this.scale.on('resize', () => this.fitZoom());

    // marcador de objetivo
    this.marker = this.add.image(0, 0, 'arrow').setDepth(9100).setScale(1.2);
    this.tweens.add({ targets: this.marker, y: '-=6', yoyo: true, repeat: -1, duration: 420, ease: 'Sine.inOut' });
    this.ring = this.add.ellipse(0, 0, 60, 24).setStrokeStyle(2, 0xffe08a, 0.8).setDepth(-4000);
    this.tweens.add({ targets: this.ring, scale: 1.25, alpha: 0.3, yoyo: true, repeat: -1, duration: 800 });

    this.setupLighting();
    this.setupAmbient();
    this.setupInput();
    this.buildMinimap();

    music(this.def.music);
    store.setUi({ location: this.def.setting, counter: null, hotcold: null, interactHint: null });
    this.refreshVisibility();
    if (this.allMainDone()) this.spawnMessageScroll();

    this.unsub.push(bus.on('interact', () => this.tryInteract()));
    this.unsub.push(bus.on('message-closed', () => this.afterMessage()));
    this.unsub.push(bus.on('pray', () => this.pray()));
    const cleanup = () => {
      this.unsub.forEach((u) => u());
      this.unsub = [];
    };
    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
    this.game.events.once('destroy', cleanup);

    // abertura do capítulo
    const p = this.prog;
    if (!p.steps.length && !p.zones.length) {
      this.busy = true;
      store.setUi({ cinematic: { title: `Capítulo ${this.def.n} — ${this.def.title}`, sub: `${this.def.ref} · ${this.def.setting}` } });
      const off = bus.on('cinematic-closed', async () => {
        off();
        await store.dialog([{ who: 'narrador', text: this.def.intro }]);
        this.busy = false;
      });
    }
  }

  fitZoom() {
    const h = this.scale.height;
    const wdt = this.scale.width;
    const z = Phaser.Math.Clamp(Math.min(h / 380, wdt / 520), 1.1, 3);
    this.cameras.main.setZoom(z);
  }

  // ---------------- TEXTURAS ----------------
  makeTextures() {
    const add = (key: string, c: HTMLCanvasElement) => {
      if (!this.textures.exists(key)) this.textures.addCanvas(key, c);
    };
    if (!this.textures.exists('arrow')) {
      const g = this.make.graphics({}, false);
      g.fillStyle(0x2a1a10).fillTriangle(0, 0, 16, 0, 8, 12);
      g.fillStyle(0xffd34a).fillTriangle(3, 2, 13, 2, 8, 9);
      g.generateTexture('arrow', 16, 13);
      g.destroy();
    }
    if (!this.textures.exists('light')) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d')!;
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.5, 'rgba(255,255,255,0.6)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      add('light', c);
    }
    if (!this.textures.exists('dot')) {
      const g = this.make.graphics({}, false);
      g.fillStyle(0xffffff).fillRect(0, 0, 2, 2);
      g.generateTexture('dot', 2, 2);
      g.clear();
      g.fillStyle(0xaad8ff).fillRect(0, 0, 1, 6);
      g.generateTexture('raindrop', 1, 6);
      g.clear();
      g.fillStyle(0xffffff).fillRect(0, 1, 7, 2).fillRect(2, 0, 3, 4).fillStyle(0xdddddd).fillRect(5, 2, 3, 1);
      g.generateTexture('dove', 8, 4);
      g.clear();
      g.fillStyle(0x2a2a2a).fillRect(0, 1, 2, 1).fillRect(3, 1, 2, 1).fillRect(2, 2, 1, 1);
      g.generateTexture('bird', 5, 3);
      g.clear();
      g.fillStyle(0x6aa83a).fillRect(0, 0, 3, 2);
      g.generateTexture('leaf', 3, 2);
      g.destroy();
    }
    add('scroll', drawScroll());
    for (const k of ['peixe', 'corda', 'pao', 'cesto', 'ramo', 'manto', 'semente', 'especiaria', 'item']) add('pk_' + k, drawPickup(k));
    // canteiros do semeador
    if (!this.textures.exists('plot_boa')) {
      const soils: Record<string, (g: CanvasRenderingContext2D) => void> = {
        caminho: (g) => { g.fillStyle = '#d6aa68'; g.fillRect(0, 4, 32, 20); g.fillStyle = '#b8864a'; for (let i = 0; i < 12; i++) g.fillRect(Math.random() * 30, 6 + Math.random() * 16, 2, 1); g.fillStyle = '#2a2a2a'; g.fillRect(8, 8, 3, 2); g.fillRect(20, 14, 3, 2); },
        pedregoso: (g) => { g.fillStyle = '#8a6a40'; g.fillRect(0, 4, 32, 20); g.fillStyle = '#9a968e'; for (let i = 0; i < 9; i++) g.fillRect(2 + Math.random() * 26, 6 + Math.random() * 14, 4, 3); },
        espinhos: (g) => { g.fillStyle = '#6a4a2a'; g.fillRect(0, 4, 32, 20); g.fillStyle = '#3e5a1a'; for (let i = 0; i < 14; i++) g.fillRect(2 + Math.random() * 28, 4 + Math.random() * 16, 1, 6); g.fillStyle = '#8a7a2a'; for (let i = 0; i < 6; i++) g.fillRect(2 + Math.random() * 28, 6 + Math.random() * 12, 3, 1); },
        boa: (g) => { g.fillStyle = '#4a321c'; g.fillRect(0, 4, 32, 20); g.fillStyle = '#5e4226'; for (let y = 6; y < 24; y += 4) g.fillRect(1, y, 30, 1); },
        broto: (g) => { soils.boa(g); g.fillStyle = '#6ab83a'; for (let x = 4; x < 30; x += 6) { g.fillRect(x, 6, 2, 10); g.fillRect(x - 2, 6, 6, 3); } g.fillStyle = '#e8c860'; for (let x = 4; x < 30; x += 6) g.fillRect(x, 3, 2, 3); },
      };
      for (const [k, fn] of Object.entries(soils)) {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 26;
        fn(c.getContext('2d')!);
        add('plot_' + k, c);
      }
    }
  }

  objTexture(o: string, v: number, w?: number, h?: number) {
    const key = `obj_${o}_${v % 3}_${w ?? 0}_${h ?? 0}`;
    let art: ReturnType<typeof drawObject> | null = null;
    if (!this.textures.exists(key)) {
      art = drawObject(o as any, v % 3, w, h);
      const tex = this.textures.addCanvas(key, art.canvas)!;
      if (art.frames) {
        const fw = art.canvas.width / art.frames;
        for (let i = 0; i < art.frames; i++) tex.add(i, 0, i * fw, 0, fw, art.canvas.height);
      }
      this.registry.set(key, { body: art.body, frames: art.frames });
    }
    return { key, meta: this.registry.get(key) as { body?: { w: number; h: number; oy?: number }; frames?: number } };
  }

  /** Coloca um objeto (pés em x,y) com colisão opcional. */
  placeObj(o: string, x: number, y: number, opts: { v?: number; w?: number; h?: number; solid?: boolean; flat?: boolean } = {}) {
    const { key, meta } = this.objTexture(o, opts.v ?? 0, opts.w, opts.h);
    const img = meta.frames ? this.add.sprite(x, y, key, 0) : this.add.image(x, y, key);
    img.setOrigin(0.5, 1).setScale(MS);
    img.setDepth(opts.flat ? -5000 + y : y);
    if (opts.solid !== false && meta.body) {
      const b = meta.body;
      const zw = b.w * MS, zh = b.h * MS;
      const z = this.add.zone(x, y - zh / 2 - (b.oy ?? 0) * MS, zw, zh);
      this.walls.add(z);
    }
    if (meta.frames && o === 'fire') {
      this.anims.exists('fire_anim') ||
        this.anims.create({ key: 'fire_anim', frames: [0, 1, 2].map((f) => ({ key, frame: f })), frameRate: 8, repeat: -1 });
      (img as Phaser.GameObjects.Sprite).play('fire_anim');
      this.glows.push({ x, y: y - 10, r: 150 });
    }
    if (['tree', 'olive', 'palm', 'fig', 'mustard'].includes(o)) {
      // vento nas árvores
      this.tweens.add({ targets: img, angle: { from: -0.8, to: 0.8 }, yoyo: true, repeat: -1, duration: 1800 + Math.random() * 1400, ease: 'Sine.inOut', delay: Math.random() * 1000 });
    }
    return img;
  }

  // ---------------- MAPAS ----------------
  buildRef() {
    this.cellW = 32 * MS;
    const bg = this.add.image(0, 0, 'galileia').setOrigin(0).setScale(MS).setDepth(-10000);
    this.worldW = bg.width * MS;
    this.worldH = bg.height * MS;
    // colisões: une sequências horizontais de células bloqueadas
    GALILEIA_GRID.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        if (row[x] === '#' || row[x] === '~') {
          let e = x;
          while (e < row.length && (row[e] === '#' || row[e] === '~')) e++;
          const z = this.add.zone((x + (e - x) / 2) * this.cellW, (y + 0.5) * this.cellW, (e - x) * this.cellW, this.cellW);
          this.walls.add(z);
          x = e;
        } else x++;
      }
    });
    // elementos animados independentes sobre o cenário
    const c = this.cellW;
    const fire = this.placeObj('fire', 14.55 * c, 9.25 * c, { solid: false });
    fire.setScale(MS * 1.1).setAlpha(0.95);
    // cachoeira
    this.add.particles(3.6 * c, 3.6 * c, 'dot', {
      x: { min: -30, max: 30 }, speedY: { min: -20, max: 10 }, speedX: { min: -25, max: 25 },
      lifespan: 700, scale: { start: 1.6, end: 0 }, alpha: { start: 0.9, end: 0 }, frequency: 40, tint: 0xe8fbff,
    }).setDepth(-3000);
    this.add.particles(3.3 * c, 1.2 * c, 'raindrop', {
      x: { min: 0, max: 40 }, speedY: { min: 120, max: 180 }, lifespan: 600, alpha: { start: 0.7, end: 0 }, frequency: 30, tint: 0xdff8ff, scale: 1.5,
    }).setDepth(-3000);
    // brilhos na água
    const water: { x: number; y: number }[] = [];
    GALILEIA_GRID.forEach((row, y) => [...row].forEach((ch, x) => ch === '~' && water.push({ x, y })));
    this.add.particles(0, 0, 'dot', {
      emitZone: { type: 'random', source: { getRandomPoint: (p: Phaser.Math.Vector2) => { const w = water[Math.floor(Math.random() * water.length)]; p.x = (w.x + Math.random()) * c; p.y = (w.y + Math.random()) * c; return p; } } as any },
      lifespan: 900, scale: { start: 1.4, end: 0 }, alpha: { start: 0.9, end: 0 }, frequency: 60, tint: 0xffffff,
    }).setDepth(-3000);
  }

  buildProc() {
    const map = this.def.map as Extract<ChapterDef['map'], { kind: 'proc' }>;
    this.cellW = T * MS;
    // mantém livres as posições importantes
    const keep: [number, number][] = [this.def.spawn, ...this.def.npcs.map((n) => n.at), ...this.def.scrolls.map((s) => s.at)];
    this.def.steps.forEach((s) => s.at && keep.push(s.at));
    this.def.side.forEach((s) => s.findAt && keep.push(s.findAt));
    this.def.steps.forEach((s) => {
      const c = s.challenge as any;
      if (!c) return;
      for (const k of ['at', 'targets']) if (Array.isArray(c[k])) c[k].forEach((p: Pt) => keep.push(p));
      if (c.source) keep.push(c.source);
      if (c.target) keep.push(c.target);
      if (c.plots) c.plots.forEach((p: any) => keep.push(p.at));
      if (c.path) c.path.forEach((p: Pt) => keep.push(p));
    });
    const built = buildMap(map, keep);
    clearAround(built, keep, 1.5);
    this.built = built;
    if (!this.textures.exists('tileset')) this.textures.addCanvas('tileset', buildTileset());
    const data: number[][] = [];
    const r = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
    for (let y = 0; y < built.h; y++) {
      const row: number[] = [];
      for (let x = 0; x < built.w; x++) {
        const t = built.grid[y][x];
        if (t === 'water' || t === 'deep') {
          const edge = y > 0 && built.grid[y - 1][x] !== 'water' && built.grid[y - 1][x] !== 'deep';
          this.waterTiles.push({ x, y, deep: t === 'deep', edge });
          row.push(waterIndex(t === 'deep', 0, edge));
        } else row.push(tileIndex(t, r(x, y) % VARIANTS));
      }
      data.push(row);
    }
    const tm = this.make.tilemap({ data, tileWidth: T, tileHeight: T });
    const ts = tm.addTilesetImage('tileset', 'tileset', T, T, 0, 0)!;
    this.layer = tm.createLayer(0, ts, 0, 0)!;
    this.layer.setScale(MS).setDepth(-9000);
    const solid: number[] = [];
    for (const name of SOLID_TILES) {
      if (name === 'water' || name === 'deep') continue;
      for (let v = 0; v < VARIANTS; v++) solid.push(tileIndex(name, v));
    }
    for (let i = TILE_ORDER.length * VARIANTS; i < TILE_ORDER.length * VARIANTS + 12; i++) solid.push(i);
    this.layer.setCollision(solid);
    this.worldW = built.w * T * MS;
    this.worldH = built.h * T * MS;
    for (const o of built.objects) {
      const x = (o.x + 0.5) * this.cellW, y = (o.y + 1) * this.cellW;
      const flat = ['flower', 'stairs', 'reeds'].includes(o.o);
      const img = this.placeObj(o.o, x, y, { v: o.v, w: o.w, h: o.h, solid: o.solid, flat });
      if (o.o === 'cityview') img.setDepth(-4500);
      if (o.o === 'lamp') this.glows.push({ x, y: y - 20, r: 90 });
      if (o.o === 'stone') img.setData('stone', true).setName('tombstone');
    }
    // animação da água
    this.time.addEvent({
      delay: 380, loop: true, callback: () => {
        this.waterFrame = (this.waterFrame + 1) % 3;
        for (const t of this.waterTiles) this.layer!.putTileAt(waterIndex(t.deep, this.waterFrame, t.edge), t.x, t.y);
      },
    });
  }

  buildMinimap() {
    const W = 192, H = Math.round((192 * this.worldH) / this.worldW);
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    if (this.def.map.kind === 'ref') {
      const src = this.textures.get('galileia').getSourceImage() as HTMLImageElement;
      g.drawImage(src, 0, 0, W, H);
    } else if (this.built) {
      const col: Record<string, string> = {
        grass: PAL.grass[1], grass2: PAL.grass[2], dgrass: PAL.dgrass[1], darkgrass: PAL.darkgrass[1], sand: PAL.sand[0], dirt: PAL.dirt[0],
        stone: PAL.stone[0], marble: PAL.marble[0], rock: PAL.rock[0], water: PAL.water[0], deep: PAL.deep[0], field: '#8a6a3a', soil: '#7a5a34',
        cliff: PAL.rock[2], wall: PAL.adobe[2], flowers: '#7ab04a', mountain: '#b49a78', floor: '#9a7a5a', snow: '#f0f0f4',
      };
      const sx = W / this.built.w, sy = H / this.built.h;
      for (let y = 0; y < this.built.h; y++)
        for (let x = 0; x < this.built.w; x++) {
          g.fillStyle = col[this.built.grid[y][x]] ?? '#888';
          g.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy));
        }
      for (const o of this.built.objects) {
        if (['house', 'temple', 'tower', 'gate'].includes(o.o)) {
          g.fillStyle = '#e2c08e';
          const ww = (o.w ?? 4) * sx, hh = (o.h ?? 3) * sy;
          g.fillRect((o.x + 0.5) * sx - ww / 2, (o.y + 1) * sy - hh, ww, hh);
        } else if (['tree', 'olive', 'palm', 'fig'].includes(o.o)) {
          g.fillStyle = '#2f6e22';
          g.fillRect(o.x * sx, o.y * sy, 2, 2);
        }
      }
    }
    worldInfo.minimap = c.toDataURL();
    worldInfo.w = this.worldW;
    worldInfo.h = this.worldH;
  }

  // ---------------- PERSONAGENS ----------------
  spawnNpcs() {
    for (const n of this.def.npcs) this.addNpc(n);
  }

  addNpc(n: NpcDef) {
    const p = this.w(n.at);
    const a = new Actor(this, n.id, n.name, resolveLook(n.look), p.x, p.y);
    a.face(n.face ?? 'down');
    a.wander = (n.wander ?? 0) * this.cellW;
    this.physics.add.collider(this.player.sprite, a.sprite);
    this.npcs.set(n.id, a);
    if (n.id === 'jesus') {
      // luz suave e respeitosa ao redor de Jesus
      const glow = this.add.image(p.x, p.y - 24, 'light').setScale(0.9).setAlpha(0.18).setBlendMode(Phaser.BlendModes.ADD).setTint(0xfff0c0);
      this.events.on('update', () => glow.setPosition(a.x, a.y - 24).setDepth(a.y + 1).setVisible(!a.hidden));
      const lt = { x: p.x, y: p.y, r: 110, on: () => { if (a.hidden) return false; lt.x = a.x; lt.y = a.y - 20; return true; } };
      this.glows.push(lt);
    }
    if (n.lines?.length || this.def.steps.some((s) => s.npc === n.id) || this.def.side.some((s) => s.giver === n.id)) {
      this.interactables.push({
        x: 0, y: 0, r: 46, label: `Falar com ${n.name}`,
        enabled: () => !a.hidden,
        act: () => this.talkTo(n, a),
      });
      const it = this.interactables[this.interactables.length - 1];
      this.events.on('update', () => { it.x = a.x; it.y = a.y; });
    }
    return a;
  }

  /** Ao recarregar, reaplica posições/visibilidade definidas pelas cenas já concluídas. */
  restoreSceneState() {
    for (const st of this.def.steps) {
      if (!this.prog.steps.includes(st.id)) break;
      for (const a of st.scene ?? []) {
        if (a.t === 'show') {
          this.forcedVisible.set(a.id, true);
          if (a.at) { const p = this.w(a.at); this.npcs.get(a.id)?.teleport(p.x, p.y); }
        } else if (a.t === 'hide') this.forcedVisible.set(a.id, false);
        else if (a.t === 'move' && a.id !== 'marcos') { const p = this.w(a.to); this.npcs.get(a.id)?.teleport(p.x, p.y); }
      }
    }
  }

  isNpcVisible(n: NpcDef) {
    if (this.forcedVisible.has(n.id)) return this.forcedVisible.get(n.id)!;
    const steps = this.def.steps;
    const cur = this.currentStep();
    const curIdx = cur ? steps.indexOf(cur) : steps.length;
    if (n.showFrom) {
      const i = steps.findIndex((s) => s.id === n.showFrom);
      if (i > curIdx) return false;
    }
    if (n.hideAfter && this.prog.steps.includes(n.hideAfter)) return false;
    return true;
  }

  refreshVisibility() {
    for (const n of this.def.npcs) {
      const a = this.npcs.get(n.id);
      if (!a) continue;
      const v = this.isNpcVisible(n);
      if (v !== !a.hidden) a.setVisible(v);
    }
  }

  // ---------------- PERGAMINHOS / ZONAS / SECUNDÁRIAS ----------------
  spawnScrolls() {
    for (const s of this.def.scrolls) {
      if (this.prog.scrolls.includes(s.id)) continue;
      const p = this.w(s.at);
      const img = this.add.image(p.x, p.y, 'scroll').setScale(MS).setDepth(p.y);
      this.tweens.add({ targets: img, y: p.y - 5, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });
      const glow = this.add.image(p.x, p.y, 'light').setScale(0.45).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe08a).setDepth(p.y - 1);
      this.tweens.add({ targets: glow, alpha: 0.15, yoyo: true, repeat: -1, duration: 1100 });
      this.scrollSprites.set(s.id, img);
      this.glows.push({ x: p.x, y: p.y, r: 60, on: () => img.active });
      this.interactables.push({
        x: p.x, y: p.y, r: 40, label: 'Ler pergaminho',
        enabled: () => img.active,
        act: async () => {
          sfx('scroll');
          this.pose('write');
          img.destroy();
          glow.destroy();
          this.prog.scrolls.push(s.id);
          commit(this.def.n);
          store.toast(`Pergaminho registrado: ${s.ref}`, '📜');
          await store.dialog([
            { who: 'narrador', text: `Você encontrou um registro bíblico e o copiou no seu pergaminho.` },
            { who: 'narrador', text: s.text, ref: s.ref },
          ]);
          if (this.allMainDone()) this.spawnMessageScroll();
        },
      });
    }
  }

  spawnSide() {
    for (const q of this.def.side) {
      if (!q.findAt || this.prog.side.includes(q.id)) continue;
      const it = ITEMS[q.needs];
      const p = this.w(q.findAt);
      const img = this.add.image(p.x, p.y, 'pk_item').setScale(MS).setDepth(p.y);
      const txt = this.add.text(p.x, p.y - 4, it?.icon ?? '✦', { fontSize: '14px' }).setOrigin(0.5).setDepth(p.y + 1);
      this.tweens.add({ targets: [img, txt], y: '-=4', yoyo: true, repeat: -1, duration: 700 });
      this.interactables.push({
        x: p.x, y: p.y, r: 36, label: `Pegar ${it?.name ?? 'item'}`,
        enabled: () => img.active && !hasItem(q.needs),
        act: () => {
          giveItem(q.needs);
          img.destroy();
          txt.destroy();
        },
      });
    }
  }

  setupZones() {
    worldInfo.zones = this.def.zones.map((z) => ({ ...this.w(z.at), name: z.name, found: this.prog.zones.includes(z.id) }));
  }

  checkZones() {
    let loc = this.def.setting;
    let best = Infinity;
    for (const z of this.def.zones) {
      const p = this.w(z.at);
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      const r = z.r * this.cellW;
      if (d < r * 1.6 && d < best) {
        best = d;
        loc = z.name;
      }
      if (d < r && !this.prog.zones.includes(z.id)) {
        this.prog.zones.push(z.id);
        const s = store.save!;
        if (!s.seenPlaces.includes(z.name)) s.seenPlaces.push(z.name);
        commit(this.def.n);
        store.toast(`Lugar descoberto: ${z.name}`, '🧭');
        sfx('chime');
        this.setupZones();
      }
    }
    if (store.ui.location !== loc) store.setUi({ location: loc });
  }

  // ---------------- MISSÕES ----------------
  currentStep(): StepDef | null {
    return this.def.steps.find((s) => !this.prog.steps.includes(s.id)) ?? null;
  }

  allMainDone() {
    return this.def.steps.every((s) => this.prog.steps.includes(s.id));
  }

  objectivePos(): { x: number; y: number } | null {
    const s = this.currentStep();
    if (!s) {
      if (this.messageScroll && !this.prog.messageRead) return { x: this.messageScroll.x, y: this.messageScroll.y - 20 };
      return null;
    }
    if (this.ch) {
      const d = this.ch.def;
      if (d.type === 'deliver') {
        if (this.carrying) {
          const t = (this.ch.data.targets as { x: number; y: number; done: boolean }[]).find((t) => !t.done);
          if (t) return t;
        } else return this.w(d.source);
      }
      if (d.type === 'waypoints') return this.w(d.at[this.ch.have] ?? d.at[0]);
      if (d.type === 'crowd') return this.w(d.target);
      if (d.type === 'follow') { const a = this.npcs.get(d.npc); return a ? { x: a.x, y: a.y - 40 } : null; }
      if (d.type === 'hotcold') return null; // o jogador precisa escutar
      if (d.type === 'trial') {
        const id = d.npcs.find((n) => !this.ch!.data.done.has(n));
        const a = id ? this.npcs.get(id) : null;
        return a ? { x: a.x, y: a.y - 46 } : null;
      }
      if (d.type === 'collect' || d.type === 'plant' || d.type === 'lamps') return null;
    }
    if (s.npc) {
      const a = this.npcs.get(s.npc);
      if (a && !a.hidden) return { x: a.x, y: a.y - 46 * a.baseScale };
    }
    if (s.at) return this.w(s.at);
    return null;
  }

  async completeStep(s: StepDef) {
    if (this.prog.steps.includes(s.id)) return;
    this.prog.steps.push(s.id);
    commit(this.def.n);
    sfx(this.def.solemn ? 'chime' : 'quest');
    store.toast(this.def.solemn ? `Registrado: ${s.title}` : `Missão concluída: ${s.title}`, this.def.solemn ? '🕊️' : '✅');
    this.pose('write');
    this.refreshVisibility();
    if (this.allMainDone()) {
      this.spawnMessageScroll();
      store.toast('A Mensagem do Capítulo está disponível', '📜');
    }
  }

  async runStep(s: StepDef) {
    this.busy = true;
    try {
      if (s.lines?.length) await store.dialog(s.lines);
      if (s.scene?.length) await this.playScene(s.scene);
      await this.completeStep(s);
    } finally {
      this.busy = false;
    }
  }

  updateQuest() {
    if (this.busy || store.blocking) return;
    const s = this.currentStep();
    if (!s) return;
    const near = (p: Pt, r = 1.4) => Phaser.Math.Distance.Between(this.player.x, this.player.y, this.w(p).x, this.w(p).y) < r * this.cellW;
    if (s.kind === 'reach' && s.at && near(s.at, s.r ?? 1.4)) {
      this.runStep(s);
    } else if (s.kind === 'scene') {
      if (!s.at || near(s.at, s.r ?? 1.6)) this.runStep(s);
    } else if (s.kind === 'challenge' && this.startedStep !== s.id && !s.npc) {
      if (!s.at || near(s.at, s.r ?? 1.6)) this.startChallenge(s);
    }
  }

  async talkTo(n: NpcDef, a: Actor) {
    if (this.busy) return;
    this.busy = true;
    a.faceTo(this.player.x, this.player.y);
    this.player.faceTo(a.x, a.y);
    const prevTarget = a.target;
    a.target = null;
    a.walk(0, 0);
    try {
      const p = this.prog;
      const s = this.currentStep();
      const first = !p.talked.includes(n.id);
      // 1) missão principal
      if (s && s.npc === n.id && s.kind === 'talk') {
        this.markTalked(n, first);
        if (s.lines?.length) await store.dialog(s.lines);
        if (s.scene?.length) await this.playScene(s.scene);
        await this.completeStep(s);
        this.giveNpcItem(n);
        return;
      }
      if (s && s.npc === n.id && s.kind === 'challenge' && this.startedStep !== s.id) {
        this.markTalked(n, first);
        if (s.lines?.length) await store.dialog(s.lines);
        this.giveNpcItem(n);
        this.busy = false;
        await this.startChallenge(s);
        return;
      }
      // 2) julgamento (perguntas no mundo)
      if (this.ch?.def.type === 'trial' && this.ch.def.npcs.includes(n.id) && !this.ch.data.done.has(n.id)) {
        this.markTalked(n, first);
        const ok = await store.dialog(n.lines ?? []);
        if (ok !== false) {
          this.ch.data.done.add(n.id);
          this.ch.have = this.ch.data.done.size;
          this.updateCounter();
          sfx('select');
          if (this.ch.have >= this.ch.need) await this.finishChallenge(true);
        }
        this.giveNpcItem(n);
        return;
      }
      // 2b) encontrar quem clama (hotcold)
      if (this.ch?.def.type === 'hotcold' && this.ch.def.npc === n.id) {
        this.markTalked(n, first);
        if (n.lines?.length) await store.dialog(n.lines);
        this.giveNpcItem(n);
        this.ch.have = 1;
        this.busy = false;
        await this.finishChallenge(true);
        return;
      }
      // 3) missão secundária
      const q = this.def.side.find((x) => x.giver === n.id && !p.side.includes(x.id));
      if (q) {
        this.markTalked(n, first);
        if (hasItem(q.needs)) {
          await store.dialog(q.thanks);
          p.side.push(q.id);
          commit(this.def.n);
          sfx('quest');
          store.toast(`Missão secundária concluída: ${q.title}`, '🤝');
          if (q.reward) giveItem(q.reward);
        } else {
          const it = ITEMS[q.needs];
          await store.dialog([
            ...q.ask,
            { who: 'narrador', text: `Item necessário: ${it?.icon ?? ''} ${it?.name ?? q.needs}${q.needsFrom ? ` (encontrado em ${q.needsFrom})` : q.findAt ? ' — procure por perto.' : ''}.` },
          ]);
        }
        this.giveNpcItem(n);
        return;
      }
      // 4) fala comum
      this.markTalked(n, first);
      if (n.lines?.length) await store.dialog(n.lines);
      else await store.dialog([{ who: n.id, text: '...' }]);
      this.giveNpcItem(n);
    } finally {
      if (this.pendingUses === n) {
        this.pendingUses = null;
        try { await this.runUses(n); } catch { /* ignore */ }
      }
      this.busy = false;
      a.face(n.face ?? 'down');
      if (prevTarget && !prevTarget.resolve) a.target = null;
    }
  }

  markTalked(n: NpcDef, first: boolean) {
    if (!first) return;
    if (!n.lines?.length) return;
    this.prog.talked.push(n.id);
    const s = store.save!;
    if (!s.seenCharacters.includes(n.name)) s.seenCharacters.push(n.name);
    commit(this.def.n);
  }

  giveNpcItem(n: NpcDef) {
    if (n.gives && !hasItem(n.gives)) giveItem(n.gives);
    this.pendingUses = n;
  }

  pendingUses: NpcDef | null = null;

  /** Reações a itens trazidos de capítulos anteriores. */
  async runUses(n: NpcDef) {
    const s = store.save!;
    s.usedItems ??= [];
    for (const u of n.uses ?? []) {
      const key = `${this.def.n}:${n.id}:${u.item}`;
      if (!hasItem(u.item) || s.usedItems.includes(key)) continue;
      s.usedItems.push(key);
      store.persist();
      const it = ITEMS[u.item];
      store.toast(`Você usou: ${it?.name ?? u.item}`, it?.icon ?? '✦');
      sfx('item');
      await store.dialog([{ who: 'narrador', text: `Você mostra ${it ? `"${it.name}"` : 'um item'} da sua bolsa.` }, ...u.lines]);
    }
  }

  // ---------------- DESAFIOS ----------------
  async startChallenge(s: StepDef) {
    if (!s.challenge) return;
    this.startedStep = s.id;
    const d = s.challenge;
    const overlay = ['sequence', 'select', 'sort', 'balance', 'vigil'].includes(d.type);
    if (overlay) {
      this.busy = true;
      const ok = await store.minigame(d, !!(s.helpItem && hasItem(s.helpItem)));
      if (s.helpItem && hasItem(s.helpItem)) store.toast(`Seu item "${ITEMS[s.helpItem]?.name}" ajudou neste desafio!`, ITEMS[s.helpItem]?.icon);
      this.busy = false;
      if (ok) {
        if (s.scene?.length) {
          this.busy = true;
          await this.playScene(s.scene);
          this.busy = false;
        }
        await this.completeStep(s);
      } else {
        this.startedStep = '';
        store.toast('Desafio interrompido — fale novamente para tentar de novo', '↺');
      }
      return;
    }
    const rt: ChallengeRT = { step: s, def: d, objs: [], actors: [], have: 0, need: 0, data: {} };
    this.ch = rt;
    sfx('open');
    switch (d.type) {
      case 'collect': {
        rt.need = d.at.length;
        if (s.helpItem && hasItem(s.helpItem)) {
          rt.need -= 1;
          store.toast(`Seu item "${ITEMS[s.helpItem]?.name}" ajudou neste desafio!`, ITEMS[s.helpItem]?.icon);
        }
        this.spawnCollect(rt);
        if (d.time) rt.timeLeft = d.time;
        break;
      }
      case 'deliver': {
        rt.need = d.targets.length;
        const src = this.w(d.source);
        const img = this.add.image(src.x, src.y, 'pk_' + d.icon).setScale(MS * 1.6).setDepth(src.y);
        this.tweens.add({ targets: img, y: '-=4', yoyo: true, repeat: -1, duration: 600 });
        rt.objs.push(img);
        rt.data.targets = d.targets.map((t, i) => {
          const p = this.w(t);
          const people: Actor[] = [];
          for (let k = 0; k < 3; k++) {
            const lk = LOOKS[CROWD_LOOKS[(i * 3 + k) % CROWD_LOOKS.length]];
            const a = new Actor(this, `grp${i}_${k}`, 'Grupo', lk, p.x + (k - 1) * 22, p.y + (k % 2) * 8);
            a.face('up');
            this.physics.add.collider(this.player.sprite, a.sprite);
            people.push(a);
            rt.actors.push(a);
          }
          return { x: p.x, y: p.y, done: false, people, name: d.targetNames?.[i] ?? `Grupo ${i + 1}` };
        });
        const it: Interactable = {
          x: src.x, y: src.y, r: 46, label: `Pegar ${d.label}`,
          enabled: () => this.ch === rt && !this.carrying,
          act: () => {
            this.carrying = this.add.image(this.player.x, this.player.y - 60, 'pk_' + d.icon).setScale(MS).setDepth(9060);
            sfx('item');
          },
        };
        this.interactables.push(it);
        rt.data.its = [it];
        for (const t of rt.data.targets) {
          const ti: Interactable = {
            x: t.x, y: t.y, r: 56, label: `Entregar a ${t.name}`,
            enabled: () => this.ch === rt && !!this.carrying && !t.done,
            act: () => {
              t.done = true;
              this.carrying?.destroy();
              this.carrying = undefined;
              rt.have++;
              sfx('quest');
              t.people.forEach((a: Actor) => a.setEmote('♥', '#ff8aa0'));
              this.updateCounter();
              if (rt.have >= rt.need) this.finishChallenge(true);
            },
          };
          this.interactables.push(ti);
          rt.data.its.push(ti);
        }
        break;
      }
      case 'crowd': {
        rt.need = 1;
        rt.timeLeft = d.time;
        const st = this.w(d.start);
        this.player.teleport(st.x, st.y);
        const [ax, ay, aw, ah] = d.area;
        for (let i = 0; i < d.people; i++) {
          const lk = LOOKS[CROWD_LOOKS[i % CROWD_LOOKS.length]];
          const p = this.w([ax + Math.random() * aw, ay + Math.random() * ah]);
          const a = new Actor(this, 'crowd' + i, 'Multidão', lk, p.x, p.y);
          const body = a.sprite.body as Phaser.Physics.Arcade.Body;
          body.setImmovable(false);
          body.pushable = true;
          body.setDrag(200, 200);
          this.physics.add.collider(this.player.sprite, a.sprite);
          this.physics.add.collider(a.sprite, this.walls);
          if (this.layer) this.physics.add.collider(a.sprite, this.layer);
          rt.actors.push(a);
        }
        rt.data.area = d.area;
        break;
      }
      case 'plant': {
        rt.need = d.plots.filter((p) => p.soil === 'boa').length;
        rt.data.plots = d.plots.map((pl) => {
          const p = this.w(pl.at);
          const img = this.add.image(p.x, p.y, 'plot_' + pl.soil).setScale(MS).setDepth(-5000 + p.y);
          rt.objs.push(img);
          const obj = { ...pl, img, planted: false };
          const it: Interactable = {
            x: p.x, y: p.y, r: 44, label: 'Semear aqui',
            enabled: () => this.ch === rt && !obj.planted,
            act: async () => {
              const explain: Record<string, Line[]> = {
                caminho: [{ who: 'narrador', text: 'A semente cai à beira do caminho e logo as aves vêm e a comem.' }, { who: 'narrador', text: 'Jesus explicou: são os que ouvem a palavra, mas logo vem Satanás e tira a palavra que foi semeada no coração.', ref: 'Marcos 4:15' }],
                pedregoso: [{ who: 'narrador', text: 'Aqui há pouca terra entre as pedras: a semente brota depressa, mas seca ao sol, pois não tem raiz.' }, { who: 'narrador', text: 'São os que recebem a palavra com alegria, mas não têm raiz em si mesmos e, vindo a angústia, logo se escandalizam.', ref: 'Marcos 4:16-17' }],
                espinhos: [{ who: 'narrador', text: 'Os espinhos crescem e sufocam a planta, que não dá fruto.' }, { who: 'narrador', text: 'São os que ouvem a palavra, mas os cuidados deste mundo e a sedução das riquezas sufocam a palavra.', ref: 'Marcos 4:18-19' }],
              };
              if (pl.soil === 'boa') {
                obj.planted = true;
                img.setTexture('plot_broto');
                this.tweens.add({ targets: img, scaleY: { from: MS * 0.6, to: MS }, duration: 600, ease: 'Back.out' });
                sfx('item');
                rt.have++;
                this.updateCounter();
                if (rt.have >= rt.need) {
                  await store.dialog([{ who: 'narrador', text: 'Boa terra! Jesus disse que estes são os que ouvem a palavra, a recebem e dão fruto, a trinta, a sessenta e a cem por um.', ref: 'Marcos 4:20' }]);
                  this.finishChallenge(true);
                }
              } else {
                sfx('error');
                this.busy = true;
                await store.dialog(explain[pl.soil]);
                this.busy = false;
              }
            },
          };
          this.interactables.push(it);
          return obj;
        });
        break;
      }
      case 'lamps': {
        rt.need = d.duration;
        rt.timeLeft = d.duration;
        rt.data.help = !!(s.helpItem && hasItem(s.helpItem));
        if (rt.data.help) store.toast(`Seu item "${ITEMS[s.helpItem!]?.name}" mantém as chamas por mais tempo!`, ITEMS[s.helpItem!]?.icon);
        rt.data.lamps = d.at.map((pt) => {
          const p = this.w(pt);
          const { key } = this.objTexture('lamp', 0);
          const spr = this.add.sprite(p.x, p.y, key, 0).setOrigin(0.5, 1).setScale(MS * 1.3).setDepth(p.y);
          rt.objs.push(spr);
          const lamp = { spr, fuel: 6 + Math.random() * 6, x: p.x, y: p.y };
          this.glows.push({ x: p.x, y: p.y - 24, r: 110, on: () => this.ch === rt && lamp.fuel > 0 });
          const it: Interactable = {
            x: p.x, y: p.y, r: 40, label: 'Reabastecer a lâmpada',
            enabled: () => this.ch === rt && lamp.fuel < 5,
            act: () => { lamp.fuel = 9 + Math.random() * 5; spr.setFrame(0); sfx('chime'); },
          };
          this.interactables.push(it);
          return lamp;
        });
        break;
      }
      case 'hotcold': {
        rt.need = 1;
        // multidão ao redor
        const tp = this.w(d.target);
        for (let i = 0; i < 10; i++) {
          const lk = LOOKS[CROWD_LOOKS[(i + 3) % CROWD_LOOKS.length]];
          const a = new Actor(this, 'hc' + i, 'Viajante', lk, tp.x + (Math.random() - 0.5) * 360, tp.y + (Math.random() - 0.5) * 220);
          a.wander = 40;
          this.physics.add.collider(this.player.sprite, a.sprite);
          rt.actors.push(a);
        }
        rt.data.next = 0;
        break;
      }
      case 'waypoints': {
        rt.need = d.at.length;
        rt.timeLeft = d.time;
        rt.data.cairns = d.at.map((pt) => {
          const p = this.w(pt);
          const { key } = this.objTexture('cairn', 0);
          const spr = this.add.sprite(p.x, p.y, key, 0).setOrigin(0.5, 1).setScale(MS * 1.2).setDepth(p.y);
          rt.objs.push(spr);
          return { spr, p };
        });
        break;
      }
      case 'follow': {
        rt.need = d.path.length;
        rt.data.i = 0;
        rt.data.warned = false;
        break;
      }
      case 'trial': {
        rt.need = d.npcs.length;
        rt.data.done = new Set<string>();
        break;
      }
    }
    this.updateCounter();
  }

  spawnCollect(rt: ChallengeRT) {
    const d = rt.def as Extract<ChallengeDef, { type: 'collect' }>;
    rt.objs.forEach((o) => o.destroy());
    rt.objs = [];
    rt.have = 0;
    rt.data.items = d.at.map((pt) => {
      const p = this.w(pt);
      const img = this.add.image(p.x, p.y, 'pk_' + d.icon).setScale(MS * 1.3).setDepth(p.y);
      const glow = this.add.image(p.x, p.y, 'light').setScale(0.3).setAlpha(0.4).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe08a).setDepth(p.y - 1);
      this.tweens.add({ targets: img, y: p.y - 4, yoyo: true, repeat: -1, duration: 500 + Math.random() * 300 });
      rt.objs.push(img, glow);
      return { img, glow, x: p.x, y: p.y, taken: false };
    });
  }

  updateCounter() {
    const rt = this.ch;
    if (!rt) return store.setUi({ counter: null });
    const d = rt.def;
    const label =
      d.type === 'collect' ? d.label : d.type === 'deliver' ? `Entregar ${d.label}` : d.type === 'crowd' ? 'Atravesse a multidão' :
      d.type === 'plant' ? 'Sementes na boa terra' : d.type === 'lamps' ? 'Mantenha as lâmpadas acesas' : d.type === 'hotcold' ? 'Escute e encontre quem clama' :
      d.type === 'waypoints' ? d.label : d.type === 'follow' ? 'Acompanhe de perto' : d.type === 'trial' ? 'Perguntas respondidas' : '';
    const have = d.type === 'lamps' ? Math.round(d.duration - (rt.timeLeft ?? 0)) : d.type === 'follow' ? rt.data.i : rt.have;
    store.setUi({ counter: { label, have, need: rt.need, time: rt.timeLeft !== undefined && d.type !== 'lamps' ? Math.ceil(rt.timeLeft) : d.type === 'lamps' ? Math.ceil(rt.timeLeft ?? 0) : undefined } });
  }

  async finishChallenge(ok: boolean) {
    const rt = this.ch;
    if (!rt) return;
    this.ch = null;
    rt.objs.forEach((o) => o.destroy());
    rt.actors.forEach((a) => a.destroy());
    this.carrying?.destroy();
    this.carrying = undefined;
    this.interactables = this.interactables.filter((i) => !(rt.data.its ?? []).includes(i));
    store.setUi({ counter: null, hotcold: null });
    if (ok) {
      store.toast('Desafio concluído!', '🏆');
      this.busy = true;
      try {
        if (rt.step.scene?.length) await this.playScene(rt.step.scene);
        await this.completeStep(rt.step);
      } finally {
        this.busy = false;
      }
    } else {
      this.startedStep = '';
    }
  }

  async failChallenge(msg: string) {
    const rt = this.ch;
    if (!rt) return;
    sfx('error');
    this.busy = true;
    await store.dialog([{ who: 'narrador', text: msg }]);
    this.busy = false;
    const d = rt.def;
    if (d.type === 'collect') {
      this.spawnCollect(rt);
      rt.timeLeft = d.time;
    } else if (d.type === 'crowd') {
      const st = this.w(d.start);
      this.player.teleport(st.x, st.y);
      rt.timeLeft = d.time;
    } else if (d.type === 'lamps') {
      rt.timeLeft = d.duration;
      rt.data.lamps.forEach((l: any) => { l.fuel = 6 + Math.random() * 6; l.spr.setFrame(0); });
    } else if (d.type === 'waypoints') {
      rt.have = 0;
      rt.timeLeft = d.time;
      rt.data.cairns.forEach((c: any) => c.spr.setFrame(0));
    }
    this.updateCounter();
  }

  tickChallenge(dt: number) {
    const rt = this.ch;
    if (!rt || this.busy || store.blocking) return;
    const d = rt.def;
    const px = this.player.x, py = this.player.y;
    let dirty = false;
    if (rt.timeLeft !== undefined) {
      const before = Math.ceil(rt.timeLeft);
      rt.timeLeft -= dt;
      if (Math.ceil(rt.timeLeft) !== before) dirty = true;
    }
    switch (d.type) {
      case 'collect':
        for (const it of rt.data.items) {
          if (!it.taken && Phaser.Math.Distance.Between(px, py - 10, it.x, it.y) < 30) {
            it.taken = true;
            it.img.destroy();
            it.glow.destroy();
            rt.have++;
            sfx('item');
            dirty = true;
          }
        }
        if (rt.have >= rt.need) return void this.finishChallenge(true);
        if (rt.timeLeft !== undefined && rt.timeLeft <= 0) return void this.failChallenge('O tempo acabou! Respire fundo e tente outra vez.');
        break;
      case 'crowd': {
        const [ax, ay, aw, ah] = rt.data.area;
        for (const a of rt.actors) {
          if (Math.random() < 0.02) {
            const ang = Math.random() * Math.PI * 2;
            (a.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(Math.cos(ang) * 40, Math.sin(ang) * 40);
          }
          const b = a.sprite.body as Phaser.Physics.Arcade.Body;
          const tx = Phaser.Math.Clamp(a.x, (ax) * this.cellW, (ax + aw) * this.cellW);
          const ty = Phaser.Math.Clamp(a.y, (ay) * this.cellW, (ay + ah) * this.cellW);
          if (tx !== a.x || ty !== a.y) b.setVelocity((tx - a.x) * 2, (ty - a.y) * 2);
          a.walk(b.velocity.x, b.velocity.y);
        }
        const t = this.w(d.target);
        if (Phaser.Math.Distance.Between(px, py, t.x, t.y) < this.cellW * 1.3) { rt.have = 1; return void this.finishChallenge(true); }
        if (rt.timeLeft !== undefined && rt.timeLeft <= 0) return void this.failChallenge('A multidão era grande demais desta vez. Tente encontrar outro caminho entre as pessoas.');
        break;
      }
      case 'lamps': {
        let out = 0;
        for (const l of rt.data.lamps) {
          l.fuel -= dt * (0.7 + Math.random() * 0.6) * (rt.data.help ? 0.7 : 1);
          if (l.fuel <= 0) { l.fuel = 0; l.spr.setFrame(1); out++; }
          else if (l.fuel < 3) l.spr.setAlpha(0.6 + Math.sin(this.time.now / 60) * 0.3);
          else l.spr.setAlpha(1);
        }
        if (out >= Math.ceil(rt.data.lamps.length / 2)) return void this.failChallenge('Muitas lâmpadas se apagaram. Vigiar é estar atento — tente novamente!');
        if ((rt.timeLeft ?? 0) <= 0) return void this.finishChallenge(true);
        break;
      }
      case 'hotcold': {
        const t = this.w(d.target);
        const dist = Phaser.Math.Distance.Between(px, py, t.x, t.y);
        const v = Phaser.Math.Clamp(1 - dist / (this.cellW * 30), 0, 1);
        if (Math.abs((store.ui.hotcold ?? 0) - v) > 0.04) store.setUi({ hotcold: v });
        if (this.time.now > rt.data.next) {
          rt.data.next = this.time.now + 3200;
          if (dist < this.cellW * 14) {
            const txt = this.add.text(t.x, t.y - 70, d.call, {
              fontFamily: '"EB Garamond"', fontSize: '13px', color: '#fff6dc', stroke: '#2a1a10', strokeThickness: 4, resolution: 3,
            }).setOrigin(0.5).setDepth(9200).setAlpha(Phaser.Math.Clamp(1.2 - dist / (this.cellW * 14), 0.25, 1));
            this.tweens.add({ targets: txt, y: '-=16', alpha: 0, duration: 2600, onComplete: () => txt.destroy() });
          }
        }
        break;
      }
      case 'waypoints': {
        const c = rt.data.cairns[rt.have];
        if (c && Phaser.Math.Distance.Between(px, py, c.p.x, c.p.y) < this.cellW * 1.2) {
          c.spr.setFrame(1);
          rt.have++;
          sfx('chime');
          dirty = true;
          if (rt.have >= rt.need) return void this.finishChallenge(true);
        }
        if ((rt.timeLeft ?? 1) <= 0) return void this.failChallenge('O caminho é longo. Recomece a subida com calma, mas sem parar.');
        break;
      }
      case 'follow': {
        const a = this.npcs.get(d.npc);
        if (!a) break;
        const close = Phaser.Math.Distance.Between(px, py, a.x, a.y) < d.radius * this.cellW;
        if (!a.target && rt.data.i < d.path.length) {
          if (close) {
            const p = this.w(d.path[rt.data.i]);
            a.moveTo(p.x, p.y, 34).then(() => { rt.data.i++; this.updateCounter(); });
          } else if (!rt.data.warned) {
            rt.data.warned = true;
            store.toast(`Fique perto de ${a.name}`, '👣');
          }
        } else if (a.target && !close) {
          a.target = null;
          a.walk(0, 0);
        }
        if (rt.data.i >= d.path.length) return void this.finishChallenge(true);
        break;
      }
    }
    if (this.carrying) this.carrying.setPosition(px, py - 62);
    if (dirty) this.updateCounter();
  }

  // ---------------- MENSAGEM DO CAPÍTULO ----------------
  spawnMessageScroll() {
    if (this.messageScroll) return;
    const at = this.def.messageAt ? this.w(this.def.messageAt) : { x: this.player.x + 40, y: this.player.y + 10 };
    const img = this.add.image(at.x, at.y, 'scroll').setScale(MS * 1.8).setDepth(at.y);
    this.tweens.add({ targets: img, y: at.y - 8, yoyo: true, repeat: -1, duration: 1000, ease: 'Sine.inOut' });
    const glow = this.add.image(at.x, at.y, 'light').setScale(0.9).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd36a).setDepth(at.y - 1);
    this.tweens.add({ targets: glow, scale: 1.1, alpha: 0.25, yoyo: true, repeat: -1, duration: 1200 });
    this.glows.push({ x: at.x, y: at.y, r: 140 });
    this.messageScroll = img;
    this.interactables.push({
      x: at.x, y: at.y, r: 48, label: 'Abrir a Mensagem do Capítulo',
      act: async () => {
        const miss = this.def.scrolls.length - this.prog.scrolls.length;
        if (miss > 0) {
          this.busy = true;
          await store.dialog([{ who: 'narrador', text: `Ainda faltam ${miss} registro(s) bíblico(s) para completar o pergaminho deste capítulo. Procure os pergaminhos brilhantes pelo mapa (veja no mapa — tecla M).` }]);
          this.busy = false;
          return;
        }
        store.setUi({ message: true });
      },
    });
  }

  afterMessage() {
    // chamado ao fechar a mensagem; nada a fazer além de atualizar marcador
  }

  // ---------------- CUTSCENES ----------------
  async playScene(actions: SceneAction[]) {
    store.setUi({ cutscene: true });
    const cam = this.cameras.main;
    try {
      for (const a of actions) {
        switch (a.t) {
          case 'say': await store.dialog([{ who: a.who, text: a.text, ref: a.ref }]); break;
          case 'narr': await store.dialog([{ who: 'narrador', text: a.text, ref: a.ref }]); break;
          case 'move': {
            const actor = a.id === 'marcos' ? this.player : this.npcs.get(a.id);
            if (!actor) break;
            if (actor.hidden) actor.setVisible(true);
            const p = this.w(a.to);
            const pr = actor.moveTo(p.x, p.y, a.speed ?? 55);
            if (a.wait !== false) await Promise.race([pr, this.delay(9000)]);
            break;
          }
          case 'cam': {
            if (a.to === 'player') {
              cam.pan(this.player.x, this.player.y, a.ms ?? 700, 'Sine.easeInOut');
              await this.delay(a.ms ?? 700);
              cam.startFollow(this.player.sprite, true, 0.12, 0.12);
            } else {
              cam.stopFollow();
              const p = this.w(a.to);
              cam.pan(p.x, p.y, a.ms ?? 900, 'Sine.easeInOut');
              await this.delay(a.ms ?? 900);
            }
            break;
          }
          case 'fx': await this.fx(a.name, a.on); break;
          case 'show': {
            this.forcedVisible.set(a.id, true);
            const ac = this.npcs.get(a.id);
            if (ac) {
              if (a.at) { const p = this.w(a.at); ac.teleport(p.x, p.y); }
              ac.setVisible(true);
            }
            break;
          }
          case 'hide': {
            this.forcedVisible.set(a.id, false);
            this.npcs.get(a.id)?.setVisible(false);
            break;
          }
          case 'face': {
            const ac = a.id === 'marcos' ? this.player : this.npcs.get(a.id);
            ac?.face(a.dir);
            break;
          }
          case 'wait': await this.delay(a.ms); break;
          case 'pose': this.pose(a.pose); await this.delay(600); break;
        }
      }
    } finally {
      cam.startFollow(this.player.sprite, true, 0.12, 0.12);
      store.setUi({ cutscene: false });
    }
  }

  delay(ms: number) {
    return new Promise<void>((r) => this.time.delayedCall(ms, r));
  }

  async fx(name: FxName, on = true) {
    const cam = this.cameras.main;
    const jesus = this.npcs.get('jesus');
    const focus = jesus && !jesus.hidden ? jesus : this.player;
    switch (name) {
      case 'flash': cam.flash(900, 255, 250, 225); sfx('chime'); await this.delay(500); break;
      case 'shake': cam.shake(700, 0.006); await this.delay(700); break;
      case 'dove': {
        const d = this.add.image(focus.x + 120, focus.y - 260, 'dove').setScale(3).setDepth(9300);
        const glow = this.add.image(focus.x, focus.y - 40, 'light').setScale(0.1).setAlpha(0.8).setBlendMode(Phaser.BlendModes.ADD).setDepth(9299).setTint(0xfff6d0);
        sfx('chime');
        this.tweens.add({ targets: glow, scale: 2.2, alpha: 0, duration: 2600 });
        await new Promise<void>((res) => this.tweens.add({ targets: d, x: focus.x, y: focus.y - 70, duration: 2200, ease: 'Sine.out', onComplete: () => res() }));
        this.tweens.add({ targets: d, alpha: 0, duration: 1200, delay: 800, onComplete: () => { d.destroy(); glow.destroy(); } });
        break;
      }
      case 'rain':
      case 'storm': {
        if (on) {
          this.rain?.destroy();
          this.rain = this.add.particles(0, 0, 'raindrop', {
            x: { min: -this.scale.width, max: this.scale.width * 2 }, y: -this.scale.height * 0.6,
            speedY: { min: 380, max: 520 }, speedX: { min: -120, max: -60 }, lifespan: 1400, scale: MS, alpha: 0.7, frequency: name === 'storm' ? 6 : 18, quantity: 2,
          }).setScrollFactor(0).setDepth(9500);
          if (name === 'storm') {
            this.setAmbience('storm');
            sfx('thunder');
            cam.shake(1200, 0.008);
            cam.flash(300, 220, 230, 255);
            await this.delay(800);
          }
        } else {
          this.rain?.destroy();
          this.rain = undefined;
        }
        break;
      }
      case 'calm': {
        this.rain?.destroy();
        this.rain = undefined;
        this.setAmbience(this.def.map.ambience === 'storm' ? 'day' : this.def.map.ambience);
        cam.flash(800, 255, 255, 240);
        sfx('chime');
        await this.delay(600);
        break;
      }
      case 'dark': this.tweenLight(0.82, 0x140806); await this.delay(1200); break;
      case 'light': this.setAmbience(this.def.map.ambience); await this.delay(600); break;
      case 'night': this.setAmbience('night'); await this.delay(600); break;
      case 'dawn': this.setAmbience('dawn'); cam.flash(1500, 255, 220, 160); await this.delay(900); break;
      case 'glow': {
        const g = this.add.image(focus.x, focus.y - 30, 'light').setScale(0.2).setAlpha(1).setBlendMode(Phaser.BlendModes.ADD).setDepth(9300).setTint(0xffffff);
        sfx('chime');
        focus.sprite.setTintFill(0xffffff);
        this.tweens.add({ targets: g, scale: 4, duration: 1800, ease: 'Sine.out' });
        await this.delay(2400);
        this.tweens.add({ targets: g, alpha: 0, duration: 1500, onComplete: () => g.destroy() });
        focus.sprite.clearTint();
        break;
      }
      case 'crowd': {
        for (let i = 0; i < 12; i++) {
          const lk = LOOKS[CROWD_LOOKS[i % CROWD_LOOKS.length]];
          const a = new Actor(this, 'ex' + i, 'Povo', lk, focus.x + (Math.random() - 0.5) * 300, focus.y + 40 + Math.random() * 120);
          a.faceTo(focus.x, focus.y);
          this.extras.push(a);
        }
        break;
      }
      case 'stone': {
        const st = this.children.getByName('tombstone') as Phaser.GameObjects.Image | null;
        if (st) {
          sfx('thunder');
          cam.shake(600, 0.004);
          await new Promise<void>((res) => this.tweens.add({ targets: st, x: st.x + 60, angle: 90, duration: 1600, ease: 'Sine.out', onComplete: () => res() }));
        }
        break;
      }
      case 'tear': cam.shake(1400, 0.01); sfx('thunder'); await this.delay(1400); break;
      case 'birds': {
        for (let i = 0; i < 8; i++) {
          const b = this.add.image(cam.worldView.x - 20, cam.worldView.y + 40 + Math.random() * 120, 'bird').setScale(2).setDepth(9400);
          this.tweens.add({ targets: b, x: cam.worldView.right + 40, y: b.y - 60, duration: 5000 + Math.random() * 3000, delay: i * 250, onComplete: () => b.destroy() });
        }
        break;
      }
      case 'sparkle': {
        const e = this.add.particles(focus.x, focus.y - 30, 'dot', {
          speed: { min: 20, max: 90 }, lifespan: 1200, scale: { start: 2, end: 0 }, tint: [0xfff2b0, 0xffffff, 0xffd36a], quantity: 40, emitting: false,
        }).setDepth(9300);
        e.explode(40);
        sfx('chime');
        this.time.delayedCall(1500, () => e.destroy());
        await this.delay(600);
        break;
      }
    }
  }

  pose(p: 'pray' | 'write' | 'idle') {
    const s = this.player.sprite;
    if (p === 'pray') {
      this.player.face('up');
      this.tweens.add({ targets: s, scaleY: 0.86, duration: 300, yoyo: true, hold: 1600 });
      const g = this.add.image(this.player.x, this.player.y - 30, 'light').setScale(0.3).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setTint(0xfff0c0).setDepth(9000);
      this.tweens.add({ targets: g, alpha: 0.5, scale: 1, yoyo: true, duration: 1100, onComplete: () => g.destroy() });
      sfx('pray');
    } else if (p === 'write') {
      this.player.face('down');
      const t = this.add.text(this.player.x + 12, this.player.y - 70, '✍', { fontSize: '16px' }).setDepth(9200);
      this.tweens.add({ targets: t, y: '-=10', alpha: 0, duration: 1300, onComplete: () => t.destroy() });
    }
  }

  async pray() {
    if (this.busy || store.blocking) return;
    this.pose('pray');
    unlockAchievement('pray');
  }

  // ---------------- ILUMINAÇÃO E AMBIENTE ----------------
  setupLighting() {
    this.light = this.add.renderTexture(0, 0, this.worldW, this.worldH).setOrigin(0).setDepth(9000);
    this.overlay = this.add.rectangle(0, 0, this.worldW, this.worldH, 0xffffff, 0).setOrigin(0).setDepth(8990);
    this.setAmbience(this.def.map.ambience);
  }

  setAmbience(a: string) {
    const conf: Record<string, [number, number, number, number]> = {
      // [alpha da escuridão, cor, alpha do filtro, cor do filtro]
      day: [0, 0x000000, 0.06, 0xffd890],
      dusk: [0.35, 0x2a1020, 0.16, 0xff9a50],
      night: [0.72, 0x060a22, 0, 0],
      dark: [0.62, 0x140806, 0.12, 0x6a2010],
      dawn: [0.12, 0x2a1630, 0.2, 0xffc070],
      storm: [0.5, 0x101820, 0.1, 0x6080a0],
    };
    const [la, lc, oa, oc] = conf[a] ?? conf.day;
    this.tweenLight(la, lc);
    this.overlay.setFillStyle(oc, oa);
  }

  tweenLight(alpha: number, color: number) {
    this.lightColor = color;
    this.tweens.addCounter({ from: this.lightAlpha, to: alpha, duration: 1200, onUpdate: (t) => { this.lightAlpha = t.getValue() ?? alpha; } });
  }

  brush?: Phaser.GameObjects.Image;
  renderLight() {
    if (!this.light) return;
    if (this.lightAlpha < 0.01) {
      this.light.setVisible(false);
      return;
    }
    const cam = this.cameras.main;
    this.light.setVisible(true);
    const v = cam.worldView;
    this.light.clear();
    this.light.fill(this.lightColor, this.lightAlpha, v.x - 50, v.y - 50, v.width + 100, v.height + 100);
    if (!this.brush) this.brush = this.make.image({ key: 'light', add: false });
    const pl = this.brush;
    const stamp = (x: number, y: number, r: number) => {
      pl.setScale((r * 2) / 128).setPosition(x, y);
      this.light!.erase(pl);
    };
    stamp(this.player.x, this.player.y - 20, 120);
    for (const l of this.glows) {
      if (l.on && !l.on()) continue;
      if (l.x < v.x - 200 || l.x > v.right + 200 || l.y < v.y - 200 || l.y > v.bottom + 200) continue;
      const flick = 1 + Math.sin(this.time.now / 90 + l.x) * 0.04;
      stamp(l.x, l.y, l.r * flick);
    }
  }

  setupAmbient() {
    const amb = this.def.map.ambience;
    const cam = this.cameras.main;
    if (amb === 'night' || amb === 'dark') {
      // vaga-lumes
      this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: this.worldW }, y: { min: 0, max: this.worldH }, lifespan: 4000, speed: { min: 5, max: 15 },
        alpha: { start: 0, end: 1, ease: 'Sine.inOut' }, scale: 1.2, tint: 0xfff2a0, frequency: 120, blendMode: 'ADD',
      }).setDepth(9010);
    } else {
      // folhas e poeira ao vento
      this.add.particles(0, 0, amb === 'dawn' ? 'dot' : 'leaf', {
        x: { min: -this.scale.width, max: this.scale.width * 2 }, y: { min: -this.scale.height, max: this.scale.height * 2 },
        speedX: { min: 15, max: 40 }, speedY: { min: 5, max: 20 }, lifespan: 6000, rotate: { min: 0, max: 360 },
        alpha: { start: 0.8, end: 0 }, frequency: 500, scale: amb === 'dawn' ? 1 : 1.5, tint: amb === 'dawn' ? 0xffe0a0 : 0xffffff,
      }).setScrollFactor(0).setDepth(9400);
    }
    if (amb === 'dawn' || amb === 'day') {
      this.time.addEvent({ delay: 14000, loop: true, callback: () => !this.busy && this.fx('birds') });
    }
    if (amb === 'storm') this.fx('rain');
    void cam;
  }

  // ---------------- ENTRADA ----------------
  setupInput() {
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = kb.addKeys('W,A,S,D,E,R') as any;
    kb.on('keydown-E', () => this.tryInteract());
    kb.on('keydown-R', () => this.pray());
    kb.removeCapture('SPACE');
  }

  tryInteract() {
    if (this.busy || store.blocking) return;
    if (this.nearest) {
      sfx('select');
      this.player.walk(0, 0);
      this.nearest.act();
    }
  }

  update(time: number, delta: number) {
    const dt = delta / 1000;
    const s = store.save;
    if (!s) return;
    // movimento
    const block = this.busy || store.blocking;
    let vx = 0, vy = 0;
    if (!block) {
      const k = this.keys, c = this.cursors;
      if (k.A.isDown || c.left.isDown) vx -= 1;
      if (k.D.isDown || c.right.isDown) vx += 1;
      if (k.W.isDown || c.up.isDown) vy -= 1;
      if (k.S.isDown || c.down.isDown) vy += 1;
      const t = store.ui.touch;
      if (Math.abs(t.x) > 0.15 || Math.abs(t.y) > 0.15) { vx = t.x; vy = t.y; }
      const len = Math.hypot(vx, vy);
      if (len > 1) { vx /= len; vy /= len; }
    }
    if (!this.player.target) this.player.walk(vx * 105, vy * 105);
    this.player.update(time);
    for (const a of this.npcs.values()) a.update(time);
    for (const a of this.extras) a.update(time);
    if (this.ch) for (const a of this.ch.actors) a.update(time);

    // interações próximas
    let best: Interactable | null = null;
    let bd = Infinity;
    for (const it of this.interactables) {
      if (it.enabled && !it.enabled()) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y - 10, it.x, it.y - 10);
      if (d < it.r && d < bd) { bd = d; best = it; }
    }
    this.nearest = block ? null : best;
    const hint = this.nearest?.label ?? '';
    if (hint !== this.lastHint) {
      this.lastHint = hint;
      store.setUi({ interactHint: hint || null });
    }
    // rótulos de nomes próximos e emotes
    const cur = this.currentStep();
    for (const [id, a] of this.npcs) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
      a.setLabel(d < 110);
      const n = this.def.npcs.find((x) => x.id === id);
      const sideOpen = this.def.side.some((q) => q.giver === id && !this.prog.side.includes(q.id));
      const trialOpen = this.ch?.def.type === 'trial' && this.ch.def.npcs.includes(id) && !this.ch.data.done.has(id);
      if (trialOpen) a.setEmote('?', '#9ad8ff');
      else if (cur?.npc === id) a.setEmote(null);
      else if (sideOpen) a.setEmote('!', '#ffd34a');
      else if (n?.gives && !s.inventory.includes(n.gives)) a.setEmote('✦', '#c9f0a0');
      else if (n?.uses?.some((u) => s.inventory.includes(u.item) && !(s.usedItems ?? []).includes(`${this.def.n}:${id}:${u.item}`))) a.setEmote('🎒', '#ffffff');
      else a.setEmote(null);
    }

    this.checkZones();
    this.updateQuest();
    this.tickChallenge(dt);

    // marcador de objetivo
    const obj = this.objectivePos();
    if (obj) {
      this.marker.setVisible(true).setX(obj.x);
      if (Math.abs(this.marker.getData('by') - obj.y) > 2 || this.marker.getData('by') === undefined) {
        this.marker.setData('by', obj.y);
        this.marker.y = obj.y - 18;
      }
      const st = cur;
      const showRing = !!st && (st.kind === 'reach' || st.kind === 'scene' || (st.kind === 'challenge' && !st.npc && !this.ch)) && !!st.at;
      this.ring.setVisible(showRing);
      if (showRing && st?.at) { const p = this.w(st.at); this.ring.setPosition(p.x, p.y); }
    } else {
      this.marker.setVisible(false);
      this.ring.setVisible(false);
    }

    this.renderLight();

    // tempo de jogo, autosave e informações para o minimapa
    s.playMs += delta;
    this.saveTimer += delta;
    if (this.saveTimer > 8000) { this.saveTimer = 0; store.persist(); }
    this.uiTimer += delta;
    if (this.uiTimer > 200) {
      this.uiTimer = 0;
      worldInfo.player = { x: this.player.x, y: this.player.y };
      worldInfo.objective = obj;
      worldInfo.npcs = [...this.npcs.values()].filter((a) => !a.hidden).map((a) => ({ x: a.x, y: a.y, important: a.id === cur?.npc }));
      worldInfo.scrolls = [...this.scrollSprites.values()].filter((i) => i.active).map((i) => ({ x: i.x, y: i.y }));
      bus.emit('world-tick');
    }
  }
}

export type { Look };
