import { services } from '@stuff/piccy-shared';

export function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}

export function getPos(canvas, scale, event) {
  return getCursorPosition(canvas, event).map(val => Math.floor(val / scale));
}

export function drawPix(ctx, scale, color, [x, y]) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

export function getColorAt(ctx, scale, [x, y]) {
  try {
    const [r, g, b] = ctx.getImageData(x * scale, y * scale, 1, 1).data;
    return services.rgbToHex(r, g, b);
  } catch (e) {
    return false;
  }
}

export function fill(ctx, scale, targetColor, replacementColor, [x, y]) {
  const nodeColor = getColorAt(ctx, scale, [x, y]);
  if (targetColor === replacementColor) {
    return;
  }

  if (nodeColor !== targetColor) {
    return;
  }

  drawPix(ctx, scale, replacementColor, [x, y]);

  const queue = [];
  queue.push([x, y]);

  while (queue.length !== 0) {
    const [xx, yy] = queue.shift();

    const w = [xx + 1, yy];
    if (getColorAt(ctx, scale, w) === targetColor) {
      drawPix(ctx, scale, replacementColor, w);
      queue.push(w);
    }

    const e = [xx - 1, yy];
    if (getColorAt(ctx, scale, e) === targetColor) {
      drawPix(ctx, scale, replacementColor, e);
      queue.push(e);
    }

    const n = [xx, yy - 1];
    if (getColorAt(ctx, scale, n) === targetColor) {
      drawPix(ctx, scale, replacementColor, n);
      queue.push(n);
    }

    const s = [xx, yy + 1];
    if (getColorAt(ctx, scale, s) === targetColor) {
      drawPix(ctx, scale, replacementColor, s);
      queue.push(s);
    }
  }
}
