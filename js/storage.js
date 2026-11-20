// LocalStorage persistence for high scores, favorites, recent games, theme, and cookie preference

const KEYS = {
  SCORES: 'playgrid_best_scores_v1',
  FAVORITES: 'playgrid_favorites_v1',
  RECENT: 'playgrid_recent_v1',
  PLAYED_COUNT: 'playgrid_total_plays_v1',
  THEME: 'playgrid_theme_v1',
  MUTED: 'playgrid_muted_v1',
  COOKIE: 'playgrid_cookie_consent_v1'
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export const Storage = {
  getScores() {
    return readJSON(KEYS.SCORES, {});
  },
  getBestScore(gameId) {
    const scores = this.getScores();
    return typeof scores[gameId] === 'number' ? scores[gameId] : 0;
  },
  saveBestScore(gameId, score, lowerIsBetter = false) {
    if (typeof score !== 'number' || Number.isNaN(score) || score <= 0) return false;
    const scores = this.getScores();
    const prev = scores[gameId];
    const improved = prev === undefined || (lowerIsBetter ? score < prev : score > prev);
    if (improved) {
      scores[gameId] = score;
      writeJSON(KEYS.SCORES, scores);
    }
    return improved;
  },
  getFavorites() {
    return readJSON(KEYS.FAVORITES, []);
  },
  isFavorite(gameId) {
    return this.getFavorites().includes(gameId);
  },
  toggleFavorite(gameId) {
    const favs = new Set(this.getFavorites());
    if (favs.has(gameId)) {
      favs.delete(gameId);
    } else {
      favs.add(gameId);
    }
    const arr = Array.from(favs);
    writeJSON(KEYS.FAVORITES, arr);
    return arr;
  },
  getRecent() {
    return readJSON(KEYS.RECENT, []);
  },
  recordPlay(gameId) {
    const recent = this.getRecent().filter((id) => id !== gameId);
    recent.unshift(gameId);
    writeJSON(KEYS.RECENT, recent.slice(0, 8));
    const total = Number(localStorage.getItem(KEYS.PLAYED_COUNT) || '0') + 1;
    try {
      localStorage.setItem(KEYS.PLAYED_COUNT, String(total));
    } catch {
      // Ignore
    }
  },
  getTotalPlays() {
    return Number(localStorage.getItem(KEYS.PLAYED_COUNT) || '0');
  },
  getTheme() {
    try {
      return localStorage.getItem(KEYS.THEME) || 'light';
    } catch {
      return 'light';
    }
  },
  setTheme(theme) {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch {
      // Ignore
    }
  },
  isMuted() {
    try {
      return localStorage.getItem(KEYS.MUTED) === 'true';
    } catch {
      return false;
    }
  },
  setMuted(muted) {
    try {
      localStorage.setItem(KEYS.MUTED, muted ? 'true' : 'false');
    } catch {
      // Ignore
    }
  },
  getCookieConsent() {
    try {
      return localStorage.getItem(KEYS.COOKIE);
    } catch {
      return null;
    }
  },
  setCookieConsent(value) {
    try {
      localStorage.setItem(KEYS.COOKIE, value);
    } catch {
      // Ignore
    }
  }
};
