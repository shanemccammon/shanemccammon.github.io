// particles.js
// Subtle slow-moving faint dots for homepage background.
// Lightweight, pauses when page hidden, scales particle count to viewport for performance.
// Designed to be low-opacity and slow so it's unobtrusive.

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let w = 0, h = 0, DPR = Math.max(1, window.devicePixelRatio || 1);
  let particles = [];
  let animId = null;
  let paused = false;

  // Configuration: tuned for subtle, low-opacity, slow motion
  const config = {
    baseCount: 60,             // base particle count for ~1080p
    maxRadius: 2.6,            // max dot radius (px)
    minRadius: 0.8,            // min dot radius (px)
    baseSpeed: 6,              // px per 2*seconds (smaller -> slower)
    minAlpha: 0.035,           // faintest opacity
    maxAlpha: 0.12,            // strongest opacity for small areas
    driftStrength: 0.25,       // how strongly they change direction over time
    connectionDistance: 0,     // no connecting lines (keeps subtle)
  };

  // Utility: size canvas
  function resize() {
    w = Math.max(300, document.documentElement.clientWidth || window.innerWidth);
    h = Math.max(300, document.documentElement.clientHeight || window.innerHeight);
    const scale = DPR;
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    initParticles();
  }

  // Determine particle count scaled to viewport area and optional CSS scale
  function computeCount() {
    const area = (w * h) / (1920 * 1080);
    // read optional CSS variable to reduce on small screens
    const root = getComputedStyle(document.documentElement);
    const scaleVar = parseFloat(root.getPropertyValue('--particles-scale')) || 1;
    const count = Math.round(config.baseCount * Math.max(0.5, area) * scaleVar);
    return Math.min(160, Math.max(18, count)); // clamp for perf
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function initParticles() {
    const count = computeCount();
    particles = new Array(count).fill(null).map(() => {
      const r = rand(config.minRadius, config.maxRadius);
      // position anywhere in the viewport (with slight buffer)
      const x = rand(-20, w + 20);
      const y = rand(-20, h + 20);
      // slow velocity; baseSpeed is scaled by viewport diagonal so move very slowly
      const speedFactor = (Math.sqrt(w * w + h * h) / 1200) * (config.baseSpeed / 10);
      // initial velocity small and randomized
      const vx = rand(-0.25, 0.25) * speedFactor;
      const vy = rand(-0.25, 0.25) * speedFactor;
      const alpha = rand(config.minAlpha, config.maxAlpha);
      // seed for gentle oscillation
      const seed = Math.random() * 1000;
      return { x, y, vx, vy, r, alpha, seed };
    });
  }

  // Animation loop
  let last = performance.now();
  function frame(now) {
    if (paused) return;
    const dt = Math.min(60, now - last) / 1000; // seconds, cap to avoid big jumps
    last = now;

    ctx.clearRect(0, 0, w, h);

    // gentle background tint so dots pop subtly (canvas sits over gradient bg)
    // Not drawing a fill so underlying CSS gradient remains visible.

    for (let p of particles) {
      // gentle oscillating acceleration to make motion organic
      const t = now * 0.0002 + p.seed;
      p.vx += Math.sin(t * 0.7) * (config.driftStrength * 0.02);
      p.vy += Math.cos(t * 0.6) * (config.driftStrength * 0.02);

      // apply velocity
      p.x += p.vx * dt * 60 * 0.2; // scale to slow motion
      p.y += p.vy * dt * 60 * 0.2;

      // wrap around edges smoothly
      if (p.x < -30) p.x = w + 30;
      if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30;
      if (p.y > h + 30) p.y = -30;

      // draw circle
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + p.alpha.toFixed(3) + ')';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(frame);
  }

  // start animation
  function start() {
    if (animId) cancelAnimationFrame(animId);
    paused = false;
    last = performance.now();
    animId = requestAnimationFrame(frame);
  }

  // stop / pause animation
  function stop() {
    paused = true;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  // Pause when page hidden to save CPU/battery
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  // Resize handling (debounced)
  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // init
  resize();
  start();

  // Expose minimal controls for debugging if needed
  window.__particles = {
    restart: function () { initParticles(); start(); },
    stop: stop,
    start: start
  };
})();