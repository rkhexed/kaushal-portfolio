/* Scripted walkthrough of the five-agent email pipeline from the IEEE paper.
   The scores are fixed samples, not the live model. */
import { RM } from "../reduced-motion.js";

export function demoMail(root, emails) {
  const W8 = [0.4, 0.35, 0.25]; let timers = [];
  const show = (i) => {
    timers.forEach(clearTimeout); timers = [];
    const e = emails[i], s = [...e.s, e.s.reduce((a, v, j) => a + v * W8[j], 0)];
    root.querySelectorAll("[data-mail]").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.mail === i)));
    root.querySelector('[data-m="from"]').textContent = e.from; root.querySelector('[data-m="subj"]').textContent = e.subj;
    const v = root.querySelector("[data-verdict]"); v.textContent = ""; v.className = "";
    s.forEach((x, j) => { const bar = root.querySelector(`[data-a="${j}"]`), val = root.querySelector(`[data-av="${j}"]`);
      bar.style.width = "0%"; val.textContent = ""; bar.classList.toggle("hi", x >= 0.5);
      timers.push(setTimeout(() => { bar.style.width = `${x * 100}%`; val.textContent = x.toFixed(2); }, RM ? 0 : 120 + j * 320)); });
    timers.push(setTimeout(() => { const q = s[3] >= 0.5; v.textContent = q ? "Quarantined" : "Delivered"; v.className = q ? "q" : "ok"; }, RM ? 0 : 120 + 4 * 320));
  };
  const onClick = (e) => { const b = e.target.closest("[data-mail]"); if (b) show(+b.dataset.mail); };
  root.querySelector(".pf-picks").addEventListener("click", onClick);
  show(1);
  return () => timers.forEach(clearTimeout);
}
