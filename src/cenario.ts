// Página "Galileia — cenário animado": controles sobre o GalileiaAnim.
import { GalileiaAnim } from './game/gfx/galileiaAnim';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const cv = $<HTMLCanvasElement>('cv');
const ui = { playing: true, cycle: false, fps: 16 };
let anim: GalileiaAnim | null = null;

function syncUi() {
  if (!anim) return;
  $('play').textContent = ui.playing ? '❚❚ Pausar' : '▶ Animar';
  $('play').classList.toggle('on', ui.playing);
  const w = anim.wind, t = anim.tod;
  $<HTMLInputElement>('wind').value = String(w);
  $('windv').textContent = w < 0.15 ? 'Calmaria' : w < 0.7 ? 'Leve' : w < 1.3 ? 'Brisa' : w < 1.75 ? 'Forte' : 'Ventania';
  $<HTMLInputElement>('tod').value = String(t);
  $('todv').textContent = t < 0.2 ? 'Dia' : t < 0.4 ? 'Tarde' : t < 0.65 ? 'Entardecer' : t < 0.85 ? 'Crepúsculo' : 'Noite';
  $('cycle').classList.toggle('on', ui.cycle);
  $<HTMLSelectElement>('fps').value = String(ui.fps);
}

$('play').onclick = () => { ui.playing = !ui.playing; syncUi(); };
$<HTMLInputElement>('wind').oninput = (e) => { if (anim) anim.wind = +(e.target as HTMLInputElement).value; syncUi(); };
$<HTMLInputElement>('tod').oninput = (e) => { if (anim) anim.tod = +(e.target as HTMLInputElement).value; ui.cycle = false; syncUi(); };
$('cycle').onclick = () => { ui.cycle = !ui.cycle; syncUi(); };
$<HTMLSelectElement>('fps').onchange = (e) => { ui.fps = +(e.target as HTMLSelectElement).value; };
$('full').onclick = () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); };

addEventListener('keydown', (e) => {
  const tag = (e.target as HTMLElement).tagName;
  if (!anim || tag === 'INPUT' || tag === 'SELECT') return;
  if (e.code === 'Space') { ui.playing = !ui.playing; e.preventDefault(); }
  else if (e.key === 'ArrowRight') anim.wind = Math.min(2, +(anim.wind + 0.1).toFixed(2));
  else if (e.key === 'ArrowLeft') anim.wind = Math.max(0, +(anim.wind - 0.1).toFixed(2));
  else if (e.key === '1') { anim.tod = 0; ui.cycle = false; }
  else if (e.key === '2') { anim.tod = 0.5; ui.cycle = false; }
  else if (e.key === '3') { anim.tod = 1; ui.cycle = false; }
  else if (e.key === 'c' || e.key === 'C') ui.cycle = !ui.cycle;
  else if (e.key === 'f' || e.key === 'F') ui.fps = ui.fps === 12 ? 16 : ui.fps === 16 ? 24 : 12;
  else return;
  syncUi();
});

// quadros discretos com FPS travado (cadência de RPG 16-bit)
let last = 0, acc = 0;
function loop(now: number) {
  requestAnimationFrame(loop);
  if (!anim) return;
  const dt = 1 / ui.fps;
  acc += Math.min(0.25, (now - (last || now)) / 1000);
  last = now;
  if (acc < dt) return;
  acc %= dt;
  if (ui.playing) {
    anim.step(dt);
    if (ui.cycle) { anim.tod = 0.5 - 0.5 * Math.cos(anim.t * ((2 * Math.PI) / 60)); syncUi(); }
  }
  anim.render();
}

const img = new Image();
img.onload = () => {
  anim = new GalileiaAnim(img, cv);
  syncUi();
  anim.render();
  (window as any).__anim = anim;
};
img.src = './assets/maps/galileia.webp';
requestAnimationFrame(loop);
