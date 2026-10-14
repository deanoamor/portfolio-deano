(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.island = function (ctx) {
    var T = ctx.T, C = ctx.C, root = ctx.root, rnd = ctx.rnd, mesh = ctx.mesh, box = ctx.box, cyl = ctx.cyl, sph = ctx.sph,
      matF = ctx.matF, mat = ctx.mat, GY = ctx.GY, WATER_Y = ctx.WATER_Y, safe = ctx.safe, circ = ctx.circ, tall = ctx.tall,
      paths = ctx.paths, pois = ctx.pois, inst = ctx.inst, anim = ctx.anim;

    var islandR = ctx.islandR, H = ctx.home;

    // foliage / ground materials are unshared so the season switch can recolour them
    var mkF = function (c) { return new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1, metalness: 0 }); };
    // soft painterly mottling on the ground (tiles every ~26 units; multiplies the seasonal grass colour)
    var grassTex = ctx.tex(256, 256, function (g, w, h) {
      g.fillStyle = '#f2f2f0'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 300; i++) {
        var x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 30, light = Math.random() < 0.5;
        for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
          var gr = g.createRadialGradient(x + ox * w, y + oy * h, 0, x + ox * w, y + oy * h, r);
          gr.addColorStop(0, light ? 'rgba(255,255,255,0.7)' : 'rgba(150,170,150,0.32)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = gr; g.fillRect(x + ox * w - r, y + oy * h - r, r * 2, r * 2);
        }
      }
    });
    grassTex.wrapS = grassTex.wrapT = T.RepeatWrapping;
    grassTex.repeat.set(1 / 26, 1 / 26);
    // brick texture for the stone retaining walls around the island
    var stoneTex = ctx.tex(256, 256, function (g, w, h) {
      g.fillStyle = '#3d474f'; g.fillRect(0, 0, w, h);
      var rows = 4, bh = h / rows;
      for (var r = 0; r < rows; r++) {
        var x = (r % 2) * 40 - 20;
        while (x < w) {
          var bw = 70 + Math.random() * 44;
          var l = 98 + Math.random() * 38;
          g.fillStyle = 'rgb(' + Math.round(l * 0.86) + ',' + Math.round(l * 0.98) + ',' + Math.round(l * 1.08) + ')';
          g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6);
          g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 3, r * bh + 3, bw - 6, 4);
          g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x + 3, r * bh + bh - 8, bw - 6, 5);
          x += bw;
        }
      }
    });
    stoneTex.wrapS = stoneTex.wrapT = T.RepeatWrapping;
    stoneTex.repeat.set(1 / 5.0, 1 / 2.4);
    var stoneTex2 = stoneTex.clone(); stoneTex2.needsUpdate = true; stoneTex2.repeat.set(5, 1.5);
    var mkLeaf = function (c) { return new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1, metalness: 0, vertexColors: true }); };
    var fol = ctx.fol = {
      grass: (function () { var m = mkF('#7DBE45'); m.map = grassTex; return m; })(),
      sand: (function () { var m = mkF('#FFFFFF'); m.map = stoneTex; return m; })(),
      stone2: (function () { var m = mkF('#FFFFFF'); m.map = stoneTex2; return m; })(),
      hills: mkF('#6FB03F'), trunk: mkF('#6B4A30'),
      pine: [mkLeaf('#3C8A3A'), mkLeaf('#46963F')], round: [mkLeaf('#4A9A3E'), mkLeaf('#58A843')],
      deep: [mkLeaf('#2F7434'), mkLeaf('#3A8038')], warm: [mkLeaf('#6FA43C'), mkLeaf('#80B442')],
      cherry: [mkLeaf('#F7B2C4'), mkLeaf('#F29CB5'), mkLeaf('#FAC6D2'), mkLeaf('#F5A9BE')],
      bush: [mkLeaf('#4E9A3E'), mkLeaf('#3F8838')]
    };

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
      return mesh(root, geo, typeof color === 'string' ? matF(color) : color, 0, 0, 0);
    };
    layer(outline(1, 0.28), 0.45, GY, fol.grass);                 // grass lip
    layer(outline(1, 0), 3.4, GY - 0.4, fol.sand);                 // stone retaining wall

    // ---------- small islets far out in the lake ----------
    var blob = function (px, pz, r) {
      mesh(root, new T.CylinderGeometry(r * 1.05, r * 1.05, 0.45, 12), fol.grass, px, -0.5, pz);
      mesh(root, new T.CylinderGeometry(r, r * 0.88, 3.0, 12), fol.stone2, px, -2.2, pz);
    };

    // ---------- trees: leafy broadleaf crowns (jittered icospheres, grey-scale vertex colours; hue comes from the season) ----------
    var gIco = new T.IcosahedronGeometry(1, 0);
    (function () {   // grey-scale vertex colours so bushes and blossom crowns (leaf materials) shade like the trees
      var P = gIco.attributes.position, col = new Float32Array(P.count * 3);
      for (var i = 0; i < P.count; i++) {
        var lum = 0.72 + 0.42 * ((P.getY(i) + 1) / 2) + ((Math.floor(i / 3) * 0.37) % 1 - 0.5) * 0.2;
        col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = lum;
      }
      gIco.setAttribute('color', new T.BufferAttribute(col, 3));
    })();
    ctx.gIco = gIco;
    var hash = function (x, y, z) { var h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); };
    var LEAF_DETAIL = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 1 : 2;
    var leafGeos = [0, 1, 2, 3].map(function (k) {
      var g = new T.IcosahedronGeometry(1, LEAF_DETAIL), P = g.attributes.position, col = new Float32Array(P.count * 3);
      for (var i = 0; i < P.count; i++) {
        var x = P.getX(i), y = P.getY(i), z = P.getZ(i);
        var key = Math.round(x * 50) + k * 7, k2 = Math.round(y * 50) + k * 13, k3 = Math.round(z * 50) + k * 29;
        var j = 1 + (hash(key, k2, k3) - 0.5) * (LEAF_DETAIL > 1 ? 0.3 : 0.34);
        P.setXYZ(i, x * j, y * j * 0.92, z * j);
        var face = Math.floor(i / 3), fl = (hash(face, k, 3) - 0.5) * (LEAF_DETAIL > 1 ? 0.42 : 0.28);
        var lum = 0.66 + 0.5 * ((y + 1) / 2) + fl;
        col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = lum;
      }
      g.setAttribute('color', new T.BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    });
    var gTrunk = new T.CylinderGeometry(0.3, 0.5, 1, 7), gRoot = new T.CylinderGeometry(0.5, 1.0, 0.8, 7);
    var forest = ctx.forest = new T.Group();
    root.add(forest);
    var treeCols = [fol.pine, fol.round, fol.deep, fol.warm];
    var crowns = [
      [[0, 3.5, 0, 1.75], [1.35, 2.9, 0.5, 1.3], [-1.3, 3.0, -0.4, 1.35], [0.3, 3.1, -1.4, 1.25], [-0.5, 3.2, 1.3, 1.25], [0.2, 4.5, 0.1, 1.15]],
      [[0, 3.0, 0, 1.45], [1.0, 2.5, 0.4, 1.0], [-0.9, 2.6, -0.3, 1.05], [0.1, 3.9, 0.1, 0.9]],
      [[0, 2.2, 0, 1.5], [1.3, 1.9, 0.5, 1.1], [-1.2, 1.9, -0.4, 1.15], [0.2, 2.4, -1.2, 1.0], [-0.3, 2.5, 1.2, 1.0]],
      [[0, 3.6, 0, 1.8], [1.4, 3.0, 0.5, 1.3], [-1.3, 3.1, -0.4, 1.35], [0.3, 3.2, -1.4, 1.25], [0.2, 4.6, 0.1, 1.2]]
    ];
    ctx.tree = function (x, y, z, kind, s, track) {
      var cols = treeCols[kind], rot = hash(x, z, 3) * 6.28;
      var cs = Math.cos(rot), sn = Math.sin(rot);
      var tr = mesh(forest, gTrunk, fol.trunk, x, y + 0.5 * s * 2.4, z); tr.scale.set(s, s * 2.4, s);
      var rt = mesh(forest, gRoot, fol.trunk, x, y + 0.3 * s, z); rt.scale.set(s, s, s);
      crowns[kind].forEach(function (c, i) {
        var lx = c[0] * cs - c[2] * sn, lz = c[0] * sn + c[2] * cs;
        var m = mesh(forest, leafGeos[(i + kind) % 4], cols[i % 2], x + lx * s, y + c[1] * s, z + lz * s);
        m.scale.setScalar(c[3] * s);
        m.rotation.y = hash(i, x, z) * 6.28;
      });
      if (track) {
        circ(x, z, 0.55 * s);
        ctx.blobs.push([x, z, 1.9 * s]);
      }
    };
    ctx.bakeForest = function () { ctx.bake(forest); };
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
    [[-64, -22, 4.2], [62, -34, 3.6], [-56, 48, 4.8], [60, 46, 3.2]].forEach(function (p, i) {
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
    [[52, 0.5, 0.03], [58, 3.4, -0.027]].forEach(function (d) {
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
    poi('Home sweet home', H.x + 1.0, H.z, 7.0, 6.5);

    // ---------- stepping-stone paths ----------
    var P = function (pts) { paths.push(pts); };
    var Ds = [H.x + 7.4, H.z - 2.0], hub = [3.5, -7.5];
    P([Ds, [H.x + 8.6, H.z + 2.2], hub]);
    P([hub, [7.5, -8.6], [10.4, -9.2]]);
    P([hub, [-1.0, -8.8], [-6.0, -9.4], [-10.8, -9.7]]);
    P([[-1.0, -8.8], [-5.0, -6.5], [-8.2, -3.8], [-8.6, -2.0]]);
    var dk = [ctx.dock.ox - 1.0, ctx.dock.oz - 0.5];
    P([hub, [9.0, -3.5], [14.0, 0.0], [dk[0] * 0.45 + 8, dk[1] * 0.45], dk]);
    P([[14.0, 0.0], [13.0, 4.5], [11.6, 5.6], [8.5, 5.2], [6.3, 8.0], [5.0, 10.2]]);
    P([[-8.8, -2.2], [-9.5, 1.5], [-11.5, 4.5], [-13.6, 6.9]]);
    P([[-9.5, 1.5], [-8.0, 5.5], [-6.5, 9.0], [-5.5, 11.0]]);
    // paving: a dark bed under overlapping tan flagstones
    var stones = [], bedMat = mat('#8B6B44'), grid = {};
    var free = function (x, z) {
      var gx = Math.floor(x / 1.1), gz = Math.floor(z / 1.1);
      for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
        var b = grid[(gx + i) + ',' + (gz + j)];
        if (b) for (var k = 0; k < b.length; k++) if (Math.hypot(b[k][0] - x, b[k][1] - z) < 0.98) return false;
      }
      (grid[gx + ',' + gz] = grid[gx + ',' + gz] || []).push([x, z]);
      return true;
    };
    var tileCols = ['#E6C78C', '#DDB97A', '#EBD09B', '#D2AE6E', '#E2C284'];
    paths.forEach(function (pl) {
      for (var i = 0; i < pl.length - 1; i++) {
        var ax = pl[i][0], az = pl[i][1], bx = pl[i + 1][0], bz = pl[i + 1][1];
        var len = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bx - ax, bz - az);
        var bed = mesh(root, new T.BoxGeometry(1.9, 0.06, len + 0.5), bedMat, (ax + bx) / 2, GY + 0.03, (az + bz) / 2, 0, ang, 0, false);
        bed.material = bedMat;
        bed.receiveShadow = true;
        var n = Math.max(1, Math.round(len / 1.05)), nx = Math.cos(ang), nz = -Math.sin(ang);
        for (var k = 0; k < n; k++) {
          var t = (k + 0.5) / n;
          for (var side = -1; side <= 1; side += 2) {
            var off = side * (0.5 + rnd() * 0.06);
            var s2 = 0.74 + rnd() * 0.2;
            var tx = ax + (bx - ax) * t + nx * off + (rnd() - 0.5) * 0.1, tz = az + (bz - az) * t + nz * off + (rnd() - 0.5) * 0.1;
            if (!free(tx, tz)) continue;
            stones.push({ x: tx, y: GY + 0.07, z: tz, ry: rnd() * 3, sx: s2, sy: 1, sz: s2 * (0.9 + rnd() * 0.2), c: tileCols[Math.floor(rnd() * tileCols.length)] });
          }
        }
      }
    });
    var stoneMat = new T.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1 });
    inst(new T.CylinderGeometry(0.5, 0.54, 0.12, 7), stoneMat, stones, false);

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
