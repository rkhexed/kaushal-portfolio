# kaushal-portfolio

Single-page static site: Astro 5 (Node 20; Astro 7 needs Node 22), GSAP 3.15 (ScrollTrigger, SplitText, CustomEase), Lenis. Deployed on Vercel from `main`.

- `src/pages/index.astro`: all markup, rendered at build time. `src/data/site.js`: all copy (from the resume only; no invented metrics).
- `src/scripts/site.js`: scroll choreography, the three research demos (drone swarm, anytime RRT*, multi-agent phishing), the pinned hiring section and the gallery overlay.
- `src/styles/site.css`: one stylesheet. Palette: night `#0e141b`, snow `#eef1ec`, one orange (`#e0482a` / `#ff7a55`). Photos carry all other colour.
- Photos: add resized, EXIF-free JPEGs to `src/assets/photos/`. Raw originals stay in the gitignored `portfoliositephotos/`.
- Never commit a resume with the phone number; the public copy is `public/Kaushal-Subramani-Resume.pdf`.
- Motion rules: type fires, geometry scrubs; honour `prefers-reduced-motion`; demos pause off-screen.
- Verify UI changes with screenshots at 1440 and 390 before shipping. No em dashes in site copy.
- Commits: plain messages, no Co-Authored-By trailer.
