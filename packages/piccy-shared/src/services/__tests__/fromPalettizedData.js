import { ImageData } from 'canvas';

import fromPalettizedData from '../fromPalettizedData';

const palettizedData =
  '0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57IwJgzALArADH8MU5LVvRzXs93-BhRxJpZ5FlV1Ntd9DjTzLrb7HFARkA';

const expected = {
  size: 32,
  // prettier-ignore
  colors: [
    '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179',
    '#29366f', '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57'
  ],
  // prettier-ignore
  imageDataArray6FirstPixels: [93,39,93,255, 177,62,83,255, 239,125,87,255, 255,205,117,255, 167,240,112,255, 26,28,44,255],
  // prettier-ignore
  imageDataArraylastPixel: [115,239,247,255]
};

let size;
let colors;
let imageData;

beforeEach(() => {
  ({ size, colors, imageData } = fromPalettizedData(palettizedData));
});

it('should return correct scaled size', () => {
  expect(size).toEqual(expected.size);
});

it('should return correct palette', () => {
  expect(colors).toEqual(expected.colors);
});

it('should return an ImageData of correct scaled size', () => {
  expect(imageData).toBeInstanceOf(ImageData);
  expect(imageData.width).toEqual(size);
  expect(imageData.height).toEqual(size);
});

it('should return correct image data (6 first pixels)', () => {
  expect(Array.from(imageData.data).slice(0, 6 * 4)).toEqual(
    expected.imageDataArray6FirstPixels
  );
});

it('should return correct image data (last pixel)', () => {
  const a = Array.from(imageData.data);
  expect(a.slice(a.length - 1 * 4, a.length)).toEqual(
    expected.imageDataArraylastPixel
  );
});

it('should handle case with with no image data at all', () => {
  const palettizedData =
    '0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57';

  ({ imageData } = fromPalettizedData(palettizedData));

  expect(imageData).toBeInstanceOf(ImageData);
  expect(imageData.width).toEqual(size);
  expect(imageData.height).toEqual(size);
});
