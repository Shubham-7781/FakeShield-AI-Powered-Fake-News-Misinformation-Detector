/**
 * FakeShield — History Manager
 * Manages analysis history in localStorage with schema versioning
 */

const HistoryManager = (() => {
  const STORAGE_KEY = 'fs_history_v2';
  const MAX_ITEMS = 50;

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function add(entry) {
    const items = getAll();
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    items.unshift(newEntry);
    if (items.length > MAX_ITEMS) items.splice(MAX_ITEMS);
    save(items);
    return newEntry;
  }

  function getById(id) {
    return getAll().find(e => e.id === id) || null;
  }

  function remove(id) {
    const items = getAll().filter(e => e.id !== id);
    save(items);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return getAll();
    return getAll().filter(e =>
      (e.textSnippet || '').toLowerCase().includes(q) ||
      (e.result?.verdict || '').toLowerCase().includes(q) ||
      (e.result?.summary || '').toLowerCase().includes(q)
    );
  }

  // Get last N credibility scores for the history chart
  function getLastScores(n = 10) {
    return getAll()
      .slice(0, n)
      .reverse()
      .map(e => ({
        score: e.result?.credibilityScore ?? 0,
        label: new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        verdict: e.result?.verdict ?? 'UNCERTAIN',
      }));
  }

  return { getAll, add, getById, remove, clear, search, getLastScores };
})();
