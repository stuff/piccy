import { ImageData } from '@napi-rs/canvas';
import { decodePalettizedData } from './palettizedCodec';

function fromPalettizedData(palettizedData: string) {
  const { size, colors, palettized } = decodePalettizedData(palettizedData);
  const imageDataArray = createImageDataArray(size, colors, palettized);

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
  palettizedImageData: number[]
) {
  const imageDataArray = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = x + y * size;
      const color = colors[palettizedImageData[index] || 0];
      const [, r, g, b] = color.match(/#(.{2})(.{2})(.{2})/) ?? [];

      imageDataArray.push(parseInt(r, 16));
      imageDataArray.push(parseInt(g, 16));
      imageDataArray.push(parseInt(b, 16));
      imageDataArray.push(255);
    }
  }

  return imageDataArray;
}

function createImgData(imageDataArray: number[], scaledSize: number) {
  return new ImageData(Uint8ClampedArray.from(imageDataArray), scaledSize);
}
