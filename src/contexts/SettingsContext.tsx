import React, {useReducer, createContext} from 'react';

import {
  SettingsActionTypes,
  SettingsState,
  SettingsContextType,
  SettingsAction,
  BlockchainTypes,
} from './types';

//// initial settings state
const initialState = {
  blockchainType: BlockchainTypes.BLURT,
  savingPassword: true,
  usingOTP: false,
};

// create settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction) => {
  switch (action.type) {
    case SettingsActionTypes.SET_BLOCKCHAIN_TYPE:
      return {...state, blockchainType: action.payload};
    case SettingsActionTypes.SAVE_PASSWORD:
      return {...state, savingPassword: action.payload};
    case SettingsActionTypes.USE_OTP:
      return {...state, usingOTP: action.payload};
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
  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        setBlockchainType,
        savePassword,
        useOTP,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export {SettingsContext, SettingsProvider};
