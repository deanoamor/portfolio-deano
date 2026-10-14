(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.island = function (ctx) {
    var T = ctx.T, C = ctx.C, root = ctx.root, rnd = ctx.rnd, mesh = ctx.mesh, box = ctx.box, cyl = ctx.cyl, sph = ctx.sph,
      matF = ctx.matF, mat = ctx.mat, GY = ctx.GY, WATER_Y = ctx.WATER_Y, safe = ctx.safe, circ = ctx.circ, tall = ctx.tall,
      paths = ctx.paths, pois = ctx.pois, inst = ctx.inst, anim = ctx.anim;

    var islandR = ctx.islandR, H = ctx.home;

    // ---------- the island body (organic outline, extruded, flat shaded) ----------
    var outline = function (scale, add) {
      var sh = new T.Shape();
      for (var i = 0; i < 80; i++) {
        var th = i / 80 * Math.PI * 2, r = islandR(th) * scale + add;
        var x = Math.cos(th) * r, y = -Math.sin(th) * r;
        if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y);
      }
      return sh;
    };
    var layer = function (shape, depth, topY, color) {
      var geo = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, topY - depth, 0);
      return mesh(root, geo, matF(color), 0, 0, 0);
    };
    layer(outline(1, 0), 0.4, GY, '#86CF8F');
    layer(outline(1, 1.5), 0.7, -0.65, '#EAD9A8');
    layer(outline(0.86, 0), 2.0, -0.7, '#9A7451');

    // ---------- small islets far out in the lake ----------
    var blob = function (px, pz, r) {
      mesh(root, new T.CylinderGeometry(r, r * 1.03, 0.4, 10), matF('#86CF8F'), px, -0.5, pz);
      mesh(root, new T.CylinderGeometry(r * 1.12, r * 1.18, 0.7, 10), matF('#EAD9A8'), px, -1.0, pz);
      mesh(root, new T.CylinderGeometry(r, r * 0.8, 2.0, 10), matF('#9A7451'), px, -1.65, pz);
    };

    // ---------- trees (shared geometry) ----------
    var gTrunk = new T.CylinderGeometry(0.15, 0.22, 1, 7), gCone = new T.ConeGeometry(1, 1, 7), gIco = new T.IcosahedronGeometry(1, 0);
    ctx.gIco = gIco;
    var treeCols = [['#3E9368', '#4FA877'], ['#6CC08F', '#5FB07A'], ['#3F8F6B', '#357F5E'], ['#F2A65A', '#E8896B']];
    ctx.tree = function (x, y, z, kind, s, track) {
      var g = new T.Group();
      g.position.set(x, y, z);
      g.scale.setScalar(s);
      root.add(g);
      mesh(g, gTrunk, matF(C.woodDark), 0, 0.5, 0);
      var cols = treeCols[kind === 0 ? 0 : kind];
      if (kind === 0) {
        [[1.15, 1.5, 1.45], [0.9, 1.3, 2.1], [0.62, 1.1, 2.7]].forEach(function (c, i) {
          var m = mesh(g, gCone, matF(cols[i % 2]), 0, c[2], 0);
          m.scale.set(c[0], c[1], c[0]);
        });
      } else {
        var a = mesh(g, gIco, matF(cols[0]), 0, 1.9, 0); a.scale.setScalar(1.05);
        var b = mesh(g, gIco, matF(cols[1]), 0.55, 1.35, 0.3); b.scale.setScalar(0.75);
      }
      if (track) {
        tall.push({ g: g, x: x, z: z, rad: 1.1 * s, base: s });
        circ(x, z, 0.5 * s);
      }
      return g;
    };
    ctx.bench = function (x, z, tx, tz) {
      var g = new T.Group();
      g.position.set(x, GY, z);
      g.rotation.y = Math.atan2(tx - x, tz - z);
      root.add(g);
      box(g, 1.8, 0.12, 0.6, C.wood, 0, 0.5, 0);
      box(g, 1.8, 0.55, 0.08, C.wood, 0, 0.85, -0.3);
      box(g, 0.12, 0.5, 0.5, C.woodDark, -0.75, 0.25, 0);
      box(g, 0.12, 0.5, 0.5, C.woodDark, 0.75, 0.25, 0);
      circ(x, z, 0.95);
    };

    // islets with a tree and a rock
    [[-50, -16, 4.2], [48, -26, 3.6], [-42, 36, 4.8], [46, 32, 3.2]].forEach(function (p, i) {
      blob(p[0], p[1], p[2]);
      ctx.tree(p[0], GY, p[1], i % 2 ? 1 : 0, (0.8 + p[2] * 0.05) * 1.4, false);
      var rk = mesh(root, gIco, matF(C.rock), p[0] + p[2] * 0.5, GY + 0.1, p[1] + p[2] * 0.3);
      rk.scale.set(0.5, 0.35, 0.5);
    });

    // ---------- rocks, lily pads and ducks in the lake ----------
    [[0.3, 6], [1.2, 5.5], [2.2, 6.5], [3.4, 5], [4.5, 6], [5.5, 5.5]].forEach(function (p) {
      var r = islandR(p[0]) + p[1];
      var rk = mesh(root, gIco, matF(C.rock), Math.cos(p[0]) * r, WATER_Y + 0.1, Math.sin(p[0]) * r);
      rk.scale.set(0.8, 0.55, 0.7);
      rk.rotation.y = rnd() * 3;
    });
    [[1.7, 3.8], [1.85, 4.6], [1.6, 4.9], [3.9, 3.8], [4.05, 4.6]].forEach(function (p, i) {
      var r = islandR(p[0]) + p[1];
      var x = Math.cos(p[0]) * r, z = Math.sin(p[0]) * r;
      mesh(root, new T.CylinderGeometry(0.45, 0.45, 0.04, 12), mat('#5FB07A'), x, WATER_Y + 0.08, z, 0, 0, 0, false);
      if (i % 2 === 0) mesh(root, new T.SphereGeometry(0.12, 8, 6), mat(C.pink), x + 0.1, WATER_Y + 0.17, z, 0, 0, 0, false);
    });
    var ducks = [];
    [[38, 0.5, 0.04], [43, 3.4, -0.035]].forEach(function (d) {
      var g = new T.Group();
      root.add(g);
      sph(g, 0.3, C.cream, 0, 0.2, 0, 1.3, 0.8, 0.9);
      sph(g, 0.17, C.cream, 0.32, 0.5, 0);
      box(g, 0.16, 0.06, 0.1, '#F2A65A', 0.5, 0.46, 0);
      ducks.push({ g: g, r: d[0], a0: d[1], sp: d[2] });
    });
    anim.push(function (t) {
      ducks.forEach(function (d) {
        var ang = d.a0 + t * d.sp;
        d.g.position.set(Math.cos(ang) * d.r, WATER_Y + 0.08 + Math.sin(t * 2 + d.a0) * 0.02, Math.sin(ang) * d.r);
        d.g.rotation.y = d.sp > 0 ? -(ang + Math.PI / 2) : -(ang - Math.PI / 2);
      });
    });

    // ---------- the dock (angle da, south-east) ----------
    var da = 0.45, Rd = islandR(da) - 3.2;
    ctx.dock = { a: da, ox: Math.cos(da) * Rd, oz: Math.sin(da) * Rd, len: 9.8 };

    // ---------- points of interest ----------
    var poi = function (name, x, z, r, clear) { pois.push({ name: name, x: x, z: z, r: r, clear: clear }); };
    poi('Campfire', 11.5, -9.4, 4.5, 4.8);
    poi('Windmill', -12.8, -9.6, 5.5, 4.5);
    poi('Lighthouse', -15.5, 7.5, 5.5, 4.8);
    poi('Cherry tree', -10.5, -1.5, 5, 4.5);
    poi('Koi pond', 9.6, 8.6, 5.5, 5.5);
    poi('Garden', 3.5, 12.8, 5.5, 5.5);
    poi('Picnic spot', -5.0, 12.8, 4.5, 4.0);
    poi('The dock', ctx.dock.ox + Math.cos(da) * 7, ctx.dock.oz + Math.sin(da) * 7, 5, 5);
    poi('Home sweet home', H.x + 2.6, H.z - 1.0, 3.2, 3.0);

    // ---------- stepping-stone paths ----------
    var P = function (pts) { paths.push(pts); };
    var Ds = [H.x + 3.9, H.z - 2.0], hub = [3.5, -7.5];
    P([Ds, [H.x + 5.4, H.z + 3.0], hub]);
    P([hub, [7.5, -8.6], [10.4, -9.2]]);
    P([hub, [-1.0, -8.8], [-6.0, -9.4], [-10.8, -9.7]]);
    P([[-1.0, -8.8], [-5.0, -6.5], [-8.2, -3.8], [-8.6, -2.0]]);
    P([hub, [9.0, -3.5], [14.0, 0.0], [18.5, 4.5], [23.0, 10.0]]);
    P([[14.0, 0.0], [13.0, 4.5], [11.6, 5.6], [8.5, 5.2], [6.3, 8.0], [5.0, 10.2]]);
    P([[-8.8, -2.2], [-9.5, 1.5], [-11.5, 4.5], [-13.6, 6.9]]);
    P([[-9.5, 1.5], [-8.0, 5.5], [-6.5, 9.0], [-5.5, 11.0]]);
    var stones = [];
    paths.forEach(function (pl) {
      for (var i = 0; i < pl.length - 1; i++) {
        var ax = pl[i][0], az = pl[i][1], bx = pl[i + 1][0], bz = pl[i + 1][1];
        var n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 1.25));
        for (var k = 0; k < n; k++) {
          var t = (k + 0.5) / n;
          var s = 0.8 + rnd() * 0.5;
          stones.push({ x: ax + (bx - ax) * t + (rnd() - 0.5) * 0.35, y: GY + 0.06, z: az + (bz - az) * t + (rnd() - 0.5) * 0.35, ry: rnd() * 3, sx: s, sz: s, c: rnd() < 0.5 ? '#D9D2C0' : '#CFC7B2' });
        }
      }
    });
    var stoneMat = new T.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1 });
    inst(new T.CylinderGeometry(0.42, 0.46, 0.12, 7), stoneMat, stones, false);

    ctx.nearPath = function (x, z, d) {
      for (var p = 0; p < paths.length; p++) {
        var pl = paths[p];
        for (var i = 0; i < pl.length - 1; i++) {
          var ax = pl[i][0], az = pl[i][1], bx = pl[i + 1][0], bz = pl[i + 1][1];
          var vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz;
          var u = l2 ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / l2)) : 0;
          if (Math.hypot(x - (ax + vx * u), z - (az + vz * u)) < d) return true;
        }
      }
      return false;
    };
  };
})();
