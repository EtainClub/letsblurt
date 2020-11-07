import React, {useReducer, createContext} from 'react';

import {UIActionTypes, UIState, UIContextType, UIAction} from './types/uiTypes';

// steem api
import {fetchCommunityList} from '~/providers/blurt/dblurtApi';
import {PostsTypes} from './types';

const initialState = {
  toastMessage: '',
  selectedAuthor: null,
  selectedTag: null,
  editMode: false,
  searchText: '',
};

// create ui context
const UIContext = createContext<UIContextType | undefined>(undefined);

// ui reducer
const uiReducer = (state: UIState, action: UIAction) => {
  const {type, payload} = action;
  switch (type) {
    case UIActionTypes.SET_TOAST:
      return {...state, toastMessage: payload};
    case UIActionTypes.SET_AUTHOR_PARAM:
      return {...state, selectedAuthor: payload};
    case UIActionTypes.SET_TAG_PARAM:
      return {...state, selectedTag: payload};
    case UIActionTypes.SET_EDIT_MODE:
      return {...state, editMode: payload};
    case UIActionTypes.SET_SEARCH_PARAM:
      return {...state, searchText: payload};
    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const UIProvider = ({children}: Props) => {
  // userReducer hook
  // set auth reducer with initial state of auth state
  const [uiState, dispatch] = useReducer(uiReducer, initialState);
  console.log('[ui provider] state', uiState);

  //////// action creators

  //// set toast message
  const setToastMessage = (message: string) => {
    console.log('[setToastMessage] msg', message);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_TOAST,
      payload: message,
    });
  };

  //// set tag param
  const setTagParam = (tag: string) => {
    console.log('[setTagParam] tag', tag);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_TAG_PARAM,
      payload: tag,
    });
  };

  // set author param
  const setAuthorParam = (author: string) => {
    console.log('[setAuthor] author', author);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_AUTHOR_PARAM,
      payload: author,
    });
  };

  // set edit mode
  const setEditMode = (edit: boolean) => {
    dispatch({
      type: UIActionTypes.SET_EDIT_MODE,
      payload: edit,
    });
  };

  //// set search param
  const setSearchParam = (text: string) => {
    dispatch({
      type: UIActionTypes.SET_SEARCH_PARAM,
      payload: text,
    });
  };

  return (
    <UIContext.Provider
      value={{
        uiState,
        setToastMessage,
        setTagParam,
        setAuthorParam,
        setEditMode,
        setSearchParam,
      }}>
      {children}
    </UIContext.Provider>
  );
};

export {UIContext, UIProvider};
