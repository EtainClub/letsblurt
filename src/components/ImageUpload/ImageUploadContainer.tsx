//// react
import React, {useState, useEffect, useContext, useRef} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Linking,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// blockchain api
import {signImage, uploadImage} from '~/providers/blurt';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
import {AuthContext, UIContext} from '~/contexts';
//// view
import {ImageUploadView} from './ImageUploadView';

interface Props {
  isComment: boolean;
  containerStyle: any;
  getImageURL: (url: string) => void;
}
const ImageUploadContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  //// refs
  // photo

  ////
  const _handlePhotoUpload = () => {
    console.log('[_handlePhotoUpload]');
    ImagePicker.openPicker({
      width: 640,
      includeBase64: true,
    })
      .then((photos) => {
        console.log('[_handlePhotoUpload]. selected photo', photos);
        _uploadPhoto(photos);
      })
      .catch((error) => {
        _handleSelectionFailure(error);
      });
  };

  ////
  const _handleCameraUpload = () => {
    console.log('[_handleCameraUpload]');
    ImagePicker.openCamera({
      includeBase64: true,
    })
      .then((image) => {
        _uploadPhoto(image);
      })
      .catch((error) => {
        _handleSelectionFailure(error);
      });
  };

  //// handle selection failure
  const _handleSelectionFailure = (error) => {
    console.log('[_handleSelectionFailure]. error', error);
  };

  //// upload a photo
  const _uploadPhoto = async (photo: ImageOrVideo) => {
    console.log('[ImageUpload] _uploadPhoto. photo', photo);
    setUploading(true);
    // check logged in
    if (!authState.loggedIn) {
      setUploading(false);
      //      return;
    }
    const {username, password} = authState.currentCredentials;
    // sign the photo
    let sign = await signImage(photo, username, password);
    console.log('[_uploadPhoto] sign', sign);
    // check sanity
    if (!sign) {
      setUploading(false);
      setToastMessage(intl.formatMessage({id: 'ImageUpload.sign_failed'}));
      //      return;
    }
    // upload photo
    uploadImage(photo, username, sign)
      .then((res) => {
        console.log('[ImageUpload] uploadImage, res', res);
        if (res.data && res.data.url) {
          res.data.hash = res.data.url.split('/').pop();
          setUploading(false);
          setToastMessage(
            intl.formatMessage({id: 'ImageUpload.upload_success'}),
          );
          setUploadedImage(res.data);
          // return the result
          props.getImageURL(res.data.url);
        }
      })
      .catch((error) => {
        console.log('Failed to upload image', error, error.message);
        if (error.toString().includes('code 413')) {
          setToastMessage(intl.formatMessage({id: 'Alert.payload_too_large'}));
        } else if (error.toString().includes('code 429')) {
          setToastMessage(intl.formatMessage({id: 'Alert.quota_exceeded'}));
        } else if (error.toString().includes('code 400')) {
          setToastMessage(intl.formatMessage({id: 'Alert.invalid_image'}));
        } else {
          setToastMessage(intl.formatMessage({id: 'Alert.failed'}));
        }
        // clear uploading
        setUploading(false);
      });
  };

  return (
    true && (
      <ImageUploadView
        isComment={props.isComment}
        containerStyle={props.containerStyle}
        uploading={uploading}
        handlePhotoUpload={_handlePhotoUpload}
        handleCameraUpload={_handleCameraUpload}
      />
    )
  );
};

export {ImageUploadContainer};
