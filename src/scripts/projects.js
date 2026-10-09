/* Project demos: the Pokémon Emerald videos with a view switch, and the [case]HACKS screenshot stepper.
   Both load only when they scroll into view, and both stop when they scroll out of it. */
import { RM } from "./reduced-motion.js";

/* two videos behind one switch; the inactive one is never fetched until it is asked for */
export function videoDemo(panel) {
  const vids = [...panel.querySelectorAll("video")];
  const caps = [...panel.querySelectorAll("[data-cap]")];
  const buttons = [...panel.querySelectorAll(".pf-switch button")];
  const play = panel.querySelector(".pf-stage-play");
  let view = "swarm", visible = false;

  const current = () => vids.find((v) => v.dataset.view === view);
  const load = (v) => { if (!v.src && v.dataset.src) v.src = v.dataset.src; };
  const sync = () => {
    vids.forEach((v) => { v.hidden = v.dataset.view !== view; if (v.hidden) v.pause(); });
    caps.forEach((c) => (c.hidden = c.dataset.cap !== view));
    buttons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === view)));
    const v = current();
    if (RM) { load(v); v.controls = true; return; }
    if (visible) { load(v); v.play().catch(() => {}); } else v.pause();
  };

  if (RM) play.hidden = false;
  play.addEventListener("click", () => { const v = current(); load(v); v.controls = true; v.play(); play.hidden = true; });
  panel.querySelector(".pf-switch").addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]"); if (!b || b.dataset.view === view) return;
    view = b.dataset.view; sync();
  });
  /* start fetching a little before the panel arrives, and never auto-fetch on a metered connection */
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) play.hidden = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !saveData; sync(); }, { threshold: 0.2, rootMargin: "250px 0px" });
  io.observe(panel);
  sync();
  return () => { io.disconnect(); vids.forEach((v) => v.pause()); };
}

/* one stage, two sets of screenshots, stepping on a timer with dots to jump */
export function shotsDemo(panel) {
  const shots = [...panel.querySelectorAll(".pf-shot")];
  const buttons = [...panel.querySelectorAll(".pf-switch button")];
  const dots = panel.querySelector(".pf-dots");
  const label = panel.querySelector("[data-shot-label]");
  const STEP = 4500;
  let view = "admin", i = 0, timer = 0, visible = false;

  const set = () => shots.filter((s) => s.dataset.view === view);
  const render = () => {
    const list = set();
    i = (i + list.length) % list.length;
    shots.forEach((s) => s.classList.remove("on"));
    list[i].classList.add("on");
    label.textContent = list[i].dataset.label;
    [...dots.children].forEach((d, n) => d.setAttribute("aria-selected", String(n === i)));
    buttons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === view)));
  };
  const buildDots = () => {
    dots.innerHTML = set().map((s, n) => `<button type="button" role="tab" aria-selected="${n === 0}" aria-label="${s.dataset.label}"></button>`).join("");
  };
  const tick = () => { i += 1; render(); };
  const run = () => { clearInterval(timer); if (visible && !RM) timer = setInterval(tick, STEP); };

  panel.querySelector(".pf-switch").addEventListener("click", (e) => {
    const b = e.target.closest("[data-view]"); if (!b || b.dataset.view === view) return;
    view = b.dataset.view; i = 0; buildDots(); render(); run();
  });
  dots.addEventListener("click", (e) => {
    const d = e.target.closest("button"); if (!d) return;
    i = [...dots.children].indexOf(d); render(); run();
  });
  panel.addEventListener("pointerenter", () => clearInterval(timer));
  panel.addEventListener("pointerleave", run);

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }, { threshold: 0.25 });
  io.observe(panel);
  buildDots(); render();
  return () => { clearInterval(timer); io.disconnect(); };
}
