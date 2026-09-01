import { createCanvas, type ImageData } from '@napi-rs/canvas';
import sharp from 'sharp';

import { fromPalettizedData } from '@/services';

// `scale` arrives straight from the URL, so an unbounded value would let one
// request allocate an arbitrarily large canvas. 128 caps output at 4096px for
// the 32px images the editor produces. Out-of-range values are clamped rather
// than rejected so existing links keep rendering.
const MAX_SCALE = 128;

function parseScale(raw: string) {
  const scale = Math.floor(Number(raw));

  if (!Number.isFinite(scale) || scale < 1) {
    return 1;
  }

  return Math.min(scale, MAX_SCALE);
}

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
    parseScale(scale)
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
