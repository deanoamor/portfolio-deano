# Deano portfolio — 3D island hero

Plain HTML + Three.js r149 (UMD, `vendor/three.min.js`). No build step. Run: `python3 -m http.server 8000` then open http://localhost:8000.

## Structure
- `index.html` — overlay UI (wordmark, nav, headline, buttons) + boot. Mode is `data-mode="room|roam"` on `#top`.
- `src/*.js` — modules registered as `window.HeroParts[name] = function(ctx)`, run in order:
  core → room → island → mountains → pois1 → pois2 → scatter → person → env → post → loop → minimap. Each is try/catch'd so one failure doesn't kill the scene. All share one `ctx` (THREE as `T`, renderer, scene, camera, helpers `mat/matF/glow/mesh/box/cyl/sph/inst/safe`, arrays `anim/pois/obstacleCircles/obstacleRects/walls`, `islandR`, `dock`, `chair`, `person`, `api`).
- `ctx.api`: `rotateBy(rad)`, `enterRoam()`, `exitRoam()`, `walkTo(x,z)`, `setPov('drone'|'fps')`.
- Two POVs (`S0.pov`, `data-pov` on `#top`): drone = ortho isometric camera; fps = perspective camera at eye height (1.38), drag/pointer-lock to look, WASD + Shift, wheel = FOV, V toggles. Fog is always present but pushed to 1e5 in drone view so there is no shader recompile on switch.

## Design
- Isometric ortho camera; room mode rotates ±90° around 45° (180° total); walls facing camera shrink so the room stays visible.
- Roam: click-to-move, WASD/arrows, Q/E rotate 45°, Esc exits. Collision via rects/circles + island outline + dock.
- Palette: water #7CCBC8, text #0E3B38, cream #F4EFE2, coral #E8896B, teal #7FBDB8, sage #C9D5C3, ink #223433, mustard #F2C14E. Fonts: Fredoka (headings), DM Sans (body).
- POIs (in `island.js`): Campfire, Windmill, Lighthouse, Cherry tree, Koi pond, Garden, Picnic, Dock, Home.

## Scale
- Person = 1.5 units tall. The house (room.js, built at full size in local coords) lives in a group scaled `ctx.home.s` (0.5) at `ctx.home.{x,z}`; collisions/person path are converted to world coords. Everything else is modelled at world scale.
- Island is wide (R≈38) with a bay cut in the north (`islandR` in core.js); the house sits on the north shore so the sea shows behind it. Island centre is the origin.

## Look (painterly)
- `post.js`: scene renders into a target with a depth texture; one full-screen pass applies a Kuwahara brush filter, ink outlines from depth/luma edges and a colour grade. It drops the brush filter, then itself, if frames stay slow (`window.HERO_NO_ADAPT = true` disables that for tests).
- Trees are leafy jittered icospheres with grey-scale vertex colours (hue comes from the seasonal material), merged per material by `ctx.bake` (`ctx.bakeForest()`). Island edge is a stone-brick retaining wall, paths are a dark bed + overlapping flagstones, daisies are instanced discs, cottages + river live in `pois2.js`.

## House
- Two storeys, built in `room.js` at full size and scaled by `ctx.home.s`: ground floor = living room + workstation (NE), kitchen (SE), bedroom (NW), bathroom (SW); upstairs = lounge. Footprint ±11 x ±7.5 local units (`ctx.houseGeo`). Walls are built from pieces with real door/window openings (`makeWall`); partitions are waist-high in the drone cutaway (`w.part`) and full height in first person.
- Upstairs (`ctx.house.upper`) is shown only while the character is upstairs (`P.lv === 1`), and always in first person, so the floor you stand on is never covered. The stairs are a ramp (`groundY` in loop.js); obstacles carry a level (0 ground, 1 upstairs) and the player's level is `P.lv`.
- Static furniture is merged per material with `bake()`; anything animated (cat, vinyl, steam, chair) is flagged `userData.noMerge`.

## Environment
- `env.js`: `ctx.env.set({season, time})` (spring/summer/autumn/winter, morning/noon/evening/night). Foliage uses unshared materials in `ctx.fol` so seasons can recolour them; summer = original palette. Mountains (`mountains.js`) sit behind the house for every camera angle so they never hide it.
- `minimap.js`: top-right canvas; click to walk in roam mode (`api.walkTo`).

## Status / TODO
- Code was written blind in the claude.ai canvas and NEVER visually verified — first step: open it, check console errors, fix bugs.
- Placeholder intro text in `index.html` (`[YOUR ROLE · ONE-LINE INTRO …]`) — replace with content from the old Notion page (https://deanoamor-design.notion.site/Hello-Welcome-to-my-page-1a0179cc9fd880eb853bc075f9684e08; needs pasted text, it is JS-rendered).
- Wire POIs to portfolio sections (Work/About/Contact), then build the remaining sections.
- Refs: Messenger (Awwwards SOTD, favorite), landonorris.com, igloo.inc. User prefers Indonesian; avoid "AI slop" generic gradients.
