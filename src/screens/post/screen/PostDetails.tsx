// post details screen
import React, {useState, useEffect, useContext, useRef} from 'react';
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
  RefreshControl,
} from 'react-native';
// SafeAreaView
import {SafeAreaView} from 'react-native-safe-area-context';
//import { ScrollView } from 'react-native-gesture-handler';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
const {height, width} = Dimensions.get('window');
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
import {PostData, CommentData} from '~/contexts/types';
import {ActionBarStylePost} from '~/constants/actionBarTypes';
import {Avatar, Comment, ParentPost, PostBody, ActionBar} from '~/components';
import {argonTheme} from '~/constants/argonTheme';
import {UIContext} from '~/contexts';

import {getTimeFromNow} from '~/utils/time';

interface Props {
  post: PostData;
  loading: boolean;
  parentPost: PostData;
  index: number;
  comments: CommentData[];
  handleRefresh: () => void;
  fetchComments: () => void;
  handleSubmitComment: (message: string) => Promise<string>;
  handlePressTag: (tag: string) => void;
  handlePressTranslation: () => void;
}
const PostDetailsScreen = (props: Props): JSX.Element => {
  const {uiState, setToastMessage} = useContext(UIContext);
  const intl = useIntl();
  const commentRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [commentNewHeight, setCommentNeeHeight] = useState(40);

  const {post} = props;

  const {state} = post;
  const {nickname} = state;
  const {tags} = post.metadata;
  const reputation = state.reputation.toFixed(0);

  const [commentY, setCommentY] = useState(0);

  const formatedTime = post && getTimeFromNow(state.createdAt);

  const _handlePressComments = () => {
    commentRef.current.scrollTo({y: commentY, animated: true});
  };

  const _onPressSendComment = async () => {
    console.log('[PostDetails] onPressSendComment');
    // set submitting
    setSubmitting(true);
    const result = await props.handleSubmitComment(message);
    // clear submitting
    setSubmitting(false);
    // clear message
    setMessage('');
    // show toast message
    setToastMessage(result);
  };

  const _handlePressHashTag = (tag: string) => {
    props.handlePressTag(tag);
  };

  const _renderCommentForm = () => {
    const iconSend = (
      <Button
        onPress={_onPressSendComment}
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
      <Block
        center
        style={{marginTop: 20}}
        onLayout={(event) => setCommentY(event.nativeEvent.layout.y)}>
        <Input
          color="#9fa5aa"
          multiline
          rounded
          right
          blurOnSubmit
          iconContent={iconSend}
          style={[
            styles.commentInput,
            {
              height: commentNewHeight,
              borderColor: 'red',
              borderWidth: 2,
              marginVertical: 0,
              paddingVertical: 0,
            },
          ]}
          placeholder="Comment"
          autoCapitalize="none"
          textContentType="none"
          placeholderTextColor="#9fa5aa"
          defaultValue={message}
          onChangeText={(text: string) => setMessage(text)}
          onContentSizeChange={(evt) =>
            setCommentNeeHeight(evt.nativeEvent.contentSize.height)
          }
        />
      </Block>
    );
  };

  const _renderComments = () => {
    const {comments} = props;
    return (
      <Block style={{top: -20}}>
        {(comments || []).map((comment, index) => {
          return (
            <Comment
              key={comment.id}
              postIndex={props.index}
              comment={comment}
              index={0}
              fetchComments={props.fetchComments}
            />
          );
        })}
      </Block>
    );
  };

  const _onRefresh = async () => {
    console.log('[PostDetailsView] onRefresh');
    await props.handleRefresh();
  };

  return !props.loading ? (
    <Block style={{marginHorizontal: 5, marginBottom: 170}}>
      {props.parentPost && <ParentPost post={props.parentPost} />}
      <Text size={24}>{post.state.title}</Text>
      <Block row space="between">
        <Avatar
          avatar={post.state.avatar}
          avatarSize={40}
          account={post.state.post_ref.author}
          nickname={nickname ? nickname : post.state.post_ref.author}
          reputation={reputation}
          textSize={14}
          truncate={false}
        />
        <Text style={{top: 10, marginRight: 20}}>{formatedTime}</Text>
      </Block>
      <Block style={{}}>
        <ActionBar
          actionBarStyle={ActionBarStylePost}
          postState={state}
          postIndex={props.index}
          handlePressComments={_handlePressComments}
          handlePressTranslation={props.handlePressTranslation}
        />
      </Block>

      <ScrollView
        ref={commentRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={props.loading} onRefresh={_onRefresh} />
        }>
        <Block>
          <Block style={{padding: theme.SIZES.BASE / 3}}>
            <PostBody body={post.body} />
          </Block>
          <Block row style={{flexWrap: 'wrap'}}>
            {(tags || []).map((tag, id) => {
              return (
                <TouchableWithoutFeedback
                  key={id}
                  onPress={() => _handlePressHashTag(tag)}>
                  <Block
                    card
                    key={id}
                    style={{
                      backgroundColor: argonTheme.COLORS.INPUT_SUCCESS,
                      paddingHorizontal: 5,
                      marginHorizontal: 2,
                      marginVertical: 3,
                    }}>
                    <Text>{tag}</Text>
                  </Block>
                </TouchableWithoutFeedback>
              );
            })}
          </Block>
          {_renderCommentForm()}
          {_renderComments()}
        </Block>
      </ScrollView>
    </Block>
  ) : (
    <View style={{top: 20}}>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
    </View>
  );
};

export {PostDetailsScreen};

const styles = StyleSheet.create({
  commentInput: {
    width: width * 0.9,
    height: theme.SIZES.BASE * 3,
    backgroundColor: theme.COLORS.WHITE,
  },
});
