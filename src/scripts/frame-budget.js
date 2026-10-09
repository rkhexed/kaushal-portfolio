/* The three research demos share the main thread, so each one draws at 30fps instead of 60
   and stops entirely when the tab is in the background. */
export function throttled(draw, fps = 30) {
  const step = 1000 / fps;
  let raf = 0, last = 0, on = false;
  const loop = (t) => { if (!on) return; raf = requestAnimationFrame(loop); if (t - last < step) return; last = t; draw(); };
  const start = () => { if (on || document.hidden) return; on = true; last = 0; raf = requestAnimationFrame(loop); };
  const stop = () => { on = false; cancelAnimationFrame(raf); };
  const visibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", visibility);
  return { start, stop, running: () => on, dispose: () => { stop(); document.removeEventListener("visibilitychange", visibility); } };
}
