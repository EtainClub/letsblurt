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
} from 'react-native';
//// react navigation
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Text, Icon} from 'galio-framework';
import DraggableFlatList from 'react-native-draggable-flatlist';
//// contexts
import {
  AuthContext,
  PostsContext,
  SettingsContext,
  UIContext,
} from '~/contexts';
import {PostData, PostRef, PostsTypes, ProfileData} from '~/contexts/types';
//// etc

//// props
interface Props {
  data: any[];
  renderItem: (item: any) => JSX.Element;
}
//// component
const DraggableListView = (props: Props): JSX.Element => {
  //// contexts

  return (
    <DraggableFlatList
      data={props.data}
      renderItem={props.renderItem}
      keyExtractor={(item, index) => `draggable-item-${item.author}`}
    />
  );
};

export {DraggableListView};
