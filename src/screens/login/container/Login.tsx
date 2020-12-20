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
import {getAccount, verifyPassoword} from '~/providers/blurt/dblurtApi';
import {navigate} from '~/navigation/service';
import {LoginScreen} from '../screen/Login';
import {
  AuthContext,
  PostsContext,
  UIContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
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
  const {authState, processLogin, processLogout} = useContext(AuthContext);
  const {uiState, setToastMessage} = useContext(UIContext);
  const {userState, updateVoteAmount} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [username, setUsername] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  ////
  const _updateUserDB = async (_username: string, _phoneNumber?: string) => {
    // // sign in firebase anonymously
    // await auth()
    //   .signInAnonymously()
    //   .then((result) => console.log('signed in firebase', result))
    //   .catch((error) => console.log('failed to sign in firebase', error));

    //// get device push token
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
          .then((doc) => {
            // create a new document
            if (!doc.exists) {
              console.log('user doc does not exist');
              // create a user
              userRef
                .set({
                  pushToken,
                  username: _username,
                  createdAt: new Date(),
                  lastLoginAt: new Date(),
                  phone: _phoneNumber,
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

  //// process otp
  // logic
  // 1. the user never login in firebase (no user doc exists)
  // then, show otp and get the phone number and save it in update DB
  // 2. the user has doc which includes phone number, but not setting usingOTP,
  // then, do not show otp
  // otherwise, show otp
  const _processOTP = async (username) => {
    // @test
    //    username = 'ray7272';

    //// check if the user has no phone number
    // get user doc
    const userRef = firestore().collection('users').doc(username);
    userRef
      .get()
      .then((doc) => {
        // check if a doc exists
        if (!doc.exists) {
          console.log('user doc does not exist');
          // open otp modal
          setShowOTP(true);
        } else {
          console.log('[login|processOTP] doc data', doc.data());
          // check setting if login opt is on
          if (!__DEV__ && settingsState.usingOTP) {
            // set phone number
            setPhoneNumber(doc.data().phone);
            setShowOTP(true);
          } else {
            _updateUserDB(username);
            setToastMessage(`logged in as ${username}`);
            // update user vote amount
            updateVoteAmount(username);
            // navigate to feed
            navigate({name: 'Feed'});
          }
        }
      })
      .catch((error) => {
        console.log('failed to get user doc', error);
      });
  };

  const _processLogin = async (_username: string, _password: string) => {
    // @test
    //    username = 'etainclub';
    //    password = Config.ETAINCLUB_POSTING_WIF;
    setUsername(_username);
    console.log('[LoginContainer] _processLogin, username', _username);
    // verify the private key
    const account = await verifyPassoword(_username, _password);
    if (!account) {
      setToastMessage(intl.formatMessage({id: 'Login.login_error'}));
      return false;
    }
    console.log('password is valid');
    //// process login

    // sign in firebase anonymously to use firebase firestore
    await auth()
      .signInAnonymously()
      .then((result) => console.log('signed in firebase', result))
      .catch((error) => console.log('failed to sign in firebase', error));

    // process login action
    processLogin({username: _username, password: _password}, addingAccount);
    // otp
    await _processOTP(_username);
  };

  const _handleOTPResult = (valid: boolean, _phoneNumber?: string) => {
    // hide otp
    setShowOTP(false);
    if (_phoneNumber != '') {
      console.log('phoneNumber', _phoneNumber);
      setPhoneNumber(_phoneNumber);
    }
    console.log('opt result', valid);
    if (valid) {
      _updateUserDB(username, _phoneNumber);
      setToastMessage(`logged in as ${username}`);
      // update user vote amount
      updateVoteAmount(username);
      // navigate to feed
      navigate({name: 'Feed'});
    }
  };

  return showOTP ? (
    <OTP phoneNumber={phoneNumber} handleOTPResult={_handleOTPResult} />
  ) : (
    <LoginScreen processLogin={_processLogin} />
  );
};

export {Login};
