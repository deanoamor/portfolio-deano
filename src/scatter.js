(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.scatter = function (ctx) {
    var T = ctx.T, C = ctx.C, root = ctx.root, rnd = ctx.rnd, mesh = ctx.mesh, cyl = ctx.cyl, matF = ctx.matF, glow = ctx.glow,
      GY = ctx.GY, safe = ctx.safe, circ = ctx.circ, inst = ctx.inst, gIco = ctx.gIco, islandR = ctx.islandR,
      pois = ctx.pois, circles = ctx.obstacleCircles, rects = ctx.obstacleRects, dock = ctx.dock;

    var distDock = function (x, z) {
      var dx = x - dock.ox, dz = z - dock.oz;
      var lx = Math.max(0, Math.min(dock.len, dx * Math.cos(dock.a) + dz * Math.sin(dock.a)));
      return Math.hypot(dx - Math.cos(dock.a) * lx, dz - Math.sin(dock.a) * lx);
    };
    var onLand = function (x, z, margin) { return Math.hypot(x, z) < islandR(Math.atan2(z, x)) - margin; };
    var free = function (x, z, pad) {
      for (var i = 0; i < circles.length; i++) if (Math.hypot(circles[i][0] - x, circles[i][1] - z) < circles[i][2] + pad) return false;
      for (var j = 0; j < rects.length; j++) {
        var r = rects[j];
        if (x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad) return false;
      }
      return true;
    };
    var okTree = function (x, z) {
      if (Math.max(Math.abs(x), Math.abs(z)) < 7.6 || !onLand(x, z, 1.8) || ctx.nearPath(x, z, 1.7) || distDock(x, z) < 3.5) return false;
      for (var i = 0; i < pois.length; i++) if (Math.hypot(pois[i].x - x, pois[i].z - z) < pois[i].clear) return false;
      return free(x, z, 1.5);
    };
    var okSmall = function (x, z, pad) {
      return Math.max(Math.abs(x), Math.abs(z)) > 6.3 && onLand(x, z, 2.0) && !ctx.nearPath(x, z, 0.9) && distDock(x, z) > 1.5 && free(x, z, pad);
    };

    // ---------- forest around the edge ----------
    safe('forest', function () {
      var placed = 0, tries = 0;
      while (placed < 46 && tries++ < 1500) {
        var th = rnd() * Math.PI * 2;
        var r = islandR(th) - 2.4 - rnd() * 8;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okTree(x, z)) continue;
        var k = rnd();
        var kind = k < 0.4 ? 0 : k < 0.7 ? 1 : k < 0.9 ? 2 : 3;
        ctx.tree(x, GY, z, kind, 0.85 + rnd() * 0.45, true);
        placed++;
      }
    });

    // ---------- rolling hills near the shore ----------
    safe('hills', function () {
      var placed = 0, tries = 0;
      while (placed < 5 && tries++ < 400) {
        var th = rnd() * Math.PI * 2;
        var r = islandR(th) - 5.5;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okTree(x, z) || !free(x, z, 3)) continue;
        var s = 3.2 + rnd() * 1.8;
        var m = mesh(root, gIco, matF('#7BC287'), x, GY + 0.2, z);
        m.scale.set(s, s * 0.45, s);
        circ(x, z, s * 0.8);
        placed++;
      }
    });

    // ---------- rocks ----------
    safe('rocks', function () {
      var placed = 0, tries = 0;
      while (placed < 16 && tries++ < 600) {
        var th = rnd() * Math.PI * 2;
        var r = islandR(th) - 1.8 - rnd() * 10;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okSmall(x, z, 0.8)) continue;
        var s = 0.35 + rnd() * 0.5;
        var m = mesh(root, gIco, matF(C.rock), x, GY + s * 0.15, z);
        m.scale.set(s, s * 0.7, s);
        m.rotation.y = rnd() * 3;
        circ(x, z, s * 0.9);
        placed++;
      }
    });

    // ---------- wildflower meadows ----------
    safe('flowers', function () {
      var pal = [C.mustard, C.coral, C.cream, C.pink, '#B79CF2', '#FF9EB5'];
      var clusters = [], tries = 0;
      while (clusters.length < 16 && tries++ < 400) {
        var th = rnd() * Math.PI * 2, r = 6.5 + rnd() * 13;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (okSmall(x, z, 1.2)) clusters.push({ x: x, z: z, c1: pal[Math.floor(rnd() * pal.length)], c2: pal[Math.floor(rnd() * pal.length)] });
      }
      var heads = [], stems = [];
      clusters.forEach(function (cl) {
        for (var k = 0; k < 16; k++) {
          var a = rnd() * 6.28, rr = rnd() * 2.6;
          var x = cl.x + Math.cos(a) * rr, z = cl.z + Math.sin(a) * rr;
          if (!okSmall(x, z, 0.3)) continue;
          var h = 0.22 + rnd() * 0.18;
          stems.push({ x: x, y: GY + h / 2, z: z, sy: h / 0.3 });
          heads.push({ x: x, y: GY + h + 0.05, z: z, c: rnd() < 0.75 ? cl.c1 : cl.c2 });
        }
      });
      inst(new T.CylinderGeometry(0.02, 0.02, 0.3, 4), new T.MeshLambertMaterial({ color: '#4FA877' }), stems, false);
      inst(new T.SphereGeometry(0.1, 8, 6), new T.MeshLambertMaterial({ color: 0xffffff }), heads, false);
    });

    // ---------- grass tufts + bushes ----------
    safe('tufts', function () {
      var tufts = [], tries = 0;
      while (tufts.length < 320 && tries++ < 2000) {
        var th = rnd() * Math.PI * 2, r = 6.3 + rnd() * 15;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okSmall(x, z, 0.3)) continue;
        var s = 0.8 + rnd() * 0.8;
        tufts.push({ x: x, y: GY + 0.17 * s, z: z, ry: rnd() * 3, sx: s, sy: s, sz: s, c: rnd() < 0.5 ? '#5FB07A' : '#4FA877' });
      }
      inst(new T.ConeGeometry(0.13, 0.34, 5), new T.MeshLambertMaterial({ color: 0xffffff }), tufts, false);
    });
    safe('bushes', function () {
      var placed = 0, tries = 0;
      while (placed < 26 && tries++ < 800) {
        var th = rnd() * Math.PI * 2, r = 7 + rnd() * 13;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okSmall(x, z, 1.0)) continue;
        var s = 0.5 + rnd() * 0.45;
        var m = mesh(root, gIco, matF(rnd() < 0.5 ? '#5FB07A' : '#4FA877'), x, GY + s * 0.5, z);
        m.scale.set(s, s * 0.8, s);
        circ(x, z, s * 0.8);
        placed++;
      }
    });

    // ---------- lantern posts along the main path ----------
    safe('lanterns', function () {
      [[8.2, -3.1], [11.8, -3.2], [14.0, 0.2], [15.8, 3.2], [16.9, 6.8], [7.9, -5.6], [2.0, -8.5], [-5.5, -8.6], [-9.7, 0.2], [-12.2, 4.8]].forEach(function (p) {
        cyl(root, 0.05, 0.05, 1.7, C.ink, p[0], GY + 0.85, p[1], 0, 0, 0, 6);
        mesh(root, new T.BoxGeometry(0.28, 0.32, 0.28), glow('#FFE2A0'), p[0], GY + 1.85, p[1], 0, 0, 0, false);
        mesh(root, new T.ConeGeometry(0.28, 0.2, 4), matF(C.ink), p[0], GY + 2.1, p[1], 0, Math.PI / 4, 0);
        circ(p[0], p[1], 0.2);
      });
    });
  };
})();
