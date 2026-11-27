import Phaser from 'phaser';
import { WorldScene } from './scenes/WorldScene';
import { loadBase } from './gfx/recolor';

let game: Phaser.Game | null = null;

export async function startGame(parent: HTMLElement, chapter: number) {
  await loadBase();
  if (document.fonts) {
    try { await document.fonts.load('10px "Press Start 2P"'); } catch { /* fonte opcional */ }
  }
  stopGame();
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1a120c',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    input: { keyboard: true, touch: true },
    scene: [],
  });
  game.scene.add('world', WorldScene, true, { chapter });
  (window as any).__game = game;
  return game;
}

export function restartChapter(chapter: number) {
  if (!game) return;
  const sc = game.scene.getScene('world');
  sc?.scene.restart({ chapter });
}

export function stopGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}
