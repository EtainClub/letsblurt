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
import {BLURT_BENEFICIARY_WEIGHT} from '~/constants';
import {EditorView} from './EditorView';
//// utils
import {
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
  //  const [editMode, setEditMode] = useState(route.params?.editMode);
  const [originalPost, setOriginalPost] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [filteredFollowings, setFilteredFollowings] = useState([]);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);

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

  //// get followings
  const _getFollowingList = async (username: string) => {
    const _followings = await getFollowings(username);
    setFollowingList(_followings);
    setFilteredFollowings(_followings);
  };

  //// handle mentioning: filter following list
  const _showAuthorsModal = (text: string) => {
    //    console.log('_showAuthorList. text', text);
    // let _filtered = followingList;
    // if (text != '') {
    //   _filtered = followingList.filter((author) => author.includes(text));
    // }
    // setFilteredFollowings(_filtered);

    // @test
    setShowAuthorsModal(true);
  };

  ////
  const _handlePressAuthor = (author: string) => {
    console.log('press author', author);
  };

  ////
  const _getUploadedImageUrl = (url: string) => {
    console.log('_getUploadedImageUrl', url);
  };

  const _handlePressBeneficiary = () => {
    setShowBeneficiaryModal(!showBeneficiaryModal);
  };

  const _getBeneficiaries = (_beneficiaries: any[]) => {
    console.log('[Posting] Beneficiaries', _beneficiaries);
    setBeneficiaries(_beneficiaries);
  };

  const _handleCancelEditing = () => {
    // reset edit mode
    setEditMode(false);
  };

  return <EditorView isComment={props.isComment} styles={props.styles} />;
};

export {EditorContainer};
