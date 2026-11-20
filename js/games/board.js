// 6 Original Board & Card Games (AI Bots + Local Play)
import { shuffleArray } from './utils.js';

export const BOARD_GAMES = {
  // 17. TIC-TAC-TOE PRO
  tictactoe(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let board = Array(9).fill('');
    let turn = 'X';
    let vsAI = true;
    let winner = null;
    let score = 0;
    let timerId = 0;

    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    function checkWin(b) {
      for (const [a, c, d] of wins) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
      }
      return b.every(Boolean) ? 'DRAW' : null;
    }

    function minimax(b, isMax) {
      const w = checkWin(b);
      if (w === 'O') return 10;
      if (w === 'X') return -10;
      if (w === 'DRAW') return 0;
      let best = isMax ? -Infinity : Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = isMax ? 'O' : 'X';
          const val = minimax(b, !isMax);
          b[i] = '';
          best = isMax ? Math.max(best, val) : Math.min(best, val);
        }
      }
      return best;
    }

    function aiMove() {
      if (winner) return;
      let bestVal = -Infinity;
      let bestMove = -1;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'O';
          const val = minimax(board, false);
          board[i] = '';
          if (val > bestVal) {
            bestVal = val;
            bestMove = i;
          }
        }
      }
      if (bestMove !== -1) playCell(bestMove, true);
    }

    function playCell(idx, fromAI = false) {
      if (board[idx] || winner) return;
      if (vsAI && turn === 'O' && !fromAI) return;
      board[idx] = turn;
      ctx.audio.click();
      winner = checkWin(board);
      if (winner) {
        if (winner === 'X') {
          score += 100;
          ctx.setScore(score);
          ctx.saveBest(score);
          ctx.audio.win();
        } else if (winner === 'DRAW') {
          score += 25;
          ctx.setScore(score);
          ctx.saveBest(score);
        } else {
          ctx.audio.error();
        }
      } else {
        turn = turn === 'X' ? 'O' : 'X';
        if (vsAI && turn === 'O') {
          timerId = setTimeout(aiMove, 420);
        }
      }
      render();
    }

    function reset() {
      clearTimeout(timerId);
      board = Array(9).fill('');
      turn = 'X';
      winner = null;
      ctx.setMeta('Mode', vsAI ? 'Solo vs AI' : '2P Local');
      render();
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${
        winner === 'DRAW' ? 'Match Drawn!' : winner ? `${winner} Wins!` : `${turn}'s Turn`
      }</span><span>${vsAI ? 'vs Minimax AI' : '2-Player'}</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(3, 86px)';
      grid.style.gap = '8px';

      board.forEach((val, idx) => {
        const btn = document.createElement('button');
        btn.className = 'cell-btn';
        btn.style.height = '86px';
        btn.style.fontSize = '2rem';
        btn.style.background = '#0f172a';
        btn.style.color = val === 'X' ? '#38bdf8' : '#fbbf24';
        btn.textContent = val;
        btn.onclick = () => playCell(idx);
        grid.appendChild(btn);
      });
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const modeBtn = document.createElement('button');
      modeBtn.className = 'stage-btn';
      modeBtn.textContent = vsAI ? 'Switch to 2-Player' : 'Switch to vs AI';
      modeBtn.onclick = () => { vsAI = !vsAI; reset(); };

      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'New Round';
      resetBtn.onclick = reset;

      controls.append(modeBtn, resetBtn);
      root.appendChild(controls);
    }

    ctx.onCleanup(() => clearTimeout(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart') reset();
      if (action === 'action') { vsAI = !vsAI; reset(); }
    });
    reset();
  },

  // 18. CONNECT FOUR
  connect4(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const rows = 6, cols = 7;
    let board = [];
    let turn = 1; // 1 = Player (Red), 2 = AI (Yellow)
    let winner = 0; // 0 none, 1 p1, 2 ai, 3 draw
    let score = 0;
    let timerId = 0;

    function lowestRow(c) {
      for (let r = rows - 1; r >= 0; r--) {
        if (board[r][c] === 0) return r;
      }
      return -1;
    }

    function checkWin(p) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c] !== p) continue;
          const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
          for (const [dr, dc] of dirs) {
            let count = 1;
            for (let k = 1; k < 4; k++) {
              const nr = r + dr * k, nc = c + dc * k;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === p) count++;
              else break;
            }
            if (count === 4) return true;
          }
        }
      }
      return false;
    }

    function aiTurn() {
      if (winner) return;
      const validCols = [];
      for (let c = 0; c < cols; c++) if (lowestRow(c) !== -1) validCols.push(c);
      if (!validCols.length) return;

      // Win immediately or block player win
      let pick = -1;
      for (const p of [2, 1]) {
        for (const c of validCols) {
          const r = lowestRow(c);
          board[r][c] = p;
          if (checkWin(p)) pick = c;
          board[r][c] = 0;
          if (pick !== -1) break;
        }
        if (pick !== -1) break;
      }
      if (pick === -1) {
        validCols.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
        pick = Math.random() < 0.7 ? validCols[0] : validCols[Math.floor(Math.random() * validCols.length)];
      }
      drop(pick, true);
    }

    function drop(col, fromAI = false) {
      if (winner) return;
      if (turn === 2 && !fromAI) return;
      const r = lowestRow(col);
      if (r === -1) return;
      board[r][col] = turn;
      ctx.audio.bounce();

      if (checkWin(turn)) {
        winner = turn;
        if (winner === 1) {
          score += 150;
          ctx.setScore(score);
          ctx.saveBest(score);
          ctx.audio.win();
        } else {
          ctx.audio.error();
        }
      } else if (board[0].every((v) => v !== 0)) {
        winner = 3;
      } else {
        turn = turn === 1 ? 2 : 1;
        if (turn === 2) timerId = setTimeout(aiTurn, 480);
      }
      render();
    }

    function reset() {
      clearTimeout(timerId);
      board = Array.from({ length: rows }, () => Array(cols).fill(0));
      turn = 1;
      winner = 0;
      ctx.setMeta('Opponent', 'Smart Bot');
      render();
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.textContent =
        winner === 1 ? 'You Connected Four! (+150)' :
        winner === 2 ? 'Bot Connected Four!' :
        winner === 3 ? 'Draw Match!' :
        turn === 1 ? 'Your Turn (Red) — Tap any column' : 'Bot is thinking...';
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = `repeat(${cols}, minmax(38px, 48px))`;
      grid.style.background = '#1e3a8a';
      grid.style.gap = '6px';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = board[r][c];
          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.height = '46px';
          btn.style.borderRadius = '50%';
          btn.style.background = val === 1 ? '#ef4444' : val === 2 ? '#fbbf24' : '#0f172a';
          btn.setAttribute('aria-label', `Column ${c + 1}`);
          btn.onclick = () => drop(c);
          grid.appendChild(btn);
        }
      }
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'New Match';
      resetBtn.onclick = reset;
      controls.appendChild(resetBtn);
      root.appendChild(controls);
    }

    ctx.onCleanup(() => clearTimeout(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') reset();
    });
    reset();
  },

  // 19. REVERSI / OTHELLO
  reversi(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const size = 8;
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let board = [];
    let turn = 1; // 1 = Black (Player), 2 = White (AI)
    let over = false;
    let timerId = 0;

    function flipsFor(r, c, player) {
      if (board[r][c] !== 0) return [];
      const opp = player === 1 ? 2 : 1;
      const all = [];
      for (const [dr, dc] of dirs) {
        const line = [];
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === opp) {
          line.push([nr, nc]);
          nr += dr;
          nc += dc;
        }
        if (line.length && nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === player) {
          all.push(...line);
        }
      }
      return all;
    }

    function validMoves(player) {
      const list = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const flips = flipsFor(r, c, player);
          if (flips.length) list.push({ r, c, flips });
        }
      }
      return list;
    }

    function aiTurn() {
      const moves = validMoves(2);
      if (!moves.length) {
        turn = 1;
        if (!validMoves(1).length) finishGame();
        render();
        return;
      }
      // Prefer corners, then max flips
      moves.sort((a, b) => {
        const ac = (a.r === 0 || a.r === 7) && (a.c === 0 || a.c === 7) ? 100 : 0;
        const bc = (b.r === 0 || b.r === 7) && (b.c === 0 || b.c === 7) ? 100 : 0;
        return (bc + b.flips.length) - (ac + a.flips.length);
      });
      const pick = moves[0];
      applyMove(pick.r, pick.c, 2, pick.flips);
    }

    function finishGame() {
      over = true;
      const counts = countDiscs();
      if (counts.p1 > counts.p2) {
        ctx.audio.win();
        ctx.saveBest(counts.p1 * 10);
      }
    }

    function countDiscs() {
      let p1 = 0, p2 = 0;
      board.flat().forEach((v) => { if (v === 1) p1++; if (v === 2) p2++; });
      return { p1, p2 };
    }

    function applyMove(r, c, player, flips) {
      board[r][c] = player;
      flips.forEach(([fr, fc]) => (board[fr][fc] = player));
      ctx.audio.click();
      const counts = countDiscs();
      ctx.setScore(counts.p1 * 10);
      ctx.setMeta('Discs', `You ${counts.p1} - ${counts.p2} AI`);

      const next = player === 1 ? 2 : 1;
      if (validMoves(next).length) {
        turn = next;
        if (turn === 2) timerId = setTimeout(aiTurn, 500);
      } else if (validMoves(player).length) {
        turn = player;
        if (turn === 2) timerId = setTimeout(aiTurn, 500);
      } else {
        finishGame();
      }
      render();
    }

    function reset() {
      clearTimeout(timerId);
      board = Array.from({ length: size }, () => Array(size).fill(0));
      board[3][3] = 2; board[3][4] = 1;
      board[4][3] = 1; board[4][4] = 2;
      turn = 1;
      over = false;
      ctx.setScore(20);
      ctx.setMeta('Discs', 'You 2 - 2 AI');
      render();
    }

    function render() {
      root.innerHTML = '';
      const counts = countDiscs();
      const moves = turn === 1 && !over ? validMoves(1) : [];
      const moveSet = new Map(moves.map((m) => [`${m.r},${m.c}`, m.flips]));

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${
        over ? (counts.p1 >= counts.p2 ? 'You Won!' : 'AI Won!') : turn === 1 ? 'Your Turn (Dark Disc)' : 'AI Thinking...'
      }</span><span>${counts.p1} : ${counts.p2}</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = `repeat(${size}, minmax(34px, 42px))`;
      grid.style.background = '#14532d';
      grid.style.gap = '3px';

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const val = board[r][c];
          const valid = moveSet.get(`${r},${c}`);
          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.minWidth = '34px';
          btn.style.height = '40px';
          btn.style.background = '#166534';
          if (val === 1 || val === 2) {
            const disc = document.createElement('span');
            disc.style.width = '28px';
            disc.style.height = '28px';
            disc.style.borderRadius = '50%';
            disc.style.background = val === 1 ? '#0f172a' : '#f8fafc';
            disc.style.border = '2px solid rgba(255,255,255,0.25)';
            btn.appendChild(disc);
          } else if (valid) {
            const dot = document.createElement('span');
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.borderRadius = '50%';
            dot.style.background = 'rgba(255,255,255,0.35)';
            btn.appendChild(dot);
            btn.onclick = () => applyMove(r, c, 1, valid);
          }
          grid.appendChild(btn);
        }
      }
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'New Match';
      resetBtn.onclick = reset;
      controls.appendChild(resetBtn);
      root.appendChild(controls);
    }

    ctx.onCleanup(() => clearTimeout(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') reset();
    });
    reset();
  },

  // 20. CHECKERS
  checkers(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    // 0 empty, 1 player, 2 player king, 3 ai, 4 ai king
    let board = [];
    let selected = null;
    let turn = 'P'; // P | AI
    let score = 0;
    let winner = null;
    let timerId = 0;

    function isPlayer(v) { return v === 1 || v === 2; }
    function isAI(v) { return v === 3 || v === 4; }
    function isKing(v) { return v === 2 || v === 4; }

    function movesForPiece(r, c) {
      const v = board[r][c];
      if (!v) return [];
      const playerSide = isPlayer(v);
      const dirs = [];
      if (playerSide || isKing(v)) dirs.push([-1, -1], [-1, 1]);
      if (!playerSide || isKing(v)) dirs.push([1, -1], [1, 1]);

      const moves = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (board[nr][nc] === 0) {
            moves.push({ r: nr, c: nc, jump: null });
          } else if (playerSide ? isAI(board[nr][nc]) : isPlayer(board[nr][nc])) {
            const jr = nr + dr, jc = nc + dc;
            if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[jr][jc] === 0) {
              moves.push({ r: jr, c: jc, jump: [nr, nc] });
            }
          }
        }
      }
      return moves;
    }

    function allMoves(side) {
      const list = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const v = board[r][c];
          if ((side === 'P' && isPlayer(v)) || (side === 'AI' && isAI(v))) {
            movesForPiece(r, c).forEach((m) => list.push({ fromR: r, fromC: c, ...m }));
          }
        }
      }
      const jumps = list.filter((m) => m.jump);
      return jumps.length ? jumps : list;
    }

    function executeMove(m) {
      let piece = board[m.fromR][m.fromC];
      board[m.fromR][m.fromC] = 0;
      if (m.jump) {
        board[m.jump[0]][m.jump[1]] = 0;
        if (isPlayer(piece)) {
          score += 50;
          ctx.setScore(score);
          ctx.saveBest(score);
        }
      }
      if (piece === 1 && m.r === 0) piece = 2;
      if (piece === 3 && m.r === 7) piece = 4;
      board[m.r][m.c] = piece;
      ctx.audio.click();

      const next = turn === 'P' ? 'AI' : 'P';
      if (!allMoves(next).length) {
        winner = turn;
        if (winner === 'P') {
          score += 200;
          ctx.setScore(score);
          ctx.saveBest(score);
          ctx.audio.win();
        } else {
          ctx.audio.error();
        }
      } else {
        turn = next;
        if (turn === 'AI') {
          timerId = setTimeout(() => {
            const aiList = allMoves('AI');
            if (aiList.length) {
              const pick = aiList[Math.floor(Math.random() * aiList.length)];
              executeMove(pick);
            }
          }, 500);
        }
      }
      selected = null;
      render();
    }

    function reset() {
      clearTimeout(timerId);
      board = Array.from({ length: 8 }, () => Array(8).fill(0));
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) board[r][c] = 3;
      }
      for (let r = 5; r < 8; r++) {
        for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) board[r][c] = 1;
      }
      selected = null;
      turn = 'P';
      winner = null;
      score = 0;
      ctx.setScore(0);
      ctx.setMeta('Side', 'Red Pieces');
      render();
    }

    function render() {
      root.innerHTML = '';
      const legal = turn === 'P' && !winner ? allMoves('P') : [];
      const selectedMoves = selected ? legal.filter((m) => m.fromR === selected[0] && m.fromC === selected[1]) : [];

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.textContent =
        winner === 'P' ? 'Victory! You cleared the board!' :
        winner === 'AI' ? 'AI Won this round!' :
        turn === 'P' ? 'Your Turn (Red) — Tap piece then target square' : 'AI Moving...';
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(8, minmax(34px, 42px))';
      grid.style.gap = '2px';

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const dark = (r + c) % 2 === 1;
          const v = board[r][c];
          const isSel = selected && selected[0] === r && selected[1] === c;
          const targetMove = selectedMoves.find((m) => m.r === r && m.c === c);

          const btn = document.createElement('button');
          btn.className = 'cell-btn';
          btn.style.minWidth = '34px';
          btn.style.height = '40px';
          btn.style.background = isSel ? '#2563eb' : targetMove ? '#059669' : dark ? '#334155' : '#cbd5e1';

          if (v) {
            const disc = document.createElement('span');
            disc.style.width = '26px';
            disc.style.height = '26px';
            disc.style.borderRadius = '50%';
            disc.style.display = 'flex';
            disc.style.alignItems = 'center';
            disc.style.justifyContent = 'center';
            disc.style.fontSize = '0.75rem';
            disc.style.background = isPlayer(v) ? '#dc2626' : '#f8fafc';
            disc.style.color = isPlayer(v) ? '#ffffff' : '#0f172a';
            disc.style.border = '2px solid rgba(15,23,42,0.4)';
            disc.textContent = isKing(v) ? '★' : '';
            btn.appendChild(disc);
          }

          btn.onclick = () => {
            if (turn !== 'P' || winner) return;
            if (targetMove) return executeMove(targetMove);
            if (isPlayer(v) && legal.some((m) => m.fromR === r && m.fromC === c)) {
              selected = [r, c];
              render();
            }
          };
          grid.appendChild(btn);
        }
      }
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'New Match';
      resetBtn.onclick = reset;
      controls.appendChild(resetBtn);
      root.appendChild(controls);
    }

    ctx.onCleanup(() => clearTimeout(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') reset();
    });
    reset();
  },

  // 21. MEMORY MATCH
  memory(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const symbols = ['★', '◆', '▲', '●', '✚', '❖', '☀', '☾'];
    let cards = [];
    let flipped = [];
    let lock = false;
    let turns = 0;
    let score = 0;
    let timerId = 0;

    function reset() {
      clearTimeout(timerId);
      const deck = shuffleArray([...symbols, ...symbols]);
      cards = deck.map((sym, idx) => ({ id: idx, sym, matched: false, open: false }));
      flipped = [];
      lock = false;
      turns = 0;
      score = 0;
      ctx.setScore(0);
      ctx.setMeta('Turns', 0);
      render();
    }

    function flipCard(idx) {
      if (lock) return;
      const card = cards[idx];
      if (card.open || card.matched) return;
      card.open = true;
      flipped.push(idx);
      ctx.audio.click();
      render();

      if (flipped.length === 2) {
        turns++;
        ctx.setMeta('Turns', turns);
        const [a, b] = flipped;
        if (cards[a].sym === cards[b].sym) {
          cards[a].matched = true;
          cards[b].matched = true;
          score += 50;
          flipped = [];
          ctx.audio.score();
          if (cards.every((c) => c.matched)) {
            score += Math.max(50, 300 - turns * 10);
            ctx.audio.win();
          }
          ctx.setScore(score);
          ctx.saveBest(score);
          render();
        } else {
          lock = true;
          timerId = setTimeout(() => {
            cards[a].open = false;
            cards[b].open = false;
            flipped = [];
            lock = false;
            render();
          }, 680);
        }
      }
    }

    function render() {
      root.innerHTML = '';
      const matchedPairs = cards.filter((c) => c.matched).length / 2;
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${matchedPairs === 8 ? 'All Pairs Matched!' : 'Find all 8 matching pairs'}</span><span>Pairs: ${matchedPairs}/8</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(4, minmax(60px, 72px))';
      grid.style.gap = '8px';

      cards.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = 'cell-btn';
        btn.style.height = '68px';
        btn.style.fontSize = '1.5rem';
        if (c.matched) {
          btn.style.background = '#059669';
          btn.style.color = '#ffffff';
          btn.textContent = c.sym;
        } else if (c.open) {
          btn.style.background = '#2563eb';
          btn.style.color = '#ffffff';
          btn.textContent = c.sym;
        } else {
          btn.style.background = '#334155';
          btn.style.color = '#94a3b8';
          btn.textContent = '?';
        }
        btn.onclick = () => flipCard(idx);
        grid.appendChild(btn);
      });
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const resetBtn = document.createElement('button');
      resetBtn.className = 'stage-btn primary';
      resetBtn.textContent = 'Shuffle New Deck';
      resetBtn.onclick = reset;
      controls.appendChild(resetBtn);
      root.appendChild(controls);
    }

    ctx.onCleanup(() => clearTimeout(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') reset();
    });
    reset();
  },

  // 22. BLACKJACK 21 (Virtual Points Only — No Real Money)
  blackjack(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [], player = [], dealer = [], bank = 500, stake = 50;
    let phase = 'BET'; // BET | PLAY | END
    let message = 'Virtual Points Blackjack · Tap Deal to start';

    function makeDeck() {
      const d = [];
      for (const s of suits) for (const r of ranks) d.push({ s, r });
      return shuffleArray(d);
    }

    function handVal(hand) {
      let total = 0, aces = 0;
      for (const c of hand) {
        if (c.r === 'A') { aces++; total += 11; }
        else if (['J', 'Q', 'K'].includes(c.r)) total += 10;
        else total += Number(c.r);
      }
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      return total;
    }

    function deal() {
      if (bank <= 0) bank = 500;
      stake = Math.min(50, bank);
      deck = makeDeck();
      player = [deck.pop(), deck.pop()];
      dealer = [deck.pop(), deck.pop()];
      phase = 'PLAY';
      message = 'Hit to draw or Stand to hold';
      ctx.audio.click();
      if (handVal(player) === 21) stand();
      else render();
    }

    function hit() {
      if (phase !== 'PLAY') return;
      player.push(deck.pop());
      ctx.audio.click();
      if (handVal(player) > 21) {
        phase = 'END';
        bank -= stake;
        message = 'Bust! Over 21.';
        ctx.audio.error();
        syncBank();
      }
      render();
    }

    function stand() {
      if (phase !== 'PLAY') return;
      while (handVal(dealer) < 17) dealer.push(deck.pop());
      const pv = handVal(player), dv = handVal(dealer);
      phase = 'END';
      if (dv > 21 || pv > dv) {
        bank += stake;
        message = `You Win +${stake} pts!`;
        ctx.audio.win();
      } else if (pv === dv) {
        message = 'Push (Tie) — Stake returned.';
      } else {
        bank -= stake;
        message = `Dealer wins (${dv} vs ${pv}).`;
        ctx.audio.error();
      }
      syncBank();
      render();
    }

    function syncBank() {
      ctx.setScore(bank);
      ctx.saveBest(bank);
      ctx.setMeta('Virtual Pts', bank);
    }

    function cardEl(c, hidden = false) {
      const el = document.createElement('div');
      el.style.width = '58px';
      el.style.height = '82px';
      el.style.borderRadius = '8px';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = '700';
      el.style.fontSize = '1.1rem';
      if (hidden) {
        el.style.background = '#1e3a8a';
        el.style.border = '2px solid #60a5fa';
        el.style.color = '#93c5fd';
        el.textContent = '★';
      } else {
        const isRed = c.s === '♥' || c.s === '♦';
        el.style.background = '#ffffff';
        el.style.color = isRed ? '#dc2626' : '#0f172a';
        el.innerHTML = `<span>${c.r}</span><span>${c.s}</span>`;
      }
      return el;
    }

    function render() {
      root.innerHTML = '';
      syncBank();

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${message}</span><span>Pts: ${bank}</span>`;
      root.appendChild(banner);

      const table = document.createElement('div');
      table.style.width = '100%';
      table.style.background = '#14532d';
      table.style.borderRadius = '10px';
      table.style.padding = '18px';
      table.style.display = 'flex';
      table.style.flexDirection = 'column';
      table.style.gap = '16px';

      const dLabel = document.createElement('div');
      dLabel.style.fontSize = '0.875rem';
      dLabel.style.fontWeight = '600';
      dLabel.textContent = `Dealer Hand ${phase === 'PLAY' ? '(?)' : dealer.length ? `(${handVal(dealer)})` : ''}`;
      table.appendChild(dLabel);

      const dRow = document.createElement('div');
      dRow.style.display = 'flex';
      dRow.style.gap = '8px';
      dRow.style.minHeight = '82px';
      dealer.forEach((c, idx) => dRow.appendChild(cardEl(c, phase === 'PLAY' && idx === 1)));
      table.appendChild(dRow);

      const pLabel = document.createElement('div');
      pLabel.style.fontSize = '0.875rem';
      pLabel.style.fontWeight = '600';
      pLabel.textContent = `Your Hand ${player.length ? `(${handVal(player)})` : ''}`;
      table.appendChild(pLabel);

      const pRow = document.createElement('div');
      pRow.style.display = 'flex';
      pRow.style.gap = '8px';
      pRow.style.minHeight = '82px';
      player.forEach((c) => pRow.appendChild(cardEl(c, false)));
      table.appendChild(pRow);

      root.appendChild(table);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      if (phase === 'PLAY') {
        const hitBtn = document.createElement('button');
        hitBtn.className = 'stage-btn primary';
        hitBtn.textContent = 'Hit';
        hitBtn.onclick = hit;
        const standBtn = document.createElement('button');
        standBtn.className = 'stage-btn';
        standBtn.textContent = 'Stand';
        standBtn.onclick = stand;
        controls.append(hitBtn, standBtn);
      } else {
        const dealBtn = document.createElement('button');
        dealBtn.className = 'stage-btn primary';
        dealBtn.textContent = bank <= 0 ? 'Refill 500 Pts & Deal' : 'Deal Hand (50 Pts)';
        dealBtn.onclick = deal;
        controls.appendChild(dealBtn);
      }
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') {
        if (phase !== 'PLAY') deal();
        else hit();
      }
    });
    render();
  }
};
