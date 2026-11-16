/* ==========================================================================
   PARI GULL — PORTFOLIO · mathlab.js
   Interactive mathematics suite: function graphing, descriptive statistics,
   linear programming, population models and Monte Carlo estimation.
   Calculation logic preserved from the original build; Canvas sizing and
   palette updated to the new design system.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const COLORS = {
    cyan: '#22D3EE',
    purple: '#8B5CF6',
    amber: '#FBBF24',
    grid: 'rgba(148, 163, 184, 0.16)',
    axis: 'rgba(226, 232, 240, 0.45)',
    text: '#94A3B8',
  };

  /* ---------------------------------------------------------------- */
  /*  Canvas helpers                                                   */
  /* ---------------------------------------------------------------- */
  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.max(280, Math.floor(rect.width));
    const cssH = Math.max(180, Math.floor(rect.height || 260));
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: cssW, h: cssH };
  }

  function drawAxes(ctx, w, h, xMin, xMax, yMin, yMax) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    const xMap = (x) => ((x - xMin) / (xMax - xMin)) * w;
    const yMap = (y) => h - ((y - yMin) / (yMax - yMin)) * h;

    for (let i = 0; i <= 10; i++) {
      const x = (i * w) / 10;
      const y = (i * h) / 10;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    ctx.strokeStyle = COLORS.axis;
    if (xMin <= 0 && xMax >= 0) {
      ctx.beginPath(); ctx.moveTo(xMap(0), 0); ctx.lineTo(xMap(0), h); ctx.stroke();
    }
    if (yMin <= 0 && yMax >= 0) {
      ctx.beginPath(); ctx.moveTo(0, yMap(0)); ctx.lineTo(w, yMap(0)); ctx.stroke();
    }
    return { xMap, yMap };
  }

  function drawLine(ctx, points, color, width = 2.5) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    let started = false;
    for (const p of points) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  /* ---------------------------------------------------------------- */
  /*  01 · Function graphing                                           */
  /* ---------------------------------------------------------------- */
  function plotFunction() {
    const canvas = $('functionCanvas');
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const range = Number($('rangeSlider').value);
    const fn = $('functionSelect').value;
    $('rangeValue').textContent = range;

    let yMin = -10;
    let yMax = 10;
    if (fn === 'square') { yMin = 0; yMax = Math.max(10, range * range); }

    const map = drawAxes(ctx, w, h, -range, range, yMin, yMax);
    const pts = [];
    for (let i = 0; i <= 500; i++) {
      const x = -range + (2 * range * i) / 500;
      const y = fn === 'square' ? x * x : fn === 'line' ? 2 * x + 3 : Math.sin(x);
      pts.push({ x: map.xMap(x), y: map.yMap(y) });
    }
    drawLine(ctx, pts, COLORS.cyan, 2.5);

    $('functionInfo').textContent =
      fn === 'square' ? 'Equation: y = x² · Vertex: (0, 0) · y-intercept: 0'
      : fn === 'line' ? 'Equation: y = 2x + 3 · Slope: 2 · y-intercept: 3'
      : 'Equation: y = sin(x) · Amplitude: 1 · Period: 2π';
  }

  /* ---------------------------------------------------------------- */
  /*  02 · Descriptive statistics                                      */
  /* ---------------------------------------------------------------- */
  function analyzeStats() {
    const input = $('datasetInput');
    if (!input) return;
    const raw = input.value.trim();
    const vals = raw.split(/[\s,;]+/).filter(Boolean).map(Number);

    if (!vals.length || vals.some((v) => !Number.isFinite(v))) {
      $('statsResult').textContent = 'Please enter valid numbers separated by commas or spaces.';
      return;
    }

    const sorted = [...vals].sort((a, b) => a - b);
    const n = vals.length;
    const mean = vals.reduce((s, v) => s + v, 0) / n;
    const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    const freq = new Map();
    vals.forEach((v) => freq.set(v, (freq.get(v) || 0) + 1));
    const maxFreq = Math.max(...freq.values());
    const modes = [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v);

    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const sd = Math.sqrt(variance);

    $('statsResult').textContent =
      `n = ${n} · Mean = ${mean.toFixed(3)} · Median = ${median} · Mode = ${maxFreq === 1 ? 'No repeated mode' : modes.join(', ')} · Pop. variance = ${variance.toFixed(3)} · SD = ${sd.toFixed(3)}`;

    const canvas = $('statsCanvas');
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(1, ...vals);
    const min = Math.min(0, ...vals);
    const pad = 24;
    const chartH = h - 45;
    const chartW = w - 2 * pad;
    const slot = chartW / n;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.beginPath(); ctx.moveTo(pad, h - 25); ctx.lineTo(w - pad, h - 25); ctx.stroke();

    vals.forEach((v, i) => {
      const bh = ((v - min) / (max - min || 1)) * (chartH - 10);
      const grad = ctx.createLinearGradient(0, h - 25 - bh, 0, h - 25);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.95)');
      grad.addColorStop(1, 'rgba(139, 92, 246, 0.55)');
      ctx.fillStyle = grad;
      ctx.fillRect(pad + i * slot + 2, h - 25 - bh, Math.max(2, slot - 4), bh);
    });

    ctx.fillStyle = COLORS.text;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Dataset values in entered order', pad, 16);
  }

  /* ---------------------------------------------------------------- */
  /*  03 · Linear programming                                          */
  /* ---------------------------------------------------------------- */
  function optimize() {
    const pts = [
      { x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 2, y: 8 }, { x: 0, y: 8 },
    ];
    const scored = pts.map((p) => ({ ...p, profit: 3 * p.x + 5 * p.y }));
    scored.sort((a, b) => b.profit - a.profit);
    const best = scored[0];

    $('optimizationResult').textContent =
      `Best point: (x, y) = (${best.x}, ${best.y}) · Maximum P = ${best.profit}. Evaluated ${scored.length} feasible corner points.`;

    const canvas = $('optimizationCanvas');
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const map = drawAxes(ctx, w, h, 0, 11, 0, 10);

    const region = [
      { x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 2, y: 8 }, { x: 0, y: 8 }, { x: 0, y: 0 },
    ];
    ctx.beginPath();
    region.forEach((p, i) => (i ? ctx.lineTo(map.xMap(p.x), map.yMap(p.y)) : ctx.moveTo(map.xMap(p.x), map.yMap(p.y))));
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.14)';
    ctx.fill();
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 2;
    ctx.stroke();

    scored.forEach((p) => {
      ctx.fillStyle = p.x === best.x && p.y === best.y ? COLORS.amber : COLORS.purple;
      ctx.beginPath();
      ctx.arc(map.xMap(p.x), map.yMap(p.y), 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = COLORS.text;
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Feasible region', 10, 18);
  }

  /* ---------------------------------------------------------------- */
  /*  04 · Population models                                           */
  /* ---------------------------------------------------------------- */
  function simulatePopulation() {
    const P0 = Number($('popStart').value);
    const r = Number($('growthRate').value) / 100;
    const K = Number($('capacity').value);
    const years = Number($('years').value);

    if (!(P0 > 0 && r >= 0 && K > P0 && years > 0 && years <= 100)) {
      $('populationResult').textContent =
        'Please use valid values: P₀ > 0, growth rate ≥ 0, K > P₀, and years from 1 to 100.';
      return;
    }

    const exp = [];
    const log = [];
    for (let t = 0; t <= years; t += Math.max(years / 100, 0.25)) {
      exp.push({ t, y: P0 * Math.exp(r * t) });
      log.push({ t, y: K / (1 + ((K - P0) / P0) * Math.exp(-r * t)) });
    }
    const maxY = Math.max(K, ...exp.map((p) => p.y));

    const canvas = $('populationCanvas');
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const map = drawAxes(ctx, w, h, 0, years, 0, maxY * 1.05);

    drawLine(ctx, exp.map((p) => ({ x: map.xMap(p.t), y: map.yMap(p.y) })), COLORS.purple, 2.5);
    drawLine(ctx, log.map((p) => ({ x: map.xMap(p.t), y: map.yMap(p.y) })), COLORS.cyan, 2.5);

    $('populationResult').textContent =
      `After ${years} years: exponential ≈ ${Math.round(P0 * Math.exp(r * years)).toLocaleString()} · logistic ≈ ${Math.round(K / (1 + ((K - P0) / P0) * Math.exp(-r * years))).toLocaleString()} · Purple = exponential, cyan = logistic.`;
  }

  /* ---------------------------------------------------------------- */
  /*  05 · Monte Carlo (π estimation)                                  */
  /* ---------------------------------------------------------------- */
  function runMonteCarlo() {
    const countEl = $('pointCount');
    const canvas = $('monteCanvas');
    if (!countEl || !canvas) return;

    const n = Number(countEl.value) || 5000;
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const side = Math.min(h - 24, w - 24);
    const left = (w - side) / 2;
    const top = (h - side) / 2;
    const radius = side / 2;

    // Square + inscribed circle
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(left, top, side, side);

    ctx.beginPath();
    ctx.arc(left + radius, top + radius, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    let inside = 0;
    const dot = Math.max(1.5, side / 190);
    for (let i = 0; i < n; i++) {
      const x = Math.random();
      const y = Math.random();
      const isInside = (x - 0.5) ** 2 + (y - 0.5) ** 2 <= 0.25;
      if (isInside) inside++;
      ctx.fillStyle = isInside ? 'rgba(34, 211, 238, 0.85)' : 'rgba(248, 113, 113, 0.5)';
      ctx.fillRect(left + x * side, top + y * side, dot, dot);
    }

    const estimate = (4 * inside) / n;
    const error = Math.abs(Math.PI - estimate);
    $('monteResult').textContent =
      `Points: ${n.toLocaleString()} · Inside: ${inside.toLocaleString()} · Estimated π = ${estimate.toFixed(6)} · Absolute error = ${error.toFixed(6)}.`;
  }

  /* ---------------------------------------------------------------- */
  /*  Wiring                                                           */
  /* ---------------------------------------------------------------- */
  const bind = (id, event, handler) => {
    const el = $(id);
    if (el) el.addEventListener(event, handler);
  };

  bind('plotButton', 'click', plotFunction);
  bind('functionSelect', 'change', plotFunction);
  bind('rangeSlider', 'input', plotFunction);

  bind('analyzeButton', 'click', analyzeStats);
  bind('sampleDataButton', 'click', () => {
    const input = $('datasetInput');
    if (!input) return;
    input.value = '62, 75, 81, 81, 88, 93, 70, 76, 85';
    analyzeStats();
  });

  bind('optimizeButton', 'click', optimize);
  bind('simulateButton', 'click', simulatePopulation);
  bind('runMonteCarlo', 'click', runMonteCarlo);

  const RENDERERS = {
    mathModal1: plotFunction,
    mathModal2: analyzeStats,
    mathModal3: optimize,
    mathModal4: simulatePopulation,
    mathModal5: runMonteCarlo,
  };

  // Canvas sizes are only correct once the modal is displayed, so draw on open.
  document.addEventListener('modal:open', (event) => {
    const render = RENDERERS[event.detail.id];
    if (!render) return;
    requestAnimationFrame(() => setTimeout(render, 40));
  });

  // Redraw on resize while a tool is open.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      Object.entries(RENDERERS).forEach(([id, render]) => {
        const modal = $(id);
        if (modal && modal.style.display === 'flex') render();
      });
    }, 160);
  });
})();
