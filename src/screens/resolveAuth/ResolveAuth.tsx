import React, {useEffect, useContext, useState} from 'react';
// config
import Config from 'react-native-config';
//
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {AuthContext, UserContext, PostsContext, UIContext} from '~/contexts';
import {navigate} from '~/navigation/service';

export const LOGIN_TOKEN = 'loginToken';

import {OTP} from '~/components';

export const ResolveAuth = (props) => {
  //// props
  //// contexts
  const {authState, setAuthResolved, setCredentials} = useContext(AuthContext)!;
  const {fetchBlockchainGlobalProps} = useContext(UserContext);
  const {postsState, getTagList} = useContext(PostsContext);
  const {setTranslateLanguages} = useContext(UIContext);
  // state
  const [fetched, setFetched] = useState(false);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    _resolveEntry();
  }, []);

  useEffect(() => {
    if (fetched) {
      // get blurt global props and get user's vote amount
      //      fetchBlockchainGlobalProps(username);
      setAuthResolved(true);
      // TODO is this not necessary, why?
      navigate({name: 'Drawer'});
    }
  }, [fetched]);

  //// resolve auth
  const _resolveEntry = async () => {
    // fetch global props
    fetchBlockchainGlobalProps();

    // get user login token from storage
    let username = await AsyncStorage.getItem(LOGIN_TOKEN);
    //
    const languages = await _getSupportedLanguages();
    // set languages
    setTranslateLanguages(languages);
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
      // @test
      //navigate({name: 'Drawer'});
      navigate({name: 'Welcome'});
    }
  };

  /////
  const _getSupportedLanguages = async () => {
    const key = Config.GOOGLE_CLOUD_TRANSLATION_KEY;

    let url = `https://translation.googleapis.com/language/translate/v2/languages?key=${key}`;
    try {
      const result = await axios.get(url);
      console.log('_getSupportedLanguages', result.data.data.languages);
      return result.data.data.languages.map((language) =>
        language.language.toUpperCase(),
      );
    } catch (error) {
      console.log('failed to get translate languages', error);
      return null;
    }
  };

  // const _handleOTPResult = (result: boolean) => {
  //   console.log('opt result', result);
  // };
  // return <OTP usePhoneNumber={true} handleOTPResult={_handleOTPResult} />;

  return null;
};
