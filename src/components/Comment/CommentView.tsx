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
// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import HTML from 'react-native-render-html';
import {argonTheme} from '../../constants/argonTheme';
import {PostData, CommentData} from '../../contexts/types';
import {Avatar} from '../../components/Avatar';
import {ActionBarContainer} from '../ActionBar';
import {ActionBarStyleComment} from '../../constants/actionBarTypes';
import {AuthContext, PostsContext} from '../../contexts';
import {getTimeFromNow} from '~/utils/time';

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
  const {authState} = useContext(AuthContext);
  const {postsState, submitComment, submitPostEdit} = useContext(PostsContext);

  const [submitting, setSubmitting] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState('');
  const [newHeight, setNewHeight] = useState(40);

  const {comment} = props;
  const reputation = comment.state.reputation.toFixed(0);

  const formatedTime = comment && getTimeFromNow(comment.state.createdAt);

  const _handleSubmitComment = async () => {
    // check sanity
    if (text === '') return;

    // set submitted flag
    setSubmitting(true);

    const parentRef = {
      author: comment.state.parent_ref.author,
      permlink: comment.state.parent_ref.permlink,
    };
    const postRef = {
      author: comment.state.post_ref.author,
      permlink: comment.state.post_ref.permlink,
    };
    if (editMode) {
      await submitPostEdit(
        props.postIndex,
        comment.body,
        text,
        parentRef,
        postRef,
        authState.currentCredentials.password,
      );
    } else {
      const {success, message} = await submitComment(
        props.postIndex,
        authState.currentCredentials.username,
        authState.currentCredentials.password,
        text,
        postRef,
      );
    }
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
    setText('');
  };

  const _onEditText = () => {
    setEditMode(true);
  };

  const _onReplyText = () => {
    setShowReply(true);
  };

  const _handlePressReply = () => {
    setShowReply(true);
  };

  const _handlePressEditComment = () => {
    setEditMode(true);
  };

  const _renderCommentForm = () => {
    const depth = comment.depth - 1;
    const body = editMode ? comment.body : text;

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
          defaultValue={body}
          onChangeText={(text) => setText(text)}
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
        props.index === 0 ? {marginTop: 30} : {marginLeft: 25, marginTop: 30}
      }>
      <Block
        style={{padding: 10}}
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
        <Block style={[styles.messageCard, styles.shadow]}>
          <HTML html={comment.body} />
        </Block>
        <ActionBarContainer
          actionBarStyle={ActionBarStyleComment}
          postIndex={props.postIndex}
          postState={comment.state}
          handlePressReply={_handlePressReply}
          handlePressEditComment={_handlePressEditComment}
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
  messageCard: {
    paddingRight: 50,
    paddingVertical: 0,
    borderRadius: 0,
    backgroundColor: theme.COLORS.WHITE,
  },
  shadow: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: {width: 0, height: 7},
    shadowRadius: 20,
    shadowOpacity: 1,
  },
});
