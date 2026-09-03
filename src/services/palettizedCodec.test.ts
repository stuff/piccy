import LZString from 'lz-string';
import { describe, expect, it } from 'vitest';

import { na16, sweetie16 } from '@/palettes';
import { Color } from '@/types';

import {
  changePalettizedDataPalette,
  decodePalettizedData,
  encodePalettizedDataV1,
  encodePalettizedDataV2,
  encodeShortestPalettizedData,
} from './palettizedCodec';

const SIZE = 32;
const PIXEL_COUNT = SIZE * SIZE;
const SWEETIE16_V0_PREFIX =
  '0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57';
const BLANK_SWEETIE16_V1 = 'IAEBAP8A_wD_AP8A_wD_AP8A_wA';
const PLUS_V0_PIXELS = '7212dec82bab58e5e3eb1559c0932981';
const PLUS_V0_COMPRESSED =
  'OwJgjCAmCmDGAcIBGBDJBWe13QMzSTHXQE5YAGE3EE+MIA';
const PLUS_V0 = SWEETIE16_V0_PREFIX + PLUS_V0_COMPRESSED;

function getVersion(encoded: string) {
  const firstByte = Buffer.from(encoded.slice(0, 2), 'base64url')[0] ?? 0;
  return firstByte >> 5;
}

function createV0(colors: Color[], palettized: number[]) {
  const palette = colors.map((color) => color.slice(1)).join('');
  const pixels = palettized
    .map((value) => value.toString(16))
    .join('')
    .replace(/0+$/, '');

  return (
    `0${SIZE.toString(16).padStart(2, '0')}${palette}` +
    LZString.compressToEncodedURIComponent(pixels)
  );
}

function createRandomPixels() {
  let state = 0x12345678;

  return new Array(PIXEL_COUNT).fill(0).map(() => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % 16;
  });
}

function expectRoundTrip(
  encoded: string,
  colors: Color[],
  palettized: number[],
  size = SIZE
) {
  expect(decodePalettizedData(encoded)).toEqual({
    size,
    colors,
    palettized,
  });
}

describe('palettized URL codec', () => {
  const patterns = {
    blank: new Array(PIXEL_COUNT).fill(0),
    stripes: new Array(PIXEL_COUNT)
      .fill(0)
      .map((_, index) => Math.floor(index / SIZE) % 16),
    checkerboard: new Array(PIXEL_COUNT)
      .fill(0)
      .map((_, index) => (index + Math.floor(index / SIZE)) % 2),
    random: createRandomPixels(),
  };

  it.each(Object.entries(patterns))(
    'round-trips %s pixels through v1 and v2',
    (_, palettized) => {
      expectRoundTrip(
        encodePalettizedDataV1(SIZE, sweetie16.colors, palettized),
        sweetie16.colors,
        palettized
      );
      expectRoundTrip(
        encodePalettizedDataV2(SIZE, sweetie16.colors, palettized),
        sweetie16.colors,
        palettized
      );
    }
  );

  it.each([16, 24, 32, 64])(
    'round-trips the supported %d pixel size',
    (size) => {
      const palettized = new Array(size * size)
        .fill(0)
        .map((_, index) => index % 16);

      expectRoundTrip(
        encodePalettizedDataV1(size, sweetie16.colors, palettized),
        sweetie16.colors,
        palettized,
        size
      );
      expectRoundTrip(
        encodePalettizedDataV2(size, sweetie16.colors, palettized),
        sweetie16.colors,
        palettized,
        size
      );
    }
  );

  it('round-trips a custom palette through v1 and v2', () => {
    const colors = sweetie16.colors.map((color, index) =>
      index === 0 ? '#010203' : color
    );

    expectRoundTrip(
      encodePalettizedDataV1(SIZE, colors, patterns.checkerboard),
      colors,
      patterns.checkerboard
    );
    expectRoundTrip(
      encodePalettizedDataV2(SIZE, colors, patterns.checkerboard),
      colors,
      patterns.checkerboard
    );
  });

  it.each(Object.entries(patterns))(
    'selects the shorter encoding for %s pixels',
    (_, palettized) => {
      const v1 = encodePalettizedDataV1(
        SIZE,
        sweetie16.colors,
        palettized
      );
      const v2 = encodePalettizedDataV2(
        SIZE,
        sweetie16.colors,
        palettized
      );

      expect(
        encodeShortestPalettizedData(SIZE, sweetie16.colors, palettized)
      ).toBe(v1.length <= v2.length ? v1 : v2);
    }
  );

  it('uses v2 for sparse pixels and v1 for high-entropy pixels', () => {
    const sparse = encodeShortestPalettizedData(
      SIZE,
      sweetie16.colors,
      patterns.blank
    );
    const highEntropy = encodeShortestPalettizedData(
      SIZE,
      sweetie16.colors,
      patterns.random
    );

    expect(getVersion(sparse)).toBe(2);
    expect(getVersion(highEntropy)).toBe(1);
  });

  it('decodes v0 URLs for backward compatibility', () => {
    expectRoundTrip(
      createV0(sweetie16.colors, patterns.checkerboard),
      sweetie16.colors,
      patterns.checkerboard
    );
  });

  it('preserves the existing v1 wire format', () => {
    expect(
      encodePalettizedDataV1(SIZE, sweetie16.colors, patterns.blank)
    ).toBe(BLANK_SWEETIE16_V1);
    expectRoundTrip(
      BLANK_SWEETIE16_V1,
      sweetie16.colors,
      patterns.blank
    );
  });

  it('decodes a blank v0 URL with no pixel suffix', () => {
    expectRoundTrip(SWEETIE16_V0_PREFIX, sweetie16.colors, patterns.blank);
  });

  it('decodes a fixed v0 URL whose LZ payload contains a plus sign', () => {
    const expectedPixels = [
      ...PLUS_V0_PIXELS.split('').map((value) => parseInt(value, 16)),
      ...new Array(PIXEL_COUNT - PLUS_V0_PIXELS.length).fill(0),
    ];

    expectRoundTrip(PLUS_V0, sweetie16.colors, expectedPixels);
  });

  it('uses the compact header with the unchanged v0 pixel compression in v2', () => {
    const pixels = [
      ...PLUS_V0_PIXELS.split('').map((value) => parseInt(value, 16)),
      ...new Array(PIXEL_COUNT - PLUS_V0_PIXELS.length).fill(0),
    ];

    expect(encodePalettizedDataV2(SIZE, sweetie16.colors, pixels)).toBe(
      `QAE${PLUS_V0_COMPRESSED}`
    );
  });

  it.each(['v0', 'v1', 'v2'])(
    'changes the palette of %s data without changing pixel indexes',
    (version) => {
      const encoded =
        version === 'v0'
          ? createV0(sweetie16.colors, patterns.checkerboard)
          : version === 'v1'
            ? encodePalettizedDataV1(
                SIZE,
                sweetie16.colors,
                patterns.checkerboard
              )
            : encodePalettizedDataV2(
                SIZE,
                sweetie16.colors,
                patterns.checkerboard
              );

      const changed = changePalettizedDataPalette(encoded, na16.colors);

      expectRoundTrip(changed, na16.colors, patterns.checkerboard);
      expect(changed).toBe(
        encodeShortestPalettizedData(
          SIZE,
          na16.colors,
          patterns.checkerboard
        )
      );
    }
  );

  it('rejects unsupported binary versions', () => {
    const unsupported = Buffer.from([0b01100000, sweetie16.id]).toString(
      'base64url'
    );

    expect(() => decodePalettizedData(unsupported)).toThrow(
      'Unsupported palettized data version'
    );
  });
});
