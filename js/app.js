/**
 * FakeShield — Main App Controller
 * Orchestrates all modules, UI interactions, and state
 */

/* ═══════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════ */
const State = {
  currentTab: 'text',
  currentResult: null,
  inputText: '',
  isCooldown: false,
  cooldownTimer: null,
  cooldownSeconds: 8,
};

/* ═══════════════════════════════════════════════════
   DOM HELPERS
   ═══════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const hide = el => el?.classList.add('hidden');
const show = el => el?.classList.remove('hidden');

function showToast(message, type = 'info', duration = 3500) {
  const toast = $('toast');
  const msg = $('toast-message');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.className = `toast ${type}`;
  show(toast);
  setTimeout(() => hide(toast), duration);
}

/* ═══════════════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════════════ */
function initParticles() {
  const container = $('particles');
  if (!container) return;
  const colors = ['#7C3AED', '#06B6D4', '#8B5CF6', '#22D3EE', '#A78BFA'];

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 20 + 15}s;
      animation-delay: ${Math.random() * 15}s;
      opacity: 0;
      filter: blur(${size > 3 ? 1 : 0}px);
    `;
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════
   TAB SWITCHING
   ═══════════════════════════════════════════════════ */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      State.currentTab = tab;

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active');
        p.hidden = true;
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = $(`input-${tab}-panel`);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    });
  });
}

/* ═══════════════════════════════════════════════════
   CHAR COUNTER
   ═══════════════════════════════════════════════════ */
function initCharCounter() {
  const ta = $('article-text');
  const counter = $('char-count');
  if (!ta || !counter) return;
  ta.addEventListener('input', () => {
    const count = ta.value.length;
    counter.textContent = `${count.toLocaleString()} / 50,000`;
    counter.style.color = count > 40000 ? '#EF4444' : count > 25000 ? '#F59E0B' : '';
    State.inputText = ta.value;
  });
}

/* ═══════════════════════════════════════════════════
   FILE UPLOAD
   ═══════════════════════════════════════════════════ */
function initFileUpload() {
  const dz = $('drop-zone');
  const fi = $('file-input');
  const fp = $('file-preview');
  const fn = $('file-name');
  const rm = $('btn-remove-file');

  if (!dz || !fi) return;

  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fi.click(); });

  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  });

  fi.addEventListener('change', () => {
    const file = fi.files[0];
    if (file) loadFile(file);
  });

  rm?.addEventListener('click', () => {
    State.inputText = '';
    fi.value = '';
    fn.textContent = '';
    hide(fp);
    show(dz);
  });

  function loadFile(file) {
    if (!file.name.match(/\.(txt|md)$/i)) {
      showToast('Please upload a .txt or .md file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      State.inputText = e.target.result;
      fn.textContent = file.name;
      hide(dz);
      show(fp);
      showToast(`Loaded: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  }
}

/* ═══════════════════════════════════════════════════
   URL FETCHING
   ═══════════════════════════════════════════════════ */
function initUrlFetch() {
  const btn = $('btn-fetch-url');
  const urlInput = $('article-url');
  if (!btn || !urlInput) return;

  btn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) { showToast('Please enter a URL', 'error'); return; }
    if (!/^https?:\/\//i.test(url)) { showToast('URL must start with http:// or https://', 'error'); return; }

    btn.disabled = true;
    btn.textContent = 'Fetching…';

    try {
      const text = await Analyzer.fetchFromUrl(url);
      if (!text || text.length < 50) {
        showToast('Could not extract enough text from this URL. Try pasting directly.', 'error');
        return;
      }
      State.inputText = text;
      // Switch to text tab to show preview
      document.getElementById('tab-text').click();
      const ta = $('article-text');
      if (ta) {
        ta.value = text.slice(0, 10000);
        ta.dispatchEvent(new Event('input'));
      }
      showToast('Article text extracted successfully!', 'success');
    } catch (e) {
      showToast('Failed to fetch URL: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Fetch';
    }
  });

  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
}

/* ═══════════════════════════════════════════════════
   PASTE BUTTON
   ═══════════════════════════════════════════════════ */
function initPaste() {
  $('btn-paste')?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      const ta = $('article-text');
      if (ta) { ta.value = text; ta.dispatchEvent(new Event('input')); }
      showToast('Pasted from clipboard!', 'success');
    } catch {
      showToast('Clipboard access denied. Paste manually with Ctrl+V.', 'error');
    }
  });
}

/* ═══════════════════════════════════════════════════
   COOLDOWN
   ═══════════════════════════════════════════════════ */
function startCooldown() {
  State.isCooldown = true;
  const btn = $('btn-analyze');
  const bar = $('cooldown-bar');
  const fill = $('cooldown-fill');
  const label = $('cooldown-label');
  if (btn) btn.disabled = true;
  show(bar);

  let remaining = State.cooldownSeconds;
  fill.style.width = '100%';

  State.cooldownTimer = setInterval(() => {
    remaining--;
    const pct = (remaining / State.cooldownSeconds) * 100;
    fill.style.width = pct + '%';
    if (label) label.textContent = `Cooldown: ${remaining}s`;

    if (remaining <= 0) {
      clearInterval(State.cooldownTimer);
      State.isCooldown = false;
      hide(bar);
      if (btn) btn.disabled = false;
    }
  }, 1000);
}

/* ═══════════════════════════════════════════════════
   VERDICT HELPERS
   ═══════════════════════════════════════════════════ */
function getVerdictClass(verdict) {
  const map = {
    'FAKE':        'verdict-fake',
    'LIKELY FAKE': 'verdict-likely-fake',
    'UNCERTAIN':   'verdict-uncertain',
    'LIKELY REAL': 'verdict-likely-real',
    'REAL':        'verdict-real',
  };
  return map[verdict] || 'verdict-uncertain';
}

function getVerdictPillClass(verdict) {
  const map = {
    'FAKE':        'verdict-pill-fake',
    'LIKELY FAKE': 'verdict-pill-likely-fake',
    'UNCERTAIN':   'verdict-pill-uncertain',
    'LIKELY REAL': 'verdict-pill-likely-real',
    'REAL':        'verdict-pill-real',
  };
  return map[verdict] || 'verdict-pill-uncertain';
}

function getVerdictEmoji(verdict) {
  const map = {
    'FAKE':        '🚨',
    'LIKELY FAKE': '⚠️',
    'UNCERTAIN':   '🤔',
    'LIKELY REAL': '✅',
    'REAL':        '🛡️',
  };
  return map[verdict] || '❓';
}

function getVerdictBg(verdict) {
  const map = {
    'FAKE':        'rgba(239,68,68,0.15)',
    'LIKELY FAKE': 'rgba(249,115,22,0.12)',
    'UNCERTAIN':   'rgba(245,158,11,0.12)',
    'LIKELY REAL': 'rgba(16,185,129,0.1)',
    'REAL':        'rgba(16,185,129,0.15)',
  };
  return map[verdict] || 'rgba(245,158,11,0.12)';
}

function getVerdictColor(verdict) {
  const map = {
    'FAKE':        '#EF4444',
    'LIKELY FAKE': '#F97316',
    'UNCERTAIN':   '#F59E0B',
    'LIKELY REAL': '#10B981',
    'REAL':        '#10B981',
  };
  return map[verdict] || '#F59E0B';
}

function getClaimColor(likelihood) {
  if (likelihood >= 70) return '#10B981';
  if (likelihood >= 40) return '#F59E0B';
  return '#EF4444';
}

/* ═══════════════════════════════════════════════════
   RENDER RESULTS
   ═══════════════════════════════════════════════════ */
function renderResults(result, originalText) {
  State.currentResult = result;

  // ── Verdict Banner ──
  const banner = $('verdict-banner');
  if (banner) {
    banner.className = 'verdict-banner glass-panel ' + getVerdictClass(result.verdict);
  }

  const iconWrap = $('verdict-icon-wrap');
  if (iconWrap) {
    iconWrap.style.background = getVerdictBg(result.verdict);
    iconWrap.style.border = `1px solid ${getVerdictColor(result.verdict)}40`;
    iconWrap.textContent = getVerdictEmoji(result.verdict);
  }

  const vLabel = $('verdict-label');
  if (vLabel) vLabel.textContent = `AI Verdict — ${result.confidence ?? 0}% confidence`;

  const vValue = $('verdict-value');
  if (vValue) {
    vValue.textContent = result.verdict;
    vValue.style.color = getVerdictColor(result.verdict);
  }

  const vSum = $('verdict-summary');
  if (vSum) vSum.textContent = result.summary || '';

  // ── Gauge ──
  Charts.animateGauge(result.credibilityScore ?? 0);

  // ── Stats ──
  const statBias = $('stat-bias');
  if (statBias) statBias.textContent = result.biasType || '—';

  const statTone = $('stat-tone');
  if (statTone) {
    const tones = result.emotionalTone || {};
    const maxKey = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const readable = maxKey.charAt(0).toUpperCase() + maxKey.slice(1);
    statTone.textContent = readable;
  }

  const statClaims = $('stat-claims');
  if (statClaims) statClaims.textContent = (result.extractedClaims || []).length;

  const statFlags = $('stat-flags');
  if (statFlags) statFlags.textContent = (result.redFlags || []).length;

  // ── Bias Spectrum ──
  Charts.animateBiasIndicator(result.biasPosition ?? 50);
  const biasResultText = $('bias-result-text');
  if (biasResultText) biasResultText.textContent = result.biasType || 'Unknown';

  // ── Tone Radar ──
  if (result.emotionalTone) Charts.renderToneRadar(result.emotionalTone);

  // ── Red Flags ──
  const flagList = $('flag-list');
  if (flagList) {
    flagList.innerHTML = '';
    const flags = result.redFlags || [];
    if (flags.length === 0) {
      flagList.innerHTML = '<li class="flag-item" style="color:var(--text-muted)">No significant red flags detected.</li>';
    } else {
      flags.forEach((f, i) => {
        const li = document.createElement('li');
        li.className = 'flag-item';
        li.style.animationDelay = `${i * 80}ms`;
        li.innerHTML = `<span class="flag-dot"></span><span>${escapeHtml(f)}</span>`;
        flagList.appendChild(li);
      });
    }
  }

  // ── Supporting Evidence ──
  const evidList = $('evidence-list');
  if (evidList) {
    evidList.innerHTML = '';
    const evidence = result.supportingEvidence || [];
    if (evidence.length === 0) {
      evidList.innerHTML = '<li class="evidence-item" style="color:var(--text-muted)">No strong credibility signals found.</li>';
    } else {
      evidence.forEach((e, i) => {
        const li = document.createElement('li');
        li.className = 'evidence-item';
        li.style.animationDelay = `${i * 80}ms`;
        li.innerHTML = `<span class="evidence-dot"></span><span>${escapeHtml(e)}</span>`;
        evidList.appendChild(li);
      });
    }
  }

  // ── Extracted Claims ──
  const claimsGrid = $('claims-grid');
  if (claimsGrid) {
    claimsGrid.innerHTML = '';
    const claims = result.extractedClaims || [];
    if (claims.length === 0) {
      claimsGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No distinct claims extracted.</p>';
    } else {
      claims.forEach((c, i) => {
        const color = getClaimColor(c.likelihood);
        const card = document.createElement('div');
        card.className = 'claim-card';
        card.style.animationDelay = `${i * 60}ms`;
        card.innerHTML = `
          <div class="claim-text">${escapeHtml(c.claim)}</div>
          <div class="claim-footer">
            <div class="claim-bar-wrap">
              <div class="claim-bar" data-width="${c.likelihood}" style="background:${color}; width:0%"></div>
            </div>
            <span class="claim-likelihood" style="color:${color}">${c.likelihood}%</span>
          </div>
          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.25rem;text-transform:uppercase;letter-spacing:0.05em">${c.category || 'other'}</div>`;
        claimsGrid.appendChild(card);
      });
      Charts.animateClaimBars();
    }
  }

  // ── Keyword Highlighting ──
  renderHighlightedText(originalText, result);

  // ── Source Suggestions ──
  const sourcesGrid = $('sources-grid');
  if (sourcesGrid) {
    sourcesGrid.innerHTML = '';
    const sources = result.sourceSuggestions || [];
    if (sources.length === 0) {
      sourcesGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No source suggestions generated.</p>';
    } else {
      sources.forEach(s => {
        const a = document.createElement('a');
        a.href = s.url || '#';
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.className = 'source-card';
        a.innerHTML = `
          <span class="source-name">${escapeHtml(s.name)}</span>
          <span class="source-url">${escapeHtml(s.url || '')}</span>
          <span class="source-desc">${escapeHtml(s.description || '')}</span>`;
        sourcesGrid.appendChild(a);
      });
    }
  }

  // ── History Chart ──
  const histData = HistoryManager.getLastScores(10);
  if (histData.length > 0) Charts.renderHistoryChart(histData);

  // ── Show results, hide skeleton ──
  hide($('skeleton-area'));
  show($('results-area'));
}

/* ── Keyword Highlighting ── */
function renderHighlightedText(text, result) {
  const container = $('highlighted-text');
  if (!container) return;

  if (!text || text.length === 0) {
    container.textContent = '(No text to highlight)';
    return;
  }

  const suspicious = (result.suspiciousKeywords || []).filter(Boolean);
  const emotional  = (result.emotionalKeywords  || []).filter(Boolean);
  const credible   = (result.credibleKeywords   || []).filter(Boolean);

  // Build a combined list of {word, type} sorted by length desc to avoid partial matches
  const allKeywords = [
    ...suspicious.map(w => ({ w, type: 'red' })),
    ...emotional.map(w  => ({ w, type: 'yellow' })),
    ...credible.map(w   => ({ w, type: 'green' })),
  ].sort((a, b) => b.w.length - a.w.length);

  let html = escapeHtml(text.slice(0, 4000));

  allKeywords.forEach(({ w, type }) => {
    if (!w || w.length < 2) return;
    const escapedWord = escapeHtml(w);
    const regex = new RegExp(`(${escapedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    html = html.replace(regex, `<mark class="highlight-${type}" title="${type === 'red' ? 'Suspicious' : type === 'yellow' ? 'Emotionally charged' : 'Credibility signal'}">$1</mark>`);
  });

  container.innerHTML = html;
}

/* ── HTML Escape ── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Quota Error UI ── */
function showQuotaError() {
  const skeleton = $('skeleton-area');
  hide(skeleton);

  document.querySelector('.quota-banner')?.remove();

  const banner = document.createElement('div');
  banner.className = 'glass-panel quota-banner';
  banner.style.cssText = `
    padding: 1.75rem 2rem;
    border-color: rgba(245,158,11,0.4);
    background: rgba(245,158,11,0.05);
    animation: fade-up 0.4s ease;
  `;

  banner.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:1rem;">
      <div style="font-size:2rem;flex-shrink:0;">⚡</div>
      <div style="flex:1;">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:1.15rem;font-weight:700;color:#F59E0B;margin-bottom:0.4rem;">API Quota Exceeded — No Billing Needed to Fix</div>
        <p style="font-size:0.87rem;color:var(--text-secondary);margin-bottom:1rem;line-height:1.65;">
          Your free daily limit is used up. Here are <strong style="color:var(--text-primary);">100% free</strong> solutions — no credit card required:
        </p>

              Open AI Studio →
            </a>
          </div>

          <!-- Option 2: Wait for reset -->
          <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.85rem 1rem;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:0.625rem;">
            <span style="font-size:1.1rem;flex-shrink:0;margin-top:0.1rem;">⏰</span>
            <div>
              <div style="font-size:0.85rem;font-weight:700;color:#F59E0B;margin-bottom:0.2rem;">Wait for Daily Reset — ${getResetTime()} from now</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);">Free quota resets at midnight Pacific Time (00:00 PT). Try again then.</div>
            </div>
          </div>

          <!-- Option 3: New API Key -->
          <div style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.85rem 1rem;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2);border-radius:0.625rem;">
            <span style="font-size:1.1rem;flex-shrink:0;margin-top:0.1rem;">🔑</span>
            <div>
              <div style="font-size:0.85rem;font-weight:700;color:#06B6D4;margin-bottom:0.2rem;">Create a New API Key (Temporary workaround)</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);">
                Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#22D3EE;">AI Studio</a>, create a new project &amp; key, paste it in ⚙️ Settings.
              </div>
            </div>
          </div>

        </div>

        <button id="quota-dismiss" style="font-size:0.78rem;color:var(--text-muted);background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;">Dismiss</button>
      </div>
    </div>`;

  const inputPanel = $('input-panel');
  inputPanel?.after(banner);
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  banner.querySelector('#quota-dismiss')?.addEventListener('click', () => banner.remove());
}




/* ═══════════════════════════════════════════════════
   ANALYZE BUTTON
   ═══════════════════════════════════════════════════ */
function initAnalyzeButton() {
  $('btn-analyze')?.addEventListener('click', runAnalysis);
  $('article-text')?.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') runAnalysis();
  });
}

async function runAnalysis() {
  if (State.isCooldown) { showToast('Please wait for the cooldown to finish.', 'error'); return; }

  // Get input text based on active tab
  let text = '';
  if (State.currentTab === 'text') {
    text = ($('article-text')?.value || '').trim();
  } else {
    text = State.inputText.trim();
  }

  if (!text || text.length < 30) {
    showToast('Please enter at least 30 characters of text to analyze.', 'error');
    return;
  }

  const apiKey = localStorage.getItem('fs_api_key') || '';
  if (!apiKey) {
    showToast('Please add your Gemini API key in Settings ⚙️', 'error');
    $('btn-settings').click();
    return;
  }

  const options = {
    deep:    $('opt-deep')?.checked ?? true,
    claims:  $('opt-claims')?.checked ?? true,
    sources: $('opt-sources')?.checked ?? true,
  };

  // UI: loading state
  hide($('btn-analyze-inner'));
  show($('btn-loading-inner'));
  $('btn-analyze').disabled = true;
  hide($('results-area'));
  show($('skeleton-area'));

  try {
    const result = await Analyzer.analyze(text, options);

    // Save to history
    const entry = HistoryManager.add({
      textSnippet: text.slice(0, 200),
      result,
    });

    // Render
    renderResults(result, text);

    // Update sidebar history
    renderHistoryList();

    showToast(`Analysis complete — ${result.verdict}`, 'success');
    startCooldown();

    // Scroll to results
    $('results-area').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    hide($('skeleton-area'));
    if (err.message === 'NO_API_KEY') {
      showToast('No API key found. Please add it in Settings.', 'error');
      $('btn-settings').click();
    } else if (err.message.startsWith('INVALID_API_KEY')) {
      showToast('Invalid API key. Please check your key in Settings.', 'error');
      updateApiStatus(false);
    } else if (err.message === 'QUOTA_EXCEEDED') {
      showQuotaError();
    } else {
      showToast('⚠️ Analysis failed: ' + err.message.slice(0, 120), 'error', 6000);
    }
  } finally {
    show($('btn-analyze-inner'));
    hide($('btn-loading-inner'));
    $('btn-analyze').disabled = State.isCooldown;
  }
}

/* ═══════════════════════════════════════════════════
   HISTORY SIDEBAR
   ═══════════════════════════════════════════════════ */
function renderHistoryList(query = '') {
  const list = $('history-list');
  const emptyState = $('history-empty');
  if (!list) return;

  const items = query ? HistoryManager.search(query) : HistoryManager.getAll();

  // Clear existing items (keep empty state)
  list.querySelectorAll('.history-item').forEach(el => el.remove());

  if (items.length === 0) {
    show(emptyState);
    return;
  }

  hide(emptyState);

  items.forEach(entry => {
    const verdict = entry.result?.verdict || 'UNCERTAIN';
    const score = entry.result?.credibilityScore ?? '?';
    const snippet = (entry.textSnippet || '').slice(0, 100);
    const date = new Date(entry.timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const item = document.createElement('div');
    item.className = 'history-item';
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${verdict} - ${date}`);
    item.dataset.id = entry.id;
    item.innerHTML = `
      <div class="history-item-header">
        <span class="history-item-verdict ${getVerdictPillClass(verdict)}">${verdict}</span>
        <span class="history-item-score">${score}/100</span>
      </div>
      <div class="history-item-text">${escapeHtml(snippet)}</div>
      <div class="history-item-date">${date}</div>`;

    item.addEventListener('click', () => loadHistoryEntry(entry));
    item.addEventListener('keydown', e => { if (e.key === 'Enter') loadHistoryEntry(entry); });
    list.appendChild(item);
  });
}

function loadHistoryEntry(entry) {
  if (!entry?.result) return;

  // Put text back in textarea
  const ta = $('article-text');
  if (ta) {
    ta.value = entry.textSnippet || '';
    ta.dispatchEvent(new Event('input'));
  }

  // Scroll to results and render
  renderResults(entry.result, entry.textSnippet || '');
  show($('results-area'));
  $('results-area').scrollIntoView({ behavior: 'smooth' });
}

function initHistoryControls() {
  $('btn-clear-history')?.addEventListener('click', () => {
    if (confirm('Clear all analysis history?')) {
      HistoryManager.clear();
      renderHistoryList();
      showToast('History cleared.', 'info');
    }
  });

  $('history-search')?.addEventListener('input', e => {
    renderHistoryList(e.target.value);
  });

  $('btn-history-toggle')?.addEventListener('click', () => {
    const sidebar = $('sidebar');
    if (!sidebar) return;
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });
}

/* ═══════════════════════════════════════════════════
   SETTINGS MODAL
   ═══════════════════════════════════════════════════ */
function initSettings() {
  const modal       = $('settings-modal');
  const keyInput    = $('api-key-input');
  const toggleBtn   = $('btn-toggle-key');
  const modelSelect = $('model-select');

  const MODELS = {
    gemini: [
      { value: 'gemini-2.0-flash-lite',        label: 'gemini-2.0-flash-lite — Best free quota ✅' },
      { value: 'gemini-2.0-flash',              label: 'gemini-2.0-flash — Most capable ✅' },
      { value: 'gemini-2.5-flash-preview-05-20',label: 'gemini-2.5-flash — Most accurate' },
      { value: 'gemini-1.5-flash',              label: 'gemini-1.5-flash — Older' },
    ],
    groq: [
      { value: 'llama-3.3-70b-versatile',       label: 'LLaMA 3.3 70B — Best quality (Free) ✅' },
      { value: 'llama-3.1-8b-instant',           label: 'LLaMA 3.1 8B Instant — Fastest (Free) ✅' },
      { value: 'gemma2-9b-it',                   label: 'Gemma 2 9B — Google model via Groq ✅' },
    ],
  };

  function populateModels(provider) {
    if (!modelSelect) return;
    const saved = localStorage.getItem('fs_model') || MODELS[provider][0].value;
    modelSelect.innerHTML = '';
    MODELS[provider].forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.value; opt.textContent = m.label;
      modelSelect.appendChild(opt);
    });
    const exists = MODELS[provider].some(m => m.value === saved);
    modelSelect.value = exists ? saved : MODELS[provider][0].value;
  }

  function setProvider(provider) {
    localStorage.setItem('fs_provider', provider);
    // Update provider buttons
    document.querySelectorAll('[data-provider]').forEach(b => {
      const active = b.dataset.provider === provider;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // Update key label / placeholder / link
    const keyLabel = $('key-label');
    const keyLink  = $('key-link');
    const keyHint  = $('key-hint');
    if (provider === 'groq') {
      if (keyLabel) keyLabel.textContent = 'Groq API Key (Free — No billing needed)';
      if (keyLink)  { keyLink.href = 'https://console.groq.com/keys'; keyLink.textContent = 'Get free Groq key →'; }
      if (keyInput) keyInput.placeholder = 'gsk_…';
      if (keyHint)  keyHint.textContent = 'Groq is 100% free. No credit card. No billing. Just sign in at console.groq.com.';
    } else {
      if (keyLabel) keyLabel.textContent = 'Google Gemini API Key';
      if (keyLink)  { keyLink.href = 'https://aistudio.google.com/app/apikey'; keyLink.textContent = 'Get free key →'; }
      if (keyInput) keyInput.placeholder = 'AIza…';
      if (keyHint)  keyHint.textContent = 'Your key is stored only in your browser\'s localStorage.';
    }
    populateModels(provider);
  }

  // Load saved state
  const savedProvider = localStorage.getItem('fs_provider') || 'gemini';
  if (keyInput) keyInput.value = localStorage.getItem('fs_api_key') || '';
  setProvider(savedProvider);
  updateApiStatus(!!localStorage.getItem('fs_api_key'));

  // Provider buttons
  document.querySelectorAll('[data-provider]').forEach(btn => {
    btn.addEventListener('click', () => setProvider(btn.dataset.provider));
  });

  // Open/close
  $('btn-settings')?.addEventListener('click', () => { show(modal); keyInput?.focus(); });
  $('btn-close-settings')?.addEventListener('click', () => hide(modal));
  $('btn-cancel-settings')?.addEventListener('click', () => hide(modal));
  modal?.addEventListener('click', e => { if (e.target === modal) hide(modal); });

  // Toggle show/hide key
  toggleBtn?.addEventListener('click', () => {
    if (keyInput.type === 'password') { keyInput.type = 'text'; toggleBtn.textContent = 'Hide'; }
    else { keyInput.type = 'password'; toggleBtn.textContent = 'Show'; }
  });

  // Save
  $('btn-save-settings')?.addEventListener('click', () => {
    const key   = keyInput?.value.trim() || '';
    const model = modelSelect?.value || MODELS[localStorage.getItem('fs_provider') || 'gemini'][0].value;
    if (key) {
      localStorage.setItem('fs_api_key', key);
      localStorage.setItem('fs_model', model);
      updateApiStatus(true);
      showToast('Settings saved! Ready to analyze.', 'success');
    } else {
      localStorage.removeItem('fs_api_key');
      updateApiStatus(false);
      showToast('API key removed.', 'info');
    }
    hide(modal);
  });

  // Theme
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      document.body.className = theme === 'light' ? 'light' : '';
      localStorage.setItem('fs_theme', theme);
      document.querySelectorAll('[data-theme]').forEach(b => {
        b.classList.toggle('active', b.dataset.theme === theme);
        b.setAttribute('aria-pressed', b.dataset.theme === theme ? 'true' : 'false');
      });
    });
  });

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) hide(modal);
  });

  // Apply saved theme
  const savedTheme = localStorage.getItem('fs_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    document.querySelectorAll('[data-theme]').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === 'light');
    });
  }
}

function updateApiStatus(connected) {
  const dot = $('api-dot');
  const label = $('api-label');
  if (dot) dot.classList.toggle('connected', connected);
  if (label) label.textContent = connected ? 'API Ready' : 'No API Key';
}

/* ═══════════════════════════════════════════════════
   ACTION BAR
   ═══════════════════════════════════════════════════ */
function initActionBar() {
  // Export PDF
  $('btn-export-pdf')?.addEventListener('click', () => {
    showToast('Opening print dialog for PDF export…', 'info');
    setTimeout(() => window.print(), 500);
  });

  // Copy Summary
  $('btn-copy-summary')?.addEventListener('click', async () => {
    if (!State.currentResult) { showToast('No analysis to copy.', 'error'); return; }
    const r = State.currentResult;
    const summary = [
      `🛡️ FakeShield Analysis Report`,
      `Verdict: ${r.verdict} (${r.credibilityScore}/100 credibility)`,
      `Confidence: ${r.confidence}%`,
      `Summary: ${r.summary}`,
      `Political Bias: ${r.biasType}`,
      `Writing Quality: ${r.writingQuality || 'N/A'}`,
      `Clickbait Score: ${r.clickbaitScore ?? 'N/A'}/10`,
      `\nRed Flags:\n${(r.redFlags || []).map(f => '• ' + f).join('\n')}`,
      `\nAnalyzed by FakeShield — AI Fact Detection System`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Summary copied to clipboard!', 'success');
    } catch {
      showToast('Could not access clipboard.', 'error');
    }
  });

  // New Analysis
  $('btn-new-analysis')?.addEventListener('click', () => {
    hide($('results-area'));
    const ta = $('article-text');
    if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input')); }
    State.inputText = '';
    State.currentResult = null;
    $('input-panel')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
function init() {
  initParticles();
  initTabs();
  initCharCounter();
  initFileUpload();
  initUrlFetch();
  initPaste();
  initAnalyzeButton();
  initHistoryControls();
  initSettings();
  initActionBar();

  // Load history on startup
  renderHistoryList();

  // If no API key, nudge user
  if (!localStorage.getItem('fs_api_key')) {
    setTimeout(() => {
      showToast('👋 Welcome! Add your Gemini API key in Settings to get started.', 'info', 5000);
    }, 800);
  }

  console.log('%c🛡️ FakeShield loaded', 'color:#7C3AED;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', init);
