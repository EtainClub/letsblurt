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
import {PostsFeedView} from './PostsFeedView';

//// props
interface Props {
  posts: PostData[];
  reloading: boolean;
  fetchPosts: (appending?: boolean) => void;
}
//// component
const PostsFeed = (props: Props): JSX.Element => {
  //// props
  const {posts, fetchPosts} = props;
  //// context
  const {setSearchParam} = useContext(UIContext);
  //// state
  const [loadingMore, setLoadingMore] = useState(false);

  ////// effects
  //// fetch posts
  useEffect(() => {
    // fetch communities
  }, []);

  useFocusEffect(
    useCallback(() => {
      // show feed posts
      // setPostsType(PostsTypes.FEED);
    }, []),
  );

  //// handle refresh event
  const _refreshPosts = async () => {
    console.log('PostsFeed] refresh event');
    // clear the
    await fetchPosts(false);
  };

  const _fetchMorePosts = async () => {
    console.log('[Feed] fetchMorePosts');
    setLoadingMore(true);
    // fetch posts with appending
    await fetchPosts(true);
    setLoadingMore(false);
  };

  const _handleSubmitSearch = (searchText: string) => {
    console.log('handle submit search');
    // set search param
    setSearchParam(searchText);
    // navigate to search screen
    navigate({name: 'SearchFeed'});
  };

  return (
    <PostsFeedView
      posts={posts}
      reloading={props.reloading}
      loadingMore={loadingMore}
      handleSubmitSearch={_handleSubmitSearch}
      refreshPosts={_refreshPosts}
      fetchMorePosts={_fetchMorePosts}
    />
  );
};

export {PostsFeed};
