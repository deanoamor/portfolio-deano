(function () {
  var parts = (window.HeroParts = window.HeroParts || {});

  // Painterly finish: scene -> render target (colour + depth), then one full-screen pass that
  // flattens colour like a brush (Kuwahara), inks the silhouettes (depth edges) and grades the picture.
  parts.post = function (ctx) {
    var T = ctx.T, renderer = ctx.renderer;
    var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    var post = ctx.post = { enabled: true, paint: coarse ? 0 : 1 };
    var size = new T.Vector2(1, 1);

    var depth = new T.DepthTexture(2, 2);
    depth.type = T.UnsignedIntType;
    depth.format = T.DepthFormat;
    var rt = new T.WebGLRenderTarget(2, 2, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: true, depthTexture: depth, samples: coarse ? 0 : 4 });

    var mat = new T.ShaderMaterial({
      uniforms: {
        tColor: { value: rt.texture }, tDepth: { value: depth }, texel: { value: new T.Vector2(1, 1) },
        near: { value: 0.1 }, far: { value: 160 }, ortho: { value: 1 }, thick: { value: 1 }, paint: { value: post.paint },
        ink: { value: new T.Color('#16241d') }, grade: { value: 1 }
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D tColor; uniform sampler2D tDepth;',
        'uniform vec2 texel; uniform float near; uniform float far; uniform float ortho; uniform float thick; uniform float paint;',
        'uniform vec3 ink; uniform float grade;',
        'varying vec2 vUv;',
        'float lin(vec2 uv){ float d = texture2D(tDepth, uv).x; if (ortho > 0.5) return near + d * (far - near); float z = d * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }',
        'vec3 C(vec2 uv){ return texture2D(tColor, uv).rgb; }',
        'void sector(float sx, float sy, out vec3 mean, out float v){',
        '  vec3 s = vec3(0.0); vec3 q = vec3(0.0);',
        '  for (int i = 0; i < 3; i++) { for (int j = 0; j < 3; j++) {',
        '    vec3 c = C(vUv + vec2(sx * float(i), sy * float(j)) * texel);',
        '    s += c; q += c * c; } }',
        '  mean = s / 9.0; vec3 var3 = q / 9.0 - mean * mean; v = var3.r + var3.g + var3.b;',
        '}',
        'void main(){',
        '  vec3 col = C(vUv);',
        '  if (paint > 0.5) {',
        '    vec3 m0; vec3 m1; vec3 m2; vec3 m3; float v0; float v1; float v2; float v3;',
        '    sector(-1.0, -1.0, m0, v0); sector(1.0, -1.0, m1, v1); sector(-1.0, 1.0, m2, v2); sector(1.0, 1.0, m3, v3);',
        '    vec3 m = m0; float v = v0;',
        '    if (v1 < v) { m = m1; v = v1; } if (v2 < v) { m = m2; v = v2; } if (v3 < v) { m = m3; v = v3; }',
        '    col = mix(col, m, 0.85);',
        '  }',
        '  vec2 e = texel * thick;',
        '  float dC = lin(vUv); float dL = lin(vUv - vec2(e.x, 0.0)); float dR = lin(vUv + vec2(e.x, 0.0)); float dU = lin(vUv + vec2(0.0, e.y)); float dD = lin(vUv - vec2(0.0, e.y));',
        '  float g = abs(dL - dR) + abs(dU - dD);',
        '  float edgeD = ortho > 0.5 ? smoothstep(0.7, 1.8, g) : smoothstep(0.018, 0.05, g / dC);',
        '  vec3 cl = C(vUv - vec2(e.x, 0.0)); vec3 cr = C(vUv + vec2(e.x, 0.0)); vec3 cu = C(vUv + vec2(0.0, e.y)); vec3 cd = C(vUv - vec2(0.0, e.y));',
        '  float gl = abs(dot(cl - cr, vec3(0.333))) + abs(dot(cu - cd, vec3(0.333)));',
        '  float edgeL = smoothstep(0.10, 0.28, gl);',
        '  float edge = max(edgeD, edgeL * 0.55);',
        '  col = mix(col, ink, edge * 0.88);',
        '  float l = dot(col, vec3(0.299, 0.587, 0.114));',
        '  vec3 g2 = mix(vec3(l), col, 1.0 + 0.22 * grade);',
        '  g2 = (g2 - 0.5) * (1.0 + 0.06 * grade) + 0.5;',
        '  g2 *= mix(vec3(0.58, 0.76, 0.9), vec3(1.07, 1.0, 0.88), smoothstep(0.12, 0.75, l));',
        '  gl_FragColor = vec4(mix(col, g2, grade), 1.0);',
        '}'
      ].join('\n'),
      depthTest: false, depthWrite: false
    });
    var quad = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    var qScene = new T.Scene(); qScene.add(quad);
    var qCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    post.resize = function () {
      renderer.getDrawingBufferSize(size);
      var w = Math.max(2, size.x), h = Math.max(2, size.y);
      rt.setSize(w, h);
      mat.uniforms.texel.value.set(1 / w, 1 / h);
      mat.uniforms.thick.value = Math.max(1, Math.round(h / 700));
    };
    // adaptive quality: drop the brush filter, then the whole pass, if the GPU cannot keep up
    var acc = 0, frames = 0, last = performance.now(), stage = 0;
    var adapt = function () {
      var now = performance.now(), dt = now - last; last = now;
      if (window.HERO_NO_ADAPT || dt > 500) return;
      acc += dt; frames++;
      if (frames >= 120) {
        var avg = acc / frames; acc = 0; frames = 0;
        if (avg > 42 && stage < 2) {
          stage++;
          if (stage === 1) { post.paint = 0; mat.uniforms.paint.value = 0; }
          else { post.enabled = false; }
        }
      }
    };
    post.render = function (scene, cam) {
      adapt();
      if (!post.enabled) { renderer.render(scene, cam); return; }
      renderer.setRenderTarget(rt);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      var u = mat.uniforms;
      u.near.value = cam.near; u.far.value = cam.far; u.ortho.value = cam.isOrthographicCamera ? 1 : 0;
      renderer.render(qScene, qCam);
    };
    post.resize();
  };
})();
