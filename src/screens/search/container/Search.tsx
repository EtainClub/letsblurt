//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
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
////
import axios from 'axios';
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
import {get} from 'lodash';

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
  const [items, setItems] = useState([]);
  const [startIndex, setStartIndex] = useState(1);
  //// effects
  useEffect(() => {
    if (uiState.searchText != '') {
      // start search
      _fetchSearch(uiState.searchText);
    }
  }, [uiState.searchText]);

  const _handleSearch = async (search: string) => {
    await _fetchSearch(search);
  };

  const _handleLoadMore = () => {};

  const _fetchSearch = async (text: string) => {
    console.log('_fetchSearch');
    const key = Config.GOOGLE_SEARCH_BLURT_KEY;
    const cx = Config.GOOGLE_SEARCH_BLURT_cx;
    //
    const query = text;
    // search start index
    const start = startIndex;
    // search limit
    const num = 10;
    const sort = '';
    const search = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${query}&num=${num}&start=${start}&sort=${sort}`;

    // google search
    try {
      const response = await axios.get(search);
      console.log('search results', response);
      // check response
      if (response.status) {
        const {items} = response.data;
        console.log('search items link', items);
        // clear search result
        if (!items) {
          setItems([]);
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
              createdAt: get(
                item.pagemap.metatags[0],
                'article:published_time',
              ),
            });
        });
        console.log('filtered items', _items);
        setItems(_items);
      }
    } catch (error) {
      console.error('search error', error);
    }
  };

  return (
    <SearchScreen
      items={items}
      handleSearch={_handleSearch}
      handleLoadMore={_handleLoadMore}
    />
  );
};

export {SearchFeed};
