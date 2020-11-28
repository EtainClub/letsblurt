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
  TouchableWithoutFeedback,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block, Text, Input, Icon, theme} from 'galio-framework';
const {height, width} = Dimensions.get('window');
//// contexts
import {PostsContext, AuthContext, UIContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// etc
import {PostsListView} from '~/components';

//// props
interface Props {
  items: any[];
  handleSearch: (search: string) => void;
  handleLoadMore: () => void;
}
//// component
const SearchScreen = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// states
  const [searchText, setSearchText] = useState('');

  const SearchBar = () => {
    const iconSearch =
      searchText === '' ? (
        <TouchableWithoutFeedback onPress={() => props.handleSearch('')}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="page-remove"
            family="foundation"
          />
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback
          onPress={() => props.handleSearch(searchText)}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="magnifying-glass"
            family="entypo"
          />
        </TouchableWithoutFeedback>
      );

    return (
      <Block center>
        <Input
          style={styles.searchContainer}
          right
          color="black"
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize="none"
          iconContent={iconSearch}
          defaultValue={searchText}
          returnKeyType="search"
          placeholder={intl.formatMessage({id: 'Header.search_placeholder'})}
          onChangeText={(text: string) => setSearchText(text)}
          onSubmitEditing={() => props.handleSearch(searchText)}
        />
      </Block>
    );
  };

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
    <Block>
      <SearchBar />
      <PostsListView posts={props.items} isUser={false} />
    </Block>
  );
  return (
    <FlatList
      ListHeaderComponent={SearchBar}
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
  searchContainer: {
    height: 38,
    width: width * 0.6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
});
