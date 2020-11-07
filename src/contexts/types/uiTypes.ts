import {PostsTypes} from './postTypes';

//// action types
export enum UIActionTypes {
  SET_TOAST,
  SET_TAG_PARAM,
  SET_AUTHOR_PARAM,
  SET_EDIT_MODE,
  SET_SEARCH_PARAM,
}

// ui state
export interface UIState {
  // toast message
  toastMessage: string;
  // author param
  // authorParam: string;
  selectedAuthor: string;
  // selected tag
  selectedTag: string;
  // search text param
  searchText: string;
  // edit mode
  editMode: boolean;
}

//// actions
// set toast message
interface SetToastAction {
  type: UIActionTypes.SET_TOAST;
  payload: string;
}
// set tag to use it as a navigation param
interface SetTagParamAction {
  type: UIActionTypes.SET_TAG_PARAM;
  payload: string;
}
// set author to use it as a navigation param
interface SetAuthorParamAction {
  type: UIActionTypes.SET_AUTHOR_PARAM;
  payload: string;
}
//
interface SetEditModeAction {
  type: UIActionTypes.SET_EDIT_MODE;
  payload: boolean;
}
//
interface SetSearchParamAction {
  type: UIActionTypes.SET_SEARCH_PARAM;
  payload: string;
}

// ui context type
export interface UIContextType {
  // ui state
  uiState: UIState;
  //// action creators
  // set toast message
  setToastMessage: (message: string) => void;
  // set tag to use it as a param between navigation
  setTagParam: (tag: string) => void;
  // set author to use it as a param betwen navigation
  setAuthorParam: (author: string) => void;
  //
  setEditMode: (edit: boolean) => void;
  // set search param
  setSearchParam: (text: string) => void;
}

export type UIAction =
  | SetToastAction
  | SetTagParamAction
  | SetAuthorParamAction
  | SetEditModeAction
  | SetSearchParamAction;
