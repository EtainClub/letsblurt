import React, {useState, useEffect, useContext} from 'react';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
// firebase
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// blockchain api
import {verifyPassoword} from '~/providers/blurt/dblurtApi';
import {navigate} from '~/navigation/service';
import {LoginScreen} from '../screen/Login';
//// contexts
import {
  AuthContext,
  PostsContext,
  UIContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
import {INITIAL_SETTINGS, StorageSchema} from '~/contexts/types';

import {LOGIN_TOKEN} from '~/screens';
import {OTP} from '~/components';

import AsyncStorage from '@react-native-community/async-storage';

interface Props {
  route: any;
}

const Login = (props: Props): JSX.Element => {
  //// props
  console.log('[LoginContainer] props', props);
  const {route} = props;
  const addingAccount = route.params?.addingAccount;
  //// language
  const intl = useIntl();
  //// contexts
  const {authState, processLogin} = useContext(AuthContext);
  const {uiState, setToastMessage} = useContext(UIContext);
  const {userState, updateVoteAmount, getFollowings} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [passwordType, setPasswordType] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  //// effects
  // event: logged in
  useEffect(() => {
    if (loggedIn) {
      // navigate to feed
      console.log('[Feed] logged in event');
      // reset logged in
      setLoggedIn(false);
      // navigate to the Feed screen
      navigate({name: 'Feed'});
    }
  }, [loggedIn]);

  //// start to process login
  const _processLogin = async (_username: string, _password: string) => {
    //// sign in to blockchain: check username and key
    console.log('[LoginContainer] _processLogin, username', _username);
    // verify the private key
    const {account, keyType} = await verifyPassoword(_username, _password);
    if (!account) {
      setToastMessage(intl.formatMessage({id: 'Login.login_error'}));
      return false;
    }

    //// firebase login and update doc
    // sign in to firebase anonymously to use firebase firestore
    await auth()
      .signInAnonymously()
      .then((result) => console.log('signed in firebase', result))
      .catch((error) => console.log('failed to sign in firebase', error));
    // create or update user db
    _updateUserDB(_username);

    //// fetch user data
    // update followings which is required in fetching feed
    await getFollowings(_username);
    // update user vote amount
    await updateVoteAmount(_username);

    //// process login action
    processLogin(
      {username: _username, password: _password, type: keyType},
      addingAccount,
      settingsState.securities.useAutoLogin,
    );
    ////
    // show login toast message
    setToastMessage(
      intl.formatMessage({id: 'Login.logged_in'}, {what: _username}),
    );

    // trigger navigation
    setLoggedIn(true);
    return true;
  };

  //// update user data on firestore
  const _updateUserDB = async (_username: string) => {
    //// get device's push token
    // request permission
    messaging()
      .getToken()
      .then(async (pushToken) => {
        //// save the push token to user db
        // create user document with username
        // check if the user document exists
        const userRef = firestore().collection('users').doc(_username);
        userRef
          .get()
          .then(async (doc) => {
            // create a new document
            if (!doc.exists) {
              console.log('user doc does not exist');
              // get perferred language
              const _languages = await AsyncStorage.getItem(
                StorageSchema.LANGUAGES,
              );
              const languages = JSON.parse(_languages);
              // create a user doc
              userRef
                .set({
                  pushToken,
                  username: _username,
                  createdAt: new Date(),
                  lastLoginAt: new Date(),
                  dndTimes: null,
                  pushNotifications: INITIAL_SETTINGS.pushNotifications,
                  locale: languages.locale,
                })
                .then(() => console.log('created user document'))
                .catch((error) =>
                  console.log('failed to create a user document', error),
                );
            } else {
              console.log('user doc exists, username', _username);
              // update push token
              userRef.update({pushToken, lastLoginAt: new Date()});
            }
            // save the username to async storage for auto login
            AsyncStorage.setItem(LOGIN_TOKEN, _username);
          })
          .catch((error) => {
            console.log('failed to get user document', error);
          });
      })
      .catch((error) => console.log('failed to get push token', error));
  };

  //// render
  return <LoginScreen processLogin={_processLogin} />;
};

export {Login};

//// process otp
//   // logic
//   // 1. the user never login in firebase (no user doc exists)
//   // then, show otp and get the phone number and save it in update DB
//   // 2. the user has doc which includes phone number, but not setting usingOTP,
//   // then, do not show otp
//   // otherwise, show otp
//   const _processOTP = (username: string, password: string, keyType: number) => {
//     //// check if the user has no phone number
//     // get user doc
//     const userRef = firestore().collection('users').doc(username);
//     userRef
//       .get()
//       .then(async (doc) => {
//         // check if a doc exists
//         if (!doc.exists) {
//           console.log('user doc does not exist');
//           // open otp modal
// //          setShowOTP(true);
//         } else {
//           console.log('[login|processOTP] doc data', doc.data());
//           // set the phone number to user context
// //          setPhoneNumberState(doc.data().phone);
//           // check setting if login opt is on
//           if (!__DEV__ && settingsState.securities.useOTP) {
//             // set phone number
// //            setPhoneNumber(doc.data().phone);
// //            setShowOTP(true);
//           } else {
//             // update followings which is required in fetching feed
//             await getFollowings(username);
//             console.log('[Feed] got followings');
//             _updateUserDB(username);
//             setToastMessage(`logged in as ${username}`);
//             // update user vote amount
//             await updateVoteAmount(username);
//             // set logged in to navigate to feed
//             setLoggedIn(true);
//             // process login action
//             processLogin(
//               {username: username, password: password, type: keyType},
//               addingAccount,
//               settingsState.securities.useAutoLogin,
//             );
//           }
//         }
//       })
//       .catch((error) => {
//         console.log('failed to get user doc', error);
//       });
//   };

// const _handleOTPResult = async (valid: boolean, _phoneNumber?: string) => {
//   // hide otp
//   setShowOTP(false);
//   if (_phoneNumber != '') {
//     console.log('phoneNumber', _phoneNumber);
//     setPhoneNumber(_phoneNumber);
//   }
//   console.log('opt result', valid);
//   if (__DEV__ || valid) {
//     // update followings which is required in fetching feed
//     await getFollowings(username);
//     _updateUserDB(username, _phoneNumber);
//     setToastMessage(
//       intl.formatMessage({id: 'Login.loggedin'}, {what: username}),
//     );
//     // update user vote amount
//     await updateVoteAmount(username);
//     // set logged in to navigate to feed
//     setLoggedIn(true);
//     // process login action
//     processLogin(
//       {username: username, password: password, type: passwordType},
//       addingAccount,
//       settingsState.securities.useAutoLogin,
//     );
//   } else {
//     setToastMessage(intl.formatMessage({id: 'Login.otp_error'}));
//     // TODO: then what?
//   }
// };
