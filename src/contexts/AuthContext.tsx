//// firebase
// firebase phone auth
//import auth from '@react-native-firebase/auth';
// firebase firestore (database)
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// keychain
import * as Keychain from 'react-native-keychain';
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
import {LOGIN_TOKEN} from '../screens';

const KEYCHAIN_SERVER = 'users';

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
  switch (action.type) {
    case AuthActionTypes.RESOLVE_AUTH:
      return {...state, authResolved: action.payload};
    case AuthActionTypes.LOGOUT:
      console.log('logout action payload', action.payload);
      console.log('before credentials list', state.currentCredentials);
      return state;
    // newList = state.credentialsList.filter(
    //   (credentials: Credentials) => credentials.username !== action.payload,
    // );
    //      console.log('after credentials list', newList);
    // clear the current credentials and set logout
    // return {
    //   currentCredentials: {username: '', password: ''},
    //   credentialsList: newList,
    //   loggedIn: false,
    //   authResolved: false,
    // };
    case AuthActionTypes.SET_CREDENTIALS:
      console.log('change action payload', action.payload);
      // change credentials
      return {
        currentCredentials: action.payload.currentCredientials,
        credentialsList: action.payload.credentialsList,
        loggedIn: true,
        authResolved: true,
      };
    case AuthActionTypes.CHANGE_CREDENTIALS:
      return {
        ...state,
        currentCredentials: action.payload,
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
    // get credentials and keys list
    const {credentials, keysList} = await _getCredentials(username);
    // @todo update user logged in state
    if (credentials) {
      dispatch({
        type: AuthActionTypes.SET_CREDENTIALS,
        payload: {
          currentCredientials: credentials,
          credentialsList: keysList,
        },
      });
    }
  };

  //// process login
  const processLogin = async (
    credentials: Credentials,
    addingAccount?: boolean,
  ) => {
    console.log('[AuthContext] processLogin adding?', addingAccount);
    // add credentails in case of not loggedin or addingAccount
    if (authState.loggedIn && !addingAccount) return;
    // save the credentials in the keychain
    const keysList = await _storeCredentials(credentials);
    // dispatch action: set credentials
    dispatch({
      type: AuthActionTypes.SET_CREDENTIALS,
      payload: {
        currentCredientials: credentials,
        credentialsList: keysList,
      },
    });
  };

  //// process logout
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

  //// change account
  const changeAccount = async (account: string) => {
    console.log('[AuthContext] changeAccount account', account);
    // get credentials
    const {credentials} = await _getCredentials(account);
    console.log('[AuthContext|changeAccount] key credentials', credentials);
    if (!credentials) {
      console.log('[AuthContext|changeAccount] error! no account');
      return;
    }
    // dispatch action
    dispatch({
      type: AuthActionTypes.CHANGE_CREDENTIALS,
      payload: credentials,
    });
    // change account in the storage
    AsyncStorage.setItem(LOGIN_TOKEN, account);
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
    // retrieve keys list
    const keychain = await Keychain.getInternetCredentials(KEYCHAIN_SERVER);
    // get credentials if exists
    if (keychain) {
      // parse keys
      const keysList = JSON.parse(keychain.password);
      console.log('[_getCredentials] retrieved keys list', keysList);

      // get password
      const credentials = keysList.find(
        (key) => Object.keys(key)[0] === username,
      );
      if (credentials) {
        console.log('[_getCredentials] user exists, credentials', credentials);

        return {
          credentials: {
            username,
            password: Object.values(credentials)[0] as string,
          },
          keysList: keysList,
        };
      }
      return {
        credentials: null,
        keysList: null,
      };
    }
    return {
      credentials: null,
      keysList: null,
    };
  } catch (error) {
    console.log('failed to retrieve credentials', error);
    return {
      credentials: null,
      keysList: null,
    };
  }
};

//// helpers: store credentials as a string
const _storeCredentials = async ({username, password}: Credentials) => {
  try {
    // first retrieve all the stored credentials
    const prevKeychain = await Keychain.getInternetCredentials(KEYCHAIN_SERVER);
    console.log('[storeCredentials] initCrededentials', prevKeychain);
    // set new credentials
    let credentials = {};
    credentials[username] = password;
    // empty keys list
    let keysList = [];
    // if previous keys exist, append them
    if (prevKeychain) {
      // parse credentials which are stored in password
      const prevKeys = JSON.parse(prevKeychain.password);
      // append the new one
      keysList = keysList.concat(prevKeys);
      // check uniqueness
      const sameKey = prevKeys.find((key) => Object.keys(key)[0] === username);
      if (!sameKey) {
        // append the new key
        keysList.push(credentials);
      }
    } else {
      // append the new one first
      keysList.push(credentials);
    }

    // set new keys list
    Keychain.setInternetCredentials(
      KEYCHAIN_SERVER,
      KEYCHAIN_SERVER,
      JSON.stringify(keysList),
    );
    // return
    return keysList;
  } catch (error) {
    console.log('failed to store credentials of', username, error);
    return null;
  }
};

const _removeCredentials = async (username: string) => {
  try {
    const result = await Keychain.resetGenericPassword({service: username});
    //    const result = await Keychain.resetInternetCredentials(KEYCHAIN_SERVER);
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
