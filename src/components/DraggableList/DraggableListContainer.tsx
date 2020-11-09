//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  TouchableWithoutFeedback,
  Image,
  View,
  StyleSheet,
  Dimensions,
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
import {Block, Text, theme} from 'galio-framework';
//// contexts
import {
  AuthContext,
  PostsContext,
  SettingsContext,
  UIContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc
import {DraggableListView} from './DraggableListView';
import {getTimeFromNow} from '~/utils/time';
import {argonTheme, BLURT_IMAGE_SERVER, STEEM_IMAGE_SERVER} from '~/constants';
const IMAGE_SERVER = BLURT_IMAGE_SERVER;
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

//// props
interface Props {
  data: any[];
}
//// component
const DraggableListContainer = (props: Props): JSX.Element => {
  //// contexts

  const _handlePressItem = (index) => {};

  ////
  const _renderItem = ({item, index, drag, isActive}) => {
    console.log('[DraggableListContainer] _renderItem, item', item);
    const avatar = `${IMAGE_SERVER}/u/${item.author}/avatar`;
    return (
      <TouchableWithoutFeedback onPress={() => _handlePressItem(index)}>
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
  return <DraggableListView data={props.data} renderItem={_renderItem} />;
};

export {DraggableListContainer};

const styles = StyleSheet.create({
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
});
