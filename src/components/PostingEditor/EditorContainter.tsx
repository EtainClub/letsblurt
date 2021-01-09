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

interface Props {
  isComment: boolean;
  originalPost?: string;
  depth?: number;
  close?: boolean;
  handleBodyChange?: (body: string) => void;
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
  // states
  const [originalPost, setOriginalPost] = useState('');

  //////// events
  //// edit event. set body
  useEffect(() => {
    if (props.originalPost) {
      console.log('original body exists', props.originalPost);
      setOriginalPost(props.originalPost);
    }
  }, [props.originalPost]);

  return (
    <EditorView
      isComment={props.isComment}
      originalPost={originalPost}
      depth={props.depth}
      close={props.close}
      handleBodyChange={props.handleBodyChange}
      handleSubmitComment={props.handleSubmitComment}
    />
  );
};

export {EditorContainer};
