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
    var rect = function (x0, z0, x1, z1, lv) { ctx.rect(HM.x + x0 * HM.s, HM.z + z0 * HM.s, HM.x + x1 * HM.s, HM.z + z1 * HM.s, lv); };
    var circ = function (x, z, r, lv) { ctx.circ(HM.x + x * HM.s, HM.z + z * HM.s, r * HM.s, lv); };

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
    var tWindowNight = tex(512, 448, function (g, w, h) {
      g.fillStyle = '#16284A'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#F4EFE2'; g.beginPath(); g.arc(390, 110, 38, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#16284A'; g.beginPath(); g.arc(404, 102, 34, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF';
      for (var i = 0; i < 26; i++) { g.fillRect((i * 97) % w, (i * 61) % 240, 3, 3); }
      g.fillStyle = '#1F3C5C'; g.beginPath(); g.ellipse(120, h, 260, 150, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#18304E'; g.beginPath(); g.ellipse(400, h, 300, 110, 0, 0, Math.PI * 2); g.fill();
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

    // =====================================================================
    //  The house: ground floor (living room with the workstation, kitchen,
    //  bedroom, bathroom) and an upstairs lounge. Modelled at full size in
    //  local units; the whole group is scaled down by ctx.home.s.
    // =====================================================================
    var HX = 11, HZ = 7.5, WH = 5.2, TH = 0.4, F2 = 5.6;
    var ST = { x0: 1.6, x1: 3.6, z0: -3.0, z1: 5.0 };                // staircase, climbs towards -z
    ctx.houseGeo = { hx: HX, hz: HZ, f2: F2, st: ST, doorZ: [-4.7, -3.3] };
    var G1 = new T.Group(); root.add(G1);                            // ground floor
    var G2 = new T.Group(); G2.visible = false; root.add(G2);        // upstairs (floor + walls + furniture)
    ctx.house = { upper: G2, lights: [] };
    var PAL = { bed: '#DCCFE4', bath: '#B7D6D2', kit: '#F4E3B5', liv: '#C9D5C3', lounge: '#F2D3C2', outer: '#F4EFE2' };
    var solid = function (x, z, w, d, lv) { rect(x - w / 2, z - d / 2, x + w / 2, z + d / 2, lv); };

    // merge static meshes that share a material into one mesh each (keeps draw calls low)
    var bake = function (g) {
      g.updateMatrixWorld(true);
      var inv = new T.Matrix4().copy(g.matrixWorld).invert();
      var buckets = {}, order = [], dead = [];
      var walk = function (o) {
        if (o.userData.noMerge) return;
        if (o !== g && o.isMesh && !o.isInstancedMesh && !Array.isArray(o.material) && o.visible) {
          var key = o.material.uuid + (o.castShadow ? 'c' : 'n');
          var geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
          geo.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld));
          if (!buckets[key]) { buckets[key] = { m: o.material, cast: o.castShadow, geos: [] }; order.push(key); }
          buckets[key].geos.push(geo);
          dead.push(o);
          return;
        }
        for (var i = 0; i < o.children.length; i++) walk(o.children[i]);
      };
      walk(g);
      dead.forEach(function (o) { o.parent.remove(o); o.geometry.dispose(); });
      order.forEach(function (k) {
        var b = buckets[k], n = 0, i;
        b.geos.forEach(function (gm) { n += gm.attributes.position.count; });
        var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), o3 = 0, o2 = 0;
        b.geos.forEach(function (gm) {
          pos.set(gm.attributes.position.array, o3); nor.set(gm.attributes.normal.array, o3);
          if (gm.attributes.uv) uv.set(gm.attributes.uv.array, o2);
          o3 += gm.attributes.position.count * 3; o2 += gm.attributes.position.count * 2;
          gm.dispose();
        });
        var mg = new T.BufferGeometry();
        mg.setAttribute('position', new T.BufferAttribute(pos, 3));
        mg.setAttribute('normal', new T.BufferAttribute(nor, 3));
        mg.setAttribute('uv', new T.BufferAttribute(uv, 2));
        var m = new T.Mesh(mg, b.m);
        m.castShadow = b.cast; m.receiveShadow = true;
        g.add(m);
      });
    };

    // ---------- walls (built from pieces so doors and windows are real openings) ----------
    var glassMat = new T.MeshBasicMaterial({ color: '#CFEAF0', transparent: true, opacity: 0.26, depthWrite: false, side: T.DoubleSide });
    var makeWall = function (o) {
      var grp = new T.Group();
      if (o.axis === 'x') grp.position.set(0, o.y0, o.c); else grp.position.set(o.c, o.y0, 0);
      o.parent.add(grp);
      var w = { id: o.id, n: o.n, mesh: grp, anchor: null, anchors: [], f: 1, lights: [], low: [], parts: [], part: !!o.part, o: o };
      var cream = mat(PAL.outer), top = mat('#EDE6D6');
      var lvs = o.lvs || [0];
      var reg = function (a0, a1) {
        lvs.forEach(function (lv) {
          if (o.axis === 'x') rect(a0, o.c - TH / 2, a1, o.c + TH / 2, lv); else rect(o.c - TH / 2, a0, o.c + TH / 2, a1, lv);
        });
      };
      o.pieces.forEach(function (pc) {
        var segs = [];
        if (pc.open) {
          var op = pc.open;
          segs.push([pc.a0, op[0], 0, o.h, 1], [op[1], pc.a1, 0, o.h, 1]);
          if (op[2] > 0) segs.push([op[0], op[1], 0, op[2], pc.kind === 'window' ? 1 : 0]);
          if (op[3] < o.h) segs.push([op[0], op[1], op[3], o.h, pc.kind === 'window' ? 1 : 0]);
          if (pc.kind === 'window') {
            var oc = (op[0] + op[1]) / 2, ow = op[1] - op[0], oh = op[3] - op[2], ocy = (op[3] + op[2]) / 2;
            var fr = function (a, b, c, d2, x2, y2) { var bb = new T.Mesh(new T.BoxGeometry(a, b, c), cream); bb.position.set(x2, y2, 0); return bb; };
            var add = function (bw, bh, ax, ay) {   // along-axis size / height / centre
              var bb = new T.Mesh(new T.BoxGeometry(o.axis === 'x' ? bw : TH + 0.1, bh, o.axis === 'x' ? TH + 0.1 : bw), cream);
              if (o.axis === 'x') bb.position.set(ax, ay, 0); else bb.position.set(0, ay, ax);
              grp.add(bb);
            };
            add(ow + 0.3, 0.16, oc, op[2] - 0.05); add(ow + 0.3, 0.16, oc, op[3] + 0.05);
            add(0.14, oh, op[0] - 0.02, ocy); add(0.14, oh, op[1] + 0.02, ocy);
            add(0.08, oh, oc, ocy);
            add(ow, 0.08, oc, ocy);
            var gl = new T.Mesh(new T.PlaneGeometry(ow, oh), glassMat);
            if (o.axis === 'x') gl.position.set(oc, ocy, 0); else { gl.rotation.y = Math.PI / 2; gl.position.set(0, ocy, oc); }
            grp.add(gl);
          }
        }
        else segs.push([pc.a0, pc.a1, 0, o.h, 1]);
        segs.forEach(function (sg) {
          var len = sg[1] - sg[0], hh = sg[3] - sg[2];
          if (len < 0.01) return;
          var ms = [cream, cream, top, cream, cream, cream];
          if (o.axis === 'x') { if (pc.cp) ms[4] = mat(pc.cp); if (pc.cm) ms[5] = mat(pc.cm); }
          else { if (pc.cp) ms[0] = mat(pc.cp); if (pc.cm) ms[1] = mat(pc.cm); }
          var geo = new T.BoxGeometry(o.axis === 'x' ? len : TH, hh, o.axis === 'x' ? TH : len);
          var m = new T.Mesh(geo, ms);
          var mid = (sg[0] + sg[1]) / 2;
          if (o.axis === 'x') m.position.set(mid, sg[2] + hh / 2, 0); else m.position.set(0, sg[2] + hh / 2, mid);
          m.castShadow = true; m.receiveShadow = true;
          grp.add(m);
          w.parts.push(m);
          if (sg[4]) reg(sg[0], sg[1]);
        });
      });
      walls.push(w);
      ctx.wallDefs = ctx.wallDefs || {};
      ctx.wallDefs[o.id] = w;
      return w;
    };
    // an anchor on one face of a wall: decor attached here shrinks and hides with the wall
    var deco = function (w, side, at) {
      var o = w.o, a = new T.Group();
      if (o.axis === 'x') { a.position.set(at, o.y0, o.c + side * TH / 2); a.rotation.y = side > 0 ? 0 : Math.PI; }
      else { a.position.set(o.c + side * TH / 2, o.y0, at); a.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; }
      o.parent.add(a);
      w.anchors.push(a);
      if (!w.anchor) w.anchor = a;
      return a;
    };
    // interior lights: attached to the house root (never to a hideable group) so toggling floors never recompiles shaders
    var addLight = function (w, color, intensity, dist, x, y, z, upper) {
      var l = new T.PointLight(color, intensity, dist * HM.s, 2);
      l.position.set(x, y, z);
      root.add(l);
      w.lights.push({ light: l, base: intensity, upper: !!upper });
    };

    var oc = PAL.outer;
    var O0 = { parent: G1, y0: 0, h: WH, lvs: [0, 1] };
    // ---- ground floor: outer walls
    var wN = makeWall({ id: 'N', axis: 'x', c: -HZ, n: [0, -1], parent: G1, y0: 0, h: WH, lvs: [0, 1], pieces: [
      { a0: -HX, a1: -1, cp: PAL.bed, open: [-9.2, -6.8, 1.8, 4.4], kind: 'window' },
      { a0: -1, a1: HX, cp: PAL.liv, open: [8.4, 10.8, 1.8, 4.4], kind: 'window' }] });
    var wS = makeWall({ id: 'S', axis: 'x', c: HZ, n: [0, 1], parent: G1, y0: 0, h: WH, lvs: [0, 1], pieces: [
      { a0: -HX, a1: -1, cm: PAL.bath, open: [-6.5, -4.5, 3.0, 4.6], kind: 'window' },
      { a0: -1, a1: HX, cm: PAL.kit, open: [7.2, 9.2, 1.9, 3.9], kind: 'window' }] });
    var wW = makeWall({ id: 'W', axis: 'z', c: -HX, n: [-1, 0], parent: G1, y0: 0, h: WH, lvs: [0, 1], pieces: [
      { a0: -HZ, a1: 0.5, cp: PAL.bed, open: [-6.2, -3.8, 1.8, 4.4], kind: 'window' },
      { a0: 0.5, a1: HZ, cp: PAL.bath }] });
    var wE = makeWall({ id: 'E', axis: 'z', c: HX, n: [1, 0], parent: G1, y0: 0, h: WH, lvs: [0, 1], pieces: [
      { a0: -HZ, a1: 0.5, cm: PAL.liv, open: [-4.7, -3.3, 0, 3.7], kind: 'door' },
      { a0: 0.5, a1: HZ, cm: PAL.kit, open: [4.0, 5.4, 1.8, 4.4], kind: 'window' }] });
    // ---- ground floor: partitions (waist-high in the cutaway, full height in first person)
    var wA = makeWall({ id: 'A', axis: 'z', c: -1, n: [1, 0], part: true, parent: G1, y0: 0, h: WH, lvs: [0], pieces: [
      { a0: -HZ, a1: 0.5, cp: PAL.liv, cm: PAL.bed, open: [-2.2, -0.8, 0, 3.7], kind: 'door' },
      { a0: 0.5, a1: HZ, cp: PAL.kit, cm: PAL.bath, open: [4.3, 5.7, 0, 3.7], kind: 'door' }] });
    var wB = makeWall({ id: 'B', axis: 'x', c: 0.5, n: [0, 1], part: true, parent: G1, y0: 0, h: WH, lvs: [0], pieces: [
      { a0: -HX, a1: -1, cp: PAL.bath, cm: PAL.bed }] });
    // ---- upstairs outer walls
    var uN = makeWall({ id: 'uN', axis: 'x', c: -HZ, n: [0, -1], parent: G2, y0: F2, h: WH, lvs: [1], pieces: [
      { a0: -HX, a1: HX, cp: PAL.lounge, open: [5.4, 8.2, 1.8, 4.4], kind: 'window' }] });
    var uS = makeWall({ id: 'uS', axis: 'x', c: HZ, n: [0, 1], parent: G2, y0: F2, h: WH, lvs: [1], pieces: [
      { a0: -HX, a1: HX, cm: PAL.lounge, open: [4.0, 6.6, 1.8, 4.4], kind: 'window' }] });
    var uW = makeWall({ id: 'uW', axis: 'z', c: -HX, n: [-1, 0], parent: G2, y0: F2, h: WH, lvs: [1], pieces: [
      { a0: -HZ, a1: HZ, cp: PAL.lounge, open: [2.6, 5.6, 1.8, 4.4], kind: 'window' }] });
    var uE = makeWall({ id: 'uE', axis: 'z', c: HX, n: [1, 0], parent: G2, y0: F2, h: WH, lvs: [1], pieces: [
      { a0: -HZ, a1: HZ, cm: PAL.lounge, open: [-6.4, -4.0, 1.8, 4.4], kind: 'window' }] });

    // ---------- floors ----------
    box(G1, 22.8, 0.8, 15.8, C.woodDark, 0, -0.4, 0);
    for (var i = 0; i < 15; i++) box(G1, 22, 0.05, 0.98, i % 2 ? '#E2B27A' : '#D8A46C', 0, 0.025, -7 + i).castShadow = false;
    for (var tx = 0; tx < 10; tx++) for (var tz = 0; tz < 7; tz++) box(G1, 1, 0.07, 1, (tx + tz) % 2 ? '#E9F3F1' : '#9FCFCB', -10.5 + tx, 0.035, 1.0 + tz).castShadow = false;   // bathroom
    for (var kx = 0; kx < 7; kx++) for (var kz = 0; kz < 4; kz++) box(G1, 1, 0.07, 1, (kx + kz) % 2 ? '#F4EFE2' : '#E0C79A', 4.7 + kx, 0.035, 3.7 + kz).castShadow = false;   // kitchen
    // upstairs slab with the stairwell cut out
    [[-4.9, 0, 13, 15.4], [7.5, 0, 7.8, 15.4], [2.6, -5.35, 2, 4.7], [2.6, 6.35, 2, 2.7]].forEach(function (s) {
      box(G2, s[2], 0.4, s[3], '#EDE6D6', s[0], 5.4, s[1]);
    });
    for (var j = 0; j < 15; j++) {
      var zc = -7 + j, cut = zc + 0.5 > ST.z0 && zc - 0.5 < ST.z1;
      var pc = j % 2 ? '#E8BE88' : '#E0B27C';
      if (!cut) box(G2, 22, 0.05, 0.98, pc, 0, F2 + 0.025, zc).castShadow = false;
      else { box(G2, 12.6, 0.05, 0.98, pc, -4.7, F2 + 0.025, zc).castShadow = false; box(G2, 7.4, 0.05, 0.98, pc, 7.3, F2 + 0.025, zc).castShadow = false; }
    }
    // stairs
    var NS = 16;
    for (var s = 0; s < NS; s++) {
      var sh = (s + 1) * F2 / NS;
      box(G1, ST.x1 - ST.x0, sh, (ST.z1 - ST.z0) / NS, s % 2 ? '#E2B27A' : '#D8A46C', (ST.x0 + ST.x1) / 2, sh / 2, ST.z1 - (s + 0.5) * (ST.z1 - ST.z0) / NS);
    }
    var railLen = Math.hypot(ST.z1 - ST.z0, F2), railAng = Math.atan2(F2, ST.z1 - ST.z0);
    box(G1, 0.12, 0.12, railLen, C.ink, ST.x1 + 0.05, 0.95 + F2 / 2, (ST.z0 + ST.z1) / 2, railAng, 0, 0);
    for (var pp = 0; pp < 6; pp++) {
      var pz = ST.z1 - 0.5 - pp * 1.4, py = (ST.z1 - pz) / (ST.z1 - ST.z0) * F2;
      box(G1, 0.1, 1.0, 0.1, C.ink, ST.x1 + 0.05, py + 0.5, pz);
    }
    // upstairs guard rails around the stairwell
    box(G2, ST.x1 - ST.x0, 0.12, 0.12, C.ink, (ST.x0 + ST.x1) / 2, F2 + 1.1, ST.z1 + 0.06);
    [ST.x0 - 0.06, ST.x1 + 0.06].forEach(function (x) { box(G2, 0.12, 0.12, ST.z1 - ST.z0, C.ink, x, F2 + 1.1, (ST.z0 + ST.z1) / 2); });
    [[ST.x0 - 0.06, ST.z1 + 0.06], [ST.x1 + 0.06, ST.z1 + 0.06], [ST.x0 - 0.06, ST.z0], [ST.x1 + 0.06, ST.z0], [ST.x0 - 0.06, 1], [ST.x1 + 0.06, 1]].forEach(function (p) { box(G2, 0.1, 1.1, 0.1, C.ink, p[0], F2 + 0.55, p[1]); });
    // stair colliders: side walls stop you stepping onto the ramp sideways, the top end is sealed at ground level
    rect(ST.x0 - 0.2, ST.z0 - 0.1, ST.x0, ST.z1 - 0.6, 0);
    rect(ST.x1, ST.z0 - 0.1, ST.x1 + 0.2, ST.z1 - 0.6, 0);
    rect(ST.x0, ST.z0 - 0.2, ST.x1, ST.z0 - 0.05, 0);
    rect(ST.x0 - 0.2, ST.z0, ST.x0, ST.z1 + 0.2, 1);
    rect(ST.x1, ST.z0, ST.x1 + 0.2, ST.z1 + 0.2, 1);
    rect(ST.x0, ST.z1, ST.x1, ST.z1 + 0.2, 1);

    // ---------- furniture helpers ----------
    var grp = function (p, x, y, z, ry) { var g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; p.add(g); return g; };
    var sofa = function (p, x, y, z, ry, len, col, col2, cush) {
      var g = grp(p, x, y, z, ry);
      box(g, len, 0.55, 1.9, col, 0, 0.33, 0.1);
      box(g, len, 1.5, 0.55, col, 0, 0.8, -0.72);
      box(g, 0.55, 1.1, 1.9, col2, -len / 2 + 0.275, 0.6, 0.1);
      box(g, 0.55, 1.1, 1.9, col2, len / 2 - 0.275, 0.6, 0.1);
      var inner = len - 1.1, n = Math.max(1, Math.round(inner / 1.6));
      for (var i = 0; i < n; i++) box(g, inner / n - 0.08, 0.3, 1.35, cush, -inner / 2 + inner / n * (i + 0.5), 0.75, 0.3);
      box(g, 0.7, 0.7, 0.2, C.coral, -len / 2 + 1.25, 1.25, -0.3, 0, 0.1, 0.25);
      box(g, 0.7, 0.7, 0.2, C.mustard, len / 2 - 1.25, 1.2, -0.3, 0, -0.1, -0.2);
      return g;
    };
    var lamp = function (p, x, y, z, h) {
      cyl(p, 0.35, 0.4, 0.08, C.ink, x, y + 0.09, z);
      cyl(p, 0.04, 0.04, h, C.ink, x, y + h / 2, z, 0, 0, 0, 8);
      var sh = new T.Mesh(new T.CylinderGeometry(0.4, 0.65, 0.75, 20, 1, true), new T.MeshLambertMaterial({ color: '#FFE3B3', emissive: '#FFD08A', emissiveIntensity: 0.7, side: T.DoubleSide }));
      sh.position.set(x, y + h + 0.2, z); sh.userData.noMerge = true; p.add(sh);
    };
    var table = function (p, x, y, z, w, d, h, col) {
      box(p, w, 0.14, d, col, x, y + h, z);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { box(p, 0.14, h, 0.14, C.cream, x + s[0] * (w / 2 - 0.2), y + h / 2, z + s[1] * (d / 2 - 0.2)); });
    };
    var chairF = function (p, x, y, z, ry, col) {
      var g = grp(p, x, y, z, ry);
      box(g, 0.9, 0.12, 0.9, col, 0, 0.9, 0);
      box(g, 0.9, 1.0, 0.12, col, 0, 1.45, -0.42);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { box(g, 0.1, 0.9, 0.1, C.woodDark, s[0] * 0.38, 0.45, s[1] * 0.38); });
    };
    var roundRug = function (p, x, y, z, r, c1, c2) {
      [[r, c1, 0.06], [r * 0.76, c2, 0.07], [r * 0.5, c1, 0.08]].forEach(function (q) {
        var m = mesh(p, new T.CylinderGeometry(q[0], q[0], 0.06, 40), mat(q[1]), x, y + q[2], z, 0, 0, 0, false); m.receiveShadow = true;
      });
    };
    var nightLamp = function (p, x, y, z) {
      cyl(p, 0.12, 0.16, 0.5, C.cream, x, y + 0.25, z, 0, 0, 0, 10);
      var sh = new T.Mesh(new T.CylinderGeometry(0.22, 0.3, 0.38, 14, 1, true), new T.MeshLambertMaterial({ color: '#FFE3B3', emissive: '#FFD08A', emissiveIntensity: 0.8, side: T.DoubleSide }));
      sh.position.set(x, y + 0.7, z); sh.userData.noMerge = true; p.add(sh);
    };

    // ================= LIVING ROOM (north-east) with the workstation =================
    var D = grp(G1, 6.0, 0, -7.3, 0);                   // local +z points into the room, x runs along the north wall
    var dx = -1.6, dz = 1.0;
    box(D, 4.4, 0.16, 1.8, C.wood, dx, 1.35, dz);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { box(D, 0.14, 1.3, 0.14, C.cream, dx + s[0] * 2.05, 0.7, dz + s[1] * 0.78); });
    box(D, 1.1, 1.2, 1.5, '#EFE9DA', dx + 1.55, 0.65, dz);
    [0.25, 0.65, 1.05].forEach(function (y) {
      box(D, 1.0, 0.34, 0.04, C.sage, dx + 1.55, y, dz + 0.77);
      box(D, 0.22, 0.05, 0.05, C.ink, dx + 1.55, y, dz + 0.81);
    });
    box(D, 0.8, 0.05, 0.5, C.ink, dx, 1.455, 0.75);
    box(D, 0.14, 0.55, 0.12, C.ink, dx, 1.755, 0.7);
    box(D, 2.2, 1.3, 0.12, C.ink, dx, 2.75, 0.75);
    flat(D, 2.0, 1.1, new T.MeshBasicMaterial({ map: tScreen }), dx, 2.75, 0.82);
    box(D, 1.3, 0.05, 0.42, C.cream, dx - 0.1, 1.455, 1.45);
    for (var r1 = 0; r1 < 3; r1++) for (var k1 = 0; k1 < 10; k1++) box(D, 0.1, 0.03, 0.09, '#CFC8B6', dx - 0.1 - 0.55 + k1 * 0.122, 1.495, 1.34 + r1 * 0.11);
    box(D, 0.95, 0.02, 0.8, C.teal, dx + 1.0, 1.44, 1.4);
    box(D, 0.2, 0.06, 0.3, C.cream, dx + 1.0, 1.48, 1.4);
    cyl(D, 0.15, 0.13, 0.28, C.cream, dx - 1.55, 1.57, 1.35);
    cyl(D, 0.12, 0.12, 0.02, '#5b3a29', dx - 1.55, 1.7, 1.35, 0, 0, 0, 16);
    mesh(D, new T.TorusGeometry(0.09, 0.025, 8, 14), mat(C.cream), dx - 1.37, 1.57, 1.35);
    var steam = [];
    for (var s2 = 0; s2 < 3; s2++) {
      var sm = new T.Mesh(new T.SphereGeometry(0.07, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
      sm.userData.noMerge = true;
      D.add(sm);
      steam.push({ m: sm, ph: s2 / 3, bx: dx - 1.55 });
    }
    ctx.anim.push(function (t) {
      steam.forEach(function (p) {
        var f = (t * 0.35 + p.ph) % 1;
        p.m.position.set(p.bx + Math.sin((t + p.ph) * 3) * 0.05, 1.78 + f * 0.9, 1.35);
        p.m.material.opacity = 0.5 * (1 - f);
        p.m.scale.setScalar(0.6 + f * 0.9);
      });
    });
    // desk lamp
    cyl(D, 0.28, 0.3, 0.06, C.ink, -3.4, 1.46, 0.5);
    box(D, 0.07, 0.9, 0.07, C.coral, -3.24, 1.92, 0.5, 0, 0, -0.35);
    box(D, 0.07, 0.8, 0.07, C.coral, -3.4, 2.59, 0.5, 0, 0, 0.9);
    cyl(D, 0.1, 0.3, 0.35, C.coral, -3.78, 2.72, 0.5, 0, 0, -0.4);
    var bulb = mesh(D, new T.SphereGeometry(0.1, 10, 8), glow('#FFE7B0'), -3.72, 2.58, 0.5, 0, 0, 0, false);
    addLight(wN, 0xffb36b, 0.9, 7, 6.0 - 3.6, 2.4, -7.3 + 0.8);
    // the chair the person sits on
    var chair = new T.Group();
    chair.position.set(-1.8, 0.05, 2.4);
    chair.rotation.y = 0.35;
    chair.userData.noMerge = true;
    D.add(chair);
    box(chair, 1.1, 0.18, 1.0, C.coral, 0, 0.78, 0);
    box(chair, 1.0, 1.1, 0.16, C.coral, 0, 1.45, 0.5, -0.08, 0, 0);
    cyl(chair, 0.07, 0.07, 0.5, C.ink, 0, 0.45, 0);
    [0, 1, 2].forEach(function (i) { box(chair, 1.0, 0.06, 0.12, C.ink, 0, 0.2, 0, 0, i * Math.PI / 3, 0); });
    for (var q = 0; q < 6; q++) { var a2 = q * Math.PI / 3; sph(chair, 0.07, C.ink, Math.cos(a2) * 0.5, 0.1, Math.sin(a2) * 0.5); }
    ctx.chair = chair;
    solid(4.4, -6.2, 5.2, 1.9, 0);            // desk + drawers
    circ(4.2, -4.9, 0.6, 0);
    // wall shelf, frame and a plant on the north wall
    var dN = deco(wN, 1, 6.0);
    box(dN, 2.8, 0.1, 0.55, C.wood, -2.6, 3.9, 0.275);
    var bcol = [C.coral, C.mustard, C.teal, C.cream, C.ink, C.teal2, C.sage], bxx = -3.85;
    for (var b = 0; b < 7; b++) {
      var bw0 = 0.13 + rnd() * 0.08, bh0 = 0.5 + rnd() * 0.3;
      box(dN, bw0, bh0, 0.38, bcol[b], bxx + bw0 / 2, 3.95 + bh0 / 2, 0.28);
      bxx += bw0 + 0.02;
    }
    cyl(dN, 0.14, 0.11, 0.2, C.coral, -1.55, 4.05, 0.28);
    sph(dN, 0.17, C.green2, -1.55, 4.25, 0.28, 1, 0.8, 1);
    frame(dN, 0.3, 3.9, 0.04, 1.1, 1.4, artC);
    plant(D, 1.2, 0.05, 0.9, 1.0, C.coral);
    stringLights(dN, -4.6, 3.6, 4.6, 0.7, 0.12, 10);
    // curtains and a sill plant for the north window
    var dNw = deco(wN, 1, 9.6);
    box(dNw, 0.5, 2.6, 0.12, C.coral, -1.45, 3.1, 0.2);
    box(dNw, 0.5, 2.6, 0.12, C.coral, 1.45, 3.1, 0.2);
    box(dNw, 3.7, 0.06, 0.06, C.ink, 0, 4.5, 0.2);
    box(dNw, 2.9, 0.1, 0.4, C.cream, 0, 1.75, 0.2);
    plant(dNw, 0.6, 1.8, 0.2, 0.45, C.cream);
    // sofa against the partition, facing east
    sofa(G1, 0.2, 0, -4.8, Math.PI / 2, 4.2, C.teal2, '#4F9894', C.teal);
    solid(0.1, -4.8, 2.0, 4.2, 0);
    lamp(G1, -0.1, 0, -1.8, 3.1);
    addLight(wA, 0xffc27a, 1.0, 8, -0.1, 3.3, -1.8);
    var dA = deco(wA, 1, -4.8);   // frames above the sofa
    frame(dA, 1.3, 3.3, 0.04, 1.0, 1.3, artA);
    frame(dA, 0, 3.3, 0.04, 1.2, 1.5, artB);
    frame(dA, -1.3, 3.3, 0.04, 1.0, 1.3, artC);
    // conversation corner: rug, coffee table, poufs, armchair, sleeping cat
    roundRug(G1, 7.2, 0, -0.4, 2.3, C.teal, C.sage);
    box(G1, 1.8, 0.2, 1.0, C.wood, 7.2, 0.8, -0.4);
    [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].forEach(function (s) { box(G1, 0.12, 0.7, 0.12, C.woodDark, 7.2 + s[0], 0.4, -0.4 + s[1]); });
    solid(7.2, -0.4, 1.9, 1.1, 0);
    [[5.3, -0.2], [9.0, -1.4]].forEach(function (p) { sph(G1, 0.6, C.mustard, p[0], 0.45, p[1], 1, 0.7, 1); circ(p[0], p[1], 0.65, 0); });
    sofa(G1, 7.2, 0, 1.9, Math.PI, 2.6, C.coral, '#D56F5A', '#F0A58C');
    solid(7.2, 1.9, 2.6, 1.9, 0);
    var cat = new T.Group();
    cat.position.set(6.2, 0.14, -1.9);
    cat.rotation.y = 0.7;
    cat.userData.noMerge = true;
    G1.add(cat);
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
    // record corner on the east wall (between the door and the kitchen)
    var dE = deco(wE, -1, 0.35);
    box(dE, 3.8, 1.3, 1.3, C.wood, 0, 0.7, 0.7);
    box(dE, 1.7, 1.0, 0.04, '#D49A60', -0.95, 0.7, 1.37);
    box(dE, 1.7, 1.0, 0.04, '#D49A60', 0.95, 0.7, 1.37);
    box(dE, 1.9, 0.18, 1.1, C.ink, -0.7, 1.44, 0.7);
    var vinyl = new T.Group();
    vinyl.position.set(-0.9, 1.56, 0.7);
    vinyl.userData.noMerge = true;
    dE.add(vinyl);
    cyl(vinyl, 0.45, 0.45, 0.05, '#15201f', 0, 0, 0, 0, 0, 0, 40);
    cyl(vinyl, 0.15, 0.15, 0.06, C.coral, 0, 0, 0, 0, 0, 0, 20);
    ctx.anim.push(function (t, dt) { vinyl.rotation.y += dt * 1.4; });
    box(dE, 0.05, 0.05, 0.7, C.cream, -0.3, 1.58, 0.75, 0, 0.5, 0);
    box(dE, 0.9, 1.7, 0.9, '#2d4a47', -2.8, 0.9, 0.6);
    box(dE, 0.9, 1.7, 0.9, '#2d4a47', 2.8, 0.9, 0.6);
    cyl(dE, 0.3, 0.3, 0.04, '#E2DDCC', -2.8, 1.2, 1.06, Math.PI / 2, 0, 0, 24);
    cyl(dE, 0.3, 0.3, 0.04, '#E2DDCC', 2.8, 1.2, 1.06, Math.PI / 2, 0, 0, 24);
    frame(dE, -1.3, 3.2, 0.04, 1.1, 1.1, artB);
    frame(dE, 0, 3.2, 0.04, 1.1, 1.1, artC);
    frame(dE, 1.3, 3.2, 0.04, 1.1, 1.1, artA);
    plant(dE, 0.9, 1.35, 0.7, 0.5, C.coral);
    solid(HX - 0.8, 0.35, 1.5, 6.6, 0);
    // door frame and mat
    var dEd = deco(wE, -1, -4.0);
    box(dEd, 0.14, 3.75, 0.16, C.cream, -0.8, 1.85, 0.08);
    box(dEd, 0.14, 3.75, 0.16, C.cream, 0.8, 1.85, 0.08);
    box(dEd, 1.7, 0.2, 0.18, C.cream, 0, 3.75, 0.09);
    box(dEd, 1.1, 0.03, 0.9, C.coral, 0, 0.07, 0.6);

    // ================= KITCHEN (south-east) =================
    var K = G1;
    box(K, 4.8, 1.4, 1.3, '#E9E1CC', 7.2, 0.7, 6.65);                   // base cabinets along the south wall
    box(K, 4.9, 0.14, 1.4, C.wood, 7.2, 1.47, 6.6);                     // worktop
    for (var c1 = 0; c1 < 5; c1++) { box(K, 0.9, 1.0, 0.04, C.sage, 5.0 + c1 * 0.95, 0.7, 5.99); box(K, 0.2, 0.05, 0.05, C.ink, 5.0 + c1 * 0.95, 1.05, 5.96); }
    box(K, 1.2, 0.18, 0.8, '#CFC8B6', 8.3, 1.52, 6.6);                  // sink
    box(K, 1.0, 0.06, 0.6, '#9FB8B5', 8.3, 1.6, 6.6);
    cyl(K, 0.05, 0.05, 0.5, C.ink, 8.3, 1.8, 6.95, 0, 0, 0, 8);
    box(K, 0.1, 0.1, 0.4, C.ink, 8.3, 2.05, 6.8);
    box(K, 1.1, 0.12, 1.05, C.ink, 5.6, 1.56, 6.6);                     // hob
    [[-0.28, -0.25], [0.28, -0.25], [-0.28, 0.25], [0.28, 0.25]].forEach(function (b2) { cyl(K, 0.17, 0.17, 0.04, '#555555', 5.6 + b2[0], 1.64, 6.6 + b2[1], 0, 0, 0, 14); });
    box(K, 1.8, 0.6, 1.0, '#CFC8B6', 5.6, 3.5, 6.75);                   // extractor hood
    box(K, 0.6, 1.3, 0.6, '#CFC8B6', 5.6, 4.5, 6.9);
    box(K, 1.3, 4.2, 1.25, '#F4EFE2', 10.2, 2.1, 6.55);                 // fridge
    box(K, 0.05, 1.6, 0.05, C.ink, 9.6, 2.9, 5.9);
    box(K, 1.25, 0.05, 0.05, C.ink, 10.2, 2.0, 5.9);
    cyl(K, 0.18, 0.15, 0.4, C.mustard, 6.6, 1.74, 6.7, 0, 0, 0, 12);    // jars + a plant on the worktop
    cyl(K, 0.2, 0.17, 0.5, C.cream, 7.0, 1.79, 6.8, 0, 0, 0, 12);
    cyl(K, 0.2, 0.16, 0.3, C.coral, 9.2, 1.69, 6.8, 0, 0, 0, 12);
    sph(K, 0.2, C.green2, 9.2, 1.95, 6.8, 1, 0.9, 1);
    solid(7.6, 6.65, 5.4, 1.3, 0); solid(10.2, 6.55, 1.3, 1.25, 0);
    table(K, 7.0, 0, 3.9, 2.8, 1.4, 1.45, C.wood2);                      // dining table
    solid(7.0, 3.9, 2.8, 1.4, 0);
    [[6.2, 2.85, 0], [7.8, 2.85, 0], [6.2, 4.95, Math.PI], [7.8, 4.95, Math.PI]].forEach(function (c) { chairF(K, c[0], 0, c[1], c[2], C.coral); circ(c[0], c[1], 0.5, 0); });
    box(K, 0.9, 0.04, 0.5, C.mustard, 7.0, 1.55, 3.9);
    cyl(K, 0.2, 0.15, 0.3, C.cream, 7.8, 1.7, 3.9, 0, 0, 0, 10);
    var dK = deco(wS, -1, 5.4);   // open shelf on the south wall
    box(dK, 2.4, 0.1, 0.5, C.wood, 0, 3.4, 0.25);
    [0.3, 0.9, 1.6].forEach(function (x, i) { cyl(dK, 0.2, 0.17, 0.4, [C.coral, C.cream, C.teal][i], x - 0.9, 3.65, 0.25, 0, 0, 0, 12); });
    var dKw = deco(wS, -1, 8.2);   // curtain over the sink window
    box(dKw, 0.4, 2.4, 0.1, C.mustard, -1.35, 2.9, 0.2);
    box(dKw, 0.4, 2.4, 0.1, C.mustard, 1.35, 2.9, 0.2);
    addLight(wA, 0xffd9a0, 0.8, 9, 7.2, 3.4, 5.2);

    // ================= BEDROOM (north-west) =================
    var bedG = grp(G1, -6.0, 0, -4.7, 0);
    box(bedG, 3.8, 0.5, 5.2, C.wood, 0, 0.45, 0);                         // frame
    box(bedG, 3.6, 0.45, 5.0, C.cream, 0, 0.92, 0.1);                     // mattress
    box(bedG, 3.7, 0.28, 3.1, '#9FC3C0', 0, 1.22, 0.95);                  // blanket
    box(bedG, 3.7, 0.12, 0.5, C.coral, 0, 1.38, -0.55);                   // folded throw
    box(bedG, 1.5, 0.3, 0.8, '#FFFDF6', -0.85, 1.28, -2.0);               // pillows
    box(bedG, 1.5, 0.3, 0.8, '#FFFDF6', 0.85, 1.28, -2.0);
    box(bedG, 4.0, 2.1, 0.25, C.wood2, 0, 1.55, -2.65);                    // headboard
    solid(-6.0, -4.7, 3.9, 5.3, 0);
    [-8.7, -3.3].forEach(function (x) {
      box(G1, 1.0, 1.0, 1.0, C.wood2, x, 0.5, -6.9); box(G1, 0.9, 0.06, 0.04, C.ink, x, 0.62, -6.38);
      nightLamp(G1, x, 1.0, -6.9);
      solid(x, -6.9, 1.0, 1.0, 0);
    });
    addLight(wN, 0xffb980, 0.8, 7, -6.0, 2.4, -4.5);
    box(G1, 1.2, 4.2, 2.8, C.wood2, -10.2, 2.1, -1.6);                    // wardrobe
    box(G1, 0.05, 3.8, 1.2, '#D49A60', -9.57, 2.1, -2.3); box(G1, 0.05, 3.8, 1.2, '#D49A60', -9.57, 2.1, -0.9);
    box(G1, 0.06, 0.5, 0.06, C.ink, -9.54, 2.1, -1.65);
    solid(-10.2, -1.6, 1.2, 2.8, 0);
    roundRug(G1, -5.8, 0, -0.1, 1.9, C.coral, C.cream);
    plant(G1, -2.0, 0.05, -6.7, 0.9, C.coral);
    circ(-2.0, -6.7, 0.6, 0);
    var dBd = deco(wN, 1, -6.0);
    frame(dBd, -0.9, 3.9, 0.04, 1.2, 1.5, artA);
    frame(dBd, 0.9, 3.9, 0.04, 1.2, 1.5, artB);
    var dBw = deco(wN, 1, -8.0);   // curtains on the bedroom window
    box(dBw, 0.45, 2.7, 0.1, '#B7A3C9', -1.45, 3.1, 0.2);
    box(dBw, 0.45, 2.7, 0.1, '#B7A3C9', 1.45, 3.1, 0.2);
    var dBw2 = deco(wW, 1, -5.0);
    box(dBw2, 0.45, 2.7, 0.1, '#B7A3C9', -1.45, 3.1, 0.2);
    box(dBw2, 0.45, 2.7, 0.1, '#B7A3C9', 1.45, 3.1, 0.2);
    var dBwall = deco(wB, -1, -5.0);   // wall clock
    cyl(dBwall, 0.6, 0.6, 0.1, C.cream, 0, 3.4, 0.07, Math.PI / 2, 0, 0, 32);
    mesh(dBwall, new T.TorusGeometry(0.6, 0.06, 8, 32), mat(C.ink), 0, 3.4, 0.12);
    box(dBwall, 0.06, 0.38, 0.03, C.ink, 0, 3.52, 0.15);
    box(dBwall, 0.06, 0.28, 0.03, C.coral, 0.1, 3.38, 0.15, 0, 0, 1.2);

    // ================= BATHROOM (south-west) =================
    var tub = grp(G1, -9.3, 0, 4.1, 0);
    box(tub, 2.4, 1.3, 5.6, C.cream, 0, 0.65, 0);
    box(tub, 2.0, 0.08, 5.2, '#BFE5EE', 0, 1.3, 0);
    box(tub, 0.12, 0.12, 0.7, C.ink, 0.0, 1.9, -2.6); cyl(tub, 0.07, 0.07, 0.6, C.ink, 0, 1.6, -2.75, 0, 0, 0, 8);
    box(tub, 0.9, 0.12, 0.5, C.teal, 0, 1.4, 1.2);                          // bath mat-ish tray / bubbles
    [[0.2, 0.6], [-0.3, 1.0], [0.4, 1.5]].forEach(function (p) { sph(tub, 0.28, '#FFFFFF', p[0], 1.45, p[1]); });
    solid(-9.3, 4.1, 2.4, 5.6, 0);
    var wc = grp(G1, -4.4, 0, 6.5, Math.PI);      // toilet facing north
    cyl(wc, 0.45, 0.4, 0.8, C.cream, 0, 0.4, 0.2, 0, 0, 0, 14);
    box(wc, 0.95, 1.1, 0.4, C.cream, 0, 1.2, -0.55);
    box(wc, 0.7, 0.08, 0.8, '#FFFDF6', 0, 0.85, 0.2);
    solid(-4.4, 6.5, 1.1, 1.4, 0);
    box(G1, 2.8, 1.5, 1.1, C.wood2, -5.8, 0.75, 1.15);                       // vanity under the mirror
    box(G1, 2.9, 0.12, 1.2, '#FFFDF6', -5.8, 1.56, 1.15);
    box(G1, 0.9, 0.08, 0.6, '#9FB8B5', -5.8, 1.62, 1.2);
    cyl(G1, 0.05, 0.05, 0.4, C.ink, -5.8, 1.85, 0.8, 0, 0, 0, 8);
    solid(-5.8, 1.15, 2.9, 1.2, 0);
    cyl(G1, 0.45, 0.4, 0.9, '#D8A46C', -2.2, 0.45, 2.2, 0, 0, 0, 12);       // laundry basket
    circ(-2.2, 2.2, 0.5, 0);
    box(G1, 1.6, 0.04, 1.0, C.coral, -3.6, 0.09, 3.6);                       // bath mat
    var dMr = deco(wB, 1, -5.8);
    cyl(dMr, 0.9, 0.9, 0.08, '#CFE8EC', 0, 3.4, 0.06, Math.PI / 2, 0, 0, 40);
    mesh(dMr, new T.TorusGeometry(0.9, 0.07, 8, 40), mat(C.wood), 0, 3.4, 0.1);
    box(dMr, 1.3, 0.08, 0.5, C.wood, 1.9, 2.4, 0.25);                        // towel shelf
    box(dMr, 1.0, 0.5, 0.36, C.cream, 1.9, 2.7, 0.25); box(dMr, 1.0, 0.4, 0.36, C.teal, 1.9, 3.15, 0.25);
    addLight(wB, 0xe8f6ff, 0.7, 7, -6.0, 3.4, 3.8);
    plant(G1, -2.0, 0.05, 6.6, 0.8, C.cream);

    // ================= UPSTAIRS LOUNGE (ruang santai) =================
    var UP = G2;
    // big round rug
    roundRug(UP, 7.0, F2, 0.4, 3.4, C.mustard, C.cream);
    // sectional sofa facing the TV on the north wall
    sofa(UP, 7.0, F2, 4.7, Math.PI, 6.4, C.coral, '#D56F5A', '#F0A58C');
    box(UP, 1.9, 0.55, 2.6, C.coral, 3.1, F2 + 0.33, 3.2);               // chaise
    box(UP, 1.7, 0.3, 2.3, '#F0A58C', 3.1, F2 + 0.75, 3.2);
    solid(7.0, 4.7, 6.4, 1.9, 1); solid(3.1, 3.2, 1.9, 2.6, 1);
    // TV wall
    var TVg = grp(UP, 7.0, F2, -7.2, 0);
    box(TVg, 5.2, 1.1, 1.2, C.wood, 0, 0.55, 0.6);
    box(TVg, 3.8, 2.2, 0.2, C.ink, 0, 3.0, 0.15);
    flat(TVg, 3.5, 1.95, new T.MeshBasicMaterial({ map: tScreen }), 0, 3.0, 0.26);
    box(TVg, 0.9, 1.7, 0.9, '#2d4a47', -3.3, 0.85, 0.7); box(TVg, 0.9, 1.7, 0.9, '#2d4a47', 3.3, 0.85, 0.7);
    cyl(TVg, 0.3, 0.3, 0.04, '#E2DDCC', -3.3, 1.2, 1.17, Math.PI / 2, 0, 0, 24); cyl(TVg, 0.3, 0.3, 0.04, '#E2DDCC', 3.3, 1.2, 1.17, Math.PI / 2, 0, 0, 24);
    box(TVg, 0.7, 0.3, 0.5, C.mustard, -1.4, 1.25, 0.6); box(TVg, 0.5, 0.5, 0.4, C.teal, 1.2, 1.35, 0.6);
    solid(7.0, -6.6, 8.2, 1.6, 1);
    table(UP, 7.0, F2, -1.5, 2.2, 1.2, 0.8, C.wood);
    solid(7.0, -1.5, 2.2, 1.2, 1);
    [[4.6, -2.0], [9.6, -1.6]].forEach(function (p, i) {
      var bb = sph(UP, 0.85, i ? C.teal : C.mustard, p[0], F2 + 0.55, p[1], 1, 0.75, 1); circ(p[0], p[1], 0.9, 1);
    });
    plant(UP, 10.0, F2 + 0.05, -5.6, 1.1, C.coral); circ(10.0, -5.6, 0.7, 1);
    // bookshelf on the west wall
    var dUW = deco(uW, 1, -3.2);
    var bw = 3.4, bh = 4.2, bd = 0.9;
    box(dUW, 0.12, bh, bd, C.wood, -bw / 2 + 0.06, bh / 2, bd / 2);
    box(dUW, 0.12, bh, bd, C.wood, bw / 2 - 0.06, bh / 2, bd / 2);
    box(dUW, bw, bh, 0.08, '#B87B45', 0, bh / 2, 0.04);
    [0.06, 1.1, 2.1, 3.1, 4.14].forEach(function (y) { box(dUW, bw, 0.12, bd, C.wood, 0, y, bd / 2); });
    var bookCols = [C.coral, C.mustard, C.teal, C.cream, C.ink, C.teal2, C.sage, '#D56F5A'];
    [0.12, 1.16, 2.16, 3.16].forEach(function (by, r2) {
      var x = -bw / 2 + 0.22, limit = bw / 2 - 0.22;
      while (x < limit - 0.15) {
        var w2 = 0.13 + rnd() * 0.1, h2 = 0.55 + rnd() * 0.3;
        box(dUW, w2, h2, 0.6, bookCols[Math.floor(rnd() * bookCols.length)], x + w2 / 2, by + h2 / 2, 0.5);
        x += w2 + 0.015;
      }
    });
    solid(-HX + 0.8, -3.2, 1.2, 3.5, 1);
    // reading nook with a sofa and a floor lamp on the south wall
    sofa(UP, -6.2, F2, 5.6, Math.PI, 4.4, C.teal2, '#4F9894', C.teal);
    solid(-6.2, 5.6, 4.4, 1.9, 1);
    lamp(UP, -9.6, F2, 6.2, 3.1);
    cyl(UP, 0.55, 0.55, 0.08, C.wood, -3.2, F2 + 1.1, 3.4); cyl(UP, 0.06, 0.06, 1.0, C.ink, -3.2, F2 + 0.6, 3.4, 0, 0, 0, 8);
    solid(-3.2, 3.4, 1.2, 1.2, 1);
    var dUS = deco(uS, -1, -6.2);
    frame(dUS, 1.7, 3.3, 0.04, 1.0, 1.3, artA);
    frame(dUS, 0, 3.3, 0.04, 1.2, 1.5, artB);
    frame(dUS, -1.7, 3.3, 0.04, 1.0, 1.3, artC);
    // east wall: record corner + door out to nothing, so keep it to a window seat
    var dUE = deco(uE, -1, 4.0);
    box(dUE, 3.4, 0.6, 1.3, C.teal, 0, 0.3, 0.65);
    box(dUE, 3.4, 0.2, 1.3, '#F0A58C', 0, 0.7, 0.65);
    box(dUE, 0.8, 0.8, 0.2, C.mustard, -1.0, 1.2, 0.3, 0, 0.1, 0.2);
    solid(HX - 0.8, 4.0, 1.4, 3.4, 1);
    var dUEw = deco(uE, -1, -5.2);
    box(dUEw, 0.45, 2.7, 0.1, C.mustard, -1.5, 3.1, 0.2); box(dUEw, 0.45, 2.7, 0.1, C.mustard, 1.5, 3.1, 0.2);
    // string lights across the lounge ceiling edge
    stringLights(deco(uS, -1, 0), -9.6, 9.6, 4.9, 0.8, 0.14, 16);
    stringLights(deco(uN, 1, 0), -9.6, 9.6, 4.9, 0.8, 0.14, 16);
    addLight(uW, 0xffc27a, 1.0, 11, 4.0, F2 + 3.4, 1.0, true);
    addLight(uW, 0xffb980, 0.8, 9, -6.5, F2 + 3.4, 3.0, true);

    // ---------- roof (first-person view only; the cutaway stays open) ----------
    safe('roof', function () {
      var roof = new T.Group();
      roof.visible = false;
      root.add(roof);
      var EAVE = F2 + WH, RISE = 5.2, HALF = 8.2, LEN = Math.hypot(HALF, RISE), ANG = Math.atan2(RISE, HALF);
      var rb = function (parent, w, h, d, c, x, y, z) { var m = box(parent, w, h, d, c, x, y, z); m.castShadow = false; return m; };
      [-1, 1].forEach(function (s) {
        var g = new T.Group();
        g.position.set(0, EAVE + RISE / 2, s * HALF / 2);
        g.rotation.x = s * ANG;
        roof.add(g);
        rb(g, 24.2, 0.3, LEN + 0.5, '#E8896B', 0, 0.02, 0);
        for (var i = 0; i < 20; i++) rb(g, 24.24, 0.07, 0.34, i % 2 ? '#D9775B' : '#EE9A7E', 0, 0.19, -LEN / 2 + 0.3 + i * (LEN - 0.3) / 19);
        rb(g, 23.8, 0.06, LEN, '#D8A46C', 0, -0.17, 0);
        for (var r = 0; r < 12; r++) rb(g, 0.15, 0.18, LEN, C.woodDark, -10.5 + r * 1.9, -0.26, 0);
      });
      var tri = new T.Shape();
      tri.moveTo(-HALF, 0); tri.lineTo(HALF, 0); tri.lineTo(0, RISE + 0.05); tri.closePath();
      var gg = new T.ExtrudeGeometry(tri, { depth: 0.4, bevelEnabled: false });
      gg.translate(0, 0, -0.2);
      [-1, 1].forEach(function (s) {
        var m = new T.Mesh(gg, mat(C.cream));
        m.rotation.y = s * Math.PI / 2; m.position.set(s * (HX), EAVE, 0);
        m.receiveShadow = true;
        roof.add(m);
      });
      rb(roof, 24.5, 0.3, 0.7, '#D9775B', 0, EAVE + RISE + 0.12, 0);
      [-7.5, -3.8, 0, 3.8, 7.5].forEach(function (x) { rb(roof, 0.3, 0.3, 14.6, C.woodDark, x, EAVE - 0.15, 0); });
      var cx = 6.5, cz = -3.8, cy = EAVE + RISE * (1 - Math.abs(cz) / HALF);
      rb(roof, 1.2, 3.6, 1.2, '#B9B2A2', cx, cy + 1.7, cz);
      rb(roof, 1.6, 0.22, 1.6, '#8F897B', cx, cy + 3.55, cz);
      var puffs = [];
      for (var k = 0; k < 5; k++) {
        var sm = new T.Mesh(new T.SphereGeometry(0.34, 8, 8), new T.MeshBasicMaterial({ color: 0xe6e6e6, transparent: true, opacity: 0.4, depthWrite: false }));
        sm.userData.noMerge = true;
        roof.add(sm);
        puffs.push({ m: sm, ph: k / 5 });
      }
      ctx.anim.push(function (t) {
        puffs.forEach(function (p) {
          var f = (t * 0.2 + p.ph) % 1;
          p.m.position.set(cx + Math.sin(t * 0.8 + p.ph * 6) * 0.35 + f * 1.4, cy + 3.8 + f * 4.2, cz);
          p.m.material.opacity = 0.42 * (1 - f);
          p.m.scale.setScalar(0.7 + f * 1.8);
        });
      });
      [[-2.5, 0.2], [5.5, 0.2]].forEach(function (p) {
        cyl(roof, 0.03, 0.03, 1.4, C.ink, p[0], EAVE + RISE - 0.95, p[1], 0, 0, 0, 6);
        cyl(roof, 0.14, 0.62, 0.5, C.coral, p[0], EAVE + RISE - 1.9, p[1], 0, 0, 0, 14);
        mesh(roof, new T.SphereGeometry(0.24, 12, 10), glow('#FFE2A0'), p[0], EAVE + RISE - 2.05, p[1], 0, 0, 0, false);
      });
      var rl = new T.PointLight(0xffd9a0, 0, 20 * HM.s, 2);
      rl.position.set(2, EAVE + RISE - 2.6, 0.2);
      root.add(rl);
      bake(roof);
      ctx.roof = { g: roof, light: rl, on: 0.7 };
    });

    // static geometry is merged per material; the roof is baked above
    bake(G1);
    bake(G2);
    walls.forEach(function (w) { w.anchors.forEach(function (a) { bake(a); }); });
  };
})();
