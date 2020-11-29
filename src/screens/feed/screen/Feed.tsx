import React, {useState, useEffect} from 'react';

import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {useIntl} from 'react-intl';
import FAB from 'react-native-fab';

import {navigate} from '~/navigation/service';

import {PostState, PostData} from '~/contexts/types';
import {Post} from '~/components/Post';
import {DropdownModal} from '~/components';
import ModalDropdown from 'react-native-modal-dropdown';

import {ActionBarStyleFeed} from '~/constants/actionBarTypes';
import {argonTheme} from '~/constants/argonTheme';
const {width, height} = Dimensions.get('screen');

interface Props {
  posts: PostData[];
  username?: string;
  clickPosting: () => void;
  refreshPosts: () => Promise<boolean>;
  fetchMorePosts: () => void;
}

const FeedScreen = (props: Props): JSX.Element => {
  const intl = useIntl();
  const [showFAB, setShowFAB] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);

  useEffect(() => {
    setLoadingMore(false);
  }, [props.posts]);

  const _onRefresh = async () => {
    console.log('on refresh');
    setLoading(true);
    const result = await props.refreshPosts();
    if (result) {
      setLoading(false);
    }
  };

  const _onLoadMore = async () => {
    console.log('on load more');
    setLoadingMore(true);
    props.fetchMorePosts();
  };

  const _renderHeader = () => {
    return <Block></Block>;
  };
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
  const _renderPost = (item: PostData, index: number) => {
    return (
      <Post
        post={item}
        index={index}
        username={props.username}
        actionBarStyle={ActionBarStyleFeed}
      />
    );
  };

  const _renderPosts = () => {
    if (!props.posts) return;

    // the last post is hidden for the next fetch
    const posts = props.posts.slice(0, props.posts.length - 1);
    const username = props.username;

    return !loading ? (
      <FlatList
        contentContainerStyle={styles.posts}
        refreshing={refreshing}
        onRefresh={_onRefresh}
        onEndReached={_onLoadMore}
        onEndReachedThreshold={0.1}
        data={posts}
        renderItem={({item, index}) => _renderPost(item, index)}
        keyExtractor={(item, index) => String(index)}
        initialNumToRender={5}
        ListHeaderComponent={_renderHeader}
        ListFooterComponent={_renderFooter}
        showsVerticalScrollIndicator={false}
      />
    ) : (
      <View style={{top: 20}}>
        <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
      </View>
    );
  };

  return <View>{_renderPosts()}</View>;
};

export {FeedScreen};

const styles = StyleSheet.create({
  posts: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 2,
  },
});
