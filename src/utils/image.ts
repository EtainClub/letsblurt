import {Platform} from 'react-native';
// @todo need to implement this for steemit
//import {proxifyImageSrc} from '@esteemapp/esteem-render-helpers';
import {proxifyImageSrc} from '~/utils/render-helpers';

const OS = Platform.OS;

// @todo need to setup image service
export const getResizedImage = (
  url: string,
  size: number = 600,
  format: string = 'match',
) => {
  //TODO: implement fallback onError, for imagehoster is down case
  format = OS === 'android' ? 'webp' : 'match';
  if (!url) {
    return '';
  }
  return proxifyImageSrc(url, size, 0, format);
};

// @todo need to build image server
export const getResizedAvatar = (
  author: string,
  sizeString: string = 'small',
) => {
  if (!author) {
    return '';
  }

  const url =
    OS === 'android'
      ? 'https://steemitimages.com'
      : 'https://steemitimages.com';
  return `${url}/u/${author}/avatar/${sizeString}`;
};
