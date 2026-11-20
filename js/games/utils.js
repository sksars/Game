// Shared Canvas & Touch Input helpers for all PlayGrid games

export function createCanvasStage(ctx, width = 480, height = 420) {
  ctx.stage.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.aspectRatio = `${width} / ${height}`;
  ctx.stage.appendChild(canvas);

  const fitCanvas = () => {
    const cs = getComputedStyle(ctx.stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const availW = Math.max(180, ctx.stage.clientWidth - padX);
    const availH = Math.max(180, ctx.stage.clientHeight - padY);
    const scale = Math.min(availW / width, availH / height);
    canvas.style.width = `${Math.floor(width * scale)}px`;
    canvas.style.height = `${Math.floor(height * scale)}px`;
  };

  requestAnimationFrame(fitCanvas);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fitCanvas) : null;
  if (ro) ro.observe(ctx.stage);
  window.addEventListener('resize', fitCanvas);
  if (typeof ctx.onStageResizeCleanup === 'function') {
    ctx.onStageResizeCleanup(() => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', fitCanvas);
    });
  }

  const c = canvas.getContext('2d');
  return { canvas, c, width, height };
}

export function attachSwipe(el, onDir, cleanupList) {
  let sx = 0;
  let sy = 0;
  const onStart = (e) => {
    const t = e.touches[0];
    if (!t) return;
    sx = t.clientX;
    sy = t.clientY;
  };
  const onEnd = (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      onDir(dx > 0 ? 'right' : 'left');
    } else {
      onDir(dy > 0 ? 'down' : 'up');
    }
  };
  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchend', onEnd, { passive: true });
  cleanupList.push(() => {
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchend', onEnd);
  });
}

export function drawOverlayCard(c, w, h, title, subtitle, hint = 'Tap Stage or Press Space') {
  c.save();
  c.fillStyle = 'rgba(11, 17, 32, 0.78)';
  c.fillRect(0, 0, w, h);

  const boxW = Math.min(w - 40, 320);
  const boxH = 148;
  const bx = (w - boxW) / 2;
  const by = (h - boxH) / 2;

  c.fillStyle = '#131c31';
  c.strokeStyle = '#334569';
  c.lineWidth = 1.5;
  roundRect(c, bx, by, boxW, boxH, 12);
  c.fill();
  c.stroke();

  c.textAlign = 'center';
  c.fillStyle = '#f8fafc';
  c.font = '700 22px Outfit, sans-serif';
  c.fillText(title, w / 2, by + 44);

  c.fillStyle = '#cbd5e1';
  c.font = '500 14px "Plus Jakarta Sans", sans-serif';
  c.fillText(subtitle, w / 2, by + 76);

  c.fillStyle = '#60a5fa';
  c.font = '600 13px "Plus Jakarta Sans", sans-serif';
  c.fillText(hint, w / 2, by + 114);
  c.restore();
}

export function roundRect(c, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rad, y);
  c.arcTo(x + w, y, x + w, y + h, rad);
  c.arcTo(x + w, y + h, x, y + h, rad);
  c.arcTo(x, y + h, x, y, rad);
  c.arcTo(x, y, x + w, y, rad);
  c.closePath();
}

export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
