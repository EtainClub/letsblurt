//// react
import React from 'react';
//// react native
import {
  View,
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
import {Images, argonTheme, BLURT_IMAGE_SERVER} from '~/constants';
import {HeaderHeight} from '~/constants/utils';
import {getNumberStat} from '~/utils/stats';
import {Feed} from '~/screens';
import {PostsFeed, PostsList, ProfileContainer} from '~/components';
import {PostsTypes, PostData, ProfileData} from '~/contexts/types';

const {width, height} = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

const initialLayout = {width: Dimensions.get('window').width};

interface Props {
  authorData: ProfileData;
  authorPosts: PostData[];
  fetchPosts: (appending: boolean) => void;
  clearPosts: () => void;
}
const ProfileScreen = (props: Props): JSX.Element => {
  console.log('[ProfileSceeen] props', props);
  const intl = useIntl();
  const {profile, voteAmount, power} = props.authorData;
  console.log('[ProfileSceeen] profile', profile);

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'blogs', title: 'Blogs'},
    {key: 'bookmarks', title: 'Bookmarks'},
    {key: 'favorites', title: 'Favorites'},
  ]);

  const BlogList = () => <PostsList posts={props.authorPosts} isUser />;

  const BookmarkList = () => <PostsList posts={props.authorPosts} isUser />;

  const FavoriteList = () => (
    <View style={{flex: 1}}>
      <Text>Favorites</Text>
      <Text>Authors</Text>
    </View>
  );

  const renderScene = SceneMap({
    blogs: BlogList,
    bookmarks: BookmarkList,
    favorites: FavoriteList,
  });

  return (
    <Block flex style={styles.profileScreen}>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <ProfileContainer profileData={props.authorData} isUser={true} />
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
});

/*

      */

/*
        return (
    <Block flex>
      <ImageBackground
        source={Images.ProfileBackground}
        style={styles.profileContainer}
        imageStyle={styles.profileBackground}>
        <Block style={styles.profileCard}>
          <Block middle style={styles.avatarContainer}>
            <Block row center>
              <Block
                center
                flex={1}
                style={{top: 20}}
                onPress={() => console.log('show follower list')}>
                <Text size={16} color="orange">
                  {getNumberStat(profile.stats.followers)}
                </Text>
                <Text color="blue">
                  {intl.formatMessage({id: 'followers'})}
                </Text>
              </Block>
              <Block flex={3} center>
                <Block row>
                  <Image
                    source={{
                      uri: `${BLURT_IMAGE_SERVER}/u/${profile.name}/avatar`,
                    }}
                    style={[styles.avatar, {left: 10}]}
                  />
                  <Icon
                    style={{left: 10, top: 80}}
                    size={30}
                    color={argonTheme.COLORS.ERROR}
                    name="pencil"
                    family="font-awesome"
                    onPress={() => console.log('edit profile')}
                  />
                </Block>
                <Text>{profile.metadata.name}</Text>
                <Text color="orange">@{profile.name}</Text>
              </Block>
              <Block
                center
                flex={1}
                style={{top: 20}}
                onPress={() => console.log('show following list')}>
                <Text size={16} color="orange">
                  {getNumberStat(profile.stats.following)}
                </Text>
                <Text color="blue">
                  {intl.formatMessage({id: 'following'})}
                </Text>
              </Block>
            </Block>
            <Text
              size={14}
              color="#32325D"
              style={{marginTop: 10, fontFamily: 'open-sans-light'}}>
              {profile.metadata.about}
            </Text>
            <Text
              size={14}
              color="#32325D"
              style={{marginTop: 10, fontFamily: 'open-sans-light'}}>
              {profile.metadata.location}
            </Text>
          </Block>

          <Block
            middle
            row
            space="evenly"
            style={{marginTop: 0, paddingBottom: 0}}>
            <Button
              onPress={() => console.log('Follow')}
              small
              center
              style={{
                padding: 0,
                backgroundColor: argonTheme.COLORS.INFO,
              }}>
              {intl.formatMessage({id: 'Profile.follow_button'})}
            </Button>
            <Button
              onPress={() => console.log('follow the author')}
              small
              center
              color={argonTheme.COLORS.ERROR}
              style={{
                backgroundColor: argonTheme.COLORS.ERROR,
              }}>
              {intl.formatMessage({id: 'Profile.favorite_button'})}
            </Button>
          </Block>

          <Block row space="between" style={styles.stats}>
            <Block middle>
              <Text
                size={18}
                color="#525F7F"
                style={{
                  marginBottom: 4,
                  fontFamily: 'open-sans-bold',
                }}>
                {getNumberStat(profile.stats.post_count)}
              </Text>
              <Text
                style={{fontFamily: 'open-sans-regular'}}
                size={12}
                color={argonTheme.COLORS.TEXT}>
                {intl.formatMessage({id: 'Profile.postings'})}
              </Text>
            </Block>
            <Block middle>
              <Text
                color="#525F7F"
                size={18}
                style={{
                  marginBottom: 4,
                  fontFamily: 'open-sans-bold',
                }}>
                {power}
              </Text>
              <Text
                style={{fontFamily: 'open-sans-regular'}}
                size={12}
                color={argonTheme.COLORS.TEXT}>
                {intl.formatMessage({id: 'Profile.power'})}
              </Text>
            </Block>
            <Block middle>
              <Text
                color={argonTheme.COLORS.ERROR}
                size={18}
                style={{
                  marginBottom: 4,
                  fontFamily: 'open-sans-bold',
                }}>
                ${voteAmount}
              </Text>
              <Text
                style={{fontFamily: 'open-sans-regular'}}
                size={12}
                color={argonTheme.COLORS.TEXT}>
                {intl.formatMessage({id: 'Profile.vote_amount'})}
              </Text>
            </Block>
          </Block>
        </Block>
      </ImageBackground>
      <TabView
        style={{zIndex: 2}}
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        tabBarPosition="top"
      />
    </Block>
  );*/

/*
          <ScrollView
          showsVerticalScrollIndicator={false}
          style={{marginTop: '1%', maxHeight: height / 3}}>
          <Block flex style={styles.profileCard}>
            <Block middle style={styles.avatarContainer}>
              <Block flex row center>
                <Block
                  center
                  flex={1}
                  style={{top: 20}}
                  onPress={() => console.log('show follower list')}>
                  <Text size={16} color="orange">
                    {getNumberStat(profile.stats.followers)}
                  </Text>
                  <Text color="blue">
                    {intl.formatMessage({id: 'followers'})}
                  </Text>
                </Block>
                <Block flex={3} center>
                  <Block row>
                    <Image
                      source={{
                        uri: `${BLURT_IMAGE_SERVER}/u/${profile.name}/avatar`,
                      }}
                      style={[styles.avatar, {left: 10}]}
                    />
                    <Icon
                      style={{left: 10, top: 80}}
                      size={30}
                      color={argonTheme.COLORS.ERROR}
                      name="pencil"
                      family="font-awesome"
                      onPress={() => console.log('edit profile')}
                    />
                  </Block>
                  <Text>{profile.metadata.name}</Text>
                  <Text color="orange">@{profile.name}</Text>
                </Block>
                <Block
                  center
                  flex={1}
                  style={{top: 20}}
                  onPress={() => console.log('show following list')}>
                  <Text size={16} color="orange">
                    {getNumberStat(profile.stats.following)}
                  </Text>
                  <Text color="blue">
                    {intl.formatMessage({id: 'following'})}
                  </Text>
                </Block>
              </Block>
              <Text
                size={14}
                color="#32325D"
                style={{marginTop: 10, fontFamily: 'open-sans-light'}}>
                {profile.metadata.about}
              </Text>
              <Text
                size={14}
                color="#32325D"
                style={{marginTop: 10, fontFamily: 'open-sans-light'}}>
                {profile.metadata.location}
              </Text>
            </Block>

            <Block
              middle
              row
              space="evenly"
              style={{marginTop: 0, paddingBottom: 0}}>
              <Button
                onPress={() => console.log('Follow')}
                small
                center
                style={{
                  padding: 0,
                  backgroundColor: argonTheme.COLORS.INFO,
                }}>
                {intl.formatMessage({id: 'Profile.follow_button'})}
              </Button>
              <Button
                onPress={() => console.log('follow the author')}
                small
                center
                color={argonTheme.COLORS.ERROR}
                style={{
                  backgroundColor: argonTheme.COLORS.ERROR,
                }}>
                {intl.formatMessage({id: 'Profile.favorite_button'})}
              </Button>
            </Block> 

            <Block row space="between" style={styles.stats}>
              <Block middle>
                <Text
                  size={18}
                  color="#525F7F"
                  style={{
                    marginBottom: 4,
                    fontFamily: 'open-sans-bold',
                  }}>
                  {getNumberStat(profile.stats.post_count)}
                </Text>
                <Text
                  style={{fontFamily: 'open-sans-regular'}}
                  size={12}
                  color={argonTheme.COLORS.TEXT}>
                  {intl.formatMessage({id: 'Profile.postings'})}
                </Text>
              </Block>
              <Block middle>
                <Text
                  color="#525F7F"
                  size={18}
                  style={{
                    marginBottom: 4,
                    fontFamily: 'open-sans-bold',
                  }}>
                  {power}
                </Text>
                <Text
                  style={{fontFamily: 'open-sans-regular'}}
                  size={12}
                  color={argonTheme.COLORS.TEXT}>
                  {intl.formatMessage({id: 'Profile.power'})}
                </Text>
              </Block>
              <Block middle>
                <Text
                  color={argonTheme.COLORS.ERROR}
                  size={18}
                  style={{
                    marginBottom: 4,
                    fontFamily: 'open-sans-bold',
                  }}>
                  ${voteAmount}
                </Text>
                <Text
                  style={{fontFamily: 'open-sans-regular'}}
                  size={12}
                  color={argonTheme.COLORS.TEXT}>
                  {intl.formatMessage({id: 'Profile.vote_amount'})}
                </Text>
              </Block>
            </Block>
          </Block>
        </ScrollView>
*/
