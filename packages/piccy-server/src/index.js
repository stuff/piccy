import path from 'path';
import sharp from 'sharp';
import express from 'express';
import { createCanvas } from 'canvas';

import { palettes, services } from '@stuff/piccy-shared';

const PORT = 3001;
const WEBAPP_FOLDER = path.join(__dirname + '../../../piccy-editor/build/');

const app = express();

app.get('/', (req, res) => {
  res.redirect('/edit');
});

app.use(express.static(WEBAPP_FOLDER));

app.get('/img/:data', (req, res) => {
  res.redirect(301, '/img/1/' + req.params.data);
});

app.get('/img/:scale/:data', async (req, res) => {
  const { size, imageData } = services.fromPalettizedData(req.params.data);
  const { scale = 1 } = req.params;

  const canvas = createCanvasFromImageData(imageData, size, scale);

  res.setHeader('Content-Type', 'image/png');

  const s = sharp(canvas.toBuffer());
  const buffer = await s
    .png({
      palette: true,
      colors: 16
    })
    .toBuffer();

  res.send(buffer);
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(WEBAPP_FOLDER);
});

function createCanvasFromImageData(imageData, size, scale) {
  const sourceCanvas = createCanvas(size, size);
  const sourceCtx = sourceCanvas.getContext('2d');

  const canvas = createCanvas(size * scale, size * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  sourceCtx.putImageData(imageData, 0, 0);

  // prettier-ignore
  ctx.drawImage(sourceCanvas, 0, 0, size, size, 0, 0, size * scale, size * scale);

  return canvas;
}

app.listen(PORT, () => console.log(`Piccy Server on port ${PORT}!`));
