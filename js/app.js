// Main Hub Controller for PlayGrid Arcade (Pure Vanilla JS ES Module)
import { AudioFX } from './audio.js';
import { Storage } from './storage.js';
import { CATEGORIES, GAME_CATALOG } from './games/catalog.js';
import { ARCADE_GAMES } from './games/arcade.js';
import { PUZZLE_GAMES } from './games/puzzle.js';
import { BOARD_GAMES } from './games/board.js';
import { BRAIN_GAMES } from './games/word-brain.js';
import { REFLEX_GAMES } from './games/reflex.js';

const ALL_ENGINES = {
  ...ARCADE_GAMES,
  ...PUZZLE_GAMES,
  ...BOARD_GAMES,
  ...BRAIN_GAMES,
  ...REFLEX_GAMES
};

const state = {
  category: 'all',
  search: '',
  favoritesOnly: false,
  activeGameId: null,
  cleanupFn: null,
  stageCleanupFn: null,
  inputHandler: null,
  forceTouchPad: false
};

const els = {
  hubView: document.getElementById('hub-view'),
  gameView: document.getElementById('game-view'),
  filterTabs: document.getElementById('filter-tabs'),
  gamesGrid: document.getElementById('games-grid'),
  gamesCount: document.getElementById('games-count'),
  searchInput: document.getElementById('search-input'),
  themeBtn: document.getElementById('theme-toggle'),
  muteBtn: document.getElementById('mute-toggle'),
  randomBtn: document.getElementById('random-game-btn'),
  statGamesCount: document.getElementById('stat-games-count'),
  statPlaysCount: document.getElementById('stat-plays-count'),
  statFavCount: document.getElementById('stat-fav-count'),
  // Active game stage
  backBtn: document.getElementById('back-to-hub'),
  hudTitle: document.getElementById('hud-title'),
  hudScore: document.getElementById('hud-score'),
  hudBest: document.getElementById('hud-best'),
  hudMetaLabel: document.getElementById('hud-meta-label'),
  hudMetaValue: document.getElementById('hud-meta-value'),
  hudRestart: document.getElementById('hud-restart'),
  hudTouchToggle: document.getElementById('hud-touch-toggle'),
  hudFavBtn: document.getElementById('hud-fav-btn'),
  hudGuideToggle: document.getElementById('hud-guide-toggle'),
  hudNativeFs: document.getElementById('hud-native-fs'),
  closeGuideBtn: document.getElementById('close-guide-btn'),
  gameSidebar: document.getElementById('game-sidebar'),
  gameStage: document.getElementById('game-stage'),
  touchPadBar: document.getElementById('touch-controls-bar'),
  touchActionBtn: document.getElementById('pad-action'),
  guideTitle: document.getElementById('guide-title'),
  guideDesc: document.getElementById('guide-desc'),
  guideSteps: document.getElementById('guide-steps'),
  guideTips: document.getElementById('guide-tips'),
  relatedList: document.getElementById('related-games-list'),
  // Mobile nav & cookies
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  mobileDrawer: document.getElementById('mobile-drawer'),
  cookieBanner: document.getElementById('cookie-banner'),
  cookieAccept: document.getElementById('cookie-accept'),
  cookieEssential: document.getElementById('cookie-essential')
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  Storage.setTheme(theme);
  if (els.themeBtn) {
    els.themeBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

function syncMuteLabel() {
  const muted = Storage.isMuted();
  if (els.muteBtn) {
    els.muteBtn.textContent = muted ? 'Sound: Off' : 'Sound: On';
  }
}

function updateHubStats() {
  if (els.statGamesCount) els.statGamesCount.textContent = String(GAME_CATALOG.length);
  if (els.statPlaysCount) els.statPlaysCount.textContent = String(Storage.getTotalPlays());
  if (els.statFavCount) els.statFavCount.textContent = String(Storage.getFavorites().length);
}

function renderFilters() {
  if (!els.filterTabs) return;
  els.filterTabs.innerHTML = '';
  const tabs = [...CATEGORIES, { id: 'favorites', label: 'Favorites' }];
  tabs.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-tab';
    const isActive = cat.id === 'favorites' ? state.favoritesOnly : (!state.favoritesOnly && state.category === cat.id);
    if (isActive) btn.classList.add('active');
    btn.textContent = cat.label;
    btn.onclick = () => {
      if (cat.id === 'favorites') {
        state.favoritesOnly = true;
        state.category = 'all';
      } else {
        state.favoritesOnly = false;
        state.category = cat.id;
      }
      renderFilters();
      renderCatalog();
    };
    els.filterTabs.appendChild(btn);
  });
}

function renderCatalog() {
  if (!els.gamesGrid) return;
  const q = state.search.trim().toLowerCase();
  const favs = Storage.getFavorites();
  const scores = Storage.getScores();

  const filtered = GAME_CATALOG.filter((g) => {
    if (state.favoritesOnly && !favs.includes(g.id)) return false;
    if (!state.favoritesOnly && state.category !== 'all' && g.category !== state.category) return false;
    if (q) {
      const hay = `${g.title} ${g.category} ${g.shortDesc} ${g.controlsLabel}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (els.gamesCount) {
    els.gamesCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'game' : 'games'} available`;
  }

  els.gamesGrid.innerHTML = '';
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'editorial-guide';
    empty.style.gridColumn = '1 / -1';
    empty.innerHTML = `<h3>No matching games found</h3><p>Try clearing your search filter or switching back to All Games.</p>`;
    els.gamesGrid.appendChild(empty);
    return;
  }

  filtered.forEach((game) => {
    const isFav = favs.includes(game.id);
    const best = scores[game.id];
    const bestLabel = best
      ? game.lowerIsBetter
        ? `Best ${best} ms`
        : `Best ${best}`
      : 'No score yet';

    const card = document.createElement('article');
    card.className = 'game-card';

    const thumb = document.createElement('div');
    thumb.className = 'game-card-thumb';
    thumb.style.background = game.accent;

    const glyph = document.createElement('div');
    glyph.className = 'game-card-glyph';
    glyph.textContent = game.glyph;

    const favBtn = document.createElement('button');
    favBtn.className = `fav-card-btn ${isFav ? 'is-fav' : ''}`;
    favBtn.setAttribute('aria-label', isFav ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`);
    favBtn.textContent = isFav ? '★' : '☆';
    favBtn.onclick = (e) => {
      e.stopPropagation();
      Storage.toggleFavorite(game.id);
      AudioFX.click();
      updateHubStats();
      renderCatalog();
    };

    thumb.append(glyph, favBtn);

    const body = document.createElement('div');
    body.className = 'game-card-body';

    const title = document.createElement('h3');
    title.className = 'game-card-title';
    title.textContent = game.title;

    const meta = document.createElement('div');
    meta.className = 'game-card-meta';
    meta.innerHTML = `<span>${game.category}</span><span aria-hidden="true">·</span><span>${game.controlsLabel}</span>`;

    const desc = document.createElement('p');
    desc.className = 'game-card-desc';
    desc.textContent = game.shortDesc;

    const footer = document.createElement('div');
    footer.className = 'game-card-footer';

    const bestEl = document.createElement('span');
    bestEl.className = 'best-score-text tabular-nums';
    bestEl.textContent = bestLabel;

    const playBtn = document.createElement('button');
    playBtn.className = 'btn btn-primary';
    playBtn.textContent = 'Play';
    playBtn.onclick = () => openGame(game.id);

    footer.append(bestEl, playBtn);
    body.append(title, meta, desc, footer);
    card.append(thumb, body);

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      openGame(game.id);
    });

    els.gamesGrid.appendChild(card);
  });
}

function destroyActiveGame() {
  if (typeof state.cleanupFn === 'function') {
    try {
      state.cleanupFn();
    } catch {
      // Ignore cleanup error
    }
  }
  if (typeof state.stageCleanupFn === 'function') {
    try {
      state.stageCleanupFn();
    } catch {
      // Ignore cleanup error
    }
  }
  state.cleanupFn = null;
  state.stageCleanupFn = null;
  state.inputHandler = null;
  if (els.gameStage) els.gameStage.innerHTML = '';
}

function updateTouchPadVisibility(game) {
  if (!els.touchPadBar) return;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 860;
  const show = state.forceTouchPad || (Boolean(game.hasDpad) && isTouchDevice);
  els.touchPadBar.classList.toggle('visible', show);
  if (els.hudTouchToggle) {
    els.hudTouchToggle.textContent = show ? 'Hide Touch Pad' : 'Touch Pad';
  }
  if (els.touchActionBtn) {
    els.touchActionBtn.textContent = game.actionLabel || 'Action';
  }
}

function requestNativeFullscreen(targetEl) {
  if (!targetEl) return;
  try {
    if (!document.fullscreenElement && targetEl.requestFullscreen) {
      targetEl.requestFullscreen().catch(() => {});
    }
  } catch {
    // Fallback to CSS full-viewport stage silently
  }
}

function exitNativeFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch {
    // Ignore
  }
}

function syncNativeFsButton() {
  if (!els.hudNativeFs) return;
  els.hudNativeFs.textContent = document.fullscreenElement ? '⛶ Exit Full' : '⛶ Full';
}

function openGame(gameId, pushHash = true, useNativeFullscreen = true) {
  const game = GAME_CATALOG.find((g) => g.id === gameId);
  const mountFn = ALL_ENGINES[gameId];
  if (!game || !mountFn) return;

  destroyActiveGame();
  state.activeGameId = gameId;
  state.forceTouchPad = Boolean(game.hasDpad && window.innerWidth <= 860);
  Storage.recordPlay(gameId);
  updateHubStats();

  if (pushHash) {
    history.replaceState(null, '', `#game=${encodeURIComponent(gameId)}`);
  }

  document.body.classList.add('game-fullscreen-open');
  els.hubView.classList.add('hidden');
  els.gameView.classList.add('active');
  if (els.gameSidebar) els.gameSidebar.classList.remove('open');

  if (useNativeFullscreen) {
    requestNativeFullscreen(els.gameView);
  }
  syncNativeFsButton();

  els.hudTitle.textContent = game.title;
  els.hudScore.textContent = '0';
  const best = Storage.getBestScore(game.id);
  els.hudBest.textContent = best ? (game.lowerIsBetter ? `${best} ms` : String(best)) : '0';
  els.hudMetaLabel.textContent = 'Category';
  els.hudMetaValue.textContent = game.category;

  const isFav = Storage.isFavorite(game.id);
  els.hudFavBtn.textContent = isFav ? '★ Saved' : '☆ Save';

  updateTouchPadVisibility(game);

  // Populate editorial guide & related games
  els.guideTitle.textContent = `How to Play ${game.title}`;
  els.guideDesc.textContent = game.shortDesc;
  els.guideSteps.innerHTML = '';
  game.howToPlay.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    els.guideSteps.appendChild(li);
  });
  els.guideTips.textContent = game.tips;

  const related = GAME_CATALOG.filter((g) => g.category === game.category && g.id !== game.id).slice(0, 4);
  els.relatedList.innerHTML = '';
  related.forEach((rel) => {
    const btn = document.createElement('button');
    btn.className = 'related-item';
    btn.innerHTML = `<span>${rel.title}</span><span>Play →</span>`;
    btn.onclick = () => openGame(rel.id);
    els.relatedList.appendChild(btn);
  });

  // Mount game engine
  mountFn({
    stage: els.gameStage,
    audio: AudioFX,
    setScore(val) {
      els.hudScore.textContent = game.lowerIsBetter && val > 0 ? `${val} ms` : String(val);
    },
    setMeta(label, val) {
      els.hudMetaLabel.textContent = label;
      els.hudMetaValue.textContent = String(val);
    },
    saveBest(val, lowerIsBetter = false) {
      const updated = Storage.saveBestScore(game.id, val, lowerIsBetter || Boolean(game.lowerIsBetter));
      if (updated) {
        els.hudBest.textContent = (lowerIsBetter || game.lowerIsBetter) ? `${val} ms` : String(val);
      }
    },
    registerInput(fn) {
      state.inputHandler = fn;
    },
    onCleanup(fn) {
      state.cleanupFn = fn;
    },
    onStageResizeCleanup(fn) {
      state.stageCleanupFn = fn;
    }
  });
}

function closeGame() {
  destroyActiveGame();
  exitNativeFullscreen();
  state.activeGameId = null;
  history.replaceState(null, '', '#catalog');
  document.body.classList.remove('game-fullscreen-open');
  if (els.gameSidebar) els.gameSidebar.classList.remove('open');
  els.gameView.classList.remove('active');
  els.hubView.classList.remove('hidden');
  renderCatalog();
}

function setupControls() {
  // Keyboard controls routed to active game
  window.addEventListener('keydown', (e) => {
    if (!state.activeGameId || !state.inputHandler) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') state.inputHandler('up');
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.inputHandler('down');
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.inputHandler('left');
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.inputHandler('right');
    else if (e.key === ' ') state.inputHandler('action');
  });

  // Virtual D-Pad & Action button
  document.querySelectorAll('[data-pad-action]').forEach((btn) => {
    const act = btn.getAttribute('data-pad-action');
    const trigger = (e) => {
      e.preventDefault();
      if (state.inputHandler && act) state.inputHandler(act);
    };
    btn.addEventListener('pointerdown', trigger);
  });

  if (els.hudRestart) {
    els.hudRestart.onclick = () => {
      if (state.inputHandler) state.inputHandler('restart');
      else if (state.activeGameId) openGame(state.activeGameId, false);
    };
  }

  if (els.hudTouchToggle) {
    els.hudTouchToggle.onclick = () => {
      state.forceTouchPad = !state.forceTouchPad;
      const game = GAME_CATALOG.find((g) => g.id === state.activeGameId);
      if (game) updateTouchPadVisibility(game);
    };
  }

  if (els.hudFavBtn) {
    els.hudFavBtn.onclick = () => {
      if (!state.activeGameId) return;
      Storage.toggleFavorite(state.activeGameId);
      const isFav = Storage.isFavorite(state.activeGameId);
      els.hudFavBtn.textContent = isFav ? '★ Saved' : '☆ Save';
      AudioFX.click();
      updateHubStats();
    };
  }

  if (els.hudGuideToggle && els.gameSidebar) {
    els.hudGuideToggle.onclick = () => {
      els.gameSidebar.classList.toggle('open');
    };
  }

  if (els.closeGuideBtn && els.gameSidebar) {
    els.closeGuideBtn.onclick = () => {
      els.gameSidebar.classList.remove('open');
    };
  }

  if (els.hudNativeFs) {
    els.hudNativeFs.onclick = () => {
      if (document.fullscreenElement) exitNativeFullscreen();
      else requestNativeFullscreen(els.gameView);
    };
  }

  document.addEventListener('fullscreenchange', syncNativeFsButton);

  if (els.backBtn) {
    els.backBtn.onclick = closeGame;
  }

  if (els.searchInput) {
    els.searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      renderCatalog();
    });
  }

  if (els.themeBtn) {
    els.themeBtn.onclick = () => {
      const cur = Storage.getTheme();
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    };
  }

  if (els.muteBtn) {
    els.muteBtn.onclick = () => {
      Storage.setMuted(!Storage.isMuted());
      syncMuteLabel();
    };
  }

  if (els.randomBtn) {
    els.randomBtn.onclick = () => {
      const pick = GAME_CATALOG[Math.floor(Math.random() * GAME_CATALOG.length)];
      openGame(pick.id);
    };
  }

  // Nav shortcuts for Favorites / Categories
  document.querySelectorAll('[data-hub-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-hub-nav');
      if (els.mobileDrawer) els.mobileDrawer.classList.remove('open');
      if (state.activeGameId) closeGame();
      if (target === 'favorites') {
        e.preventDefault();
        state.favoritesOnly = true;
        state.category = 'all';
        renderFilters();
        renderCatalog();
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      } else if (target === 'games') {
        state.favoritesOnly = false;
        state.category = 'all';
        renderFilters();
        renderCatalog();
      }
    });
  });

  if (els.mobileMenuBtn && els.mobileDrawer) {
    els.mobileMenuBtn.onclick = () => {
      const open = els.mobileDrawer.classList.toggle('open');
      els.mobileMenuBtn.setAttribute('aria-expanded', String(open));
    };
  }

  // Cookie Consent
  if (els.cookieBanner && !Storage.getCookieConsent()) {
    els.cookieBanner.classList.add('visible');
  }
  if (els.cookieAccept) {
    els.cookieAccept.onclick = () => {
      Storage.setCookieConsent('all');
      els.cookieBanner.classList.remove('visible');
    };
  }
  if (els.cookieEssential) {
    els.cookieEssential.onclick = () => {
      Storage.setCookieConsent('essential');
      els.cookieBanner.classList.remove('visible');
    };
  }
}

function init() {
  applyTheme(Storage.getTheme());
  syncMuteLabel();
  updateHubStats();
  renderFilters();
  renderCatalog();
  setupControls();

  // Check URL hash for direct game launch (no user gesture, so CSS full-viewport mode opens immediately)
  const hash = window.location.hash;
  if (hash.startsWith('#game=')) {
    const id = decodeURIComponent(hash.slice(6));
    if (ALL_ENGINES[id]) {
      openGame(id, false, false);
    }
  }
}

init();
