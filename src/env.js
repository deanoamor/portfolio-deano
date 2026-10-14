(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // Season + time of day. Everything eases toward the chosen target over about a second.
  parts.env = function (ctx) {
    var T = ctx.T, scene = ctx.scene, sun = ctx.sun, hemi = ctx.hemi, renderer = ctx.renderer, root = ctx.root, fol = ctx.fol;
    var rnd = ctx.rnd, lerp = ctx.lerp, GY = ctx.GY;

    // ---------- time of day ----------
    var TIMES = {
      morning: { sky: '#FFEBD6', ground: '#B8D4CE', hI: 0.62, sun: '#FFD2A0', sI: 0.58, az: 1.5, h: 9, d: 14, water: '#86CFCB', discs: ['#98D8D0', '#B2E2D5', '#CBEEDC'], night: 0, foam: 0.55 },
      noon: { sky: '#FFFFFF', ground: '#A8C8C0', hI: 0.62, sun: '#FFF0D6', sI: 0.5, az: 0.6, h: 15, d: 9, water: '#7CCBC8', discs: ['#8ED4CF', '#A6DED5', '#BFE9DB'], night: 0, foam: 0.55 },
      evening: { sky: '#FFD2B2', ground: '#98ACB6', hI: 0.55, sun: '#FF9A62', sI: 0.64, az: -1.15, h: 7, d: 13, water: '#78AEB9', discs: ['#9BBDBF', '#BAC7BE', '#D8D1BB'], night: 0.25, foam: 0.5 },
      night: { sky: '#5A72B4', ground: '#1E2A44', hI: 0.4, sun: '#A8BCFF', sI: 0.4, az: 0.4, h: 14, d: 8, water: '#1C3A5E', discs: ['#23456C', '#2B5179', '#355E86'], night: 1, foam: 0.2 }
    };

    // ---------- seasons (summer is the original palette) ----------
    var SEASONS = {
      spring: {
        grass: '#8FDB9C', sand: '#EFDDAE', hills: '#86CD92',
        pine: ['#46A074', '#5BB886'], round: ['#78CF9C', '#69C48D'], deep: ['#4AA27C', '#3D9270'], warm: ['#F7B2C4', '#F29CB5'],
        cherry: ['#F7B2C4', '#F29CB5', '#FAC6D2', '#F5A9BE'], bush: ['#69C48D', '#5BB886'],
        tufts: ['#69C48D', '#5BB886'], flowers: ['#F2C14E', '#E8896B', '#F4EFE2', '#F7B2C4', '#B79CF2', '#FF9EB5'], flowersOn: true,
        petal: '#F9B8CA', petalsGround: ['#F9B8CA', '#FAC6D2'], pond: ['#7FD0E0', '#9BDCE8'],
        fall: { colors: ['#F9B8CA', '#FAC6D2', '#F7A1BA'], n: 90, size: 5, speed: 1.5 }
      },
      summer: {
        grass: '#86CF8F', sand: '#EAD9A8', hills: '#7BC287',
        pine: ['#3E9368', '#4FA877'], round: ['#6CC08F', '#5FB07A'], deep: ['#3F8F6B', '#357F5E'], warm: ['#F2A65A', '#E8896B'],
        cherry: ['#F7B2C4', '#F29CB5', '#FAC6D2', '#F5A9BE'], bush: ['#5FB07A', '#4FA877'],
        tufts: ['#5FB07A', '#4FA877'], flowers: ['#F2C14E', '#E8896B', '#F4EFE2', '#F7B2C4', '#B79CF2', '#FF9EB5'], flowersOn: true,
        petal: '#F9B8CA', petalsGround: ['#F9B8CA', '#FAC6D2'], pond: ['#7FD0E0', '#9BDCE8'],
        fall: { colors: ['#FFFFFF'], n: 0, size: 4, speed: 1 }
      },
      autumn: {
        grass: '#BFC66E', sand: '#E3CF9C', hills: '#B3B866',
        pine: ['#3F7F5E', '#4C8F6A'], round: ['#F2A65A', '#E8896B'], deep: ['#E2B24A', '#D9A038'], warm: ['#E2603F', '#C94D3A'],
        cherry: ['#F2A65A', '#E8896B', '#E2603F', '#F0B860'], bush: ['#C99A48', '#B88A3E'],
        tufts: ['#C9B45A', '#B8A04C'], flowers: ['#E2603F', '#F2A65A', '#E2B24A', '#C94D3A', '#D98B4E', '#F0B860'], flowersOn: true,
        petal: '#E8896B', petalsGround: ['#E8896B', '#F2A65A'], pond: ['#78C2CE', '#92D0D8'],
        fall: { colors: ['#E8896B', '#F2A65A', '#E2603F', '#F2C14E'], n: 150, size: 6, speed: 2.2 }
      },
      winter: {
        grass: '#EAF3F4', sand: '#E6E4D6', hills: '#DCE9EC',
        pine: ['#4E8478', '#5E9588'], round: ['#E2EEF1', '#D3E3E8'], deep: ['#D9E7EB', '#C9DBE1'], warm: ['#EEF4F5', '#DDE9ED'],
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
      return { sky: C('#FFFFFF'), ground: C('#A8C8C0'), sun: C('#FFF0D6'), water: C('#7CCBC8'), d0: C('#8ED4CF'), d1: C('#A6DED5'), d2: C('#BFE9DB'),
        hI: 0.62, sI: 0.5, az: 0.6, h: 15, d: 9, night: 0, foam: 0.55 };
    };
    var cur = mk(), tgt = mk();

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
      tgt.d0.set(t.discs[0]); tgt.d1.set(t.discs[1]); tgt.d2.set(t.discs[2]);
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
        if (it.role === 'flowerHeads' || it.role === 'flowerStems') it.mesh.visible = s.flowersOn;
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
      cur.d0.lerp(tgt.d0, k); cur.d1.lerp(tgt.d1, k); cur.d2.lerp(tgt.d2, k);
      ['hI', 'sI', 'az', 'h', 'd', 'night', 'foam'].forEach(function (n) { cur[n] = lerp(cur[n], tgt[n], k); });
      env.night = cur.night;
      hemi.color.copy(cur.sky); hemi.groundColor.copy(cur.ground); hemi.intensity = cur.hI;
      sun.color.copy(cur.sun); sun.intensity = cur.sI;
      ctx.waterBase.material.color.copy(cur.water);
      renderer.setClearColor(cur.water, 1);
      ctx.discs[0].material.color.copy(cur.d0); ctx.discs[1].material.color.copy(cur.d1); ctx.discs[2].material.color.copy(cur.d2);
      ctx.foamMat.opacity = cur.foam;
      // the light direction is relative to the camera, so shadows read the same on screen while you rotate
      sun.position.set(f.x + Math.sin(a + cur.az) * cur.d, cur.h, f.z + Math.cos(a + cur.az) * cur.d);
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
      first = false;
    };

    applyTime();
    applySeason();
  };
})();
