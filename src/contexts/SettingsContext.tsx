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
  StorageSchema,
  DNDTimeTypes,
  BlockchainTypes,
  SecurityTypes,
  LanguageTypes,
  UITypes,
} from './types';
import {SettingsScreen} from '~/screens/settings/screen/Settings';

//// initial settings state
const initialState = INITIAL_SETTINGS;

// create settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction) => {
  switch (action.type) {
    case SettingsActionTypes.GET_ALL_SETTINGS:
      return action.payload;
    case SettingsActionTypes.FINALIZE_SETTINGS_TO_STORAGE:
      return {...state, existInStorage: true};
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
  //// set state to storage
  const _setAllStatesToStorage = async () => {
    const pushPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(
          StorageSchema.PUSH_NOTIFICATIONS,
          settingsState.pushNotifications,
        ),
      ),
    );
    const dndPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.DND_TIMES, settingsState.dndTimes),
      ),
    );
    const blockchainPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.BLOCKCHAIN, settingsState.blockchains),
      ),
    );
    const securityPromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.SECURITIES, settingsState.securities),
      ),
    );
    const languagePromise = new Promise((resolve, reject) =>
      resolve(
        _setItemToStorage(StorageSchema.LANGUAGE, settingsState.languages),
      ),
    );
    const uiPromise = new Promise((resolve, reject) =>
      resolve(_setItemToStorage(StorageSchema.UI, settingsState.ui)),
    );
    // augment the promises
    const promises = [
      pushPromise,
      dndPromise,
      blockchainPromise,
      securityPromise,
      languagePromise,
      uiPromise,
    ];
    // resolve all the promises
    Promise.all(promises)
      .then((results) => {
        console.log('set settings to storage. results', results);
        let success = true;
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            success = false;
            break;
          }
        }
        // dispatch actions
        if (success) {
          // dispatch finalize action
          dispatch({
            type: SettingsActionTypes.FINALIZE_SETTINGS_TO_STORAGE,
          });
        }
      })
      .catch((error) =>
        console.log('failed to get all settings from storage', error),
      );
    console.log(
      '[SettingsProvider] getAllSettingsFromStorage. promises',
      promises,
    );
  };

  //// get a single item from storage
  const getItemFromStorage = async (key: string) => {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
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
        console.log('get all settings. results', results);
        // dispatch actions
        if (results) {
          // build structure
          const _settings: SettingsState = {
            pushNotifications: results[0] as string[],
            dndTimes: results[1] as DNDTimeTypes,
            blockchains: results[2] as BlockchainTypes,
            securities: results[3] as SecurityTypes,
            languages: results[4] as LanguageTypes,
            ui: results[5] as UITypes,
          };
          dispatch({
            type: SettingsActionTypes.GET_ALL_SETTINGS,
            payload: _settings,
          });
        }
      })
      .catch((error) =>
        console.log('failed to get all settings from storage', error),
      );
    return settings;
  };

  //////// action creators

  //// update setting schema
  const updateSettingSchema = async (schema: StorageSchema, data: any) => {
    if (data) {
      // get the saved schema data
      const schemaData = await getItemFromStorage(schema);
      // dispatch action
      dispatch({
        type: SettingsActionTypes.SET_SCHEMA,
        payload: {
          schema: schema,
          data: schemaData,
        },
      });
      await _setItemToStorage(schema, schemaData);
      return true;
    }
    return false;
  };

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        getAllSettingsFromStorage,
        getItemFromStorage,
        updateSettingSchema,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

////// storage helper functions

export {SettingsContext, SettingsProvider};
