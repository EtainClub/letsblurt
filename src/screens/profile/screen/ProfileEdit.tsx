//// react
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// react navigation
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import ActionSheet from 'react-native-actions-sheet';
import {materialTheme} from '~/constants/';

import {
  Images,
  argonTheme,
  BLURT_IMAGE_SERVER,
  STEEM_IMAGE_SERVER,
} from '~/constants';
const IMAGE_SERVER = BLURT_IMAGE_SERVER;
const {width, height} = Dimensions.get('screen');
import {HeaderHeight} from '~/constants/utils';
//// contexts
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc
import {BlockchainTypes} from '~/contexts/types';
import {getNumberStat} from '~/utils/stats';

//// props
interface Props {
  profileData: ProfileData;
  uploading: boolean;
  updating: boolean;
  avatarUrl: string;
  handlePressUpdate: (profile: any) => void;
  handlePhotoUpload: () => void;
  handleCameraUpload: () => void;
}
//// component with default props
const ProfileEditForm = (props: Props): JSX.Element => {
  //// props
  console.log('[ProfileView] props', props);
  const {profile} = props.profileData;
  //// language
  const intl = useIntl();
  //// contexts
  //// stats
  const [name, setName] = useState(profile.metadata.name);
  const [introduction, setIntroduction] = useState(profile.metadata.about);
  const [location, setLocation] = useState(profile.metadata.location);
  const [website, setWebsite] = useState(profile.metadata.website);
  // ref
  const photoUploadRef = useRef(null);

  ////
  const _handlePressUpdate = () => {
    const profile = {
      name,
      introduction,
      location,
      website,
    };
    props.handlePressUpdate(profile);
  };

  //// handle press photo upload
  const _handlePressPhotoUpload = () => {
    console.log('[Posting');
    // show the action modal
    photoUploadRef.current?.setModalVisible(true);
  };

  ////
  const _openImagePicker = () => {
    props.handlePhotoUpload();
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  ///
  const _openCamera = () => {
    props.handleCameraUpload();
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  ////
  const _closeActionSheet = () => {
    // hide the modal
    photoUploadRef.current?.setModalVisible(false);
  };

  return (
    <Block flex style={styles.profileScreen}>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginTop: '1%'}}>
          <Block flex style={styles.profileCard}>
            <Block middle style={styles.avatarContainer}>
              <Block row>
                <Image
                  source={{
                    uri: props.avatarUrl,
                  }}
                  style={[styles.avatar, {left: 10}]}
                />
                <Button
                  onPress={_handlePressPhotoUpload}
                  loading={props.uploading}
                  onlyIcon
                  icon="pencil"
                  iconFamily="font-awesome"
                  iconSize={15}
                  color={argonTheme.COLORS.ERROR}
                  style={{
                    position: 'absolute',
                    left: 80,
                    top: 80,
                  }}
                />

                <ActionSheet ref={photoUploadRef}>
                  <Block center>
                    <Button color="primary" onPress={_openImagePicker}>
                      {intl.formatMessage({id: 'Actionsheet.gallery'})}
                    </Button>
                    <Button color="warning" onPress={_openCamera}>
                      {intl.formatMessage({id: 'Actionsheet.camera'})}
                    </Button>
                    <Button color="gray" onPress={_closeActionSheet}>
                      {intl.formatMessage({id: 'Actionsheet.close'})}
                    </Button>
                  </Block>
                </ActionSheet>
              </Block>
            </Block>
          </Block>
          <Block card center>
            <Input
              borderless
              color="white"
              placeholder={intl.formatMessage({id: 'Profile.display_name'})}
              placeholderTextColor={theme.COLORS.PLACEHOLDER}
              autoCapitalize="none"
              bgColor="transparent"
              style={[styles.input, styles.inputActive]}
              defaultValue={profile.metadata.name}
              onChangeText={(text: string) => setName(text)}
            />
            <Input
              borderless
              color="white"
              placeholder={intl.formatMessage({id: 'Profile.introduction'})}
              placeholderTextColor={theme.COLORS.PLACEHOLDER}
              bgColor="transparent"
              style={[styles.input, styles.inputActive]}
              defaultValue={profile.metadata.about}
            />
            <Input
              borderless
              color="white"
              placeholder={intl.formatMessage({id: 'Profile.location'})}
              placeholderTextColor={theme.COLORS.PLACEHOLDER}
              bgColor="transparent"
              style={[styles.input, styles.inputActive]}
              defaultValue={profile.metadata.location}
            />
            <Input
              borderless
              color="white"
              placeholder={intl.formatMessage({id: 'Profile.website'})}
              placeholderTextColor={theme.COLORS.PLACEHOLDER}
              bgColor="transparent"
              style={[styles.input, styles.inputActive]}
              defaultValue={profile.metadata.website}
            />
            <Button
              onPress={_handlePressUpdate}
              loading={props.updating}
              center
              style={{
                padding: 0,
                width: 100,
                backgroundColor: argonTheme.COLORS.ERROR,
              }}>
              {intl.formatMessage({id: 'Profile.update_button'})}
            </Button>
          </Block>
        </ScrollView>
      </ImageBackground>
    </Block>
  );
};

export {ProfileEditForm};

const styles = StyleSheet.create({
  profileScreen: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight / 100 : 0,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
    flex: 1,
  },
  profileBackground: {
    width: width,
    height: '100%',
    flex: 1,
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
  },
  stats: {
    paddingHorizontal: 40,
    backgroundColor: theme.COLORS.WHITE,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -80,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
  },
  input: {
    width: width * 0.9,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
  inputActive: {
    borderBottomColor: 'white',
  },
});
