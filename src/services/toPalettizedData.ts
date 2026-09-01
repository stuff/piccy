/* eslint-disable import/no-anonymous-default-export */
import { Color } from '@/types';
import LZString from 'lz-string';

import intToHex from './intToHex';
import rgbToHex from './rgbToHex';

export default function (
  imageData: any,
  size: number,
  scale: number,
  colors: Color[]
) {
  const palettized = imageData ? [] : new Array(size * size).fill(0);

  if (imageData) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = x * 4 * scale + y * 4 * scale * scale * size;
        const r = imageData.data[index];
        const v = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const hex = rgbToHex(r, v, b);
        const paletteIndex = colors.indexOf(hex);
        palettized.push(paletteIndex);
      }
    }
  }

  const strVersion = '0';
  const strSize = intToHex(size);
  const strPalette = colors.map((color) => color.replace(/#/, '')).join('');

  const strIndexedPixel = palettized
    .map((val) => intToHex(val, false))
    .join('')
    .replace(/0/g, ' ')
    .trimEnd()
    .replace(/ /g, '0');

  const finalString =
    strVersion + // 1 char
    strSize + // 2 chars
    strPalette + // 96 chars (16 * 6)
    (strIndexedPixel.length > 0
      ? LZString.compressToEncodedURIComponent(strIndexedPixel)
      : ''); // various amount of char

  return {
    size,
    palettized,
    smallStr: finalString,
  };
}
