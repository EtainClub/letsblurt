// post details container
// react
import React, {useState, useEffect, useContext} from 'react';
// react native
import {View, ActivityIndicator, Platform} from 'react-native';
// config
import Config from 'react-native-config';
//// firebase
import {firebase} from '@react-native-firebase/functions';
// axios
import axios from 'axios';
import {PostDetailsScreen} from '../screen/PostDetails';
// blurt api
import {fetchComments} from '~/providers/blurt/dblurtApi';
import {argonTheme} from '~/constants/argonTheme';
import {navigate} from '~/navigation/service';
import {
  PostRef,
  PostData,
  PostsTypes,
  PostingContent,
  CommentData,
} from '~/contexts/types';
import {
  PostsContext,
  AuthContext,
  UIContext,
  UserContext,
  SettingsContext,
} from '~/contexts';
import {generateCommentPermlink, makeJsonMetadataComment} from '~/utils/editor';
import {TARGET_BLOCKCHAIN} from '~/constants/blockchain';

interface Props {
  route: any;
}

const PostDetails = (props: Props): JSX.Element => {
  // props
  const {route} = props;
  const index = route.params?.index;
  // contexts
  const {authState} = useContext(AuthContext);
  const {userState, updateVoteAmount} = useContext(UserContext);
  const {
    postsState,
    submitPost,
    getPostDetails,
    fetchDatabaseState,
    appendTag,
  } = useContext(PostsContext);
  const {uiState} = useContext(UIContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [loading, setLoading] = useState(true);
  const [postDetails, setPostDetails] = useState<PostData>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [originalPostDetails, setOriginalPostDetails] = useState<PostData>(
    null,
  );
  const [translatedPostDetails, setTranslatedPostDetails] = useState<PostData>(
    null,
  );
  const [comments, setComments] = useState<CommentData[]>(null);
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [parentPost, setParentPost] = useState<PostData>(null);
  //////// events
  //// event: component creation
  useEffect(() => {
    _fetchPostDetailsEntry();
    // update vote amount
    if (authState.loggedIn) {
      updateVoteAmount(authState.currentCredentials.username);
    }
  }, []);
  //// event: new post ref set
  useEffect(() => {
    if (postsState.postRef) {
      // fetch post
      _fetchPostDetailsEntry();
    }
  }, [postsState.postRef]);
  //// event: comment submitted
  useEffect(() => {
    // clear submitted
    setSubmitted(false);
    // fetch comments
    _fetchComments();
  }, [submitted]);
  //// event: parent post exists
  useEffect(() => {
    // parent post exist?
    if (postDetails && postDetails.depth > 0) {
      // fetch parent post
      _fetchParentPost(postDetails.state.parent_ref);
    }
  }, [postDetails]);
  // //// event: translate language change
  // useEffect(() => {
  //   if (postDetails && uiState.selectedLanguage != '') {
  //     _translateLanguage(
  //       postDetails.state.title,
  //       postDetails.body,
  //       uiState.selectedLanguage,
  //     );
  //   }
  // }, [uiState.selectedLanguage]);

  const _fetchPostDetailsEntry = async () => {
    console.log('_fetchPostDetailsEntry postRef', postsState.postRef);
    // clear the previous post
    setPostDetails(null);
    // remove the parent post
    setParentPost(null);
    setLoading(true);
    // get post details
    const details = await getPostDetails(
      postsState.postRef,
      authState.currentCredentials.username,
    );
    setLoading(false);
    if (!details) return;
    // fetch database
    if (authState.loggedIn) {
      const {bookmarked} = await fetchDatabaseState(
        postsState.postRef,
        authState.currentCredentials.username,
      );
      details.state.bookmarked = bookmarked;
    }
    // set post details
    setPostDetails(details);
    // set original details
    setOriginalPostDetails(details);
    // fetch comments
    _fetchComments();
  };

  const _fetchParentPost = async (postRef: PostRef) => {
    console.log('_fetchParentPost. postRef', postRef);
    // get post details
    const details = await getPostDetails(
      postRef,
      authState.currentCredentials.username,
    );
    // go up the tree to the root
    if (details.depth > 0) {
      await _fetchParentPost(details.state.parent_ref);
      console.log('_fetchParentPost. details', details);
      return details;
    }
    console.log('_fetchParentPost. parent details', details);
    // set parent post
    setParentPost(details);
  };

  const _fetchComments = async () => {
    // fetch comments on this post
    const _comments = await fetchComments(
      postsState.postRef.author,
      postsState.postRef.permlink,
      authState.currentCredentials.username,
    );
    console.log('_fetchComments', _comments);
    setComments(_comments);
  };

  const _onRefresh = async () => {
    await _fetchPostDetailsEntry();
    console.log('[PostDetails] refreshed, comments', comments);
  };

  const _onSubmitComment = async (comment: string): Promise<string> => {
    // check sanity
    if (comment === '') return;

    const {username, password} = authState.currentCredentials;
    const permlink = generateCommentPermlink(username);
    const jsonMeta = makeJsonMetadataComment(
      postsState.postDetails.metadata.tags || [TARGET_BLOCKCHAIN],
    );
    // build posting content
    const postingContent: PostingContent = {
      author: username,
      title: '',
      body: comment,
      parent_author: postsState.postRef.author,
      parent_permlink: postsState.postRef.permlink,
      json_metadata: JSON.stringify(jsonMeta) || '',
      permlink: permlink,
    };

    const {success, message} = await submitPost(
      postingContent,
      password,
      index,
    );
    // set submitted flag
    setSubmitted(true);
    return message;
  };

  //// handle press hash tag
  const _handlePressTag = (tag: string) => {
    console.log('[PostDetailsContainer] handlePressTag, tag', tag);
    // append a new tag to tag list
    appendTag(tag);
    // navigate to feed
    navigate({name: 'Feed'});
  };

  const _translateLanguage = async () => {
    if (!authState.loggedIn) {
      console.log('you need to log in to translate a post');
      return;
    }
    console.log('[_translateLanguage] showOriginal', showOriginal);
    const _showOriginal = !showOriginal;
    setShowOriginal(_showOriginal);
    if (_showOriginal) {
      console.log('[_translateLanguage] showOriginal', _showOriginal);
      // set original post
      setPostDetails(originalPostDetails);
      return;
    }
    // if translation exists, use it
    if (translatedPostDetails) {
      console.log('translation exists');
      setPostDetails(translatedPostDetails);
      return;
    }
    const title = postDetails.state.title;
    const body = postDetails.body;
    const targetLang = settingsState.locale.split('-')[0];
    console.log('targetLang', targetLang);
    const titleOptions = {
      targetLang: targetLang,
      text: title,
      format: 'text',
    };
    const bodyOptions = {
      targetLang: targetLang,
      text: body,
      format: 'html',
    };

    try {
      const titleTranslation = await firebase
        .functions()
        .httpsCallable('translationRequest')(titleOptions);
      console.log('translation. title', titleTranslation);
      const bodyTranslation = await firebase
        .functions()
        .httpsCallable('translationRequest')(bodyOptions);
      console.log('translation body', bodyTranslation);

      console.log(
        '_translateLanguage. translation',
        titleTranslation.data.data.translations[0],
      );
      console.log(
        '_translateLanguage. translation',
        bodyTranslation.data.data.translations[0],
      );

      const translatedTitle =
        titleTranslation.data.data.translations[0].translatedText;
      console.log('_translateLanguage. translatedTitle', translatedTitle);

      const translatedBody =
        bodyTranslation.data.data.translations[0].translatedText;
      const newPostDetails = {
        ...postDetails,
        state: {...postDetails.state, title: translatedTitle},
        body: translatedBody,
      };
      // TODO: save the translation for re-translate

      // set translation
      setPostDetails(newPostDetails);
      // store the translation
      setTranslatedPostDetails(newPostDetails);
      //return translation.data.translations[0].translatedText;
    } catch (error) {
      console.log('failed to translate', error);
    }
  };

  return postDetails ? (
    <PostDetailsScreen
      post={postDetails}
      loading={loading}
      parentPost={parentPost}
      index={index}
      comments={comments}
      handleRefresh={_onRefresh}
      fetchComments={_fetchComments}
      handleSubmitComment={_onSubmitComment}
      handlePressTag={_handlePressTag}
      handlePressTranslation={_translateLanguage}
    />
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
    </View>
  );
};

export {PostDetails};
