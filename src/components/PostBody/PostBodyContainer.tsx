import React, {useRef, useState, useContext} from 'react';
import {get} from 'lodash';
import {useIntl} from 'react-intl';
import {PostBodyView} from './PostBodyView';
import {UIContext, AuthContext, PostsContext} from '~/contexts';
import {navigate} from '~/navigation/service';

import {Text} from 'react-native';

interface Props {
  body: string;
  commentDepth?: number;
}
const PostBodyContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {setAuthorParam, setToastMessage} = useContext(UIContext);
  const {authState} = useContext(AuthContext);
  const {setPostRef, appendTag} = useContext(PostsContext);
  //// states
  const [selectedLink, setSelectedLink] = useState(null);

  const _handlePostPress = (author: string, permlink: string) => {
    if (permlink) {
      // set post ref
      setPostRef({author, permlink});
      // TODO: set post index. can we set? no
      //
      navigate({name: 'PostDetails'});
    }
  };

  const _handleAuthorPress = (author: string) => {
    if (author) {
      setAuthorParam(author);
      if (authState.currentCredentials.username === author) {
        navigate({name: 'Profile'});
      } else {
        navigate({
          name: 'AuthorProfile',
        });
      }
    } else {
      setToastMessage(
        intl.formatMessage({
          id: 'PostDetails.wrong_link',
        }),
      );
    }
  };

  const _handleTagPress = (tag: string) => {
    console.log('[PostBodyContainer] _handleTagPress');
    // append tag
    appendTag(tag);
    if (tag) {
      navigate({
        name: 'Feed',
      });
    }
  };

  return (
    <PostBodyView
      body={props.body}
      commentDepth={props.commentDepth ? props.commentDepth : 0}
      handlePostPress={_handlePostPress}
      handleAuthorPress={_handleAuthorPress}
      handleTagPress={_handleTagPress}
    />
  );
};

export {PostBodyContainer};
