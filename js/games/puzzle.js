// 8 Original Puzzle & Logic Games (Mobile-first DOM + Canvas)
import { attachSwipe, createCanvasStage, drawOverlayCard, roundRect } from './utils.js';

export const PUZZLE_GAMES = {
  // 9. 2048 SLIDE
  'game-2048'(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let board = [];
    let prevBoard = null;
    let prevScore = 0;
    let score = 0;
    let gameOver = false;

    const tileColors = {
      0: ['#1e293b', '#64748b'],
      2: ['#f1f5f9', '#0f172a'],
      4: ['#e2e8f0', '#0f172a'],
      8: ['#fb923c', '#ffffff'],
      16: ['#f97316', '#ffffff'],
      32: ['#ea580c', '#ffffff'],
      64: ['#dc2626', '#ffffff'],
      128: ['#eab308', '#ffffff'],
      256: ['#ca8a04', '#ffffff'],
      512: ['#10b981', '#ffffff'],
      1024: ['#059669', '#ffffff'],
      2048: ['#2563eb', '#ffffff']
    };

    function addTile() {
      const empties = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === 0) empties.push([r, c]);
        }
      }
      if (!empties.length) return;
      const [r, c] = empties[Math.floor(Math.random() * empties.length)];
      board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function canMove() {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === 0) return true;
          if (r < 3 && board[r][c] === board[r + 1][c]) return true;
          if (c < 3 && board[r][c] === board[r][c + 1]) return true;
        }
      }
      return false;
    }

    function slideRow(row) {
      const filtered = row.filter((v) => v !== 0);
      const out = [];
      let gained = 0;
      for (let i = 0; i < filtered.length; i++) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const val = filtered[i] * 2;
          out.push(val);
          gained += val;
          i++;
        } else {
          out.push(filtered[i]);
        }
      }
      while (out.length < 4) out.push(0);
      return { out, gained };
    }

    function move(dir) {
      if (gameOver) return;
      const snapshot = board.map((r) => [...r]);
      const scoreSnap = score;
      let moved = false;

      if (dir === 'left' || dir === 'right') {
        for (let r = 0; r < 4; r++) {
          const src = dir === 'right' ? [...board[r]].reverse() : [...board[r]];
          const { out, gained } = slideRow(src);
          const next = dir === 'right' ? out.reverse() : out;
          if (next.some((v, idx) => v !== board[r][idx])) moved = true;
          board[r] = next;
          score += gained;
        }
      } else {
        for (let c = 0; c < 4; c++) {
          const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
          const src = dir === 'down' ? col.reverse() : col;
          const { out, gained } = slideRow(src);
          const next = dir === 'down' ? out.reverse() : out;
          for (let r = 0; r < 4; r++) {
            if (board[r][c] !== next[r]) moved = true;
            board[r][c] = next[r];
          }
          score += gained;
        }
      }

      if (moved) {
        prevBoard = snapshot;
        prevScore = scoreSnap;
        addTile();
        ctx.audio.click();
        ctx.setScore(score);
        ctx.saveBest(score);
        if (!canMove()) {
          gameOver = true;
          ctx.audio.error();
        }
        render();
      }
    }

    function undo() {
      if (!prevBoard) return;
      board = prevBoard.map((r) => [...r]);
      score = prevScore;
      prevBoard = null;
      gameOver = false;
      ctx.setScore(score);
      ctx.audio.click();
      render();
    }

    function reset() {
      board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
      prevBoard = null;
      score = 0;
      gameOver = false;
      addTile();
      addTile();
      ctx.setScore(0);
      ctx.setMeta('Goal', '2048');
      render();
    }

    function render() {
      const maxTile = Math.max(...board.flat());
      ctx.setMeta('Top Tile', maxTile);
      root.innerHTML = '';

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${gameOver ? 'No more moves!' : 'Swipe or use Arrow keys'}</span><span>Top: ${maxTile}</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(4, minmax(60px, 74px))';
      grid.style.gap = '8px';

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = board[r][c];
          const [bg, fg] = tileColors[val] || ['#1d4ed8', '#ffffff'];
          const cell = document.createElement('div');
          cell.className = 'cell-btn';
          cell.style.height = '68px';
          cell.style.background = bg;
          cell.style.color = fg;
          cell.style.fontSize = val >= 1000 ? '1.1rem' : '1.35rem';
          cell.textContent = val ? String(val) : '';
          grid.appendChild(cell);
        }
      }
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const undoBtn = document.createElement('button');
      undoBtn.className = 'stage-btn';
      undoBtn.textContent = 'Undo Move';
      undoBtn.disabled = !prevBoard;
      undoBtn.onclick = undo;

      const newBtn = document.createElement('button');
      newBtn.className = 'stage-btn primary';
      newBtn.textContent = 'New Board';
      newBtn.onclick = reset;

      controls.append(undoBtn, newBtn);
      root.appendChild(controls);
    }

    const cleanups = [];
    attachSwipe(root, move, cleanups);
    ctx.onCleanup(() => cleanups.forEach((fn) => fn()));
    ctx.registerInput((action) => {
      if (action === 'restart') return reset();
      if (action === 'action') return undo();
      if (['up', 'down', 'left', 'right'].includes(action)) move(action);
    });

    reset();
  },

  // 10. MINESWEEPER (9x9, 10 mines)
  minesweeper(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const size = 9;
    const mineCount = 10;
    let grid = [];
    let flagMode = false;
    let started = false;
    let status = 'PLAYING'; // PLAYING | WON | LOST
    let score = 0;

    function neighbors(r, c) {
      const res = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) res.push([nr, nc]);
        }
      }
      return res;
    }

    function placeMines(safeR, safeC) {
      let placed = 0;
      while (placed < mineCount) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if ((Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) || grid[r][c].mine) continue;
        grid[r][c].mine = true;
        placed++;
      }
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          grid[r][c].adj = neighbors(r, c).filter(([nr, nc]) => grid[nr][nc].mine).length;
        }
      }
    }

    function reveal(r, c) {
      const cell = grid[r][c];
      if (cell.open || cell.flag || status !== 'PLAYING') return;
      if (!started) {
        started = true;
        placeMines(r, c);
      }
      cell.open = true;
      if (cell.mine) {
        status = 'LOST';
        grid.flat().forEach((x) => { if (x.mine) x.open = true; });
        ctx.audio.error();
        render();
        return;
      }
      score += 10;
      ctx.audio.click();
      if (cell.adj === 0) {
        for (const [nr, nc] of neighbors(r, c)) reveal(nr, nc);
      }
      checkWin();
      ctx.setScore(score);
      render();
    }

    function toggleFlag(r, c) {
      const cell = grid[r][c];
      if (cell.open || status !== 'PLAYING') return;
      cell.flag = !cell.flag;
      ctx.audio.click();
      render();
    }

    function checkWin() {
      const closedSafe = grid.flat().filter((x) => !x.mine && !x.open).length;
      if (closedSafe === 0 && status === 'PLAYING') {
        status = 'WON';
        score += 200;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
      }
    }

    function reset() {
      grid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({ mine: false, open: false, flag: false, adj: 0 }))
      );
      started = false;
      status = 'PLAYING';
      score = 0;
      ctx.setScore(0);
      render();
    }

    function render() {
      const flags = grid.flat().filter((x) => x.flag).length;
      ctx.setMeta('Mines Left', Math.max(0, mineCount - flags));
      root.innerHTML = '';

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${
        status === 'WON' ? 'Board Cleared!' : status === 'LOST' ? 'Mine Triggered!' : flagMode ? 'Flag Mode Active' : 'Reveal Mode Active'
      }</span><span>${mineCount - flags} mines</span>`;
      root.appendChild(banner);

      const boardEl = document.createElement('div');
      boardEl.className = 'board-grid';
      boardEl.style.gridTemplateColumns = `repeat(${size}, minmax(30px, 38px))`;
      boardEl.style.gap = '4px';

      const numColors = ['', '#60a5fa', '#34d399', '#f87171', '#a78bfa', '#fbbf24', '#2dd4bf', '#f472b6', '#e2e8f0'];

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = grid[r][c];
          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.minWidth = '32px';
          btn.style.minHeight = '36px';
          btn.style.fontSize = '0.95rem';

          if (cell.open) {
            btn.style.background = cell.mine ? '#dc2626' : '#0f172a';
            btn.style.color = cell.mine ? '#ffffff' : numColors[cell.adj] || '#e2e8f0';
            btn.textContent = cell.mine ? '✦' : cell.adj > 0 ? String(cell.adj) : '';
          } else {
            btn.style.background = cell.flag ? '#b45309' : '#334155';
            btn.style.color = '#ffffff';
            btn.textContent = cell.flag ? '⚑' : '';
          }

          btn.onclick = () => (flagMode ? toggleFlag(r, c) : reveal(r, c));
          btn.oncontextmenu = (e) => {
            e.preventDefault();
            toggleFlag(r, c);
          };
          boardEl.appendChild(btn);
        }
      }
      root.appendChild(boardEl);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const flagBtn = document.createElement('button');
      flagBtn.className = `stage-btn ${flagMode ? 'primary' : ''}`;
      flagBtn.textContent = flagMode ? 'Mode: Flag (On)' : 'Mode: Dig';
      flagBtn.onclick = () => { flagMode = !flagMode; render(); };

      const newBtn = document.createElement('button');
      newBtn.className = 'stage-btn';
      newBtn.textContent = 'New Minefield';
      newBtn.onclick = reset;

      controls.append(flagBtn, newBtn);
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart') reset();
      if (action === 'action') { flagMode = !flagMode; render(); }
    });

    reset();
  },

  // 11. BLOCK STACKER (TETRIS)
  tetris(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 320, 480);
    const cols = 10;
    const rows = 20;
    const cell = 24;
    const offsetX = (width - cols * cell) / 2;

    const shapes = [
      { m: [[1, 1, 1, 1]], color: '#06b6d4' },
      { m: [[1, 1], [1, 1]], color: '#eab308' },
      { m: [[0, 1, 0], [1, 1, 1]], color: '#8b5cf6' },
      { m: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
      { m: [[0, 0, 1], [1, 1, 1]], color: '#f97316' },
      { m: [[0, 1, 1], [1, 1, 0]], color: '#10b981' },
      { m: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' }
    ];

    let board, piece, score, lines, state, lastDrop, dropMs;
    let rafId = 0;

    function newPiece() {
      const s = shapes[Math.floor(Math.random() * shapes.length)];
      return {
        m: s.m.map((r) => [...r]),
        color: s.color,
        x: Math.floor((cols - s.m[0].length) / 2),
        y: 0
      };
    }

    function collides(px, py, mat) {
      for (let r = 0; r < mat.length; r++) {
        for (let col = 0; col < mat[r].length; col++) {
          if (!mat[r][col]) continue;
          const nx = px + col;
          const ny = py + r;
          if (nx < 0 || nx >= cols || ny >= rows) return true;
          if (ny >= 0 && board[ny][nx]) return true;
        }
      }
      return false;
    }

    function merge() {
      piece.m.forEach((row, r) => {
        row.forEach((v, col) => {
          if (v && piece.y + r >= 0) {
            board[piece.y + r][piece.x + col] = piece.color;
          }
        });
      });
      let cleared = 0;
      for (let r = rows - 1; r >= 0; r--) {
        if (board[r].every((v) => v !== 0)) {
          board.splice(r, 1);
          board.unshift(Array(cols).fill(0));
          cleared++;
          r++;
        }
      }
      if (cleared > 0) {
        const pts = [0, 100, 300, 500, 800][cleared] || 800;
        score += pts;
        lines += cleared;
        dropMs = Math.max(150, 560 - lines * 14);
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        ctx.setMeta('Lines', lines);
      } else {
        ctx.audio.click();
      }
      piece = newPiece();
      if (collides(piece.x, piece.y, piece.m)) {
        state = 'OVER';
        ctx.audio.error();
        ctx.saveBest(score);
      }
    }

    function rotatePiece() {
      if (state !== 'PLAYING') return;
      const rot = piece.m[0].map((_, idx) => piece.m.map((r) => r[idx]).reverse());
      if (!collides(piece.x, piece.y, rot)) {
        piece.m = rot;
        ctx.audio.bounce();
      } else if (!collides(piece.x - 1, piece.y, rot)) {
        piece.x -= 1;
        piece.m = rot;
      } else if (!collides(piece.x + 1, piece.y, rot)) {
        piece.x += 1;
        piece.m = rot;
      }
    }

    function reset(startPlaying = false) {
      board = Array.from({ length: rows }, () => Array(cols).fill(0));
      piece = newPiece();
      score = 0;
      lines = 0;
      dropMs = 560;
      lastDrop = performance.now();
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Lines', 0);
    }

    function draw(now) {
      if (state === 'PLAYING' && now - lastDrop >= dropMs) {
        lastDrop = now;
        if (!collides(piece.x, piece.y + 1, piece.m)) {
          piece.y++;
        } else {
          merge();
        }
      }

      c.fillStyle = '#070b14';
      c.fillRect(0, 0, width, height);

      c.fillStyle = '#0f172a';
      c.fillRect(offsetX, 0, cols * cell, rows * cell);

      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          if (board[r][col]) {
            c.fillStyle = board[r][col];
            roundRect(c, offsetX + col * cell + 1, r * cell + 1, cell - 2, cell - 2, 3);
            c.fill();
          }
        }
      }

      if (state === 'PLAYING') {
        piece.m.forEach((row, r) => {
          row.forEach((v, col) => {
            if (v) {
              c.fillStyle = piece.color;
              roundRect(c, offsetX + (piece.x + col) * cell + 1, (piece.y + r) * cell + 1, cell - 2, cell - 2, 3);
              c.fill();
            }
          });
        });
      }

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Block Stacker', 'D-Pad & Rotate to clear rows', 'Tap Stage to Start');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Stack Topped Out', `Score: ${score} · Lines: ${lines}`, 'Tap Stage to Play Again');
      }
      rafId = requestAnimationFrame(draw);
    }

    const onTap = () => {
      if (state === 'TITLE') { state = 'PLAYING'; lastDrop = performance.now(); }
      else if (state === 'OVER') reset(true);
      else rotatePiece();
    };
    canvas.addEventListener('click', onTap);

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (state !== 'PLAYING') { state = 'PLAYING'; lastDrop = performance.now(); return; }
      if (action === 'left' && !collides(piece.x - 1, piece.y, piece.m)) piece.x--;
      if (action === 'right' && !collides(piece.x + 1, piece.y, piece.m)) piece.x++;
      if (action === 'down') {
        if (!collides(piece.x, piece.y + 1, piece.m)) piece.y++;
        else merge();
      }
      if (action === 'up' || action === 'action') rotatePiece();
    });

    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('click', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 12. SLIDING 15 PUZZLE
  sliding15(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let tiles = [];
    let moves = 0;
    let solved = false;

    function isSolved() {
      for (let i = 0; i < 15; i++) {
        if (tiles[i] !== i + 1) return false;
      }
      return tiles[15] === 0;
    }

    function swap(idx) {
      const empty = tiles.indexOf(0);
      const r1 = Math.floor(idx / 4), c1 = idx % 4;
      const r2 = Math.floor(empty / 4), c2 = empty % 4;
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return false;
      [tiles[idx], tiles[empty]] = [tiles[empty], tiles[idx]];
      return true;
    }

    function shuffle() {
      tiles = Array.from({ length: 15 }, (_, i) => i + 1).concat(0);
      // Perform 120 legal random moves to guarantee 100% solvability
      for (let i = 0; i < 120; i++) {
        const empty = tiles.indexOf(0);
        const r = Math.floor(empty / 4), c = empty % 4;
        const nbs = [];
        if (r > 0) nbs.push(empty - 4);
        if (r < 3) nbs.push(empty + 4);
        if (c > 0) nbs.push(empty - 1);
        if (c < 3) nbs.push(empty + 1);
        const pick = nbs[Math.floor(Math.random() * nbs.length)];
        [tiles[empty], tiles[pick]] = [tiles[pick], tiles[empty]];
      }
      moves = 0;
      solved = false;
      ctx.setScore(0);
      ctx.setMeta('Moves', 0);
      render();
    }

    function handleClick(idx) {
      if (solved) return;
      if (swap(idx)) {
        moves++;
        ctx.audio.click();
        ctx.setMeta('Moves', moves);
        if (isSolved()) {
          solved = true;
          const pts = Math.max(100, 1200 - moves * 10);
          ctx.setScore(pts);
          ctx.saveBest(pts);
          ctx.audio.win();
        }
        render();
      }
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${solved ? 'Puzzle Solved!' : 'Tap adjacent tiles to sort 1–15'}</span><span>Moves: ${moves}</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(4, minmax(60px, 72px))';
      grid.style.gap = '6px';

      tiles.forEach((val, idx) => {
        const btn = document.createElement('button');
        btn.className = 'cell-btn';
        btn.style.height = '64px';
        btn.style.fontSize = '1.2rem';
        if (val === 0) {
          btn.style.background = '#0f172a';
          btn.disabled = true;
        } else {
          const rightSpot = val === idx + 1;
          btn.style.background = rightSpot ? '#059669' : '#2563eb';
          btn.style.color = '#ffffff';
          btn.textContent = String(val);
          btn.onclick = () => handleClick(idx);
        }
        grid.appendChild(btn);
      });
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const btn = document.createElement('button');
      btn.className = 'stage-btn primary';
      btn.textContent = 'Shuffle Board';
      btn.onclick = shuffle;
      controls.appendChild(btn);
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') return shuffle();
      const empty = tiles.indexOf(0);
      const r = Math.floor(empty / 4), c = empty % 4;
      if (action === 'up' && r < 3) handleClick(empty + 4);
      if (action === 'down' && r > 0) handleClick(empty - 4);
      if (action === 'left' && c < 3) handleClick(empty + 1);
      if (action === 'right' && c > 0) handleClick(empty - 1);
    });

    shuffle();
  },

  // 13. LIGHTS OUT
  'lights-out'(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let grid = [];
    let level = 1;
    let moves = 0;
    let score = 0;

    function toggleAt(r, c) {
      const pts = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [nr, nc] of pts) {
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
          grid[nr][nc] = !grid[nr][nc];
        }
      }
    }

    function setupLevel(lvl) {
      grid = Array.from({ length: 5 }, () => Array(5).fill(false));
      const clicks = Math.min(12, 3 + lvl);
      for (let i = 0; i < clicks; i++) {
        toggleAt(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
      }
      if (grid.flat().every((v) => !v)) toggleAt(2, 2);
      moves = 0;
      ctx.setMeta('Level', lvl);
      render();
    }

    function handleTap(r, c) {
      toggleAt(r, c);
      moves++;
      ctx.audio.click();
      if (grid.flat().every((v) => !v)) {
        score += Math.max(50, 200 - moves * 8);
        level++;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        setupLevel(level);
        return;
      }
      render();
    }

    function render() {
      root.innerHTML = '';
      const lit = grid.flat().filter(Boolean).length;
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>Turn all lights off · Level ${level}</span><span>Lit: ${lit}</span>`;
      root.appendChild(banner);

      const board = document.createElement('div');
      board.className = 'board-grid';
      board.style.gridTemplateColumns = 'repeat(5, minmax(46px, 56px))';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.height = '54px';
          btn.style.background = grid[r][c] ? '#f59e0b' : '#0f172a';
          btn.style.border = grid[r][c] ? '2px solid #fde68a' : '1px solid #334155';
          btn.onclick = () => handleTap(r, c);
          board.appendChild(btn);
        }
      }
      root.appendChild(board);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'New Puzzle';
      resetBtn.onclick = () => setupLevel(level);
      controls.appendChild(resetBtn);
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') setupLevel(level);
    });
    setupLevel(1);
  },

  // 14. SUDOKU MINI (6x6)
  sudoku(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const baseSolution = [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2]
    ];

    let solution = [];
    let puzzle = [];
    let fixed = [];
    let selected = null;
    let score = 0;
    let message = 'Select a cell and tap 1–6';

    function newBoard() {
      const map = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
      solution = baseSolution.map((row) => row.map((v) => map[v - 1]));
      puzzle = solution.map((row) => row.map((v) => (Math.random() < 0.48 ? v : 0)));
      fixed = puzzle.map((row) => row.map((v) => v !== 0));
      selected = null;
      message = 'Fill rows, columns & 2x3 boxes with 1–6';
      ctx.setMeta('Grid', '6x6');
      render();
    }

    function placeNumber(num) {
      if (!selected) return;
      const [r, c] = selected;
      if (fixed[r][c]) return;
      puzzle[r][c] = num;
      ctx.audio.click();
      if (puzzle.every((row, ri) => row.every((val, ci) => val === solution[ri][ci]))) {
        score += 250;
        message = 'Solved! Great logic!';
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
      }
      render();
    }

    function giveHint() {
      const empties = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (puzzle[r][c] !== solution[r][c]) empties.push([r, c]);
        }
      }
      if (!empties.length) return;
      const [r, c] = empties[Math.floor(Math.random() * empties.length)];
      puzzle[r][c] = solution[r][c];
      fixed[r][c] = true;
      ctx.audio.score();
      render();
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.textContent = message;
      root.appendChild(banner);

      const board = document.createElement('div');
      board.className = 'board-grid';
      board.style.gridTemplateColumns = 'repeat(6, minmax(40px, 48px))';
      board.style.gap = '4px';

      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const val = puzzle[r][c];
          const isSel = selected && selected[0] === r && selected[1] === c;
          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.height = '44px';
          btn.style.fontSize = '1.05rem';
          btn.style.background = isSel ? '#2563eb' : fixed[r][c] ? '#334155' : '#0f172a';
          btn.style.color = fixed[r][c] ? '#93c5fd' : '#ffffff';
          if (c === 2) btn.style.marginRight = '4px';
          if (r === 1 || r === 3) btn.style.marginBottom = '4px';
          btn.textContent = val ? String(val) : '';
          btn.onclick = () => {
            if (!fixed[r][c]) {
              selected = [r, c];
              render();
            }
          };
          board.appendChild(btn);
        }
      }
      root.appendChild(board);

      const keypad = document.createElement('div');
      keypad.className = 'stage-controls-row';
      for (let n = 1; n <= 6; n++) {
        const b = document.createElement('button');
        b.className = 'stage-btn';
        b.style.minWidth = '44px';
        b.textContent = String(n);
        b.onclick = () => placeNumber(n);
        keypad.appendChild(b);
      }
      const clr = document.createElement('button');
      clr.className = 'stage-btn';
      clr.textContent = 'Clear';
      clr.onclick = () => placeNumber(0);
      keypad.appendChild(clr);
      root.appendChild(keypad);

      const actions = document.createElement('div');
      actions.className = 'stage-controls-row';
      const hintBtn = document.createElement('button');
      hintBtn.className = 'stage-btn';
      hintBtn.textContent = 'Hint';
      hintBtn.onclick = giveHint;
      const newBtn = document.createElement('button');
      newBtn.className = 'stage-btn primary';
      newBtn.textContent = 'New Puzzle';
      newBtn.onclick = newBoard;
      actions.append(hintBtn, newBtn);
      root.appendChild(actions);
    }

    const onKey = (e) => {
      if (e.key >= '1' && e.key <= '6') placeNumber(Number(e.key));
      if (e.key === 'Backspace' || e.key === '0') placeNumber(0);
    };
    window.addEventListener('keydown', onKey);
    ctx.onCleanup(() => window.removeEventListener('keydown', onKey));
    ctx.registerInput((action) => {
      if (action === 'restart') newBoard();
      if (action === 'action') giveHint();
    });

    newBoard();
  },

  // 15. PIPE CONNECT
  pipes(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const size = 5;
    // Bitmask openings: 1=Top, 2=Right, 4=Bottom, 8=Left
    let grid = [];
    let level = 1;
    let score = 0;

    function rotateMask(mask, times = 1) {
      let m = mask;
      for (let t = 0; t < times; t++) {
        let nm = 0;
        if (m & 1) nm |= 2;
        if (m & 2) nm |= 4;
        if (m & 4) nm |= 8;
        if (m & 8) nm |= 1;
        m = nm;
      }
      return m;
    }

    function generateLevel() {
      // Build guaranteed valid path from (0,0) to (4,4)
      grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ mask: 0, flow: false })));
      let r = 0, c = 0;
      const path = [[0, 0]];
      const visited = new Set(['0,0']);
      while (r !== size - 1 || c !== size - 1) {
        const opts = [];
        if (c < size - 1) opts.push([r, c + 1]);
        if (r < size - 1) opts.push([r + 1, c]);
        const [nr, nc] = opts[Math.floor(Math.random() * opts.length)];
        r = nr; c = nc;
        path.push([r, c]);
        visited.add(`${r},${c}`);
      }

      for (let i = 0; i < path.length; i++) {
        const [cr, cc] = path[i];
        if (i === 0) grid[cr][cc].mask |= 8; // Inlet from left
        if (i === path.length - 1) grid[cr][cc].mask |= 2; // Outlet to right
        if (i > 0) {
          const [pr, pc] = path[i - 1];
          if (pr < cr) grid[cr][cc].mask |= 1;
          if (pr > cr) grid[cr][cc].mask |= 4;
          if (pc < cc) grid[cr][cc].mask |= 8;
          if (pc > cc) grid[cr][cc].mask |= 2;
        }
        if (i < path.length - 1) {
          const [nr, nc] = path[i + 1];
          if (nr < cr) grid[cr][cc].mask |= 1;
          if (nr > cr) grid[cr][cc].mask |= 4;
          if (nc < cc) grid[cr][cc].mask |= 8;
          if (nc > cc) grid[cr][cc].mask |= 2;
        }
      }

      for (let rr = 0; rr < size; rr++) {
        for (let cc = 0; cc < size; cc++) {
          if (grid[rr][cc].mask === 0) {
            grid[rr][cc].mask = Math.random() > 0.5 ? 5 : 3; // straight or elbow
          }
          const spins = 1 + Math.floor(Math.random() * 3);
          grid[rr][cc].mask = rotateMask(grid[rr][cc].mask, spins);
        }
      }
      computeFlow();
      render();
    }

    function computeFlow() {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) grid[r][c].flow = false;
      }
      const q = [];
      if (grid[0][0].mask & 8) {
        grid[0][0].flow = true;
        q.push([0, 0]);
      }
      while (q.length) {
        const [r, c] = q.shift();
        const m = grid[r][c].mask;
        const checks = [
          [1, 4, r - 1, c],
          [2, 8, r, c + 1],
          [4, 1, r + 1, c],
          [8, 2, r, c - 1]
        ];
        for (const [outBit, inBit, nr, nc] of checks) {
          if ((m & outBit) && nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (!grid[nr][nc].flow && (grid[nr][nc].mask & inBit)) {
              grid[nr][nc].flow = true;
              q.push([nr, nc]);
            }
          }
        }
      }
    }

    function pipeSvg(mask, flow) {
      const color = flow ? '#38bdf8' : '#94a3b8';
      let lines = `<circle cx="24" cy="24" r="5" fill="${color}"/>`;
      if (mask & 1) lines += `<rect x="20" y="0" width="8" height="24" fill="${color}"/>`;
      if (mask & 2) lines += `<rect x="24" y="20" width="24" height="8" fill="${color}"/>`;
      if (mask & 4) lines += `<rect x="20" y="24" width="8" height="24" fill="${color}"/>`;
      if (mask & 8) lines += `<rect x="0" y="20" width="24" height="8" fill="${color}"/>`;
      return `<svg viewBox="0 0 48 48" width="42" height="42">${lines}</svg>`;
    }

    function tapPipe(r, c) {
      grid[r][c].mask = rotateMask(grid[r][c].mask, 1);
      ctx.audio.click();
      computeFlow();
      if (grid[size - 1][size - 1].flow && (grid[size - 1][size - 1].mask & 2)) {
        score += 120;
        level++;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        ctx.setMeta('Level', level);
        generateLevel();
        return;
      }
      render();
    }

    function render() {
      root.innerHTML = '';
      ctx.setMeta('Level', level);
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>Connect Top-Left Inlet → Bottom-Right Exit</span><span>Lv ${level}</span>`;
      root.appendChild(banner);

      const board = document.createElement('div');
      board.className = 'board-grid';
      board.style.gridTemplateColumns = `repeat(${size}, minmax(48px, 56px))`;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.height = '54px';
          btn.style.padding = '0';
          btn.style.background = (r === 0 && c === 0) || (r === size - 1 && c === size - 1) ? '#1e3a8a' : '#0f172a';
          btn.innerHTML = pipeSvg(grid[r][c].mask, grid[r][c].flow);
          btn.onclick = () => tapPipe(r, c);
          board.appendChild(btn);
        }
      }
      root.appendChild(board);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const newBtn = document.createElement('button');
      newBtn.className = 'stage-btn primary';
      newBtn.textContent = 'New Pipeline';
      newBtn.onclick = generateLevel;
      controls.appendChild(newBtn);
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') generateLevel();
    });

    generateLevel();
  },

  // 16. COLOR FLOOD
  'color-flood'(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const size = 10;
    const maxMoves = 22;
    const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    let board = [];
    let moves = 0;
    let status = 'PLAYING';

    function reset() {
      board = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * palette.length))
      );
      moves = 0;
      status = 'PLAYING';
      ctx.setScore(0);
      ctx.setMeta('Moves', `0 / ${maxMoves}`);
      render();
    }

    function flood(newColor) {
      if (status !== 'PLAYING') return;
      const oldColor = board[0][0];
      if (oldColor === newColor) return;
      moves++;
      const q = [[0, 0]];
      const seen = new Set(['0,0']);
      while (q.length) {
        const [r, c] = q.shift();
        board[r][c] = newColor;
        for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && !seen.has(`${nr},${nc}`) && board[nr][nc] === oldColor) {
            seen.add(`${nr},${nc}`);
            q.push([nr, nc]);
          }
        }
      }
      ctx.audio.click();
      ctx.setMeta('Moves', `${moves} / ${maxMoves}`);

      if (board.flat().every((v) => v === newColor)) {
        status = 'WON';
        const pts = Math.max(100, (maxMoves - moves + 5) * 30);
        ctx.setScore(pts);
        ctx.saveBest(pts);
        ctx.audio.win();
      } else if (moves >= maxMoves) {
        status = 'LOST';
        ctx.audio.error();
      }
      render();
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${
        status === 'WON' ? 'Board Flooded!' : status === 'LOST' ? 'Out of Moves!' : 'Tap a swatch below to flood from top-left'
      }</span><span>${moves}/${maxMoves}</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = `repeat(${size}, minmax(24px, 30px))`;
      grid.style.gap = '2px';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = document.createElement('div');
          cell.style.height = '28px';
          cell.style.borderRadius = '3px';
          cell.style.background = palette[board[r][c]];
          grid.appendChild(cell);
        }
      }
      root.appendChild(grid);

      const swatches = document.createElement('div');
      swatches.className = 'stage-controls-row';
      palette.forEach((col, idx) => {
        const b = document.createElement('button');
        b.className = 'cell-btn';
        b.style.width = '46px';
        b.style.height = '46px';
        b.style.background = col;
        b.style.border = board[0][0] === idx ? '3px solid #ffffff' : '2px solid #1e293b';
        b.setAttribute('aria-label', `Color ${idx + 1}`);
        b.onclick = () => flood(idx);
        swatches.appendChild(b);
      });
      root.appendChild(swatches);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'New Board';
      resetBtn.onclick = reset;
      controls.appendChild(resetBtn);
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') reset();
    });

    reset();
  }
};
