// 5 Original Reflex & Casual Games
import { createCanvasStage, drawOverlayCard } from './utils.js';

export const REFLEX_GAMES = {
  // 28. REACTION TIMER
  reaction(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let state = 'IDLE'; // IDLE | WAIT | GO | EARLY | DONE
    let startTime = 0;
    let results = [];
    let timerId = 0;

    function startRound() {
      clearTimeout(timerId);
      if (state === 'DONE') results = [];
      state = 'WAIT';
      render();
      const delay = 1300 + Math.random() * 2400;
      timerId = setTimeout(() => {
        state = 'GO';
        startTime = performance.now();
        ctx.audio.tone(740, 0.08, 'sine', 0.07);
        render();
      }, delay);
    }

    function handlePad() {
      if (state === 'IDLE' || state === 'EARLY' || state === 'DONE') {
        startRound();
      } else if (state === 'WAIT') {
        clearTimeout(timerId);
        state = 'EARLY';
        ctx.audio.error();
        render();
      } else if (state === 'GO') {
        const ms = Math.round(performance.now() - startTime);
        results.push(ms);
        ctx.audio.score();
        if (results.length >= 5) {
          state = 'DONE';
          const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
          ctx.setScore(avg);
          ctx.saveBest(avg, true);
          ctx.audio.win();
        } else {
          ctx.setScore(ms);
          startRound();
          return;
        }
        render();
      }
    }

    function render() {
      root.innerHTML = '';
      ctx.setMeta('Round', `${Math.min(5, results.length + (state === 'DONE' ? 0 : 1))} / 5`);

      const pad = document.createElement('button');
      pad.style.width = '100%';
      pad.style.minHeight = '280px';
      pad.style.borderRadius = '12px';
      pad.style.border = 'none';
      pad.style.color = '#ffffff';
      pad.style.display = 'flex';
      pad.style.flexDirection = 'column';
      pad.style.alignItems = 'center';
      pad.style.justifyContent = 'center';
      pad.style.gap = '10px';
      pad.style.padding = '24px';

      if (state === 'IDLE') {
        pad.style.background = '#1e3a8a';
        pad.innerHTML = '<span style="font-size:1.5rem;font-weight:700">Reaction Timer</span><span>Tap anywhere here to begin Round 1</span>';
      } else if (state === 'WAIT') {
        pad.style.background = '#b45309';
        pad.innerHTML = '<span style="font-size:1.6rem;font-weight:700">Wait for Green...</span><span>Hold steady</span>';
      } else if (state === 'GO') {
        pad.style.background = '#059669';
        pad.innerHTML = '<span style="font-size:2rem;font-weight:700">TAP NOW!</span>';
      } else if (state === 'EARLY') {
        pad.style.background = '#dc2626';
        pad.innerHTML = '<span style="font-size:1.5rem;font-weight:700">Too Early!</span><span>Tap to retry this round</span>';
      } else {
        const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
        pad.style.background = '#0f766e';
        pad.innerHTML = `<span style="font-size:1.75rem;font-weight:700">Average: ${avg} ms</span><span>Rounds: ${results.join(' · ')} ms</span><span>Tap to run another 5-round test</span>`;
      }

      pad.onpointerdown = handlePad;
      root.appendChild(pad);
    }

    ctx.onCleanup(() => clearTimeout(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart') { results = []; state = 'IDLE'; render(); }
      if (action === 'action') handlePad();
    });
    render();
  },

  // 29. MOLE WHACK
  whack(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    let cells = Array(9).fill(null); // null | 'mole' | 'gold' | 'bomb'
    let score = 0;
    let timeLeft = 30;
    let running = false;
    let spawnId = 0;
    let tickId = 0;

    function stopAll() {
      clearInterval(spawnId);
      clearInterval(tickId);
    }

    function start() {
      stopAll();
      cells = Array(9).fill(null);
      score = 0;
      timeLeft = 30;
      running = true;
      ctx.setScore(0);
      ctx.setMeta('Time', '30s');

      spawnId = setInterval(() => {
        cells = Array(9).fill(null);
        const count = Math.random() < 0.45 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * 9);
          const r = Math.random();
          cells[idx] = r < 0.16 ? 'bomb' : r < 0.34 ? 'gold' : 'mole';
        }
        render();
      }, 720);

      tickId = setInterval(() => {
        timeLeft--;
        ctx.setMeta('Time', `${timeLeft}s`);
        if (timeLeft <= 0) {
          stopAll();
          running = false;
          cells = Array(9).fill(null);
          ctx.audio.win();
          ctx.saveBest(score);
          render();
        }
      }, 1000);
      render();
    }

    function hit(idx) {
      if (!running || !cells[idx]) return;
      const type = cells[idx];
      cells[idx] = null;
      if (type === 'mole') {
        score += 10;
        ctx.audio.score();
      } else if (type === 'gold') {
        score += 25;
        ctx.audio.win();
      } else {
        score = Math.max(0, score - 20);
        ctx.audio.error();
      }
      ctx.setScore(score);
      ctx.saveBest(score);
      render();
    }

    function render() {
      root.innerHTML = '';
      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>${running ? 'Tap critters & gold stars — avoid bombs!' : timeLeft === 0 ? `Finished! Score: ${score}` : '30-Second Arcade Sprint'}</span><span>${timeLeft}s</span>`;
      root.appendChild(banner);

      const grid = document.createElement('div');
      grid.className = 'board-grid';
      grid.style.gridTemplateColumns = 'repeat(3, minmax(84px, 98px))';
      grid.style.gap = '10px';

      cells.forEach((c, idx) => {
        const b = document.createElement('button');
        b.className = 'cell-btn';
        b.style.height = '84px';
        b.style.fontSize = '1.75rem';
        b.style.background =
          c === 'mole' ? '#92400e' :
          c === 'gold' ? '#ca8a04' :
          c === 'bomb' ? '#b91c1c' : '#0f172a';
        b.style.color = '#ffffff';
        b.textContent = c === 'mole' ? '●' : c === 'gold' ? '★' : c === 'bomb' ? '✕' : '';
        b.onpointerdown = () => hit(idx);
        grid.appendChild(b);
      });
      root.appendChild(grid);

      const controls = document.createElement('div');
      controls.className = 'stage-controls-row';
      const btn = document.createElement('button');
      btn.className = 'stage-btn primary';
      btn.textContent = running ? 'Restart' : 'Start 30s Round';
      btn.onclick = start;
      controls.appendChild(btn);
      root.appendChild(controls);
    }

    ctx.onCleanup(stopAll);
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') start();
    });
    render();
  },

  // 30. AIM TRAINER
  aim(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 480, 380);
    let target, hits, misses, totalTargets, startTime, state;
    let rafId = 0;

    function spawnTarget() {
      const r = 24;
      target = {
        x: r + 16 + Math.random() * (width - (r + 16) * 2),
        y: r + 16 + Math.random() * (height - (r + 16) * 2),
        r
      };
    }

    function reset(startPlaying = false) {
      hits = 0;
      misses = 0;
      totalTargets = 25;
      startTime = performance.now();
      spawnTarget();
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Left', totalTargets);
    }

    function onTap(e) {
      if (state === 'TITLE') {
        reset(true);
        return;
      }
      if (state === 'OVER') {
        reset(true);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      const y = ((e.clientY - rect.top) / rect.height) * height;
      const dist = Math.hypot(x - target.x, y - target.y);

      if (dist <= target.r + 4) {
        hits++;
        const pts = dist <= target.r * 0.4 ? 50 : 30;
        const curScore = Number(hits * 35 - misses * 10 + (pts === 50 ? 15 : 0));
        ctx.audio.score();
        ctx.setScore(Math.max(0, curScore));
        ctx.setMeta('Left', totalTargets - hits);
        if (hits >= totalTargets) {
          state = 'OVER';
          const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
          const acc = Math.round((hits / (hits + misses)) * 100);
          const finalScore = Math.max(100, Math.round((hits * 40) + acc * 3 - Number(elapsed) * 10));
          ctx.setScore(finalScore);
          ctx.saveBest(finalScore);
          ctx.setMeta('Accuracy', `${acc}% · ${elapsed}s`);
          ctx.audio.win();
        } else {
          spawnTarget();
        }
      } else {
        misses++;
        ctx.audio.error();
      }
    }

    function draw() {
      c.fillStyle = '#0b1220';
      c.fillRect(0, 0, width, height);

      if (state === 'PLAYING') {
        c.fillStyle = '#ef4444';
        c.beginPath();
        c.arc(target.x, target.y, target.r, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(target.x, target.y, target.r * 0.58, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#ef4444';
        c.beginPath();
        c.arc(target.x, target.y, target.r * 0.25, 0, Math.PI * 2);
        c.fill();
      } else if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Aim Trainer', 'Hit 25 bullseyes with high accuracy', 'Tap Stage to Start');
      } else if (state === 'OVER') {
        const acc = Math.round((hits / Math.max(1, hits + misses)) * 100);
        drawOverlayCard(c, width, height, 'Run Complete!', `Accuracy: ${acc}%`, 'Tap Stage to Run Again');
      }

      rafId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('pointerdown', onTap);
    ctx.registerInput((action) => {
      if (action === 'restart') reset(true);
    });
    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 31. TOWER STACK
  'tower-stack'(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 420, 440);
    let stack, mover, speed, score, state;
    let rafId = 0;

    function reset(startPlaying = false) {
      stack = [{ x: width / 2 - 90, w: 180, color: '#2563eb' }];
      speed = 3.2;
      score = 0;
      spawnMover();
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Height', 1);
    }

    function spawnMover() {
      const top = stack[stack.length - 1];
      const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
      mover = {
        x: 10,
        w: top.w,
        dir: 1,
        color: colors[stack.length % colors.length]
      };
    }

    function dropBlock() {
      if (state === 'TITLE') { state = 'PLAYING'; return; }
      if (state === 'OVER') { reset(true); return; }

      const top = stack[stack.length - 1];
      const left = Math.max(top.x, mover.x);
      const right = Math.min(top.x + top.w, mover.x + mover.w);
      const overlap = right - left;

      if (overlap <= 2) {
        state = 'OVER';
        ctx.audio.error();
        ctx.saveBest(score);
        return;
      }

      const perfect = Math.abs(mover.x - top.x) <= 5;
      stack.push({
        x: perfect ? top.x : left,
        w: perfect ? top.w : overlap,
        color: mover.color
      });
      score += perfect ? 25 : 10;
      speed = Math.min(7.5, 3.2 + stack.length * 0.14);
      if (perfect) ctx.audio.win();
      else ctx.audio.score();

      ctx.setScore(score);
      ctx.saveBest(score);
      ctx.setMeta('Height', stack.length);
      spawnMover();
    }

    function update() {
      if (state !== 'PLAYING') return;
      mover.x += speed * mover.dir;
      if (mover.x + mover.w >= width - 10) {
        mover.x = width - 10 - mover.w;
        mover.dir = -1;
      } else if (mover.x <= 10) {
        mover.x = 10;
        mover.dir = 1;
      }
    }

    function draw() {
      update();
      c.fillStyle = '#0b1220';
      c.fillRect(0, 0, width, height);

      const blockH = 22;
      const visible = stack.slice(-14);
      const baseY = height - 28;

      visible.forEach((b, idx) => {
        const y = baseY - (idx + 1) * blockH;
        c.fillStyle = b.color;
        c.fillRect(b.x, y, b.w, blockH - 2);
      });

      if (state === 'PLAYING') {
        const my = baseY - (visible.length + 1) * blockH;
        c.fillStyle = mover.color;
        c.fillRect(mover.x, my, mover.w, blockH - 2);
      }

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Tower Stack', 'Tap when the moving slab aligns', 'Tap Stage to Start');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Tower Toppled', `Score: ${score} · Height: ${stack.length}`, 'Tap Stage to Rebuild');
      }

      rafId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('pointerdown', dropBlock);
    ctx.registerInput((action) => {
      if (action === 'restart') reset(true);
      if (action === 'action' || action === 'down') dropBlock();
    });
    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', dropBlock);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 32. COLOR MATCH (STROOP)
  stroop(ctx) {
    ctx.stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'dom-game-root';
    ctx.stage.appendChild(root);

    const palette = [
      { name: 'RED', hex: '#ef4444' },
      { name: 'BLUE', hex: '#3b82f6' },
      { name: 'GREEN', hex: '#10b981' },
      { name: 'YELLOW', hex: '#eab308' }
    ];

    let wordObj = null, colorObj = null, score = 0, streak = 0, timeLeft = 40, state = 'TITLE', timerId = 0;

    function nextCard() {
      wordObj = palette[Math.floor(Math.random() * palette.length)];
      if (Math.random() < 0.5) {
        colorObj = wordObj;
      } else {
        const others = palette.filter((p) => p.name !== wordObj.name);
        colorObj = others[Math.floor(Math.random() * others.length)];
      }
      render();
    }

    function start() {
      clearInterval(timerId);
      score = 0;
      streak = 0;
      timeLeft = 40;
      state = 'PLAYING';
      ctx.setScore(0);
      ctx.setMeta('Time', '40s');
      nextCard();
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

    function answer(isMatch) {
      if (state !== 'PLAYING') return;
      const actual = wordObj.name === colorObj.name;
      if (isMatch === actual) {
        streak++;
        score += 15 + Math.min(20, streak * 3);
        ctx.audio.score();
      } else {
        streak = 0;
        score = Math.max(0, score - 10);
        ctx.audio.error();
      }
      ctx.setScore(score);
      ctx.saveBest(score);
      nextCard();
    }

    function render() {
      root.innerHTML = '';
      if (state !== 'PLAYING') {
        const card = document.createElement('div');
        card.className = 'stage-banner';
        card.style.flexDirection = 'column';
        card.style.padding = '28px';
        card.innerHTML = `<h3 style="font-size:1.5rem">${state === 'OVER' ? 'Sprint Finished!' : 'Color Match (Stroop)'}</h3>
          <p>${state === 'OVER' ? `Final Score: ${score}` : 'Does the word meaning match its ink color?'}</p>`;
        const btn = document.createElement('button');
        btn.className = 'stage-btn primary';
        btn.textContent = state === 'OVER' ? 'Play Again' : 'Start 40s Sprint';
        btn.onclick = start;
        card.appendChild(btn);
        root.appendChild(card);
        return;
      }

      const banner = document.createElement('div');
      banner.className = 'stage-banner';
      banner.innerHTML = `<span>Streak: ${streak}</span><span>${timeLeft}s</span>`;
      root.appendChild(banner);

      const prompt = document.createElement('div');
      prompt.style.padding = '32px 24px';
      prompt.style.background = '#0f172a';
      prompt.style.borderRadius = '12px';
      prompt.style.width = '100%';
      prompt.style.textAlign = 'center';
      prompt.innerHTML = `<div style="font-size:0.875rem;color:#94a3b8;margin-bottom:8px">Does meaning match ink color?</div>
        <div style="font-size:2.75rem;font-weight:800;color:${colorObj.hex}">${wordObj.name}</div>`;
      root.appendChild(prompt);

      const row = document.createElement('div');
      row.className = 'stage-controls-row';
      const yesBtn = document.createElement('button');
      yesBtn.className = 'stage-btn primary';
      yesBtn.style.minWidth = '130px';
      yesBtn.style.background = '#059669';
      yesBtn.style.borderColor = '#059669';
      yesBtn.textContent = 'YES (Match)';
      yesBtn.onclick = () => answer(true);

      const noBtn = document.createElement('button');
      noBtn.className = 'stage-btn';
      noBtn.style.minWidth = '130px';
      noBtn.style.background = '#dc2626';
      noBtn.style.borderColor = '#dc2626';
      noBtn.textContent = 'NO (Mismatch)';
      noBtn.onclick = () => answer(false);

      row.append(yesBtn, noBtn);
      root.appendChild(row);
    }

    ctx.onCleanup(() => clearInterval(timerId));
    ctx.registerInput((action) => {
      if (action === 'restart' || action === 'action') start();
      if (action === 'left') answer(true);
      if (action === 'right') answer(false);
    });
    render();
  }
};
