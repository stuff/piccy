import LZString from 'lz-string';
import { createImageData } from 'canvas';

export default function(palettizedData, scale = 1) {
  const [, , sizeStr, paletteStr, imageDataStr] = palettizedData.match(
    /([0-9]{1})(.{2})(.{96})(.*)/
  );

  const size = parseInt(sizeStr, 16);
  const scaledSize = size * scale;

  const colors = [];
  for (let i = 0; i <= 15; i++) {
    const col = paletteStr.substr(i * 6, 6);
    colors.push(`#${col}`);
  }

  const palettizedImageData = LZString.decompressFromEncodedURIComponent(
    imageDataStr
  );

  const imageDataArray = [];
  for (let y = 0; y < size; y++) {
    for (let i = 0; i < scale; i++) {
      for (let x = 0; x < size; x++) {
        const index = x + y * size;
        const color = colors[parseInt(palettizedImageData[index], 16) || 0];
        const [, r, g, b] = color.match(/#(.{2})(.{2})(.{2})/);

        for (let j = 0; j < scale; j++) {
          imageDataArray.push(parseInt(r, 16));
          imageDataArray.push(parseInt(g, 16));
          imageDataArray.push(parseInt(b, 16));
          imageDataArray.push(255);
        }
      }
    }
  }

  // const imageData = new ImageData(
  //   Uint8ClampedArray.from(imageDataArray),
  //   scaledSize
  // );

  const imageData = createImageData(
    Uint8ClampedArray.from(imageDataArray),
    scaledSize
  );

  return {
    size: scaledSize,
    colors,
    imageData
  };
}
