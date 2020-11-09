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
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block} from 'galio-framework';
//// contexts
import {PostsContext, AuthContext, UIContext, UserContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// blockchain
import {fetchUserProfile, fetchWalletData} from '~/providers/blurt/dblurtApi';
//// etc
import {AuthorProfileScreen} from '../screen/AuthorProfile';
import {get, has} from 'lodash';

import {
  Images,
  argonTheme,
  BLURT_IMAGE_SERVER,
  STEEM_IMAGE_SERVER,
} from '~/constants';

//// props
interface Props {
  posts: PostData[];
}
//// component
const AuthorProfile = (props: Props): JSX.Element => {
  //// contexts
  const {uiState} = useContext(UIContext);
  const {getWalletData} = useContext(UserContext);
  //// states
  const [profileFetched, setProfileFetched] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  //////// effects
  //// author set event
  useEffect(() => {
    console.log(
      '[AuthorProfileContainer] selected author',
      uiState.selectedAuthor,
    );

    // start to fetch author profile
    setProfileFetched(false);
    _getAuthorProfile(uiState.selectedAuthor);
  }, [uiState.selectedAuthor]);
  //// profile fetched event
  useEffect(() => {
    // start to fetch wallet data
    if (profileFetched) _getAuthorWallet(uiState.selectedAuthor);
  }, [profileFetched]);

  //////// functions
  // TODO: generalize this for Steem chain
  const IMAGE_SERVER = BLURT_IMAGE_SERVER;
  ////
  const _getAuthorProfile = async (author: string) => {
    const _profileData = await fetchUserProfile(author);
    console.log('[_getAuthorProfile] profile data', _profileData);
    // set profile data
    setProfileData(_profileData);
    // build summaries of blogs
    if (_profileData) {
      // extract summary data from blogs
      const summaries = _profileData.blogRefs.map((blogRef) => {
        // get content
        const blog = get(_profileData.blogs, blogRef, {});
        // get avatar
        const avatar = `${IMAGE_SERVER}/u/${author}/avatar`;
        return {
          author,
          //          avatar,
          title: blog.title,
          createdAt: blog.created,
          postRef: {
            author: author,
            permlink: blogRef.split('/')[1],
          },
        };
      });
      console.log('[_getAuthorProfile] blog summarys', summaries);
      setBlogs(summaries);
      setProfileFetched(true);
    }
  };

  ////
  const _getAuthorWallet = async (author: string) => {
    const walletData = await getWalletData(author);
    console.log('[_getAuthorWallet] wallet Data', walletData);
    setWalletStats(walletData);
  };

  return profileFetched ? (
    profileData && (
      <AuthorProfileScreen
        profileData={profileData}
        blogs={blogs}
        walletData={walletStats}
      />
    )
  ) : (
    <ActivityIndicator size="large" color="black" />
  );
};

export {AuthorProfile};
