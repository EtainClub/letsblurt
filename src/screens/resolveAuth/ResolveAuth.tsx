import React, {useEffect, useContext, useState} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import {AuthContext, UserContext, PostsContext} from '~/contexts';
import {navigate} from '~/navigation/service';

export const LOGIN_TOKEN = 'loginToken';

export const ResolveAuth = (props) => {
  //// props
  console.log('[ResolveAuth] props', props);
  //// contexts
  const {authState, setAuthResolved, setCredentials} = useContext(AuthContext)!;
  const {fetchBlockchainGlobalProps} = useContext(UserContext);
  const {postsState, getTagList, fetchCommunities} = useContext(PostsContext);
  // state
  const [fetched, setFetched] = useState(false);
  const [username, setUsername] = useState(null);

  console.log('ResolveAuthScreen, auth state', authState);

  useEffect(() => {
    _resolveEntry();
  }, []);

  useEffect(() => {
    console.log('[ResolveAuthScreen], fetched effect, fetched', fetched);

    if (fetched) {
      console.log(
        '[ResolveAuth|useEffect] fetched Community list',
        postsState.communityList,
      );
      // get steem global props and get user's vote amount
      fetchBlockchainGlobalProps(username);
      setAuthResolved(true);
      // TODO is this not necessary, why?
      navigate({name: 'Drawer'});
    }
  }, [fetched]);

  //// resolve auth
  const _resolveEntry = async () => {
    // fetch tags
    const tagList = await getTagList();
    console.log('[_resolveEntry] tagList', tagList);
    // get user login token from storage
    let username = await AsyncStorage.getItem(LOGIN_TOKEN);
    // set category to feed if username exists
    if (username) {
      // set username
      setUsername(username);
      // retrieve all credentials
      await setCredentials(username);
      // fetch community list
      //      await fetchCommunities(username);
      // set fetched flag
      setFetched(true);
    } else {
      // @todo no communiy list at first, handle this
      navigate({name: 'Welcome'});
    }
  };

  return null;
};
