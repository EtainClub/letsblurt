import React, {useState, useContext, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {ProfileScreen} from '../screen/Profile';
import {AuthContext, UserContext, UIContext, PostsContext} from '~/contexts';
import {PostsTypes, PostData, ProfileData} from '~/contexts/types';
import {getVoteAmount} from '~/providers/blurt/dblurtApi';

const Profile = ({navigation}): JSX.Element => {
  // contexts
  const {authState} = useContext(AuthContext)!;
  const {userState, getUserProfileData} = useContext(UserContext);
  const {uiState, setAuthorParam} = useContext(UIContext);
  const {postsState, fetchPosts, clearPosts} = useContext(PostsContext);
  // states
  const [authorData, setAuthorData] = useState<ProfileData>(null);
  const [loaded, setLoaded] = useState(false);
  const [authorPosts, setAuthorPosts] = useState<PostData[]>(null);
  const [postsFetching, setPostsFetching] = useState(true);

  console.log('[ProfileContainer] navigation', navigation);

  //// fetch user state
  useEffect(() => {
    if (authState.loggedIn) {
      _getUserProfileData(authState.currentCredentials.username);
    }
  }, []);

  // set posts to re-render when fetching finished
  useEffect(() => {
    if (postsState.fetched) {
      console.log('[Profile|useEffect] fetched event, postsState', postsState);
      // set author posts to the state, which will re-render screen
      setAuthorPosts(postsState[postsState.postsType].posts);
    }
  }, [postsState.fetched]);

  // update loaded flag after fetching author data
  useEffect(() => {
    console.log(
      '[ProfileContainter|authorData changed] authorData',
      authorData,
    );
    // now set loaded flag
    if (authorData) {
      setLoaded(true);
      // fetch author posts
      _fetchPosts(false);
    }
  }, [authorData]);

  const _getUserProfileData = async (username: string) => {
    const profileData = await getUserProfileData(username);
    setAuthorData(profileData);
  };

  const _fetchPosts = async (appending: boolean) => {
    console.log('fetching posts, postsState', postsState);
    console.log('fetching posts, selectedAuthor', uiState.selectedAuthor);

    // set fetching flag
    setPostsFetching(true);
    fetchPosts(
      PostsTypes.AUTHOR,
      postsState.tagIndex,
      postsState.filterIndex,
      authState.currentCredentials.username,
      appending,
      authState.currentCredentials.username,
    );
    console.log('postsState', postsState);
  };

  const _clearPosts = async () => {
    console.log('[ProfileContainer] clear posts');
    clearPosts(PostsTypes.FEED);
  };

  return (
    loaded && (
      <ProfileScreen
        authorData={authorData}
        authorPosts={authorPosts}
        fetchPosts={_fetchPosts}
        clearPosts={_clearPosts}
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
