//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
//// config
//// language
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
import {PostState} from '~/contexts/types';
import {AuthContext, PostsContext, UserContext, UIContext} from '~/contexts';
import {PostRef} from '~/contexts/types';
import {ActionBarView} from './ActionBarView';
import {ActionBarStyle} from '~/constants/actionBarTypes';
import {reblog} from '~/providers/blurt/dblurtApi';

interface Props {
  actionBarStyle: ActionBarStyle;
  postState: PostState;
  postIndex?: number;
  handlePressComments?: () => void;
  handlePressEditComment?: () => void;
  handlePressReply?: () => void;
  handlePressTranslation?: (showOriginal: boolean) => void;
}

const ActionBarContainer = (props: Props): JSX.Element => {
  //// props
  const {postState} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {postsState, upvote, bookmarkPost, setPostRef} = useContext(
    PostsContext,
  );
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
      parseFloat(userState.profileData.profile.voteAmount),
      setToastMessage,
    );
    console.log('[ActionBarContainer|_processVoting] results', results);
    setToastMessage(intl.formatMessage({id: 'Actionbar.voted'}));

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

  //// handle press bookmark
  const _handlePressBookmark = () => {
    // check sanity: logged in
    if (!authState.loggedIn) return;
    // create or append collection in firebase
    bookmarkPost(
      postState.post_ref,
      authState.currentCredentials.username,
      postState.title,
      setToastMessage,
    );
  };

  ////
  const _handlePressReblog = async () => {
    if (!authState.loggedIn) return;
    const {username, password} = authState.currentCredentials;
    const {author, permlink} = postState.post_ref;
    const {chainProps} = userState.globalProps;
    const op_fee = parseFloat(chainProps.operation_flat_fee.split(' ')[0]);
    const bw_fee = parseFloat(chainProps.bandwidth_kbytes_fee.split(' ')[0]);

    const result = await reblog(
      username,
      password,
      author,
      permlink,
      op_fee,
      bw_fee,
    );
  };

  ////
  const _handlePressTranslation = (showOriginal: boolean) => {
    props.handlePressTranslation(showOriginal);
  };

  return (
    <ActionBarView
      actionBarStyle={props.actionBarStyle}
      postState={postState}
      postIndex={props.postIndex}
      loggedIn={authState.loggedIn}
      isUser={
        authState.currentCredentials.username === postState.post_ref.author
      }
      //      voteAmount={parseFloat(userState.profileData.profile.voteAmount)}
      voteAmount={parseFloat(userState.voteAmount)}
      handlePressVoting={_processVoting}
      handlePressEditPost={_handlePressEditPost}
      handlePressReply={props.handlePressReply}
      handlePressComments={props.handlePressComments}
      handlePressEditComment={props.handlePressEditComment}
      handlePressVoter={_handlePressVoter}
      handlePressBookmark={_handlePressBookmark}
      handlePressReblog={_handlePressReblog}
      handlePressTranslation={_handlePressTranslation}
    />
  );
};

export {ActionBarContainer};
