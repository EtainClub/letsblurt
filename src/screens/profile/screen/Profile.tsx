//// react
import React from 'react';
//// react native
import {
  View,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {TabView, SceneMap} from 'react-native-tab-view';
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
import {Images, argonTheme, BLURT_IMAGE_SERVERS} from '~/constants';
import {HeaderHeight} from '~/constants/utils';
import {getNumberStat} from '~/utils/stats';
import {Feed} from '~/screens';
import {PostsListView, ProfileContainer, DraggableList} from '~/components';
import {PostsTypes, PostData, ProfileData} from '~/contexts/types';
import {getTimeFromNow} from '~/utils/time';
const IMAGE_SERVER = BLURT_IMAGE_SERVERS[0];
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
const {width, height} = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

const initialLayout = {width: Dimensions.get('window').width};

interface Props {
  profileData: ProfileData;
  blogs: any[];
  bookmarks: any[];
  favorites: any[];
  handlePressFavoriteItem: (author: string) => void;
  handlePressEdit: () => void;
  clearPosts: () => void;
}
const ProfileScreen = (props: Props): JSX.Element => {
  console.log('[ProfileSceeen] props', props);
  const intl = useIntl();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'blogs', title: 'Blogs'},
    {key: 'bookmarks', title: 'Bookmarks'},
    {key: 'favorites', title: 'Favorites'},
  ]);

  const BlogList = () =>
    props.blogs && <PostsListView posts={props.blogs} isUser />;

  const BookmarkList = () =>
    props.bookmarks && <PostsListView posts={props.bookmarks} isUser />;

  const FavoriteList = () =>
    props.favorites && (
      <DraggableList data={props.favorites} renderItem={_renderFavoriteItem} />
    );

  const renderScene = SceneMap({
    blogs: BlogList,
    bookmarks: BookmarkList,
    favorites: FavoriteList,
  });

  ////
  const _renderFavoriteItem = ({item, index, drag, isActive}) => {
    const avatar = `${IMAGE_SERVER}/u/${item.author}/avatar`;
    return (
      <TouchableWithoutFeedback
        onPress={() => props.handlePressFavoriteItem(item.author)}>
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
                style={styles.itemAvatar}
              />
              <Text size={10}>{item.author}</Text>
            </Block>
          </Block>
          <Block middle>
            <Text>{getTimeFromNow(item.createdAt).split('ago')[0]}</Text>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <Block flex style={styles.profileScreen}>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <ProfileContainer
          profileData={props.profileData}
          isUser={true}
          handlePressEdit={props.handlePressEdit}
        />
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          tabBarPosition="top"
        />
      </ImageBackground>
    </Block>
  );
};

export {ProfileScreen};

const styles = StyleSheet.create({
  profileScreen: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight / 100 : 0,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
    zIndex: 1,
    flex: 1,
  },
  profileBackground: {
    width: width,
    height: height / 3,
    flex: 1,
  },
  profileCard: {
    // position: "relative",
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
  },
  stats: {
    paddingHorizontal: 40,
    backgroundColor: theme.COLORS.WHITE,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -80,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
  },
  itemAvatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
});
