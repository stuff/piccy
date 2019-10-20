import intToHex from './intToHex';

export default function(r, g, b) {
  return '#' + intToHex(r) + intToHex(g) + intToHex(b);
}
