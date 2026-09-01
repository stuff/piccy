import { createCanvas, type ImageData } from '@napi-rs/canvas';
import sharp from 'sharp';

import { fromPalettizedData } from '@/services';

function createCanvasFromImageData(
  imageData: ImageData,
  size: number,
  scale: number
) {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ scale: string; data: string }> }
) {
  const { scale = '1', data } = await params;
  const [payload, extension] = data.split('.');

  const { size, imageData } = fromPalettizedData(payload);

  const canvas = createCanvasFromImageData(
    imageData,
    Number(size),
    Number(scale)
  );
  const image = sharp(canvas.toBuffer('image/png'));

  const wantsWebp =
    !!request.headers.get('accept')?.match(/image\/webp/) && extension !== 'png';

  const buffer = wantsWebp
    ? await image.webp({ lossless: true }).toBuffer()
    : await image.png({ palette: true, quality: 100, colors: 16 }).toBuffer();

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': wantsWebp ? 'image/webp' : 'image/png',
    },
  });
}
