/**
 * FakeShield — Gemini AI Analyzer
 * Handles all API communication with Google Gemini
 */

const Analyzer = (() => {

  // ── Loading status messages ──
  const loadingMessages = [
    'Sending to Gemini AI…',
    'Analyzing credibility signals…',
    'Extracting factual claims…',
    'Detecting emotional manipulation…',
    'Scanning for red flags…',
    'Evaluating source indicators…',
    'Calculating bias spectrum…',
    'Compiling full report…',
  ];

  let loadingMsgIndex = 0;
  let loadingInterval = null;

  function startLoadingMessages() {
    loadingMsgIndex = 0;
    const el = document.getElementById('loading-text');
    if (el) el.textContent = loadingMessages[0];
    loadingInterval = setInterval(() => {
      loadingMsgIndex = (loadingMsgIndex + 1) % loadingMessages.length;
      if (el) el.textContent = loadingMessages[loadingMsgIndex];
    }, 1800);
  }

  function stopLoadingMessages() {
    if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
  }

  // ── Build the analysis prompt ──
  function buildPrompt(text, options) {
    const deepNote = options.deep
      ? 'Perform a deep, thorough analysis covering all dimensions listed below.'
      : 'Perform a quick credibility assessment.';

    const claimsNote = options.claims
      ? 'Extract up to 6 individual factual claims made in the article and rate each.'
      : 'Do not extract individual claims (set extractedClaims to []).';

    const sourcesNote = options.sources
      ? 'Suggest 3–5 authoritative sources where the reader can verify the claims.'
      : 'Set sourceSuggestions to [].';

    return `You are FakeShield, an expert AI fact-checker and misinformation analyst. ${deepNote}

Analyze the following news article or text for authenticity, credibility, and potential misinformation.

TEXT TO ANALYZE:
"""
${text.slice(0, 12000)}
"""

${claimsNote}
${sourcesNote}

Return ONLY a valid JSON object with EXACTLY this structure (no markdown, no extra text):

{
  "credibilityScore": <integer 0-100, where 0=certainly fake, 100=certainly real>,
  "confidence": <integer 0-100, how confident you are in this verdict>,
  "verdict": <one of: "FAKE" | "LIKELY FAKE" | "UNCERTAIN" | "LIKELY REAL" | "REAL">,
  "summary": <string: 1-2 sentence explanation of the verdict>,
  "biasType": <one of: "Far Left" | "Left" | "Center-Left" | "Center" | "Center-Right" | "Right" | "Far Right" | "Unknown">,
  "biasPosition": <integer 0-100 where 0=far left, 50=center, 100=far right>,
  "emotionalTone": {
    "sensationalism": <0-10>,
    "fear": <0-10>,
    "anger": <0-10>,
    "urgency": <0-10>,
    "neutrality": <0-10>,
    "credibility": <0-10>
  },
  "redFlags": [
    <string: specific suspicious pattern found in the text>
  ],
  "supportingEvidence": [
    <string: specific element that supports legitimacy>
  ],
  "suspiciousKeywords": [<string: exact words/phrases that are suspicious or alarmist>],
  "emotionalKeywords": [<string: exact words/phrases that are emotionally charged>],
  "credibleKeywords": [<string: exact words/phrases that signal credibility>],
  "extractedClaims": [
    {
      "claim": <string: a specific factual claim made in the article>,
      "likelihood": <integer 0-100, probability the claim is true>,
      "category": <one of: "statistical" | "scientific" | "political" | "historical" | "economic" | "health" | "other">
    }
  ],
  "sourceSuggestions": [
    {
      "name": <string: source name>,
      "url": <string: full URL>,
      "description": <string: why this source is relevant>
    }
  ],
  "writingQuality": <one of: "Poor" | "Below Average" | "Average" | "Good" | "Excellent">,
  "clickbaitScore": <integer 0-10>
}

Rules:
- Be objective and evidence-based.
- If the text is too short to analyze, set verdict to "UNCERTAIN" and explain in the summary.
- suspiciousKeywords, emotionalKeywords, credibleKeywords must be substrings that actually appear in the text.
- Provide at least 2 red flags and 2 supporting evidence items (even if the text is clearly real or fake).
- Return ONLY the JSON. No markdown code blocks. No extra text.`;
  }

  // ── Call Gemini API ──
  async function callGemini(prompt, apiKey, model) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, topP: 0.8, topK: 20, maxOutputTokens: 4096 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };
    const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      const msg = errBody?.error?.message || `HTTP ${resp.status}`;
      if (resp.status === 401 || resp.status === 403) throw new Error('INVALID_API_KEY:' + msg);
      if (resp.status === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('limit: 0')) throw new Error('QUOTA_EXCEEDED');
      throw new Error(msg);
    }
    const data = await resp.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // ── Call Groq API (free, no billing) ──
  async function callGroq(prompt, apiKey, model) {
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const body = {
      model: model || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    };
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      const msg = errBody?.error?.message || `HTTP ${resp.status}`;
      if (resp.status === 401) throw new Error('INVALID_API_KEY:' + msg);
      if (resp.status === 429) throw new Error('QUOTA_EXCEEDED');
      throw new Error(msg);
    }
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  // ── Unified API caller with retry ──
  async function callAI(text, options, retries = 2) {
    const provider = localStorage.getItem('fs_provider') || 'gemini';
    const apiKey   = localStorage.getItem('fs_api_key')  || '';
    const model    = localStorage.getItem('fs_model')    || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash-lite');

    if (!apiKey) throw new Error('NO_API_KEY');

    const prompt = buildPrompt(text, options);

    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          const el = document.getElementById('loading-text');
          if (el) el.textContent = `Retrying… (attempt ${attempt + 1})`;
        }

        let raw = '';
        if (provider === 'groq') {
          raw = await callGroq(prompt, apiKey, model);
        } else {
          raw = await callGemini(prompt, apiKey, model);
        }

        // Strip markdown code blocks if model wraps output
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
        try {
          return JSON.parse(cleaned);
        } catch {
          const match = cleaned.match(/\{[\s\S]*\}/);
          if (match) return JSON.parse(match[0]);
          throw new Error('Invalid JSON response from AI');
        }
      } catch (e) {
        lastErr = e;
        if (e.message.startsWith('INVALID_API_KEY') || e.message === 'NO_API_KEY' || e.message === 'QUOTA_EXCEEDED') throw e;
      }
    }
    throw lastErr;
  }

  // ── Fetch article content from URL via CORS proxy ──
  async function fetchFromUrl(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl);
    if (!resp.ok) throw new Error('Failed to fetch URL');
    const data = await resp.json();
    const html = data.contents || '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    ['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'noscript'].forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });
    const article = doc.querySelector('article') || doc.querySelector('main') || doc.querySelector('.content') || doc.body;
    return (article?.innerText || article?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // ── Main analyze function ──
  async function analyze(text, options = {}) {
    startLoadingMessages();
    try {
      return await callAI(text, options);
    } finally {
      stopLoadingMessages();
    }
  }

  return { analyze, fetchFromUrl };
})();

