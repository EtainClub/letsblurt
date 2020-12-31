import {
  BLURT_MAINNETS,
  BLURT_CHAIN_ID,
  BLURT_CHAIN_PREFIX,
  BLURT_IMAGE_SERVERS,
} from '~/constants/blockchain';

//// storage schema
export enum StorageSchema {
  PUSH_NOTIFICATIONS = 'push', // push notifications
  DND_TIMES = 'dnd', // {start time, end time}
  BLOCKCHAIN = 'blockchain', // rpc server, image server,  blockchain prefix, blockchain id
  SECURITIES = 'security', // otp, auto login,
  LANGUAGE = 'language', // menu language (locale, e.g. en-US), translation language (e.g. EN)
  DRAFT = 'draft', // title, body, tag, beneficiaries
  TEMPLATE = 'template', // posting template, beneficiaries, powerup, ...
  UI = 'ui', // dark theme, font size,
}

//// blockchain types
export type BlockchainTypes = {
  rpc: string;
  image?: string;
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
// export type AllSettingsTypes = {
//   pushNotifications: string[];
//   blockchains: BlockchainTypes;
//   securities: SecurityTypes;
//   dndTimes: DNDTimeTypes;
//   languages: LanguageTypes;
//   ui: UITypes;
// };

// settings state
export interface SettingsState {
  // ['vote', 'tranfer', ...]
  pushNotifications: string[];
  blockchains: BlockchainTypes;
  securities: SecurityTypes;
  dndTimes: DNDTimeTypes;
  languages: LanguageTypes;
  ui: UITypes;
}

// initial post data
export const INITIAL_SETTINGS: SettingsState = {
  pushNotifications: ['vote', 'beneficiary'],
  blockchains: {
    rpc: BLURT_MAINNETS[0],
    image: BLURT_IMAGE_SERVERS[0],
  },
  securities: {
    useOTP: false,
    useAutoLogin: true,
  },
  languages: {
    locale: 'en-US',
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
  GET_ALL_SETTINGS,
  FINALIZE_SETTINGS_TO_STORAGE,
  SET_SCHEMA,
  SET_BLOCKCHAINS,
  SET_SECURITIES,
  SET_LANGUAGES,
  SET_DND_TIMES,
  SET_UI,
  SET_STORAGE,
}

//// actions
// get all settings from storage
interface GetAllSettingsAction {
  type: SettingsActionTypes.GET_ALL_SETTINGS;
  payload: SettingsState;
}
// finalize settings to storage
interface FinalizeSettingsToStorageAction {
  type: SettingsActionTypes.FINALIZE_SETTINGS_TO_STORAGE;
}

// set schema
interface SetSchemaAction {
  type: SettingsActionTypes.SET_SCHEMA;
  payload: {
    schema: StorageSchema;
    data: any;
  };
}

// settings context type
export interface SettingsContextType {
  // settings state
  settingsState: SettingsState;
  //// action creators
  // get all settings from storage
  getAllSettingsFromStorage: () => Promise<SettingsState>;
  //
  getItemFromStorage: (key: string) => Promise<any>;
  // update a single item in schema
  updateSettingSchema: (schema: StorageSchema, data: any) => void;
}

export type SettingsAction =
  | GetAllSettingsAction
  | FinalizeSettingsToStorageAction
  | SetSchemaAction;
