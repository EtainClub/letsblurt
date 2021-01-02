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
import * as RNLocalize from 'react-native-localize';
// contants
import {SUPPORTED_LOCALES} from '~/locales';

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
    // detect default language
    let _locale = RNLocalize.getLocales()[0].languageTag;
    // check if there is a preferred language stored in the storage
    const _languages = await AsyncStorage.getItem('languages');
    if (_languages) {
      const languages = JSON.parse(_languages);
      _locale = languages.locale;
    } else {
      // check if the preferred language is supported by tha app
      if (!SUPPORTED_LOCALES.find((locale) => locale.locale === _locale)) {
        console.log(
          'the preferred language is not supported. preferred langage',
          _locale,
        );
      } else {
        // store the locale in the storage
        const _languages = {locale: _locale, translation: 'EN'};
        AsyncStorage.setItem('languages', JSON.stringify(_languages));
      }
    }
    console.log('[App] locale', _locale);
    setLocale(_locale);
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
