/* Anytime RRT*, the planner from the Nav2 research, drawn on a 2D canvas.
   Grows a tree, rewires it as it samples, and costs edges near the person 4x so routes give them room. */
import { RM } from "../reduced-motion.js";
import { throttled } from "../frame-budget.js";

export function demoRRT(cv, nEl, pEl) {
  const g = cv.getContext("2d"), MAX = 1100, STEP = 18, NEAR = 42;
  const walls = [[0.3, 0, 0.35, 0.58], [0.62, 0.42, 0.67, 1]], person = [0.48, 0.74];
  let w = 0, h = 0, obst = [], ppl = [], start, goal, X, Y, P, C, n = 0, best = null, fr = 0, vis = false;
  const size = () => {
    const d = Math.min(devicePixelRatio, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; g.setTransform(d, 0, 0, d, 0, 0);
    obst = walls.map(([a, b, c, e]) => [a * w, b * h, c * w, e * h]); ppl = [[person[0] * w, person[1] * h]];
    start = [0.08 * w, 0.84 * h]; if (!goal) goal = [0.9 * w, 0.16 * h]; reset();
  };
  const reset = () => { X = new Float32Array(MAX); Y = new Float32Array(MAX); P = new Int32Array(MAX); C = new Float32Array(MAX); X[0] = start[0]; Y[0] = start[1]; P[0] = -1; n = 1; best = null; };
  const hit = (x, y) => obst.some((o) => x > o[0] - 6 && x < o[2] + 6 && y > o[1] - 6 && y < o[3] + 6) || ppl.some((p) => (x - p[0]) ** 2 + (y - p[1]) ** 2 < 144);
  const free = (x0, y0, x1, y1) => { const s = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
    for (let i = 0; i <= s; i++) { const x = x0 + (x1 - x0) * i / s, y = y0 + (y1 - y0) * i / s; if (x < 3 || y < 3 || x > w - 3 || y > h - 3 || hit(x, y)) return false; } return true; };
  /* semantic cost: edges near the person cost up to 4x */
  const cost = (x0, y0, x1, y1) => { const d = Math.hypot((x0 + x1) / 2 - ppl[0][0], (y0 + y1) / 2 - ppl[0][1]); return Math.hypot(x1 - x0, y1 - y0) * (d < 60 ? 1 + 3 * (1 - d / 60) : 1); };
  const grow = (it) => {
    for (let t = 0; t < it && n < MAX; t++) {
      const g8 = Math.random() < 0.08, sx = g8 ? goal[0] : Math.random() * w, sy = g8 ? goal[1] : Math.random() * h;
      let ni = 0, nd = Infinity; for (let i = 0; i < n; i++) { const d = (X[i] - sx) ** 2 + (Y[i] - sy) ** 2; if (d < nd) { nd = d; ni = i; } }
      nd = Math.sqrt(nd); if (nd < 1) continue;
      const f = Math.min(1, STEP / nd), nx = X[ni] + (sx - X[ni]) * f, ny = Y[ni] + (sy - Y[ni]) * f;
      if (!free(X[ni], Y[ni], nx, ny)) continue;
      const near = []; for (let i = 0; i < n; i++) if ((X[i] - nx) ** 2 + (Y[i] - ny) ** 2 < NEAR * NEAR) near.push(i);
      let bp = ni, bc = C[ni] + cost(X[ni], Y[ni], nx, ny);
      for (const i of near) { const c = C[i] + cost(X[i], Y[i], nx, ny); if (c < bc && free(X[i], Y[i], nx, ny)) { bc = c; bp = i; } }
      const j = n++; X[j] = nx; Y[j] = ny; P[j] = bp; C[j] = bc;
      /* ponytail: rewiring skips pushing cost updates down the subtree; the drawn path is re-measured exactly */
      for (const i of near) { const c = bc + cost(nx, ny, X[i], Y[i]); if (c < C[i] && free(nx, ny, X[i], Y[i])) { P[i] = j; C[i] = c; } }
    }
  };
  const connect = () => {
    let bi = -1, bc = Infinity;
    for (let i = 0; i < n; i++) { const d = Math.hypot(X[i] - goal[0], Y[i] - goal[1]); if (d < 30 && C[i] + d < bc && free(X[i], Y[i], goal[0], goal[1])) { bc = C[i] + d; bi = i; } }
    if (bi < 0) return; const path = [goal]; for (let i = bi; i >= 0; i = P[i]) path.push([X[i], Y[i]]);
    let len = 0; for (let q = 1; q < path.length; q++) len += Math.hypot(path[q][0] - path[q - 1][0], path[q][1] - path[q - 1][1]); best = { path, len };
  };
  const draw = () => {
    g.clearRect(0, 0, w, h); g.fillStyle = "#18222e";
    obst.forEach((o) => g.fillRect(o[0], o[1], o[2] - o[0], o[3] - o[1]));
    g.lineWidth = 1; g.strokeStyle = "rgba(24,34,46,.22)"; g.beginPath(); for (let i = 1; i < n; i++) { g.moveTo(X[P[i]], Y[P[i]]); g.lineTo(X[i], Y[i]); } g.stroke();
    g.setLineDash([3, 4]); g.strokeStyle = "rgba(24,34,46,.35)"; g.beginPath(); g.arc(ppl[0][0], ppl[0][1], 60, 0, 7); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(ppl[0][0], ppl[0][1], 6, 0, 7); g.fill(); g.font = "500 10px 'Geist Mono', monospace"; g.fillText("person", ppl[0][0] + 10, ppl[0][1] + 4);
    g.beginPath(); g.arc(start[0], start[1], 4.5, 0, 7); g.fill();
    if (best) { g.strokeStyle = "#e0482a"; g.lineWidth = 2.6; g.lineJoin = "round"; g.beginPath(); best.path.forEach(([x, y], q) => q ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
    g.strokeStyle = "#e0482a"; g.lineWidth = 2.5; g.beginPath(); g.arc(goal[0], goal[1], 7, 0, 7); g.stroke();
    nEl.textContent = "nodes " + n.toLocaleString("en-US");
    pEl.textContent = best ? ((best.len / Math.hypot(goal[0] - start[0], goal[1] - start[1]) - 1) * 100).toFixed(1) + "% over straight line" : "searching";
  };
  const engine = throttled(() => { grow(10); if (++fr % 5 === 0 || !best) connect(); draw(); if (n >= MAX) engine.stop(); });
  const run = () => { if (RM) { grow(MAX); connect(); draw(); } else engine.start(); };
  const onClick = (e) => { const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; if (hit(x, y)) return; goal = [x, y]; reset(); run(); };
  cv.addEventListener("click", onClick);
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && n < MAX) run(); else engine.stop(); });
  document.fonts.ready.then(() => { size(); io.observe(cv); });
  return () => { engine.dispose(); io.disconnect(); cv.removeEventListener("click", onClick); };
}
