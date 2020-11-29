import React, {useState, useEffect, useContext, useCallback} from 'react';
// keychain to store data securely
import * as Keychain from 'react-native-keychain';
import {useFocusEffect} from '@react-navigation/native';
import {FeedScreen} from '../screen/Feed';
import SplashScreen from 'react-native-splash-screen';
import {navigate} from '~/navigation/service';
import {
  PostRef,
  PostData,
  PostsTypes,
  INIT_FRIENDS_TAG,
  INIT_MY_TAG,
  INIT_FILTER_LIST,
} from '~/contexts/types';
import {PostsContext, AuthContext, UIContext} from '~/contexts';

import {PostsFeed} from '~/components';

interface Props {}

const Feed = (props: Props): JSX.Element => {
  SplashScreen.hide();
  // contexts
  const {postsState, fetchPosts, clearPosts} = useContext(PostsContext);
  const {authState} = useContext(AuthContext);
  const {uiState, setToastMessage} = useContext(UIContext);
  // states
  const [username, setUsername] = useState(
    authState.currentCredentials.username,
  );
  const [posts, setPosts] = useState<PostData[]>(null);
  //  const [postsType, setPostsType] = useState(PostsTypes.FEED);
  const [reloading, setReloading] = useState(true);
  const [startPostRef, setStartPostRef] = useState<PostRef>({
    author: null,
    permlink: null,
  });

  //////// effects
  //// header tag/fiter change event
  useEffect(() => {
    _fetchPosts(false);
  }, [postsState.filterIndex, postsState.tagIndex]);
  // account change event
  useEffect(() => {
    if (!reloading) {
      // fetch only the user account has been changed
      if (username != authState.currentCredentials.username) _fetchPosts(false);
    }
  }, [authState.currentCredentials]);
  //// focus event with tag param
  // useFocusEffect(
  //   useCallback(() => {
  //     if (!fetching) {
  //       // check if selected tag exists
  //       if (uiState.selectedTag) {
  //         // fetch posts of hash tag
  //         _fetchPosts(false);
  //       } else {
  //         // fetch posts of feed
  //         //          _fetchPosts(false);
  //       }
  //     }
  //   }, [uiState.selectedTag]),
  // );

  // //// set posts after fetching
  // useEffect(() => {
  //   if (postsState.fetched) {
  //     console.log('[Feed|useEffect] fetched event, postsState', postsState);
  //     console.log(
  //       '[Feed|useEffect] fetched event, postsState posts',
  //       postsState[postsState.postsType].posts,
  //     );
  //     // this will re-render screen
  //     setPosts(postsState[postsState.postsType].posts);
  //   }
  // }, [postsState.fetched]);

  const _fetchPosts = async (appending: boolean) => {
    console.log('[Feed|fetchingPosts] appending', appending);
    // let postsType = PostsTypes.FEED;
    // if (uiState.selectedTag) {
    //   postsType = PostsTypes.HASH_TAG;
    // }
    // TODO: how to handle different types of posts
    //    const {postsType} = postsState;
    let postsType = PostsTypes.FEED;
    console.log(
      'fetching posts, postsState, posts type',
      postsState,
      postsType,
    );
    // clear posts if not appending
    // loading for appening will be handled by load more
    if (!appending) {
      await clearPosts(postsType);
      setReloading(true);
    }
    const _posts = await fetchPosts(
      postsType,
      postsState.tagIndex,
      postsState.filterIndex,
      authState.currentCredentials.username,
      appending,
      uiState.selectedTag,
      setToastMessage,
    );
    console.log('postsState', postsState);
    setPosts(_posts);
    if (!appending) {
      setReloading(false);
    }
    console.log('[Feed]_fetchPosts, posts', _posts);
  };

  ////
  const _clearPosts = async () => {
    console.log('[FeedContainer] clear posts');
    clearPosts(PostsTypes.FEED);
  };

  return (
    <PostsFeed posts={posts} reloading={reloading} fetchPosts={_fetchPosts} />
  );
};

export {Feed};

/*
const Feed = (props: Props): JSX.Element => {
  // contexts
  const {postsState, fetchPosts, appendPosts, clearPosts} = useContext(
    PostsContext,
  );
  const {authState} = useContext(AuthContext);
  const {uiState, setPostsType} = useContext(UIContext);
  // states
  const [type, setType] = useState(PostsTypes.FEED);
  const [fetching, setFetching] = useState(true);
  const [startPostRef, setStartPostRef] = useState<PostRef>({
    author: null,
    permlink: null,
  });

  ////// effects
  //// fetch posts
  useEffect(() => {
    // fetch communities
    if (authState.loggedIn) {
      console.log('[Feed] auth state', authState);
      //      fetchCommunities(authState.currentCredentials.username);
    }
    // clear start post reference
    setStartPostRef({
      author: null,
      permlink: null,
    });
    // fetching
    _fetchPosts();
  }, [uiState.filter, uiState.tag, uiState.postsType]);

  useFocusEffect(
    useCallback(() => {
      // show feed posts
      // setPostsType(PostsTypes.FEED);
    }, []),
  );

  //// reset loading
  // useEffect(() => {
  //   console.log('[Feed] useEffect/postState, fetching', postsState, fetching);
  //   if (postsState.fetched) {
  //     _updateStartPostRef();
  //     setFetching(false);
  //   }
  // }, [postsState]);

  
  // useFocusEffect(
  //   useCallback(() => {
  //     console.log(
  //       '[Feed] Fetching, useFocusEffect callback author -----------------------------------------',
  //       props.author,
  //     );

  //     // clear posts
  //     if (props.author) {
  //       console.log(
  //         '[Feed] callback, author ============================================',
  //         props.author,
  //       );
  //       clearPosts();
  //       // clear start post reference
  //       setStartPostRef({
  //         author: null,
  //         permlink: null,
  //       });
  //       _fetchPosts();
  //     }
  //   }, [props.author]),
  // );
  

 const _fetchPosts = async () => {
  console.log('fetching posts, authState', authState);
  console.log('fetching posts, postsState type', postsState.type);
  setFetching(true);
  console.log('before fetching uiState', uiState);
  fetchPosts(
    uiState.postsType,
    uiState.filter,
    uiState.tag,
    authState.currentCredentials.username,
  );
  console.log('postsState', postsState);
  console.log('after fetching', fetching);
};

const _refreshPosts = async () => {
  console.log('FeedContainer] freshPosts');
  // clear the posts
  clearPosts(postsState.type);
  // fetch posts
  // @todo this takes time, so fetchposts is executed with some post reference
  setFetching(true);
  _fetchPosts();
  return true;
};

const _fetchMorePosts = async () => {
  console.log('[Feed] fetchMorePosts');
  setFetching(true);
  // fetch posts
  appendPosts(
    uiState.postsType,
    uiState.filter,
    uiState.tag,
    authState.currentCredentials.username,
  );
};

const _onClickPosting = () => {
  console.log('onClickPosting');
};

return (
  <FeedScreen
    posts={postsState.posts[uiState.postsType]}
    clickPosting={_onClickPosting}
    refreshPosts={_refreshPosts}
    fetchMorePosts={_fetchMorePosts}
  />
);
};

export {Feed};
*/
