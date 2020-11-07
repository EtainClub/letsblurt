/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React from 'react';
import {IntlProvider} from 'react-intl';
// app screen
import {AppContainer} from './screens/application';
// locales
import {flattenMessages} from './utils/flattenMessages';
import messages from './locales';

// contexts
import {
  AuthProvider,
  PostsProvider,
  UIProvider,
  UserProvider,
  SettingsProvider,
} from './contexts';

export default () => {
  return (
    <IntlProvider locale="en-US" messages={flattenMessages(messages['en-US'])}>
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
