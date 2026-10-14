(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // Builds the little person who works at the desk and walks around the island.
  // Exposes ctx.person = { g, mode, x, z, heading, path, dest, amp, phase, pose(t,dt,moving), sit(), stand() }
  parts.person = function (ctx) {
    var T = ctx.T, C = ctx.C, box = ctx.box, cyl = ctx.cyl, sph = ctx.sph, mesh = ctx.mesh, mat = ctx.mat, root = ctx.root;

    var skin = '#F2C9A5', hoodie = C.coral, pants = '#2F5D62', hair = '#2B2A33';
    var g = new T.Group();
    var body = new T.Group();
    g.add(body);

    var legs = [-1, 1].map(function (s) {
      var hip = new T.Group();
      hip.position.set(s * 0.2, 1.2, 0);
      body.add(hip);
      box(hip, 0.34, 0.6, 0.36, pants, 0, -0.3, 0);
      var knee = new T.Group();
      knee.position.set(0, -0.6, 0);
      hip.add(knee);
      box(knee, 0.3, 0.58, 0.32, pants, 0, -0.29, 0);
      box(knee, 0.34, 0.14, 0.5, C.cream, 0, -0.54, 0.08);
      return { hip: hip, knee: knee };
    });
    box(body, 0.85, 0.95, 0.52, hoodie, 0, 1.675, 0);
    box(body, 0.7, 0.2, 0.3, hoodie, 0, 2.15, -0.2);
    box(body, 0.6, 0.16, 0.02, '#D56F5A', 0, 1.45, 0.27);
    var arms = [-1, 1].map(function (s) {
      var sh = new T.Group();
      sh.position.set(s * 0.56, 2.0, 0);
      body.add(sh);
      box(sh, 0.26, 0.8, 0.28, hoodie, 0, -0.4, 0);
      sph(sh, 0.15, skin, 0, -0.85, 0);
      return sh;
    });
    var head = new T.Group();
    head.position.set(0, 2.5, 0);
    body.add(head);
    sph(head, 0.52, skin, 0, 0, 0);
    sph(head, 0.55, hair, 0, 0.1, -0.07, 1, 0.85, 1);
    box(head, 0.8, 0.2, 0.2, hair, 0, 0.32, 0.36);
    box(head, 0.07, 0.1, 0.04, '#222222', -0.17, 0.0, 0.5);
    box(head, 0.07, 0.1, 0.04, '#222222', 0.17, 0.0, 0.5);
    box(head, 0.12, 0.05, 0.03, '#E8896B', -0.3, -0.12, 0.47);
    box(head, 0.12, 0.05, 0.03, '#E8896B', 0.3, -0.12, 0.47);
    mesh(head, new T.TorusGeometry(0.56, 0.05, 8, 20, Math.PI), mat(C.teal2), 0, 0.02, 0);
    cyl(head, 0.2, 0.2, 0.14, C.teal2, -0.57, 0, 0, 0, 0, Math.PI / 2, 14);
    cyl(head, 0.2, 0.2, 0.14, C.teal2, 0.57, 0, 0, 0, 0, Math.PI / 2, 14);

    var P = {
      g: g, mode: 'sit', x: -1.8, z: -2.6, y: 0.05, heading: 0, path: [], dest: null, amp: 0, phase: 0
    };

    P.pose = function (t, dt, moving) {
      if (P.mode === 'sit') {
        legs[0].hip.rotation.x = legs[1].hip.rotation.x = -Math.PI / 2;
        legs[0].knee.rotation.x = legs[1].knee.rotation.x = Math.PI / 2;
        arms[0].rotation.x = -1.05 + Math.sin(t * 13) * 0.05;
        arms[1].rotation.x = -1.05 + Math.sin(t * 13 + 1.7) * 0.05;
        body.position.y = 0;
        head.rotation.x = 0.12;
        return;
      }
      P.amp += ((moving ? 1 : 0) - P.amp) * Math.min(1, dt * 10);
      if (moving) P.phase += dt * 11;
      var s = Math.sin(P.phase) * P.amp;
      legs[0].hip.rotation.x = s * 0.8;
      legs[1].hip.rotation.x = -s * 0.8;
      legs[0].knee.rotation.x = Math.max(0, s);
      legs[1].knee.rotation.x = Math.max(0, -s);
      arms[0].rotation.x = -s * 0.7;
      arms[1].rotation.x = s * 0.7;
      body.position.y = Math.abs(Math.sin(P.phase)) * 0.08 * P.amp + (moving ? 0 : Math.sin(t * 2) * 0.01);
      head.rotation.x = 0;
    };

    // sit down at the desk (child of the chair, so it moves with the north wall)
    P.sit = function () {
      if (g.parent) g.parent.remove(g);
      ctx.chair.add(g);
      g.position.set(0, -0.33, 0.1);
      g.rotation.set(0, Math.PI, 0);
      g.scale.setScalar(1);
      P.mode = 'sit';
      P.path = [];
      P.dest = null;
    };
    // stand up and walk out of the east door
    P.stand = function () {
      if (g.parent) g.parent.remove(g);
      root.add(g);
      var H = ctx.home;
      var w = function (x, z) { return [H.x + x * H.s, H.z + z * H.s]; };
      g.scale.setScalar(H.s);
      var st = w(-1.8, -2.6);
      P.x = st[0]; P.z = st[1]; P.y = 0.05 * H.s; P.amp = 0; P.phase = 0;
      P.heading = 0.9;
      P.mode = 'walk';
      P.dest = null;
      P.path = [w(-1.0, -1.0), w(2.0, -3.0), w(3.2, -4.0), w(5.3, -4.0), w(7.6, -4.0)];
      g.position.set(P.x, P.y, P.z);
      g.rotation.set(0, P.heading, 0);
    };

    P.sit();
    ctx.person = P;
  };
})();
