// post details container
import React, {useState, useEffect, useContext} from 'react';

import {PostDetailsScreen} from '../screen/PostDetails';
// steem api
import {fetchComments} from '~/providers/blurt/dblurtApi';

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
  } = useContext(PostsContext);
  const {uiState, setTagParam} = useContext(UIContext);
  // states
  const [postDetails, setPostDetails] = useState<PostData>(null);
  const [comments, setComments] = useState<CommentData[]>(null);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    _fetchPostDetailsEntry();
    // update vote amount
    if (authState.loggedIn) {
      updateVoteAmount(authState.currentCredentials.username);
    }
  }, []);

  useEffect(() => {
    // clear submitted
    setSubmitted(false);
    // fetch comments
    _fetchComments();
  }, [submitted]);

  const _fetchPostDetailsEntry = async () => {
    console.log('_fetchPostDetailsEntry postRef', postsState.postRef);
    // get post details
    const details = await getPostDetails(
      postsState.postRef,
      authState.currentCredentials.username,
    );
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
      password: password,
      title: '',
      body: comment,
      parent_author: postsState.postRef.author,
      parent_permlink: postsState.postRef.permlink,
      json_metadata: JSON.stringify(jsonMeta) || '',
      permlink: permlink,
    };

    const {success, message} = await submitPost(postingContent, true, index);
    // set submitted flag
    setSubmitted(true);
    return message;
  };

  const _handlePressTag = (tag: string) => {
    console.log('[PostDetailsContainer] handlePressTag, tag', tag);
    // set tag param
    setTagParam(tag);
    // navigate to feed
    navigate({name: 'Feed'});
  };

  return (
    postDetails && (
      <PostDetailsScreen
        post={postDetails}
        index={index}
        comments={comments}
        handleRefresh={_onRefresh}
        fetchComments={_fetchComments}
        handleSubmitComment={_onSubmitComment}
        handlePressTag={_handlePressTag}
      />
    )
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
