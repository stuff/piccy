import React, { useRef, useEffect } from 'react';
import { createUseStyles } from 'react-jss';

interface Props {
  imageData: ImageData;
  scale: number;
}

const useStyles = createUseStyles({
  root: { textAlign: 'center' },
});

function ToolbarPreview({ imageData, scale }: Props) {
  const classes = useStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scaledWidth = imageData.width * scale;
  const scaledHeight = imageData.height * scale;

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) {
      return;
    }

    const ctx = node.getContext('2d');
    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d');

    if (!ctx || !sourceCtx) {
      return;
    }

    ctx.imageSmoothingEnabled = false;

    sourceCtx.putImageData(imageData, 0, 0);

    // prettier-ignore
    ctx.drawImage(
      sourceCanvas, 0, 0, imageData.width, imageData.height,
      0, 0, scaledWidth, scaledHeight
    );
  }, [imageData, scaledWidth, scaledHeight]);

  if (!imageData) {
    return null;
  }

  return (
    <div className={classes.root}>
      <canvas ref={canvasRef} width={scaledWidth} height={scaledHeight} />
    </div>
  );
}

export default ToolbarPreview;
