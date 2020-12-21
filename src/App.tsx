/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React, {useEffect, useState} from 'react';
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

export default () => {
  // const language = await AsyncStorage.getItem('language');
  const [locale, setLocale] = useState('en-US');
  //
  useEffect(() => {
    _getLocale();
  }, []);

  const _getLocale = async () => {
    const _locale = await AsyncStorage.getItem('locale');
    console.log('[App] locale', _locale);
    if (_locale) setLocale(_locale);
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
