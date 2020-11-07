//// firebase
// firebase phone auth
//import auth from '@react-native-firebase/auth';
// firebase firestore (database)
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// keychain
import * as Keychain from 'react-native-keychain';
//import createDataContext from './createDataContext';
import React, {useReducer, createContext} from 'react';
//
import {
  AuthActionTypes,
  AuthAction,
  AuthContextType,
  AuthState,
  Credentials,
} from './types/authTypes';
import AsyncStorage from '@react-native-community/async-storage';
// navigation
import {navigate} from '../navigation/service';
import {acc} from 'react-native-reanimated';
//
import {LOGIN_TOKEN} from '../screens';

const initialState: AuthState = {
  authResolved: false,
  loggedIn: false,
  currentCredentials: {username: '', password: ''},
  credentialsList: [],
};

// create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth reducer
const authReducer = (state: AuthState, action: AuthAction) => {
  let newList: Credentials[] = [];
  switch (action.type) {
    case AuthActionTypes.RESOLVE_AUTH:
      return {...state, authResolved: action.payload};
    case AuthActionTypes.LOGIN:
      console.log('login action payload', action.payload);
      // append the current credentials to the list
      newList = state.credentialsList;
      newList.push(action.payload);
      console.log('append new credentials', action.payload);
      // set the current credentials and set loggined
      return {
        currentCredentials: action.payload,
        credentialsList: newList,
        loggedIn: true,
        authResolved: true,
      };
    case AuthActionTypes.LOGOUT:
      console.log('logout action payload', action.payload);
      console.log('before credentials list', state.currentCredentials);
      newList = state.credentialsList.filter(
        (credentials: Credentials) => credentials.username !== action.payload,
      );
      console.log('after credentials list', newList);
      // clear the current credentials and set logout
      return {
        currentCredentials: {username: '', password: ''},
        credentialsList: newList,
        loggedIn: false,
        authResolved: false,
      };
    case AuthActionTypes.SET_CREDENTIALS:
      console.log('change action payload', action.payload);
      // change credentials
      return {
        ...state,
        currentCredentials: action.payload,
        loggedIn: true,
      };
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({children}: Props) => {
  // userReducer hook
  // set auth reducer with initial state of auth state
  const [authState, dispatch] = useReducer(authReducer, initialState);
  console.log('[auth provider] authState', authState);

  //// action creators
  ////
  const setAuthResolved = (resolved: boolean) => {
    dispatch({
      type: AuthActionTypes.RESOLVE_AUTH,
      payload: resolved,
    });
  };

  // set credentials
  const setCredentials = async (username: string) => {
    // check sanity
    if (!username) {
      console.log('no username is given', username);
      return;
    }
    // get credentials
    const credentails = await _getCredentials(username);
    // @todo update user logged in state
    dispatch({
      type: AuthActionTypes.SET_CREDENTIALS,
      payload: credentails,
    });
  };

  // skip login if the token exists
  // const tryLoginWithToken = async (username: string) => {
  //   if (username) {
  //     console.log('loginToken exists');
  //     // get credentials
  //     const credentails = await _getCredentials(username);
  //     // @todo update user logged in state
  //     dispatch({
  //       type: AuthActionTypes.CHANGE,
  //       payload: credentails,
  //     });
  //     // navigate to landing screen
  //     navigate({name: 'Drawer'});
  //   } else {
  //     console.log('loginToken is null');
  //     // show intro
  //     navigate({name: 'Intro'});
  //   }
  // };

  // process login
  const processLogin = async (
    credentials: Credentials,
    addingAccount?: boolean,
  ) => {
    console.log('[AuthContext] processLogin adding?', addingAccount);
    // add credentails in case of not loggedin or addingAccount
    if (authState.loggedIn && !addingAccount) return;
    // save the credentials in the keychain
    _storeCredentials(credentials);
    // dispatch action: set credentials
    dispatch({
      type: AuthActionTypes.LOGIN,
      payload: credentials,
    });
    // @todo update firebase user db
  };
  // process logout
  const processLogout = async () => {
    console.log('[AuthContext] processLogout');
    const {currentCredentials} = authState;
    console.log(
      '[AuthContext] processLogout currentCredentails',
      currentCredentials,
    );
    // check sanity
    if (!authState.loggedIn) return;
    // remove login token
    await AsyncStorage.removeItem(LOGIN_TOKEN);
    console.log('removed login token');
    // remove firebase device push token
    _removePushToken(currentCredentials.username);
    // remove the current credentials in the keychain
    _removeCredentials(currentCredentials.username);
    // dispatch action: set credentials
    dispatch({
      type: AuthActionTypes.LOGOUT,
      payload: currentCredentials.username,
    });
  };
  // change account
  const changeAccount = async (account: string) => {
    console.log('[AuthContext] changeAccount account', account);
    // get credentials
    const credentials = await _getCredentials(account);
    if (!credentials) {
      console.log('[AuthContext|changeAccount] error! no account');
      return;
    }
    console.log('[AuthContext|changeAccount] key credentials', credentials);
    // dispatch action
    dispatch({
      type: AuthActionTypes.SET_CREDENTIALS,
      payload: credentials,
    });
  };
  return (
    <AuthContext.Provider
      value={{
        authState,
        setAuthResolved,
        setCredentials,
        processLogin,
        processLogout,
        changeAccount,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

//// helper functions
// get the credentials
const _getCredentials = async (username: string) => {
  try {
    const keyCredentials = await Keychain.getGenericPassword({
      service: username,
    });
    console.log('retrieved credentials', keyCredentials);
    if (keyCredentials) {
      const credentials = {
        username: keyCredentials.username,
        password: keyCredentials.password,
      };
      return credentials;
    }
    return null;
  } catch (error) {
    console.log('failed to retrieve credentials', error);
    return null;
  }
};

const _storeCredentials = async ({username, password}: Credentials) => {
  try {
    const result = await Keychain.setGenericPassword(username, password, {
      service: username,
    });
    console.log('[storeCredentials] result', result);
    // dispatch action. update credentials list
  } catch (error) {
    console.log('failed to store credentials of', username, error);
  }
};

const _removeCredentials = async (username: string) => {
  try {
    const result = await Keychain.resetGenericPassword({service: username});
    console.log('remove credentials result', result);
  } catch (error) {
    console.error('failed to remove credentials', error);
  }
};

// remove push token and signout from firebase
const _removePushToken = async (username: string) => {
  // get user document
  const userRef = firestore().doc(`users/${username}`);
  // remove push token
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log('[logout] doc exists');
        userRef.update({pushToken: null});
        // sign out from firebase
        auth()
          .signOut()
          .then(() => {
            console.log('sign out from firebase');
          })
          .catch((error) =>
            console.log('failed to sign out from firebase', error),
          );
      }
    })
    .catch((error) =>
      console.log('[remove push token] failed to get user document', error),
    );
};

export {AuthContext, AuthProvider};
