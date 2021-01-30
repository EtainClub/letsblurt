//// react
import React, {useEffect, useContext, useState} from 'react';
//// react native
import {Platform} from 'react-native';
// config
import Config from 'react-native-config';
//
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import {
  AuthContext,
  UserContext,
  PostsContext,
  UIContext,
  SettingsContext,
} from '~/contexts';
import {navigate} from '~/navigation/service';

export const LOGIN_TOKEN = 'loginToken';

export const ResolveAuth = (props) => {
  //// props
  //// contexts
  const {authState, setAuthResolved, getCredentials} = useContext(AuthContext)!;
  const {
    fetchBlockchainGlobalProps,
    getFollowings,
    getUserProfileData,
  } = useContext(UserContext);
  const {postsState, getTagList} = useContext(PostsContext);
  const {setToastMessage, setTranslateLanguages, initTTS} = useContext(
    UIContext,
  );
  const {settingsState, getAllSettingsFromStorage} = useContext(
    SettingsContext,
  );
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
    // get settings from storage
    await getAllSettingsFromStorage();
    // fetch global props
    fetchBlockchainGlobalProps();

    // get user login token from storage
    let username = await AsyncStorage.getItem(LOGIN_TOKEN);
    //
    const languages = await _getSupportedLanguages();
    // set languages
    setTranslateLanguages(languages);
    // initialize tts
    initTTS(settingsState.languages.locale);
    // set category to feed if username exists
    if (username) {
      console.log('[resolveAuth] username', username);
      try {
        // get user profile
        const profileData = await getUserProfileData(username);
        console.log('[resolveAuth] profile data', profileData);
        // get followings
        const followings = await getFollowings(username);
        // why this???
        if (!followings) navigate({name: 'Drawer'});
        // fetch tags
        await getTagList(username);
      } catch (error) {
        console.log('failed to fetch initial info (followings, tags)', error);
        setToastMessage('The server is down, Choose another in the settings');
        navigate({name: 'Drawer'});
      }
      console.log('[resolveAuth] after get tag list');
      // set username
      setUsername(username);
      // retrieve all credentials
      await getCredentials(username);
      console.log('[resolveAuth] after set credentials');

      // set fetched flag
      setFetched(true);
    } else {
      // fetch tags
      await getTagList();
      // @test
      //navigate({name: 'Drawer'});
      navigate({name: 'Welcome'});
    }
  };

  /////
  // TODO: put this in the backend
  const _getSupportedLanguages = async () => {
    const key =
      Platform.OS === 'android'
        ? Config.LETSBLURT_ANDROID_TRANSLATION
        : Config.LETSBLURT_IOS_TRANSLATION;

    let url = `https://translation.googleapis.com/language/translate/v2/languages?key=${key}`;
    try {
      const result = await axios.get(url);
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
