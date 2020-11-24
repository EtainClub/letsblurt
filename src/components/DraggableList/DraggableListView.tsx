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
  // return (
  //   <View style={{flex: 1}}>
  //     <DraggableFlatList
  //       style={{marginTop: 15, marginHorizontal: 20}}
  //       data={props.data}
  //       renderItem={props.renderItem}
  //       keyExtractor={(item, index) => `draggable-item-${item.author}`}
  //       onDragBegin={() => console.log('onDragBegin')}
  //       onDragEnd={({data}) => console.log('drag end data', data)}
  //     />
  //   </View>
  // );
  return (
    <FlatList
      contentContainerStyle={{marginTop: 15, marginHorizontal: 20}}
      data={props.data}
      renderItem={props.renderItem}
      keyExtractor={(item, index) => String(index)}
      initialNumToRender={5}
      showsVerticalScrollIndicator={false}
    />
  );
};

export {DraggableListView};
