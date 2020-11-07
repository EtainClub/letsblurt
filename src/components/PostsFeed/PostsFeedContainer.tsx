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
  fetchPosts: (appending?: boolean) => void;
  clearPosts: () => void;
}
//// component
const PostsFeed = (props: Props): JSX.Element => {
  //// props
  const {posts, fetchPosts, clearPosts} = props;
  //// context
  const {setSearchParam} = useContext(UIContext);
  //// state
  const [loading, setLoading] = useState(false);

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
    // clear the posts
    clearPosts();
    // fetch posts
    // @todo this takes time, so fetchposts is executed with some post reference
    setLoading(true);
    fetchPosts(false);
  };

  const _fetchMorePosts = async () => {
    console.log('[Feed] fetchMorePosts');
    setLoading(true);
    // fetch posts with appending
    fetchPosts(true);
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
      loading={loading}
      handleSubmitSearch={_handleSubmitSearch}
      refreshPosts={_refreshPosts}
      fetchMorePosts={_fetchMorePosts}
    />
  );
};

export {PostsFeed};
