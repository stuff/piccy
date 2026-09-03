/* eslint-disable import/no-anonymous-default-export */
import { Color } from '@/types';
import {
  encodeShortestPalettizedData,
  palettizeImageData,
} from './palettizedCodec';

export default function (
  imageData: any,
  size: number,
  scale: number,
  colors: Color[]
) {
  const palettized = palettizeImageData(imageData, size, scale, colors);
  const finalString = encodeShortestPalettizedData(size, colors, palettized);

  return {
    size,
    palettized,
    smallStr: finalString,
  };
}
