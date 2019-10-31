import React, { useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { services } from '@stuff/piccy-shared';

const useStyles = createUseStyles({
  root: { display: 'block', cursor: 'crosshair' }
});

function Canvas({
  size,
  scale,
  onMouseMove,
  onSelectColor,
  currentColors,
  backgroundColor,
  onUpdate,
  currentTool,
  initialImageData
}) {
  const classes = useStyles();
  const [currentColorIndex, setCurrentColorIndex] = useState(null);
  const [canvas, setCanvas] = useState(null);

  const canvasRef2 = useCallback(
    node => {
      if (node) {
        const ctx = node.getContext('2d');
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size[0] * scale, size[1] * scale);

        const sourceCanvas = document.createElement('canvas');
        const sourceCtx = sourceCanvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;

        sourceCtx.putImageData(initialImageData, 0, 0);
        ctx.drawImage(sourceCanvas, 0, 0, 32, 32, 0, 0, 768, 768);

        onUpdate(node.toDataURL());
        setCanvas(node);
      }
    },
    [initialImageData, backgroundColor, onUpdate, scale, size]
  );

  const ctx = canvas ? canvas.getContext('2d') : null;

  const onClick = useCallback(
    e => {
      if (e.button === 2) {
        e.preventDefault();

        if (currentTool === 'edit') {
          setCurrentColorIndex(0);
          drawPix(ctx, scale, currentColors[0], getPos(canvas, scale, e));
        } else if (currentTool === 'fill') {
          const targetColor = getColorAt(ctx, scale, getPos(canvas, scale, e));
          const replacementColor = currentColors[0];

          fill(
            ctx,
            scale,
            targetColor,
            replacementColor,
            getPos(canvas, scale, e)
          );
        } else if (currentTool === 'pick') {
          const color = getColorAt(ctx, scale, getPos(canvas, scale, e));
          onSelectColor(color, 0);
        }
      } else if (e.button === 0) {
        if (currentTool === 'edit') {
          setCurrentColorIndex(1);
          drawPix(ctx, scale, currentColors[1], getPos(canvas, scale, e));
        } else if (currentTool === 'fill') {
          const targetColor = getColorAt(ctx, scale, getPos(canvas, scale, e));
          const replacementColor = currentColors[1];

          fill(
            ctx,
            scale,
            targetColor,
            replacementColor,
            getPos(canvas, scale, e)
          );
        } else if (currentTool === 'pick') {
          const color = getColorAt(ctx, scale, getPos(canvas, scale, e));
          onSelectColor(color, 1);
        }
      }
    },
    [canvas, ctx, scale, currentColors, currentTool, onSelectColor]
  );

  const onRelease = useCallback(
    e => {
      e.preventDefault();

      setCurrentColorIndex(null);
      onUpdate(
        canvas.toDataURL(),
        ctx.getImageData(0, 0, size[0] * scale, size[1] * scale)
      );
    },
    [ctx, onUpdate, scale, size, canvas]
  );

  const onDraw = useCallback(
    e => {
      onMouseMove(getCursorPosition(canvas, e));

      if (currentColorIndex === null) {
        return;
      }

      if (currentTool === 'edit') {
        drawPix(
          ctx,
          scale,
          currentColors[currentColorIndex],
          getPos(canvas, scale, e)
        );
      }
    },
    [
      ctx,
      scale,
      currentColors,
      currentColorIndex,
      onMouseMove,
      canvas,
      currentTool
    ]
  );

  const onContextMenu = useCallback(e => {
    e.preventDefault();
  }, []);

  return (
    <canvas
      className={classes.root}
      ref={canvasRef2}
      onContextMenu={onContextMenu}
      onMouseDown={onClick}
      onMouseUp={onRelease}
      onMouseMove={onDraw}
      id="canvas"
      width={size[0] * scale}
      height={size[1] * scale}
    />
  );
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}

function getPos(canvas, scale, event) {
  return getCursorPosition(canvas, event).map(val => Math.floor(val / scale));
}

function drawPix(ctx, scale, color, [x, y]) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

function getColorAt(ctx, scale, [x, y]) {
  try {
    const [r, g, b] = ctx.getImageData(x * scale, y * scale, 1, 1).data;
    return services.rgbToHex(r, g, b);
  } catch (e) {
    return false;
  }
}

// function fill2(ctx, scale, targetColor, replacementColor, [x, y]) {
//   if (getColorAt(ctx, scale, [x, y]) === targetColor) {
//     drawPix(ctx, scale, replacementColor, [x, y]);
//     fill(ctx, scale, targetColor, replacementColor, [x, y + 1]);
//     fill(ctx, scale, targetColor, replacementColor, [x, y - 1]);
//     fill(ctx, scale, targetColor, replacementColor, [x - 1, y]);
//     fill(ctx, scale, targetColor, replacementColor, [x + 1, y]);
//   }
// }

// function fill3(ctx, scale, targetColor, replacementColor, [x, y]) {
//   const nodeColor = getColorAt(ctx, scale, [x, y]);
//   if (targetColor === replacementColor) {
//     return;
//   }

//   if (nodeColor !== targetColor) {
//     return;
//   }

//   drawPix(ctx, scale, replacementColor, [x, y]);

//   const queue = [];
//   queue.push([x, y]);

//   while (queue.length !== 0) {
//     const [xx, yy] = queue.shift();

//     const w = [xx + 1, yy];
//     const e = [xx - 1, yy];
//     const n = [xx, yy - 1];
//     const s = [xx, yy + 1];

//     [w, e, n, s].forEach(pix => {
//       if (getColorAt(ctx, scale, pix) === targetColor) {
//         drawPix(ctx, scale, replacementColor, pix);
//         queue.push(pix);
//       }
//     });
//   }
// }

function fill(ctx, scale, targetColor, replacementColor, [x, y]) {
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

export default Canvas;
