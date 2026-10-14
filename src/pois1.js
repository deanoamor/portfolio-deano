(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.pois1 = function (ctx) {
    var T = ctx.T, C = ctx.C, root = ctx.root, rnd = ctx.rnd, mesh = ctx.mesh, box = ctx.box, cyl = ctx.cyl, sph = ctx.sph,
      matF = ctx.matF, mat = ctx.mat, glow = ctx.glow, GY = ctx.GY, safe = ctx.safe, circ = ctx.circ, tall = ctx.tall,
      anim = ctx.anim, inst = ctx.inst, gIco = ctx.gIco;

    // ---------- campfire + tent ----------
    safe('campfire', function () {
      var cx = 11.5, cz = -9.4;
      var g = new T.Group();
      g.position.set(cx, GY, cz);
      root.add(g);
      for (var i = 0; i < 9; i++) {
        var a = i / 9 * Math.PI * 2;
        var st = mesh(g, gIco, matF(C.rock), Math.cos(a) * 1.0, 0.12, Math.sin(a) * 1.0);
        st.scale.set(0.28, 0.2, 0.28);
      }
      [0, 2.1, 4.2].forEach(function (ay) { cyl(g, 0.12, 0.12, 1.3, '#7a5238', 0, 0.22, 0, 0, ay, Math.PI / 2, 8); });
      var fl = [
        mesh(g, new T.ConeGeometry(0.42, 1.1, 6), glow('#F2A65A'), 0, 0.75, 0, 0, 0, 0, false),
        mesh(g, new T.ConeGeometry(0.3, 0.85, 6), glow('#F2C14E'), 0, 0.65, 0, 0, 0, 0, false),
        mesh(g, new T.ConeGeometry(0.18, 0.6, 6), glow('#FFF3C4'), 0, 0.55, 0, 0, 0, 0, false)
      ];
      var light = new T.PointLight(0xff9a4d, 1.3, 13, 2);
      light.position.set(0, 1.3, 0);
      g.add(light);
      var smoke = [];
      for (var s = 0; s < 4; s++) {
        var sm = new T.Mesh(new T.SphereGeometry(0.2, 8, 8), new T.MeshBasicMaterial({ color: 0xd8d8d8, transparent: true, opacity: 0.3, depthWrite: false }));
        g.add(sm);
        smoke.push({ m: sm, ph: s / 4 });
      }
      anim.push(function (t) {
        fl.forEach(function (f, i) { f.scale.set(1, 0.85 + 0.25 * Math.sin(t * 9 + i * 2), 1); });
        light.intensity = 1.2 + Math.sin(t * 11) * 0.15 + Math.sin(t * 17) * 0.1;
        smoke.forEach(function (p) {
          var f = (t * 0.25 + p.ph) % 1;
          p.m.position.set(Math.sin(t + p.ph * 5) * 0.2, 1.4 + f * 2.8, 0);
          p.m.material.opacity = 0.3 * (1 - f);
          p.m.scale.setScalar(0.6 + f * 1.5);
        });
      });
      [[-1.9, 0.6], [1.8, -1.2], [0.4, 2.1]].forEach(function (p) {
        cyl(g, 0.4, 0.4, 0.45, C.wood, p[0], 0.22, p[1], 0, 0, 0, 10);
        circ(cx + p[0], cz + p[1], 0.55);
      });
      circ(cx, cz, 1.5);
      var tx = cx + 3.2, tz = cz - 2.6;
      mesh(root, new T.ConeGeometry(1.9, 2.3, 4), matF(C.coral), tx, GY + 1.15, tz, 0, Math.PI / 4 + 0.3, 0);
      mesh(root, new T.ConeGeometry(1.2, 1.6, 4), matF(C.cream), tx, GY + 0.8, tz, 0, Math.PI / 4 + 0.3, 0).scale.set(1.02, 1, 1.02);
      cyl(root, 0.03, 0.03, 1.1, C.ink, tx, GY + 2.8, tz, 0, 0, 0, 6);
      box(root, 0.5, 0.28, 0.03, C.mustard, tx + 0.27, GY + 3.1, tz);
      circ(tx, tz, 1.8);
    });

    // ---------- windmill ----------
    safe('windmill', function () {
      var wx = -12.8, wz = -9.6;
      var g = new T.Group();
      g.position.set(wx, GY, wz);
      g.rotation.y = Math.PI / 2;
      g.scale.setScalar(1.5);
      root.add(g);
      mesh(g, new T.CylinderGeometry(1.2, 1.8, 4.4, 8), matF(C.cream), 0, 2.2, 0);
      mesh(g, new T.ConeGeometry(1.7, 1.7, 8), matF(C.coral), 0, 5.25, 0);
      box(g, 0.9, 1.5, 0.15, C.wood, 0, 0.75, 1.74);
      box(g, 0.5, 0.6, 0.1, '#BFE5EE', 0, 3.0, 1.43);
      var blades = new T.Group();
      blades.position.set(0, 4.6, 1.5);
      g.add(blades);
      cyl(blades, 0.2, 0.2, 0.5, C.ink, 0, 0, 0, Math.PI / 2, 0, 0, 10);
      [0, 1, 2, 3].forEach(function (k) {
        var arm = new T.Group();
        arm.rotation.z = k * Math.PI / 2;
        blades.add(arm);
        box(arm, 0.16, 3.0, 0.1, C.wood, 0, 1.7, 0.2);
        box(arm, 0.8, 2.4, 0.04, C.cream, 0.45, 2.0, 0.25);
      });
      anim.push(function (t, dt) { blades.rotation.z -= dt * 0.9; });
      circ(wx, wz, 3.0);
      tall.push({ g: g, x: wx, z: wz, rad: 3.0, base: 1.5 });
    });

    // ---------- lighthouse ----------
    safe('lighthouse', function () {
      var lx = -15.5, lz = 7.5;
      var g = new T.Group();
      g.position.set(lx, GY, lz);
      g.scale.setScalar(1.3);
      root.add(g);
      [[0, 0, 0, 2.4, 1.0], [1.7, 0.1, 0.4, 1.7, 0.7], [-1.6, 0.1, 0.3, 1.5, 0.6], [0.4, 0.1, -1.7, 1.6, 0.6], [-0.9, 0.1, 1.8, 1.3, 0.5]].forEach(function (r) {
        var m = mesh(g, gIco, matF(C.rock), r[0], r[1], r[2]);
        m.scale.set(r[3], r[4], r[3]);
      });
      for (var i = 0; i < 4; i++) {
        mesh(g, new T.CylinderGeometry(1.3 - 0.12 * (i + 1), 1.3 - 0.12 * i, 1.7, 10), matF(i % 2 ? C.coral : C.cream), 0, 0.8 + i * 1.7 + 0.85, 0);
      }
      cyl(g, 1.2, 1.2, 0.2, C.ink, 0, 7.7, 0, 0, 0, 0, 12);
      mesh(g, new T.CylinderGeometry(0.7, 0.7, 1.1, 10), new T.MeshLambertMaterial({ color: '#FFF3C4', emissive: '#FFD57A', emissiveIntensity: 0.8 }), 0, 8.35, 0);
      mesh(g, new T.ConeGeometry(0.95, 0.9, 10), matF(C.coral), 0, 9.35, 0);
      sph(g, 0.15, C.ink, 0, 9.9, 0);
      var pivot = new T.Group();
      pivot.position.set(0, 8.35, 0);
      g.add(pivot);
      var bg = new T.ConeGeometry(0.8, 7, 16, 1, true);
      bg.translate(0, -3.5, 0);
      var bm = new T.MeshBasicMaterial({ color: '#FFF3C4', transparent: true, opacity: 0.2, side: T.DoubleSide, depthWrite: false });
      var b1 = new T.Mesh(bg, bm); b1.rotation.z = Math.PI / 2; pivot.add(b1);
      var b2 = new T.Mesh(bg, bm); b2.rotation.z = -Math.PI / 2; pivot.add(b2);
      var light = new T.PointLight(0xffe0a0, 1.0, 14, 2);
      light.position.set(0, 8.4, 0);
      g.add(light);
      anim.push(function (t, dt) { pivot.rotation.y += dt * 1.2; light.intensity = 0.9 + Math.sin(t * 2) * 0.2; });
      circ(lx, lz, 2.7);
      tall.push({ g: g, x: lx, z: lz, rad: 3.0, base: 1.3 });
    });

    // ---------- cherry tree + bench + falling petals ----------
    safe('cherry', function () {
      var x0 = -10.5, z0 = -1.5;
      var g = new T.Group();
      g.position.set(x0, GY, z0);
      g.scale.setScalar(1.3);
      root.add(g);
      cyl(g, 0.35, 0.6, 2.4, '#7a5238', 0, 1.2, 0, 0, 0, 0, 8);
      var pc = ['#F7B2C4', '#F29CB5', '#FAC6D2', '#F5A9BE'];
      [[0, 4.1, 0, 1.9], [1.5, 3.5, 0.6, 1.35], [-1.5, 3.6, -0.4, 1.4], [0.4, 3.6, -1.5, 1.3], [-0.5, 3.5, 1.5, 1.3], [0.2, 5.0, 0.2, 1.2]].forEach(function (b, i) {
        var m = mesh(g, gIco, matF(pc[i % 4]), b[0], b[1], b[2]);
        m.scale.setScalar(b[3]);
      });
      var petalMat = new T.MeshBasicMaterial({ color: '#F9B8CA', side: T.DoubleSide });
      var petals = [];
      for (var i = 0; i < 28; i++) {
        var m = new T.Mesh(new T.PlaneGeometry(0.16, 0.12), petalMat);
        root.add(m);
        petals.push({ m: m, ph: rnd(), ax: (rnd() - 0.5) * 3.2, az: (rnd() - 0.5) * 3.2 });
      }
      anim.push(function (t) {
        petals.forEach(function (p) {
          var f = (t * 0.16 + p.ph) % 1;
          p.m.position.set(x0 + p.ax * (1 + f * 0.8) + Math.sin(t + p.ph * 6) * 0.4, GY + 6.5 - f * 6.8, z0 + p.az * (1 + f * 0.8));
          p.m.rotation.set(t * 2 + p.ph * 6, t * 1.5 + p.ph * 4, 0);
        });
      });
      var ground = [];
      for (var k = 0; k < 40; k++) {
        var a = rnd() * 6.28, r = 0.9 + rnd() * 3.2;
        ground.push({ x: x0 + Math.cos(a) * r, y: GY + 0.03, z: z0 + Math.sin(a) * r, rx: -Math.PI / 2, rz: rnd() * 3, c: rnd() < 0.5 ? '#F9B8CA' : '#FAC6D2' });
      }
      inst(new T.CircleGeometry(0.14, 5), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide }), ground, false);
      ctx.bench(x0 + 3.2, z0 + 1.8, x0, z0);
      circ(x0, z0, 1.0);
      tall.push({ g: g, x: x0, z: z0, rad: 3.4, base: 1.3 });
    });

    // ---------- koi pond ----------
    safe('pond', function () {
      var px = 9.6, pz = 8.6, pr = 3.0;
      var water = new T.Mesh(new T.CircleGeometry(pr, 40), new T.MeshBasicMaterial({ color: '#7FD0E0' }));
      water.rotation.x = -Math.PI / 2; water.position.set(px, GY + 0.03, pz);
      root.add(water);
      var inner = new T.Mesh(new T.CircleGeometry(pr * 0.55, 32), new T.MeshBasicMaterial({ color: '#9BDCE8' }));
      inner.rotation.x = -Math.PI / 2; inner.position.set(px, GY + 0.04, pz);
      root.add(inner);
      for (var i = 0; i < 13; i++) {
        var a = i / 13 * Math.PI * 2;
        var rk = mesh(root, gIco, matF(C.rock), px + Math.cos(a) * (pr + 0.1), GY + 0.1, pz + Math.sin(a) * (pr + 0.1));
        rk.scale.set(0.4 + rnd() * 0.2, 0.3, 0.4 + rnd() * 0.2);
        rk.rotation.y = rnd() * 3;
      }
      [[-0.9, -0.5], [0.8, 0.7], [-0.2, 1.3], [1.2, -0.9]].forEach(function (p, j) {
        mesh(root, new T.CylinderGeometry(0.4, 0.4, 0.04, 12), mat('#5FB07A'), px + p[0], GY + 0.07, pz + p[1], 0, 0, 0, false);
        if (j % 2 === 0) mesh(root, new T.SphereGeometry(0.11, 8, 6), mat(C.pink), px + p[0] + 0.1, GY + 0.16, pz + p[1], 0, 0, 0, false);
      });
      [2.2, 2.6, 0.5].forEach(function (ang) {
        for (var k = 0; k < 4; k++) {
          var rx = px + Math.cos(ang) * (pr + 0.5) + (rnd() - 0.5) * 0.5, rz = pz + Math.sin(ang) * (pr + 0.5) + (rnd() - 0.5) * 0.5;
          cyl(root, 0.03, 0.03, 1.4 + rnd() * 0.5, '#6CAE72', rx, GY + 0.8, rz, 0, 0, 0, 5);
          cyl(root, 0.07, 0.07, 0.3, '#7a5238', rx, GY + 1.55, rz, 0, 0, 0, 6);
        }
      });
      var koi = [];
      [[1.2, 0.5, '#F2884B'], [1.7, 2.6, '#F4EFE2'], [0.8, 4.4, '#E8896B']].forEach(function (k, i) {
        var g = new T.Group();
        root.add(g);
        sph(g, 0.22, k[2], 0, 0, 0, 1.7, 0.55, 0.7);
        var tail = cyl(g, 0.0, 0.16, 0.3, k[2], -0.4, 0, 0, 0, 0, Math.PI / 2, 4);
        koi.push({ g: g, tail: tail, rad: k[0], ph: k[1], sp: (i % 2 ? -1 : 1) * (0.5 + i * 0.1) });
      });
      anim.push(function (t) {
        koi.forEach(function (k) {
          var ang = k.ph + t * k.sp;
          k.g.position.set(px + Math.cos(ang) * k.rad, GY + 0.1, pz + Math.sin(ang) * k.rad);
          k.g.rotation.y = k.sp > 0 ? -(ang + Math.PI / 2) : -(ang - Math.PI / 2);
          k.tail.rotation.y = Math.sin(t * 8 + k.ph) * 0.4;
        });
      });
      circ(px, pz, pr + 0.35);
      ctx.bench(8.0, 4.7, px, pz);
    });
  };
})();
