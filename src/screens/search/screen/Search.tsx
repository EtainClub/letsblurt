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
  searchText: string;
  active: boolean;
  items: any[];
  handleSearchChange: (text: string) => void;
  handleSearch: () => void;
  handleRefresh: () => void;
  handleLoadMore: () => void;
  handleActive: (active: boolean) => void;
}
//// component
const SearchScreen = (props: Props): JSX.Element => {
  //// props
  const {searchText, active, items} = props;
  //// language
  const intl = useIntl();
  //// states
  // const [searchText, setSearchText] = useState(props.initialText);
  // const [searching, setSearching] = useState(false);
  // const [active, setActive] = useState(false);

  const SearchBar = () => {
    const iconSearch =
      searchText != '' ? (
        <TouchableWithoutFeedback onPress={() => props.handleSearchChange('')}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="remove"
            family="font-awesome"
          />
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback onPress={props.handleSearch}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="magnifying-glass"
            family="entypo"
          />
        </TouchableWithoutFeedback>
      );

    console.log('search bar. search text', searchText);

    return (
      <Block center>
        <Input
          right
          color="black"
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize="none"
          iconContent={iconSearch}
          defaultValue={searchText}
          returnKeyType="search"
          style={[styles.search, active ? styles.shadow : null]}
          placeholder={intl.formatMessage({id: 'Search.search_placeholder'})}
          onFocus={() => props.handleActive(true)}
          onBlur={() => props.handleActive(false)}
          onChangeText={props.handleSearchChange}
          onSubmitEditing={props.handleSearch}
        />
      </Block>
    );
  };

  return (
    <Block style={{marginBottom: 70}}>
      {SearchBar()}
      <PostsListView
        posts={items}
        isUser={false}
        refreshPosts={props.handleRefresh}
        fetchMore={props.handleLoadMore}
      />
    </Block>
  );
};

export {SearchScreen};

const styles = StyleSheet.create({
  item: {
    height: theme.SIZES.BASE * 1.5,
    marginBottom: theme.SIZES.BASE,
  },
  searchContainer: {
    width: width,
    paddingHorizontal: theme.SIZES.BASE,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 1,
    borderRadius: 3,
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 2,
    zIndex: 2,
  },
});
