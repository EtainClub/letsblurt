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
    case SettingsActionTypes.SET_SCHEMA:
      return {...state, [action.payload.schema]: action.payload.data};
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const SettingsProvider = ({children}: Props) => {
  // useReducer hook
  const [settingsState, dispatch] = useReducer(settingsReducer, initialState);
  console.log('[SettingsProvider] state', settingsState);

  //////// action creators
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

  //// update setting schema
  const updateSettingSchema = async (schema: StorageSchema, data: any) => {
    if (data) {
      // get the saved schema data
      const schemaData = await getItemFromStorage(schema);
      // dispatch action
      dispatch({
        type: SettingsActionTypes.SET_SCHEMA,
        payload: {
          shcema: schema,
          data: schemaData,
        },
      });
      await _setItemToStorage(schema, schemaData);
      return true;
    }
    return false;
  };

  //// get a single item from storage
  export const getItemFromStorage = async (key: string) => {
    const data = await AsyncStorge.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  };

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        getAllSettingsFromStorage,
        updateSettingSchema,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

////// storage helper functions

//// set a single item or schema to storage
const _setItemToStorage = async (key: string, data: any) => {
  if (data) {
    // stringify the data
    const dataString = JSON.stringify(data);
    await AsyncStorage.setItem(key, dataString);
    return true;
  }
  return false;
};

export {SettingsContext, SettingsProvider};
