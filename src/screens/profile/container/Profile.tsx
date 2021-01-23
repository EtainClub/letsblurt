import React, {useState, useContext, useEffect, useCallback} from 'react';
import {View, ActivityIndicator, Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
//// language
import {useIntl} from 'react-intl';
import firestore from '@react-native-firebase/firestore';
import {get, has} from 'lodash';
import {ProfileScreen} from '../screen/Profile';
import {ProfileEditForm} from '../screen/ProfileEdit';
import {
  AuthContext,
  UserContext,
  UIContext,
  PostsContext,
  SettingsContext,
} from '~/contexts';
import {PostsTypes, PostData, PostRef, ProfileData} from '~/contexts/types';
import {
  signImage,
  broadcastProfileUpdate,
  getVoteAmount,
} from '~/providers/blurt/dblurtApi';
import {uploadImage} from '~/providers/blurt/imageApi';

import {argonTheme} from '~/constants';

import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';

import {navigate} from '~/navigation/service';
import {updateLocale} from 'moment';

const Profile = ({navigation}): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  // contexts
  const {authState} = useContext(AuthContext)!;
  const {setPostRef} = useContext(PostsContext);
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
  const {settingsState} = useContext(SettingsContext);
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

  useFocusEffect(
    useCallback(() => {
      if (authState.loggedIn) {
        const {username} = authState.currentCredentials;
        setProfileFetched(false);
        _getUserProfileData(username);
        _fetchBookmarks(username);
        _fetchFavorites(username);
      }
    }, []),
  );

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

  //// edit event
  useEffect(() => {
    if (!editMode && profileData) {
      const {username} = authState.currentCredentials;
      _getUserProfileData(username);
    }
  }, [editMode]);

  const _getUserProfileData = async (author: string) => {
    // fetch user profile data
    const _profileData = await getUserProfileData(author);
    console.log('[_getUserProfileData] profile data', _profileData);
    if (!_profileData) {
      console.log('[_getUserProfileData] profile data', profileData);
      setProfileFetched(true);
      return;
    }
    // set profile data
    setProfileData(_profileData);
    // build summaries of blogs
    if (_profileData) {
      // extract summary data from blogs
      const summaries = _profileData.blogRefs.map((blogRef) => {
        // get content
        const blog = get(_profileData.blogs, blogRef, {});
        // get avatar
        const avatar = `${settingsState.blockchains.image}/u/${author}/avatar`;
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

  //// handle press bookmark
  const _handlePressBookmark = (postRef: PostRef) => {
    // set post ref
    setPostRef(postRef);
    // navigate to the post details
    navigate({name: 'PostDetails'});
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
      setToastMessage('updated');
      setUpdating(false);
      setEditMode(false);
    }
  };

  //// remove a bookmark in firestore
  const _removeBookmark = async (postRef: PostRef) => {
    const {username} = authState.currentCredentials;
    const docId = `${postRef.author}${postRef.permlink}`;
    // remove the bookmark doc
    firestore()
      .doc(`users/${username}`)
      .collection('bookmarks')
      .doc(docId)
      .delete()
      .then(() => {
        // refresh
        _fetchBookmarks(username);
        console.log('removed the bookmark successfully');
      })
      .catch((error) => console.log('failed to remove a bookmark', error));
  };

  //// remove a bookmark in firestore
  const _handleRemoveBookmark = async (postRef: PostRef, title: string) => {
    // show alert
    Alert.alert(
      intl.formatMessage({id: 'Profile.bookmark_remove_title'}),
      intl.formatMessage({id: 'Profile.bookmark_remove_body'}, {what: title}),
      [
        {text: intl.formatMessage({id: 'no'}), style: 'cancel'},
        {
          text: intl.formatMessage({id: 'yes'}),
          onPress: () => _removeBookmark(postRef),
        },
      ],
      {cancelable: true},
    );
  };

  //// remove a favorite author in firestore
  const _removeFavoriteAuthor = async (account: string) => {
    const {username} = authState.currentCredentials;
    // remove the favorite doc
    firestore()
      .doc(`users/${username}`)
      .collection('favorites')
      .doc(account)
      .delete()
      .then(() => {
        // refresh
        _fetchFavorites(username);
        console.log('removed the favorite successfully');
      })
      .catch((error) =>
        console.log('failed to remove a favorite author', error),
      );
  };

  const _handleRemoveFavorite = (account: string) => {
    // show alert
    Alert.alert(
      intl.formatMessage({id: 'Profile.favorite_remove_title'}),
      intl.formatMessage({id: 'Profile.favorite_remove_body'}, {what: account}),
      [
        {text: intl.formatMessage({id: 'no'}), style: 'cancel'},
        {
          text: intl.formatMessage({id: 'yes'}),
          onPress: () => _removeFavoriteAuthor(account),
        },
      ],
      {cancelable: true},
    );
  };

  return !editMode ? (
    profileData ? (
      <ProfileScreen
        profileData={profileData}
        blogs={blogs}
        bookmarks={bookmarks}
        favorites={favorites}
        imageServer={settingsState.blockchains.image}
        handlePressFavoriteItem={_handlePressFavoriteItem}
        clearPosts={_clearPosts}
        handlePressEdit={_handlePressEdit}
        handlePressBookmark={_handlePressBookmark}
        removeBookmark={_handleRemoveBookmark}
        removeFavorite={_handleRemoveFavorite}
      />
    ) : (
      !profileFetched && (
        <View style={{top: 20}}>
          <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
        </View>
      )
    )
  ) : (
    profileData && (
      <ProfileEditForm
        profileData={profileData}
        uploading={uploading}
        updating={updating}
        avatarUrl={avatarUrl}
        handlePressUpdate={_handlePressUpdate}
        handlePhotoUpload={_handlePhotoUpload}
        handleCameraUpload={_handleCameraUpload}
      />
    )
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
