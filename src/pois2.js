(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.pois2 = function (ctx) {
    var T = ctx.T, C = ctx.C, root = ctx.root, rnd = ctx.rnd, mesh = ctx.mesh, box = ctx.box, cyl = ctx.cyl, sph = ctx.sph,
      matF = ctx.matF, mat = ctx.mat, glow = ctx.glow, GY = ctx.GY, WATER_Y = ctx.WATER_Y, safe = ctx.safe, circ = ctx.circ,
      rect = ctx.rect, anim = ctx.anim, tex = ctx.tex;

    // ---------- vegetable + flower garden ----------
    safe('garden', function () {
      [[1.8, 11.8], [1.8, 14.0], [5.9, 11.8]].forEach(function (b, i) {
        var bx = b[0], bz = b[1];
        box(root, 3.0, 0.35, 1.4, C.wood, bx, GY + 0.17, bz);
        box(root, 2.7, 0.1, 1.1, '#5b3a29', bx, GY + 0.37, bz);
        rect(bx - 1.6, bz - 0.8, bx + 1.6, bz + 0.8);
        for (var k = 0; k < 5; k++) {
          var x = bx - 1.2 + k * 0.6;
          if (i === 0) {
            cyl(root, 0.05, 0.05, 1.7, C.green, x, GY + 1.25, bz, 0, 0, 0, 6);
            cyl(root, 0.4, 0.4, 0.1, C.mustard, x, GY + 2.15, bz + 0.05, Math.PI / 2 - 0.2, 0, 0, 14);
            cyl(root, 0.2, 0.2, 0.14, '#7a5238', x, GY + 2.15, bz + 0.1, Math.PI / 2 - 0.2, 0, 0, 12);
            sph(root, 1, C.green2, x + 0.2, GY + 1.0, bz, 0.22, 0.1, 0.14);
          } else if (i === 1) {
            var leaf = mesh(root, ctx.gIco, matF(C.green2), x, GY + 0.6, bz - 0.2);
            leaf.scale.setScalar(0.28);
            var leaf2 = mesh(root, ctx.gIco, matF('#5FB07A'), x, GY + 0.6, bz + 0.25);
            leaf2.scale.setScalar(0.24);
            sph(root, 0.1, '#E5594B', x + 0.12, GY + 0.62, bz + 0.1);
          } else {
            var cols = [C.pink, C.cream, '#B79CF2', C.mustard, C.coral];
            cyl(root, 0.025, 0.025, 0.7, C.green, x, GY + 0.7, bz - 0.25, 0, 0, 0, 5);
            sph(root, 0.14, cols[k % 5], x, GY + 1.08, bz - 0.25);
            cyl(root, 0.025, 0.025, 0.55, C.green, x + 0.2, GY + 0.62, bz + 0.25, 0, 0, 0, 5);
            sph(root, 0.13, cols[(k + 2) % 5], x + 0.2, GY + 0.92, bz + 0.25);
          }
        }
      });
      // scarecrow (sized to the person: ~1.7 tall)
      var sx = 8.6, sz = 12.6;
      var sc = new T.Group();
      sc.position.set(sx, GY, sz);
      sc.scale.setScalar(0.65);
      root.add(sc);
      cyl(sc, 0.06, 0.06, 2.4, C.woodDark, 0, 1.2, 0, 0, 0, 0, 6);
      box(sc, 1.6, 0.1, 0.1, C.woodDark, 0, 1.7, 0);
      box(sc, 0.6, 0.8, 0.3, C.coral, 0, 1.55, 0);
      sph(sc, 0.3, C.wood2, 0, 2.25, 0);
      cyl(sc, 0.0, 0.42, 0.4, C.mustard, 0, 2.65, 0, 0, 0, 0, 10);
      cyl(sc, 0.5, 0.5, 0.05, C.mustard, 0, 2.46, 0, 0, 0, 0, 12);
      circ(sx, sz, 0.4);
    });

    // ---------- picnic spot ----------
    safe('picnic', function () {
      var bx = -5.0, bz = 12.8;
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
        var sq = box(root, 0.65, 0.05, 0.65, (i + j) % 2 ? C.cream : C.coral, bx - 0.975 + i * 0.65, GY + 0.03, bz - 0.975 + j * 0.65);
        sq.castShadow = false;
      }
      box(root, 0.7, 0.4, 0.5, C.wood2, bx + 0.4, GY + 0.28, bz - 0.3);
      mesh(root, new T.TorusGeometry(0.28, 0.04, 6, 12, Math.PI), mat(C.wood), bx + 0.4, GY + 0.48, bz - 0.3);
      [[-0.5, 0.3], [-0.3, 0.55], [-0.75, 0.6]].forEach(function (p) { sph(root, 0.13, '#E5594B', bx + p[0], GY + 0.15, bz + p[1]); });
      cyl(root, 0.1, 0.08, 0.18, C.teal, bx - 0.2, GY + 0.14, bz - 0.7, 0, 0, 0, 10);
      cyl(root, 0.05, 0.05, 2.7, C.wood, bx - 1.8, GY + 1.35, bz + 0.2, 0, 0, 0, 6);
      mesh(root, new T.ConeGeometry(1.9, 0.8, 10), matF(C.coral), bx - 1.8, GY + 2.9, bz + 0.2);
      mesh(root, new T.ConeGeometry(1.2, 0.85, 10), matF(C.cream), bx - 1.8, GY + 2.92, bz + 0.2);
      circ(bx + 0.4, bz - 0.3, 0.45);
      circ(bx - 1.8, bz + 0.2, 0.2);
    });



    // ---------- river from the mountains to the sea (flowing texture, stone banks, blocks the way like water should) ----------
    safe('river', function () {
      var pts = [[-24, 2], [-22.5, 8], [-22.5, 14], [-20.5, 20], [-17, 26], [-13, 31], [-9, 38]];
      var W = 3.4, len = [0];
      for (var i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      var N = pts.length, pos = new Float32Array(N * 6), uv = new Float32Array(N * 4), idx = [];
      var norm = function (i) {
        var a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)];
        var dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
        return [-dz / l, dx / l];
      };
      pts.forEach(function (p2, i) {
        var n = norm(i);
        pos.set([p2[0] + n[0] * W / 2, GY + 0.04, p2[1] + n[1] * W / 2, p2[0] - n[0] * W / 2, GY + 0.04, p2[1] - n[1] * W / 2], i * 6);
        uv.set([0, len[i] / 5, 1, len[i] / 5], i * 4);
        if (i < N - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      });
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      var rtex = tex(128, 256, function (g, w, h) {
        g.fillStyle = '#35B1DE'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#4DC6EA';
        for (var k = 0; k < 14; k++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 14 + Math.random() * 22, 5 + Math.random() * 6, 0, 0, 7); g.fill(); }
        g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.lineCap = 'round';
        for (var q = 0; q < 12; q++) {
          var x0 = 10 + Math.random() * (w - 20), y0 = Math.random() * h;
          g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 14, y0 + 10, x0 - 14, y0 + 22, x0 + 6, y0 + 36); g.stroke();
        }
      });
      rtex.wrapS = rtex.wrapT = T.RepeatWrapping;
      var rm = new T.Mesh(geo, new T.MeshBasicMaterial({ map: rtex }));
      rm.renderOrder = 1; rm.frustumCulled = false;
      root.add(rm);
      anim.push(function (t) { rtex.offset.y = -t * 0.35; });
      ctx.river = pts;
      // stone banks + obstacle circles so trees keep clear and you cannot walk on the water
      var banks = [];
      for (var s = 0; s < N - 1; s++) {
        var segLen = len[s + 1] - len[s], steps = Math.max(1, Math.round(segLen / 1.5));
        for (var k = 0; k < steps; k++) {
          var t2 = k / steps, cx = pts[s][0] + (pts[s + 1][0] - pts[s][0]) * t2, cz = pts[s][1] + (pts[s + 1][1] - pts[s][1]) * t2;
          var n2 = norm(s);
          [-1, 1].forEach(function (sd) {
            var sz = 0.5 + rnd() * 0.35;
            banks.push({ x: cx + n2[0] * sd * (W / 2 + 0.2), y: GY + 0.1, z: cz + n2[1] * sd * (W / 2 + 0.2), ry: rnd() * 3, sx: sz * 1.4, sy: sz * 0.8, sz: sz, c: rnd() < 0.5 ? '#7B8791' : '#6A7681' });
          });
          circ(cx, cz, W / 2 + 0.35);
        }
      }
      ctx.inst(ctx.gIco, new T.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1 }), banks, true);
    });

    // ---------- timber cottages with red tile roofs ----------
    safe('cottages', function () {
      var plaster = '#EBE1C9', timber = '#4A3426', tileA = '#A83A2F', tileB = '#8E2F26', stoneC = '#8F9AA2';
      var cottage = function (x, z, ry, s) {
        var g = new T.Group();
        g.position.set(x, GY, z); g.rotation.y = ry; g.scale.setScalar(s);
        root.add(g);
        box(g, 4.7, 0.4, 3.7, stoneC, 0, 0.2, 0);                                    // stone footing
        box(g, 4.2, 2.5, 3.2, plaster, 0, 1.65, 0);                                  // walls
        [[-2.1, -1.6], [2.1, -1.6], [-2.1, 1.6], [2.1, 1.6]].forEach(function (c) { box(g, 0.22, 2.6, 0.22, timber, c[0], 1.7, c[1]); });
        [0.55, 1.55, 2.85].forEach(function (y) {
          box(g, 4.3, 0.15, 0.2, timber, 0, y, 1.62); box(g, 4.3, 0.15, 0.2, timber, 0, y, -1.62);
          box(g, 0.2, 0.15, 3.3, timber, 2.12, y, 0); box(g, 0.2, 0.15, 3.3, timber, -2.12, y, 0);
        });
        [-1.0, 1.0].forEach(function (x2) { box(g, 0.14, 2.4, 0.2, timber, x2, 1.7, 1.62); });
        box(g, 0.14, 1.5, 0.2, timber, -1.5, 2.05, 1.62, 0, 0, 0.7);
        box(g, 0.14, 1.5, 0.2, timber, 1.5, 2.05, 1.62, 0, 0, -0.7);
        // pitched roof
        var rise = 1.9, half = 2.15, len = Math.hypot(half, rise), ang = Math.atan2(rise, half);
        [-1, 1].forEach(function (sd) {
          var rg = new T.Group();
          rg.position.set(0, 2.9 + rise / 2, sd * half / 2); rg.rotation.x = sd * ang;
          g.add(rg);
          box(rg, 5.5, 0.2, len + 0.55, tileA, 0, 0.02, 0);
          for (var i = 0; i < 7; i++) box(rg, 5.52, 0.07, 0.3, i % 2 ? tileB : '#B84738', 0, 0.13, -len / 2 + 0.3 + i * (len - 0.3) / 6);
        });
        var tri = new T.Shape();
        tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, rise + 0.02); tri.closePath();
        var gg = new T.ExtrudeGeometry(tri, { depth: 0.18, bevelEnabled: false });
        gg.translate(0, 0, -0.09);
        [-1, 1].forEach(function (sd) { var m = new T.Mesh(gg, mat(plaster)); m.rotation.y = sd * Math.PI / 2; m.position.set(sd * 2.1, 2.9, 0); m.castShadow = true; g.add(m); });
        box(g, 5.6, 0.2, 0.5, tileB, 0, 2.9 + rise + 0.1, 0);
        box(g, 0.7, 2.1, 0.7, stoneC, -1.4, 4.6, -0.7);                              // chimney
        box(g, 0.95, 0.2, 0.95, '#6F7A82', -1.4, 5.7, -0.7);
        // door, steps, windows
        box(g, 1.0, 1.7, 0.16, '#5B3A29', 0.0, 1.25, 1.66);
        box(g, 1.2, 0.14, 0.18, timber, 0, 2.15, 1.66);
        sph(g, 0.06, '#E2B450', 0.32, 1.2, 1.78);
        [0, 1, 2].forEach(function (i) { box(g, 1.5 - i * 0.1, 0.22, 0.5, '#9AA3A8', 0, 0.11 + i * 0.0, 2.15 + (2 - i) * 0.45 - 0.45 + 0.0); });
        [-1.55, 1.55].forEach(function (wx) {
          box(g, 0.8, 0.8, 0.12, '#7FA7B8', wx, 1.7, 1.66); box(g, 0.1, 0.8, 0.14, timber, wx, 1.7, 1.67); box(g, 0.8, 0.1, 0.14, timber, wx, 1.7, 1.67);
          box(g, 0.34, 0.9, 0.08, '#6E8F5E', wx - 0.62, 1.7, 1.66); box(g, 0.34, 0.9, 0.08, '#6E8F5E', wx + 0.62, 1.7, 1.66);
          box(g, 0.95, 0.12, 0.3, C.wood, wx, 1.22, 1.75);
        });
        ctx.bake(g);
        circ(x, z, 2.3 * s);
        circ(x + Math.sin(ry) * 0.9 * s, z + Math.cos(ry) * 0.9 * s, 2.3 * s);
        ctx.blobs.push([x, z, 3.6 * s]);
      };
      cottage(19, 14, -0.65, 1.15);
      cottage(-6, 23, 0.4, 1.1);
      cottage(26, -9, 2.3, 1.1);
    });

    // ---------- dock, boat, mailbox, lantern ----------
    safe('dock', function () {
      var d = ctx.dock;
      var g = new T.Group();
      g.position.set(d.ox, 0, d.oz);
      g.rotation.y = -d.a;
      root.add(g);
      for (var i = 0; i < 14; i++) box(g, 0.62, 0.1, 1.7, C.wood, i * 0.7 + 0.3, -0.2, 0);
      [0, 6, 12].forEach(function (k) {
        cyl(g, 0.1, 0.1, 1.6, C.woodDark, k * 0.7 + 0.3, -0.6, 0.95, 0, 0, 0, 8);
        cyl(g, 0.1, 0.1, 1.6, C.woodDark, k * 0.7 + 0.3, -0.6, -0.95, 0, 0, 0, 8);
      });
      cyl(g, 0.05, 0.05, 1.1, C.wood, 0.6, 0.25, 1.4, 0, 0, 0, 6);
      box(g, 0.7, 0.4, 0.45, C.coral, 0.6, 0.95, 1.4);
      box(g, 0.05, 0.4, 0.05, C.mustard, 0.85, 1.25, 1.4);
      cyl(g, 0.06, 0.06, 1.8, C.ink, 9.6, 0.7, 0.85, 0, 0, 0, 6);
      mesh(g, new T.SphereGeometry(0.16, 10, 8), glow('#FFE2A0'), 9.6, 1.75, 0.85, 0, 0, 0, false);
      var lamp = new T.PointLight(0xffc27a, 0.8, 10, 2);
      lamp.position.set(9.6, 1.8, 0.85);
      g.add(lamp);
      var boat = new T.Group();
      boat.position.set(7.2, -1.12, 2.3);
      boat.rotation.y = 0.1;
      g.add(boat);
      box(boat, 2.5, 0.4, 1.05, C.coral, 0, 0.1, 0);
      box(boat, 2.2, 0.12, 0.8, C.cream, 0, 0.3, 0);
      box(boat, 0.16, 0.12, 0.9, C.wood, 0.2, 0.4, 0);
      anim.push(function (t) {
        boat.position.y = -1.12 + Math.sin(t * 1.4) * 0.04;
        boat.rotation.z = Math.sin(t * 1.1) * 0.04;
      });
    });

    // ---------- hot-air balloon ----------
    safe('balloon', function () {
      var bt = tex(256, 128, function (g, w, h) {
        var cols = [C.coral, C.cream, C.teal, C.mustard];
        for (var i = 0; i < 8; i++) { g.fillStyle = cols[i % 4]; g.fillRect(i * w / 8, 0, w / 8 + 1, h); }
      });
      var g = new T.Group();
      g.scale.setScalar(1.3);
      root.add(g);
      var env = new T.Mesh(new T.SphereGeometry(2.4, 20, 14), new T.MeshLambertMaterial({ map: bt }));
      env.scale.set(1, 1.2, 1);
      env.position.y = 3.6;
      env.castShadow = true;
      g.add(env);
      box(g, 0.9, 0.7, 0.9, C.wood, 0, 0.35, 0);
      [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(function (p) { cyl(g, 0.02, 0.02, 1.8, C.ink, p[0], 1.4, p[1], 0, 0, 0, 4); });
      anim.push(function (t) {
        var ang = 0.6 + t * 0.025;
        g.position.set(Math.cos(ang) * 58, 16 + Math.sin(t * 0.6) * 0.5, Math.sin(ang) * 58);
        g.rotation.y = t * 0.1;
      });
    });

    // ---------- butterflies ----------
    safe('butterflies', function () {
      var cols = ['#F2C14E', '#E8896B', '#F4EFE2', '#F7B2C4', '#7FBDB8', '#F2A65A'];
      var centers = [[-10.5, -1.5], [3.5, 12.8], [-5, 12.8], [9.6, 6], [11.5, -6.5], [-8, 4]];
      var bf = [];
      for (var i = 0; i < 9; i++) {
        var g = new T.Group();
        root.add(g);
        var wm = new T.MeshBasicMaterial({ color: cols[i % cols.length], side: T.DoubleSide });
        var mk = function (s) {
          var piv = new T.Group();
          g.add(piv);
          var w = new T.Mesh(new T.PlaneGeometry(0.3, 0.24), wm);
          w.rotation.x = -Math.PI / 2;
          w.position.x = s * 0.15;
          piv.add(w);
          return piv;
        };
        bf.push({ g: g, l: mk(1), r: mk(-1), c: centers[i % centers.length], ph: rnd() * 6.28, rad: 1.8 + rnd() * 2.2, sp: 0.3 + rnd() * 0.3 });
      }
      anim.push(function (t) {
        bf.forEach(function (b) {
          var ang = t * b.sp + b.ph;
          b.g.position.set(b.c[0] + Math.cos(ang) * b.rad, GY + 1.0 + Math.sin(t * 1.7 + b.ph) * 0.35, b.c[1] + Math.sin(ang * 1.3) * b.rad);
          b.g.rotation.y = -(ang + Math.PI / 2);
          var f = Math.sin(t * 16 + b.ph) * 0.8;
          b.l.rotation.z = f;
          b.r.rotation.z = -f;
        });
      });
    });
  };
})();
