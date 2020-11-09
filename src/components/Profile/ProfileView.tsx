//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// react navigation
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {
  Images,
  argonTheme,
  BLURT_IMAGE_SERVER,
  STEEM_IMAGE_SERVER,
} from '~/constants';
const {width, height} = Dimensions.get('screen');
import {HeaderHeight} from '~/constants/utils';
//// contexts
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc
import {BlockchainTypes} from '~/contexts/types';
import {getNumberStat} from '~/utils/stats';

//// props
interface Props {
  profileData: ProfileData;
  blockchain?: BlockchainTypes;
  isUser?: boolean;
  favoriting: boolean;
  handlePressFavorite: () => void;
}
//// component with default props
const ProfileView: React.FC<Props> = ({
  blockchain = BlockchainTypes.BLURT,
  isUser = true,
  ...props
}): JSX.Element => {
  //// props
  console.log('[ProfileView] props', props);
  const {profile} = props.profileData;
  //// language
  const intl = useIntl();
  //// contexts
  //// stats
  ////

  const IMAGE_SERVER =
    blockchain === BlockchainTypes.BLURT
      ? BLURT_IMAGE_SERVER
      : STEEM_IMAGE_SERVER;
  //// render
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{marginTop: '1%', maxHeight: height / 3}}>
      <Block flex style={styles.profileCard}>
        <Block middle style={styles.avatarContainer}>
          <Block flex row center>
            <Block
              center
              flex={1}
              style={{top: 40}}
              onPress={() => console.log('show follower list')}>
              <Text size={16} color="orange">
                {getNumberStat(profile.stats.followers)}
              </Text>
              <Text color="blue">{intl.formatMessage({id: 'followers'})}</Text>
              {!isUser ? (
                <Button
                  onPress={() => console.log('Follow')}
                  small
                  center
                  style={{
                    padding: 0,
                    width: 100,
                    backgroundColor: argonTheme.COLORS.BUTTON_COLOR,
                  }}>
                  {intl.formatMessage({id: 'Profile.follow_button'})}
                </Button>
              ) : null}
            </Block>
            <Block flex={3} center>
              <Block row>
                <Image
                  source={{
                    uri: `${IMAGE_SERVER}/u/${profile.name}/avatar`,
                  }}
                  style={[styles.avatar, {left: 10}]}
                />
                {isUser && (
                  <Icon
                    style={{left: 10, top: 80}}
                    size={30}
                    color={argonTheme.COLORS.ERROR}
                    name="pencil"
                    family="font-awesome"
                    onPress={() => console.log('edit profile')}
                  />
                )}
              </Block>
              <Text>{profile.metadata.name}</Text>
              <Text color="orange">@{profile.name}</Text>
            </Block>
            <Block
              center
              flex={1}
              style={{top: 40}}
              onPress={() => console.log('show following list')}>
              <Text size={16} color="orange">
                {getNumberStat(profile.stats.following)}
              </Text>
              <Text color="blue">{intl.formatMessage({id: 'following'})}</Text>
              {!isUser ? (
                <Button
                  onPress={props.handlePressFavorite}
                  loading={props.favoriting}
                  small
                  center
                  style={{
                    padding: 0,
                    width: 100,
                    backgroundColor: argonTheme.COLORS.ERROR,
                  }}>
                  {intl.formatMessage({id: 'Profile.favorite_button'})}
                </Button>
              ) : null}
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

        {/* <Block
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
      </Block> */}

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
              {getNumberStat(parseInt(profile.power))}
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
              {profile.voteAmount} BLT
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
  );
};

export {ProfileView};

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
