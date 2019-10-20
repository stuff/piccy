import React, { useCallback, useState } from 'react';

function Canvas({
  size,
  scale,
  onMouseMove,
  currentColor,
  backgroundColor,
  onUpdate,
  initialImageData
}) {
  const [initialized, setInitialized] = useState(false);

  const canvasRef = useCallback(
    node => {
      if (!node) {
        return;
      }
      const ctx = node.getContext('2d');
      ctx.fillStyle = currentColor;

      let draw = false;

      if (!initialized) {
        const drawPix = ([x, y]) => {
          ctx.fillRect(x * scale, y * scale, scale, scale);
          ctx.fill();
        };
        const getPos = e =>
          getCursorPosition(node, e).map(val => Math.floor(val / scale));

        // background
        ctx.fillRect(0, 0, size[0] * scale, size[1] * scale);
        ctx.fillStyle = backgroundColor;
        ctx.fill();

        if (initialImageData) {
          ctx.putImageData(initialImageData, 0, 0);
        }

        node.addEventListener('mousemove', function(e) {
          onMouseMove(getCursorPosition(node, e));

          if (!draw) {
            return;
          }

          drawPix(getPos(e));
        });

        node.addEventListener('mousedown', function(e) {
          draw = true;
          drawPix(getPos(e));
        });

        node.addEventListener('mouseup', function(e) {
          draw = false;
          onUpdate(ctx.getImageData(0, 0, size[0] * scale, size[1] * scale));
        });

        setInitialized(true);
      }
    },
    [
      setInitialized,
      initialized,
      onMouseMove,
      onUpdate,
      scale,
      currentColor,
      size,
      backgroundColor
    ]
  );

  return (
    <canvas
      className="canvas"
      ref={canvasRef}
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
