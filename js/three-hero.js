/* ==========================================================================
   GIGL International School — 3D hero (Three.js r128)
   Neoclassical pillars + orbiting emblem meshes + gold particles.
   Degrades quietly: no WebGL, small screen or reduced motion -> CSS gradient only.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia("(max-width: 768px)").matches;
  if (reduce) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    console.warn("[GIGL] WebGL unavailable, using gradient hero.", e);
    return;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0.6, 9);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  var GOLD = 0xf5b301, GOLD_L = 0xfed966, STEEL = 0x18324f;

  /* ---------- lighting ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.DirectionalLight(0xfff2cc, 1.1);
  key.position.set(4, 6, 6);
  scene.add(key);
  var rim = new THREE.PointLight(GOLD, 2.2, 26);
  rim.position.set(-4, 2, 5);
  scene.add(rim);

  var group = new THREE.Group();
  scene.add(group);

  /* ---------- pillars ---------- */
  var pillarGeo = new THREE.CylinderGeometry(0.30, 0.34, 4.4, 18);
  var capGeo = new THREE.BoxGeometry(0.95, 0.22, 0.95);
  var pillarMat = new THREE.MeshStandardMaterial({ color: STEEL, roughness: 0.55, metalness: 0.55 });
  var capMat = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 0.9, emissive: 0x3a2a00 });

  function pillar(x, z, scale) {
    var g = new THREE.Group();
    var shaft = new THREE.Mesh(pillarGeo, pillarMat);
    var top = new THREE.Mesh(capGeo, capMat);
    var bottom = new THREE.Mesh(capGeo, capMat);
    top.position.y = 2.3;
    bottom.position.y = -2.3;
    g.add(shaft, top, bottom);
    g.position.set(x, 0, z);
    g.scale.setScalar(scale || 1);
    return g;
  }

  var pillars = [
    pillar(-3.2, -2.4, 1.05),
    pillar(-1.5, -3.6, 0.85),
    pillar(1.5, -3.6, 0.85),
    pillar(3.2, -2.4, 1.05)
  ];
  pillars.forEach(function (p) { group.add(p); });

  /* ---------- orbiting emblem meshes ---------- */
  var orbit = new THREE.Group();
  group.add(orbit);

  var goldMat = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.25, metalness: 1, emissive: 0x2a1d00 });

  var diploma = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 10), goldMat);
  diploma.rotation.z = Math.PI / 3;

  var book = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.14), goldMat);
  book.rotation.y = 0.5;

  var atom = new THREE.Group();
  var ringGeo = new THREE.TorusGeometry(0.34, 0.022, 8, 40);
  [0, Math.PI / 3, -Math.PI / 3].forEach(function (rot) {
    var r = new THREE.Mesh(ringGeo, goldMat);
    r.rotation.x = rot;
    r.rotation.y = rot * 0.6;
    atom.add(r);
  });
  var nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), goldMat);
  atom.add(nucleus);

  var orb1 = new THREE.Group(), orb2 = new THREE.Group(), orb3 = new THREE.Group();
  orb1.add(diploma); orb2.add(book); orb3.add(atom);
  [orb1, orb2, orb3].forEach(function (o) { orbit.add(o); });

  /* ---------- gold dust ---------- */
  var COUNT = small ? 350 : 1100;
  var positions = new Float32Array(COUNT * 3);
  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: GOLD_L, size: 0.045, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(dust);

  /* ---------- sizing ---------- */
  function resize() {
    var host = canvas.parentElement || canvas;
    var w = host.clientWidth || window.innerWidth;
    var h = host.clientHeight || 640;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.x = w < 900 ? 0 : 5.2;
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- pointer parallax ---------- */
  var target = { x: 0, y: 0 }, current = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------- animation ---------- */
  var running = true;
  var clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    var t = clock.getElapsedTime();
    current.x += (target.x - current.x) * 0.045;
    current.y += (target.y - current.y) * 0.045;

    camera.position.x = current.x * 0.7;
    camera.position.y = 0.6 - current.y * 0.45;
    camera.lookAt(0, 0.2, 0);

    group.rotation.y = Math.sin(t * 0.18) * 0.09;
    pillars.forEach(function (p, i) {
      p.position.y = Math.sin(t * 0.6 + i * 0.7) * 0.06;
    });

    orbit.rotation.y = t * 0.32;
    orbit.rotation.z = Math.sin(t * 0.2) * 0.08;
    orb1.position.set(Math.cos(t * 0.6) * 3.1, 1.55 + Math.sin(t * 0.8) * 0.25, Math.sin(t * 0.6) * 1.6);
    orb2.position.set(Math.cos(t * 0.6 + 2.1) * 3.3, -1.1 + Math.sin(t * 0.7 + 1) * 0.3, Math.sin(t * 0.6 + 2.1) * 1.6);
    orb3.position.set(Math.cos(t * 0.6 + 4.2) * 2.7, 0.4 + Math.sin(t * 0.9 + 2) * 0.35, Math.sin(t * 0.6 + 4.2) * 1.4);
    book.rotation.y += 0.012;
    atom.rotation.y += 0.02;
    diploma.rotation.x += 0.01;

    dust.rotation.y = t * 0.02;
    dust.position.y = Math.sin(t * 0.3) * 0.25;

    renderer.render(scene, camera);
  }
  animate();

  /* ---------- pause when hidden / off-screen ---------- */
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.start(); animate(); }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !running) { running = true; clock.start(); animate(); }
        else if (!en.isIntersecting) running = false;
      });
    }, { threshold: 0 }).observe(canvas);
  }

  window.addEventListener("pagehide", function () {
    running = false;
    renderer.dispose();
  });
})();
