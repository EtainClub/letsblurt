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
import {
  AuthContext,
  PostsContext,
  SettingsContext,
  UIContext,
  UserContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc
import {ProfileView} from './ProfileView';

//// props
interface Props {
  profileData: ProfileData;
  isUser?: boolean;
  handlePressEdit?: () => void;
}
//// component
const ProfileContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  const {settingsState} = useContext(SettingsContext);
  const {favoriteAuthor, fetchFavorites} = useContext(PostsContext);
  const {setToastMessage} = useContext(UIContext);
  const {updateFollowState} = useContext(UserContext);
  //// states
  const [favoriting, setFavoriting] = useState(false);
  const [following, setFollowing] = useState(false);
  ////
  const _handlePressFavorite = async () => {
    console.log('[_handlePressFavorite]');
    setFavoriting(true);
    // check sanity: logged in, not the user itself
    if (!authState.loggedIn || props.isUser) return;
    // create or append collection in firebase
    favoriteAuthor(
      props.profileData.profile.name,
      authState.currentCredentials.username,
      setToastMessage,
    );
    setFavoriting(false);
  };
  ////
  const _handlePressFollow = async () => {
    setFollowing(true);
    const {username, password} = authState.currentCredentials;
    const result = await updateFollowState(
      username,
      password,
      props.profileData.profile.name,
      'blog',
    );
    setToastMessage('Following Successful');
    setFollowing(false);
  };

  return (
    <ProfileView
      profileData={props.profileData}
      blockchain={settingsState.blockchainType}
      isUser={props.isUser}
      favoriting={favoriting}
      handlePressFavorite={_handlePressFavorite}
      handlePressEdit={props.handlePressEdit}
      handlePressFollow={_handlePressFollow}
      following={following}
    />
  );
};

export {ProfileContainer};
