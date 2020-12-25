//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  Platform,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// firebase
import {firebase} from '@react-native-firebase/functions';
////
import axios, {AxiosResponse} from 'axios';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block} from 'galio-framework';
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc
import {SearchScreen} from '../screen/Search';
import {parseCatAuthorPermlink} from '~/utils/postUrlParser';
import {get, isLength} from 'lodash';

//// props
interface Props {
  posts: PostData[];
  fetchPosts: (appending?: boolean) => void;
  clearPosts: () => void;
}
//// component
const SearchFeed = (props: Props): JSX.Element => {
  //// props

  //// contexts
  const {uiState, setToastMessage} = useContext(UIContext);
  //// states
  const [searchItems, setSearchItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [startIndex, setStartIndex] = useState(1);
  const [loadedAll, setLoadedAll] = useState(false);
  const [autoFocus, setAutoFocus] = useState(true);
  //// effects
  useEffect(() => {
    if (uiState.searchText != '') {
      // clear loaded all
      setLoadedAll(false);
      // start search
      _fetchSearch(uiState.searchText);
    }
  }, [uiState.searchText]);
  ////
  useEffect(() => {
    console.log('[useEffect|searchText] searchText', searchText);
    if (searchText.length > 0 && startIndex < 100) {
      // clear loaded all
      setLoadedAll(false);
      // start search
      _fetchSearch(searchText);
    } else if (startIndex >= 100) setLoadedAll(true);
  }, [searchText]);

  const _handleSearch = async (search: string) => {
    console.log('_handleSearch. text', search);
    // clear search items
    setSearchItems([]);
    // set search text
    setSearchText(search);
    // clear start index
    setStartIndex(1);
  };

  const _handleLoadMore = async (text?: string) => {
    console.log('[search] _handleLoadMore. searchText', searchText);
    // // do not search if all loaded
    // if (!loadedAll) {
    //   // fetch more
    //   if (text != '') _fetchSearch(text);
    //   else _fetchSearch(searchText);
    // }
  };

  const _fetchSearch = async (text: string) => {
    let response = null;
    try {
      response = await firebase.functions().httpsCallable('searchRequest')({
        query: text,
        startAt: startIndex,
        num: 10,
        sort: '',
      });
      console.log('search results', response);
    } catch (error) {
      console.log('failed to search', error);
      return;
    }

    // check response
    const {items} = response.data;
    console.log('search items', items);

    //
    if (!items) {
      //      setToastMessage('Nothing Found');
      setLoadedAll(true);
      //      setSearchText('');
      return null;
    }

    // filtering first
    // map
    let _items = [];
    items.forEach((item) => {
      const match = parseCatAuthorPermlink(item.link);
      console.log('match', match);
      match &&
        _items.push({
          author: match.author,
          postRef: {
            author: match.author,
            permlink: match.permlink,
          },
          title: item.title,
          createdAt: get(item.pagemap.metatags[0], 'article:published_time'),
        });
    });
    console.log('filtered items', _items);
    setSearchItems(_items);

    //    setSearchItems(searchItems.concat(_items));
    // update start index: start index + how many searched (not actual items)
    //    setStartIndex(startIndex + items.length);
    //    setSearchText('');
  };

  const _handleRefresh = async (text: string) => {
    setSearchItems([]);
    setStartIndex(1);
    setSearchText(text);
  };

  return (
    <SearchScreen
      initialText={uiState.searchText}
      items={searchItems}
      handleSearch={_handleSearch}
      handleRefresh={_handleRefresh}
      handleLoadMore={_handleLoadMore}
    />
  );
};

export {SearchFeed};
