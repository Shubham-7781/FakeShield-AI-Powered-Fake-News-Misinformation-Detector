# 🛡️ FakeShield — AI-Powered Fake News & Misinformation Detector

**FakeShield** is a sleek, client-side web app that uses AI (Google Gemini or Groq) to analyze news articles and text for credibility, political bias, emotional manipulation, and factual accuracy — delivering an instant, visual fact-check report.

Paste an article, drop in a URL, or upload a file, and FakeShield returns a full credibility breakdown: a 0–100 trust score, bias positioning, an emotional-tone radar chart, extracted factual claims with likelihood ratings, suspicious/credible keyword highlighting, and suggested sources to verify the story — all rendered in a polished glassmorphic dashboard UI.

---

## ✨ Features

- **🎯 Credibility Score & Verdict** — animated gauge scoring content from `FAKE` to `REAL`, with a confidence rating
- **⚖️ Bias Spectrum Meter** — visualizes political leaning from Far Left to Far Right
- **📊 Emotional Tone Radar** — Chart.js radar chart measuring sensationalism, fear, anger, urgency, neutrality, and credibility
- **🚩 Red Flags & Supporting Evidence** — clear, itemized reasoning behind the verdict
- **🔍 Keyword Highlighting** — surfaces suspicious, emotionally charged, and credible phrases directly in the source text
- **📌 Claim Extraction** — pulls out individual factual claims and rates the likelihood each is true, categorized by type (statistical, political, health, etc.)
- **🔗 Source Suggestions** — recommends authoritative sources to independently verify the article
- **📥 Multiple Input Methods** — paste text, fetch directly from a URL (via CORS proxy), or upload a file
- **🕘 Analysis History** — searchable local history of past analyses with a trend chart of credibility scores over time
- **📄 PDF Export** — export any report for sharing or record-keeping
- **🔌 Dual AI Provider Support** — works with **Google Gemini** or **Groq** (free-tier friendly), configurable in-app with your own API key
- **🎨 Modern UI** — glassmorphism design, animated particles, fully responsive

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom, glassmorphism/gradient design system) |
| Logic | Vanilla JavaScript (ES6, modular IIFE pattern) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| AI Providers | [Google Gemini API](https://ai.google.dev/) / [Groq API](https://groq.com/) |
| Storage | Browser `localStorage` (history, settings) |

No frameworks, no build step, no backend — 100% static and runs entirely in the browser.

---

## 📂 Project Structure

```
FakeShield/
├── index.html          # App shell & markup
├── css/
│   └── style.css       # All styling (glassmorphic UI, animations, responsive layout)
├── js/
│   ├── app.js           # Main app logic — UI state, event handling, input tabs
│   ├── analyzer.js       # AI API communication (Gemini/Groq), prompt engineering
│   ├── charts.js         # Chart.js visualizations (radar, history, gauge, bias meter)
│   └── history.js        # Local analysis history management (localStorage)
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/fakeshield.git
cd fakeshield
```

### 2. Get an API key
FakeShield needs an API key from one of the supported providers:
- **Google Gemini** (recommended): [Get a free key](https://aistudio.google.com/app/apikey)
- **Groq** (free, fast inference): [Get a free key](https://console.groq.com/keys)

### 3. Run it
Since this is a static site, just open `index.html` in your browser — or serve it locally:

```bash
# Using Python
python -m http.server 8000

# Or using Node's http-server
npx http-server .
```

Then visit `http://localhost:8000`.

### 4. Configure
Click the **Settings** icon in the app, select your provider (Gemini or Groq), and paste in your API key. It's stored only in your browser's `localStorage` — never sent anywhere except directly to the AI provider.

---

## 🔒 Privacy & Security

- Your API key is stored **locally in your browser only** — FakeShield has no backend server and never transmits your key elsewhere.
- Article text is sent directly from your browser to the selected AI provider (Google or Groq) for analysis.
- URL fetching uses a public CORS proxy (`allorigins.win`) to retrieve article content for analysis — avoid pasting sensitive or private URLs.

---

## 🗺️ Roadmap Ideas

- [ ] Browser extension for one-click analysis of the current page
- [ ] Support for additional AI providers (OpenAI, Anthropic, local LLMs)
- [ ] Batch analysis of multiple articles
- [ ] Shareable report links
- [ ] Dark/light theme toggle

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues) or open a pull request.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

FakeShield uses AI-generated analysis, which may occasionally be inaccurate or biased. It is intended as a **research and awareness tool**, not a definitive fact-checking authority. Always cross-verify important information with trusted, authoritative sources.
