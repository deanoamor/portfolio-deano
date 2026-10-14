(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  parts.scatter = function (ctx) {
    var T = ctx.T, C = ctx.C, root = ctx.root, rnd = ctx.rnd, mesh = ctx.mesh, cyl = ctx.cyl, matF = ctx.matF, glow = ctx.glow,
      GY = ctx.GY, safe = ctx.safe, circ = ctx.circ, inst = ctx.inst, gIco = ctx.gIco, islandR = ctx.islandR,
      H = ctx.home, pois = ctx.pois, circles = ctx.obstacleCircles, rects = ctx.obstacleRects, dock = ctx.dock;

    var distDock = function (x, z) {
      var dx = x - dock.ox, dz = z - dock.oz;
      var lx = Math.max(0, Math.min(dock.len, dx * Math.cos(dock.a) + dz * Math.sin(dock.a)));
      return Math.hypot(dx - Math.cos(dock.a) * lx, dz - Math.sin(dock.a) * lx);
    };
    var nearHome = function (x, z, m) { return Math.abs(x - H.x) < 5.6 * H.s + m && Math.abs(z - H.z) < 5.6 * H.s + m; };
    var onLand = function (x, z, margin) { return Math.hypot(x, z) < islandR(Math.atan2(z, x)) - margin; };
    var free = function (x, z, pad) {
      for (var i = 0; i < circles.length; i++) if (Math.hypot(circles[i][0] - x, circles[i][1] - z) < circles[i][2] + pad) return false;
      for (var j = 0; j < rects.length; j++) {
        var r = rects[j];
        if (x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad) return false;
      }
      return true;
    };
    // no tall trees on the camera side of the house, so a tree never hides it (trees no longer shrink)
    var inHouseView = function (x, z) { return x - H.x + (z - H.z) > -2 && Math.hypot(x - H.x, z - H.z) < 12; };
    var okTree = function (x, z) {
      if (inHouseView(x, z)) return false;
      if (nearHome(x, z, 3.2) || !onLand(x, z, 1.8) || ctx.nearPath(x, z, 1.7) || distDock(x, z) < 3.5) return false;
      for (var i = 0; i < pois.length; i++) if (Math.hypot(pois[i].x - x, pois[i].z - z) < pois[i].clear) return false;
      return free(x, z, 1.5);
    };
    var okSmall = function (x, z, pad) {
      return !nearHome(x, z, 1.4) && onLand(x, z, 2.0) && !ctx.nearPath(x, z, 0.9) && distDock(x, z) > 1.5 && free(x, z, pad);
    };

    // ---------- forest around the edge ----------
    safe('forest', function () {
      var placed = 0, tries = 0;
      while (placed < 78 && tries++ < 3000) {
        var th = rnd() * Math.PI * 2;
        var r = islandR(th) - 2.4 - rnd() * 14;
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okTree(x, z)) continue;
        var k = rnd();
        var kind = k < 0.4 ? 0 : k < 0.7 ? 1 : k < 0.9 ? 2 : 3;
        ctx.tree(x, GY, z, kind, (0.85 + rnd() * 0.45) * 1.4, true);
        placed++;
      }
    });

    // ---------- rolling hills near the shore ----------
    safe('hills', function () {
      var placed = 0, tries = 0;
      while (placed < 8 && tries++ < 600) {
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
      while (placed < 26 && tries++ < 900) {
        var th = rnd() * Math.PI * 2;
        var r = islandR(th) - 1.8 - rnd() * 18;
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
      while (clusters.length < 28 && tries++ < 800) {
        var th = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * islandR(th);
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
      while (tufts.length < 560 && tries++ < 4000) {
        var th = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * islandR(th);
        var x = Math.cos(th) * r, z = Math.sin(th) * r;
        if (!okSmall(x, z, 0.3)) continue;
        var s = 0.8 + rnd() * 0.8;
        tufts.push({ x: x, y: GY + 0.17 * s, z: z, ry: rnd() * 3, sx: s, sy: s, sz: s, c: rnd() < 0.5 ? '#5FB07A' : '#4FA877' });
      }
      inst(new T.ConeGeometry(0.13, 0.34, 5), new T.MeshLambertMaterial({ color: 0xffffff }), tufts, false);
    });
    safe('bushes', function () {
      var placed = 0, tries = 0;
      while (placed < 44 && tries++ < 1500) {
        var th = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * islandR(th);
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
      [[H.x + 4.6, H.z - 0.2], [H.x + 6.4, H.z + 3.6], [6.5, -9.8], [-3.5, -10.0], [-8.0, -7.2], [10.8, -4.6], [15.2, -1.2], [19.4, 6.2], [-10.8, 0.4], [-12.4, 5.2]].forEach(function (p) {
        cyl(root, 0.05, 0.05, 1.7, C.ink, p[0], GY + 0.85, p[1], 0, 0, 0, 6);
        mesh(root, new T.BoxGeometry(0.28, 0.32, 0.28), glow('#FFE2A0'), p[0], GY + 1.85, p[1], 0, 0, 0, false);
        mesh(root, new T.ConeGeometry(0.28, 0.2, 4), matF(C.ink), p[0], GY + 2.1, p[1], 0, Math.PI / 4, 0);
        circ(p[0], p[1], 0.2);
      });
    });
  };
})();
