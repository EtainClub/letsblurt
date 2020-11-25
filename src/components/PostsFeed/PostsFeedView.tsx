//// react
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import FAB from 'react-native-fab';
import ActionSheet from 'react-native-actions-sheet';

import {argonTheme} from '~/constants/argonTheme';
const {width, height} = Dimensions.get('screen');
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc
import {Post} from '~/components/Post';
import {ActionBarStyleFeed} from '~/constants/actionBarTypes';

//// props
interface Props {
  posts: PostData[];
  username?: string;
  loading: boolean;
  handleSubmitSearch: (searchText: string) => void;
  refreshPosts: () => void;
  fetchMorePosts: () => void;
}

const PostsFeedView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  const [searchFAB, setSearchFAB] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(props.loading);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);
  //// ref
  const searchRef = useRef(null);

  useEffect(() => {
    if (props.posts) setSearchFAB(true);
  }, [props.posts]);

  //////// functions

  //// handle refresh event on posts
  const _onRefresh = async () => {
    console.log('on refresh');
    setLoading(true);
    setSearchFAB(false);
    await props.refreshPosts();
    setLoading(false);
    setSearchFAB(true);
  };

  //// load more posts with bottom-reached event
  const _onLoadMore = async () => {
    console.log('on load more');
    setLoadingMore(true);
    await props.fetchMorePosts();
    setLoadingMore(false);
  };

  const _renderHeader = () => {
    return <Block></Block>;
  };

  const _handlePressSearch = () => {
    // show the action modal
    searchRef.current?.setModalVisible(true);
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
        <ActivityIndicator color={argonTheme.COLORS.ERROR} size="small" />
      </View>
    );
  };

  //// render a post
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

  //// render posts
  const _renderPosts = () => {
    if (!props.posts) return;

    // the last post is hidden for the next fetch
    const posts = props.posts.slice(0, props.posts.length - 1);
    const username = props.username;

    return !props.loading ? (
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
        ListHeaderComponent={_renderHeader}
        ListFooterComponent={_renderFooter}
        showsVerticalScrollIndicator={false}
      />
    ) : (
      <View>
        <ActivityIndicator color={argonTheme.COLORS.ERROR} />
      </View>
    );
  };
  return (
    <View>
      {_renderPosts()}
      {!props.loading && (
        <FAB
          buttonColor="red"
          iconTextColor="#FFFFFF"
          onClickAction={_handlePressSearch}
          visible
          iconTextComponent={
            <Icon family="antdesign" size={16} name="search1" />
          }
        />
      )}
      <ActionSheet ref={searchRef}>
        <Block shadow center style={styles.searchBar}>
          <Text size={20}>
            {intl.formatMessage({id: 'Actionsheet.search'})}
          </Text>
          <Input
            right
            color="black"
            style={styles.search}
            onChangeText={(text: string) => setSearchText(text)}
            onSubmitEditing={() => {
              searchRef.current?.setModalVisible(false);
              props.handleSubmitSearch(searchText);
            }}
            placeholder={intl.formatMessage({
              id: 'Actionsheet.search_placeholder',
            })}
            placeholderTextColor={'#8898AA'}
            iconContent={
              <TouchableWithoutFeedback
                onPress={() => {
                  searchRef.current?.setModalVisible(false);
                  props.handleSubmitSearch(searchText);
                }}>
                <Icon
                  size={24}
                  color={theme.COLORS.MUTED}
                  name="search1"
                  family="antdesign"
                />
              </TouchableWithoutFeedback>
            }
          />
        </Block>
      </ActionSheet>
    </View>
  );
};

export {PostsFeedView};

const styles = StyleSheet.create({
  posts: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 2,
  },
  searchBar: {
    backgroundColor: argonTheme.COLORS.ERROR,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: argonTheme.COLORS.BORDER,
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
});
