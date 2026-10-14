(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // Top-down map in the corner: island, mountains, places, you and which way the camera faces.
  parts.minimap = function (ctx) {
    var cv = document.getElementById('minimap');
    if (!cv) return;
    var g = cv.getContext('2d');
    var fol = ctx.fol, H = ctx.home, S0 = ctx.state, islandR = ctx.islandR;
    var RANGE = 58;                                   // world units from the centre to the map edge
    var size = 0, sc = 1, dpr = 1;
    var stat = document.createElement('canvas'), sg = stat.getContext('2d');
    var sig = '';

    var colors = { 'Campfire': '#F2A65A', 'Windmill': '#F4EFE2', 'Lighthouse': '#E8896B', 'Cherry tree': '#F29CB5', 'Koi pond': '#7FD0E0', 'Garden': '#F2C14E', 'Picnic spot': '#E8896B', 'The dock': '#C98B52' };
    var mx = function (x) { return size / 2 + x * sc; };
    var my = function (z) { return size / 2 + z * sc; };
    var hex = function (c) { return '#' + c.getHexString(); };

    var layout = function () {
      var r = cv.getBoundingClientRect();
      size = Math.round(r.width) || 176;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = stat.width = Math.round(size * dpr);
      cv.height = stat.height = Math.round(size * dpr);
      sc = (size / 2 - 3) / RANGE;
      sig = '';
    };

    var blob = function (c, scale, add) {
      c.beginPath();
      for (var i = 0; i <= 90; i++) {
        var th = i / 90 * Math.PI * 2, rr = (islandR(th) * scale + add);
        var x = mx(Math.cos(th) * rr), y = my(Math.sin(th) * rr);
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath();
    };

    var drawStatic = function () {
      sg.setTransform(dpr, 0, 0, dpr, 0, 0);
      sg.clearRect(0, 0, size, size);
      sg.fillStyle = hex(ctx.waterBase.material.color);
      sg.fillRect(0, 0, size, size);
      sg.fillStyle = hex(ctx.discs[1].material.color);
      sg.beginPath(); sg.arc(size / 2, size / 2, 62 * sc, 0, 7); sg.fill();
      // islets
      [[-64, -22, 4.2], [62, -34, 3.6], [-56, 48, 4.8], [60, 46, 3.2]].forEach(function (p) {
        sg.fillStyle = hex(fol.sand.color); sg.beginPath(); sg.arc(mx(p[0]), my(p[1]), (p[2] + 1) * sc, 0, 7); sg.fill();
        sg.fillStyle = hex(fol.grass.color); sg.beginPath(); sg.arc(mx(p[0]), my(p[1]), p[2] * sc, 0, 7); sg.fill();
      });
      blob(sg, 1, 1.5); sg.fillStyle = hex(fol.sand.color); sg.fill();
      blob(sg, 1, 0); sg.fillStyle = hex(fol.grass.color); sg.fill();
      // dock
      var d = ctx.dock;
      sg.strokeStyle = '#C98B52'; sg.lineWidth = Math.max(2, 1.6 * sc); sg.lineCap = 'butt';
      sg.beginPath(); sg.moveTo(mx(d.ox), my(d.oz)); sg.lineTo(mx(d.ox + Math.cos(d.a) * d.len), my(d.oz + Math.sin(d.a) * d.len)); sg.stroke();
      // mountains
      if (ctx.mountains) ctx.mountains.peaks.forEach(function (p) {
        var w = p.r * sc * 1.05, h = p.r * sc * 1.25, x = mx(p.x), y = my(p.z);
        sg.fillStyle = '#8FA39E';
        sg.beginPath(); sg.moveTo(x - w, y + h * 0.45); sg.lineTo(x, y - h * 0.8); sg.lineTo(x + w, y + h * 0.45); sg.closePath(); sg.fill();
        sg.fillStyle = '#F6F9F9';
        sg.beginPath(); sg.moveTo(x - w * 0.34, y - h * 0.2); sg.lineTo(x, y - h * 0.8); sg.lineTo(x + w * 0.34, y - h * 0.2); sg.closePath(); sg.fill();
      });
      // places
      ctx.pois.forEach(function (p) {
        if (!colors[p.name]) return;
        sg.fillStyle = colors[p.name]; sg.strokeStyle = '#0E3B38'; sg.lineWidth = 1.2;
        sg.beginPath(); sg.arc(mx(p.x), my(p.z), 3.4, 0, 7); sg.fill(); sg.stroke();
      });
      // house
      sg.fillStyle = '#E8896B'; sg.strokeStyle = '#0E3B38'; sg.lineWidth = 1.5;
      sg.beginPath(); sg.rect(mx(H.x) - 5, my(H.z) - 5, 10, 10); sg.fill(); sg.stroke();
    };

    var draw = function () {
      var s = hex(fol.grass.color) + hex(fol.sand.color) + hex(ctx.waterBase.material.color);
      if (s !== sig) { sig = s; drawStatic(); }
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(stat, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      var P = ctx.person, roam = S0.mode === 'roam' && P && P.mode === 'walk';
      var px = roam ? P.x : H.x, pz = roam ? P.z : H.z;
      // camera view cone from the focus point
      var f = S0.focus, a = S0.az, dir = Math.atan2(-Math.cos(a), -Math.sin(a));
      g.fillStyle = 'rgba(255,255,255,0.38)';
      g.beginPath(); g.moveTo(mx(f.x), my(f.z));
      g.arc(mx(f.x), my(f.z), 22 * sc * 1.6, dir - 0.62, dir + 0.62); g.closePath(); g.fill();
      // you
      var pulse = 1 + 0.18 * Math.sin(performance.now() / 260);
      g.fillStyle = '#F4EFE2'; g.strokeStyle = '#0E3B38'; g.lineWidth = 2;
      g.beginPath(); g.arc(mx(px), my(pz), 5.2 * pulse, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#E8896B';
      g.beginPath(); g.arc(mx(px), my(pz), 2.6, 0, 7); g.fill();
    };

    var click = function (e) {
      var r = cv.getBoundingClientRect();
      var x = ((e.clientX - r.left) - size / 2) / sc, z = ((e.clientY - r.top) - size / 2) / sc;
      if (ctx.api && ctx.api.walkTo) ctx.api.walkTo(x, z);
    };
    cv.addEventListener('click', click);
    window.addEventListener('resize', layout);
    layout();

    var loop = function () { ctx.mmRaf = requestAnimationFrame(loop); draw(); };
    ctx.mmRaf = requestAnimationFrame(loop);
  };
})();
