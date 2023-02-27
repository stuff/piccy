import LZString from 'lz-string';
import { createImageData } from 'canvas';

function fromPalettizedData(palettizedData: string) {
  const [, , sizeStr, paletteStr, imageDataStr] =
    palettizedData.match(/([0-9]{1})(.{2})(.{96})(?:(.*))/) ?? [];

  const size = parseInt(sizeStr, 16);

  const colors = createPalette(paletteStr);
  const palettizedImageData = uncompressImageDataString(imageDataStr);

  const imageDataArray = createImageDataArray(
    size,
    colors,
    palettizedImageData
  );

  const imageData = createImgData(imageDataArray, size);

  return {
    size,
    colors,
    imageData,
  };
}

export default fromPalettizedData;

function createImageDataArray(
  size: number,
  colors: string[],
  palettizedImageData: string | null
) {
  const imageDataArray = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = x + y * size;
      const color =
        colors[parseInt((palettizedImageData || '')[index], 16) || 0];
      const [, r, g, b] = color.match(/#(.{2})(.{2})(.{2})/) ?? [];

      imageDataArray.push(parseInt(r, 16));
      imageDataArray.push(parseInt(g, 16));
      imageDataArray.push(parseInt(b, 16));
      imageDataArray.push(255);
    }
  }

  return imageDataArray;
}

function createPalette(paletteStr: string) {
  const colors = [];
  for (let i = 0; i <= 15; i++) {
    const col = paletteStr.substr(i * 6, 6);
    colors.push(`#${col}`);
  }

  return colors;
}

function uncompressImageDataString(imageDataStr: string) {
  return LZString.decompressFromEncodedURIComponent(imageDataStr);
}

function createImgData(imageDataArray: number[], scaledSize: number) {
  return createImageData(Uint8ClampedArray.from(imageDataArray), scaledSize);
}
