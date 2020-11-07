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

  const _handleLoadMore = () => {};
  const _fetchSearch = async (text: string) => {
    console.log('_fetchSearch');
    const key = 'AIzaSyC3AWzEKCU3JtU112tayMfSzxRmXGYGBzE';
    // blurt.world search engine id
    const cx = '946f41dfec67a33ce';
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
      const response = await fetch(search);
      console.log('search results', response);
      // check response
      if (response.ok) {
        const data = await response.json();
        console.log('search items link', data.items);
        // filter
        const _items = data.items.filter((item) => {
          const match = parseCatAuthorPermlink(item.link);
          //          return match && match.permlink;
          return true;
        });
        console.log('filtered items', _items);
        setItems(_items);
      }
    } catch (error) {
      console.error('search error', error);
    }
  };

  return <SearchScreen items={items} handleLoadMore={_handleLoadMore} />;
};

export {SearchFeed};
