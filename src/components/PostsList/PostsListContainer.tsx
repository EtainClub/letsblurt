//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
import {substr_utf8_bytes} from '~/utils/strings';
const runes = require('runes');

//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants/argonTheme';
const {width, height} = Dimensions.get('screen');
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// blockchain
import {fetchPost} from '~/providers/blurt/dblurtApi';
//// etc
import {Post} from '~/components/Post';
import {ActionBarStyleFeed} from '~/constants/actionBarTypes';
import {getTimeFromNow} from '~/utils/time';
import {PostsListView} from './PostsListView';

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

//// props
interface Props {
  postsRefs: string[];
  isUser: boolean;
}

const PostsListContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  const [posts, setPosts] = useState(null);
  const [fetched, setFetched] = useState(false);
  //// effect
  useEffect(() => {
    console.log('[PostsListsContainer] fetch posts');
    // fetch posts data from references (author/permlink)
    _getPosts(props.postsRefs);
  }, []);

  const _getPosts = async (refs: string[]) => {
    // refs format: author/permlink
    const promises = refs.map(async (ref) => {
      const authorPermlink = ref.split('/');
      console.log(
        '[PostsListsContainer] authorPermlink',
        authorPermlink[0],
        authorPermlink[1],
      );
      return fetchPost(authorPermlink[0], authorPermlink[1]);
    });
    const parsedPosts = await Promise.all(promises);
    console.log('[PostsListsContainer] parsed posts', parsedPosts);
    // set
    setPosts(parsedPosts);
  };

  return posts ? (
    <PostsListView posts={posts} isUser={false} />
  ) : (
    <ActivityIndicator color="pink" />
  );
};

export {PostsListContainer};
