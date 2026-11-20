// 8 Original Arcade & Action HTML5 Canvas Games
import { attachSwipe, createCanvasStage, drawOverlayCard, roundRect } from './utils.js';

export const ARCADE_GAMES = {
  // 1. NEON SNAKE
  snake(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 440, 440);
    const cols = 20;
    const cell = width / cols;
    let snake, dir, nextDir, food, bonus, bonusTimer, score, state, lastStep, speed;
    let rafId = 0;

    function spawnFood() {
      while (true) {
        const fx = Math.floor(Math.random() * cols);
        const fy = Math.floor(Math.random() * cols);
        if (!snake.some((s) => s.x === fx && s.y === fy)) {
          return { x: fx, y: fy };
        }
      }
    }

    function reset(startImmediately = false) {
      snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      food = spawnFood();
      bonus = null;
      bonusTimer = 0;
      score = 0;
      speed = 130;
      lastStep = performance.now();
      state = startImmediately ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Length', 3);
    }

    function setDirection(d) {
      if (state === 'TITLE') {
        state = 'PLAYING';
        lastStep = performance.now();
      }
      if (state !== 'PLAYING') return;
      if (d === 'up' && dir.y !== 1) nextDir = { x: 0, y: -1 };
      if (d === 'down' && dir.y !== -1) nextDir = { x: 0, y: 1 };
      if (d === 'left' && dir.x !== 1) nextDir = { x: -1, y: 0 };
      if (d === 'right' && dir.x !== -1) nextDir = { x: 1, y: 0 };
    }

    function step() {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= cols || snake.some((s) => s.x === head.x && s.y === head.y)) {
        state = 'OVER';
        ctx.audio.error();
        ctx.saveBest(score);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        ctx.audio.score();
        ctx.setScore(score);
        ctx.saveBest(score);
        food = spawnFood();
        speed = Math.max(68, 130 - Math.floor(score / 40) * 5);
        if (!bonus && Math.random() < 0.25) {
          bonus = spawnFood();
          bonusTimer = 45;
        }
      } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
        score += 30;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        bonus = null;
      } else {
        snake.pop();
      }
      if (bonus) {
        bonusTimer--;
        if (bonusTimer <= 0) bonus = null;
      }
      ctx.setMeta('Length', snake.length);
    }

    function draw(now) {
      if (state === 'PLAYING' && now - lastStep >= speed) {
        lastStep = now;
        step();
      }
      c.fillStyle = '#0b1220';
      c.fillRect(0, 0, width, height);

      c.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      c.lineWidth = 1;
      for (let i = 1; i < cols; i++) {
        c.beginPath();
        c.moveTo(i * cell, 0);
        c.lineTo(i * cell, height);
        c.stroke();
        c.beginPath();
        c.moveTo(0, i * cell);
        c.lineTo(width, i * cell);
        c.stroke();
      }

      // Food
      c.fillStyle = '#10b981';
      c.beginPath();
      c.arc((food.x + 0.5) * cell, (food.y + 0.5) * cell, cell * 0.36, 0, Math.PI * 2);
      c.fill();

      if (bonus) {
        c.fillStyle = '#f59e0b';
        c.beginPath();
        c.arc((bonus.x + 0.5) * cell, (bonus.y + 0.5) * cell, cell * 0.4, 0, Math.PI * 2);
        c.fill();
      }

      // Snake
      snake.forEach((seg, idx) => {
        c.fillStyle = idx === 0 ? '#60a5fa' : idx % 2 === 0 ? '#2563eb' : '#1d4ed8';
        roundRect(c, seg.x * cell + 2, seg.y * cell + 2, cell - 4, cell - 4, 5);
        c.fill();
      });

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Neon Snake', 'Collect green & gold orbs', 'Swipe, Arrow Keys or Tap to Start');
      } else if (state === 'PAUSED') {
        drawOverlayCard(c, width, height, 'Paused', `Score: ${score}`, 'Tap Stage or Action to Resume');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Game Over', `Final Score: ${score}`, 'Tap Stage or Press Space to Retry');
      }
      rafId = requestAnimationFrame(draw);
    }

    const onTap = () => {
      if (state === 'TITLE') { state = 'PLAYING'; lastStep = performance.now(); }
      else if (state === 'PAUSED') { state = 'PLAYING'; lastStep = performance.now(); }
      else if (state === 'OVER') { reset(true); }
    };
    canvas.addEventListener('click', onTap);
    const cleanups = [() => cancelAnimationFrame(rafId), () => canvas.removeEventListener('click', onTap)];
    attachSwipe(canvas, setDirection, cleanups);
    ctx.onCleanup(() => cleanups.forEach((fn) => fn()));

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'action') {
        if (state === 'PLAYING') state = 'PAUSED';
        else if (state === 'PAUSED' || state === 'TITLE') { state = 'PLAYING'; lastStep = performance.now(); }
        else if (state === 'OVER') reset(true);
        return;
      }
      setDirection(action);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 2. BRICK BREAKER
  breakout(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 480, 420);
    let paddle, ball, bricks, score, lives, level, state, keys;
    let rafId = 0;

    function buildBricks(lvl) {
      const rows = Math.min(6, 4 + Math.floor((lvl - 1) / 2));
      const cols = 8;
      const pad = 8;
      const bw = (width - pad * (cols + 1)) / cols;
      const bh = 20;
      const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#8b5cf6'];
      const list = [];
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          list.push({
            x: pad + col * (bw + pad),
            y: 44 + r * (bh + pad),
            w: bw,
            h: bh,
            hp: r === 0 && lvl > 1 ? 2 : 1,
            color: palette[r % palette.length]
          });
        }
      }
      return list;
    }

    function resetBall() {
      ball = {
        x: paddle.x + paddle.w / 2,
        y: paddle.y - 9,
        r: 7,
        vx: (Math.random() > 0.5 ? 1 : -1) * (3.2 + level * 0.25),
        vy: -(3.6 + level * 0.25),
        stuck: true
      };
    }

    function reset(startPlaying = false) {
      paddle = { w: 92, h: 12, x: (width - 92) / 2, y: height - 28 };
      score = 0;
      lives = 3;
      level = 1;
      keys = { left: false, right: false };
      bricks = buildBricks(level);
      resetBall();
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Lives', lives);
    }

    function update() {
      if (keys.left) paddle.x -= 6.5;
      if (keys.right) paddle.x += 6.5;
      paddle.x = Math.max(8, Math.min(width - paddle.w - 8, paddle.x));

      if (state !== 'PLAYING') return;
      if (ball.stuck) {
        ball.x = paddle.x + paddle.w / 2;
        return;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r <= 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); ctx.audio.bounce(); }
      if (ball.x + ball.r >= width) { ball.x = width - ball.r; ball.vx = -Math.abs(ball.vx); ctx.audio.bounce(); }
      if (ball.y - ball.r <= 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); ctx.audio.bounce(); }

      // Paddle collision
      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - 4 &&
        ball.x <= paddle.x + paddle.w + 4
      ) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const speed = Math.hypot(ball.vx, ball.vy);
        const angle = hit * (Math.PI / 3);
        ball.vx = speed * Math.sin(angle);
        ball.vy = -Math.abs(speed * Math.cos(angle));
        ball.y = paddle.y - ball.r;
        ctx.audio.bounce();
      }

      // Brick collisions
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.hp--;
          ball.vy = -ball.vy;
          score += b.hp === 0 ? 15 : 5;
          ctx.audio.score();
          ctx.setScore(score);
          ctx.saveBest(score);
          break;
        }
      }

      if (bricks.every((b) => b.hp <= 0)) {
        level++;
        score += 100;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        bricks = buildBricks(level);
        resetBall();
      }

      if (ball.y - ball.r > height) {
        lives--;
        ctx.audio.error();
        ctx.setMeta('Lives', lives);
        if (lives <= 0) {
          state = 'OVER';
          ctx.saveBest(score);
        } else {
          resetBall();
        }
      }
    }

    function draw() {
      update();
      c.fillStyle = '#0b1220';
      c.fillRect(0, 0, width, height);

      for (const b of bricks) {
        if (b.hp <= 0) continue;
        c.fillStyle = b.hp > 1 ? '#e2e8f0' : b.color;
        roundRect(c, b.x, b.y, b.w, b.h, 4);
        c.fill();
      }

      c.fillStyle = '#38bdf8';
      roundRect(c, paddle.x, paddle.y, paddle.w, paddle.h, 6);
      c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      c.fill();

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Brick Breaker', 'Drag or Arrows to steer paddle', 'Tap Stage to Launch Ball');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Game Over', `Score: ${score} · Level ${level}`, 'Tap Stage to Play Again');
      } else if (ball.stuck) {
        c.fillStyle = '#94a3b8';
        c.font = '600 13px "Plus Jakarta Sans", sans-serif';
        c.textAlign = 'center';
        c.fillText('Tap Stage or Press Space to Launch', width / 2, height - 64);
      }

      rafId = requestAnimationFrame(draw);
    }

    const movePointer = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * width;
      paddle.x = Math.max(8, Math.min(width - paddle.w - 8, x - paddle.w / 2));
    };
    const onMouseMove = (e) => movePointer(e.clientX);
    const onTouchMove = (e) => { if (e.touches[0]) movePointer(e.touches[0].clientX); };
    const onTap = () => {
      if (state === 'TITLE') { state = 'PLAYING'; ball.stuck = false; }
      else if (state === 'PLAYING' && ball.stuck) { ball.stuck = false; ctx.audio.click(); }
      else if (state === 'OVER') { reset(true); ball.stuck = false; }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('click', onTap);

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'left') { paddle.x = Math.max(8, paddle.x - 28); }
      if (action === 'right') { paddle.x = Math.min(width - paddle.w - 8, paddle.x + 28); }
      if (action === 'action' || action === 'up') onTap();
    });

    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('click', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 3. SPACE DEFENDER
  'space-defender'(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 480, 440);
    let ship, bullets, enemies, eBullets, eDir, wave, score, lives, state, lastShot, lastEnemyShot;
    let rafId = 0;

    function spawnWave(w) {
      enemies = [];
      const rows = Math.min(4, 3 + Math.floor(w / 3));
      const cols = 7;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          enemies.push({
            x: 52 + col * 56,
            y: 44 + r * 36,
            w: 30,
            h: 20,
            alive: true,
            color: r === 0 ? '#f59e0b' : r === 1 ? '#ef4444' : '#38bdf8'
          });
        }
      }
      eDir = 1.1 + w * 0.18;
    }

    function reset(startPlaying = false) {
      ship = { x: width / 2 - 18, y: height - 42, w: 36, h: 20 };
      bullets = [];
      eBullets = [];
      wave = 1;
      score = 0;
      lives = 3;
      lastShot = 0;
      lastEnemyShot = 0;
      spawnWave(wave);
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Wave', `1 · Lives ${lives}`);
    }

    function shoot(now) {
      if (now - lastShot < 240) return;
      lastShot = now;
      bullets.push({ x: ship.x + ship.w / 2 - 2, y: ship.y - 8, w: 4, h: 12 });
      ctx.audio.tone(720, 0.04, 'square', 0.03);
    }

    function update(now) {
      if (state !== 'PLAYING') return;
      shoot(now); // Auto-fire keeps mobile play effortless!

      bullets.forEach((b) => (b.y -= 7.5));
      bullets = bullets.filter((b) => b.y > -20);

      eBullets.forEach((b) => (b.y += 4.2));
      eBullets = eBullets.filter((b) => b.y < height + 20);

      let hitEdge = false;
      for (const e of enemies) {
        if (!e.alive) continue;
        e.x += eDir;
        if (e.x <= 12 || e.x + e.w >= width - 12) hitEdge = true;
      }
      if (hitEdge) {
        eDir = -eDir;
        for (const e of enemies) {
          if (e.alive) e.y += 14;
        }
      }

      // Enemy fire
      const aliveEnemies = enemies.filter((e) => e.alive);
      if (aliveEnemies.length && now - lastEnemyShot > Math.max(450, 1100 - wave * 90)) {
        lastEnemyShot = now;
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        eBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 10 });
      }

      // Player bullet hits
      for (const b of bullets) {
        for (const e of aliveEnemies) {
          if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
            e.alive = false;
            b.y = -100;
            score += 20;
            ctx.audio.score();
            ctx.setScore(score);
            ctx.saveBest(score);
            break;
          }
        }
      }

      // Enemy bullet hits player
      for (const eb of eBullets) {
        if (eb.x < ship.x + ship.w && eb.x + eb.w > ship.x && eb.y < ship.y + ship.h && eb.y + eb.h > ship.y) {
          eb.y = height + 100;
          lives--;
          ctx.audio.error();
          ctx.setMeta('Wave', `${wave} · Lives ${lives}`);
          if (lives <= 0) {
            state = 'OVER';
            ctx.saveBest(score);
            return;
          }
        }
      }

      if (aliveEnemies.some((e) => e.y + e.h >= ship.y)) {
        state = 'OVER';
        ctx.audio.error();
        ctx.saveBest(score);
      }

      if (enemies.every((e) => !e.alive)) {
        wave++;
        score += 100;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        ctx.setMeta('Wave', `${wave} · Lives ${lives}`);
        spawnWave(wave);
      }
    }

    function draw(now) {
      update(now);
      c.fillStyle = '#070b14';
      c.fillRect(0, 0, width, height);

      // Ship
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.moveTo(ship.x + ship.w / 2, ship.y);
      c.lineTo(ship.x + ship.w, ship.y + ship.h);
      c.lineTo(ship.x, ship.y + ship.h);
      c.closePath();
      c.fill();

      // Enemies
      for (const e of enemies) {
        if (!e.alive) continue;
        c.fillStyle = e.color;
        roundRect(c, e.x, e.y, e.w, e.h, 4);
        c.fill();
        c.fillStyle = '#070b14';
        c.fillRect(e.x + 6, e.y + 6, 5, 5);
        c.fillRect(e.x + e.w - 11, e.y + 6, 5, 5);
      }

      // Bullets
      c.fillStyle = '#a7f3d0';
      bullets.forEach((b) => c.fillRect(b.x, b.y, b.w, b.h));
      c.fillStyle = '#f87171';
      eBullets.forEach((b) => c.fillRect(b.x, b.y, b.w, b.h));

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Space Defender', 'Drag or Arrows to steer ship', 'Tap Stage to Start Wave');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Defenses Breached', `Score: ${score} · Wave ${wave}`, 'Tap Stage to Play Again');
      }

      rafId = requestAnimationFrame(draw);
    }

    const moveShip = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * width;
      ship.x = Math.max(8, Math.min(width - ship.w - 8, x - ship.w / 2));
    };
    const onMouse = (e) => moveShip(e.clientX);
    const onTouch = (e) => { if (e.touches[0]) moveShip(e.touches[0].clientX); };
    const onTap = () => {
      if (state === 'TITLE') state = 'PLAYING';
      else if (state === 'OVER') reset(true);
    };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('click', onTap);

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'left') ship.x = Math.max(8, ship.x - 24);
      if (action === 'right') ship.x = Math.min(width - ship.w - 8, ship.x + 24);
      if (action === 'action') {
        if (state !== 'PLAYING') onTap();
        else shoot(performance.now());
      }
    });

    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('click', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 4. FLAPPY GLIDE
  flappy(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 420, 460);
    let bird, pipes, score, state, frame;
    let rafId = 0;

    function reset(startPlaying = false) {
      bird = { x: 110, y: height / 2, vy: 0, r: 14 };
      pipes = [];
      score = 0;
      frame = 0;
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Mode', 'Endless');
    }

    function flap() {
      if (state === 'TITLE') {
        state = 'PLAYING';
        bird.vy = -7.2;
        ctx.audio.bounce();
      } else if (state === 'PLAYING') {
        bird.vy = -7.2;
        ctx.audio.bounce();
      } else if (state === 'OVER') {
        reset(true);
        bird.vy = -7.2;
      }
    }

    function update() {
      if (state !== 'PLAYING') return;
      frame++;
      bird.vy += 0.36;
      bird.y += bird.vy;

      if (frame % 95 === 0) {
        const gap = 132;
        const topH = 55 + Math.random() * (height - gap - 130);
        pipes.push({ x: width + 10, w: 54, topH, gap, passed: false });
      }

      for (const p of pipes) {
        p.x -= 2.8;
        if (!p.passed && p.x + p.w < bird.x) {
          p.passed = true;
          score++;
          ctx.audio.score();
          ctx.setScore(score);
          ctx.saveBest(score);
        }
        if (
          bird.x + bird.r > p.x &&
          bird.x - bird.r < p.x + p.w &&
          (bird.y - bird.r < p.topH || bird.y + bird.r > p.topH + p.gap)
        ) {
          state = 'OVER';
          ctx.audio.error();
          ctx.saveBest(score);
        }
      }
      pipes = pipes.filter((p) => p.x + p.w > -20);

      if (bird.y + bird.r >= height - 24 || bird.y - bird.r <= 0) {
        state = 'OVER';
        ctx.audio.error();
        ctx.saveBest(score);
      }
    }

    function draw() {
      update();
      c.fillStyle = '#0c4a6e';
      c.fillRect(0, 0, width, height);

      // Ground
      c.fillStyle = '#065f46';
      c.fillRect(0, height - 24, width, 24);

      // Pipes
      for (const p of pipes) {
        c.fillStyle = '#10b981';
        roundRect(c, p.x, 0, p.w, p.topH, 4);
        c.fill();
        roundRect(c, p.x, p.topH + p.gap, p.w, height - 24 - (p.topH + p.gap), 4);
        c.fill();
      }

      // Glider
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.arc(bird.x + 5, bird.y - 4, 3, 0, Math.PI * 2);
      c.fill();

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Flappy Glide', 'Tap or Press Space to Flap', 'Tap Stage to Take Off');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Crashed!', `Pipes Cleared: ${score}`, 'Tap Stage to Fly Again');
      }

      rafId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('pointerdown', flap);
    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'action' || action === 'up') flap();
    });
    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', flap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 5. DINO DASH
  dino(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 540, 320);
    const groundY = height - 48;
    let dino, obstacles, speed, score, state, frame, ducking;
    let rafId = 0;

    function reset(startPlaying = false) {
      dino = { x: 64, y: groundY - 44, w: 34, h: 44, vy: 0, grounded: true };
      obstacles = [];
      speed = 4.6;
      score = 0;
      frame = 0;
      ducking = false;
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Speed', '1.0x');
    }

    function jump() {
      if (state === 'TITLE') { state = 'PLAYING'; return; }
      if (state === 'OVER') { reset(true); return; }
      if (dino.grounded) {
        dino.vy = -10.8;
        dino.grounded = false;
        ctx.audio.bounce();
      }
    }

    function update() {
      if (state !== 'PLAYING') return;
      frame++;
      if (frame % 6 === 0) {
        score++;
        ctx.setScore(score);
        ctx.saveBest(score);
      }
      speed = Math.min(9.5, 4.6 + score * 0.008);
      ctx.setMeta('Speed', `${(speed / 4.6).toFixed(1)}x`);

      const targetH = ducking && dino.grounded ? 24 : 44;
      dino.h = targetH;
      dino.vy += 0.58;
      dino.y += dino.vy;
      if (dino.y + dino.h >= groundY) {
        dino.y = groundY - dino.h;
        dino.vy = 0;
        dino.grounded = true;
      }

      if (frame % Math.max(48, Math.floor(88 - speed * 4)) === 0) {
        const isFlyer = score > 30 && Math.random() < 0.3;
        obstacles.push({
          x: width + 20,
          y: isFlyer ? groundY - 58 : groundY - (28 + Math.random() * 18),
          w: isFlyer ? 34 : 22 + Math.random() * 14,
          h: isFlyer ? 20 : 32,
          flyer: isFlyer
        });
      }

      for (const ob of obstacles) {
        ob.x -= speed;
        if (
          dino.x + 4 < ob.x + ob.w &&
          dino.x + dino.w - 4 > ob.x &&
          dino.y + 4 < ob.y + ob.h &&
          dino.y + dino.h - 4 > ob.y
        ) {
          state = 'OVER';
          ctx.audio.error();
          ctx.saveBest(score);
        }
      }
      obstacles = obstacles.filter((ob) => ob.x + ob.w > -20);
      ducking = false;
    }

    function draw() {
      update();
      c.fillStyle = '#0f172a';
      c.fillRect(0, 0, width, height);

      // Horizon
      c.fillStyle = '#334155';
      c.fillRect(0, groundY, width, 3);

      // Dino
      c.fillStyle = '#34d399';
      roundRect(c, dino.x, dino.y, dino.w, dino.h, 6);
      c.fill();
      c.fillStyle = '#0f172a';
      c.fillRect(dino.x + dino.w - 10, dino.y + 7, 4, 4);

      // Obstacles
      for (const ob of obstacles) {
        c.fillStyle = ob.flyer ? '#fbbf24' : '#ef4444';
        roundRect(c, ob.x, ob.y, ob.w, ob.h, 4);
        c.fill();
      }

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Dino Dash', 'Jump over cacti & dodge flyers', 'Tap Stage or Space to Run');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Collision!', `Distance Score: ${score}`, 'Tap Stage to Run Again');
      }
      rafId = requestAnimationFrame(draw);
    }

    canvas.addEventListener('pointerdown', jump);
    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'up' || action === 'action') jump();
      if (action === 'down') ducking = true;
    });
    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', jump);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 6. ASTEROIDS DRIFT
  asteroids(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 480, 420);
    let ship, rocks, bullets, score, lives, state, lastShot;
    let rafId = 0;

    function spawnRocks(count) {
      const list = [];
      for (let i = 0; i < count; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;
        if (Math.hypot(x - width / 2, y - height / 2) < 90) x = 20;
        list.push({
          x,
          y,
          r: 28,
          vx: (Math.random() - 0.5) * 2.2,
          vy: (Math.random() - 0.5) * 2.2
        });
      }
      return list;
    }

    function reset(startPlaying = false) {
      ship = { x: width / 2, y: height / 2, angle: -Math.PI / 2, vx: 0, vy: 0, invuln: 60 };
      rocks = spawnRocks(5);
      bullets = [];
      score = 0;
      lives = 3;
      lastShot = 0;
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Lives', lives);
    }

    function fire() {
      const now = performance.now();
      if (now - lastShot < 180) return;
      lastShot = now;
      bullets.push({
        x: ship.x + Math.cos(ship.angle) * 14,
        y: ship.y + Math.sin(ship.angle) * 14,
        vx: Math.cos(ship.angle) * 6.5,
        vy: Math.sin(ship.angle) * 6.5,
        life: 55
      });
      ctx.audio.tone(640, 0.05, 'triangle', 0.04);
    }

    function update() {
      if (state !== 'PLAYING') return;
      ship.x = (ship.x + ship.vx + width) % width;
      ship.y = (ship.y + ship.vy + height) % height;
      ship.vx *= 0.985;
      ship.vy *= 0.985;
      if (ship.invuln > 0) ship.invuln--;

      bullets.forEach((b) => {
        b.x = (b.x + b.vx + width) % width;
        b.y = (b.y + b.vy + height) % height;
        b.life--;
      });
      bullets = bullets.filter((b) => b.life > 0);

      for (const r of rocks) {
        r.x = (r.x + r.vx + width) % width;
        r.y = (r.y + r.vy + height) % height;
      }

      // Bullet vs Rock
      const nextRocks = [];
      for (const r of rocks) {
        let hit = false;
        for (const b of bullets) {
          if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) {
            b.life = 0;
            hit = true;
            score += r.r > 20 ? 20 : r.r > 12 ? 35 : 50;
            ctx.audio.score();
            ctx.setScore(score);
            ctx.saveBest(score);
            if (r.r > 14) {
              for (let k = 0; k < 2; k++) {
                nextRocks.push({
                  x: r.x,
                  y: r.y,
                  r: r.r * 0.58,
                  vx: (Math.random() - 0.5) * 3.2,
                  vy: (Math.random() - 0.5) * 3.2
                });
              }
            }
            break;
          }
        }
        if (!hit) nextRocks.push(r);
      }
      rocks = nextRocks;

      if (rocks.length === 0) {
        score += 150;
        ctx.audio.win();
        ctx.setScore(score);
        ctx.saveBest(score);
        rocks = spawnRocks(6);
      }

      if (ship.invuln <= 0) {
        for (const r of rocks) {
          if (Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + 10) {
            lives--;
            ctx.audio.error();
            ctx.setMeta('Lives', lives);
            if (lives <= 0) {
              state = 'OVER';
              ctx.saveBest(score);
            } else {
              ship.x = width / 2;
              ship.y = height / 2;
              ship.vx = 0;
              ship.vy = 0;
              ship.invuln = 90;
            }
            break;
          }
        }
      }
    }

    function draw() {
      update();
      c.fillStyle = '#070b14';
      c.fillRect(0, 0, width, height);

      // Rocks
      c.strokeStyle = '#94a3b8';
      c.lineWidth = 2;
      for (const r of rocks) {
        c.beginPath();
        c.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        c.stroke();
      }

      // Bullets
      c.fillStyle = '#fbbf24';
      for (const b of bullets) {
        c.beginPath();
        c.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        c.fill();
      }

      // Ship
      if (ship.invuln % 8 < 5) {
        c.save();
        c.translate(ship.x, ship.y);
        c.rotate(ship.angle);
        c.strokeStyle = '#38bdf8';
        c.lineWidth = 2.2;
        c.beginPath();
        c.moveTo(14, 0);
        c.lineTo(-10, 9);
        c.lineTo(-6, 0);
        c.lineTo(-10, -9);
        c.closePath();
        c.stroke();
        c.restore();
      }

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Asteroids Drift', 'D-Pad Rotate/Thrust + Fire', 'Tap Stage to Launch');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Hull Destroyed', `Final Score: ${score}`, 'Tap Stage to Relaunch');
      }

      rafId = requestAnimationFrame(draw);
    }

    const onTap = () => {
      if (state === 'TITLE') state = 'PLAYING';
      else if (state === 'OVER') reset(true);
      else fire();
    };
    canvas.addEventListener('click', onTap);

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (state !== 'PLAYING') { state = 'PLAYING'; return; }
      if (action === 'left') ship.angle -= 0.34;
      if (action === 'right') ship.angle += 0.34;
      if (action === 'up') {
        ship.vx += Math.cos(ship.angle) * 1.4;
        ship.vy += Math.sin(ship.angle) * 1.4;
      }
      if (action === 'action') fire();
    });

    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('click', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 7. DODGE RAIN
  'dodge-rain'(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 440, 440);
    let player, items, score, frame, state;
    let rafId = 0;

    function reset(startPlaying = false) {
      player = { x: width / 2 - 16, y: height - 46, w: 32, h: 24 };
      items = [];
      score = 0;
      frame = 0;
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Difficulty', 'Normal');
    }

    function update() {
      if (state !== 'PLAYING') return;
      frame++;
      if (frame % 10 === 0) {
        score++;
        ctx.setScore(score);
        ctx.saveBest(score);
      }

      const spawnRate = Math.max(12, 28 - Math.floor(score / 40));
      if (frame % spawnRate === 0) {
        const isStar = Math.random() < 0.22;
        items.push({
          x: 16 + Math.random() * (width - 42),
          y: -20,
          r: isStar ? 10 : 12 + Math.random() * 8,
          vy: 2.8 + Math.random() * 2.2 + Math.min(3.5, score * 0.015),
          star: isStar
        });
      }

      for (const it of items) {
        it.y += it.vy;
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        if (Math.hypot(it.x - px, it.y - py) < it.r + 13) {
          if (it.star) {
            score += 25;
            it.y = height + 100;
            ctx.audio.score();
            ctx.setScore(score);
            ctx.saveBest(score);
          } else {
            state = 'OVER';
            ctx.audio.error();
            ctx.saveBest(score);
          }
        }
      }
      items = items.filter((it) => it.y < height + 30);
    }

    function draw() {
      update();
      c.fillStyle = '#0b1220';
      c.fillRect(0, 0, width, height);

      c.fillStyle = '#38bdf8';
      roundRect(c, player.x, player.y, player.w, player.h, 8);
      c.fill();

      for (const it of items) {
        c.fillStyle = it.star ? '#fbbf24' : '#ef4444';
        c.beginPath();
        c.arc(it.x, it.y, it.r, 0, Math.PI * 2);
        c.fill();
      }

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Dodge Rain', 'Avoid red meteors · Grab gold orbs', 'Tap Stage to Start');
      } else if (state === 'OVER') {
        drawOverlayCard(c, width, height, 'Hit by Meteor!', `Final Score: ${score}`, 'Tap Stage to Retry');
      }

      rafId = requestAnimationFrame(draw);
    }

    const move = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * width;
      player.x = Math.max(8, Math.min(width - player.w - 8, x - player.w / 2));
    };
    const onMouse = (e) => move(e.clientX);
    const onTouch = (e) => { if (e.touches[0]) move(e.touches[0].clientX); };
    const onTap = () => {
      if (state === 'TITLE') state = 'PLAYING';
      else if (state === 'OVER') reset(true);
    };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('click', onTap);

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'left') player.x = Math.max(8, player.x - 28);
      if (action === 'right') player.x = Math.min(width - player.w - 8, player.x + 28);
      if (action === 'action') onTap();
    });

    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('click', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  },

  // 8. PADDLE PONG
  pong(ctx) {
    const { canvas, c, width, height } = createCanvasStage(ctx, 520, 360);
    let p1, cpu, ball, pScore, cScore, state;
    let rafId = 0;

    function serve(dir = 1) {
      ball = {
        x: width / 2,
        y: height / 2,
        r: 7,
        vx: dir * 4.2,
        vy: (Math.random() - 0.5) * 4.5
      };
    }

    function reset(startPlaying = false) {
      p1 = { x: 18, y: height / 2 - 38, w: 12, h: 76 };
      cpu = { x: width - 30, y: height / 2 - 38, w: 12, h: 76 };
      pScore = 0;
      cScore = 0;
      serve(1);
      state = startPlaying ? 'PLAYING' : 'TITLE';
      ctx.setScore(0);
      ctx.setMeta('Match', '0 - 0');
    }

    function update() {
      if (state !== 'PLAYING') return;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.y - ball.r <= 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); ctx.audio.bounce(); }
      if (ball.y + ball.r >= height) { ball.y = height - ball.r; ball.vy = -Math.abs(ball.vy); ctx.audio.bounce(); }

      // CPU tracking
      const cpuCenter = cpu.y + cpu.h / 2;
      if (cpuCenter < ball.y - 10) cpu.y += 3.5;
      if (cpuCenter > ball.y + 10) cpu.y -= 3.5;
      cpu.y = Math.max(8, Math.min(height - cpu.h - 8, cpu.y));

      // P1 hit
      if (ball.vx < 0 && ball.x - ball.r <= p1.x + p1.w && ball.x > p1.x && ball.y >= p1.y && ball.y <= p1.y + p1.h) {
        const rel = (ball.y - (p1.y + p1.h / 2)) / (p1.h / 2);
        ball.vx = Math.min(8.5, Math.abs(ball.vx) * 1.05);
        ball.vy = rel * 5.2;
        ctx.audio.bounce();
      }

      // CPU hit
      if (ball.vx > 0 && ball.x + ball.r >= cpu.x && ball.x < cpu.x + cpu.w && ball.y >= cpu.y && ball.y <= cpu.y + cpu.h) {
        const rel = (ball.y - (cpu.y + cpu.h / 2)) / (cpu.h / 2);
        ball.vx = -Math.min(8.5, Math.abs(ball.vx) * 1.04);
        ball.vy = rel * 5.0;
        ctx.audio.bounce();
      }

      if (ball.x < -10) {
        cScore++;
        ctx.audio.error();
        ctx.setMeta('Match', `${pScore} - ${cScore}`);
        if (cScore >= 7) state = 'OVER';
        else serve(1);
      } else if (ball.x > width + 10) {
        pScore++;
        ctx.audio.score();
        ctx.setScore(pScore * 100);
        ctx.saveBest(pScore * 100);
        ctx.setMeta('Match', `${pScore} - ${cScore}`);
        if (pScore >= 7) {
          ctx.audio.win();
          state = 'WIN';
        } else {
          serve(-1);
        }
      }
    }

    function draw() {
      update();
      c.fillStyle = '#0f172a';
      c.fillRect(0, 0, width, height);

      c.setLineDash([8, 8]);
      c.strokeStyle = '#334155';
      c.beginPath();
      c.moveTo(width / 2, 0);
      c.lineTo(width / 2, height);
      c.stroke();
      c.setLineDash([]);

      c.fillStyle = '#38bdf8';
      roundRect(c, p1.x, p1.y, p1.w, p1.h, 5);
      c.fill();

      c.fillStyle = '#f87171';
      roundRect(c, cpu.x, cpu.y, cpu.w, cpu.h, 5);
      c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      c.fill();

      if (state === 'TITLE') {
        drawOverlayCard(c, width, height, 'Paddle Pong', 'First to 7 points wins', 'Tap Stage to Serve');
      } else if (state === 'OVER' || state === 'WIN') {
        drawOverlayCard(c, width, height, state === 'WIN' ? 'You Won!' : 'CPU Wins', `Final Match: ${pScore} - ${cScore}`, 'Tap Stage for Rematch');
      }

      rafId = requestAnimationFrame(draw);
    }

    const moveY = (clientY) => {
      const rect = canvas.getBoundingClientRect();
      const y = ((clientY - rect.top) / rect.height) * height;
      p1.y = Math.max(8, Math.min(height - p1.h - 8, y - p1.h / 2));
    };
    const onMouse = (e) => moveY(e.clientY);
    const onTouch = (e) => { if (e.touches[0]) moveY(e.touches[0].clientY); };
    const onTap = () => {
      if (state === 'TITLE') state = 'PLAYING';
      else if (state === 'OVER' || state === 'WIN') reset(true);
    };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('click', onTap);

    ctx.registerInput((action) => {
      if (action === 'restart') return reset(true);
      if (action === 'up') p1.y = Math.max(8, p1.y - 26);
      if (action === 'down') p1.y = Math.min(height - p1.h - 8, p1.y + 26);
      if (action === 'action') onTap();
    });

    ctx.onCleanup(() => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('click', onTap);
    });

    reset(false);
    rafId = requestAnimationFrame(draw);
  }
};
