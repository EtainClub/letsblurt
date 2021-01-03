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
//// dblurt api
import {isFollowing} from '~/providers/blurt/dblurtApi';
import {ProfileData} from '~/contexts/types';
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
  //// props
  const {profile} = props.profileData;
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {settingsState} = useContext(SettingsContext);
  const {updateFavoriteAuthor, fetchFavorites, isFavoriteAuthor} = useContext(
    PostsContext,
  );
  const {setToastMessage, setAuthorListParam} = useContext(UIContext);
  const {updateFollowState, getFollowings, getFollowers} = useContext(
    UserContext,
  );
  //// states
  const [followingState, setFollowingState] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followings, setFollowings] = useState([]);
  const [showFollowings, setShowFollowings] = useState(false);
  const [favoriteState, setFavoriteState] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  //////// events
  ////
  useEffect(() => {
    if (authState.loggedIn) {
      // get following state
      if (!props.isUser) {
        _setFollowingState(authState.currentCredentials.username, profile.name);
        _setFavoriteState(authState.currentCredentials.username, profile.name);
      }
    }
  }, [followingState]);

  //// set following state
  const _setFollowingState = async (username: string, author: string) => {
    // get user's folloing list
    const _state = await isFollowing(username, author);
    // update the following state
    setFollowingState(_state);
    //    debugger;
  };

  //// set favorite state
  const _setFavoriteState = async (username: string, author: string) => {
    //// get user's favorite list from firebase
    const _state = await isFavoriteAuthor(username, author);
    // update the favorite state
    setFavoriteState(_state);
  };

  ////
  const _handlePressFavorite = async () => {
    console.log('[_handlePressFavorite]');
    setFavoriting(true);
    // check sanity: logged in, not the user itself
    if (!authState.loggedIn || props.isUser) return;
    // update the favorite doc in firebase
    const success = await updateFavoriteAuthor(
      props.profileData.profile.name,
      authState.currentCredentials.username,
      favoriteState,
    );
    setFavoriting(false);
    //// update favorite state
    // in case of removing
    if (favoriteState) {
      setFavoriteState(success ? false : true);
    } else {
      setFavoriteState(success ? true : false);
    }
  };
  ////
  const _handlePressFollow = async () => {
    setFollowing(true);
    const {username, password} = authState.currentCredentials;
    const result = await updateFollowState(
      username,
      password,
      props.profileData.profile.name,
      followingState ? '' : 'blog',
    );
    setFollowingState(followingState ? false : true);
    setToastMessage('Following Successful');
    setFollowing(false);
  };

  ////
  const _handlePressFollowings = async () => {
    // get followings of the author
    const _followings = await getFollowings(profile.name);
    // show list
    //    setFollowings(_followings);
    // set param
    setAuthorListParam(_followings);
    // navigate
    navigate({name: 'AuthorList', params: {authors: _followings}});
  };

  const _handlePressFollowers = async () => {
    // get follower of the author
    const _followers = await getFollowers(profile.name);
    // show list
    //    setFollowers(_followers);
    // set param
    setAuthorListParam(_followers);
    // navigate
    navigate({name: 'AuthorList'});
  };

  return (
    <ProfileView
      profileData={props.profileData}
      isUser={props.isUser}
      favoriting={favoriting}
      favoriteState={favoriteState}
      following={following}
      followingState={followingState}
      handlePressFavorite={_handlePressFavorite}
      handlePressEdit={props.handlePressEdit}
      handlePressFollow={_handlePressFollow}
      handlePressFollowings={_handlePressFollowings}
      handlePressFollowers={_handlePressFollowers}
    />
  );
};

export {ProfileContainer};
