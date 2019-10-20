// import LZString from 'lz-string';
import express from 'express';
import { createCanvas } from 'canvas';

import { palettes, services } from '@stuff/piccy-shared';

const app = express();

const port = 3001;

// console.log(shared);

app.get('/img/:data', function(req, res) {
  // const uncompressed = LZString.decompressFromEncodedURIComponent(
  //   req.params.data
  // );
  // res.send(uncompressed);
  const { size, imageData } = services.fromPalettizedData(req.params.data, 24);
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);

  res.setHeader('Content-Type', 'image/png');
  canvas.pngStream().pipe(res);
  // res.send(services.fromPalettizedData(req.params.data, 24));
});

function draw() {
  var Image = Canvas.Image,
    canvas = new Canvas(200, 200),
    ctx = canvas.getContext('2d');

  ctx.font = '30px Impact';
  ctx.rotate(0.1);
  ctx.fillText('Awesome!', 50, 100);

  return canvas;
}

app.listen(port, () => console.log(`Piccy Server on port ${port}!`));
