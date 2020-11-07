import React, {useState, useEffect, useContext} from 'react';

import {navigate} from '~/navigation/service';
import {PostState} from '~/contexts/types';
import {AuthContext, PostsContext, UserContext, UIContext} from '~/contexts';

import {ActionBarView} from './ActionBarView';
import {ActionBarStyle} from '~/constants/actionBarTypes';

interface Props {
  actionBarStyle: ActionBarStyle;
  postState: PostState;
  postIndex?: number;
  handlePressComments?: () => void;
  handlePressEditComment?: () => void;
  handlePressReply?: () => void;
}

const ActionBarContainer = (props: Props): JSX.Element => {
  // props
  const {postState} = props;
  // contexts
  const {postsState, upvote, setPostRef} = useContext(PostsContext);
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {uiState, setToastMessage, setAuthorParam, setEditMode} = useContext(
    UIContext,
  );
  // states
  //  const [postState, setPostState] = useState<PostState>(props.postState);
  const [voted, setVoted] = useState(false);

  //////// use effect
  // set new post state
  // useEffect(() => {
  //   console.log(
  //     '[ActionBarContainer|useEffect] props post state',
  //     props.postState,
  //   );
  //   // for only postpostState
  //   if (!props.postState.isComment) {
  //     setPostState(props.postState);
  //   }
  // }, [props.postState]);

  // useEffect(() => {
  //   // for only post
  //   if (!props.postState.isComment) {
  //     setPostState(props.postState);
  //   }
  // }, [voted]);

  const _processVoting = async (votingWeight: number) => {
    // check sanity
    if (!authState.loggedIn) {
      return false;
    }

    const results = await upvote(
      props.postIndex,
      postState.isComment,
      postState.post_ref,
      authState.currentCredentials.username,
      authState.currentCredentials.password,
      votingWeight,
      parseFloat(userState.voteAmount),
      setToastMessage,
    );
    console.log('[ActionBarContainer|_processVoting] results', results);
    setToastMessage(`Voted! block num ${results.block_num}`);

    setVoted(true);
    return true;
  };

  const _handlePressVoter = (voter: string) => {
    setAuthorParam(voter);
    if (authState.currentCredentials.username === voter) {
      navigate({name: 'Profile'});
    } else {
      navigate({name: 'AuthorProfile'});
    }
  };

  ////
  const _handlePressEditPost = () => {
    // set edit mode
    setEditMode(true);
    // navigate to the posting
    navigate({name: 'Posting'});
  };

  return (
    <ActionBarView
      actionBarStyle={props.actionBarStyle}
      postState={postState}
      postIndex={props.postIndex}
      loggedIn={authState.loggedIn}
      voteAmount={parseFloat(userState.voteAmount)}
      handlePressVoting={_processVoting}
      handlePressEditPost={_handlePressEditPost}
      handlePressReply={props.handlePressReply}
      handlePressComments={props.handlePressComments}
      handlePressEditComment={props.handlePressEditComment}
      handlePressVoter={_handlePressVoter}
    />
  );
};

export {ActionBarContainer};
