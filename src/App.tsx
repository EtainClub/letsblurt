/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React, {useEffect, useState, useContext} from 'react';
import {IntlProvider} from 'react-intl';
// app screen
import {AppContainer} from './screens/application';
// locales
import {flattenMessages} from './utils/flattenMessages';
import messages from './locales';
//
import AsyncStorage from '@react-native-community/async-storage';

// contexts
import {
  AuthProvider,
  PostsProvider,
  UIProvider,
  UserProvider,
  SettingsProvider,
} from './contexts';
import {SettingsContext} from '~/contexts';

export default () => {
  const {getItemFromStorage} = useContext(SettingsContext);
  // const language = await AsyncStorage.getItem('language');
  const [locale, setLocale] = useState('en-US');
  //
  useEffect(() => {
    _getLocale();
  }, []);

  const _getLocale = async () => {
    const languages = await getItemFromStorage('languages');
    //const _locale = await AsyncStorage.getItem('locale');
    console.log('[App] locale', languages.locale);
    if (languages.locale) setLocale(languages.locale);
  };

  return (
    <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
      <SettingsProvider>
        <UserProvider>
          <UIProvider>
            <PostsProvider>
              <AuthProvider>
                <AppContainer />
              </AuthProvider>
            </PostsProvider>
          </UIProvider>
        </UserProvider>
      </SettingsProvider>
    </IntlProvider>
  );
};
