import React, { useRef, useEffect } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: { textAlign: 'center' }
});

function ToolbarPreview({ imageData, scale }) {
  const classes = useStyles();
  const canvasRef = useRef();

  const scaledWidth = imageData.width * scale;
  const scaledHeight = imageData.height * scale;

  useEffect(() => {
    const node = canvasRef.current;
    const ctx = node.getContext('2d');
    const sourceCanvas = document.createElement('canvas');
    const sourceCtx = sourceCanvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    sourceCtx.putImageData(imageData, 0, 0);

    // prettier-ignore
    ctx.drawImage(
      sourceCanvas, 0, 0, imageData.width, imageData.height,
      0, 0, scaledWidth, scaledHeight
    );
  }, [imageData, scaledWidth, scaledHeight]);

  return (
    <div className={classes.root}>
      <canvas ref={canvasRef} width={scaledWidth} height={scaledHeight} />
    </div>
  );
}

export default ToolbarPreview;
