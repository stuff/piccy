// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas } from 'canvas';
import sharp from 'sharp';

import { services } from '@stuff/piccy-shared';

type Data = {
  name: string;
};

function createCanvasFromImageData(imageData, size: number, scale: number) {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { scale = '1', data } = req.query as { scale: string, data: string};
  const [d, extension] = data!.split('.');

  const { size, imageData } = services.fromPalettizedData(d);

  const canvas = createCanvasFromImageData(imageData, Number(size), Number(scale));
  const s = sharp(canvas.toBuffer());

  let buffer;

  if (req.headers.accept?.match(/image\/webp/) && extension !== 'png') {
    res.setHeader('Content-Type', 'image/webp');

    buffer = await s.webp({ lossless: true }).toBuffer();
  } else {
    res.setHeader('Content-Type', 'image/png');

    buffer = await s
      .png({
        palette: true,
        quality: 100,
        colors: 16,
      })
      .toBuffer();
  }

  res.send(buffer);
}
