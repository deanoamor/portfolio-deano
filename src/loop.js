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
      lastX: 0, t: 0, intro: reduce ? 1 : 0, focus: new T.Vector3(H.x, 0.1, H.z)
    };
    var keys = {};
    var zoom = 1, zoomT = 1, ZMIN = 0.5, ZMAX = 2;   // mouse-wheel zoom (multiplies the view height)
    var view = { w: 1440, h: 900 };
    var roomTarget = new T.Vector3(H.x, 0.1, H.z);

    // ---------- view size ----------
    var resize = function () {
      view.w = canvas.clientWidth || 1440;
      view.h = canvas.clientHeight || 900;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.w, view.h, false);
    };
    var applyFrustum = function (e) {
      var aspect = view.w / view.h;
      var hRoom = Math.max(9.2, 10.0 / aspect), hRoam = Math.max(6.8, 7.5 / aspect);
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
      var land = Math.hypot(x, z) <= islandR(Math.atan2(z, x)) - 1.4;
      if (!land && !onDock(x, z)) return true;
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (x > r[0] - R_P && x < r[2] + R_P && z > r[1] - R_P && z < r[3] + R_P) return true;
      }
      for (var j = 0; j < circles.length; j++) {
        if (Math.hypot(circles[j][0] - x, circles[j][1] - z) < circles[j][2] + R_P) return true;
      }
      return false;
    };
    var groundY = function (wx, wz) {
      if (onDock(wx, wz)) return -0.15;
      var x = (wx - H.x) / H.s, z = (wz - H.z) / H.s;   // house-local coordinates
      if (x > 4.9 && x < 7.2 && Math.abs(z + 4.0) < 1.0) {
        var u = clamp((x - 6.5) / 0.6, 0, 1);
        return (0.04 * (1 - u)) * H.s + GY * u;
      }
      var d = Math.max(Math.abs(x), Math.abs(z)) - 5.45;
      var t = clamp(d / 0.9, 0, 1);
      return 0.05 * H.s * (1 - t) + GY * t;
    };

    var marker = new T.Mesh(new T.RingGeometry(0.28, 0.4, 24), new T.MeshBasicMaterial({ color: '#E8896B', transparent: true, opacity: 0.9, depthWrite: false }));
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    root.add(marker);

    var stepPlayer = function (dt, t, a) {
      if (!P) return;
      if (P.mode === 'sit') { P.pose(t, dt, false); return; }
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
          var step = 3.4 * dt, nx = P.x + mx * step, nz = P.z + mz * step;
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
      P.sit();
      S0.az = AZ0 + wrapPi(S0.az - AZ0);
      S0.azTarget = AZ0 + clamp(wrapPi(S0.azTarget - AZ0), -Math.PI / 2, Math.PI / 2);
      rootEl.setAttribute('data-mode', 'room');
    };
    var walkTo = function (x, z) {
      if (S0.mode !== 'roam' || !P || P.mode !== 'walk' || P.path.length) return;
      if (!blocked(x, z)) P.dest = [x, z];
    };
    ctx.api = { rotateBy: rotateBy, enterRoam: enterRoam, exitRoam: exitRoam, walkTo: walkTo };
    ctx.state = S0;
    rootEl.setAttribute('data-mode', 'room');

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
      S0.dragging = true; S0.interacted = true; S0.lastX = e.clientX;
      down = { x: e.clientX, y: e.clientY, moved: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      canvas.style.cursor = 'grabbing';
      if (S0.mode === 'roam') { try { canvas.focus({ preventScroll: true }); } catch (err2) {} }
    });
    canvas.addEventListener('pointermove', function (e) {
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
      if (S0.mode === 'roam' && down && !down.moved && P && P.mode === 'walk' && !P.path.length) clickMove(e.clientX, e.clientY);
      down = null;
    });
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
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
      } else if (e.key === 'q' || e.key === 'Q') S0.azTarget += Math.PI / 4;
      else if (e.key === 'e' || e.key === 'E') S0.azTarget -= Math.PI / 4;
      else if (e.key === 'Escape') exitRoam();
    });
    canvas.addEventListener('keyup', function (e) { var k = keyMap[e.key]; if (k) keys[k] = false; });
    canvas.addEventListener('blur', function () { keys = {}; });

    // ---------- per-frame ----------
    var updateWalls = function (a, dt) {
      var cx = Math.sin(a), cz = Math.cos(a);
      walls.forEach(function (w) {
        var d = w.n[0] * cx + w.n[1] * cz;
        w.f += ((d > 0.25 ? 0 : 1) - w.f) * Math.min(1, dt * 7);
        w.mesh.scale.y = 0.1 + 0.9 * w.f;
        var s = smooth((w.f - 0.35) / 0.55);
        w.anchor.visible = s > 0.02;
        w.anchor.scale.setScalar(Math.max(s, 0.001));
        w.lights.forEach(function (l) { l.light.intensity = l.base * s * (1 + 1.1 * (ctx.env ? ctx.env.night : 0)); });
        w.low.forEach(function (m) { m.visible = w.f > 0.5; });
      });
    };
    updateWalls(S0.az, 100);
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

      stepPlayer(dt, S0.t, a);

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
      if (ctx.env) ctx.env.update(dt, f, a);
      else {
        sun.position.set(f.x + Math.sin(a + 0.6) * 9, 15, f.z + Math.cos(a + 0.6) * 9);
        sun.target.position.set(f.x, 0, f.z);
      }
      ctx.shadowPlane.position.x = f.x;
      ctx.shadowPlane.position.z = f.z;
      updateWalls(S0.az, dt);

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
      renderer.render(scene, camera);
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
