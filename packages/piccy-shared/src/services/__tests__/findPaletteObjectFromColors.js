import findPaletteObjectFromColors from '../findPaletteObjectFromColors';
import sweetie16 from '../../palettes/sweetie16';

// prettier-ignore
const colors = [
  '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179',
  '#29366f', '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57'
];

it('should find palette from colors', () => {
  expect(findPaletteObjectFromColors(colors)).toEqual(sweetie16);
});
