# kaushalks.com

My personal site. Work history, research with three demos that run live in the browser, and a photo roll.

**Live:** [kaushalks.com](https://kaushalks.com)

![The site's hero: the Manhattan Bridge framing the Empire State Building, with my name over it](public/og.jpg)

## What it is built with

| Piece | Choice | Why |
|---|---|---|
| Framework | [Astro 5](https://astro.build/) | The page is content. Astro renders it to static HTML at build time and ships no framework runtime. |
| Animation | [GSAP 3.15](https://gsap.com/) (ScrollTrigger, SplitText, CustomEase) | Scroll-linked timelines that stay in sync and can be reversed. |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) | Wraps native scroll, so `position: sticky`, anchors and keyboard scrolling keep working. |
| Hosting | Vercel | Static output, deployed from `main`. |

Three dependencies, no UI framework, no component library, no CSS framework. One page template, one stylesheet, one entry script.

## Layout

```
src/
  pages/index.astro      the whole page, rendered at build time
  data/site.js           every piece of copy, in one file
  styles/site.css        one stylesheet, sectioned by page area
  scripts/
    site.js              scroll choreography: loader, hero dive, work track, hiring section, footer
    reduced-motion.js    one source of truth for prefers-reduced-motion
    gallery.js           photo-roll contact sheet (built, not currently mounted)
    demos/
      rrt.js             anytime RRT* path planner
      swarm.js           quadrotor swarm
      phishing.js        five-agent email pipeline
  assets/photos/         resized, EXIF-stripped JPEGs; Astro emits WebP at several widths
public/                  resume, favicon, og image, robots.txt, sitemap.xml, llms.txt
```

## The three demos

Each one is plain JavaScript drawing to a 2D canvas. No engine, no physics library, no WebGL.

- **`demos/rrt.js`** is the planner from my ROS2 Nav2 research. It samples points, grows a tree toward them and rewires existing branches whenever a cheaper route appears, so the path keeps getting shorter while you watch. Edges near the person in the scene cost up to four times as much, which is why the route curves around them. Click anywhere to move the goal and it replans.
- **`demos/swarm.js`** flies four quadrotors to four pads around obstacles. The positions are 3D and projected onto a 2D canvas by an orbiting camera. Each drone gets a repulsion force plus a sideways push, so it slides around a pillar instead of stalling against it.
- **`demos/phishing.js`** walks through the five-agent pipeline from our IEEE paper on one of three sample emails. The scores are fixed samples for illustration, not the live model.

All three pause through an `IntersectionObserver` when they scroll off screen.

## Motion rules

The scroll work follows two rules that keep it readable:

- **Text fires, geometry scrubs.** Headings and paragraphs animate on their own timing once they enter view. Only position, scale and clip paths are tied to scroll offset.
- **Everything reverses.** Reveals have a matching hide, so scrolling back up rewinds the page instead of leaving it in a half-finished state.

Two implementation details worth knowing if you read the source:

- The horizontal work track takes its wrapper height from its own `scrollWidth`, so one pixel of vertical scroll moves it one pixel sideways. Cards inside it trigger off GSAP's `containerAnimation` rather than page position.
- The loader is four composited CSS mask layers that cut an arch out of a solid panel. The arch widens into the bridge arch in the hero photo, and the camera flies through it by scrubbing a transform origin computed from the image's natural size.

With `prefers-reduced-motion: reduce`, every section renders in its final state and nothing animates.

## Running it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the build
```

Builds on Node 20 locally and on Node 24 on Vercel. Do not add an `engines` field: Vercel
rejects a semver range, and it no longer accepts Node 20, so pinning either one fails every
deployment.

## Deployment and headers

Vercel builds from `main` and serves `dist/`. `vercel.json` sets a Content Security Policy that allows no third party scripts, plus HSTS, `X-Frame-Options: DENY` and a `Permissions-Policy` that turns off camera, microphone, geolocation, payment and USB. The site also ships `robots.txt`, `sitemap.xml`, `llms.txt` and Person structured data.

## Photos

Every photo is mine except the hero frame of the Manhattan Bridge, which is by Jason Francis. Originals stay out of the repo; the committed copies are resized with the EXIF stripped.
