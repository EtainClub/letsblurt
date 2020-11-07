//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
  TouchableOpacity,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Text, Input, Icon, theme} from 'galio-framework';
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc

//// props
interface Props {
  items: any[];
  handleLoadMore: () => void;
}
//// component
const SearchScreen = (props: Props): JSX.Element => {
  //// props

  const _renderItem = (item) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => console.log('item pressed')}>
        <Block flex row middle space="between">
          <Text size={14}>{item.title}</Text>
          <Icon
            name="chevron-right"
            family="evilicon"
            style={{paddingRight: 5}}
          />
        </Block>
      </TouchableOpacity>
    );
  };
  return (
    <FlatList
      onEndReached={props.handleLoadMore}
      onEndReachedThreshold={0.5}
      data={props.items}
      keyExtractor={(item, index) => String(index)}
      renderItem={({item}) => _renderItem(item)}
    />
  );
};

export {SearchScreen};

const styles = StyleSheet.create({
  item: {
    height: theme.SIZES.BASE * 1.5,
    marginBottom: theme.SIZES.BASE,
  },
});
