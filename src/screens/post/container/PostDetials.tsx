// post details container
// react
import React, {useState, useEffect, useContext} from 'react';
// react native
import {View, ActivityIndicator} from 'react-native';
import {PostDetailsScreen} from '../screen/PostDetails';
// blurt api
import {fetchComments} from '~/providers/blurt/dblurtApi';
import {argonTheme} from '~/constants/argonTheme';
import {navigate} from '~/navigation/service';
import {
  PostRef,
  PostData,
  PostsTypes,
  PostingContent,
  CommentData,
} from '~/contexts/types';
import {PostsContext, AuthContext, UIContext, UserContext} from '~/contexts';
import {generateCommentPermlink, makeJsonMetadataComment} from '~/utils/editor';
import {TARGET_BLOCKCHAIN} from '~/constants/blockchain';

interface Props {
  route: any;
}

const PostDetails = (props: Props): JSX.Element => {
  // props
  const {route} = props;
  const index = route.params?.index;
  // contexts
  const {authState} = useContext(AuthContext);
  const {userState, updateVoteAmount} = useContext(UserContext);
  const {
    postsState,
    submitPost,
    getPostDetails,
    fetchDatabaseState,
    appendTag,
  } = useContext(PostsContext);
  const {uiState} = useContext(UIContext);
  // states
  const [loading, setLoading] = useState(true);
  const [postDetails, setPostDetails] = useState<PostData>(null);
  const [comments, setComments] = useState<CommentData[]>(null);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [parentPost, setParentPost] = useState<PostData>(null);
  //////// events
  //// event: component creation
  useEffect(() => {
    _fetchPostDetailsEntry();
    // update vote amount
    if (authState.loggedIn) {
      updateVoteAmount(authState.currentCredentials.username);
    }
  }, []);
  //// event: new post ref set
  useEffect(() => {
    if (postsState.postRef) {
      // fetch post
      _fetchPostDetailsEntry();
    }
  }, [postsState.postRef]);
  //// event: comment submitted
  useEffect(() => {
    // clear submitted
    setSubmitted(false);
    // fetch comments
    _fetchComments();
  }, [submitted]);
  //// event: parent post exists
  useEffect(() => {
    // parent post exist?
    if (postDetails && postDetails.depth > 0) {
      // fetch parent post
      _fetchParentPost(postDetails.state.parent_ref);
    }
  }, [postDetails]);

  const _fetchPostDetailsEntry = async () => {
    console.log('_fetchPostDetailsEntry postRef', postsState.postRef);
    // remove the parent post
    setParentPost(null);
    setLoading(true);
    // get post details
    const details = await getPostDetails(
      postsState.postRef,
      authState.currentCredentials.username,
    );
    setLoading(false);
    if (!details) return;
    // fetch database
    const {bookmarked} = await fetchDatabaseState(
      postsState.postRef,
      authState.currentCredentials.username,
    );
    details.state.bookmarked = bookmarked;
    // set post details
    setPostDetails(details);
    // fetch comments
    _fetchComments();
  };

  const _fetchParentPost = async (postRef: PostRef) => {
    console.log('_fetchParentPost. postRef', postRef);
    // get post details
    const details = await getPostDetails(
      postRef,
      authState.currentCredentials.username,
    );
    // go up the tree to the root
    if (details.depth > 0) {
      await _fetchParentPost(details.state.parent_ref);
      console.log('_fetchParentPost. details', details);
      return details;
    }
    console.log('_fetchParentPost. parent details', details);
    // set parent post
    setParentPost(details);
  };

  const _fetchComments = async () => {
    // fetch comments on this post
    const _comments = await fetchComments(
      postsState.postRef.author,
      postsState.postRef.permlink,
      authState.currentCredentials.username,
    );
    console.log('_fetchComments', _comments);
    setComments(_comments);
  };

  const _onRefresh = async () => {
    await _fetchPostDetailsEntry();
    console.log('[PostDetails] refreshed, comments', comments);
  };

  const _onSubmitComment = async (comment: string): Promise<string> => {
    // check sanity
    if (comment === '') return;

    const {username, password} = authState.currentCredentials;
    const permlink = generateCommentPermlink(username);
    const jsonMeta = makeJsonMetadataComment(
      postsState.postDetails.metadata.tags || [TARGET_BLOCKCHAIN],
    );
    // build posting content
    const postingContent: PostingContent = {
      author: username,
      title: '',
      body: comment,
      parent_author: postsState.postRef.author,
      parent_permlink: postsState.postRef.permlink,
      json_metadata: JSON.stringify(jsonMeta) || '',
      permlink: permlink,
    };

    const {success, message} = await submitPost(
      postingContent,
      password,
      index,
    );
    // set submitted flag
    setSubmitted(true);
    return message;
  };

  //// handle press hash tag
  const _handlePressTag = (tag: string) => {
    console.log('[PostDetailsContainer] handlePressTag, tag', tag);
    // append a new tag to tag list
    appendTag(tag);
    // navigate to feed
    navigate({name: 'Feed'});
  };

  return postDetails ? (
    <PostDetailsScreen
      post={postDetails}
      loading={loading}
      parentPost={parentPost}
      index={index}
      comments={comments}
      handleRefresh={_onRefresh}
      fetchComments={_fetchComments}
      handleSubmitComment={_onSubmitComment}
      handlePressTag={_handlePressTag}
    />
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
    </View>
  );
};

export {PostDetails};

/*
    // fetch post details
    const postPromise = new Promise((resolve, reject) =>
      resolve(
        getPostDetails(
          postsState.postRef,
          authState.currentCredentials.username,
        ),
      ),
    );
    const commentPromise = new Promise((resolve, reject) => {
      resolve(_fetchComments());
    });

    Promise.all([postPromise, commentPromise]).then((results) => {
      // set post details
      setPostDetails(results[0] as PostData);
      // set comment
      setComments(results[1] as CommentData[]);
    });
*/
