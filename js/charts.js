/**
 * FakeShield — Charts Manager
 * Manages all Chart.js visualizations
 */

const Charts = (() => {
  let toneRadarInstance = null;
  let historyChartInstance = null;

  // Gradient helper
  function makeGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    colors.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    return gradient;
  }

  Chart.defaults.color = '#94A3B8';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // ── Tone Radar Chart ──
  function renderToneRadar(toneData) {
    const canvas = document.getElementById('tone-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (toneRadarInstance) {
      toneRadarInstance.destroy();
      toneRadarInstance = null;
    }

    const labels = ['Sensationalism', 'Fear', 'Anger', 'Urgency', 'Neutrality', 'Credibility'];
    const data = [
      toneData.sensationalism ?? 0,
      toneData.fear ?? 0,
      toneData.anger ?? 0,
      toneData.urgency ?? 0,
      toneData.neutrality ?? 0,
      toneData.credibility ?? 0,
    ];

    toneRadarInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Emotional Tone',
          data,
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          borderColor: '#7C3AED',
          borderWidth: 2,
          pointBackgroundColor: '#06B6D4',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#06B6D4',
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeInOutQuart' },
        scales: {
          r: {
            min: 0, max: 10,
            ticks: {
              stepSize: 2,
              color: '#64748B',
              font: { size: 10 },
              backdropColor: 'transparent',
            },
            grid:        { color: 'rgba(255,255,255,0.06)' },
            angleLines:  { color: 'rgba(255,255,255,0.06)' },
            pointLabels: { color: '#94A3B8', font: { size: 11 } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,15,26,0.9)',
            borderColor: 'rgba(124,58,237,0.4)',
            borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.parsed.r}/10` },
          },
        },
      },
    });
  }

  // ── History Chart ──
  function renderHistoryChart(historyData) {
    const canvas = document.getElementById('history-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (historyChartInstance) {
      historyChartInstance.destroy();
      historyChartInstance = null;
    }

    if (!historyData || historyData.length === 0) {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = '';

    const verdictColorMap = {
      'REAL':        'rgba(16,185,129,0.8)',
      'LIKELY REAL': 'rgba(16,185,129,0.55)',
      'UNCERTAIN':   'rgba(245,158,11,0.7)',
      'LIKELY FAKE': 'rgba(249,115,22,0.7)',
      'FAKE':        'rgba(239,68,68,0.8)',
    };

    historyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: historyData.map(d => d.label),
        datasets: [{
          label: 'Credibility Score',
          data: historyData.map(d => d.score),
          backgroundColor: historyData.map(d => verdictColorMap[d.verdict] || 'rgba(124,58,237,0.6)'),
          borderColor: historyData.map(d => verdictColorMap[d.verdict]?.replace(/0\.\d+\)/, '1)') || '#7C3AED'),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748B', font: { size: 11 } },
          },
          y: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#64748B', font: { size: 11 },
              callback: v => v + '%',
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,15,26,0.9)',
            borderColor: 'rgba(124,58,237,0.4)',
            borderWidth: 1,
            callbacks: { label: ctx => ` Credibility: ${ctx.parsed.y}/100` },
          },
        },
      },
    });
  }

  // ── Gauge (SVG-based, not Chart.js) ──
  function animateGauge(score) {
    const fill = document.getElementById('gauge-fill');
    const scoreText = document.getElementById('gauge-score');
    if (!fill || !scoreText) return;

    // Inject gradient definition into SVG
    const svg = document.getElementById('gauge-svg');
    if (!svg.querySelector('#gaugeGradient')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#7C3AED"/>
          <stop offset="100%" stop-color="#06B6D4"/>
        </linearGradient>`;
      svg.prepend(defs);
    }

    const circumference = 314; // 2 * PI * 50
    const offset = circumference - (score / 100) * circumference;

    // Animate score counter
    let current = 0;
    const step = Math.ceil(score / 40);
    const counter = setInterval(() => {
      current = Math.min(current + step, score);
      scoreText.textContent = current;
      if (current >= score) clearInterval(counter);
    }, 30);

    // Animate stroke
    requestAnimationFrame(() => {
      fill.style.strokeDashoffset = offset;
    });

    // Color based on score
    const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
    fill.style.stroke = color;
    fill.style.filter = `drop-shadow(0 0 8px ${color}80)`;
  }

  // ── Bias Indicator ──
  function animateBiasIndicator(position) {
    // position: 0-100 (0=far left, 50=center, 100=far right)
    const indicator = document.getElementById('bias-indicator');
    if (!indicator) return;
    requestAnimationFrame(() => {
      indicator.style.left = `${Math.max(0, Math.min(100, position))}%`;
    });
  }

  // ── Claim bars ──
  function animateClaimBars() {
    setTimeout(() => {
      document.querySelectorAll('.claim-bar').forEach(bar => {
        const w = bar.dataset.width || '0';
        bar.style.width = w + '%';
      });
    }, 100);
  }

  return { renderToneRadar, renderHistoryChart, animateGauge, animateBiasIndicator, animateClaimBars };
})();
