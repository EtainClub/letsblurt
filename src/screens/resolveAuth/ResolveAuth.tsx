import React, {useEffect, useContext, useState} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import {AuthContext, UserContext, PostsContext} from '~/contexts';
import {navigate} from '~/navigation/service';

export const LOGIN_TOKEN = 'loginToken';

export const ResolveAuth = (props) => {
  //// props
  //// contexts
  const {authState, setAuthResolved, setCredentials} = useContext(AuthContext)!;
  const {fetchBlockchainGlobalProps} = useContext(UserContext);
  const {postsState, getTagList, fetchCommunities} = useContext(PostsContext);
  // state
  const [fetched, setFetched] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    _resolveEntry();
  }, []);

  useEffect(() => {
    if (fetched) {
      // get blurt global props and get user's vote amount
      fetchBlockchainGlobalProps(username);
      setAuthResolved(true);
      // TODO is this not necessary, why?
      navigate({name: 'Drawer'});
    }
  }, [fetched]);

  //// resolve auth
  const _resolveEntry = async () => {
    // get user login token from storage
    let username = await AsyncStorage.getItem(LOGIN_TOKEN);
    // set category to feed if username exists
    if (username) {
      // fetch tags
      getTagList(username);
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
      // fetch tags
      await getTagList();
      navigate({name: 'Welcome'});
    }
  };

  return null;
};
