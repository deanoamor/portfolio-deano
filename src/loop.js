(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // Camera, input, room <-> free-roam modes and the render loop.
  parts.loop = function (ctx) {
    var T = ctx.T, canvas = ctx.canvas, renderer = ctx.renderer, scene = ctx.scene, camera = ctx.camera, sun = ctx.sun, root = ctx.root;
    var clamp = ctx.clamp, smooth = ctx.smooth, lerp = ctx.lerp, wrapPi = ctx.wrapPi, reduce = ctx.reduce, GY = ctx.GY;
    var walls = ctx.walls, tall = ctx.tall, anim = ctx.anim, pois = ctx.pois, P = ctx.person, islandR = ctx.islandR, dock = ctx.dock, H = ctx.home;
    var circles = ctx.obstacleCircles, rects = ctx.obstacleRects;

    var AZ0 = Math.PI / 4, AZ_MIN = AZ0 - Math.PI / 2, AZ_MAX = AZ0 + Math.PI / 2, EL = 0.6, DIST = 70;
    var rootEl = canvas.parentElement;
    var labelEl = document.getElementById('poi-label');
    var S0 = {
      mode: 'room', modeT: 0, az: reduce ? AZ0 : AZ0 - 0.9, azTarget: AZ0, interacted: false, dragging: false,
      lastX: 0, t: 0, intro: reduce ? 1 : 0, focus: new T.Vector3(H.x, 0.1, H.z),
      pov: 'drone', yaw: 0, pitch: 0, fov: 68, floor: 1, lvPrev: 0
    };
    var HG = ctx.houseGeo;
    var keys = {};
    var zoom = 1, zoomT = 1, ZMIN = 0.5, ZMAX = 2;   // mouse-wheel zoom (multiplies the view height)
    var view = { w: 1440, h: 900 };
    // first-person camera (the drone view keeps the orthographic one)
    var fpsCam = new T.PerspectiveCamera(68, 1.6, 0.05, 500);
    var fovT = 68, EYE = 1.38, bob = 0, bobAmt = 0;
    var fog = scene.fog = new T.Fog(0xBFE3EC, 1e5, 2e5);   // effectively off until first person
    var tmpV = new T.Vector3();
    var roomTarget = new T.Vector3(H.x, 0.1, H.z);

    // ---------- view size ----------
    var resize = function () {
      view.w = canvas.clientWidth || 1440;
      view.h = canvas.clientHeight || 900;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.w, view.h, false);
      fpsCam.aspect = view.w / view.h; fpsCam.updateProjectionMatrix();
      if (ctx.post) ctx.post.resize();
    };
    var applyFrustum = function (e) {
      var aspect = view.w / view.h;
      var hRoom = Math.max(10.8, 11.8 / aspect), hRoam = Math.max(6.8, 7.5 / aspect);
      var halfH = lerp(hRoom, hRoam, e) * zoom, halfW = halfH * aspect;
      var off = 0;
      camera.left = -halfW - off; camera.right = halfW - off;
      camera.top = halfH; camera.bottom = -halfH;
      camera.updateProjectionMatrix();
    };
    if (window.ResizeObserver) { ctx.ro = new ResizeObserver(resize); ctx.ro.observe(rootEl); }
    window.addEventListener('resize', resize);
    resize();

    // ---------- walking rules ----------
    var R_P = 0.2;
    var onDock = function (x, z) {
      var dx = x - dock.ox, dz = z - dock.oz;
      var lx = dx * Math.cos(dock.a) + dz * Math.sin(dock.a), lz = -dx * Math.sin(dock.a) + dz * Math.cos(dock.a);
      return lx > -0.2 && lx < dock.len && Math.abs(lz) < 0.8;
    };
    var blocked = function (x, z) {
      var lv = P && P.lv ? 1 : 0;
      var land = Math.hypot(x, z) <= islandR(Math.atan2(z, x)) - 1.4;
      if (!land && !onDock(x, z)) return true;
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if ((r[4] | 0) !== lv) continue;
        if (x > r[0] - R_P && x < r[2] + R_P && z > r[1] - R_P && z < r[3] + R_P) return true;
      }
      for (var j = 0; j < circles.length; j++) {
        if ((circles[j][3] | 0) !== lv) continue;
        if (Math.hypot(circles[j][0] - x, circles[j][1] - z) < circles[j][2] + R_P) return true;
      }
      return false;
    };
    var groundY = function (wx, wz) {
      if (onDock(wx, wz)) return -0.15;
      var x = (wx - H.x) / H.s, z = (wz - H.z) / H.s;   // house-local coordinates
      var st = HG.st;
      if (x > st.x0 - 0.3 && x < st.x1 + 0.3 && z > st.z0 - 0.2 && z < st.z1 + 0.4) {   // the stairs are a ramp
        return H.s * HG.f2 * clamp((st.z1 - z) / (st.z1 - st.z0), 0, 1);
      }
      if (Math.abs(x) < HG.hx + 0.2 && Math.abs(z) < HG.hz + 0.2) return (P && P.lv ? HG.f2 + 0.05 : 0.05) * H.s;
      if (x > HG.hx - 0.2 && x < HG.hx + 2.3 && Math.abs(z + 4.0) < 1.0) {   // front step
        var u = clamp((x - (HG.hx + 1.3)) / 0.6, 0, 1);
        return (0.04 * (1 - u)) * H.s + GY * u;
      }
      var d = Math.max(Math.abs(x) - HG.hx - 0.25, Math.abs(z) - HG.hz - 0.25);
      var t = clamp(d / 0.9, 0, 1);
      return 0.05 * H.s * (1 - t) + GY * t;
    };

    var marker = new T.Mesh(new T.RingGeometry(0.28, 0.4, 24), new T.MeshBasicMaterial({ color: '#E8896B', transparent: true, opacity: 0.9, depthWrite: false }));
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    root.add(marker);

    var stepPlayer = function (dt, t, a) {
      if (!P) return;
      if (P.mode === 'sit') { P.lv = 0; P.pose(t, dt, false); return; }
      P.lv = P.y > 0.55 * HG.f2 * H.s ? 1 : 0;
      var moving = false, mx = 0, mz = 0;
      if (P.path.length) {
        var w = P.path[0], dx = w[0] - P.x, dz = w[1] - P.z, d = Math.hypot(dx, dz);
        if (d < 0.12) { P.path.shift(); }
        else {
          mx = dx / d; mz = dz / d;
          var sp = Math.min(2.4 * dt, d);
          P.x += mx * sp; P.z += mz * sp;
          moving = true;
        }
      } else {
        var ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iy = (keys.u ? 1 : 0) - (keys.d ? 1 : 0);
        if (ix || iy) {
          P.dest = null;
          var sa = Math.sin(a), ca = Math.cos(a);
          mx = ca * ix - sa * iy; mz = -sa * ix - ca * iy;
          var l = Math.hypot(mx, mz); mx /= l; mz /= l;
        } else if (P.dest) {
          var ex = P.dest[0] - P.x, ez = P.dest[1] - P.z, ed = Math.hypot(ex, ez);
          if (ed < 0.15) P.dest = null; else { mx = ex / ed; mz = ez / ed; }
        }
        if (mx || mz) {
          var step = (S0.pov === 'fps' ? 2.7 : 3.4) * (keys.sh ? 1.7 : 1) * dt, nx = P.x + mx * step, nz = P.z + mz * step;
          if (!blocked(nx, nz)) { P.x = nx; P.z = nz; moving = true; }
          else if (!blocked(nx, P.z)) { P.x = nx; moving = true; }
          else if (!blocked(P.x, nz)) { P.z = nz; moving = true; }
          else if (P.dest) P.dest = null;
        }
      }
      if (moving) P.heading += wrapPi(Math.atan2(mx, mz) - P.heading) * Math.min(1, dt * 12);
      P.y += (groundY(P.x, P.z) - P.y) * Math.min(1, dt * 14);
      P.g.position.set(P.x, P.y, P.z);
      P.g.rotation.y = P.heading;
      P.pose(t, dt, moving);
      if (P.dest) {
        marker.visible = true;
        marker.position.set(P.dest[0], GY + 0.06, P.dest[1]);
        marker.scale.setScalar(1 + 0.2 * Math.sin(t * 8));
      } else marker.visible = false;
    };

    // ---------- modes ----------
    var rotateBy = function (d) {
      S0.interacted = true;
      S0.azTarget = S0.mode === 'room' ? clamp(S0.azTarget + d, AZ_MIN, AZ_MAX) : S0.azTarget + d;
    };
    var fade = document.getElementById('cut');
    var setPov = function (pov, instant) {
      if (pov !== 'fps' && pov !== 'drone') return;
      if (pov === S0.pov && (pov === 'drone' || S0.mode === 'roam')) return;
      var go = function () {
        if (pov === 'fps') {
          var wasRoam = S0.mode === 'roam';
          if (!wasRoam) enterRoam();
          if (!P) return;
          P.path = []; P.dest = null; marker.visible = false;
          if (wasRoam) S0.yaw = P.heading + Math.PI;
          else {   // just left the desk: start inside the house, facing the door
            P.x = H.x + 8 * H.s; P.z = H.z - 1.8 * H.s; P.y = 0.05 * H.s;
            S0.yaw = Math.atan2(-3, 2.2); S0.pitch = -0.05;
          }
          S0.pov = 'fps';
          P.g.visible = false;
          fovT = fpsCam.fov = 68;
          fog.near = 55; fog.far = 190;
          if (ctx.roof) { ctx.roof.g.visible = true; ctx.roof.light.intensity = ctx.roof.on; }
        } else {
          S0.pov = 'drone';
          if (P) P.g.visible = true;
          fog.near = 1e5; fog.far = 2e5;
          if (ctx.roof) { ctx.roof.g.visible = false; ctx.roof.light.intensity = 0; }
          if (document.pointerLockElement === canvas && document.exitPointerLock) document.exitPointerLock();
        }
        rootEl.setAttribute('data-pov', S0.pov);
        try { canvas.focus({ preventScroll: true }); } catch (e) {}
        if (ctx.onPov) ctx.onPov(S0.pov);
      };
      if (instant || !fade) { go(); return; }
      fade.style.opacity = '1';
      setTimeout(function () { go(); fade.style.opacity = '0'; }, 190);
    };
    var enterRoam = function () {
      if (S0.mode === 'roam' || !P) return;
      S0.mode = 'roam';
      S0.interacted = true;
      P.stand();
      rootEl.setAttribute('data-mode', 'roam');
      try { canvas.focus({ preventScroll: true }); } catch (e) {}
    };
    var exitRoam = function () {
      if (S0.mode === 'room' || !P) return;
      S0.mode = 'room';
      keys = {};
      marker.visible = false;
      if (S0.pov === 'fps') setPov('drone', true);
      P.sit();
      S0.lvPrev = 0;
      S0.az = AZ0 + wrapPi(S0.az - AZ0);
      S0.azTarget = AZ0 + clamp(wrapPi(S0.azTarget - AZ0), -Math.PI / 2, Math.PI / 2);
      rootEl.setAttribute('data-mode', 'room');
    };
    var walkTo = function (x, z) {
      if (S0.mode !== 'roam' || !P || P.mode !== 'walk' || P.path.length) return;
      if (!blocked(x, z)) P.dest = [x, z];
    };
    ctx.api = { rotateBy: rotateBy, enterRoam: enterRoam, exitRoam: exitRoam, walkTo: walkTo, setPov: setPov };
    ctx.state = S0;
    rootEl.setAttribute('data-mode', 'room');
    rootEl.setAttribute('data-pov', 'drone');

    // ---------- input ----------
    var raycaster = new T.Raycaster();
    var plane = new T.Plane(new T.Vector3(0, 1, 0), -GY);
    var hit = new T.Vector3();
    var down = null;
    var clickMove = function (cx, cy) {
      var rc = canvas.getBoundingClientRect();
      raycaster.setFromCamera({ x: (cx - rc.left) / rc.width * 2 - 1, y: -((cy - rc.top) / rc.height * 2 - 1) }, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) P.dest = [hit.x, hit.z];
    };
    canvas.addEventListener('pointerdown', function (e) {
      S0.dragging = true; S0.interacted = true; S0.lastX = e.clientX; S0.lastY = e.clientY;
      down = { x: e.clientX, y: e.clientY, moved: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      canvas.style.cursor = 'grabbing';
      if (S0.mode === 'roam') { try { canvas.focus({ preventScroll: true }); } catch (err2) {} }
    });
    var look = function (dx, dy) {
      S0.yaw -= dx * 0.0042;
      S0.pitch = clamp(S0.pitch - dy * 0.0036, -1.25, 1.25);
    };
    canvas.addEventListener('pointermove', function (e) {
      if (S0.pov === 'fps') {
        if (document.pointerLockElement === canvas) look(e.movementX || 0, e.movementY || 0);
        else if (S0.dragging) { look(e.clientX - S0.lastX, e.clientY - (S0.lastY === undefined ? e.clientY : S0.lastY)); S0.lastX = e.clientX; S0.lastY = e.clientY; if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true; }
        return;
      }
      if (!S0.dragging) return;
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
      var d = e.clientX - S0.lastX;
      S0.lastX = e.clientX;
      var next = S0.azTarget - d * 0.0048;
      S0.azTarget = S0.mode === 'room' ? clamp(next, AZ_MIN, AZ_MAX) : next;
    });
    var end = function (e) {
      S0.dragging = false;
      canvas.style.cursor = 'grab';
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    };
    canvas.addEventListener('pointerup', function (e) {
      end(e);
      if (S0.pov === 'fps') {
        if (down && !down.moved && document.pointerLockElement !== canvas && canvas.requestPointerLock) {
          try { var rq = canvas.requestPointerLock(); if (rq && rq.catch) rq.catch(function () {}); } catch (err3) {}
        }
      } else if (S0.mode === 'roam' && down && !down.moved && P && P.mode === 'walk' && !P.path.length) clickMove(e.clientX, e.clientY);
      down = null;
    });
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (S0.pov === 'fps') { fovT = clamp(fovT + dy * 0.03, 42, 92); return; }
      zoomT = clamp(zoomT * Math.exp(dy * 0.0012), ZMIN, ZMAX);
    }, { passive: false });
    var keyMap = { ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd', ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };
    canvas.addEventListener('keydown', function (e) {
      if (S0.mode !== 'roam') return;
      var k = keyMap[e.key];
      if (k) {
        e.preventDefault();
        keys[k] = true;
        if (P.path.length) { var last = P.path[P.path.length - 1]; P.x = last[0]; P.z = last[1]; P.path = []; }
      } else if (e.key === 'Shift') keys.sh = true;
      else if (e.key === 'q' || e.key === 'Q') { if (S0.pov === 'fps') S0.yaw += Math.PI / 4; else S0.azTarget += Math.PI / 4; }
      else if (e.key === 'e' || e.key === 'E') { if (S0.pov === 'fps') S0.yaw -= Math.PI / 4; else S0.azTarget -= Math.PI / 4; }
      else if (e.key === 'v' || e.key === 'V') setPov(S0.pov === 'fps' ? 'drone' : 'fps');
      else if (e.key === 'Escape') exitRoam();
    });
    canvas.addEventListener('keyup', function (e) { var k = keyMap[e.key]; if (k) keys[k] = false; if (e.key === 'Shift') keys.sh = false; });
    canvas.addEventListener('blur', function () { keys = {}; });

    // ---------- per-frame ----------
    var updateWalls = function (a, dt, full, upK) {
      var cx = Math.sin(a), cz = Math.cos(a);
      walls.forEach(function (w) {
        var d = w.n[0] * cx + w.n[1] * cz;
        var target = w.part ? (full ? 1 : 0.28) : ((d > 0.25 && !full) ? 0 : 1);
        w.f += (target - w.f) * Math.min(1, dt * 7);
        w.mesh.scale.y = 0.1 + 0.9 * w.f;
        var s = smooth((w.f - 0.35) / 0.55);
        (w.anchors && w.anchors.length ? w.anchors : [w.anchor]).forEach(function (an) {
          if (!an) return;
          an.visible = s > 0.02;
          an.scale.setScalar(Math.max(s, 0.001));
        });
        var ls = w.part ? 1 : s;
        w.lights.forEach(function (l) { l.light.intensity = l.base * ls * (1 + 1.1 * (ctx.env ? ctx.env.night : 0)) * (l.upper ? upK : 1); });
      });
    };
    updateWalls(S0.az, 100, false, 0);
    var lastLabel = '';
    var updateLabel = function () {
      var name = '';
      if (S0.mode === 'roam' && P && P.mode === 'walk' && !P.path.length) {
        var bd = 1e9;
        pois.forEach(function (p) {
          var d = Math.hypot(p.x - P.x, p.z - P.z);
          if (d < p.r && d < bd) { bd = d; name = p.name; }
        });
      }
      if (name !== lastLabel) {
        lastLabel = name;
        if (labelEl) { if (name) labelEl.textContent = name; labelEl.style.opacity = name ? '1' : '0'; }
      }
    };

    var last = performance.now();
    var tick = function (now) {
      ctx.raf = requestAnimationFrame(tick);
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      S0.t += dt;
      if (S0.intro < 1) S0.intro = Math.min(1, S0.intro + dt / 1.3);
      var p = S0.intro - 1;
      var sc = Math.max(0.001, 1 + 2.70158 * p * p * p + 1.70158 * p * p);
      root.scale.setScalar(sc);
      root.position.set(H.x * (1 - sc), 0, H.z * (1 - sc));   // pop in around the house, not the island centre

      S0.az += (S0.azTarget - S0.az) * Math.min(1, dt * 7);
      var sway = (reduce || S0.interacted) ? 0 : Math.sin(S0.t * 0.5) * 0.05;
      var a = S0.az + sway;

      stepPlayer(dt, S0.t, S0.pov === 'fps' ? S0.yaw : a);

      S0.modeT = clamp(S0.modeT + (S0.mode === 'roam' ? 1 : -1) * dt / 1.2, 0, 1);
      var e = smooth(S0.modeT);
      var desired = (S0.mode === 'roam' && P) ? new T.Vector3(P.x, P.y + 0.4, P.z) : roomTarget;
      S0.focus.lerp(desired, 1 - Math.exp(-dt * 4));
      zoom += (zoomT - zoom) * Math.min(1, dt * 9);
      var shExt = 18 + 11 * zoom, shCam = sun.shadow.camera;
      if (Math.abs(shExt - shCam.right) > 0.4) { shCam.left = -shExt; shCam.right = shExt; shCam.top = shExt; shCam.bottom = -shExt; shCam.updateProjectionMatrix(); }
      applyFrustum(e);

      var f = S0.focus;
      camera.position.set(f.x + DIST * Math.cos(EL) * Math.sin(a), f.y + DIST * Math.sin(EL), f.z + DIST * Math.cos(EL) * Math.cos(a));
      camera.lookAt(f);
      var fps = S0.pov === 'fps' && P;
      if (ctx.env) ctx.env.update(dt, f, fps ? S0.yaw : a);
      else {
        sun.position.set(f.x + Math.sin(a + 0.6) * 9, 15, f.z + Math.cos(a + 0.6) * 9);
        sun.target.position.set(f.x, 0, f.z);
      }
      ctx.shadowPlane.position.x = f.x;
      ctx.shadowPlane.position.z = f.z;
      S0.floor = (S0.mode === 'roam' && P && P.lv) ? 2 : 1;   // the cutaway always shows the floor the character is on
      var showUp = S0.pov === 'fps' || S0.floor === 2;
      if (ctx.house && ctx.house.upper.visible !== showUp) ctx.house.upper.visible = showUp;
      updateWalls(S0.az, dt, S0.pov === 'fps', showUp ? 1 : 0);

      // tall props between the camera and the focus shrink so they never hide the view
      var cx = Math.sin(a), cz = Math.cos(a);
      tall.forEach(function (o) {
        var vx = o.x - f.x, vz = o.z - f.z;
        var along = vx * cx + vz * cz, lat = Math.abs(vx * cz - vz * cx);
        var hide = along > 0.3 && along < lerp(22, 9, e) && lat < lerp(7, o.rad + 1.6, e);
        o.s = o.s === undefined ? 1 : o.s;
        o.s += ((hide ? 0.22 : 1) - o.s) * Math.min(1, dt * 6);
        o.g.scale.setScalar(o.base * o.s);
      });

      if (!reduce) for (var i = 0; i < anim.length; i++) anim[i](S0.t, dt, a);
      updateLabel();
      var cam = camera;
      if (fps) {
        var moved = keys.u || keys.d || keys.l || keys.r;
        bob = moved ? bob + dt * (keys.sh ? 8.5 : 6) : bob;
        bobAmt += ((moved ? 1 : 0) - bobAmt) * Math.min(1, dt * 5);
        var cp = Math.cos(S0.pitch);
        fpsCam.fov += (fovT - fpsCam.fov) * Math.min(1, dt * 8); fpsCam.updateProjectionMatrix();
        fpsCam.position.set(P.x, P.y + EYE + Math.sin(bob) * 0.011 * bobAmt, P.z);
        tmpV.set(P.x - Math.sin(S0.yaw) * cp, P.y + EYE + Math.sin(S0.pitch), P.z - Math.cos(S0.yaw) * cp);
        fpsCam.lookAt(tmpV);
        if (ctx.env && ctx.env.haze) { fog.color.copy(ctx.env.haze); scene.background = scene.background || new T.Color(); scene.background.copy(ctx.env.haze); }
        cam = fpsCam;
      } else if (scene.background) scene.background = null;
      if (ctx.post) ctx.post.render(scene, cam); else renderer.render(scene, cam);
    };
    ctx.raf = requestAnimationFrame(tick);

    ctx.dispose = function () {
      if (ctx.raf) cancelAnimationFrame(ctx.raf);
      if (ctx.ro) ctx.ro.disconnect();
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  };
})();
