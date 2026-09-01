import LZString from 'lz-string';

import * as palettes from '@/palettes';
import { Color, Palette } from '@/types';

const HEADER_VERSION_BITS = 0b001;
const HEADER_PALETTE_CUSTOM_MASK = 0b00000100;
const HEADER_SIZE_MASK = 0b00011000;

const sizeToCode: Record<number, number> = {
  32: 0,
  16: 1,
  24: 2,
  64: 3,
};

const codeToSize: Record<number, number> = {
  0: 32,
  1: 16,
  2: 24,
  3: 64,
};

const builtinPalettes = Object.values(palettes as Record<string, Palette>).sort(
  (a, b) => a.id - b.id
);

const builtInPaletteById = new Map(
  builtinPalettes.map((palette) => [palette.id, palette] as const)
);

export function palettizeImageData(
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

  return palettized;
}

export function encodePalettizedDataV1(
  size: number,
  colors: Color[],
  palettized: number[]
) {
  const sizeCode = sizeToCode[size] ?? 0;
  const builtInPalette = findBuiltInPalette(colors);
  const isCustomPalette = !builtInPalette;
  const header =
    (HEADER_VERSION_BITS << 5) |
    ((sizeCode << 3) & HEADER_SIZE_MASK) |
    (isCustomPalette ? HEADER_PALETTE_CUSTOM_MASK : 0);

  const bytes: number[] = [header];

  if (isCustomPalette) {
    for (const color of colors) {
      const [r, g, b] = colorToRgb(color);
      bytes.push(r, g, b);
    }
  } else {
    bytes.push(builtInPalette.id & 0b111);
  }

  const localColorIndexes: number[] = [];
  const globalToLocal = new Map<number, number>();

  for (const pixelIndex of palettized) {
    if (!globalToLocal.has(pixelIndex)) {
      globalToLocal.set(pixelIndex, localColorIndexes.length);
      localColorIndexes.push(pixelIndex);
    }
  }

  bytes.push(localColorIndexes.length);
  for (let i = 0; i < localColorIndexes.length; i += 2) {
    const hi = localColorIndexes[i] & 0x0f;
    const lo = (localColorIndexes[i + 1] ?? 0) & 0x0f;
    bytes.push((hi << 4) | lo);
  }

  const localPixels = palettized.map((index) => globalToLocal.get(index) ?? 0);
  const bitPerPixel = Math.max(1, Math.ceil(Math.log2(localColorIndexes.length)));
  const bitWriter = new BitWriter();

  for (let i = 0; i < localPixels.length; ) {
    let repeatLength = 1;
    while (
      i + repeatLength < localPixels.length &&
      localPixels[i + repeatLength] === localPixels[i] &&
      repeatLength < 128
    ) {
      repeatLength++;
    }

    if (repeatLength >= 3) {
      bytes.push(0b10000000 | (repeatLength - 1));
      bytes.push(localPixels[i]);
      i += repeatLength;
      continue;
    }

    const literalStart = i;
    i++;
    while (i < localPixels.length && i - literalStart < 128) {
      let nextRepeatLength = 1;
      while (
        i + nextRepeatLength < localPixels.length &&
        localPixels[i + nextRepeatLength] === localPixels[i] &&
        nextRepeatLength < 128
      ) {
        nextRepeatLength++;
      }

      if (nextRepeatLength >= 3) {
        break;
      }

      i++;
    }

    const literalLength = i - literalStart;
    bytes.push(literalLength - 1);
    bitWriter.reset();
    for (let j = literalStart; j < i; j++) {
      bitWriter.write(localPixels[j], bitPerPixel);
    }
    bytes.push(...bitWriter.toBytes());
  }

  return bytesToBase64Url(Uint8Array.from(bytes));
}

export function decodePalettizedData(palettizedData: string) {
  if (!palettizedData || palettizedData[0] === '0') {
    return decodePalettizedDataV0(palettizedData);
  }

  return decodePalettizedDataV1(palettizedData);
}

function decodePalettizedDataV1(palettizedData: string) {
  const bytes = base64UrlToBytes(palettizedData);
  let offset = 0;

  const header = bytes[offset++] ?? 0;
  const version = header >> 5;
  if (version !== 1) {
    throw new Error('Unsupported palettized data version');
  }

  const sizeCode = (header & HEADER_SIZE_MASK) >> 3;
  const size = codeToSize[sizeCode] ?? 32;
  const isCustomPalette = (header & HEADER_PALETTE_CUSTOM_MASK) !== 0;

  let colors: Color[];
  if (isCustomPalette) {
    colors = [];
    for (let i = 0; i < 16; i++) {
      const r = bytes[offset++] ?? 0;
      const g = bytes[offset++] ?? 0;
      const b = bytes[offset++] ?? 0;
      colors.push(rgbToHex(r, g, b));
    }
  } else {
    const paletteId = bytes[offset++] ?? 0;
    const palette = builtInPaletteById.get(paletteId);
    if (!palette) {
      throw new Error('Unknown built-in palette');
    }
    colors = palette.colors;
  }

  const colorCount = bytes[offset++] ?? 1;
  const colorIndexes: number[] = [];
  for (let i = 0; i < colorCount; i += 2) {
    const packed = bytes[offset++] ?? 0;
    colorIndexes.push((packed >> 4) & 0x0f);
    if (colorIndexes.length < colorCount) {
      colorIndexes.push(packed & 0x0f);
    }
  }

  const bitPerPixel = Math.max(1, Math.ceil(Math.log2(colorCount)));
  const expectedPixels = size * size;
  const palettized: number[] = [];

  while (palettized.length < expectedPixels && offset < bytes.length) {
    const token = bytes[offset++] ?? 0;

    if (token & 0b10000000) {
      const repeatLength = (token & 0b01111111) + 1;
      const localIndex = bytes[offset++] ?? 0;
      const colorIndex = colorIndexes[localIndex] ?? 0;
      for (let i = 0; i < repeatLength && palettized.length < expectedPixels; i++) {
        palettized.push(colorIndex);
      }
      continue;
    }

    const literalLength = (token & 0b01111111) + 1;
    const packedBytesLength = Math.ceil((literalLength * bitPerPixel) / 8);
    const packedValues = bytes.slice(offset, offset + packedBytesLength);
    offset += packedBytesLength;

    const bitReader = new BitReader(Uint8Array.from(packedValues));
    for (let i = 0; i < literalLength && palettized.length < expectedPixels; i++) {
      const localIndex = bitReader.read(bitPerPixel);
      palettized.push(colorIndexes[localIndex] ?? 0);
    }
  }

  return {
    size,
    colors,
    palettized,
  };
}

function decodePalettizedDataV0(palettizedData: string) {
  const [, , sizeStr, paletteStr, imageDataStr] =
    palettizedData.match(/([0-9]{1})(.{2})(.{96})(?:(.*))/) ?? [];

  const size = parseInt(sizeStr, 16);
  const colors = createPalette(paletteStr);
  const palettizedImageData = LZString.decompressFromEncodedURIComponent(imageDataStr);

  const palettized = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = x + y * size;
      palettized.push(parseInt((palettizedImageData || '')[index], 16) || 0);
    }
  }

  return {
    size,
    colors,
    palettized,
  };
}

function findBuiltInPalette(colors: Color[]) {
  return builtinPalettes.find(
    (palette) =>
      palette.colors.length === colors.length &&
      palette.colors.every((color, index) => normalizeColor(color) === normalizeColor(colors[index]))
  );
}

function normalizeColor(color: string) {
  return color.replace('#', '').toLowerCase();
}

function colorToRgb(color: string) {
  const normalized = normalizeColor(color);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(int: number) {
  const hex = int.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function createPalette(paletteStr: string) {
  const colors = [];
  for (let i = 0; i <= 15; i++) {
    const col = paletteStr.substr(i * 6, 6);
    colors.push(`#${col}`);
  }

  return colors;
}

function bytesToBase64Url(bytes: Uint8Array) {
  const base64 = toBase64(bytes);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(str: string) {
  const padding = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return fromBase64(base64);
}

function toBase64(bytes: Uint8Array) {
  if (typeof btoa === 'function') {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  throw new Error('No base64 encoder available');
}

function fromBase64(base64: string) {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
  }

  throw new Error('No base64 decoder available');
}

class BitWriter {
  private bytes: number[] = [];
  private pendingByte = 0;
  private pendingBits = 0;

  write(value: number, bitCount: number) {
    for (let i = bitCount - 1; i >= 0; i--) {
      const bit = (value >> i) & 1;
      this.pendingByte = (this.pendingByte << 1) | bit;
      this.pendingBits++;

      if (this.pendingBits === 8) {
        this.bytes.push(this.pendingByte);
        this.pendingByte = 0;
        this.pendingBits = 0;
      }
    }
  }

  toBytes() {
    if (this.pendingBits > 0) {
      this.bytes.push(this.pendingByte << (8 - this.pendingBits));
      this.pendingByte = 0;
      this.pendingBits = 0;
    }

    return this.bytes;
  }

  reset() {
    this.bytes = [];
    this.pendingByte = 0;
    this.pendingBits = 0;
  }
}

class BitReader {
  private bitPosition = 0;

  constructor(private bytes: Uint8Array) {}

  read(bitCount: number) {
    let value = 0;
    for (let i = 0; i < bitCount; i++) {
      const byteIndex = Math.floor(this.bitPosition / 8);
      const bitIndex = 7 - (this.bitPosition % 8);
      const byte = this.bytes[byteIndex] ?? 0;
      const bit = (byte >> bitIndex) & 1;
      value = (value << 1) | bit;
      this.bitPosition++;
    }
    return value;
  }
}
