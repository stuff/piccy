// eslint-disable-next-line import/no-anonymous-default-export
export default function(int: number, pad = true) {
  var hex = int.toString(16);
  return hex.length === 1 && pad ? '0' + hex : hex;
}
