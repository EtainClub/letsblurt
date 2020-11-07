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
};

// create settings context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

// settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction) => {
  const {type, payload} = action;
  switch (type) {
    case SettingsActionTypes.SET_BLOCKCHAIN_TYPE:
      return {...state, blockchainType: payload};
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

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        setBlockchainType,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export {SettingsContext, SettingsProvider};
