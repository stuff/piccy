import React, { MouseEventHandler, useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';

import {
  drawPix,
  fill,
  getColorAt,
  getPos,
  getCursorPosition,
} from '@/helpers/canvas';

import { Color, Point } from '@/types';

interface Props {
  size: [number, number];
  scale: number;
  onMouseMove: (pos: Point) => void;
  onSelectColor: (color: string, type: number) => void;
  currentColors: Color[];
  backgroundColor: string;
  onUpdate: (imageStr: string, imgData?: ImageData) => void;
  currentTool: string;
  initialImageData: ImageData;
}

const RIGHT_MOUSE_BUTTON = 2;

const useStyles = createUseStyles({
  root: { display: 'block', cursor: 'crosshair' },
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
  initialImageData,
}: Props) {
  const classes = useStyles();
  const [currentColorIndex, setCurrentColorIndex] = useState<number | null>(
    null
  );
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const canvasRef2 = useCallback(
    (node: HTMLCanvasElement) => {
      if (node && initialImageData) {
        const ctx = node.getContext('2d');

        if (!ctx) {
          return;
        }

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size[0] * scale, size[1] * scale);

        const sourceCanvas = document.createElement('canvas');
        const sourceCtx = sourceCanvas.getContext('2d');

        if (!sourceCtx) {
          return;
        }

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
    (colorIndex: number, pos: Point) => {
      if (!ctx) {
        return;
      }
      setCurrentColorIndex(colorIndex);
      drawPix(ctx, scale, currentColors[colorIndex], pos);
    },
    [ctx, scale, currentColors]
  );

  const fillFunc = useCallback(
    (colorIndex: number, pos: Point) => {
      if (!ctx) {
        return;
      }

      const targetColor = getColorAt(ctx, scale, pos);
      const replacementColor = currentColors[colorIndex];

      if (!targetColor) {
        return;
      }

      fill(ctx, scale, targetColor, replacementColor, pos);
    },
    [ctx, scale, currentColors]
  );

  const getColorFunc = useCallback(
    (mouseButtonIndex: number, pos: Point) => {
      if (!ctx) {
        return;
      }

      const color = getColorAt(ctx, scale, pos);
      if (!color) {
        return;
      }

      // console.log(currentColors);

      onSelectColor(color, mouseButtonIndex);
    },
    [ctx, scale, onSelectColor]
  );

  const onClick = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    (e) => {
      if (!canvas) {
        return;
      }

      const pos = getPos(canvas, scale, e);
      let mouseButtonIndex = 1;

      if (e.button === RIGHT_MOUSE_BUTTON) {
        e.preventDefault();
        mouseButtonIndex = 0;
      }

      switch (currentTool) {
        case 'edit':
          drawFunc(mouseButtonIndex, pos);
          break;

        case 'fill':
          fillFunc(mouseButtonIndex, pos);
          break;

        case 'pick':
          getColorFunc(mouseButtonIndex, pos);
          break;

        default:
          break;
      }
    },
    [canvas, scale, currentTool, drawFunc, fillFunc, getColorFunc]
  );

  const onRelease = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    (e) => {
      e.preventDefault();

      if (!canvas || !ctx) {
        return;
      }

      setCurrentColorIndex(null);
      onUpdate(
        canvas.toDataURL(),
        ctx.getImageData(0, 0, size[0] * scale, size[1] * scale)
      );
    },
    [ctx, onUpdate, scale, size, canvas]
  );
  // MouseEvent<HTMLCanvasElement, MouseEvent>
  const onDraw = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    (e) => {
      if (!canvas || !ctx) {
        return;
      }

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
      currentTool,
    ]
  );

  const onContextMenu = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    (e) => {
      e.preventDefault();
    },
    []
  );

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
