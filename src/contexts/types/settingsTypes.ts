//// blockchain types
export enum BlockchainTypes {
  BLURT,
  STEEMIT,
}

//// settings action types
export enum SettingsActionTypes {
  SET_BLOCKCHAIN_TYPE,
  SET_SERVER,
  SET_IMAGE_SERVER,
}

// settings state
export interface SettingsState {
  // blockchain type
  blockchainType: BlockchainTypes;
}

//// actions
// set blockchain type
interface SetBlockchainTypeAction {
  type: SettingsActionTypes;
  payload: BlockchainTypes;
}

// settings context type
export interface SettingsContextType {
  // settings state
  settingsState: SettingsState;
  //// action creators
  // set blockchain type
  setBlockchainType: (type: BlockchainTypes) => void;
}

export type SettingsAction = SetBlockchainTypeAction;
