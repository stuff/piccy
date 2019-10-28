import React, { useCallback, useState, useEffect, useRef } from 'react';

function Canvas({
  size,
  scale,
  onMouseMove,
  currentColors,
  backgroundColor,
  onUpdate,
  initialImageData
}) {
  const [currentColorIndex, setCurrentColorIndex] = useState(null);
  const [canvas, setCanvas] = useState(null);

  const canvasRef2 = useCallback(
    node => {
      if (node) {
        console.log('INIT CONTEXT');
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

  const drawPix = useCallback(
    ([x, y], colorIndex) => {
      if (!ctx) {
        return;
      }

      ctx.fillStyle = currentColors[colorIndex];

      ctx.fillRect(x * scale, y * scale, scale, scale);
    },
    [currentColors, currentColorIndex, ctx, scale]
  );

  const getPos = useCallback(
    e => getCursorPosition(canvas, e).map(val => Math.floor(val / scale)),
    [canvas, scale]
  );

  const onClick = useCallback(
    e => {
      e.preventDefault();

      if (e.button === 2 && e.type === 'contextmenu') {
        setCurrentColorIndex(0);
        drawPix(getPos(e), 0);
      } else if (e.button === 0 && e.type === 'mousedown') {
        setCurrentColorIndex(1);
        drawPix(getPos(e), 1);
      }
    },
    [drawPix, getPos]
  );

  const onRelease = useCallback(
    e => {
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

      drawPix(getPos(e), currentColorIndex);
    },
    [currentColorIndex, drawPix, getPos, onMouseMove, canvas]
  );

  return (
    <canvas
      className="canvas"
      ref={canvasRef2}
      onContextMenu={onClick}
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

export default Canvas;
