import React, {useState, useContext, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {get, has} from 'lodash';
import {ProfileScreen} from '../screen/Profile';
import {ProfileEditForm} from '../screen/ProfileEdit';
import {AuthContext, UserContext, UIContext, PostsContext} from '~/contexts';
import {PostsTypes, PostData, ProfileData} from '~/contexts/types';
import {getVoteAmount} from '~/providers/blurt/dblurtApi';
import {
  Images,
  argonTheme,
  BLURT_IMAGE_SERVER,
  STEEM_IMAGE_SERVER,
} from '~/constants';
import {navigate} from '~/navigation/service';

const Profile = ({navigation}): JSX.Element => {
  // contexts
  const {authState} = useContext(AuthContext)!;
  const {userState, getUserProfileData, getNotifications} = useContext(
    UserContext,
  );
  const {uiState, setAuthorParam} = useContext(UIContext);
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

  // TODO: generalize this for Steem chain
  const IMAGE_SERVER = BLURT_IMAGE_SERVER;

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

      // @test
      getNotifications(author);
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

  return !editMode
    ? profileData && (
        <ProfileScreen
          profileData={profileData}
          blogs={blogs}
          bookmarks={bookmarks}
          favorites={favorites}
          handlePressFavoriteItem={_handlePressFavoriteItem}
          handlePressEdit={_handlePressEdit}
          clearPosts={_clearPosts}
        />
      )
    : profileData && <ProfileEditForm profileData={profileData} />;
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
