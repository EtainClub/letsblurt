//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
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
import {Block} from 'galio-framework';
//// contexts
import {SettingsContext} from '~/contexts';
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc
import {ProfileView} from './ProfileView';

//// props
interface Props {
  profileData: ProfileData;
  isUser?: boolean;
}
//// component
const ProfileContainer = (props: Props): JSX.Element => {
  //// contexts
  const {settingsState} = useContext(SettingsContext);
  return (
    <ProfileView
      profileData={props.profileData}
      blockchain={settingsState.blockchainType}
      isUser={props.isUser}
    />
  );
};

export {ProfileContainer};
