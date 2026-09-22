/* Kaushal Subramani, portfolio. Scroll choreography (GSAP + Lenis), three live research demos, and the photo-roll gallery. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import { roles, emails } from "../data/site.js";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("InOut", "0.75,0,0.25,1");
CustomEase.create("Out", "0.25,1,0.5,1");
CustomEase.create("In", "0.5,0,0.75,0");
CustomEase.create("diveIn", "0.6,0,0,1");
CustomEase.create("horScroll", "0.25,0,0.75,1");
CustomEase.create("loadBar", "M0,0 C0.08,0.32 0.16,0.36 0.26,0.4 0.38,0.45 0.42,0.5 0.5,0.62 0.58,0.74 0.62,0.9 0.74,0.92 0.86,0.94 0.9,0.99 1,1");

const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    offs.push(demoRRT($(".pf-rrt"), $('[data-rr="n"]'), $('[data-rr="p"]')));
    offs.push(demoSwarm(el));
    offs.push(demoMail(el, emails));
    // gallery hidden for now (markup commented out in index.astro); restore with:
    // offs.push(gallery(el, $(".pf-gallery"), lenis));

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

    /* ================= research demo 1: compact anytime RRT* ================= */
    function demoRRT(cv, nEl, pEl) {
      const g = cv.getContext("2d"), MAX = 1500, STEP = 18, NEAR = 42;
      const walls = [[0.3, 0, 0.35, 0.58], [0.62, 0.42, 0.67, 1]], person = [0.48, 0.74];
      let w = 0, h = 0, obst = [], ppl = [], start, goal, X, Y, P, C, n = 0, best = null, raf = 0, fr = 0, vis = false;
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
      const frame = () => { grow(14); if (++fr % 5 === 0 || !best) connect(); draw(); raf = n < MAX && vis ? requestAnimationFrame(frame) : 0; };
      const run = () => { cancelAnimationFrame(raf); if (RM) { grow(MAX); connect(); draw(); } else raf = requestAnimationFrame(frame); };
      const onClick = (e) => { const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; if (hit(x, y)) return; goal = [x, y]; reset(); run(); };
      cv.addEventListener("click", onClick);
      const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && n < MAX && !raf) run(); });
      document.fonts.ready.then(() => { size(); io.observe(cv); });
      return () => { cancelAnimationFrame(raf); io.disconnect(); cv.removeEventListener("click", onClick); };
    }

    /* ================= research demo 2: a small quadrotor swarm, drawn in 3D on a 2D canvas ================= */
    function demoSwarm(root) {
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

    /* ================= research demo 3: scripted walkthrough of the five-agent pipeline ================= */
    function demoMail(root, emails) {
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

    /* ================= optional gallery: the contact sheet, reachable only by clicking ================= */
    function gallery(page, box, lenis) {
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
}

init();
