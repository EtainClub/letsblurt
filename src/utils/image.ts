import {Platform} from 'react-native';
// @todo need to implement this for steemit
//import {proxifyImageSrc} from '@esteemapp/esteem-render-helpers';
import {proxifyImageSrc} from '~/utils/render-helpers';

import {BLURT_IMAGE_SERVERS, STEEM_IMAGE_SERVER} from '~/constants';
const IMAGE_SERVER = BLURT_IMAGE_SERVERS[0];

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
  return `${IMAGE_SERVER}/u/${author}/avatar/${sizeString}`;
};
