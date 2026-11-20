// 5 Original Word & Brain Training Games
import { shuffleArray } from './utils.js';

export const BRAIN_GAMES = {
  // 23. WORD GUESS (5-Letter)
  wordguess(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const words = [
      'CRANE', 'SLATE', 'BRAVE', 'LIGHT', 'STONE', 'PLANT', 'CLOUD', 'TRAIN', 'SPARK', 'FLAME',
      'QUEST', 'FRAME', 'GLIDE', 'PRISM', 'CHESS', 'SMART', 'BOARD', 'TRACK', 'PIXEL', 'WORLD',
      'GRACE', 'OCEAN', 'RIVER', 'SWIFT', 'CROWN', 'BLAST', 'SHIFT', 'SCORE', 'BRICK', 'PULSE'
    ];

    let target = '';
    let rows = [];
    let current = '';
    let status = 'PLAYING'; // PLAYING | WON | LOST
    let score = 0;

    function newWord() {
      target = words[Math.floor(Math.random() * words.length)];
      rows = [];
      current = '';
      status = 'PLAYING';
      ctx.setMeta('Attempts', '0 / 6');
      render();
    }

    function letterStatus(rowWord) {
      const res = Array(5).fill('miss');
      const avail = target.split('');
      for (let i = 0; i < 5; i++) {
        if (rowWord[i] === target[i]) {
          res[i] = 'exact';
          avail[i] = null;
        }
      }
      for (let i = 0; i < 5; i++) {
        if (res[i] === 'exact') continue;
        const idx = avail.indexOf(rowWord[i]);
        if (idx !== -1) {
          res[i] = 'near';
          avail[idx] = null;
        }
      }
      return res;
    }

    function submit() {
      if (status !== 'PLAYING' || current.length !== 5) return;
      rows.push(current);
      ctx.setMeta('Attempts', `${rows.length} / 6`);
      if (current === target) {
        status = 'WON';
        score += (7 - rows.length) * 50;
        ctx.setScore(score);
        ctx.saveBest(score);
        ctx.audio.win();
      } else if (rows.length >= 6) {
        status = 'LOST';
        ctx.audio.error();
      } else {
        ctx.audio.click();
      }
      current = '';
      render();
    }

    function pressKey(ch) {
      if (status !== 'PLAYING') return;
      if (ch === 'BACK') {
        current = current.slice(0, -1);
        render();
      } else if (ch === 'ENTER') {
        submit();
      } else if (/^[A-Z]$/.test(ch) && current.length < 5) {
        current += ch;
        ctx.audio.tone(420, 0.03, 'sine', 0.04);
        render();
      }
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.textContent =
        status === 'WON' ? `Solved! Word was ${target}` :
        status === 'LOST' ? `Out of tries — Word was ${target}` :
        'Guess the 5-letter word in 6 tries';
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(5, 48px)';
      grid.style.gap = '6px';

      for (let r = 0; r < 6; r++) {
        const word = r < rows.length ? rows[r] : r === rows.length ? current : '';
        const states = r < rows.length ? letterStatus(word) : [];
        for (let c = 0; c < 5; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell-btn';
          cell.style.height = '48px';
          cell.style.fontSize = '1.2rem';
          const st = states[c];
          cell.style.background =
            st === 'exact' ? '#059669' :
            st === 'near' ? '#d97706' :
            st === 'miss' ? '#334155' : '#0f172a';
          cell.style.border = '1px solid #475569';
          cell.style.color = '#ffffff';
          cell.textContent = word[c] || '';
          grid.appendChild(cell);
        }
      }
      root.appendChild(grid);

      // Keyboard
      const keyRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
      const kbWrap = document.createElement('div');
      kbWrap.style.display = 'flex';
      kbWrap.style.flexDirection = 'column';
      kbWrap.style.gap = '6px';
      kbWrap.style.width = '100%';

      keyRows.forEach((kr, idx) => {
        const rowEl = document.createElement('div');
        rowEl.style.display = 'flex';
        rowEl.style.justifyContent = 'center';
        rowEl.style.gap = '4px';
        if (idx === 2) {
          const ent = document.createElement('button');
          ent.className = 'stage-btn primary';
          ent.style.padding = '6px 10px';
          ent.textContent = 'GO';
          ent.onclick = () => pressKey('ENTER');
          rowEl.appendChild(ent);
        }
        kr.split('').forEach((ch) => {
          const b = document.createElement('button');
          b.className = 'stage-btn';
          b.style.padding = '6px 9px';
          b.style.minWidth = '30px';
          b.textContent = ch;
          b.onclick = () => pressKey(ch);
          rowEl.appendChild(b);
        });
        if (idx === 2) {
          const bk = document.createElement('button');
          bk.className = 'stage-btn';
          bk.style.padding = '6px 10px';
          bk.textContent = '⌫';
          bk.onclick = () => pressKey('BACK');
          rowEl.appendChild(bk);
        }
        kbWrap.appendChild(rowEl);
      });
      root.appendChild(kbWrap);

      if (status !== 'PLAYING') {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'stage-btn primary';
        nextBtn.textContent = 'Next Word';
        nextBtn.onclick = newWord;
        root.appendChild(nextBtn);
      }
    }

    const onKey = (e) => {
      if (e.key === 'Enter') pressKey('ENTER');
      else if (e.key === 'Backspace') pressKey('BACK');
      else if (/^[a-zA-Z]$/.test(e.key)) pressKey(e.key.toUpperCase());
    };
    window.addEventListener('keydown', onKey);
    ctx.onCleanup(() => window.removeEventListener('keydown', onKey));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') newWord();
    });
    newWord();
  },

  // 24. MATH BLITZ
  'math-blitz'(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let score = 0, streak = 0, timeLeft = 45, state = 'TITLE', question = null, timerId = 0;

    function nextQ() {
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a = 2 + Math.floor(Math.random() * 16);
      let b = 2 + Math.floor(Math.random() * 14);
      if (op === '-' && a < b) [a, b] = [b, a];
      if (op === '×') { a = 2 + Math.floor(Math.random() * 11); b = 2 + Math.floor(Math.random() * 11); }
      const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
      const choices = new Set([ans]);
      while (choices.size < 4) {
        const delta = Math.floor(Math.random() * 11) - 5;
        if (delta !== 0 && ans + delta >= 0) choices.add(ans + delta);
      }
      question = { text: `${a} ${op} ${b} = ?`, ans, opts: shuffleArray(Array.from(choices)) };
      render();
    }

    function start() {
      clearInterval(timerId);
      score = 0;
      streak = 0;
      timeLeft = 45;
      state = 'PLAYING';
      ctx.setScore(0);
      ctx.setMeta('Time', '45s');
      nextQ();
      timerId = setInterval(() => {
        timeLeft--;
        ctx.setMeta('Time', `${timeLeft}s`);
        if (timeLeft <= 0) {
          clearInterval(timerId);
          state = 'OVER';
          ctx.audio.win();
          ctx.saveBest(score);
          render();
        }
      }, 1000);
    }

    function answer(val) {
      if (state !== 'PLAYING') return;
      if (val === question.ans) {
        streak++;
        score += 10 + Math.min(20, streak * 2);
        ctx.audio.score();
      } else {
        streak = 0;
        score = Math.max(0, score - 5);
        ctx.audio.error();
      }
      ctx.setScore(score);
      ctx.saveBest(score);
      nextQ();
    }

    function render() {
      root.innerHTML = '';
      if (state === 'TITLE' || state === 'OVER') {
        const card = document.createElement('div');
        card.className = 'stage-banner';
        card.style.flexDirection = 'column';
        card.style.padding = '28px';
        card.innerHTML = `<h3 style="font-size:1.5rem">${state === 'OVER' ? 'Time Up!' : 'Math Blitz'}</h3>
          <p>${state === 'OVER' ? `Final Score: ${score}` : 'Solve fast mental math prompts in 45 seconds.'}</p>`;
        const btn = document.createElement('button');
        btn.className = 'stage-btn primary';
        btn.textContent = state === 'OVER' ? 'Play Again' : 'Start 45s Sprint';
        btn.onclick = start;
        card.appendChild(btn);
        root.appendChild(card);
        return;
      }

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>Streak: ${streak}</span><span>Time: ${timeLeft}s</span>`;
      root.appendChild(banner);

      const promptBox = document.createElement('div');
      promptBox.style.fontSize = '2.25rem';
      promptBox.style.fontWeight = '700';
      promptBox.style.padding = '24px 0';
      promptBox.textContent = question.text;
      root.appendChild(promptBox);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(2, minmax(120px, 160px))';
      grid.style.gap = '10px';
      question.opts.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'cell-btn';
        b.style.height = '60px';
        b.style.fontSize = '1.35rem';
        b.style.background = '#2563eb';
        b.style.color = '#ffffff';
        b.textContent = String(opt);
        b.onclick = () => answer(opt);
        grid.appendChild(b);
      });
      root.appendChild(grid);
    }

    ctx.onCleanup(() => clearInterval(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') start();
    });
    render();
  },

  // 25. SIMON ECHO
  simon(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const pads = [
      { id: 0, label: 'Green', color: '#10b981', lit: '#6ee7b7', freq: 330 },
      { id: 1, label: 'Red', color: '#ef4444', lit: '#fca5a5', freq: 440 },
      { id: 2, label: 'Amber', color: '#f59e0b', lit: '#fde68a', freq: 554 },
      { id: 3, label: 'Blue', color: '#3b82f6', lit: '#93c5fd', freq: 659 }
    ];

    let seq = [];
    let userIdx = 0;
    let activePad = -1;
    let phase = 'IDLE'; // IDLE | SHOW | INPUT | OVER
    let score = 0;
    let timers = [];

    function clearTimers() {
      timers.forEach((t) => clearTimeout(t));
      timers = [];
    }

    function flash(id, ms = 320) {
      activePad = id;
      ctx.audio.tone(pads[id].freq, 0.18, 'sine', 0.08);
      render();
      const t = setTimeout(() => {
        activePad = -1;
        render();
      }, ms);
      timers.push(t);
    }

    function nextRound() {
      seq.push(Math.floor(Math.random() * 4));
      userIdx = 0;
      phase = 'SHOW';
      ctx.setMeta('Round', seq.length);
      render();
      seq.forEach((id, i) => {
        const t = setTimeout(() => {
          flash(id, 300);
          if (i === seq.length - 1) {
            const t2 = setTimeout(() => {
              phase = 'INPUT';
              render();
            }, 380);
            timers.push(t2);
          }
        }, 520 * (i + 1));
        timers.push(t);
      });
    }

    function start() {
      clearTimers();
      seq = [];
      score = 0;
      ctx.setScore(0);
      nextRound();
    }

    function tapPad(id) {
      if (phase !== 'INPUT') return;
      flash(id, 220);
      if (seq[userIdx] === id) {
        userIdx++;
        if (userIdx === seq.length) {
          score = seq.length * 25;
          ctx.setScore(score);
          ctx.saveBest(score);
          phase = 'SHOW';
          const t = setTimeout(nextRound, 650);
          timers.push(t);
        }
      } else {
        phase = 'OVER';
        ctx.audio.error();
        render();
      }
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.textContent =
        phase === 'IDLE' ? 'Press Start to watch the color sequence' :
        phase === 'SHOW' ? 'Watch carefully...' :
        phase === 'INPUT' ? `Your turn (${userIdx}/${seq.length})` :
        `Wrong pad! Reached Round ${seq.length}`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(2, 128px)';
      grid.style.gap = '12px';

      pads.forEach((p) => {
        const b = document.createElement('button');
        b.className = 'cell-btn';
        b.style.height = '112px';
        b.style.background = activePad === p.id ? p.lit : p.color;
        b.style.color = '#0f172a';
        b.textContent = p.label;
        b.onclick = () => tapPad(p.id);
        grid.appendChild(b);
      });
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const btn = document.createElement('button');
      btn.className = 'stage-btn primary';
      btn.textContent = phase === 'IDLE' ? 'Start Sequence' : 'Restart';
      btn.onclick = start;
      controls.appendChild(btn);
      root.appendChild(controls);
    }

    ctx.onCleanup(clearTimers);
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') start();
    });
    render();
  },

  // 26. SCRAMBLE SOLVER
  scramble(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const bank = [
      'PLANET', 'ROCKET', 'BRIDGE', 'CASTLE', 'GARDEN', 'SILVER', 'STREAM', 'PUZZLE',
      'ANCHOR', 'BEACON', 'MIRROR', 'FOREST', 'POCKET', 'GUITAR', 'ISLAND', 'VECTOR',
      'COBALT', 'FROZEN', 'LANTERN', 'COMPASS', 'HORIZON', 'CRYSTAL'
    ];
    let target = '', pool = [], picked = [], score = 0, solvedCount = 0;

    function nextWord() {
      target = bank[Math.floor(Math.random() * bank.length)];
      let letters = shuffleArray(target.split(''));
      if (letters.join('') === target) letters.reverse();
      pool = letters.map((ch, idx) => ({ id: idx, ch, used: false }));
      picked = [];
      ctx.setMeta('Solved', solvedCount);
      render();
    }

    function pickTile(id) {
      const item = pool.find((x) => x.id === id);
      if (!item || item.used) return;
      item.used = true;
      picked.push(item);
      ctx.audio.click();
      checkAnswer();
      render();
    }

    function returnTile(pos) {
      const item = picked[pos];
      if (!item) return;
      item.used = false;
      picked.splice(pos, 1);
      ctx.audio.click();
      render();
    }

    function checkAnswer() {
      if (picked.length === target.length) {
        const guess = picked.map((x) => x.ch).join('');
        if (guess === target) {
          score += target.length * 15;
          solvedCount++;
          ctx.audio.win();
          ctx.setScore(score);
          ctx.saveBest(score);
          setTimeout(nextWord, 450);
        } else {
          ctx.audio.error();
        }
      }
    }

    function hint() {
      const pos = picked.length;
      if (pos >= target.length) return;
      const needed = target[pos];
      const item = pool.find((x) => !x.used && x.ch === needed);
      if (item) pickTile(item.id);
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>Unscramble the ${target.length}-letter word</span><span>Solved: ${solvedCount}</span>`;
      root.appendChild(banner);

      const slots = document.createElement('div');
      slots.className = 'stage-controls-row';
      for (let i = 0; i < target.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'cell-btn';
        btn.style.minWidth = '44px';
        btn.style.height = '48px';
        btn.style.background = picked[i] ? '#2563eb' : '#0f172a';
        btn.style.border = '1px solid #475569';
        btn.style.color = '#ffffff';
        btn.textContent = picked[i] ? picked[i].ch : '';
        btn.onclick = () => returnTile(i);
        slots.appendChild(btn);
      }
      root.appendChild(slots);

      const rack = document.createElement('div');
      rack.className = 'stage-controls-row';
      pool.forEach((item) => {
        const b = document.createElement('button');
        b.className = 'cell-btn';
        b.style.minWidth = '44px';
        b.style.height = '48px';
        b.style.background = item.used ? '#1e293b' : '#f8fafc';
        b.style.color = item.used ? '#475569' : '#0f172a';
        b.textContent = item.ch;
        b.disabled = item.used;
        b.onclick = () => pickTile(item.id);
        rack.appendChild(b);
      });
      root.appendChild(rack);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const hintBtn = document.createElement('button');
      hintBtn.className = 'stage-btn';
      hintBtn.textContent = 'Reveal Letter';
      hintBtn.onclick = hint;
      const skipBtn = document.createElement('button');
      skipBtn.className = 'stage-btn primary';
      skipBtn.textContent = 'Next Word';
      skipBtn.onclick = nextWord;
      controls.append(hintBtn, skipBtn);
      root.appendChild(controls);
    }

    ctx.registerInput((action) => {
      if (action === 'restart') nextWord();
      if (action === 'action') hint();
    });
    nextWord();
  },

  // 27. TRIVIA QUIZ
  trivia(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const bank = [
      { q: 'Which planet in our solar system has the most confirmed moons?', opts: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], ans: 1, note: 'Saturn leads with over 140 confirmed moons.' },
      { q: 'What does HTTP stand for on the World Wide Web?', opts: ['Hypertext Transfer Protocol', 'High Transmission Text Path', 'Hyper Terminal Type Port', 'Host Transport Protocol'], ans: 0, note: 'HTTP is the foundational protocol for web data transfer.' },
      { q: 'Which chemical element has the atomic symbol Au?', opts: ['Silver', 'Argon', 'Gold', 'Aluminum'], ans: 2, note: 'Au comes from the Latin word aurum, meaning gold.' },
      { q: 'In standard chess, which piece can leap over other pieces?', opts: ['Bishop', 'Rook', 'Queen', 'Knight'], ans: 3, note: 'Only the Knight jumps in an L-shape over occupied squares.' },
      { q: 'Which ocean is the deepest on Earth?', opts: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], ans: 2, note: 'The Mariana Trench in the Pacific reaches nearly 11,000 meters.' },
      { q: 'How many bits make up one single byte?', opts: ['4', '8', '16', '32'], ans: 1, note: 'One byte equals 8 binary bits.' },
      { q: 'Which gas makes up roughly 78% of Earth’s atmosphere?', opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], ans: 2, note: 'Nitrogen accounts for ~78%, while Oxygen is ~21%.' },
      { q: 'Who painted The Starry Night in 1889?', opts: ['Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 'Paul Cézanne'], ans: 1, note: 'Van Gogh painted it while staying in Saint-Rémy-de-Provence.' },
      { q: 'What is the square root of 144?', opts: ['11', '12', '13', '14'], ans: 1, note: '12 × 12 = 144.' },
      { q: 'Which continent contains the Sahara Desert?', opts: ['Asia', 'Australia', 'South America', 'Africa'], ans: 3, note: 'The Sahara spans most of Northern Africa.' },
      { q: 'Which instrument measures atmospheric pressure?', opts: ['Anemometer', 'Barometer', 'Hygrometer', 'Thermometer'], ans: 1, note: 'Barometers track air pressure to help forecast weather.' },
      { q: 'What is the boiling point of water at standard sea-level pressure?', opts: ['90°C', '100°C', '110°C', '120°C'], ans: 1, note: 'Pure water boils at 100°C (212°F) at 1 atmosphere.' }
    ];

    let deck = [], idx = 0, score = 0, picked = -1;

    function start() {
      deck = shuffleArray(bank).slice(0, 10);
      idx = 0;
      score = 0;
      picked = -1;
      ctx.setScore(0);
      ctx.setMeta('Question', '1 / 10');
      render();
    }

    function choose(optIdx) {
      if (picked !== -1) return;
      picked = optIdx;
      if (optIdx === deck[idx].ans) {
        score += 100;
        ctx.audio.score();
      } else {
        ctx.audio.error();
      }
      ctx.setScore(score);
      ctx.saveBest(score);
      render();
    }

    function next() {
      idx++;
      picked = -1;
      if (idx < deck.length) {
        ctx.setMeta('Question', `${idx + 1} / ${deck.length}`);
      } else {
        ctx.audio.win();
      }
      render();
    }

    function render() {
      root.innerHTML = '';
      if (idx >= deck.length) {
        const done = document.createElement('div');
        done.className = 'stage-banner';
        done.style.flexDirection = 'column';
        done.style.padding = '28px';
        done.innerHTML = `<h3 style="font-size:1.5rem">Quiz Complete</h3>
          <p>You scored ${score} out of 1000 points.</p>`;
        const btn = document.createElement('button');
        btn.className = 'stage-btn primary';
        btn.textContent = 'Play New Quiz';
        btn.onclick = start;
        done.appendChild(btn);
        root.appendChild(done);
        return;
      }

      const item = deck[idx];
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>Question ${idx + 1} of ${deck.length}</span><span>Score: ${score}</span>`;
      root.appendChild(banner);

      const qText = document.createElement('p');
      qText.style.fontSize = '1.125rem';
      qText.style.fontWeight = '600';
      qText.style.textAlign = 'center';
      qText.textContent = item.q;
      root.appendChild(qText);

      const list = document.createElement('div');
      list.style.display = 'grid';
      list.style.gridTemplateColumns = '1fr';
      list.style.gap = '8px';
      list.style.width = '100%';

      item.opts.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'stage-btn';
        b.style.textAlign = 'left';
        b.style.padding = '12px 16px';
        if (picked !== -1) {
          if (i === item.ans) b.style.background = '#059669';
          else if (i === picked) b.style.background = '#dc2626';
        }
        b.textContent = opt;
        b.onclick = () => choose(i);
        list.appendChild(b);
      });
      root.appendChild(list);

      if (picked !== -1) {
        const note = document.createElement('p');
        note.style.fontSize = '0.875rem';
        note.style.color = '#cbd5e1';
        note.textContent = item.note;
        root.appendChild(note);

        const nxt = document.createElement('button');
        nxt.className = 'stage-btn primary';
        nxt.textContent = idx + 1 < deck.length ? 'Next Question' : 'View Results';
        nxt.onclick = next;
        root.appendChild(nxt);
      }
    }

    ctx.registerInput((action) => {
      if (action === 'restart') start();
      if (action === 'action' && picked !== -1) next();
    });
    start();
  }
};
