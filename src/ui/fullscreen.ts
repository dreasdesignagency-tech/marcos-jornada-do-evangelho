// Tela cheia e orientação horizontal ("deitado").

export const isTouchDevice = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/** Tela cheia + trava na horizontal, quando o navegador permitir. */
export async function enterLandscapeFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
    const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await o.lock?.('landscape');
  } catch { /* navegador não permite (ex.: iPhone): segue normal */ }
}

export function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else enterLandscapeFullscreen();
}
