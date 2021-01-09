import React, {useState, useContext, useEffect} from 'react';
import {useIntl} from 'react-intl';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';
import {signImage, fetchRawPost} from '~/providers/blurt/dblurtApi';
import {Discussion} from 'dblurt';
import {PostingContent} from '~/contexts/types';
import {uploadImage} from '~/providers/blurt/imageApi';
//// navigation
import {navigate} from '~/navigation/service';
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
//// components
import {Beneficiary, AuthorList} from '~/components';
import {BeneficiaryItem} from '~/components/Beneficiary/BeneficiaryContainer';
import {BLURT_BENEFICIARY_WEIGHT, TARGET_BLOCKCHAIN} from '~/constants';
import {EditorView} from './EditorView';
//// utils
import {
  generateCommentPermlink,
  makeJsonMetadataComment,
  addPostingOptions,
  extractMetadata,
  generatePermlink,
  makeJsonMetadata,
} from '~/utils/editor';

// 5%
const DEFAULT_BENEFICIARY: BeneficiaryItem = {
  account: 'letsblurt',
  weight: BLURT_BENEFICIARY_WEIGHT,
};

interface Props {
  isComment: boolean;
  depth?: number;
  close?: boolean;
  handleSubmitComment?: (text: string) => Promise<boolean>;
}
const EditorContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {uiState, setToastMessage, setEditMode} = useContext(UIContext);
  const {postsState, appendTag, submitPost, updatePost} = useContext(
    PostsContext,
  );
  const {userState, getFollowings} = useContext(UserContext);
  // states
  const [originalPost, setOriginalPost] = useState(null);

  //// mount event
  //// edit mode event
  useEffect(() => {
    console.log('[Posting] uiState', uiState);
    //
    if (uiState.editMode) {
      console.log('[Posting] editMode, postDetails', postsState.postDetails);
      // get the post details
      setOriginalPost(postsState.postDetails);
    }
  }, [uiState.editMode]);

  // const _handleSubmitComment = async (comment: string): Promise<boolean> => {
  //   // check sanity
  //   if (comment === '') return;

  //   const {username, password} = authState.currentCredentials;
  //   const permlink = generateCommentPermlink(username);
  //   const jsonMeta = makeJsonMetadataComment(
  //     postsState.postDetails.metadata.tags || [TARGET_BLOCKCHAIN],
  //   );
  //   // build posting content
  //   const postingContent: PostingContent = {
  //     author: username,
  //     title: '',
  //     body: comment,
  //     parent_author: postsState.postRef.author,
  //     parent_permlink: postsState.postRef.permlink,
  //     json_metadata: JSON.stringify(jsonMeta) || '',
  //     permlink: permlink,
  //   };
  //   const result = await submitPost(postingContent, password, true);
  //   if (result) return true;
  //   return false;
  // };

  return (
    <EditorView
      isComment={props.isComment}
      depth={props.depth}
      close={props.close}
      handleSubmitComment={props.handleSubmitComment}
    />
  );
};

export {EditorContainer};
