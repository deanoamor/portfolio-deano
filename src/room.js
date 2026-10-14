(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.room = function (ctx) {
    var T = ctx.T, C = ctx.C, rnd = ctx.rnd, mat = ctx.mat, mesh = ctx.mesh, box = ctx.box, cyl = ctx.cyl,
      sph = ctx.sph, flat = ctx.flat, tex = ctx.tex, glow = ctx.glow, walls = ctx.walls, anchors = ctx.anchors, safe = ctx.safe,
      HM = ctx.home;
    // everything below is modelled at full size in local coordinates, then scaled down as one house
    var root = new T.Group();
    root.position.set(HM.x, 0, HM.z);
    root.scale.setScalar(HM.s);
    ctx.root.add(root);
    ctx.homeRoot = root;
    var rect = function (x0, z0, x1, z1) { ctx.rect(HM.x + x0 * HM.s, HM.z + z0 * HM.s, HM.x + x1 * HM.s, HM.z + z1 * HM.s); };
    var circ = function (x, z, r) { ctx.circ(HM.x + x * HM.s, HM.z + z * HM.s, r * HM.s); };

    // ---------- textures ----------
    var tScreen = tex(1024, 560, function (g, w, h) {
      g.fillStyle = '#14302E'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#0E2422'; g.fillRect(0, 0, w, 44);
      ['#E8896B', '#F2C14E', '#7FBDB8'].forEach(function (c, i) { g.fillStyle = c; g.beginPath(); g.arc(30 + i * 30, 22, 8, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = '#10282A'; g.fillRect(0, 44, 190, h - 44);
      for (var i = 0; i < 8; i++) { g.fillStyle = i === 2 ? '#7FBDB8' : '#2C4B49'; g.fillRect(24, 76 + i * 40, 120 + (i % 3) * 14, 14); }
      var cols = ['#7FBDB8', '#F2C14E', '#E8896B', '#C9D5C3', '#9AD8A6'];
      for (var r = 0; r < 13; r++) {
        var x = 230 + ((r % 4) === 1 ? 44 : 0) + ((r % 6) === 3 ? 44 : 0);
        var n = 2 + Math.floor(rnd() * 3);
        for (var j = 0; j < n; j++) {
          var len = 50 + rnd() * 150;
          g.fillStyle = cols[Math.floor(rnd() * cols.length)];
          g.fillRect(x, 78 + r * 34, len, 14);
          x += len + 16;
        }
      }
      g.fillStyle = '#F4EFE2'; g.fillRect(420, 78 + 12 * 34, 12, 18);
    });
    var tWindow = tex(512, 448, function (g, w, h) {
      g.fillStyle = '#BFE5EE'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#FFE9A8'; g.beginPath(); g.arc(390, 110, 46, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF';
      [[120, 120, 70, 26], [210, 150, 60, 22], [400, 240, 64, 22]].forEach(function (e) { g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = '#9ACFA4'; g.beginPath(); g.ellipse(120, h, 260, 150, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#74B58A'; g.beginPath(); g.ellipse(400, h, 300, 110, 0, 0, Math.PI * 2); g.fill();
    });
    var artA = tex(256, 320, function (g, w, h) {
      g.fillStyle = '#F4EFE2'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#E8896B'; g.beginPath(); g.arc(128, 120, 60, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#7FBDB8'; g.beginPath(); g.ellipse(60, h, 160, 120, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3EA094'; g.beginPath(); g.ellipse(220, h, 150, 90, 0, 0, Math.PI * 2); g.fill();
    });
    var artB = tex(256, 320, function (g, w, h) {
      g.fillStyle = '#C9D5C3'; g.fillRect(0, 0, w, h);
      ['#F4EFE2', '#E8896B', '#223433'].forEach(function (c, i) {
        var x = 24 + i * 76;
        g.fillStyle = c; g.beginPath(); g.moveTo(x, 290); g.lineTo(x, 150); g.arc(x + 32, 150, 32, Math.PI, 0); g.lineTo(x + 64, 290); g.closePath(); g.fill();
      });
    });
    var artC = tex(256, 320, function (g, w, h) {
      g.fillStyle = '#F2C14E'; g.fillRect(0, 0, w, h);
      ['#223433', '#F2C14E', '#E8896B', '#F4EFE2', '#7FBDB8'].forEach(function (c, i) {
        g.fillStyle = c; g.beginPath(); g.arc(128, 160, 104 - i * 20, 0, Math.PI * 2); g.fill();
      });
    });
    var frame = function (p, x, y, z, w, h, t) {
      box(p, w, h, 0.08, C.ink, x, y, z);
      flat(p, w - 0.2, h - 0.2, new T.MeshBasicMaterial({ map: t }), x, y, z + 0.05);
    };
    var plant = function (p, x, y, z, s, potC) {
      cyl(p, 0.42 * s, 0.3 * s, 0.7 * s, potC, x, y + 0.35 * s, z, 0, 0, 0, 16);
      cyl(p, 0.38 * s, 0.38 * s, 0.04 * s, '#5b3a29', x, y + 0.7 * s, z, 0, 0, 0, 16);
      var gs = [C.green, C.green2, '#3E9368'];
      for (var i = 0; i < 8; i++) {
        var a = i / 8 * Math.PI * 2 + 0.3;
        var lf = sph(p, 1, gs[i % 3], x + Math.cos(a) * 0.2 * s, y + 1.25 * s, z + Math.sin(a) * 0.2 * s, 0.2 * s, 0.62 * s, 0.12 * s);
        lf.rotation.set(Math.sin(a) * 0.55, -a, -Math.cos(a) * 0.55);
      }
      sph(p, 1, C.green2, x, y + 1.35 * s, z, 0.16 * s, 0.6 * s, 0.1 * s);
    };
    var stringLights = function (p, x0, x1, y, sag, z, n) {
      var pts = [];
      for (var i = 0; i <= n * 4; i++) { var t = i / (n * 4); pts.push(new T.Vector3(x0 + (x1 - x0) * t, y - sag * 4 * t * (1 - t), z)); }
      p.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x223433 })));
      var bm = glow('#FFE2A0');
      for (var k = 1; k < n; k++) {
        var u = k / n;
        var b = new T.Mesh(new T.SphereGeometry(0.1, 10, 8), bm);
        b.position.set(x0 + (x1 - x0) * u, y - sag * 4 * u * (1 - u) - 0.1, z);
        p.add(b);
      }
    };

    // ---------- floor ----------
    box(root, 11.2, 0.8, 11.2, C.woodDark, 0, -0.4, 0);
    for (var i = 0; i < 10; i++) {
      var pl = box(root, 10, 0.05, 0.96, i % 2 ? '#E2B27A' : '#D8A46C', 0, 0.025, -4.5 + i);
      pl.castShadow = false;
    }
    // step outside the door
    box(root, 1.1, 0.32, 1.9, '#D9D2C0', 6.05, -0.14, -4.0);

    // ---------- walls ----------
    var WALL_H = 5.2, TH = 0.4;
    var makeWall = function (id, nx, nz, px, pz, inner, innerColor, ax, az, ary, segs) {
      var outer = mat(C.cream);
      var ms = [outer, outer, mat('#EDE6D6'), outer, outer, outer];
      ms[inner] = mat(innerColor);
      var grp = new T.Group();
      grp.position.set(px, 0, pz);
      root.add(grp);
      var meshes = segs.map(function (sg) {
        var geo = new T.BoxGeometry(sg[0], sg[1], sg[2]);
        geo.translate(0, sg[1] / 2, 0);
        var m = new T.Mesh(geo, ms);
        m.position.set(sg[3] || 0, sg[4] || 0, sg[5] || 0);
        m.castShadow = true; m.receiveShadow = true;
        grp.add(m);
        return m;
      });
      var a = new T.Group();
      a.position.set(ax, 0, az);
      a.rotation.y = ary;
      root.add(a);
      anchors[id] = a;
      var w = { id: id, n: [nx, nz], mesh: grp, anchor: a, f: 1, lights: [], low: [], parts: meshes };
      walls.push(w);
      box(a, 10, 0.3, 0.1, C.cream, 0, 0.15, 0.05);
      return w;
    };
    makeWall('N', 0, -1, 0, -5.2, 4, '#C9D5C3', 0, -5, 0, [[10.8, WALL_H, TH]]);
    makeWall('S', 0, 1, 0, 5.2, 5, '#B7D6D2', 0, 5, Math.PI, [[10.8, WALL_H, TH]]);
    makeWall('W', -1, 0, -5.2, 0, 0, '#D3DEC4', -5, 0, Math.PI / 2, [[TH, WALL_H, 10]]);
    // east wall has a doorway at world z -4.7 .. -3.3
    var eWall = makeWall('E', 1, 0, 5.2, 0, 1, '#C9D5C3', 5, 0, -Math.PI / 2, [
      [TH, WALL_H, 0.3, 0, 0, -4.85],
      [TH, WALL_H, 8.3, 0, 0, 0.85],
      [TH, 1.6, 1.4, 0, 3.6, -4.0]
    ]);
    eWall.low.push(eWall.parts[2]);
    var addLight = function (id, parent, color, intensity, dist, x, y, z) {
      var l = new T.PointLight(color, intensity, dist * HM.s, 2);
      l.position.set(x, y, z);
      parent.add(l);
      walls.filter(function (w) { return w.id === id; })[0].lights.push({ light: l, base: intensity });
    };

    // ---------- rug + sleeping cat ----------
    [[2.3, C.teal, 0.08], [1.75, C.sage, 0.09], [1.15, C.teal, 0.1]].forEach(function (r) {
      mesh(root, new T.CylinderGeometry(r[0], r[0], 0.06, 48), mat(r[1]), 0.6, r[2], 1.0, 0, 0, 0, false).receiveShadow = true;
    });
    var cat = new T.Group();
    cat.position.set(0.3, 0.14, 0.9);
    cat.rotation.y = 0.7;
    root.add(cat);
    sph(cat, 0.55, '#F2A65A', 0, 0.38, 0, 1.25, 0.7, 0.9);
    sph(cat, 0.32, '#F2A65A', 0.66, 0.42, 0);
    cyl(cat, 0.0, 0.1, 0.22, '#F2A65A', 0.62, 0.76, 0.16, 0, 0, 0, 4);
    cyl(cat, 0.0, 0.1, 0.22, '#F2A65A', 0.62, 0.76, -0.16, 0, 0, 0, 4);
    sph(cat, 0.14, '#E2924A', -0.55, 0.2, 0.3);
    sph(cat, 0.14, '#E2924A', -0.4, 0.15, 0.5);
    sph(cat, 0.14, '#E2924A', -0.15, 0.15, 0.58);
    box(cat, 0.02, 0.03, 0.1, '#3b2a20', 0.96, 0.46, 0.12);
    box(cat, 0.02, 0.03, 0.1, '#3b2a20', 0.96, 0.46, -0.12);
    ctx.anim.push(function (t) { cat.scale.y = 1 + Math.sin(t * 1.8) * 0.025; });

    // ---------- NORTH: workstation ----------
    var N = anchors.N;
    var dx = -1.6, dz = 1.0;
    box(N, 4.4, 0.16, 1.8, C.wood, dx, 1.35, dz);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { box(N, 0.14, 1.3, 0.14, C.cream, dx + s[0] * 2.05, 0.7, dz + s[1] * 0.78); });
    box(N, 1.1, 1.2, 1.5, '#EFE9DA', dx + 1.55, 0.65, dz);
    [0.25, 0.65, 1.05].forEach(function (y) {
      box(N, 1.0, 0.34, 0.04, C.sage, dx + 1.55, y, dz + 0.77);
      box(N, 0.22, 0.05, 0.05, C.ink, dx + 1.55, y, dz + 0.81);
    });
    box(N, 0.8, 0.05, 0.5, C.ink, dx, 1.455, 0.75);
    box(N, 0.14, 0.55, 0.12, C.ink, dx, 1.755, 0.7);
    box(N, 2.2, 1.3, 0.12, C.ink, dx, 2.75, 0.75);
    flat(N, 2.0, 1.1, new T.MeshBasicMaterial({ map: tScreen }), dx, 2.75, 0.82);
    box(N, 1.3, 0.05, 0.42, C.cream, dx - 0.1, 1.455, 1.45);
    for (var r = 0; r < 3; r++) for (var k = 0; k < 10; k++) box(N, 0.1, 0.03, 0.09, '#CFC8B6', dx - 0.1 - 0.55 + k * 0.122, 1.495, 1.34 + r * 0.11);
    box(N, 0.95, 0.02, 0.8, C.teal, dx + 1.0, 1.44, 1.4);
    box(N, 0.2, 0.06, 0.3, C.cream, dx + 1.0, 1.48, 1.4);
    cyl(N, 0.15, 0.13, 0.28, C.cream, dx - 1.55, 1.57, 1.35);
    cyl(N, 0.12, 0.12, 0.02, '#5b3a29', dx - 1.55, 1.7, 1.35, 0, 0, 0, 16);
    mesh(N, new T.TorusGeometry(0.09, 0.025, 8, 14), mat(C.cream), dx - 1.37, 1.57, 1.35);
    var steam = [];
    for (var s = 0; s < 3; s++) {
      var sm = new T.Mesh(new T.SphereGeometry(0.07, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
      N.add(sm);
      steam.push({ m: sm, ph: s / 3, bx: dx - 1.55 });
    }
    ctx.anim.push(function (t) {
      steam.forEach(function (p) {
        var f = (t * 0.35 + p.ph) % 1;
        p.m.position.set(p.bx + Math.sin((t + p.ph) * 3) * 0.05, 1.78 + f * 0.9, 1.35);
        p.m.material.opacity = 0.5 * (1 - f);
        p.m.scale.setScalar(0.6 + f * 0.9);
      });
    });
    cyl(N, 0.28, 0.3, 0.06, C.ink, -3.4, 1.46, 0.5);
    box(N, 0.07, 0.9, 0.07, C.coral, -3.24, 1.92, 0.5, 0, 0, -0.35);
    box(N, 0.07, 0.8, 0.07, C.coral, -3.4, 2.59, 0.5, 0, 0, 0.9);
    cyl(N, 0.1, 0.3, 0.35, C.coral, -3.78, 2.72, 0.5, 0, 0, -0.4);
    mesh(N, new T.SphereGeometry(0.1, 10, 8), glow('#FFE7B0'), -3.72, 2.58, 0.5, 0, 0, 0, false);
    addLight('N', N, 0xffb36b, 0.9, 7, -3.6, 2.4, 0.8);
    // chair (the person sits here)
    var chair = new T.Group();
    chair.position.set(-1.8, 0.05, 2.4);
    chair.rotation.y = 0.35;
    N.add(chair);
    box(chair, 1.1, 0.18, 1.0, C.coral, 0, 0.78, 0);
    box(chair, 1.0, 1.1, 0.16, C.coral, 0, 1.45, 0.5, -0.08, 0, 0);
    cyl(chair, 0.07, 0.07, 0.5, C.ink, 0, 0.45, 0);
    [0, 1, 2].forEach(function (i) { box(chair, 1.0, 0.06, 0.12, C.ink, 0, 0.2, 0, 0, i * Math.PI / 3, 0); });
    for (var q = 0; q < 6; q++) { var a2 = q * Math.PI / 3; sph(chair, 0.07, C.ink, Math.cos(a2) * 0.5, 0.1, Math.sin(a2) * 0.5); }
    ctx.chair = chair;
    // window
    box(N, 2.6, 2.4, 0.14, C.cream, 3.0, 3.0, 0.07);
    flat(N, 2.2, 2.0, new T.MeshBasicMaterial({ map: tWindow }), 3.0, 3.0, 0.15);
    box(N, 0.08, 2.0, 0.06, C.cream, 3.0, 3.0, 0.17);
    box(N, 2.2, 0.08, 0.06, C.cream, 3.0, 3.0, 0.17);
    box(N, 0.55, 2.6, 0.12, C.coral, 1.5, 3.0, 0.28);
    box(N, 0.55, 2.6, 0.12, C.coral, 4.5, 3.0, 0.28);
    box(N, 3.8, 0.06, 0.06, C.ink, 3.0, 4.4, 0.28);
    box(N, 2.9, 0.1, 0.4, C.cream, 3.0, 1.75, 0.2);
    plant(N, 3.55, 1.8, 0.22, 0.45, C.cream);
    box(N, 2.8, 0.1, 0.55, C.wood, -2.6, 3.9, 0.275);
    var sc = [C.coral, C.mustard, C.teal, C.cream, C.ink, C.teal2, C.sage];
    var bx = -3.85;
    for (var b = 0; b < 7; b++) {
      var bw0 = 0.13 + rnd() * 0.08, bh0 = 0.5 + rnd() * 0.3;
      box(N, bw0, bh0, 0.38, sc[b], bx + bw0 / 2, 3.95 + bh0 / 2, 0.28);
      bx += bw0 + 0.02;
    }
    cyl(N, 0.14, 0.11, 0.2, C.coral, -1.55, 4.05, 0.28);
    sph(N, 0.17, C.green2, -1.55, 4.25, 0.28, 1, 0.8, 1);
    frame(N, 0.3, 3.9, 0.04, 1.1, 1.4, artC);
    plant(N, 1.2, 0.05, 0.9, 1.0, C.coral);

    // ---------- WEST: bookshelf + clock ----------
    var W = anchors.W;
    var bw = 3.4, bh = 4.2, bd = 0.9;
    box(W, 0.12, bh, bd, C.wood, -bw / 2 + 0.06, bh / 2, bd / 2);
    box(W, 0.12, bh, bd, C.wood, bw / 2 - 0.06, bh / 2, bd / 2);
    box(W, bw, bh, 0.08, '#B87B45', 0, bh / 2, 0.04);
    [0.06, 1.1, 2.1, 3.1, 4.14].forEach(function (y) { box(W, bw, 0.12, bd, C.wood, 0, y, bd / 2); });
    var bookCols = [C.coral, C.mustard, C.teal, C.cream, C.ink, C.teal2, C.sage, '#D56F5A'];
    [0.12, 1.16, 2.16, 3.16].forEach(function (by, r2) {
      if (r2 === 0) {
        box(W, 1.3, 0.8, 0.7, C.wood2, -0.8, by + 0.4, 0.5);
        box(W, 1.3, 0.8, 0.7, C.teal, 0.7, by + 0.4, 0.5);
        return;
      }
      var x = -bw / 2 + 0.22;
      var limit = bw / 2 - 0.22 - (r2 === 1 ? 1.0 : r2 === 3 ? 0.9 : 0);
      while (x < limit - 0.15) {
        var w2 = 0.13 + rnd() * 0.1, h2 = 0.55 + rnd() * 0.3;
        box(W, w2, h2, 0.6, bookCols[Math.floor(rnd() * bookCols.length)], x + w2 / 2, by + h2 / 2, 0.5);
        x += w2 + 0.015;
      }
    });
    plant(W, bw / 2 - 0.65, 1.16, 0.5, 0.5, C.cream);
    frame(W, bw / 2 - 0.55, 3.55, 0.6, 0.55, 0.7, artA);
    cyl(W, 0.6, 0.6, 0.1, C.cream, -3.6, 3.4, 0.07, Math.PI / 2, 0, 0, 32);
    mesh(W, new T.TorusGeometry(0.6, 0.06, 8, 32), mat(C.ink), -3.6, 3.4, 0.12);
    box(W, 0.06, 0.38, 0.03, C.ink, -3.6, 3.52, 0.15);
    box(W, 0.06, 0.28, 0.03, C.coral, -3.5, 3.38, 0.15, 0, 0, 1.2);

    // ---------- SOUTH: reading nook ----------
    var S = anchors.S;
    box(S, 4.6, 0.55, 1.9, C.teal2, 0, 0.33, 1.1);
    box(S, 4.6, 1.5, 0.55, C.teal2, 0, 0.8, 0.42);
    box(S, 0.55, 1.1, 1.9, '#4F9894', -2.025, 0.6, 1.1);
    box(S, 0.55, 1.1, 1.9, '#4F9894', 2.025, 0.6, 1.1);
    box(S, 1.75, 0.3, 1.35, C.teal, -0.88, 0.75, 1.35);
    box(S, 1.75, 0.3, 1.35, C.teal, 0.88, 0.75, 1.35);
    box(S, 0.7, 0.7, 0.2, C.coral, -1.3, 1.25, 0.95, 0, 0.1, 0.25);
    box(S, 0.7, 0.7, 0.2, C.mustard, 1.4, 1.2, 0.95, 0, -0.1, -0.2);
    box(S, 1.4, 0.1, 1.0, C.cream, 0.9, 0.95, 1.4, 0, 0.2, 0);
    box(S, 1.4, 0.11, 0.2, C.coral, 0.9, 0.96, 1.4, 0, 0.2, 0);
    frame(S, -1.7, 3.3, 0.04, 1.0, 1.3, artA);
    frame(S, 0, 3.3, 0.04, 1.2, 1.5, artB);
    frame(S, 1.7, 3.3, 0.04, 1.0, 1.3, artC);
    cyl(S, 0.35, 0.4, 0.08, C.ink, 3.6, 0.09, 0.9);
    cyl(S, 0.04, 0.04, 3.2, C.ink, 3.6, 1.7, 0.9, 0, 0, 0, 8);
    var shade = new T.Mesh(new T.CylinderGeometry(0.4, 0.65, 0.75, 24, 1, true), new T.MeshLambertMaterial({ color: '#FFE3B3', emissive: '#FFD08A', emissiveIntensity: 0.7, side: T.DoubleSide }));
    shade.position.set(3.6, 3.5, 0.9);
    S.add(shade);
    addLight('S', S, 0xffc27a, 1.0, 8, 3.6, 3.3, 1.0);
    cyl(S, 0.55, 0.55, 0.08, C.wood, -3.7, 1.1, 1.0);
    cyl(S, 0.06, 0.06, 1.0, C.ink, -3.7, 0.6, 1.0, 0, 0, 0, 8);
    box(S, 0.7, 0.12, 0.5, C.coral, -3.7, 1.2, 1.0, 0, 0.3, 0);
    box(S, 0.6, 0.1, 0.45, C.cream, -3.7, 1.31, 1.0, 0, -0.2, 0);
    cyl(S, 0.12, 0.1, 0.22, C.mustard, -3.55, 1.47, 1.05);
    stringLights(S, -4.6, 4.6, 4.7, 0.7, 0.12, 12);

    // ---------- EAST: record corner + door ----------
    var E = anchors.E;
    box(E, 3.8, 1.3, 1.3, C.wood, 0, 0.7, 0.7);
    box(E, 1.7, 1.0, 0.04, '#D49A60', -0.95, 0.7, 1.37);
    box(E, 1.7, 1.0, 0.04, '#D49A60', 0.95, 0.7, 1.37);
    box(E, 1.9, 0.18, 1.1, C.ink, -0.7, 1.44, 0.7);
    var vinyl = new T.Group();
    vinyl.position.set(-0.9, 1.56, 0.7);
    E.add(vinyl);
    cyl(vinyl, 0.45, 0.45, 0.05, '#15201f', 0, 0, 0, 0, 0, 0, 40);
    cyl(vinyl, 0.15, 0.15, 0.06, C.coral, 0, 0, 0, 0, 0, 0, 20);
    ctx.anim.push(function (t, dt) { vinyl.rotation.y += dt * 1.4; });
    box(E, 0.05, 0.05, 0.7, C.cream, -0.3, 1.58, 0.75, 0, 0.5, 0);
    box(E, 0.9, 1.7, 0.9, '#2d4a47', -2.8, 0.9, 0.6);
    box(E, 0.9, 1.7, 0.9, '#2d4a47', 2.8, 0.9, 0.6);
    cyl(E, 0.3, 0.3, 0.04, '#E2DDCC', -2.8, 1.2, 1.06, Math.PI / 2, 0, 0, 24);
    cyl(E, 0.3, 0.3, 0.04, '#E2DDCC', 2.8, 1.2, 1.06, Math.PI / 2, 0, 0, 24);
    cyl(E, 0.14, 0.14, 0.04, '#E2DDCC', -2.8, 0.55, 1.06, Math.PI / 2, 0, 0, 20);
    cyl(E, 0.14, 0.14, 0.04, '#E2DDCC', 2.8, 0.55, 1.06, Math.PI / 2, 0, 0, 20);
    frame(E, -1.3, 3.2, 0.04, 1.1, 1.1, artB);
    frame(E, 0, 3.2, 0.04, 1.1, 1.1, artC);
    frame(E, 1.3, 3.2, 0.04, 1.1, 1.1, artA);
    plant(E, 0.9, 1.35, 0.7, 0.5, C.coral);
    stringLights(E, -4.6, 4.6, 4.7, 0.7, 0.12, 12);
    // door frame + mat
    box(E, 0.14, 3.7, 0.16, C.cream, -4.74, 1.85, 0.08);
    box(E, 0.14, 3.7, 0.16, C.cream, -3.26, 1.85, 0.08);
    box(E, 1.7, 0.2, 0.18, C.cream, -4.0, 3.7, 0.09);
    box(E, 1.1, 0.03, 0.9, C.coral, -4.0, 0.07, 0.6);

    // ---------- collision data (world coords) ----------
    rect(-5.4, -5.4, 5.4, -5.0);
    rect(-5.4, 5.0, 5.4, 5.4);
    rect(-5.4, -5.0, -5.0, 5.0);
    rect(5.0, -5.0, 5.4, -4.7);
    rect(5.0, -3.3, 5.4, 5.0);
    rect(-3.8, -4.9, 0.6, -3.1);
    rect(-5.0, -1.7, -4.1, 1.7);
    rect(-2.3, 2.95, 2.3, 4.85);
    rect(3.6, -1.9, 5.0, 1.9);
    rect(3.95, -3.25, 4.85, -2.35);
    rect(3.95, 2.35, 4.85, 3.25);
    circ(1.2, -4.1, 0.5);
    circ(-3.6, 4.1, 0.45);
    circ(3.7, 4.0, 0.6);
    circ(0.3, 0.9, 0.55);
  };
})();
