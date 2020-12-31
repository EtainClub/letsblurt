import {
  BLURT_MAINNETS,
  BLURT_CHAIN_ID,
  BLURT_CHAIN_PREFIX,
  BLURT_IMAGE_SERVER,
} from '~/constants/blockchain';

//// storage schema
export enum StorageSchema {
  PUSH_NOTIFICATIONS = 'push', // push notifications
  DND_TIMES = 'dnd', // start time, end time
  BLOCKCHAIN = 'blockchain', // rpc server, image server,  blockchain prefix, blockchain id
  SECURITIES = 'security', // otp, auto login,
  LANGUAGE = 'language', // menu language (locale, e.g. en-US), translation language (e.g. EN)
  DRAFT = 'draft', // title, body, tag, beneficiaries
  TEMPLATE = 'template', // posting template, beneficiaries, powerup, ...
  UI = 'ui', // dark theme, font size,
}

export enum PushNotificationTypes {
  VOTE,
  MENTION,
  BENEFICIARY,
  TRANSFER,
  REPLY,
  FOLLOW,
}

//// blockchain types
export type BlockchainTypes = {
  rpc: string;
  image?: string;
  prefix?: string;
  chainId?: string;
};

//// securiteies types
export type SecurityTypes = {
  useOTP: boolean;
  useAutoLogin: boolean;
};

//// dnd times types
export type DNDTimeTypes = {
  startTime: number; // timestamp
  endTime: number; //timestamp
};

//// language types
export type LanguageTypes = {
  locale: string;
  translation: string;
};

//// ui types
export type UITypes = {
  nsfw: boolean;
};

//// all settings types
export type AllSettingsTypes = {
  pushNotifications: PushNotificationTypes;
  blockchains: BlockchainTypes;
  securities: SecurityTypes;
  dndTimes: DNDTimeTypes;
  languages: LanguageTypes;
  ui?: UITypes;
};

// settings state
export interface SettingsState {
  // ['vote', 'tranfer', ...]
  pushNotifications: string[];
  blockchains: BlockchainTypes;
  securities: SecurityTypes;
  dndTimes: DNDTimeTypes;
  languages: LanguageTypes;
  ui: UITypes;
  // // flag to save password
  // savingPassword: boolean;
  // // flag to use one time password
  // usingOTP: boolean;
  // // locale, language
  // locale: string;
}

// initial post data
export const INITIAL_SETTINGS = {
  pushNotifications: ['vote', 'beneficiary'],
  blockchains: {
    rpc: BLURT_MAINNETS[0],
    image: BLURT_IMAGE_SERVER,
    chainId: BLURT_CHAIN_ID,
    prefix: BLURT_CHAIN_PREFIX,
  },
  securities: {
    useOTP: false,
    useAutoLogin: true,
  },
  languages: {
    locales: 'en-US',
    translation: 'EN',
  },
  dndTimes: {
    startTime: -540,
    endTime: -80,
  },
  ui: {
    nsfw: false,
  },
};

//// settings action types
export enum SettingsActionTypes {
  SET_ALL_SETTINGS,
  SET_BLOCKCHAINS,
  SET_SECURITIES,
  SET_LANGUAGES,
  SET_DND_TIMES,
  SET_UI,
}

//// actions
interface SetAllSettingsAction {
  type: SettingsActionTypes.SET_ALL_SETTINGS;
  payload: AllSettingsTypes;
}

// set blockchain type
interface SetBlockchainsAction {
  type: SettingsActionTypes.SET_BLOCKCHAINS;
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
  // get all settings from storage
  getAllSettingsFromStorage: () => Promise<AllSettingsTypes>;
  // set blockchain type
  setBlockchainType: (type: BlockchainTypes) => void;
  // save password
  savePassword: (save: boolean) => void;
  // use otp
  useOTP: (use: boolean) => void;
  // set locale
  setLocale: (locale: string) => void;
}

export type SettingsAction = SetAllSettingsAction | SetBlockchainsAction;
