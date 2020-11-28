//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
import {getCharacterLength} from '~/utils/strings';
import {substr_utf8_bytes} from '~/utils/strings';
const runes = require('runes');
import {sliceByByte} from '~/utils/strings';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants/argonTheme';
const {width, height} = Dimensions.get('screen');
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc
import {Post} from '~/components/Post';
import {ActionBarStyleFeed} from '~/constants/actionBarTypes';
import {getTimeFromNow} from '~/utils/time';

import {Images, BLURT_IMAGE_SERVER, STEEM_IMAGE_SERVER} from '~/constants';
const IMAGE_SERVER = BLURT_IMAGE_SERVER;

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

const LIST_TITLE_LENGTH = 35;

//// props
interface Props {
  posts: any[];
  isUser: boolean;
  loading?: boolean;
  handlePressPosting?: () => void;
  refreshPosts?: () => void;
  fetchMorePosts?: () => void;
}

const PostsListView = (props: Props): JSX.Element => {
  //// props
  console.log('props posts', props.posts);
  // const posts = props.posts.slice(0, props.posts.length - 1);
  const posts = props.posts;
  //// language
  const intl = useIntl();
  //// contexts
  const {setPostRef} = useContext(PostsContext);
  //// states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);

  //// handle refresh event on posts
  const _onRefresh = async () => {
    console.log('on refresh');
    //    setLoading(true);
    //    await props.refreshPosts();
    //    setLoading(false);
  };

  //// load more posts with bottom-reached event
  const _onLoadMore = async () => {
    console.log('on load more');
    //    setLoadingMore(true);
    //    props.fetchMorePosts();
  };

  const _onPressPost = (index: number) => {
    console.log('onPressPost');
    // TODO: navigate to the post details
    setPostRef(props.posts[index].postRef);
    navigate({name: 'PostDetails'});
  };

  const _renderHeader = () => {
    return <Block></Block>;
  };

  //// render footer when loading more
  const _renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: height,
          paddingVertical: 20,
          borderTopWidth: 1,
          marginTop: 10,
          marginBottom: 10,
          borderColor: theme.COLORS.PINK,
        }}>
        <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
      </View>
    );
  };

  //// render a post
  const _renderPost = (item: any, index: number) => {
    const avatar = `${IMAGE_SERVER}/u/${item.author}/avatar`;
    return (
      <TouchableWithoutFeedback onPress={() => _onPressPost(index)}>
        <Block
          flex
          card
          row
          space="between"
          style={{
            marginBottom: 5,
            padding: 5,
            backgroundColor:
              BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          }}>
          <Block row middle>
            <Block center width={70}>
              <Image
                source={{
                  uri: avatar || null,
                }}
                style={styles.avatar}
              />
              {props.isUser && <Text size={10}>{item.author}</Text>}
            </Block>
            {/* <Text>{substr_utf8_bytes(item.title, 0, 32)}</Text> */}
            {/* {<Text>{runes.substr(item.title, 0, 30)}</Text>} */}
            {<Text>{sliceByByte(item.title, LIST_TITLE_LENGTH)}</Text>}
          </Block>
          <Block middle>
            {item.createdAt && (
              <Text>{getTimeFromNow(item.createdAt).split('ago')[0]}</Text>
            )}
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  return !loading ? (
    <FlatList
      contentContainerStyle={styles.posts}
      refreshing={refreshing}
      onRefresh={_onRefresh}
      onEndReached={_onLoadMore}
      onEndReachedThreshold={1}
      data={posts}
      renderItem={({item, index}) => _renderPost(item, index)}
      keyExtractor={(item, index) => String(index)}
      initialNumToRender={5}
      ListFooterComponent={_renderFooter}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <View>
      <ActivityIndicator color={argonTheme.COLORS.ERROR} />
    </View>
  );
};

export {PostsListView};

const styles = StyleSheet.create({
  posts: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
});

/*
const PostsListContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  const [posts, setPosts] = useState(null);
  const [fetched, setFetched] = useState(false);
  //// effect
  useEffect(() => {
    console.log('[PostsListsContainer] fetch posts');
    // fetch posts data from references (author/permlink)
    _getPosts(props.postsRefs);
  }, []);

  const _getPosts = async (refs: string[]) => {
    // refs format: author/permlink
    const promises = refs.map(async (ref) => {
      const authorPermlink = ref.split('/');
      console.log(
        '[PostsListsContainer] authorPermlink',
        authorPermlink[0],
        authorPermlink[1],
      );
      return fetchPost(authorPermlink[0], authorPermlink[1]);
    });
    const parsedPosts = await Promise.all(promises);
    console.log('[PostsListsContainer] parsed posts', parsedPosts);
    // set
    setPosts(parsedPosts);
  };

  return posts ? (
    <PostsListView posts={posts} isUser={false} />
  ) : (
    <ActivityIndicator color="pink" />
  );
};

export {PostsListContainer};
*/
