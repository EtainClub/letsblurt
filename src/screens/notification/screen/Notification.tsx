import React, {useState, useEffect} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  Alert,
  Image,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import moment from 'moment';
import {argonTheme} from '~/constants';
//// utils
import {get} from 'lodash';
import {getTimeFromNow} from '~/utils/time';
import {Images, BLURT_IMAGE_SERVER, STEEM_IMAGE_SERVER} from '~/constants';
const IMAGE_SERVER = BLURT_IMAGE_SERVER;

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

interface Props {
  notifications: any[];
  fetching: boolean;
}
const NotificationScreen = (props: Props): JSX.Element => {
  console.log('[NotificationScreen] props', props);
  //// lanugage
  const intl = useIntl();

  const _renderItem = ({item, index}) => {
    const notiType = item.type;
    let iconName = '';
    let iconFamily = '';
    let text = '';
    let avatar = '';
    let author = item.author;
    switch (notiType) {
      case 'follow':
        iconName = 'adduser';
        iconFamily = 'antdesign';
        author = item.follower;
        avatar = `${IMAGE_SERVER}/u/${author}/avatar`;
        text = intl.formatMessage({id: 'Notifications.follow'});
        break;
      case 'reply':
        iconName = 'message-reply-text';
        iconFamily = 'material-community';
        avatar = `${IMAGE_SERVER}/u/${author}/avatar`;
        text = intl.formatMessage({id: 'Notifications.reply'});
        break;
      case 'mention':
        iconName = 'at';
        iconFamily = 'font-awesome';
        avatar = `${IMAGE_SERVER}/u/${author}/avatar`;
        text = intl.formatMessage({id: 'Notifications.mention'});
        break;
      default:
        break;
    }

    return (
      <Block
        flex
        row
        space="between"
        style={{
          marginBottom: 5,
          padding: 5,
          backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
        }}>
        <Block row middle>
          <Block left middle with={20}>
            <Icon size={20} name={iconName} family={iconFamily} />
          </Block>
          <Block row middle>
            <Block center width={100}>
              <Image
                source={{
                  uri: avatar || null,
                }}
                style={styles.avatar}
              />
              {<Text size={10}>{item.author}</Text>}
            </Block>
          </Block>
          <Block middle>
            <Text>{text}</Text>
          </Block>
        </Block>
        <Block middle>
          {
            <Text>
              {getTimeFromNow(moment.unix(item.timestamp)).split('ago')[0]}
            </Text>
          }
        </Block>
      </Block>
    );
  };

  return !props.fetching ? (
    <FlatList
      contentContainerStyle={styles.posts}
      data={props.notifications}
      renderItem={_renderItem}
      keyExtractor={(item, index) => String(index)}
      initialNumToRender={20}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <ActivityIndicator color={argonTheme.COLORS.ERROR} size="large" />
  );
};

export {NotificationScreen};

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
  header: {
    backgroundColor: 'green',
  },
  notification: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE / 2,
    paddingBottom: theme.SIZES.BASE * 1.5,
  },
  rows: {
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE * 1.25,
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
