(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // A low-poly mountain range on the west side of the island. Snow line follows the season.
  parts.mountains = function (ctx) {
    var T = ctx.T, root = ctx.root, rnd = ctx.rnd, GY = ctx.GY, islandR = ctx.islandR, circ = ctx.circ;

    // Behind the house for every camera angle (the camera never looks from this side), so peaks never hide it.
    // [angle, distance in from the shore, base radius, height]
    var peaks = [
      [3.30, 12, 10, 19], [3.58, 12.5, 12, 27], [3.86, 13, 10, 20], [4.08, 14, 8, 14]
    ];
    var palettes = {
      spring: { low: '#6DBE8A', mid: '#92A9A0', snow: '#F2F7F6', line: 0.62 },
      summer: { low: '#5FB07A', mid: '#8FA39E', snow: '#F6F9F9', line: 0.72 },
      autumn: { low: '#D29A52', mid: '#A09A8E', snow: '#F3F5F2', line: 0.64 },
      winter: { low: '#E4EEEF', mid: '#BCCACC', snow: '#FFFFFF', line: 0.22 }
    };

    var list = [];
    var addPeak = function (x, z, base, h, seedKick) {
      var geo = new T.ConeGeometry(base, h, 7, 4, false);
      var pos = geo.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var y = pos.getY(i), f = (y + h / 2) / h;
        if (f < 0.97) {
          var j = (1 - f) * base * 0.14;
          pos.setX(i, pos.getX(i) + (rnd() - 0.5) * 2 * j);
          pos.setZ(i, pos.getZ(i) + (rnd() - 0.5) * 2 * j);
          pos.setY(i, y + (rnd() - 0.5) * h * 0.05);
        }
      }
      geo.translate(0, h / 2, 0);
      geo = geo.toNonIndexed();
      geo.computeVertexNormals();
      var n = geo.attributes.position.count / 3, fh = new Float32Array(n), nz = new Float32Array(n);
      for (var k = 0; k < n; k++) {
        var yy = (geo.attributes.position.getY(k * 3) + geo.attributes.position.getY(k * 3 + 1) + geo.attributes.position.getY(k * 3 + 2)) / 3;
        fh[k] = yy / h; nz[k] = rnd();
      }
      geo.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 9), 3));
      var m = new T.Mesh(geo, mat);
      m.position.set(x, GY - 0.4, z);
      m.rotation.y = rnd() * 6;
      m.castShadow = true; m.receiveShadow = true;
      root.add(m);
      list.push({ geo: geo, fh: fh, nz: nz });
    };
    var mat = new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 });

    peaks.forEach(function (p) {
      var R = islandR(p[0]), r = R - p[1];
      var x = Math.cos(p[0]) * r, z = Math.sin(p[0]) * r;
      addPeak(x, z, p[2], p[3]);
      // foothills on the shoulders
      for (var s = 0; s < 2; s++) {
        var a = rnd() * 6.28, d = p[2] * (0.75 + rnd() * 0.3);
        addPeak(x + Math.cos(a) * d, z + Math.sin(a) * d, p[2] * 0.5, p[3] * 0.38);
      }
      circ(x, z, p[2] * 0.78);
      circ(x + p[2] * 0.7, z, p[2] * 0.45);
      circ(x - p[2] * 0.7, z, p[2] * 0.45);
      circ(x, z + p[2] * 0.7, p[2] * 0.45);
      circ(x, z - p[2] * 0.7, p[2] * 0.45);
    });

    var cLow = new T.Color(), cMid = new T.Color(), cSnow = new T.Color(), c = new T.Color();
    var recolor = function (season) {
      var pal = palettes[season] || palettes.summer;
      cLow.set(pal.low); cMid.set(pal.mid); cSnow.set(pal.snow);
      list.forEach(function (o) {
        var arr = o.geo.attributes.color.array;
        for (var k = 0; k < o.fh.length; k++) {
          var f = o.fh[k] + (o.nz[k] - 0.5) * 0.08;
          if (f > pal.line) c.copy(cSnow);
          else if (f > pal.line - 0.22) c.copy(cMid).lerp(cLow, 0.15);
          else c.copy(cLow).lerp(cMid, Math.max(0, f - 0.12) * 0.9);
          c.offsetHSL(0, 0, (o.nz[k] - 0.5) * 0.05);
          for (var v = 0; v < 3; v++) { arr[k * 9 + v * 3] = c.r; arr[k * 9 + v * 3 + 1] = c.g; arr[k * 9 + v * 3 + 2] = c.b; }
        }
        o.geo.attributes.color.needsUpdate = true;
      });
    };
    recolor('summer');
    ctx.mountains = { recolor: recolor, peaks: peaks.map(function (p) { var r = islandR(p[0]) - p[1]; return { x: Math.cos(p[0]) * r, z: Math.sin(p[0]) * r, r: p[2] }; }) };
  };
})();
