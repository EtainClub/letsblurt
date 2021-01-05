import React, {useReducer, createContext} from 'react';

import {UIActionTypes, UIState, UIContextType, UIAction} from './types/uiTypes';

// steem api
import {fetchCommunityList} from '~/providers/blurt/dblurtApi';
import {PostsTypes} from './types';

const initialState = {
  toastMessage: '',
  selectedAuthor: null,
  //  selectedTag: null,
  editMode: false,
  searchText: '',
  authorList: [],
  translateLanguages: [],
  selectedLanguage: 'en',
};

// create ui context
const UIContext = createContext<UIContextType | undefined>(undefined);

// ui reducer
const uiReducer = (state: UIState, action: UIAction) => {
  switch (action.type) {
    case UIActionTypes.SET_TOAST:
      return {...state, toastMessage: action.payload};
    case UIActionTypes.SET_AUTHOR_PARAM:
      return {...state, selectedAuthor: action.payload};
    case UIActionTypes.SET_AUTHORS_PARAM:
      return {...state, authorList: action.payload};
    // case UIActionTypes.SET_TAG_PARAM:
    //   return {...state, selectedTag: action.payload};
    case UIActionTypes.SET_EDIT_MODE:
      return {...state, editMode: action.payload};
    case UIActionTypes.SET_SEARCH_PARAM:
      return {...state, searchText: action.payload};
    case UIActionTypes.SET_TRANSLATE_LANGUAGES:
      return {...state, translateLanguages: action.payload};
    case UIActionTypes.SET_LANGUAGE_PARAM:
      return {...state, selectedLanguage: action.payload};
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

  // set author param
  const setAuthorParam = (author: string) => {
    console.log('[setAuthor] author', author);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_AUTHOR_PARAM,
      payload: author,
    });
  };

  // set author param
  const setAuthorListParam = (authors: string[]) => {
    console.log('[setAuthorList] author', authors);
    // dispatch action
    dispatch({
      type: UIActionTypes.SET_AUTHORS_PARAM,
      payload: authors,
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

  //// set supported translate languages
  const setTranslateLanguages = (languages: []) => {
    dispatch({
      type: UIActionTypes.SET_TRANSLATE_LANGUAGES,
      payload: languages,
    });
  };

  ////
  const setLanguageParam = (language: string) => {
    dispatch({
      type: UIActionTypes.SET_LANGUAGE_PARAM,
      payload: language,
    });
  };

  return (
    <UIContext.Provider
      value={{
        uiState,
        setToastMessage,
        setAuthorParam,
        setAuthorListParam,
        setEditMode,
        setSearchParam,
        setTranslateLanguages,
        setLanguageParam,
      }}>
      {children}
    </UIContext.Provider>
  );
};

export {UIContext, UIProvider};
