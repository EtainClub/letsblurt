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
  SAVE_PASSWORD,
  USE_OTP,
  SET_LOCALE,
}

// settings state
export interface SettingsState {
  // blockchain type
  blockchainType: BlockchainTypes;
  // flag to save password
  savingPassword: boolean;
  // flag to use one time password
  usingOTP: boolean;
  // locale, language
  locale: string;
}

//// actions
// set blockchain type
interface SetBlockchainTypeAction {
  type: SettingsActionTypes;
  payload: BlockchainTypes;
}
// save password
interface SavePasswordAction {
  type: SettingsActionTypes;
  payload: boolean;
}
// set using opt
interface UseOTPAction {
  type: SettingsActionTypes;
  payload: boolean;
}
// set locale
interface SetLocaleAction {
  type: SettingsActionTypes;
  payload: string;
}
// settings context type
export interface SettingsContextType {
  // settings state
  settingsState: SettingsState;
  //// action creators
  // set blockchain type
  setBlockchainType: (type: BlockchainTypes) => void;
  // save password
  savePassword: (save: boolean) => void;
  // use otp
  useOTP: (use: boolean) => void;
  // set locale
  setLocale: (locale: string) => void;
}

export type SettingsAction =
  | SetBlockchainTypeAction
  | SavePasswordAction
  | UseOTPAction
  | SetLocaleAction;
