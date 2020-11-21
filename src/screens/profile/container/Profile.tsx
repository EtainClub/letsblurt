import React, {useState, useContext, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
//// language
import {useIntl} from 'react-intl';
import {get, has} from 'lodash';
import {ProfileScreen} from '../screen/Profile';
import {ProfileEditForm} from '../screen/ProfileEdit';
import {AuthContext, UserContext, UIContext, PostsContext} from '~/contexts';
import {PostsTypes, PostData, ProfileData} from '~/contexts/types';
import {
  signImage,
  broadcastProfileUpdate,
  getVoteAmount,
} from '~/providers/blurt/dblurtApi';
import {uploadImage} from '~/providers/blurt/imageApi';

import {
  Images,
  argonTheme,
  BLURT_IMAGE_SERVER,
  STEEM_IMAGE_SERVER,
} from '~/constants';
// TODO: generalize this for Steem chain
const IMAGE_SERVER = BLURT_IMAGE_SERVER;

import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';

import {navigate} from '~/navigation/service';
import {updateLocale} from 'moment';

const Profile = ({navigation}): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  // contexts
  const {authState} = useContext(AuthContext)!;
  const {
    userState,
    getUserProfileData,
    getNotifications,
    getFollowings,
    getFollowers,
  } = useContext(UserContext);
  const {uiState, setAuthorParam, setToastMessage} = useContext(UIContext);
  const {
    postsState,
    fetchPosts,
    fetchBookmarks,
    fetchFavorites,
    clearPosts,
  } = useContext(PostsContext);
  // states
  const [profileData, setProfileData] = useState<ProfileData>(null);
  const [profileFetched, setProfileFetched] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [blogs, setBlogs] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [postsFetching, setPostsFetching] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  console.log('[ProfileContainer] navigation', navigation);

  //// fetch user state
  useEffect(() => {
    if (authState.loggedIn) {
      const {username} = authState.currentCredentials;
      setProfileFetched(false);
      _getUserProfileData(username);
      _fetchBookmarks(username);
      _fetchFavorites(username);
    }
  }, [authState.currentCredentials]);
  //// TODO: fetch user's bookmark and favorites

  const _getUserProfileData = async (author: string) => {
    // fetch user profile data
    const _profileData = await getUserProfileData(author);
    console.log('[_getUserProfileData] profile data', _profileData);
    // set profile data
    setProfileData(_profileData);
    // build summaries of blogs
    if (_profileData) {
      // extract summary data from blogs
      const summaries = _profileData.blogRefs.map((blogRef) => {
        // get content
        const blog = get(_profileData.blogs, blogRef, {});
        // get avatar
        const avatar = `${IMAGE_SERVER}/u/${author}/avatar`;
        // update avatar url state
        setAvatarUrl(avatar);
        return {
          author,
          //          avatar,
          title: blog.title,
          createdAt: blog.created,
          postRef: {
            author: author,
            permlink: blogRef.split('/')[1],
          },
        };
      });
      console.log('[_getAuthorProfile] blog summarys', summaries);
      setBlogs(summaries);
      setProfileFetched(true);
    }
  };

  //// fetch bookmarks
  const _fetchBookmarks = async (username: string) => {
    const bookmarks = await fetchBookmarks(username);
    // set bookmarks
    setBookmarks(bookmarks);
  };

  //// fetch favorites
  const _fetchFavorites = async (username: string) => {
    const favorites = await fetchFavorites(username);
    // set favorites
    setFavorites(favorites);
  };

  ////
  const _handlePressFavoriteItem = (author: string) => {
    // set author param
    setAuthorParam(author);
    // navigate
    navigate({name: 'AuthorProfile'});
  };

  ////
  const _handlePressEdit = () => {
    setEditMode(true);
  };
  //// clear posts
  const _clearPosts = async () => {
    console.log('[ProfileContainer] clear posts');
    clearPosts(PostsTypes.FEED);
  };

  /////// edit related
  ////
  const _handlePhotoUpload = () => {
    ImagePicker.openPicker({
      width: 640,
      includeBase64: true,
    })
      .then((photos) => {
        _uploadPhoto(photos);
      })
      .catch((error) => {
        _handleSelectionFailure(error);
      });
  };

  ////
  const _handleCameraUpload = () => {
    ImagePicker.openCamera({
      includeBase64: true,
    })
      .then((image) => {
        _uploadPhoto(image);
      })
      .catch((error) => {
        _handleSelectionFailure(error);
      });
  };

  //// handle selection failure
  const _handleSelectionFailure = (error) => {};

  //// upload a photo
  const _uploadPhoto = async (photo: ImageOrVideo) => {
    console.log('[ProfileEdit] _uploadPhoto. photo', photo);
    setUploading(true);
    // check logged in
    if (!authState.loggedIn) return;
    const {username, password} = authState.currentCredentials;
    // sign the photo
    let sign = await signImage(photo, username, password);
    console.log('[_uploadPhoto] sign', sign);
    // check sanity
    if (!sign) return;
    // upload photo
    uploadImage(photo, username, sign)
      .then((res) => {
        console.log('[PostingContainer] uploadImage, res', res);
        if (res.data && res.data.url) {
          res.data.hash = res.data.url.split('/').pop();
          setUploading(false);
          setToastMessage('Upload Successful!');
          setAvatarUrl(res.data.url);
        }
      })
      .catch((error) => {
        console.log('Failed to upload image', error, error.message);
        if (error.toString().includes('code 413')) {
          setToastMessage(intl.formatMessage({id: 'Alert.payload_too_large'}));
        } else if (error.toString().includes('code 429')) {
          setToastMessage(intl.formatMessage({id: 'Alert.quota_exceeded'}));
        } else if (error.toString().includes('code 400')) {
          setToastMessage(intl.formatMessage({id: 'Alert.invalid_image'}));
        } else {
          setToastMessage(intl.formatMessage({id: 'Alert.failed'}));
        }
        // clear uploading
        setUploading(false);
      });
  };

  //// update the profile
  const _handlePressUpdate = async (_params: any) => {
    if (authState.loggedIn) {
      // set updating
      setUpdating(true);
      const {username, password} = authState.currentCredentials;
      const params = {
        ..._params,
        profile_image: avatarUrl,
        cover_image: profileData.profile.metadata.cover_image,
      };
      // broadcast the update to blockchain
      const result = await broadcastProfileUpdate(username, password, params);
      setUpdating(false);
      //      setEditMode(false);
    }
  };

  return !editMode
    ? profileData && (
        <ProfileScreen
          profileData={profileData}
          blogs={blogs}
          bookmarks={bookmarks}
          favorites={favorites}
          handlePressFavoriteItem={_handlePressFavoriteItem}
          clearPosts={_clearPosts}
          handlePressEdit={_handlePressEdit}
        />
      )
    : profileData && (
        <ProfileEditForm
          profileData={profileData}
          uploading={uploading}
          updating={updating}
          avatarUrl={avatarUrl}
          handlePressUpdate={_handlePressUpdate}
          handlePhotoUpload={_handlePhotoUpload}
          handleCameraUpload={_handleCameraUpload}
        />
      );
};

export {Profile};

/*

// tab press handling: show user's profile
  useEffect(() => {
    const unsubscribe = navigation
      .dangerouslyGetParent()
      .addListener('tabPress', (event) => {
        // prevent default behavior
        event.preventDefault();
        // clear the author in uiState
        setAuthorParam('');
        // clear posts
        clearPosts(PostsTypes.AUTHOR);
        // get username
        const username = authState.currentCredentials.username;
        console.log('username', username);
        // check sanity
        if (authState.loggedIn && username) {
          // fetch user's profile
          _fetchAuthorData(username);
        }
        // unsubscribe listening event
        return unsubscribe;
      });
  }, [navigation]);


  // handle screen focus event
  useFocusEffect(
    useCallback(() => {
      console.log(
        '[ProfileContainer] focus event. uiState author',
        uiState.selectedAuthor,
      );
      // fetch user profile, if no selected author
      if (!uiState.selectedAuthor || uiState.selectedAuthor === '') {
        // get username
        const username = authState.currentCredentials.username;
        // check sanity
        if (authState.loggedIn && username) {
          // fetch author data with username
          _fetchAuthorData(username);
        }
      } else {
        // selected author exists, let's fetch the author data
        _fetchAuthorData(uiState.selectedAuthor);
      }
    }, [uiState.selectedAuthor]),
  );

  // handling blur event: setup feed posts
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('blur', (event) => {
  //     console.log('[ProfileContainer] blur event. uiState', uiState);

  //     // clear the author in uiState
  //     setAuthor('');
  //     // setup feed posts
  //     setupFetchPosts(
  //       PostsTypes.FEED,
  //       uiState.tag,
  //       uiState.tagIndex,
  //       uiState.filterIndex,
  //       authState.currentCredentials.username,
  //     );

  //     return unsubscribe;
  //   });
  // }, [navigation]);


    const _fetchAuthorData = async (author: string) => {
    console.log('[fetchAuthorData] author', author);
    const profilePromise = new Promise((resolve, reject) =>
      //      resolve(fetchProfile(author)),
      resolve(),
    );
    const amountPromise = new Promise((resolve, reject) =>
      resolve(getVoteAmount(author, userState.globalProps)),
    );
    Promise.all([profilePromise, amountPromise]).then((results) => {
      console.log('[Profile] Promise Results', results);
      if (!results[0]) return;
      const userData: ProfileData = {
        profile: results[0],
        voteAmount: results[1],
      };
      // check if the author is the user
      userData.isUser =
        uiState.selectedAuthor === authState.currentCredentials.username;
      console.log('[fetchAuthorData] userData', userData);
      // set author data
      setAuthorData(userData);
    });
  };

  */
