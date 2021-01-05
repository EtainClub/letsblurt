import React, {useState, useContext, useEffect} from 'react';
import {useIntl} from 'react-intl';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {AuthContext, PostsContext, UIContext, UserContext} from '~/contexts';
import {PostingScreen} from '../screen/Posting';
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
  navigation: any;
  route: any;
}
const Posting = (props: Props): JSX.Element => {
  //// props
  const {navigation} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {uiState, setToastMessage, setTagParam, setEditMode} = useContext(
    UIContext,
  );
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
  useEffect(() => {
    // get following
    if (authState.loggedIn) {
      const {username} = authState.currentCredentials;
      // get following list
      _getFollowingList(username);
      // add default beneficairy
      if (username === 'letsblurt') {
        setBeneficiaries([
          {account: username, weight: 5000},
          {account: 'etainclub', weight: 5000},
        ]);
      } else {
        const userWeight = 10000 - DEFAULT_BENEFICIARY.weight;
        setBeneficiaries([
          DEFAULT_BENEFICIARY,
          {account: username, weight: userWeight},
        ]);
      }
    }
  }, []);
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
  //// on blur event
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('[Posting] blur event. uiState', uiState);
      // reset edit mode before go back
      if (uiState.editMode) {
        setEditMode(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

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

  // ////
  // const _handlePhotoUpload = () => {
  //   ImagePicker.openPicker({
  //     width: 640,
  //     includeBase64: true,
  //   })
  //     .then((photos) => {
  //       _uploadPhoto(photos);
  //     })
  //     .catch((error) => {
  //       _handleSelectionFailure(error);
  //     });
  // };

  // ////
  // const _handleCameraUpload = () => {
  //   ImagePicker.openCamera({
  //     includeBase64: true,
  //   })
  //     .then((image) => {
  //       _uploadPhoto(image);
  //     })
  //     .catch((error) => {
  //       _handleSelectionFailure(error);
  //     });
  // };

  // //// upload a photo
  // const _uploadPhoto = async (photo: ImageOrVideo) => {
  //   console.log('[PostingContainer] _uploadPhoto. photo', photo);
  //   setUploading(true);
  //   // check logged in
  //   if (!authState.loggedIn) return;
  //   const {username, password} = authState.currentCredentials;
  //   // sign the photo
  //   let sign = await signImage(photo, username, password);
  //   console.log('[_uploadPhoto] sign', sign);
  //   // check sanity
  //   if (!sign) return;
  //   // upload photo
  //   uploadImage(photo, username, sign)
  //     .then((res) => {
  //       console.log('[PostingContainer] uploadImage, res', res);
  //       if (res.data && res.data.url) {
  //         res.data.hash = res.data.url.split('/').pop();
  //         setUploading(false);
  //         setToastMessage('Upload Successful!');
  //         setUploadedImage(res.data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log('Failed to upload image', error, error.message);
  //       if (error.toString().includes('code 413')) {
  //         setToastMessage(intl.formatMessage({id: 'Alert.payload_too_large'}));
  //       } else if (error.toString().includes('code 429')) {
  //         setToastMessage(intl.formatMessage({id: 'Alert.quota_exceeded'}));
  //       } else if (error.toString().includes('code 400')) {
  //         setToastMessage(intl.formatMessage({id: 'Alert.invalid_image'}));
  //       } else {
  //         setToastMessage(intl.formatMessage({id: 'Alert.failed'}));
  //       }
  //       // clear uploading
  //       setUploading(false);
  //     });
  // };

  // //// handle selection failure
  // const _handleSelectionFailure = (error) => {};

  ////
  const _getUploadedImageUrl = (url: string) => {
    console.log('_getUploadedImageUrl', url);
  };

  //// handle press post
  const _handlePressPostSumbit = async (
    title: string,
    body: string,
    tags: string,
  ) => {
    setPosting(true);

    ////// build a post
    // author is the user
    const {username, password} = authState.currentCredentials;
    // extract meta
    const _meta = extractMetadata(body);
    // split tags by space
    const _tags = tags.split(' ');
    const jsonMeta = makeJsonMetadata(_meta, _tags);
    let permlink = '';
    let options = null;
    // generate permlink for a new post
    if (!originalPost) {
      permlink = generatePermlink(title);
      //// check duplicate permlink, if so generate a random
      let duplicate: Discussion = await fetchRawPost(username, permlink);
      if (duplicate && duplicate.id) {
        permlink = generatePermlink(title, true);
      }
      // add options such as beneficiaries
      options = addPostingOptions(username, permlink, 'powerup', beneficiaries);
      console.log('_handlePressPostSumbit. options', options);
    }
    // build posting content
    const postingContent: PostingContent = {
      author: username,
      title: title,
      body: body,
      parent_author: '',
      parent_permlink: _tags[0],
      json_metadata: JSON.stringify(jsonMeta) || '',
      permlink: permlink,
    };
    //// update post if original post exists
    let success = false;
    let message = '';
    if (originalPost) {
      // TODO: use submitPost after patching instead of updatePost
      // patch = utils editors createPatch
      ({success, message} = await updatePost(
        originalPost.body,
        originalPost.state.post_ref.permlink,
        originalPost.state.parent_ref.permlink,
        postingContent,
        password,
        false,
      ));
    } else {
      //// submit the post
      const result = await submitPost(postingContent, password, false, options);
      if (result) {
        // TODO: clear the title, body, and tags, beneficiary
        // initialie beneficiaries
        if (username === 'letsblurt') {
          setBeneficiaries([
            {account: username, weight: 5000},
            {account: 'etainclub', weight: 5000},
          ]);
        } else {
          setBeneficiaries([
            DEFAULT_BENEFICIARY,
            {
              account: username,
              weight: 10000 - DEFAULT_BENEFICIARY.weight,
            },
          ]);
        }

        // TODO: set tag or feed
        navigate({name: 'Feed'});
      }
      //// TODO: update post details.. here or in postsContext
    }
    // toast message
    setToastMessage(message);
    // clear posting flag
    setPosting(false);

    //// navigate
    if (success) {
      // append tag
      appendTag(_tags[0]);
      // set tag param
      //      setTagParam(_tags[0]);
      // navigate to the feed with the first tag
      navigate({name: 'Feed'});
    }
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
    // go back
    navigation.goBack();
  };

  return (
    <Block>
      <PostingScreen
        originalPost={originalPost}
        uploading={uploading}
        uploadedImage={uploadedImage}
        posting={posting}
        handlePressPostSumbit={_handlePressPostSumbit}
        followingList={filteredFollowings}
        handleMentionAuthor={_showAuthorsModal}
        handlePressBeneficiary={_handlePressBeneficiary}
        handleCancelEditing={_handleCancelEditing}
        getUploadedImageURL={_getUploadedImageUrl}
      />
      {showBeneficiaryModal ? (
        <Beneficiary
          username={authState.currentCredentials.username}
          beneficiaries={beneficiaries}
          sourceList={followingList}
          getBeneficiaries={_getBeneficiaries}
        />
      ) : null}
    </Block>
  );
};

export {Posting};
