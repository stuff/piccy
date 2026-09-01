import rgbToHex from '@/services/rgbToHex';

import { Point } from '@/types';

export function getCursorPosition(
  canvas: HTMLCanvasElement,
  event: React.MouseEvent
): Point {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}

export function getPos(
  canvas: HTMLCanvasElement,
  scale: number,
  event: React.MouseEvent
) {
  return getCursorPosition(canvas, event).map((val) =>
    Math.floor(val / scale)
  ) as Point;
}

export function drawPix(
  ctx: CanvasRenderingContext2D,
  scale: number,
  color: string,
  [x, y]: Point
) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

export function getColorAt(
  ctx: CanvasRenderingContext2D,
  scale: number,
  [x, y]: Point
) {
  try {
    const [r, g, b] = ctx.getImageData(x * scale, y * scale, 1, 1).data;
    return rgbToHex(r, g, b);
  } catch (e) {
    return null;
  }
}

export function fill(
  ctx: CanvasRenderingContext2D,
  scale: number,
  targetColor: string,
  replacementColor: string,
  [x, y]: Point
) {
  const nodeColor = getColorAt(ctx, scale, [x, y]);
  if (targetColor === replacementColor) {
    return;
  }

  if (nodeColor !== targetColor) {
    return;
  }

  drawPix(ctx, scale, replacementColor, [x, y]);

  const queue: Point[] = [];
  queue.push([x, y]);

  while (queue.length !== 0) {
    const [xx, yy] = queue.shift() as Point;

    const w: Point = [xx + 1, yy];
    if (getColorAt(ctx, scale, w) === targetColor) {
      drawPix(ctx, scale, replacementColor, w);
      queue.push(w);
    }

    const e: Point = [xx - 1, yy];
    if (getColorAt(ctx, scale, e) === targetColor) {
      drawPix(ctx, scale, replacementColor, e);
      queue.push(e);
    }

    const n: Point = [xx, yy - 1];
    if (getColorAt(ctx, scale, n) === targetColor) {
      drawPix(ctx, scale, replacementColor, n);
      queue.push(n);
    }

    const s: Point = [xx, yy + 1];
    if (getColorAt(ctx, scale, s) === targetColor) {
      drawPix(ctx, scale, replacementColor, s);
      queue.push(s);
    }
  }
}
