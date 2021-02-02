//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {Platform} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// firebase
import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
// blurt api
import {fetchComments} from '~/providers/blurt/dblurtApi';
//// contexts
import {AuthContext, UIContext} from '~/contexts';
import {CommentData, PostRef} from '~/contexts/types';
//// views
import {CommentsView} from './CommentsView';
//// constants

import {View, Text} from 'react-native';

//// props
interface Props {
  postRef: PostRef;
  indent?: number;
}
const CommentsContainer = (props: Props): JSX.Element => {
  //// props
  const {indent} = props;
  //// context
  const {authState} = useContext(AuthContext);
  //// states
  const [postRef, setPostRef] = useState<PostRef>(props.postRef);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [showChildComments, setShowChildComments] = useState(false);
  //// effects
  // effect: mount
  useEffect(() => {
    _fetchComments();
  }, []);

  //// fetch comments
  const _fetchComments = async () => {
    // fetch comments on this post
    const _comments = await fetchComments(
      postRef.author,
      postRef.permlink,
      authState.currentCredentials.username,
    );
    console.log('_fetchComments', _comments);

    setComments(_comments);
  };

  ////
  const _handlePressChildren = (_postRef: PostRef) => {
    // set post ref
    setPostRef(_postRef);
    // fetch child comments
    _fetchComments();
    // toggle the state
    setShowChildComments(!showChildComments);
  };

  return (
    <CommentsView
      comments={comments}
      showChildComments={showChildComments}
      handlePressChildren={_handlePressChildren}
    />
  );
};

export {CommentsContainer};
