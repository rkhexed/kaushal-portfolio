/* A small quadrotor swarm: four drones to four pads, projected in 3D onto a 2D canvas.
   Repulsion plus a tangential push, so they slide around the pillars instead of stalling. */
import { RM } from "../reduced-motion.js";

export function demoSwarm(root) {
  const cv = root.querySelector(".pf-swarm"), g = cv.getContext("2d"), read = root.querySelector("[data-sw]"), A = 4;
  const obsDef = [[-1.3, 0.5, 1.4, 0, 0.55, 0, 0.36, 1.9], [1.2, -0.9, 0, 1.6, 0.42, 1.7, 0.34, 1.5], [0.3, 2.0, 1.7, 0.3, 0.5, 3.1, 0.3, 2.3], [-0.4, -2.2, 1.2, 0.5, 0.38, 4.4, 0.3, 1.7]];
  const pads = [[-3.3, -3.3], [3.3, 3.3], [-3.3, 3.3], [3.3, -3.3]];
  let W = 0, H = 0, S = 1, t = 0, yaw = 0.7, N = 4, drones = [], reached = 0, hits = 0, raf = 0, vis = false, last = 0;
  const P = 0.6, sP = Math.sin(P), cP = Math.cos(P), rnd = (a, b) => a + Math.random() * (b - a);
  const obs = () => obsDef.map(([cx, cy, ax, ay, w, ph, r, h]) => ({ x: cx + ax * Math.sin(t * w + ph), y: cy + ay * Math.cos(t * w + ph), r, h }));
  const goal = () => { const o = obs(); for (let i = 0; i < 60; i++) { const q = [rnd(-A + 0.6, A - 0.6), rnd(-A + 0.6, A - 0.6)]; if (o.every((b) => Math.hypot(q[0] - b.x, q[1] - b.y) > b.r + 1)) return q; } return [0, 0]; };
  const make = (i) => ({ i, x: pads[i][0], y: pads[i][1], z: 0.05, vx: 0, vy: 0, yaw: 0, g: goal(), cd: 0, trail: [] });
  const setN = (n) => { N = n; while (drones.length < N) drones.push(make(drones.length)); drones.length = N;
    root.querySelectorAll("[data-n]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.n === N))); };
  const size = () => { const d = Math.min(devicePixelRatio, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); S = Math.min(W / 9.2, H / 6.4); };
  /* perspective camera slowly orbiting the arena */
  const pr = (x, y, z) => { const c = Math.cos(yaw), s = Math.sin(yaw), xr = x * c - y * s, yr = x * s + y * c, f = 10 / (10 + yr * cP);
    return [W / 2 + xr * S * f, H * 0.56 - yr * S * f * sP - z * S * f * cP, f, yr]; };
  const step = (dt) => {
    t += dt; yaw += dt * 0.07; const o = obs();
    for (const d of drones) {
      let dx = d.g[0] - d.x, dy = d.g[1] - d.y; const dist = Math.hypot(dx, dy) || 1, sp = Math.min(1.5, dist * 1.3);
      let fx = dx / dist * sp, fy = dy / dist * sp;
      /* repulsion plus a sideways push, so drones slide around pillars instead of stalling */
      const push = (px, py, clear, k) => { const hh = Math.hypot(px, py) || 1, dd = hh - clear; if (dd > 1) return; const m = Math.min(6, k * (1 / Math.max(dd, 0.05) - 1));
        fx += (px / hh) * m - (py / hh) * m * 0.6; fy += (py / hh) * m + (px / hh) * m * 0.6; };
      for (const b of o) push(d.x - b.x, d.y - b.y, b.r + 0.2, 0.9);
      for (const e of drones) if (e !== d) push(d.x - e.x, d.y - e.y, 0.4, 0.5);
      const k = Math.min(1, dt * 3); d.vx += (fx - d.vx) * k; d.vy += (fy - d.vy) * k;
      const v = Math.hypot(d.vx, d.vy); if (v > 1.7) { d.vx *= 1.7 / v; d.vy *= 1.7 / v; }
      d.x = Math.max(-A, Math.min(A, d.x + d.vx * dt)); d.y = Math.max(-A, Math.min(A, d.y + d.vy * dt));
      d.z += (1.1 + 0.12 * Math.sin(t * 1.4 + d.i) - d.z) * Math.min(1, dt * 1.6);
      if (v > 0.1) d.yaw += Math.atan2(Math.sin(Math.atan2(d.vy, d.vx) - d.yaw), Math.cos(Math.atan2(d.vy, d.vx) - d.yaw)) * Math.min(1, dt * 4);
      d.cd = Math.max(0, d.cd - dt);
      if (!d.cd && o.some((b) => Math.hypot(d.x - b.x, d.y - b.y) < b.r + 0.16)) { hits++; d.cd = 1; }
      if (Math.hypot(d.g[0] - d.x, d.g[1] - d.y) < 0.3) { reached++; d.g = goal(); }
      d.trail.push([d.x, d.y, d.z]); if (d.trail.length > 40) d.trail.shift();
    }
  };
  const ell = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, 7); };
  const draw = () => {
    g.clearRect(0, 0, W, H);
    /* floor: the PyBullet-style checker plane */
    for (let i = -A; i < A; i++) for (let j = -A; j < A; j++) {
      const q = [pr(i, j, 0), pr(i + 1, j, 0), pr(i + 1, j + 1, 0), pr(i, j + 1, 0)];
      g.fillStyle = (i + j) & 1 ? "rgba(24,34,46,.07)" : "rgba(255,255,255,.55)"; g.beginPath(); q.forEach(([x, y], n) => (n ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
    }
    const o = obs();
    for (const d of drones) { const [gx, gy, f] = pr(d.g[0], d.g[1], 0), [sx, sy] = pr(d.x, d.y, 0);
      g.setLineDash([4, 4]); g.strokeStyle = "rgba(224,72,42,.45)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(gx, gy); g.stroke(); g.setLineDash([]);
      g.strokeStyle = "#e0482a"; g.lineWidth = 2; ell(gx, gy, 0.26 * S * f, 0.26 * S * f * sP); g.stroke();
      g.fillStyle = "#e0482a"; g.font = "600 10px 'Geist Mono', monospace"; g.fillText(d.i + 1, gx - 3, gy + 3.5); }
    const items = [...o.map((b) => ({ k: "o", b, yr: pr(b.x, b.y, 0)[3] })), ...drones.map((d) => ({ k: "d", d, yr: pr(d.x, d.y, 0)[3] }))].sort((a, b) => b.yr - a.yr);
    for (const it of items) {
      if (it.k === "o") { const b = it.b, [x0, y0, f] = pr(b.x, b.y, 0), [, y1] = pr(b.x, b.y, b.h), rx = b.r * S * f, ry = rx * sP;
        g.fillStyle = "rgba(24,34,46,.1)"; ell(x0, y0 + 2, rx * 1.15, ry * 1.15); g.fill();
        g.fillStyle = "rgba(24,34,46,.16)"; g.beginPath(); g.moveTo(x0 - rx, y0); g.lineTo(x0 - rx, y1); g.ellipse(x0, y1, rx, ry, 0, Math.PI, 0, true); g.lineTo(x0 + rx, y0); g.ellipse(x0, y0, rx, ry, 0, 0, Math.PI); g.fill();
        g.strokeStyle = "rgba(24,34,46,.6)"; g.lineWidth = 1.2; g.stroke(); g.fillStyle = "rgba(24,34,46,.28)"; ell(x0, y1, rx, ry); g.fill(); g.stroke(); continue; }
      const d = it.d, [cx, cy, f] = pr(d.x, d.y, d.z), [hx, hy] = pr(d.x, d.y, 0);
      g.fillStyle = "rgba(24,34,46,.14)"; ell(hx, hy, 0.3 * S * f, 0.3 * S * f * sP); g.fill();
      g.strokeStyle = "rgba(24,34,46,.18)"; g.lineWidth = 1; g.beginPath(); d.trail.forEach(([x, y, z], n) => { const [px, py] = pr(x, y, z); n ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
      const arms = [0.785, 2.356, 3.927, 5.498].map((a) => { const ax = d.x + Math.cos(d.yaw + a) * 0.2, ay = d.y + Math.sin(d.yaw + a) * 0.2; return pr(ax, ay, d.z); });
      g.strokeStyle = "#18222e"; g.lineWidth = 2.4 * f; arms.forEach(([x, y]) => { g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); });
      arms.forEach(([x, y], n) => { const rx = 0.1 * S * f, ry = rx * sP; g.fillStyle = "rgba(24,34,46,.1)"; ell(x, y, rx, ry); g.fill();
        g.strokeStyle = n < 2 ? "#e0482a" : "#18222e"; g.lineWidth = 1.3; g.stroke();
        const sa = t * 38 + n; g.beginPath(); g.moveTo(x - Math.cos(sa) * rx, y - Math.sin(sa) * ry); g.lineTo(x + Math.cos(sa) * rx, y + Math.sin(sa) * ry); g.stroke(); });
      g.fillStyle = "#18222e"; ell(cx, cy, 0.075 * S * f, 0.06 * S * f); g.fill();
    }
    read.textContent = `${N} drone${N > 1 ? "s" : ""} · ${reached} goals reached · ${hits} collisions`;
  };
  const frame = (now) => { const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; step(dt); draw(); raf = vis ? requestAnimationFrame(frame) : 0; };
  const onClick = (e) => { const b = e.target.closest("[data-n]"); if (b) { setN(+b.dataset.n); if (RM) draw(); } };
  root.querySelector(".pf-seg").addEventListener("click", onClick);
  const onResize = () => { size(); draw(); }; addEventListener("resize", onResize);
  setN(4);
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf && !RM) { last = 0; raf = requestAnimationFrame(frame); } });
  document.fonts.ready.then(() => { size(); if (RM) { for (let i = 0; i < 120; i++) step(1 / 30); } draw(); io.observe(cv); });
  return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", onResize); };
}
