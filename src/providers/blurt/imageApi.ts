import axios from 'axios';
import Config from 'react-native-config';

const IMAGE_API = 'https://images.blurt.blog';

//// upload image
export const uploadImage = (media, username: string, sign) => {
  const file = {
    uri: media.path,
    type: media.mime,
    name: media.filename || `img_${Math.random()}.jpg`,
    size: media.size,
  };

  const fData = new FormData();
  fData.append('file', file);

  return _upload(fData, username, sign);
};

const _upload = (fd, username: string, signature) => {
  console.log(
    '[imageApi|_upload] baseURL',
    `${IMAGE_API}/${username}/${signature}`,
  );
  const image = axios.create({
    baseURL: `${IMAGE_API}/${username}/${signature}`,
    headers: {
      Authorization: IMAGE_API,
      'Content-Type': 'multipart/form-data',
    },
  });
  return image.post('', fd);
};
