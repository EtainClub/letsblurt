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
  autoFocus: boolean;
  handleSearch: (search: string) => void;
  handleLoadMore: () => void;
}
//// component
const SearchScreen = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// states
  const [searchText, setSearchText] = useState('');
  const [autoFocus, setAutoFocus] = useState(props.autoFocus);

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
          autoFocus={autoFocus || props.autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          iconContent={iconSearch}
          defaultValue={searchText}
          returnKeyType="search"
          placeholder={intl.formatMessage({id: 'Header.search_placeholder'})}
          onChangeText={(text: string) => {
            setAutoFocus(true);
            setSearchText(text);
          }}
          onSubmitEditing={() => {
            setAutoFocus(false);
            props.handleSearch(searchText);
          }}
        />
      </Block>
    );
  };

  return (
    <Block>
      <SearchBar />
      <PostsListView
        posts={props.items}
        isUser={false}
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
    height: 38,
    width: width * 0.6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
});
