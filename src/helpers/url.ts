import { Palette } from '@/types';
import { toPalettizedData } from '@/services/index2';

export function updateUrl(dataForUrl: string) {
  window.location.hash = dataForUrl;
}

export function getDataForUrlFromImageData(
  imageData: any,
  palette: Palette,
  size: number,
  scale: number
) {
  const { smallStr: data } = toPalettizedData(
    imageData,
    size,
    scale,
    palette.colors
  );

  return data;
}

export function getImageUrlFromEditorUrl() {
  const imageString = getImageStringFromUrl();
  return document.location.origin + '/image/24/' + imageString;
}

export function getImageStringFromUrl() {
  return document.location.hash.substring(1);
}
