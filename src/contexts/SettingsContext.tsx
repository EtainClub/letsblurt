//// react
import React, {useReducer, createContext} from 'react';
//// storage
import AsyncStorage from '@react-native-community/async-storage';

import {
  SettingsActionTypes,
  INITIAL_SETTINGS,
  SettingsState,
  SettingsContextType,
  SettingsAction,
  BlockchainTypes,
  StorageSchema,
} from './types';

//// initial settings state
const initialState = INITIAL_SETTINGS;

// create settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction) => {
  switch (action.type) {
    case SettingsActionTypes.SET_ALL_SETTINGS:
      return action.payload;
    case SettingsActionTypes.SET_BLOCKCHAIN_TYPE:
      return {...state, blockchainType: action.payload};
    case SettingsActionTypes.SAVE_PASSWORD:
      return {...state, savingPassword: action.payload};
    case SettingsActionTypes.USE_OTP:
      return {...state, usingOTP: action.payload};
    case SettingsActionTypes.SET_LOCALE:
      return {...state, locale: action.payload};
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const SettingsProvider = ({children}: Props) => {
  // userReducer hook
  // set auth reducer with initial state of auth state
  const [settingsState, dispatch] = useReducer(settingsReducer, initialState);
  console.log('[ui provider] state', settingsState);

  //////// action creators

  //// set blockchain type
  const setBlockchainType = (type: BlockchainTypes) => {
    console.log('[setBlockchainType] blockchain', type);
    // dispatch action
    dispatch({
      type: SettingsActionTypes.SET_BLOCKCHAIN_TYPE,
      payload: type,
    });
  };

  //// set saving password
  const savePassword = (save: boolean) => {
    console.log('[savePassword] save?', save);
    // dispatch action
    dispatch({
      type: SettingsActionTypes.SAVE_PASSWORD,
      payload: save,
    });
  };

  //// use otp
  const useOTP = (use: boolean) => {
    console.log('[useOTP] use?', use);
    // dispatch action
    dispatch({
      type: SettingsActionTypes.USE_OTP,
      payload: use,
    });
  };

  //// set locale
  const setLocale = (locale: string) => {
    console.log('[setLocale] locale', locale);
    // dispatch action
    dispatch({
      type: SettingsActionTypes.SET_LOCALE,
      payload: locale,
    });
  };

  //// get all settings from storage
  const getAllSettingsFromStorage = async () => {
    const pushPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.PUSH_NOTIFICATIONS)),
    );
    const dndPromise = new Promise((resolve, reject) => {
      resolve(getItemFromStorage(StorageSchema.DND_TIMES));
    });
    const blockchainPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.BLOCKCHAIN)),
    );
    const securityPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.SECURITIES)),
    );
    const languagePromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.LANGUAGE)),
    );
    const uiPromise = new Promise((resolve, reject) =>
      resolve(getItemFromStorage(StorageSchema.UI)),
    );

    const promises = [
      pushPromise,
      dndPromise,
      blockchainPromise,
      securityPromise,
      languagePromise,
      uiPromise,
    ];
    let settings = null;
    Promise.all(promises)
      .then((results) => {
        console.log('all settings result', results);
        if (!results[0]) return null;
        // parse the storage values
        const _settings = results.map((setting) => JSON.parse(setting));
        // dispatch actions
        dispatch({
          type: SettingsActionTypes.SET_ALL_SETTINGS,
          payload: _settings,
        });
        settings = _settings;
      })
      .catch((error) =>
        console.log('failed to get all settings from storage', error),
      );
    return settings;
  };

  ////
  const getItemFromStorage = async (key) => {
    const data = await AsyncStorge.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  };

  ////
  const setItemToStorage = async (key, data) => {
    if (data) {
      const dataString = JSON.stringify(data);
      await AsyncStorage.setItem(key, dataString);
      return true;
    }
    return false;
  };

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        getAllSettingsFromStorage,
        setBlockchainType,
        savePassword,
        useOTP,
        setLocale,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export {SettingsContext, SettingsProvider};
