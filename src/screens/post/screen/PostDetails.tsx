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
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
const {height, width} = Dimensions.get('window');
import {PostData, CommentData, PostsTypes} from '~/contexts/types';
import {ActionBarStylePost} from '~/constants/actionBarTypes';
import {
  ActionBar,
  Avatar,
  Comment,
  Editor,
  ImageUpload,
  ParentPost,
  PostBody,
  Comments,
} from '~/components';
import {argonTheme} from '~/constants/argonTheme';
import {UIContext} from '~/contexts';

import {getTimeFromNow} from '~/utils/time';

interface Props {
  postsType: PostsTypes;
  post: PostData;
  loading: boolean;
  parentPost: PostData;
  index: number;
  comments: CommentData[];
  handleRefresh: () => void;
  fetchComments: () => void;
  handleSubmitComment: (text: string) => Promise<boolean>;
  handlePressTag: (tag: string) => void;
  handlePressTranslation: () => void;
  handlePressSpeak: () => void;
}
const PostDetailsScreen = (props: Props): JSX.Element => {
  //// props
  const {post} = props;
  const {state} = post;
  const {nickname} = state;
  const {tags} = post.metadata;
  const reputation = state.reputation.toFixed(0);
  //// contexts
  //// states
  const [commentY, setCommentY] = useState(0);
  const [avoidKeyboard, setAvoidKeyboard] = useState(false);
  //// refs
  const commentRef = useRef(null);

  const formatedTime = post && getTimeFromNow(state.createdAt);

  const _handlePressComments = () => {
    commentRef.current.scrollTo({y: commentY, animated: true});
  };

  const _handlePressHashTag = (tag: string) => {
    props.handlePressTag(tag);
  };

  // const _renderComments = () => {
  //   const {comments} = props;
  //   return (
  //     <Block style={{top: -20}}>
  //       {comments ? (
  //         comments.map((comment, index) => {
  //           return (
  //             <Comment
  //               key={comment.id}
  //               postIndex={props.index}
  //               comment={comment}
  //               index={0}
  //               fetchComments={props.fetchComments}
  //             />
  //           );
  //         })
  //       ) : (
  //         <View style={{top: 20}}>
  //           <ActivityIndicator color={argonTheme.COLORS.ERROR} size="small" />
  //         </View>
  //       )}
  //     </Block>
  //   );
  // };

  const _onRefresh = async () => {
    await props.handleRefresh();
  };

  return !props.loading ? (
    <Block style={{marginHorizontal: 5, marginBottom: 150}}>
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
          postUrl={post.url}
          postsType={props.postsType}
          postIndex={props.index}
          handlePressComments={_handlePressComments}
          handlePressTranslation={props.handlePressTranslation}
          handlePressSpeak={props.handlePressSpeak}
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
          {!props.parentPost && (
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
          )}
          <Block onLayout={(event) => setCommentY(event.nativeEvent.layout.y)}>
            <Editor
              isComment={true}
              depth={0}
              close={false}
              handleSubmitComment={props.handleSubmitComment}
              handleBodyChange={(text) => {
                console.log('editor body change', text);
                setAvoidKeyboard(true);
              }}
            />
          </Block>
        </Block>
        <Block style={{marginBottom: 100}}>
          <Comments postRef={post.state.post_ref} />
        </Block>
        {/* {_renderComments()} */}
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
