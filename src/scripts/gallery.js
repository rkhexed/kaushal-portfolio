/* The photo-roll contact sheet: loupe on hover, click to develop a print.
   Not mounted today; the markup is commented out in index.astro. Kept as a module so it can be switched back on. */
import { gsap } from "gsap";
import { RM } from "./reduced-motion.js";

export function gallery(page, box, lenis) {
  const loupe = box.querySelector(".cs-loupe"), sheet = box.querySelector(".cs-sheet"), tray = box.querySelector(".cs-tray"), trayImg = tray.querySelector("img"), Z = 2.6, LR = 110;
  let opener = null, last = null;
  const open = (e) => {
    e.preventDefault(); opener = e.currentTarget; loadGalleryFonts(); box.hidden = false; box.scrollTop = 0;
    lenis && lenis.stop(); document.documentElement.style.overflow = "hidden";
    if (!RM) { gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "Out" });
      gsap.fromTo(box.querySelectorAll(".cs-frame"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "Out", stagger: 0.03, delay: 0.1 });
      gsap.fromTo(box.querySelectorAll(".cs-mark path"), { strokeDasharray: 400, strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 0.7, ease: "In", stagger: 0.15, delay: 0.8 }); }
    box.querySelector("[data-back]").focus();
  };
  const close = (e) => { e && e.preventDefault(); box.hidden = true; tray.hidden = true; document.documentElement.style.overflow = ""; lenis && lenis.start(); opener && opener.focus(); };
  const openers = [...page.querySelectorAll("[data-gallery]")];
  openers.forEach((a) => a.addEventListener("click", open));
  const onMove = (e) => {
    const fr = e.target.closest(".cs-img"); if (!fr) { loupe.classList.remove("on"); return; }
    const b = fr.getBoundingClientRect(), wb = box.querySelector(".cs-sheet-wrap").getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    loupe.style.backgroundImage = `url(${fr.querySelector("img").src})`; loupe.style.backgroundSize = `${b.width * Z}px ${b.height * Z}px`;
    loupe.style.backgroundPosition = `${LR - x * Z}px ${LR - y * Z}px`; loupe.style.transform = `translate(${e.clientX - wb.left - LR}px, ${e.clientY - wb.top - LR}px)`; loupe.classList.add("on");
  };
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) { sheet.addEventListener("pointermove", onMove); sheet.addEventListener("pointerleave", () => loupe.classList.remove("on")); }
  const onClick = (e) => {
    if (e.target.closest("[data-back]")) return close(e);
    const f = e.target.closest(".cs-frame");
    if (f) { last = f; const { title, where, story, full } = f.dataset; trayImg.src = full; trayImg.alt = title;
      tray.querySelector('[data-t="title"]').textContent = title; tray.querySelector('[data-t="where"]').textContent = where; tray.querySelector('[data-t="story"]').textContent = story;
      tray.hidden = false; tray.classList.remove("dev"); void tray.offsetWidth; tray.classList.add("dev"); tray.querySelector(".cs-close").focus(); return; }
    if (e.target.closest(".cs-close") || e.target === tray) { tray.hidden = true; last && last.focus(); }
  };
  const onKey = (e) => { if (e.key !== "Escape" || box.hidden) return; if (!tray.hidden) { tray.hidden = true; last && last.focus(); } else close(); };
  box.addEventListener("click", onClick); document.addEventListener("keydown", onKey);
  return () => { openers.forEach((a) => a.removeEventListener("click", open)); document.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
}
