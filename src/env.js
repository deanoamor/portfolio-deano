(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // Season + time of day. Everything eases toward the chosen target over about a second.
  parts.env = function (ctx) {
    var T = ctx.T, scene = ctx.scene, sun = ctx.sun, hemi = ctx.hemi, renderer = ctx.renderer, root = ctx.root, fol = ctx.fol;
    var rnd = ctx.rnd, lerp = ctx.lerp, GY = ctx.GY;

    // ---------- time of day ----------
    var TIMES = {
      morning: { sky: '#FFEBD6', ground: '#B8D4CE', hI: 0.62, sun: '#FFD2A0', sI: 0.58, az: 1.5, h: 9, d: 14, water: '#86CFCB', discs: ['#98D8D0', '#B2E2D5', '#CBEEDC'], night: 0, foam: 0.55, haze: '#F6D8BE' },
      noon: { sky: '#FFF6E8', ground: '#A9C9B8', hI: 0.62, sun: '#FFE8C4', sI: 0.55, az: 0.6, h: 15, d: 9, water: '#7CCBC8', discs: ['#8ED4CF', '#A6DED5', '#BFE9DB'], night: 0, foam: 0.55, haze: '#BFE3EC' },
      evening: { sky: '#FFD2B2', ground: '#98ACB6', hI: 0.55, sun: '#FF9A62', sI: 0.64, az: -1.15, h: 7, d: 13, water: '#78AEB9', discs: ['#9BBDBF', '#BAC7BE', '#D8D1BB'], night: 0.25, foam: 0.5, haze: '#F2B48F' },
      night: { sky: '#5A72B4', ground: '#1E2A44', hI: 0.4, sun: '#A8BCFF', sI: 0.4, az: 0.4, h: 14, d: 8, water: '#1C3A5E', discs: ['#23456C', '#2B5179', '#355E86'], night: 1, foam: 0.2, haze: '#14233E' }
    };

    // ---------- seasons (summer is the original palette) ----------
    var SEASONS = {
      spring: {
        grass: '#8CCB52', sand: '#FFFFFF', hills: '#7DBE48',
        pine: ['#4EA04A', '#5CB058'], round: ['#68B85A', '#78C666'], deep: ['#3F9048', '#4AA050'], warm: ['#F7B2C4', '#F29CB5'],
        cherry: ['#F7B2C4', '#F29CB5', '#FAC6D2', '#F5A9BE'], bush: ['#5EAE4E', '#4FA044'],
        tufts: ['#7EC254', '#6DB548'], flowers: ['#F2C14E', '#E8896B', '#F4EFE2', '#F7B2C4', '#B79CF2', '#FF9EB5'], flowersOn: true,
        petal: '#F9B8CA', petalsGround: ['#F9B8CA', '#FAC6D2'], pond: ['#7FD0E0', '#9BDCE8'],
        fall: { colors: ['#F9B8CA', '#FAC6D2', '#F7A1BA'], n: 90, size: 5, speed: 1.5 }
      },
      summer: {
        grass: '#7DBE45', sand: '#FFFFFF', hills: '#6FB03F',
        pine: ['#3C8A3A', '#46963F'], round: ['#4A9A3E', '#58A843'], deep: ['#2F7434', '#3A8038'], warm: ['#6FA43C', '#80B442'],
        cherry: ['#F7B2C4', '#F29CB5', '#FAC6D2', '#F5A9BE'], bush: ['#4E9A3E', '#3F8838'],
        tufts: ['#6DB548', '#5CA53F'], flowers: ['#F2C14E', '#E8896B', '#F4EFE2', '#F7B2C4', '#B79CF2', '#FF9EB5'], flowersOn: true,
        petal: '#F9B8CA', petalsGround: ['#F9B8CA', '#FAC6D2'], pond: ['#7FD0E0', '#9BDCE8'],
        fall: { colors: ['#FFFFFF'], n: 0, size: 4, speed: 1 }
      },
      autumn: {
        grass: '#B9B24E', sand: '#F4EAD8', hills: '#A9A444',
        pine: ['#3F7F45', '#4C8F50'], round: ['#E09A3C', '#D2802F'], deep: ['#E8B84A', '#D9A238'], warm: ['#D2542F', '#B94528'],
        cherry: ['#F2A65A', '#E8896B', '#E2603F', '#F0B860'], bush: ['#C99A48', '#B88A3E'],
        tufts: ['#C9B45A', '#B8A04C'], flowers: ['#E2603F', '#F2A65A', '#E2B24A', '#C94D3A', '#D98B4E', '#F0B860'], flowersOn: true,
        petal: '#E8896B', petalsGround: ['#E8896B', '#F2A65A'], pond: ['#78C2CE', '#92D0D8'],
        fall: { colors: ['#E8896B', '#F2A65A', '#E2603F', '#F2C14E'], n: 150, size: 6, speed: 2.2 }
      },
      winter: {
        grass: '#EAF3F4', sand: '#F2F6FA', hills: '#DCE9EC',
        pine: ['#3E6F5D', '#4E8270'], round: ['#DCE7EA', '#C9D9DE'], deep: ['#D3E2E6', '#C3D5DB'], warm: ['#EEF4F5', '#DDE9ED'],
        cherry: ['#F1E3E8', '#E9D8DF', '#F7EEF1', '#ECDDE3'], bush: ['#D3E2E6', '#C3D5DB'],
        tufts: ['#D0DFE3', '#C0D2D8'], flowers: ['#FFFFFF'], flowersOn: false,
        petal: '#FFFFFF', petalsGround: ['#FFFFFF', '#F1F6F7'], pond: ['#CFE9EE', '#E3F3F5'],
        fall: { colors: ['#FFFFFF', '#EAF4F8'], n: 330, size: 4.5, speed: 1.7 }
      }
    };

    var env = ctx.env = { season: 'summer', time: 'noon', night: 0 };

    // ---------- lighting / water targets ----------
    var C = function (c) { return new T.Color(c); };
    var mk = function () {
      return { sky: C('#FFFFFF'), ground: C('#A8C8C0'), sun: C('#FFF0D6'), water: C('#7CCBC8'), d0: C('#8ED4CF'), d1: C('#A6DED5'), d2: C('#BFE9DB'), haze: C('#BFE3EC'),
        hI: 0.62, sI: 0.5, az: 0.6, h: 15, d: 9, night: 0, foam: 0.55 };
    };
    var cur = mk(), tgt = mk();
    env.haze = cur.haze;

    // ---------- foliage materials that ease colour ----------
    var fades = [];
    var track = function (m, key, idx) { fades.push({ m: m, key: key, idx: idx, to: m.color.clone() }); };
    ['grass', 'sand', 'hills'].forEach(function (k) { track(fol[k], k); });
    ['pine', 'round', 'deep', 'warm', 'cherry', 'bush'].forEach(function (k) { fol[k].forEach(function (m, i) { track(m, k, i); }); });
    if (ctx.pondMats) ctx.pondMats.forEach(function (m, i) { track(m, 'pond', i); });
    if (ctx.petalMat) track(ctx.petalMat, 'petal');

    // ---------- instanced meshes with per-instance colour slots ----------
    var insts = [];
    root.traverse(function (o) {
      if (!o.isInstancedMesh || !o.userData.role) return;
      var n = (o.userData.role === 'tufts' || o.userData.role === 'petalsGround') ? 2 : 6;
      var it = { mesh: o, role: o.userData.role, slots: o.userData.slots, cols: [], to: [] };
      for (var i = 0; i < n; i++) { it.cols.push(new T.Color()); it.to.push(new T.Color()); }
      insts.push(it);
    });
    var setInst = function (it) {
      var ic = it.mesh.instanceColor;
      if (!it.slots || !ic) return;
      for (var i = 0; i < it.slots.length; i++) {
        var c = it.cols[it.slots[i] % it.cols.length];
        ic.setXYZ(i, c.r, c.g, c.b);
      }
      ic.needsUpdate = true;
    };

    // ---------- falling petals / leaves / snow ----------
    var FN = 360;
    var fall = (function () {
      var geo = new T.BufferGeometry();
      var pos = new Float32Array(FN * 3), seed = [];
      for (var i = 0; i < FN; i++) {
        pos[i * 3] = (rnd() - 0.5) * 60; pos[i * 3 + 1] = rnd() * 22; pos[i * 3 + 2] = (rnd() - 0.5) * 60;
        seed.push([rnd() * 6.28, 0.6 + rnd() * 0.8]);
      }
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('color', new T.BufferAttribute(new Float32Array(FN * 3), 3));
      var dot = ctx.tex(32, 32, function (g) { g.fillStyle = '#fff'; g.beginPath(); g.arc(16, 16, 14, 0, Math.PI * 2); g.fill(); });
      var m = new T.PointsMaterial({ size: 5, map: dot, vertexColors: true, transparent: true, alphaTest: 0.3, depthWrite: false, sizeAttenuation: false });
      var pts = new T.Points(geo, m);
      pts.frustumCulled = false;
      scene.add(pts);
      return { pts: pts, geo: geo, seed: seed, mat: m, n: 0, size: 5, speed: 1, tSize: 5, tSpeed: 1 };
    })();
    var setFall = function (cfg) {
      var col = fall.geo.attributes.color.array, tmp = new T.Color();
      for (var i = 0; i < FN; i++) {
        tmp.set(cfg.colors[i % cfg.colors.length]);
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      fall.geo.attributes.color.needsUpdate = true;
      fall.n = cfg.n; fall.tSize = cfg.size; fall.tSpeed = cfg.speed;
      fall.geo.setDrawRange(0, cfg.n);
      fall.pts.visible = cfg.n > 0;
    };

    // ---------- fireflies + lantern halos (night) ----------
    var FF = 70;
    var flies = (function () {
      var geo = new T.BufferGeometry(), base = [];
      for (var i = 0; i < FF; i++) base.push([(rnd() - 0.5) * 56, 0.5 + rnd() * 3.5, (rnd() - 0.5) * 56, rnd() * 6.28]);
      geo.setAttribute('position', new T.BufferAttribute(new Float32Array(FF * 3), 3));
      var dot = ctx.tex(32, 32, function (g) {
        var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        gr.addColorStop(0, 'rgba(255,248,170,1)'); gr.addColorStop(0.35, 'rgba(255,240,140,0.7)'); gr.addColorStop(1, 'rgba(255,240,140,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
      });
      var m = new T.PointsMaterial({ size: 9, map: dot, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false, blending: T.AdditiveBlending });
      var pts = new T.Points(geo, m);
      pts.frustumCulled = false; pts.visible = false;
      scene.add(pts);
      return { pts: pts, geo: geo, base: base, mat: m };
    })();

    var haloTex = ctx.tex(64, 64, function (g) {
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,226,160,0.95)'); gr.addColorStop(0.4, 'rgba(255,200,120,0.4)'); gr.addColorStop(1, 'rgba(255,190,100,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
    var haloMat = new T.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
    var halos = new T.Group();
    (ctx.lanterns || []).forEach(function (p) {
      var a = new T.Mesh(new T.PlaneGeometry(5, 5), haloMat);
      a.rotation.x = -Math.PI / 2; a.position.set(p[0], GY + 0.08, p[1]);
      halos.add(a);
    });
    halos.visible = false;
    root.add(halos);

    // ---------- setters ----------
    var applyTime = function () {
      var t = TIMES[env.time];
      tgt.sky.set(t.sky); tgt.ground.set(t.ground); tgt.sun.set(t.sun); tgt.water.set(t.water);
      tgt.haze.set(t.haze); tgt.d0.set(t.discs[0]); tgt.d1.set(t.discs[1]); tgt.d2.set(t.discs[2]);
      tgt.hI = t.hI; tgt.sI = t.sI; tgt.az = t.az; tgt.h = t.h; tgt.d = t.d; tgt.night = t.night; tgt.foam = t.foam;
      if (ctx.windowTex) {
        ctx.windowTex.mat.map = env.time === 'night' ? ctx.windowTex.night : ctx.windowTex.day;
        ctx.windowTex.mat.needsUpdate = true;
      }
    };
    var applySeason = function () {
      var s = SEASONS[env.season];
      fades.forEach(function (f) { var v = s[f.key]; f.to.set(Array.isArray(v) ? v[f.idx] : v); });
      insts.forEach(function (it) {
        var v = it.role === 'tufts' ? s.tufts : it.role === 'flowerHeads' ? s.flowers : it.role === 'petalsGround' ? s.petalsGround : null;
        if (v) it.to.forEach(function (c, i) { c.set(v[i % v.length]); });
        if (it.role === 'flowerHeads' || it.role === 'flowerStems' || it.role === 'daisies') it.mesh.visible = s.flowersOn;
      });
      if (ctx.mountains) ctx.mountains.recolor(env.season);
      setFall(s.fall);
    };
    env.set = function (o) {
      if (o.season && SEASONS[o.season]) { env.season = o.season; applySeason(); }
      if (o.time && TIMES[o.time]) { env.time = o.time; applyTime(); }
    };

    // ---------- per-frame ----------
    var near = function (c, to) { return Math.abs(c.r - to.r) + Math.abs(c.g - to.g) + Math.abs(c.b - to.b) < 0.003; };
    var first = true;
    env.update = function (dt, f, a) {
      var k = first ? 1 : 1 - Math.exp(-dt * 2.6);
      var t = performance.now() / 1000;
      cur.sky.lerp(tgt.sky, k); cur.ground.lerp(tgt.ground, k); cur.sun.lerp(tgt.sun, k); cur.water.lerp(tgt.water, k);
      cur.haze.lerp(tgt.haze, k); cur.d0.lerp(tgt.d0, k); cur.d1.lerp(tgt.d1, k); cur.d2.lerp(tgt.d2, k);
      ['hI', 'sI', 'az', 'h', 'd', 'night', 'foam'].forEach(function (n) { cur[n] = lerp(cur[n], tgt[n], k); });
      env.night = cur.night;
      hemi.color.copy(cur.sky); hemi.groundColor.copy(cur.ground); hemi.intensity = cur.hI;
      sun.color.copy(cur.sun); sun.intensity = cur.sI;
      ctx.waterBase.material.color.copy(cur.water);
      renderer.setClearColor(cur.water, 1);
      ctx.discs[0].material.color.copy(cur.d0); ctx.discs[1].material.color.copy(cur.d1); ctx.discs[2].material.color.copy(cur.d2);
      ctx.foamMat.opacity = cur.foam;
      // the sun is fixed in the world (the default view looks along azimuth PI/4), so shadows never swing when the camera turns
      sun.position.set(f.x + Math.sin(Math.PI / 4 + cur.az) * cur.d, cur.h, f.z + Math.cos(Math.PI / 4 + cur.az) * cur.d);
      sun.target.position.set(f.x, 0, f.z);

      fades.forEach(function (fd) {
        if (near(fd.m.color, fd.to)) { if (!fd.m.color.equals(fd.to)) fd.m.color.copy(fd.to); }
        else fd.m.color.lerp(fd.to, k);
      });
      insts.forEach(function (it) {
        var ch = first;
        for (var i = 0; i < it.cols.length; i++) {
          var c = it.cols[i], to = it.to[i];
          if (near(c, to)) { if (!c.equals(to)) { c.copy(to); ch = true; } }
          else { c.lerp(to, k); ch = true; }
        }
        if (ch) setInst(it);
      });

      fall.size = lerp(fall.size, fall.tSize, k); fall.speed = lerp(fall.speed, fall.tSpeed, k);
      fall.mat.size = fall.size;
      fall.pts.position.set(f.x, 0, f.z);
      if (fall.n > 0 && !ctx.reduce) {
        var P = fall.geo.attributes.position;
        for (var i = 0; i < fall.n; i++) {
          var sd = fall.seed[i];
          var y = P.getY(i) - dt * fall.speed * sd[1] * 1.6;
          if (y < 0) y += 22;
          P.setXYZ(i, P.getX(i) + Math.sin(t * 0.8 + sd[0]) * dt * 0.8, y, P.getZ(i) + Math.cos(t * 0.6 + sd[0]) * dt * 0.5);
        }
        P.needsUpdate = true;
      }

      var ffOp = (cur.night > 0.6 && env.season !== 'winter') ? 0.9 : 0;
      flies.mat.opacity = lerp(flies.mat.opacity, ffOp, k);
      flies.pts.visible = flies.mat.opacity > 0.02;
      if (flies.pts.visible) {
        var FP = flies.geo.attributes.position;
        for (var j = 0; j < FF; j++) {
          var b = flies.base[j];
          FP.setXYZ(j, b[0] + Math.sin(t * 0.5 + b[3]) * 1.6, b[1] + Math.sin(t * 0.9 + b[3] * 2) * 0.5, b[2] + Math.cos(t * 0.4 + b[3]) * 1.6);
        }
        FP.needsUpdate = true;
        flies.pts.position.set(f.x, GY, f.z);
      }
      haloMat.opacity = cur.night * 0.9;
      halos.visible = cur.night > 0.03;
      extraUpdate(dt, f, t);
      first = false;
    };

    // ======================= extra polish =======================
    var WY = ctx.WATER_Y, islandR = ctx.islandR, H = ctx.home;

    // soft contact shadows under trees, bushes, rocks and buildings
    (function () {
      var list = ctx.blobs || [];
      if (!list.length) return;
      var tx = ctx.tex(64, 64, function (g) {
        var gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
        gr.addColorStop(0, 'rgba(16,44,40,0.55)'); gr.addColorStop(0.55, 'rgba(16,44,40,0.28)'); gr.addColorStop(1, 'rgba(16,44,40,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      });
      var m = new T.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      var geo = new T.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
      var im = new T.InstancedMesh(geo, m, list.length);
      var m4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3();
      list.forEach(function (b, i) {
        p.set(b[0], GY + 0.07, b[1]); s.set(b[2] * 2.2, 1, b[2] * 2.2);
        m4.compose(p, q, s); im.setMatrixAt(i, m4);
      });
      im.renderOrder = 1; im.frustumCulled = false;
      root.add(im);
    })();

    // shoreline foam: two ribbons that breathe in and out around the island
    var ribbons = [];
    var makeRibbon = function (inner, outer, base, ph) {
      var N = 180, pos = new Float32Array((N + 1) * 6), idx = [];
      for (var i = 0; i <= N; i++) {
        var th = i / N * Math.PI * 2, r = islandR(th), c = Math.cos(th), s = Math.sin(th);
        pos.set([c * (r + inner), WY + 0.07, s * (r + inner), c * (r + outer), WY + 0.07, s * (r + outer)], i * 6);
        if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setIndex(idx);
      var m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: base, depthWrite: false, side: T.DoubleSide }));
      m.frustumCulled = false;
      scene.add(m);
      ribbons.push({ m: m, base: base, ph: ph });
    };
    makeRibbon(0.15, 1.2, 0.55, 0);
    makeRibbon(2.0, 2.5, 0.3, 2.1);

    // twinkling highlights on the water
    var sparkTex = ctx.tex(32, 32, function (g) {
      var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    });
    var sparks = [0, 1, 2].map(function (gi) {
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(new Float32Array(60 * 3), 3));
      var m = new T.PointsMaterial({ size: 5, map: sparkTex, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false, blending: T.AdditiveBlending });
      var pts = new T.Points(geo, m);
      pts.frustumCulled = false;
      scene.add(pts);
      return { pts: pts, geo: geo, mat: m, ph: gi * 2.1, prev: -1, ready: false };
    });
    var rollSparks = function (o, f) {
      var P = o.geo.attributes.position, n = 0, tries = 0;
      while (n < 60 && tries++ < 600) {
        var x = f.x + (Math.random() - 0.5) * 70, z = f.z + (Math.random() - 0.5) * 70;
        if (Math.hypot(x, z) < islandR(Math.atan2(z, x)) + 3.5) continue;
        P.setXYZ(n++, x, WY + 0.12, z);
      }
      for (; n < 60; n++) P.setXYZ(n, 0, -50, 0);
      P.needsUpdate = true;
    };

    // drifting cloud shadows
    var cloudTex = ctx.tex(256, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      for (var i = 0; i < 9; i++) {
        var x = Math.random() * w, y = Math.random() * h, r = 28 + Math.random() * 40;
        for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
          var gr = g.createRadialGradient(x + ox * w, y + oy * h, 0, x + ox * w, y + oy * h, r);
          gr.addColorStop(0, 'rgba(10,40,45,0.9)'); gr.addColorStop(1, 'rgba(10,40,45,0)');
          g.fillStyle = gr; g.fillRect(x + ox * w - r, y + oy * h - r, r * 2, r * 2);
        }
      }
    });
    cloudTex.wrapS = cloudTex.wrapT = T.RepeatWrapping;
    var CLOUD = 150;
    cloudTex.repeat.set(1, 1);
    var cloud = new T.Mesh(new T.PlaneGeometry(CLOUD, CLOUD), new T.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.2, depthWrite: false }));
    cloud.rotation.x = -Math.PI / 2; cloud.renderOrder = 2; cloud.frustumCulled = false;
    scene.add(cloud);

    // birds: a few circle the house, a few cross the island
    var birds = [];
    var addBird = function (cx, cz, rad, y, sp, ph) {
      var g = new T.Group(), white = new T.MeshLambertMaterial({ color: '#F4EFE2' });
      var body = new T.Mesh(new T.BoxGeometry(0.5, 0.14, 0.2), white); g.add(body);
      var head = new T.Mesh(new T.BoxGeometry(0.16, 0.14, 0.16), white); head.position.set(0.3, 0.02, 0); g.add(head);
      var beak = new T.Mesh(new T.BoxGeometry(0.1, 0.05, 0.06), new T.MeshLambertMaterial({ color: '#F2A65A' })); beak.position.set(0.42, 0, 0); g.add(beak);
      var wings = [-1, 1].map(function (s) {
        var piv = new T.Group(); piv.position.set(0, 0.04, s * 0.08); g.add(piv);
        var w = new T.Mesh(new T.BoxGeometry(0.3, 0.03, 0.55), white); w.position.z = s * 0.28; piv.add(w);
        return piv;
      });
      g.scale.setScalar(1.0);
      scene.add(g);
      birds.push({ g: g, wings: wings, cx: cx, cz: cz, rad: rad, y: y, sp: sp, ph: ph });
    };
    for (var bi = 0; bi < 3; bi++) addBird(H.x, H.z, 14 + bi * 3.2, 9.5 + bi * 0.8, (bi % 2 ? -1 : 1) * (0.2 + bi * 0.03), bi * 1.7);
    for (var bj = 0; bj < 4; bj++) addBird(0, 0, 26 + bj * 7, 13 + bj, (bj % 2 ? 1 : -1) * (0.07 + bj * 0.01), bj * 2.3 + 1);

    // campfire glow
    var fireMat = new T.MeshBasicMaterial({ map: haloTex, transparent: true, opacity: 0.2, depthWrite: false, blending: T.AdditiveBlending });
    var fireGlow = new T.Mesh(new T.PlaneGeometry(11, 11), fireMat);
    fireGlow.rotation.x = -Math.PI / 2; fireGlow.position.set(11.5, GY + 0.1, -9.4);
    scene.add(fireGlow);


    // cartoon clouds drifting around the island (kept clear of the north bay so the sea stays visible)
    var cloudGeo = new T.IcosahedronGeometry(1, 1);
    var cloudMat = new T.MeshStandardMaterial({ color: '#F6F9FA', flatShading: true, roughness: 1, emissive: '#9FB2BA', emissiveIntensity: 0.18 });
    var cloudGroups = [];
    for (var cg = 0; cg < 26; cg++) {
      var th = (cg / 26) * Math.PI * 2 + rnd() * 0.2;
      var dBay = Math.abs(Math.atan2(Math.sin(th + Math.PI / 2), Math.cos(th + Math.PI / 2)));
      if (dBay < 1.05) continue;
      var rad = islandR(th) + 8 + rnd() * 26;
      var cgp = new T.Group();
      cgp.position.set(Math.cos(th) * rad, WY + 0.2 + rnd() * 2.2, Math.sin(th) * rad);
      var puffs = 4 + Math.floor(rnd() * 4);
      for (var pf = 0; pf < puffs; pf++) {
        var pm = new T.Mesh(cloudGeo, cloudMat);
        var psz = 2.4 + rnd() * 3.2;
        pm.scale.set(psz * 1.3, psz * 0.62, psz);
        pm.position.set((pf - puffs / 2) * 2.6 + rnd() * 1.2, rnd() * 1.2, (rnd() - 0.5) * 3);
        pm.castShadow = false; pm.receiveShadow = true;
        cgp.add(pm);
      }
      root.add(cgp);
      cloudGroups.push({ g: cgp, ph: rnd() * 6.28, y0: cgp.position.y });
    }

    var extraUpdate = function (dt, f, t) {
      cloudGroups.forEach(function (c) { c.g.position.y = c.y0 + Math.sin(t * 0.25 + c.ph) * 0.35; });
      var night = cur.night;
      ribbons.forEach(function (r) {
        var w = Math.sin(t * 0.8 + r.ph);
        r.m.scale.set(1 + 0.014 * w, 1, 1 + 0.014 * w);
        r.m.material.opacity = r.base * (0.55 + 0.45 * Math.sin(t * 0.8 + r.ph + 1.2)) * (1 - 0.45 * night);
      });
      sparks.forEach(function (o) {
        var v = Math.sin(t * 1.1 + o.ph);
        if (!o.ready || (o.prev > 0 && v <= 0)) { rollSparks(o, f); o.ready = true; }
        o.prev = v;
        o.mat.opacity = Math.max(0, v) * (night > 0.6 ? 0.55 : 0.85);
        o.mat.size = night > 0.6 ? 6 : 5;
      });
      var a = ctx.state ? ctx.state.az : 0;
      cloud.position.set(f.x, GY + 0.12, f.z);
      var k = 1 / CLOUD;
      cloudTex.offset.set((f.x - t * 1.1) * k, -(f.z - t * 0.6) * k);
      cloud.material.opacity = 0.2 * (1 - night * 0.8) * (env.season === 'winter' ? 0.7 : 1);
      var dayBird = night < 0.6;
      birds.forEach(function (b) {
        b.g.visible = dayBird;
        if (!dayBird) return;
        var ang = b.ph + t * b.sp;
        b.g.position.set(b.cx + Math.cos(ang) * b.rad, b.y + Math.sin(t * 0.9 + b.ph) * 0.4, b.cz + Math.sin(ang) * b.rad);
        b.g.rotation.y = b.sp > 0 ? -(ang + Math.PI / 2) : -(ang - Math.PI / 2);
        var fl = Math.sin(t * 9 + b.ph * 3) * 0.7;
        b.wings[0].rotation.x = -fl; b.wings[1].rotation.x = fl;
      });
      fireMat.opacity = (0.22 + 0.7 * night) * (0.9 + 0.1 * Math.sin(t * 11));
    };

    applyTime();
    applySeason();
  };
})();
