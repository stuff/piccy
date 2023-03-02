/* eslint-disable import/no-anonymous-default-export */
import { Color, Palette } from '@/types';

import * as palettes from '../palettes';

export default function (colors: Color[]) {
  const allPalettes = palettes as Record<string, Palette>;

  const p: Palette[] = Object.keys(allPalettes).map((k) => allPalettes[k]);

  return p.find((palette) => {
    return (
      colors[0] === palette.colors[0] &&
      colors[3] === palette.colors[3] &&
      colors[10] === palette.colors[10] &&
      colors[15] === palette.colors[15]
    );
  });
}
