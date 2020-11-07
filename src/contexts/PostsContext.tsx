//// react
import React, {useReducer, createContext} from 'react';
//// steem api
import {
  fetchPostsSummary,
  verifyPassoword,
  submitVote,
  broadcastPost,
  broadcastPostUpdate,
  fetchComments,
  fetchCommunityList,
  fetchPostDetails,
} from '~/providers/blurt/dblurtApi';
import {renderPostBody} from '~/utils/render-helpers';
//// types
import {
  PostRef,
  PostData,
  PostsTypes,
  PostsActionTypes,
  PostsAction,
  PostsContextType,
  PostsState,
  PostingContent,
  INIT_POST_DATA,
  INIT_POSTS_DATA,
  INIT_FRIENDS_TAG,
  INIT_MY_TAG,
  INIT_FILTER_LIST,
} from '~/contexts/types';

//// initial state
const initialState: PostsState = {
  feed: INIT_POSTS_DATA,
  author: INIT_POSTS_DATA,
  hash: INIT_POSTS_DATA,
  //// current post
  postsType: PostsTypes.FEED,
  // post details ref
  postRef: {
    author: null,
    permlink: null,
  },
  // post details
  postDetails: INIT_POST_DATA,
  // fetched flag
  fetched: false,
  //// tag, filter
  tagList: [],
  // tag index
  tagIndex: 0,
  // community list
  communityList: [],
  // filter: trending, created
  filterList: INIT_FILTER_LIST,
  // filter index
  filterIndex: 0,
};

//// create posts context
const PostsContext = createContext<PostsContextType | undefined>(undefined);

//// posts reducer
const postsReducer = (state: PostsState, action: PostsAction) => {
  let posts = [];
  let metaposts = {};
  const {payload} = action;
  switch (action.type) {
    case PostsActionTypes.SET_TAG_LIST:
      return {
        ...state,
        tagList: payload,
      };
    case PostsActionTypes.SET_COMMUNITIES:
      return {
        ...state,
        communityList: payload,
      };
    case PostsActionTypes.SET_POSTS:
      console.log('[postsReducer] set posts aciton. payload', payload);
      //// set posts to the posts type array
      return {
        ...state,
        [payload.postsType]: payload.metaposts,
        postsType: payload.postsType,
        fetched: true,
      };

    case PostsActionTypes.APPEND_POSTS:
      console.log('[postsReducer appending aciton payload', payload);
      // append
      console.log(
        '[postsReducer appending aciton poststype',
        payload.postsType,
      );
      metaposts = state[payload.postsType];
      console.log('[postsReducer appending aciton posts', metaposts);
      // posts[payload.postsType] = state.posts[payload.postsType].concat(
      //   payload.posts,
      // );
      return {
        ...state,
        //        [state.postsType]: metaposts.posts.concat(payload.posts),
        fetched: true,
      };

    case PostsActionTypes.SET_FETCHED:
      console.log('[postsReducer] set fetched. payload', payload);
      return {...state, fetched: payload};

    case PostsActionTypes.SET_POST_REF:
      return {...state, postRef: action.payload};

    case PostsActionTypes.CLEAR_POSTS:
      console.log('[postReducer] clearing action payload', payload);

      return {
        ...state,
        [state.postsType]: {
          posts: [],
          startPostRef: {author: null, permlink: null},
          index: 0,
        },
        fetched: true,
      };

    case PostsActionTypes.SET_TAG_INDEX:
      return {...state, tagIndex: payload};

    case PostsActionTypes.SET_FILTER_INDEX:
      return {...state, filterIndex: payload};

    case PostsActionTypes.SET_POST_DETAILS:
      return {
        ...state,
        postDetails: payload,
      };

    case PostsActionTypes.UPVOTE:
      console.log('[postReducer] upvoting action payload', action.payload);
      return state;

    case PostsActionTypes.VOTING_COMMENT:
      console.log('[postReducer] upvoting action payload', action.payload);
      return state;

    case PostsActionTypes.COMMENT_POST:
      console.log('[postReducer] add comment', action.payload);
      return state;

    default:
      return state;
  }
};

type Props = {
  children: React.ReactNode;
};

const PostsProvider = ({children}: Props) => {
  // userReducer hook
  // set auth reducer with initial state of auth state
  const [postsState, dispatch] = useReducer(postsReducer, initialState);
  console.log('[posts provider] posts', postsState);

  ////// action creators
  //// fetch community list
  const fetchCommunities = async (username: string) => {
    console.log('[fetchCommunities] username', username);
    let tagList = [];
    let filterList = INIT_FILTER_LIST;
    let tagIndex = 0;
    let filterIndex = 0;
    // check sanity
    if (!username) {
      console.log('[fetchCommunities] username is not defined', username);
      return;
    }
    // fetch communities
    const communityList = await fetchCommunityList(username);
    //// set tag filter list and tag list
    tagList = [
      [username, ...INIT_FRIENDS_TAG],
      [username, ...INIT_MY_TAG],
      ...communityList,
    ];

    // dispatch action
    dispatch({
      type: PostsActionTypes.SET_TAG_LIST,
      payload: tagList,
    });

    return communityList;
  };

  //// fetch posts action creator
  const fetchPosts = async (
    postsType: PostsTypes,
    tagIndex: number,
    filterIndex: number,
    username?: string,
    appending?: boolean,
    inputTag?: string,
  ) => {
    console.log(
      '[PostsContext|fetchPosts] input. type, tagIndex, filterIndex, username, appending, inputTag',
      postsType,
      tagIndex,
      filterIndex,
      username,
      appending,
      inputTag,
    );

    // dispatch action: clear fetched flag
    dispatch({
      type: PostsActionTypes.SET_FETCHED,
      payload: false,
    });

    //// set start post ref
    let startPostRef = {
      author: null,
      permlink: null,
    };
    if (appending) {
      startPostRef = postsState[postsState.postsType].startPostRef;
    }

    //// setup tag and filter value based on the tagIndex and filterIndex
    let tag = '';
    let filter = '';
    switch (postsType) {
      case PostsTypes.AUTHOR:
        // check sanity
        if (!inputTag) {
          console.log(
            '[PostsContext|fetchPosts] input tag is necessary for profile posts fetching',
          );
          return;
        }
        tag = inputTag;
        filter = 'blog';
        break;
      case PostsTypes.HASH_TAG:
        // TODO: need to handle change filter event with the same
        // check sanity
        if (!inputTag) {
          // console.log(
          //   '[PostsContext|fetchPosts] input tag is necessary for Hash tag posts fetching',
          // );
          tag = postsState.tagList[postsState.tagIndex][0];
        } else {
          tag = inputTag;
        }
        filter = postsState.filterList[postsState.filterIndex];
        // TODO: append the tag to the tag list
        // dispatch action
        dispatch({
          type: PostsActionTypes.SET_TAG_LIST,
          payload: postsState.tagList.concat([[tag, tag, '', '']]),
        });
        dispatch({
          type: PostsActionTypes.SET_TAG_INDEX,
          payload: postsState.tagList.length,
        });

        break;
      case PostsTypes.FEED:
        if (tagIndex === 0) {
          tag = username ? username : '';
          filter = username ? 'feed' : 'trending';
        } else if (tagIndex === 1) {
          tag = username ? username : '';
          filter = 'blog';
        } else if (tagIndex > 1) {
          tag = postsState.tagList[tagIndex][0];
          filter = postsState.filterList[filterIndex];
        } else {
          console.error(
            '[PostsContext|fetchPosts] tagIndex is wrong',
            tagIndex,
          );
          return;
        }
        break;
    }

    console.log(
      '[PostsContext|fetchPosts] tag, filter, startpostRef',
      tag,
      filter,
      startPostRef,
    );

    //    debugger;

    // now fetch posts
    const _posts = await _fetchPosts(filter, tag, startPostRef, username);
    console.log('[PostsContext|fetchPosts] posts', _posts);
    console.log(
      '[PostsContext|fetchPosts] after fetching, fetched?',
      postsState.fetched,
    );

    // check sanity
    if (!_posts) return null;

    // set start post ref
    const lastPost = _posts[_posts.length - 1];
    console.log(
      '[PostsContext|fetchPosts] last post. appending',
      lastPost,
      appending,
    );
    // augmented posts
    let posts = _posts.slice(0, _posts.length - 1);
    if (appending) {
      console.log('[PostsContext|fetchPosts] appending', appending);
      posts = postsState[postsType].posts.concat(posts);
    }
    // dispatch set posts action
    dispatch({
      type: PostsActionTypes.SET_POSTS,
      payload: {
        postsType: postsType,
        metaposts: {
          posts: posts,
          startPostRef: lastPost.state.post_ref,
          index: 0,
        },
      },
    });
  };

  //// clear posts
  const clearPosts = async (postsType: PostsTypes) => {
    dispatch({
      type: PostsActionTypes.CLEAR_POSTS,
      payload: postsType,
    });
  };

  //// get post details
  const getPostDetails = async (postRef: PostRef, username: string) => {
    // fetch
    const post = await fetchPostDetails(
      postRef.author,
      postRef.permlink,
      username,
    );
    console.log('[getPostDetails] post', post);
    // dispatch action
    dispatch({
      type: PostsActionTypes.SET_POST_DETAILS,
      payload: post,
    });
    return post;
  };

  //// set tag index
  const setTagIndex = async (
    tagIndex: number,
    postsType: PostsTypes,
    username?: string,
  ) => {
    console.log('[PostsContext|setTag] tag Index', tagIndex);
    // check sanity
    if (tagIndex < 0 || tagIndex >= postsState.tagList.length) {
      console.log('[setTag] tag is not defined', tagIndex);
      return;
    }
    // dispatch action
    dispatch({
      type: PostsActionTypes.SET_TAG_INDEX,
      payload: tagIndex,
    });
    // fetch with the given tag, empty start ref
    fetchPosts(postsType, tagIndex, postsState.filterIndex, username, false);
  };

  //// set Filter index
  const setFilterIndex = async (filterIndex: number, username?: string) => {
    console.log('[PostsContext|setfilter] filter Index', filterIndex);
    // check sanity
    if (filterIndex < 0 || filterIndex >= postsState.filterList.length) {
      console.log('[setfilter] filter is not defined', filterIndex);
      return;
    }
    // dispatch action
    dispatch({
      type: PostsActionTypes.SET_FILTER_INDEX,
      payload: filterIndex,
    });

    // fetch with the given tag, empty start ref
    fetchPosts(
      postsState.postsType,
      postsState.tagIndex,
      filterIndex,
      username,
      false,
    );
  };

  //// voting action creator
  const upvote = async (
    postIndex: number,
    isComment: boolean,
    postRef: PostRef,
    username: string,
    password: string,
    votingWeight: number,
    voteAmount: number,
  ) => {
    console.log('[PostsContext|upvote] postIndex', postIndex, voteAmount);
    console.log('[PostsContext|upvote] post', postsState[postIndex]);

    // send transaction
    const results = await submitVote(
      username,
      password,
      postRef.author,
      postRef.permlink,
      votingWeight,
    );
    console.log('[upvote] results', results);
    // dispatch action
    if (results.success) {
      // handle voting on comment
      if (isComment) {
        dispatch({
          type: PostsActionTypes.UPVOTE_COMMENT,
          payload: {
            postIndex: postIndex,
            voteAmount: (voteAmount * votingWeight) / 100,
            username: username,
            postRef: postRef,
          },
        });
      } else {
        dispatch({
          type: PostsActionTypes.UPVOTE,
          payload: {
            postIndex: postIndex,
            voteAmount: (voteAmount * votingWeight) / 100,
            username: username,
          },
        });
      }
    }
    return results;
  };

  // submit post/comment
  const submitPost = async (
    postingContent: PostingContent,
    password: string,
    isComment: boolean,
    postIndex?: number,
  ) => {
    // broadcast comment
    const {success, message} = await broadcastPost(postingContent, password);
    // dispatch action
    // TODO; distinguish post and comment
    return {success, message};
  };

  // update post
  const updatePost = async (
    originalBody: string,
    originalPermlink: string,
    originalParentPermlink: string,
    postingContent: PostingContent,
    password: string,
    isComment: boolean,
    postIndex?: number,
  ) => {
    // submit comment
    const {success, message} = await broadcastPostUpdate(
      originalBody,
      originalPermlink,
      originalParentPermlink,
      postingContent,
      password,
    );
    let action = PostsActionTypes.SET_POST_DETAILS;
    if (isComment) action = PostsActionTypes.SET_POST_DETAILS;
    if (success) {
      // update post detail
      const post = postsState.postDetails;
      post.body = renderPostBody(postingContent.body, true, true);
      post.title = postingContent.title;
      post.metadata = JSON.parse(postingContent.json_metadata);
      dispatch({
        type: action,
        payload: post,
      });
    }
    console.log('[updatePost] success, message', success, message);
    return {success, message};
  };

  // bookmarking
  const bookmark = async () => {};

  // set post ref
  const setPostRef = (postRef: PostRef) => {
    // dispatch action
    dispatch({
      type: PostsActionTypes.SET_POST_REF,
      payload: postRef,
    });
  };
  return (
    <PostsContext.Provider
      value={{
        postsState,
        fetchCommunities,
        fetchPosts,
        setPostRef,
        clearPosts,
        getPostDetails,
        setTagIndex,
        setFilterIndex,
        upvote,
        submitPost,
        updatePost,
        bookmark,
      }}>
      {children}
    </PostsContext.Provider>
  );
};

//// fetch posts using filter, tag, and start post reference
const _fetchPosts = async (
  filter: string,
  tag: string,
  startPostRef: PostRef,
  username?: string,
) => {
  console.log('[fetchPosts] category, tag', filter, tag);
  // fetch summary of posts
  const posts = await fetchPostsSummary(filter, tag, startPostRef, username);
  // check sanity
  if (!posts) {
    console.log('failed to fetch posts');
    return null;
  }
  return posts;
};

////
export {PostsContext, PostsProvider};

/*
//// posts reducer
const postsReducer = (state: PostsState, action: PostsAction) => {
  let postIndex: number;
  let postRef: PostRef;
  let username: string;
  let voteAmount: number;
  let payout: number;
  let newPayout: number;
  let newVotesCount: number;
  let voters: string[];
  let newVoters: string[];
  let posts = {};
  const {payload} = action;
  switch (action.type) {
    case PostsActionTypes.FETCH_POSTS:
      console.log('[postsReducer] fetch posts aciton. payload', payload);
      posts = state.posts;
      posts[payload.postsType] = payload.posts;
      console.log('[PostsContext|postsReducer] FETCH_POSTS posts', posts);
      return {
        ...state,
        fetched: true,
        posts: posts,
        startPostRef: payload.startPostRef,
      };

    case PostsActionTypes.SET_POST_REF:
      return {...state, postRef: action.payload};

    case PostsActionTypes.CLEAR_POSTS:
      console.log('[postReducer] clearing action payload', payload);
      posts = state.posts;
      posts[payload] = [];
      console.log('[PostsContext|postsReducer] FETCH_POSTS posts', posts);
      return {
        ...state,
        posts: posts,
        startPostRef: {author: null, permlink: null},
      };

    case PostsActionTypes.APPEND_POSTS:
      console.log('[postsReducer appending aciton payload', payload);
      // append
      posts = state.posts;
      posts[payload.postsType] = state.posts[payload.postsType].concat(
        payload.posts,
      );
      return {...state, posts: posts};

    case PostsActionTypes.UPVOTE:
      console.log('[postReducer] upvoting action payload', action.payload);
      return state;
    // ({postIndex, voteAmount, username} = action.payload);
    // payout = parseFloat(state[postIndex].postUserState.payout);
    // newPayout = payout + voteAmount;
    // newVotesCount = state[postIndex].postUserState.votes_count + 1;
    // voters = state[postIndex].postUserState.active_votes;
    // newVoters = [`${username} ($${voteAmount})`, ...voters];
    // newPosts = [...state];
    // newPosts[postIndex].postUserState.voted = true;
    // newPosts[postIndex].postUserState.payout = newPayout.toFixed(2);
    // newPosts[postIndex].postUserState.votes_count = newVotesCount;
    // newPosts[postIndex].postUserState.active_votes = newVoters;
    // return newPosts;
    case PostsActionTypes.VOTING_COMMENT:
      console.log('[postReducer] upvoting action payload', action.payload);
      return state;
    // ({postIndex, voteAmount, username, postRef} = action.payload);
    // // find the comments in the comment tree
    // // bfs
    // // push the child comments of the post to a queue
    // const q = [];
    // state[postIndex].comments.forEach((item) => {
    //   q.push(item);
    // });
    // while (q.length !== 0) {
    //   //   pop a comment
    //   const comment = q.shift();
    //   //   try matching,
    //   if (
    //     comment.author === postRef.author &&
    //     comment.permlink === postRef.permlink
    //   ) {
    //     // if success, update the payout, active_votes, votes_count
    //     payout = parseFloat(comment.postUserState.payout);
    //     newPayout = payout + voteAmount;
    //     newVotesCount = comment.postUserState.votes_count + 1;
    //     voters = comment.postUserState.active_votes;
    //     newVoters = [`${username} ($${voteAmount})`, ...voters];
    //     // @todo how to update the comment in the postsState?
    //     newPosts = [...state];
    //     newPosts[postIndex].postUserState.voted = true;
    //     newPosts[postIndex].postUserState.payout = newPayout.toFixed(2);
    //     newPosts[postIndex].postUserState.votes_count = newVotesCount;
    //     newPosts[postIndex].postUserState.active_votes = newVoters;
    //     console.log('[postsContext|reducer] found the comment', comment);
    //     return newPosts;
    //   } else {
    //     // if failed, push the child of the comment to the queue
    //     comment.comments.forEach((item) => {
    //       q.push(item);
    //     });
    //   }
    // }
    // console.error('[postsContext|reducer] failed to find the comment');
    // return newPosts;

    case PostsActionTypes.COMMENT_POST:
      console.log('[postReducer] add comment', action.payload);
      return state;
    // ({postIndex, username} = action.payload);
    // newPosts = [...state];
    // // increase the comment count
    // newPosts[postIndex].postUserState.comments_count += 1;
    // // set comment for the username
    // newPosts[postIndex].postUserState.commented = true;
    // // set new posts
    // return newPosts;
    default:
      return state;
  }
};
*/
