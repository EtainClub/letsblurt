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

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

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
  const posts = props.posts.slice(0, props.posts.length - 1);
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
                  uri: item.avatar || null,
                }}
                style={styles.avatar}
              />
              {props.isUser && <Text size={10}>{item.author}</Text>}
            </Block>
            {/* <Text>{substr_utf8_bytes(item.title, 0, 30)}</Text> */}
            <Text>{runes.substr(item.title, 0, 30)}</Text>
          </Block>
          <Block middle>
            <Text>{getTimeFromNow(item.createdAt).split('ago')[0]}</Text>
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
