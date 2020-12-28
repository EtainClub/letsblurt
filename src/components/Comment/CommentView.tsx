// react native
import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
//// firebase
import {firebase} from '@react-native-firebase/functions';
//// UIs
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import HTML from 'react-native-render-html';
import {argonTheme} from '~/constants/argonTheme';
import {PostData, CommentData, PostingContent} from '~/contexts/types';
import {Avatar, PostBody} from '~/components';
import {ActionBar} from '../ActionBar';
import {ActionBarStyleComment} from '~/constants/actionBarTypes';
import {AuthContext, UIContext, PostsContext} from '~/contexts';
//// utils
import {generateCommentPermlink, createPatch} from '~/utils/editor';
import {getTimeFromNow} from '~/utils/time';
import {
  extractMetadata,
  generatePermlink,
  makeJsonMetadata,
} from '~/utils/editor';
const {height, width} = Dimensions.get('window');

// component
interface Props {
  comment: CommentData;
  username?: string;
  index: number;
  postIndex: number;
  fetchComments: () => void;
  //  handleSubmitComment: (message: string) => void;
  //  updateComment: () => void;
}
const Comment = (props: Props): JSX.Element => {
  //// props
  const {comment} = props;
  //// contexts
  const {authState} = useContext(AuthContext);
  const {uiState} = useContext(UIContext);
  const {postsState, submitPost, updatePost} = useContext(PostsContext);
  //// stats
  const [originalPost, setOriginalPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // reply text
  const [replyText, setReplyText] = useState('');
  const [newHeight, setNewHeight] = useState(40);
  // comment body
  const [body, setBody] = useState(comment.body);
  const [showOriginal, setShowOriginal] = useState(true);
  const [originalBody, setOriginalBody] = useState(comment.body);
  const [translatedBody, setTranslatedBody] = useState(null);

  const reputation = comment.state.reputation.toFixed(0);

  const formatedTime = comment && getTimeFromNow(comment.state.createdAt);

  const _handleSubmitComment = async () => {
    // check sanity
    if (replyText === '') return;

    // set submitted flag
    setSubmitting(true);
    const {username} = authState.currentCredentials;
    // extract meta
    const _meta = extractMetadata(replyText);
    // split tags by space
    const _tags = [];
    const jsonMeta = makeJsonMetadata(_meta, _tags);

    // build posting content for a new comment
    const postingContent: PostingContent = {
      author: username,
      title: '',
      body: replyText,
      parent_author: comment.state.post_ref.author,
      parent_permlink: comment.state.post_ref.permlink,
      json_metadata: JSON.stringify(jsonMeta) || '',
      permlink: generateCommentPermlink(username),
    };

    // update the body with patch if it is edit mode
    if (editMode) {
      //      const patch = createPatch(comment.body, replyText);
      postingContent.parent_author = comment.state.parent_ref.author;
      postingContent.parent_permlink = comment.state.parent_ref.permlink;
      postingContent.permlink = comment.state.post_ref.permlink;
    }
    // submit the comment
    const {success, message} = await submitPost(
      postingContent,
      authState.currentCredentials.password,
      true,
    );
    // fetch comments
    props.fetchComments();
    // clear submitted flag
    setSubmitting(false);
    // close reply form
    setShowReply(false);
    setEditMode(false);
  };

  const _onCancelReply = () => {
    setShowReply(false);
    setEditMode(false);
    setReplyText('');
  };

  const _handlePressReply = () => {
    // clear reply form
    setShowReply(true);
  };

  const _handlePressEditComment = () => {
    console.log('_handlePressEditComment. markdown body', comment.markdownBody);
    setEditMode(true);
    // set markdown format to body
    setBody(comment.markdownBody);
  };

  const _handlePressTranslation = async () => {
    if (!authState.loggedIn) {
      console.log('you need to log in to translate a post');
      return;
    }
    console.log('[_translateLanguage] showOriginal', showOriginal);
    const _showOriginal = !showOriginal;
    setShowOriginal(_showOriginal);
    if (_showOriginal) {
      console.log('[_translateLanguage] showOriginal', _showOriginal);
      // set original comment
      setBody(originalBody);
      return;
    }
    // if translation exists, use it
    if (translatedBody) {
      console.log('translation exists');
      setBody(translatedBody);
      return;
    }
    const targetLang = uiState.selectedLanguage;
    console.log('targetLang', targetLang);
    const bodyOptions = {
      targetLang: targetLang,
      text: body,
      format: 'html',
    };

    try {
      const bodyTranslation = await firebase
        .functions()
        .httpsCallable('translationRequest')(bodyOptions);

      console.log(
        '_translateLanguage. translation',
        bodyTranslation.data.data.translations[0],
      );
      const translatedBody =
        bodyTranslation.data.data.translations[0].translatedText;

      // set translation
      setBody(translatedBody);
      // store the translation
      setTranslatedBody(translatedBody);
    } catch (error) {
      console.log('failed to translate', error);
    }
  };

  const _renderCommentForm = () => {
    const depth = comment.depth - 1;
    const _body = editMode ? body : replyText;

    const iconSend = (
      <Button
        onPress={_handleSubmitComment}
        loading={submitting}
        onlyIcon
        icon="ios-send"
        iconFamily="ionicon"
        iconSize={24}
        color={argonTheme.COLORS.ERROR}
        style={{
          margin: 0,
          padding: 0,
          right: -10,
          width: 24 + 3,
          height: 24 + 3,
        }}
      />
    );

    return (
      <Block row center style={{right: depth * 15}}>
        {(showReply || editMode) && (
          <Icon
            size={30}
            color={theme.COLORS.WARNING}
            name="ios-close-circle-outline"
            family="ionicon"
            style={{marginRight: 5}}
            onPress={_onCancelReply}
          />
        )}
        <Input
          color="#9fa5aa"
          multiline
          rounded
          right
          iconContent={iconSend}
          style={[
            styles.commentInput,
            {
              height: newHeight,
              borderColor: 'red',
              borderWidth: 2,
              paddingVertical: 0,
              maringVertical: 0,
            },
          ]}
          placeholder="Comment"
          autoFocus={true}
          autoCapitalize="none"
          textContentType="none"
          placeholderTextColor="#9fa5aa"
          defaultValue={_body}
          onChangeText={(text) => setReplyText(text)}
          onContentSizeChange={(e) =>
            setNewHeight(e.nativeEvent.contentSize.height)
          }
        />
      </Block>
    );
  };

  // netsting the comments
  const nestedComments = (comment.comments || []).map((comment) => {
    return (
      <Comment
        key={comment.id}
        postIndex={props.postIndex}
        comment={comment}
        username={props.username}
        index={1}
        fetchComments={props.fetchComments}
      />
    );
  });

  return !editMode ? (
    <View
      style={
        props.index === 0
          ? {marginTop: 30}
          : {marginLeft: 25, marginTop: 30, marginRight: 5}
      }>
      <Block
        style={{padding: 5}}
        card
        shadow
        shadowColor="black"
        key={comment.id}>
        <Block row space="between">
          <Avatar
            account={comment.state.post_ref.author}
            nickname={comment.state.post_ref.author}
            reputation={reputation}
            avatar={comment.state.avatar}
            avatarSize={30}
            textSize={12}
            truncate={false}
          />
          <Text style={{top: 10, marginRight: 20}}>{formatedTime}</Text>
        </Block>
        <PostBody body={body} commentDepth={comment.depth} />
        <ActionBar
          actionBarStyle={ActionBarStyleComment}
          postIndex={props.postIndex}
          postState={comment.state}
          handlePressReply={_handlePressReply}
          handlePressEditComment={_handlePressEditComment}
          handlePressTranslation={_handlePressTranslation}
        />
      </Block>
      {showReply && _renderCommentForm()}
      {nestedComments}
    </View>
  ) : (
    <View>{_renderCommentForm()}</View>
  );
};

export {Comment};

const styles = StyleSheet.create({
  commentInput: {
    width: width * 0.8,
    height: theme.SIZES.BASE * 3,
    backgroundColor: theme.COLORS.WHITE,
  },
});
