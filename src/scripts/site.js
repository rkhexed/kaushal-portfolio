/* Kaushal Subramani, portfolio. Scroll choreography: the loader arch, the hero dive, the work track,
   the pinned hiring section and the closing boarding pass. The research demos live in ./demos. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import { roles, emails } from "../data/site.js";
import { RM } from "./reduced-motion.js";
import { demoRRT } from "./demos/rrt.js";
import { demoSwarm } from "./demos/swarm.js";
import { demoMail } from "./demos/phishing.js";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("InOut", "0.75,0,0.25,1");
CustomEase.create("Out", "0.25,1,0.5,1");
CustomEase.create("In", "0.5,0,0.75,0");
CustomEase.create("diveIn", "0.6,0,0,1");
CustomEase.create("horScroll", "0.25,0,0.75,1");
CustomEase.create("loadBar", "M0,0 C0.08,0.32 0.16,0.36 0.26,0.4 0.38,0.45 0.42,0.5 0.5,0.62 0.58,0.74 0.62,0.9 0.74,0.92 0.86,0.94 0.9,0.99 1,1");


/* Lenis driven by the GSAP ticker, so there is one animation loop */
function makeLenis() {
  if (RM) return null;
  /* gestureOrientation "both": a sideways trackpad swipe still moves the page (people try that in the work track) */
  const lenis = new Lenis({ duration: 1.2, smoothWheel: true, gestureOrientation: "both", easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* the gallery's typefaces only load if someone opens it */
let galleryFonts = false;
function loadGalleryFonts() {
  if (galleryFonts) return; galleryFonts = true;
  const l = document.createElement("link"); l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=Courier+Prime:wght@400;700&family=Nanum+Pen+Script&display=swap";
  document.head.appendChild(l);
}

function init() {
    const el = document.querySelector(".ex");
    if (RM) el.classList.add("rm");
    const $ = (s) => el.querySelector(s), $$ = (s) => [...el.querySelectorAll(s)];
    const lenis = makeLenis();
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    const durS = 0.4, durL = 1.2;

    const jump = (href) => {
      const t = href === "#top" ? 0 : el.querySelector(href);
      if (lenis) lenis.scrollTo(t, { duration: 1.6 }); else if (t === 0) scrollTo(0, 0); else t.scrollIntoView();
    };
    $$(".ex-nav a[href^='#ex'], [data-jump]").forEach((a) => on(a, "click", (e) => { e.preventDefault(); jump(a.getAttribute("href")); }));
    on($(".ex-mark"), "click", () => jump("#top"));

    /* copy-to-clipboard for the email: mailto: does nothing on machines with no mail client set up */
    $$("[data-copy]").forEach((btn) => on(btn, "click", async () => {
      const text = btn.dataset.copy;
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(text);
        else { const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
          document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
        const was = btn.textContent;
        btn.textContent = "Copied"; btn.classList.add("done");
        clearTimeout(btn._t); btn._t = setTimeout(() => { btn.textContent = was; btn.classList.remove("done"); }, 2000);
      } catch (e) { location.href = "mailto:" + text; }
    }));

    offs.push(demoRRT($(".pf-rrt"), $('[data-rr="n"]'), $('[data-rr="p"]')));
    offs.push(demoSwarm(el));
    offs.push(demoMail(el, emails));
    /* the photo-roll gallery is built but not mounted: see ./gallery.js and the commented markup in index.astro */

    if (RM) { $(".ex-loader").remove(); return () => { offs.forEach((f) => f()); lenis && lenis.destroy(); }; }

    let tickFn = null, quiet = null;
    const ctx = gsap.context(() => {
      /* ---------- reveal primitives: reveal / hide (mirrored) ---------- */
      const prep = (n) => {
        const kind = n.dataset.reveal;
        if (kind === "h") SplitText.create(n, { type: "words,chars", autoSplit: true, onSplit(s) { n._p = s.chars; gsap.set(s.chars, n._shown ? { opacity: 1, yPercent: 0, rotateY: 0 } : { opacity: 0, yPercent: 50, rotateY: 90 }); } });
        else if (kind === "p") SplitText.create(n, { type: "lines", mask: "lines", autoSplit: true, onSplit(s) { n._p = s.lines; gsap.set(s.lines, { yPercent: n._shown ? 0 : 110 }); } });
        else if (kind === "ctn") gsap.set(n, { opacity: 0, y: "3.33rem" });
      };
      const act = (n, show, delay = 0) => {
        n._shown = show; const kind = n.dataset.reveal;
        const d = show ? { duration: durL, ease: "Out", delay, overwrite: true } : { duration: durS, ease: "In", overwrite: true };
        if (kind === "h") gsap.to(n._p, show ? { ...d, opacity: 1, yPercent: 0, rotateY: 0, stagger: 0.012 } : { ...d, opacity: 0, yPercent: -50, rotateY: -90, stagger: 0.005 });
        else if (kind === "p") gsap.to(n._p, show ? { ...d, yPercent: 0, stagger: 0.08 } : { ...d, yPercent: -110, stagger: 0.03 });
        else if (kind === "ctn") gsap.to(n, show ? { ...d, opacity: 1, y: 0 } : { ...d, opacity: 0 });
      };
      /* phones skip the typeset intro, so they need not wait for web fonts before the arch opens */
      const small = innerWidth < 992;
      (small ? Promise.resolve() : document.fonts.ready).then(() => {
        if (!el.isConnected) return;
        const all = $$("main [data-reveal]"); all.forEach(prep);
        const groups = new Map();
        all.forEach((n) => { const w = n.closest("[data-reveal-w]") || n; if (!groups.has(w)) groups.set(w, []); groups.get(w).push(n); });
        groups.forEach((items, w) => ScrollTrigger.create({ trigger: w, start: "top 82%",
          onEnter: () => items.forEach((n, i) => act(n, true, i * 0.08)),
          onLeaveBack: () => items.forEach((n) => act(n, false)) }));

        /* loader logo assembles once per session; phones get the short version (no dive follows there) */
        const seen = small || sessionStorage.getItem("ex-seen") === "1";
        const D = small ? { open: 1, hold: 0.15, dive: 0.9 } : { open: 1.8, hold: 0.6, dive: 1.7 };
        const loader = $(".ex-loader"), heroImg = $(".ex-hero-bg img");
        lenis && lenis.stop();
        const tl = gsap.timeline({ onComplete() { loader.style.display = "none"; lenis && lenis.start(); try { sessionStorage.setItem("ex-seen", "1"); } catch (e) {} } });
        gsap.set(heroImg, { scale: 1.2, transformOrigin: "50% 60%" });
        if (!seen) {
          const name = SplitText.create(".ex-loader-logo .ex-d", { type: "chars" });
          const pct = { v: 0 }, pctEl = $(".ex-loader-pct");
          tl.from(name.chars, { yPercent: 110, opacity: 0, rotateX: 60, stagger: 0.025, duration: 0.7, ease: "Out" })
            .from(".ex-loader-logo .ex-m", { opacity: 0, y: 10, duration: 0.5, ease: "Out" }, "-=0.3")
            .to(".ex-loader-bar i", { scaleX: 1, duration: 2.2, ease: "loadBar" }, 0.2)
            .to(pct, { v: 99, duration: 2.2, ease: "loadBar", onUpdate() { pctEl.textContent = String(Math.round(pct.v)).padStart(2, "0"); } }, 0.2);
        }
        /* the arch opens slowly, holds so the bridge reads through it, then the camera passes through */
        tl.to(".ex-loader-logo, .ex-loader-bar, .ex-loader-pct", { opacity: 0, duration: small ? 0.2 : 0.4, ease: "In" }, seen ? 0 : ">-0.05")
          .to(loader, { "--aw": small ? "58vw" : "34vw", "--ay": "20vh", duration: D.open, ease: "InOut" }, "<")
          .to(loader, { "--aw": "180vw", "--ay": "-80vh", duration: D.dive, ease: "diveIn" }, `+=${D.hold}`)
          .to(heroImg, { scale: 1, duration: D.dive, ease: "diveIn" }, "<");
      });

      /* ---------- compass: idles at 30°/s, follows scroll velocity, settles back ---------- */
      const mark = $(".ex-mark svg"), st = { speed: 30, angle: 0, dir: 1 };
      let userScrolled = false; const flag = () => (userScrolled = true);
      on(window, "wheel", flag, { passive: true }); on(window, "touchmove", flag, { passive: true }); on(window, "keydown", flag);
      lenis && lenis.on("scroll", ({ velocity, direction }) => {
        if (!userScrolled) return;
        if (direction) st.dir = direction;
        gsap.to(st, { speed: st.dir * (30 + 10 * Math.abs(velocity)), duration: 0.3, overwrite: true });
        clearTimeout(quiet); quiet = setTimeout(() => gsap.to(st, { speed: 30 * st.dir, duration: durL, overwrite: true }), 100);
      });
      tickFn = (t, dt) => { st.angle += st.speed * Math.min(dt, 100) / 1000; mark.style.transform = `rotate(${st.angle}deg)`; };
      gsap.ticker.add(tickFn);

      /* ---------- progress rail and counter ---------- */
      const count = $(".ex-count"), n = $(".ex-count-n");
      ScrollTrigger.create({ start: 0, end: "max", onUpdate(s) { n.textContent = String(Math.round(s.progress * 99)).padStart(2, "0"); count.style.setProperty("--progress", (s.progress * 100).toFixed(2) + "%"); } });

      /* ---------- fixed UI swaps colour with the ground underneath ---------- */
      const ui = $(".ex-ui");
      $$("[data-bg]").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 60px", end: "bottom 60px",
        onToggle(s) { if (s.isActive) { const light = sec.dataset.bg === "light"; ui.classList.toggle("on-light", light); count.style.color = light ? "#0e141b" : "#eef1ec"; } } }));

      /* ---------- parallax: images drift inside their frames ---------- */
      $$("main [data-parallax='img']").forEach((img) => gsap.fromTo(img, { yPercent: -19 }, { yPercent: 0, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 } }));

      /* ---------- desktop-only choreography ---------- */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 992px)", () => {
        /* hero dive: copy lifts first, then the camera flies into the arch toward the Empire State */
        const hero = $(".ex-hero"), bg = $(".ex-hero-bg"), img = bg.querySelector("img");
        const build = () => {
          const cw = innerWidth, ch = innerHeight, iw = img.naturalWidth || 1900, ih = img.naturalHeight || 1900;
          /* wide screens show the whole frame (height-fit, centred); narrow ones crop like before */
          const fit = cw / ch >= iw / ih, s = fit ? ch / ih : Math.max(cw / iw, ch / ih), dw = iw * s, dh = ih * s;
          const ox = ((0.482 * dw - (dw - cw) * 0.5) / cw) * 100, oy = fit ? 78 : ((0.78 * dh - (dh - ch) * 0.62) / ch) * 100;
          gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: true } })
            .to(".ex-hero-copy", { yPercent: -45, opacity: 0, ease: "none", duration: 0.32 }, 0)
            .to(".ex-exif", { opacity: 0, ease: "none", duration: 0.15 }, 0)
            .fromTo(bg, { scale: 1 }, { scale: 2.3, transformOrigin: `${ox}% ${oy}%`, ease: "none", duration: 0.82 }, 0.12)
            .to(".ex-hero-fade", { opacity: 1, ease: "none", duration: 0.22 }, 0.78);
        };
        img.complete ? build() : img.addEventListener("load", build, { once: true });

        /* word-spacing spread: the only thing moving in its section */
        gsap.fromTo(".ex-spread-line span", { wordSpacing: "0em" }, { wordSpacing: "0.72em", ease: "none",
          scrollTrigger: { trigger: ".ex-spread", start: "top top", end: "bottom bottom", scrub: true } });

        /* horizontal track: wrapper height derived from the track, so vertical and horizontal travel are 1:1 */
        const area = $(".ex-work-area"), track = $(".ex-track"), line = $(".pf-line");
        const nodes = $$(".ex-card .pf-node"), first = nodes[0].closest(".ex-card"), last = nodes[nodes.length - 1].closest(".ex-card");
        line.style.left = `${first.offsetLeft + 36}px`; line.style.width = `${last.offsetLeft - first.offsetLeft}px`;
        const distance = track.scrollWidth - area.offsetWidth;
        area.style.height = `${track.scrollWidth}px`;
        ScrollTrigger.refresh();
        const tween = gsap.to(track, { x: -distance, ease: "horScroll",
          scrollTrigger: { trigger: area, start: "2.5% top", end: "97.5% bottom", scrub: 0.25, invalidateOnRefresh: true } });
        /* the "keep scrolling" hint leaves once the track is moving */
        ScrollTrigger.create({ trigger: area, start: "8% top", onToggle: (st) => $(".pf-hint").classList.toggle("gone", st.isActive || st.progress > 0) });
        /* the path draws as you travel along it: geometry scrubs */
        gsap.fromTo(".pf-line i", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: area, start: "10% top", end: "92% bottom", scrub: 0.25 } });
        $$(".ex-track-title .ex-d span").forEach((sp, i) => gsap.to(sp, { x: i % 2 ? -90 : 90, ease: "none",
          scrollTrigger: { trigger: area, start: "top top", end: "bottom bottom", scrub: true } }));
        $$("[data-card]").forEach((c) => {
          gsap.set(c, { opacity: 0, y: 40 });
          ScrollTrigger.create({ trigger: c, containerAnimation: tween, start: "left 96%",
            onEnter: () => gsap.to(c, { opacity: 1, y: 0, duration: durL, ease: "Out", overwrite: true }),
            onLeaveBack: () => gsap.to(c, { opacity: 0, y: -24, duration: durS, ease: "In", overwrite: true }) });
        });
        return () => { area.style.height = ""; gsap.set(track, { x: 0 }); $$("[data-card]").forEach((c) => gsap.set(c, { opacity: 1, y: 0 })); };
      });
      el._mm = mm;

      /* ---------- hiring: the section pins, snaps in if you stop halfway, and streams adjacent roles like an LLM ---------- */
      const endSec = $(".pf-end"), roleEl = $(".pf-role"), bars = $$(".pf-meter i b"), rc = $("[data-rc]");
      let ri = 0, streamT = [], streaming = false;
      const tokens = (s) => s.match(/\s?[A-Za-z]{1,4}|\s?[^A-Za-z\s]+|\s/g);
      const later = (fn, ms) => streamT.push(setTimeout(fn, ms));
      const cycle = () => {
        if (!streaming) return;
        bars.forEach((b, i) => { gsap.killTweensOf(b); gsap.set(b, { scaleX: i < ri ? 1 : 0 }); });
        rc.textContent = `${String(ri + 1).padStart(2, "0")} / ${String(roles.length).padStart(2, "0")}`;
        const tk = tokens(roles[ri]); let acc = "", at = 0;
        roleEl.textContent = ""; endSec.classList.add("typing");
        tk.forEach((t) => { at += 45 + Math.random() * 70; later(() => { acc += t; roleEl.textContent = acc; }, at); });
        const hold = 1900;
        gsap.fromTo(bars[ri], { scaleX: 0 }, { scaleX: 1, duration: (at + hold) / 1000, ease: "none" });
        later(() => endSec.classList.remove("typing"), at + 60);
        later(() => { ri = (ri + 1) % roles.length; cycle(); }, at + hold);
      };
      const stop = () => { streaming = false; streamT.forEach(clearTimeout); streamT = []; endSec.classList.remove("typing"); };
      ScrollTrigger.create({ trigger: endSec, start: "top 35%", end: "bottom 20%",
        onToggle: (s) => { if (s.isActive && !streaming) { streaming = true; cycle(); } else if (!s.isActive) stop(); } });
      offs.push(stop);
      if (lenis) {
        let snapT = 0;
        lenis.on("scroll", () => { clearTimeout(snapT); snapT = setTimeout(() => {
          const top = endSec.getBoundingClientRect().top;
          if (top > 4 && top < innerHeight * 0.45) lenis.scrollTo(endSec, { duration: 0.9 });
        }, 180); });
        offs.push(() => clearTimeout(snapT));
      }

      /* ---------- the page closes on itself: it clips into a card and fades, the boarding pass rises ---------- */
      const main = $(".ex-main"), foot = $(".ex-foot");
      const target = innerWidth >= 992 ? "inset(9% 23% 9% 23% round 18px)" : "inset(6% 8% 6% 8% round 16px)";
      gsap.timeline({ scrollTrigger: { trigger: ".ex-spacer", start: "top bottom", end: "bottom bottom", scrub: true,
        onUpdate(s) { foot.classList.toggle("live", s.progress > 0.7); } } })
        .fromTo(main, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, { clipPath: target, ease: "none", duration: 0.6 }, 0)
        .fromTo(".pf-foot-in", { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", duration: 0.35 }, 0.3)
        .to(main, { opacity: 0, ease: "none", duration: 0.2 }, 0.6);
    }, el);

    return () => {
      clearTimeout(quiet); if (tickFn) gsap.ticker.remove(tickFn);
      offs.forEach((f) => f()); el._mm && el._mm.revert(); ctx.revert(); lenis && lenis.destroy();
    };

}

init();
