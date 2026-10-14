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
        g.position.set(Math.cos(ang) * 46, 15 + Math.sin(t * 0.6) * 0.5, Math.sin(ang) * 46);
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
