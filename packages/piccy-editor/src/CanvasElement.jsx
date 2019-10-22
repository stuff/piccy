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
    canvas => {
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = currentColor;

      let draw = false;

      if (!initialized) {
        const updateParent = () => {
          onUpdate(
            canvas.toDataURL(),
            ctx.getImageData(0, 0, size[0] * scale, size[1] * scale)
          );
        };

        const drawPix = ([x, y]) => {
          ctx.fillRect(x * scale, y * scale, scale, scale);
          ctx.fill();
        };
        const getPos = e =>
          getCursorPosition(canvas, e).map(val => Math.floor(val / scale));

        // background
        ctx.fillRect(0, 0, size[0] * scale, size[1] * scale);
        ctx.fillStyle = backgroundColor;
        ctx.fill();

        if (initialImageData) {
          const sourceCanvas = document.createElement('canvas');
          const sourceCtx = sourceCanvas.getContext('2d');

          ctx.imageSmoothingEnabled = false;

          sourceCtx.putImageData(initialImageData, 0, 0);
          ctx.drawImage(sourceCanvas, 0, 0, 32, 32, 0, 0, 768, 768);

          onUpdate(canvas.toDataURL());
        }

        canvas.addEventListener('mousemove', function(e) {
          onMouseMove(getCursorPosition(canvas, e));

          if (!draw) {
            return;
          }

          drawPix(getPos(e));
        });

        canvas.addEventListener('mousedown', function(e) {
          draw = true;
          drawPix(getPos(e));
        });

        canvas.addEventListener('mouseup', function(e) {
          draw = false;
          updateParent();
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
      backgroundColor,
      initialImageData
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
