// post details container
// react
import React, {useState, useEffect, useContext} from 'react';
// react native
import {View, ActivityIndicator, Platform} from 'react-native';
//// language
import {useIntl} from 'react-intl';
// config
import Config from 'react-native-config';
//// firebase
import {firebase} from '@react-native-firebase/functions';
// axios
import axios from 'axios';
import TTS from 'react-native-tts';

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
  navigation: any;
}

const PostDetails = (props: Props): JSX.Element => {
  // props
  //// language
  const intl = useIntl();
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
  const postIndex = postsState[postsState.postsType].index;
  const {setToastMessage} = useContext(UIContext);
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
    _initTTS();
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

  //// initialize tts
  const _initTTS = async () => {
    TTS.setDefaultRate(0.5);
    TTS.setDefaultPitch(1);
    try {
      const result = await TTS.getInitStatus();
      console.log('init tts result', result);
    } catch (error) {
      console.log('failed to init TTS', error);
      return;
    }

    TTS.speak('TTS has been initialized');

    TTS.setDefaultLanguage('en-US');
    TTS.addEventListener('tts-start', (event) => console.log('start', event));
    TTS.addEventListener('tts-finish', (event) => console.log('finish', event));
    TTS.addEventListener('tts-cancel', (event) => console.log('cancel', event));
  };

  const _speakBody = () => {
    if (postDetails) {
      TTS.stop();
      const hhtmlRegex = /!\[img/g;
      const text = postDetails.markdownBody.replace(hhtmlRegex, '');
      console.log('postDetais, text', text);
      //      console.log('postDetails, markdown', postDetails.markdownBody);
      //      TTS.speak(postDetails.markdownBody.match(textRegex));
    }
  };
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
      if (bookmarked) details.state.bookmarked = bookmarked;
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
    // TODO need to update context state
  };

  const _onRefresh = async () => {
    await _fetchPostDetailsEntry();
    console.log('[PostDetails] refreshed, comments', comments);
  };

  const _onSubmitComment = async (comment: string): Promise<boolean> => {
    // check sanity
    if (comment === '') return false;

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

    const result = await submitPost(postingContent, password, true);
    // set submitted flag
    setSubmitted(true);
    if (result) return true;
    return false;
  };

  //// handle press hash tag
  const _handlePressTag = (tag: string) => {
    console.log('[PostDetailsContainer] handlePressTag, tag', tag);
    // append a new tag to tag list
    appendTag(tag);
    // navigate to feed by specifying the feed screen
    props.navigation.navigate('Feed', {screen: 'Feed'});
  };

  const _translateLanguage = async () => {
    if (!authState.loggedIn) {
      console.log('you need to log in to translate a post');
      setToastMessage(intl.formatMessage({id: 'PostDetails.need_login'}));
      return;
    }
    const _showOriginal = !showOriginal;
    setShowOriginal(_showOriginal);
    if (_showOriginal) {
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
    const targetLang = settingsState.languages.translation;
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
      const bodyTranslation = await firebase
        .functions()
        .httpsCallable('translationRequest')(bodyOptions);

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
      setToastMessage(
        intl.formatMessage({id: 'PostDetails.translation_error'}),
      );
    }
  };

  return postDetails ? (
    <PostDetailsScreen
      post={postDetails}
      loading={loading}
      parentPost={parentPost}
      postsType={postsState.postsType}
      index={postIndex}
      comments={comments}
      handleRefresh={_onRefresh}
      fetchComments={_fetchComments}
      handleSubmitComment={_onSubmitComment}
      handlePressTag={_handlePressTag}
      handlePressTranslation={_translateLanguage}
      handlePressSpeak={_speakBody}
    />
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
    </View>
  );
};

export {PostDetails};
