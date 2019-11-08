import { services } from '@stuff/piccy-shared';

export function updateUrl(dataForUrl) {
  window.history.replaceState(null, null, '/edit/' + dataForUrl);
}

export function getDataForUrlFromImageData(imageData, palette, size, scale) {
  const { smallStr: data } = services.toPalettizedData(
    imageData,
    size,
    scale,
    palette.colors
  );

  return data;
}

export function getImageUrlFromEditorUrl() {
  const currentUrl = document.location.toString();
  const matcher = /\/edit\//;

  if (!currentUrl.match(matcher)) {
    return;
  }

  return currentUrl.replace(matcher, '/img/24/');
}
