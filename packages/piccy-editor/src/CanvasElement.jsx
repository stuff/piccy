import React, { useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';

import {
  drawPix,
  fill,
  getColorAt,
  getPos,
  getCursorPosition
} from './helpers/canvas';

const RIGHT = 2;
const LEFT = 0;

const useStyles = createUseStyles({
  root: { display: 'block', cursor: 'crosshair' }
});

function CanvasElement({
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

  const drawFunc = useCallback(
    (colorIndex, pos) => {
      setCurrentColorIndex(colorIndex);
      drawPix(ctx, scale, currentColors[colorIndex], pos);
    },
    [ctx, scale, currentColors]
  );

  const fillFunc = useCallback(
    (colorIndex, pos) => {
      const targetColor = getColorAt(ctx, scale, pos);
      const replacementColor = currentColors[colorIndex];

      fill(ctx, scale, targetColor, replacementColor, pos);
    },
    [ctx, scale, currentColors]
  );

  const getColorFunc = useCallback(
    (colorIndex, pos) => {
      const color = getColorAt(ctx, scale, pos);
      onSelectColor(color, colorIndex);
    },
    [ctx, scale, onSelectColor]
  );

  const onClick = useCallback(
    e => {
      const pos = getPos(canvas, scale, e);
      let colorIndex;

      if (e.button === RIGHT) {
        e.preventDefault();
        colorIndex = 0;
      } else if (e.button === LEFT) {
        colorIndex = 1;
      }

      switch (currentTool) {
        case 'edit':
          drawFunc(colorIndex, pos);
          break;

        case 'fill':
          fillFunc(colorIndex, pos);
          break;

        case 'pick':
          getColorFunc(colorIndex, pos);
          break;

        default:
          break;
      }
    },
    [canvas, scale, currentTool, drawFunc, fillFunc, getColorFunc]
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

export default CanvasElement;
