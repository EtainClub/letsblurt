//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
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

  return (
    <Block flex style={styles.profileScreen}>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginTop: '1%', maxHeight: height / 3}}>
          <Block flex style={styles.profileCard}>
            <Block middle style={styles.avatarContainer}>
              <Block row>
                <Image
                  source={{
                    uri: `${IMAGE_SERVER}/u/${profile.name}/avatar`,
                  }}
                  style={[styles.avatar, {left: 10}]}
                />
              </Block>
            </Block>
          </Block>
          <Block card center>
            <Input
              borderless
              color="white"
              placeholder="Username"
              type="email-address"
              autoCapitalize="none"
              bgColor="transparent"
              onBlur={() => console.log('onBlur username')}
              onFocus={() => console.log('onFocus username')}
              style={[styles.input, styles.inputActive]}
            />
            <Input
              borderless
              color="white"
              iconColor="white"
              placeholder="Password"
              bgColor="transparent"
              onBlur={() => console.log('onBlur password')}
              onFocus={() => console.log('onFocus password')}
              style={[styles.input, styles.inputActive]}
            />
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
    height: height / 3,
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
