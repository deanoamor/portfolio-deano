# Deano portfolio — 3D island hero

Plain HTML + Three.js r149 (UMD, `vendor/three.min.js`). No build step. Run: `python3 -m http.server 8000` then open http://localhost:8000.

## Structure
- `index.html` — overlay UI (wordmark, nav, headline, buttons) + boot. Mode is `data-mode="room|roam"` on `#top`.
- `src/*.js` — modules registered as `window.HeroParts[name] = function(ctx)`, run in order:
  core → room → island → pois1 → pois2 → scatter → person → loop. Each is try/catch'd so one failure doesn't kill the scene. All share one `ctx` (THREE as `T`, renderer, scene, camera, helpers `mat/matF/glow/mesh/box/cyl/sph/inst/safe`, arrays `anim/pois/obstacleCircles/obstacleRects/walls`, `islandR`, `dock`, `chair`, `person`, `api`).
- `ctx.api`: `rotateBy(rad)`, `enterRoam()`, `exitRoam()`.

## Design
- Isometric ortho camera; room mode rotates ±90° around 45° (180° total); walls facing camera shrink so the room stays visible.
- Roam: click-to-move, WASD/arrows, Q/E rotate 45°, Esc exits. Collision via rects/circles + island outline + dock.
- Palette: water #7CCBC8, text #0E3B38, cream #F4EFE2, coral #E8896B, teal #7FBDB8, sage #C9D5C3, ink #223433, mustard #F2C14E. Fonts: Fredoka (headings), DM Sans (body).
- POIs (in `island.js`): Campfire, Windmill, Lighthouse, Cherry tree, Koi pond, Garden, Picnic, Dock, Home.

## Status / TODO
- Code was written blind in the claude.ai canvas and NEVER visually verified — first step: open it, check console errors, fix bugs.
- Placeholder intro text in `index.html` (`[YOUR ROLE · ONE-LINE INTRO …]`) — replace with content from the old Notion page (https://deanoamor-design.notion.site/Hello-Welcome-to-my-page-1a0179cc9fd880eb853bc075f9684e08; needs pasted text, it is JS-rendered).
- Wire POIs to portfolio sections (Work/About/Contact), then build the remaining sections.
- Refs: Messenger (Awwwards SOTD, favorite), landonorris.com, igloo.inc. User prefers Indonesian; avoid "AI slop" generic gradients.
