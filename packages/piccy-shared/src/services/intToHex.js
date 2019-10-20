export default function(int, pad = true) {
  var hex = int.toString(16);
  return hex.length === 1 && pad ? '0' + hex : hex;
}
