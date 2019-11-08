import * as palettes from '../palettes';

export default function(colors) {
  const p = Object.keys(palettes).map(k => palettes[k]);

  return p.find(palette => {
    return (
      colors[0] === palette.colors[0] &&
      colors[3] === palette.colors[3] &&
      colors[10] === palette.colors[10] &&
      colors[15] === palette.colors[15]
    );
  });
}
