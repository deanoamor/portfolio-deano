(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.core = function (ctx) {
    var T = THREE;
    var canvas = ctx.canvas;
    var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
    var smooth = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var wrapPi = function (x) { while (x > Math.PI) x -= 2 * Math.PI; while (x < -Math.PI) x += 2 * Math.PI; return x; };
    var seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var safe = function (name, fn) { try { fn(); } catch (err) { console.error('scene part failed: ' + name, err); } };

    var C = {
      teal: '#7FBDB8', teal2: '#5FA8A4', teal3: '#3EA094', sage: '#C9D5C3', cream: '#F4EFE2',
      ink: '#223433', coral: '#E8896B', mustard: '#F2C14E', wood: '#C98B52', wood2: '#E2B27A',
      woodDark: '#8A6446', green: '#4FA877', green2: '#6CC08F', pink: '#F7B2C4', rock: '#A7BDB7'
    };

    // ---------- renderer / scene / lights ----------
    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setClearColor(0x7CCBC8, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    var scene = new T.Scene();
    var camera = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 160);
    var hemi = new T.HemisphereLight(0xffffff, 0xa8c8c0, 0.62);
    scene.add(hemi);
    var sun = new T.DirectionalLight(0xfff0d6, 0.5);
    sun.castShadow = true;
    var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    sun.shadow.mapSize.set(coarse ? 2048 : 4096, coarse ? 2048 : 4096);
    sun.shadow.camera.left = -26; sun.shadow.camera.right = 26;
    sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.03;
    scene.add(sun);
    scene.add(sun.target);
    var root = new T.Group();
    scene.add(root);

    // ---------- the lake ----------
    var WATER_Y = -1.25;
    var flatDisc = function (r, c, y) {
      var m = new T.Mesh(new T.CircleGeometry(r, 72), new T.MeshBasicMaterial({ color: c }));
      m.rotation.x = -Math.PI / 2; m.position.y = y;
      scene.add(m);
      discs.push(m);
    };
    var discs = [];
    var waterBase = new T.Mesh(new T.PlaneGeometry(600, 600), new T.MeshBasicMaterial({ color: 0x7CCBC8 }));
    waterBase.rotation.x = -Math.PI / 2; waterBase.position.y = WATER_Y;
    scene.add(waterBase);
    flatDisc(80, '#8ED4CF', WATER_Y + 0.01);
    flatDisc(70, '#A6DED5', WATER_Y + 0.02);
    flatDisc(60, '#BFE9DB', WATER_Y + 0.03);
    var shadowPlane = new T.Mesh(new T.PlaneGeometry(90, 90), new T.ShadowMaterial({ opacity: 0.16 }));
    shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = WATER_Y + 0.04;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ---------- island outline (wide, with a bay cut in the north where the house sits) ----------
    var islandR = function (th) {
      var d = wrapPi(th + Math.PI / 2);
      return 38 * (1 + 0.09 * Math.sin(2 * th + 0.7) + 0.06 * Math.sin(3 * th + 2.1) + 0.035 * Math.sin(5 * th + 0.3)) * (1 - 0.22 * Math.exp(-(d * d) / 0.55));
    };
    // The house is built at 1/2 scale next to the rest of the island (a person is 1.5 units tall)
    var HOME_S = 0.5, HOME_TH = -Math.PI / 2;
    var home = { s: HOME_S, x: 0, z: Math.sin(HOME_TH) * (islandR(HOME_TH) - 8.2) };

    var anim = [];
    var rings = [];
    for (var i = 0; i < 3; i++) {
      var rm = new T.Mesh(new T.RingGeometry(0.96, 1, 80), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false }));
      rm.rotation.x = -Math.PI / 2; rm.position.y = WATER_Y + 0.06;
      scene.add(rm);
      rings.push({ m: rm, ph: i / 3 });
    }
    var foamMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
    var foam = [];
    for (var j = 0; j < 70; j++) {
      var fa = rnd() * Math.PI * 2, fr = 58 + rnd() * 40;
      var fm = new T.Mesh(new T.PlaneGeometry(1.2, 0.17), foamMat);
      fm.rotation.set(-Math.PI / 2, 0, rnd() * 3);
      fm.position.set(Math.cos(fa) * fr, WATER_Y + 0.05, Math.sin(fa) * fr);
      scene.add(fm);
      foam.push({ m: fm, ph: rnd() * 6.28 });
    }
    anim.push(function (t) {
      rings.forEach(function (r) {
        var f = (t * 0.1 + r.ph) % 1;
        r.m.scale.setScalar(48 + f * 14);
        r.m.material.opacity = 0.45 * (1 - f);
      });
      foam.forEach(function (f) { f.m.scale.x = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.9 + f.ph)); });
    });

    // ---------- helpers ----------
    var mats = {};
    var mat = function (c) { return mats[c] || (mats[c] = new T.MeshLambertMaterial({ color: c })); };
    var matFs = {};
    var matF = function (c) { return matFs[c] || (matFs[c] = new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: 1, metalness: 0 })); };
    var glow = function (c) { return new T.MeshBasicMaterial({ color: c }); };
    var mesh = function (p, geo, material, x, y, z, rx, ry, rz, shadow) {
      var m = new T.Mesh(geo, material);
      m.position.set(x || 0, y || 0, z || 0);
      m.rotation.set(rx || 0, ry || 0, rz || 0);
      if (shadow !== false) { m.castShadow = true; m.receiveShadow = true; }
      p.add(m);
      return m;
    };
    var box = function (p, w, h, d, c, x, y, z, rx, ry, rz) { return mesh(p, new T.BoxGeometry(w, h, d), mat(c), x, y, z, rx, ry, rz); };
    var cyl = function (p, rt, rb, h, c, x, y, z, rx, ry, rz, seg) { return mesh(p, new T.CylinderGeometry(rt, rb, h, seg || 20), mat(c), x, y, z, rx, ry, rz); };
    var sph = function (p, r, c, x, y, z, sx, sy, sz) {
      var m = mesh(p, new T.SphereGeometry(r, 16, 12), mat(c), x, y, z);
      m.scale.set(sx || 1, sy || 1, sz || 1);
      return m;
    };
    var flat = function (p, w, h, material, x, y, z) { return mesh(p, new T.PlaneGeometry(w, h), material, x, y, z, 0, 0, 0, false); };
    var tex = function (w, h, draw) {
      var cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      draw(cv.getContext('2d'), w, h);
      var t = new T.CanvasTexture(cv);
      t.anisotropy = 4;
      return t;
    };
    // instanced mesh from a list of {x,y,z,rx,ry,rz,sx,sy,sz,c}
    var inst = function (geo, material, list, shadow) {
      var im = new T.InstancedMesh(geo, material, list.length);
      var m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), p = new T.Vector3(), s = new T.Vector3(), col = new T.Color();
      list.forEach(function (o, i) {
        p.set(o.x, o.y, o.z); e.set(o.rx || 0, o.ry || 0, o.rz || 0); q.setFromEuler(e);
        s.set(o.sx || 1, o.sy || 1, o.sz || 1);
        m4.compose(p, q, s);
        im.setMatrixAt(i, m4);
        if (o.c) { col.set(o.c); im.setColorAt(i, col); }
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.castShadow = !!shadow; im.receiveShadow = true;
      root.add(im);
      return im;
    };


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
      dead.forEach(function (o) { o.parent.remove(o); });
      order.forEach(function (k) {
        var b = buckets[k], n = 0;
        b.geos.forEach(function (gm) { n += gm.attributes.position.count; });
        var hasCol = !!b.geos[0].attributes.color;
        var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = hasCol ? new Float32Array(n * 3) : null, o3 = 0, o2 = 0;
        b.geos.forEach(function (gm) {
          pos.set(gm.attributes.position.array, o3); nor.set(gm.attributes.normal.array, o3);
          if (gm.attributes.uv) uv.set(gm.attributes.uv.array, o2);
          if (hasCol && gm.attributes.color) col.set(gm.attributes.color.array, o3);
          o3 += gm.attributes.position.count * 3; o2 += gm.attributes.position.count * 2;
          gm.dispose();
        });
        var mg = new T.BufferGeometry();
        mg.setAttribute('position', new T.BufferAttribute(pos, 3));
        mg.setAttribute('normal', new T.BufferAttribute(nor, 3));
        mg.setAttribute('uv', new T.BufferAttribute(uv, 2));
        if (hasCol) mg.setAttribute('color', new T.BufferAttribute(col, 3));
        var m = new T.Mesh(mg, b.m);
        m.castShadow = b.cast; m.receiveShadow = true;
        g.add(m);
      });
    };

    Object.assign(ctx, {
      bake: bake,
      T: T, canvas: canvas, renderer: renderer, scene: scene, camera: camera, sun: sun, root: root,
      shadowPlane: shadowPlane, hemi: hemi, discs: discs, waterBase: waterBase, foamMat: foamMat, lanterns: [], blobs: [], islandR: islandR, home: home, WATER_Y: WATER_Y, GY: -0.3,
      clamp: clamp, smooth: smooth, lerp: lerp, wrapPi: wrapPi, rnd: rnd, reduce: reduce, safe: safe, C: C,
      mat: mat, matF: matF, glow: glow, mesh: mesh, box: box, cyl: cyl, sph: sph, flat: flat, tex: tex, inst: inst,
      anim: anim, tall: [], pois: [], paths: [], obstacleCircles: [], obstacleRects: [], walls: [], anchors: {},
      circ: function (x, z, r, lv) { ctx.obstacleCircles.push([x, z, r, lv || 0]); },
      rect: function (x0, z0, x1, z1, lv) { ctx.obstacleRects.push([x0, z0, x1, z1, lv || 0]); }
    });
  };
})();
