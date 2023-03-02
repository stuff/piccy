import intToHex from './intToHex';

// eslint-disable-next-line import/no-anonymous-default-export
export default function(r: number, g: number, b: number) {
  return '#' + intToHex(r) + intToHex(g) + intToHex(b);
}
