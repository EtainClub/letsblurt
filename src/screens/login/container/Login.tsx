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
import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';
import {LOGIN_TOKEN} from '~/screens';

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
  // const {} = useContext(PostsContext);

  const _updateUserDB = async (username: string) => {
    // sign in firebase anonymously
    await auth()
      .signInAnonymously()
      .then((result) => console.log('signed in firebase', result))
      .catch((error) => console.log('failed to sign in firebase', error));

    //// get device push token
    // request permission
    messaging()
      .getToken()
      .then(async (pushToken) => {
        //// save the push token to user db
        // create user document with username
        // check if the user document exists
        const userRef = firestore().collection('users').doc(username);
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
                  username: username,
                  createdAt: new Date(),
                  lastLoginAt: new Date(),
                })
                .then(() => console.log('created user document'))
                .catch((error) =>
                  console.log('failed to create a user document', error),
                );
            } else {
              console.log('user doc exists, username', username);
              // update push token
              userRef.update({pushToken, lastLoginAt: new Date()});
            }
            // save the username to async storage for auto login
            AsyncStorage.setItem(LOGIN_TOKEN, username);
          })
          .catch((error) => {
            console.log('failed to get user document', error);
          });
      })
      .catch((error) => console.log('failed to get push token', error));
  };

  const _processLogin = async (username: string, password: string) => {
    console.log('[LoginContainer] _processLogin, username', username);
    // first check account exists
    const account = await getAccount(username);
    if (!account) {
      console.log('failed. login. username does not exist', username);
      setToastMessage(intl.formatMessage({id: 'Login.msg_username'}));
      return false;
    }
    // @test (etainclub)
    //    password = Config.ETAINCLUB_POSTING_WIF;
    // @test (letsblur)
    //    password = Config.CREATOR_POSTING_WIF;
    // verify the private key
    const valid = await verifyPassoword(username, password);
    if (!valid) {
      setToastMessage(intl.formatMessage({id: 'Login.msg_password'}));
      return false;
    }

    //// process login
    console.log('password is valid');
    // process login action
    processLogin({username, password}, addingAccount);
    // process firestore login
    _updateUserDB(username);

    // fetch communities of user
    //      fetchCommunities(username);

    console.log('account info', account);
    // @test get the credentials
    console.log('after process login authState', authState);
    setToastMessage(`logged in as ${username}`);
    // update user vote amount
    updateVoteAmount(username);
    // navigate to feed
    navigate({name: 'Feed'});
  };
  return <LoginScreen processLogin={_processLogin} />;
};

export {Login};
