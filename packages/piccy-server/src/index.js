// import LZString from 'lz-string';
import path from 'path';
import express from 'express';
import { createCanvas } from 'canvas';

import { palettes, services } from '@stuff/piccy-shared';

const PORT = 3001;
const WEBAPP_FOLDER = path.join(__dirname + '../../../piccy-editor/build/');

const app = express();

app.get('/', function(req, res) {
  res.redirect('/edit');
});

app.use(express.static(WEBAPP_FOLDER));

app.get('/img/:data', function(req, res) {
  const { size, imageData } = services.fromPalettizedData(req.params.data, 24);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);

  res.setHeader('Content-Type', 'image/png');
  canvas.pngStream().pipe(res);
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(WEBAPP_FOLDER);
});

app.listen(PORT, () => console.log(`Piccy Server on port ${PORT}!`));
