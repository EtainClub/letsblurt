import React, {useState, useContext, useEffect} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Button, Icon, Block, NavBar, Input, Text, theme} from 'galio-framework';
import {Images, argonTheme, BLURT_IMAGE_SERVER} from '~/constants';

//
import {useIntl} from 'react-intl';
import {navigate} from '~/navigation/service';
// steem api
import {UIContext, AuthContext, PostsContext, UserContext} from '~/contexts';
// types
import {PostRef, PostsTypes} from '~/contexts/types';
import {materialTheme} from '~/constants/materialTheme';
import {DropdownModal} from './DropdownModal';
import {indexOf} from 'lodash';
import {useRoute} from '@react-navigation/native';

import ModalDropdown from 'react-native-modal-dropdown';

const {height, width} = Dimensions.get('window');
const iPhoneX = (): boolean =>
  Platform.OS === 'ios' &&
  (height === 812 || width === 812 || height === 896 || width === 896);

export const COMMUNITY_INDEX = 'community_index';

interface Props {
  title: string;
  white?: boolean;
  back?: boolean;
  transparent?: boolean;
  navigation: any;
}
const Header = (props: Props): JSX.Element => {
  //// props
  //// lanugage
  const intl = useIntl();
  // contexts
  const {authState, changeAccount} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {uiState, setTagParam, setSearchParam} = useContext(UIContext);
  const {postsState, setTagIndex, setFilterIndex, clearPosts} = useContext(
    PostsContext,
  );
  // states
  const [username, setUsername] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [accounts, setAccounts] = useState(null);
  const [searching, setSearching] = useState(false);
  const [community, setCommunity] = useState(0);
  const [category, setTag] = useState(0);

  /// auth state change effect
  useEffect(() => {
    if (authState.loggedIn) {
      console.log('[Header] authState', authState);
      setUsername(authState.currentCredentials.username);
      // set accounts
      const iterator = authState.credentialsList.values();
      let _accounts = [];
      for (const key of iterator) {
        _accounts.push(Object.keys(key)[0]);
      }
      setAccounts(_accounts);
    }
  }, [authState.currentCredentials]);
  /*
  // effects
  useEffect(() => {
    // set posts type to feed
    setPostsType(
      PostsTypes.FEED,
      uiState.categoryList[category],
      uiState.tagList[community],
    );
  }, []);
  */

  const _onSubmitSearch = () => {
    console.log('_onSubmitSearch');
    setSearchParam(searchText);
  };

  const _renderAccountRow = (option, index, isSelect) => {
    console.log('_renderAccountRow', option, index, isSelect);
    return (
      <Block row style={{margin: 5}}>
        <Image
          source={{
            uri: `${BLURT_IMAGE_SERVER}/u/${option}/avatar`,
          }}
          style={[
            styles.avatar,
            {
              width: 30,
              height: 30,
              borderRadius: 30 / 2,
            },
          ]}
        />
        <Block row middle>
          <Text
            size={14}
            style={{marginHorizontal: 5, color: argonTheme.COLORS.WHITE}}>
            {option}
          </Text>
          {isSelect ? (
            <Block right>
              <Icon
                size={16}
                color={argonTheme.COLORS.ERROR}
                name="check"
                family="antdegisn"
              />
            </Block>
          ) : null}
        </Block>
      </Block>
    );
  };

  const _handleChangeAccount = async (index: number, value: string) => {
    console.log('accounts', accounts);
    console.log('value', value);
    changeAccount(value);
  };

  const Avatar = () => {
    return (
      username && (
        <ModalDropdown
          options={accounts}
          renderRow={_renderAccountRow}
          dropdownButtonStyle={styles.avatarButton}
          selectedOptionIndex={0}
          rowTextStyle={styles.rowTextStyle}
          style={styles.dropdown}
          dropdownStyle={styles.dropdownStyle}
          textStyle={styles.dropdownText}
          onSelect={_handleChangeAccount}>
          <Image
            source={{
              uri: `${BLURT_IMAGE_SERVER}/u/${username}/avatar`,
            }}
            style={[styles.avatar]}
          />
        </ModalDropdown>
      )
    );
  };

  const SearchBar = () => {
    const iconSearch =
      searchText === '' ? (
        <TouchableWithoutFeedback onPress={() => setSearchText('')}>
          <Icon
            size={16}
            color={theme.COLORS.MUTED}
            name="page-remove"
            family="foundation"
          />
        </TouchableWithoutFeedback>
      ) : (
        <TouchableWithoutFeedback onPress={_onSubmitSearch}>
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
          autoFocus={false}
          autoCorrect={false}
          autoCapitalize="none"
          iconContent={iconSearch}
          defaultValue={searchText}
          returnKeyType="search"
          placeholder={intl.formatMessage({id: 'Header.search_placeholder'})}
          onChangeText={(text: string) => setSearchText(text)}
          onSubmitEditing={_onSubmitSearch}
        />
      </Block>
    );
  };

  //// update tag index of uiState
  const _handleOnTagChange = (index: number, value: string) => {
    console.log('header tag index, value', index, value);
    // set tag index
    setTagIndex(index, PostsTypes.FEED, authState.currentCredentials.username);
    // clear tag param
    setTagParam(null);
  };

  //// update category index of uiState
  const _handleOnFilterChange = (index: number, value: string) => {
    console.log('header filter index, value', index, value);
    setFilterIndex(index, authState.currentCredentials.username);
  };

  //// update tag index of uiState
  const _handleOnTagChangeForPosting = (index: number, value: string) => {
    console.log('[Header] _handleOnTagChangeForPosting. community', value);
  };

  ////
  const _handleLeftPress = () => {
    const {back, navigation} = props;
    if (back) navigation.goBack();
    else navigation.openDrawer();
  };

  ////
  const _renderRight = () => {
    const {white, title, navigation} = props;
    const defaultCommunityText = '';
    const defaultCategoryText = '';
    const {tagList, filterList, tagIndex, filterIndex} = postsState;
    let communityOptions: string[] = [];
    switch (title) {
      case 'Feed':
        tagList.forEach((item) => communityOptions.push(item.tag));
        return (
          <Block row space="between">
            <Block row space="between" style={{left: 150}}>
              <DropdownModal
                key={communityOptions[tagIndex]}
                defaultText={defaultCommunityText || communityOptions[tagIndex]}
                dropdownButtonStyle={styles.dropdownButtonStyle}
                selectedOptionIndex={tagIndex}
                rowTextStyle={styles.rowTextStyle}
                style={styles.dropdown}
                dropdownStyle={styles.dropdownStyle}
                textStyle={styles.dropdownText}
                options={communityOptions}
                onSelect={_handleOnTagChange}
              />
              <DropdownModal
                key={filterList[filterIndex]}
                defaultText={defaultCategoryText || filterList[filterIndex]}
                dropdownButtonStyle={styles.dropdownButtonStyle}
                selectedOptionIndex={filterIndex}
                rowTextStyle={styles.rowTextStyle}
                style={styles.dropdown}
                dropdownStyle={styles.dropdownStyle}
                textStyle={styles.dropdownText}
                options={filterList}
                onSelect={_handleOnFilterChange}
              />
            </Block>
            <Block style={{left: 140, top: 2}}>
              <Avatar />
            </Block>

            {/* <Icon
              onPress={() => navigation.navigate('SearchFeed')}
              style={{top: 12, left: 20}}
              size={20}
              color={theme.COLORS.MUTED}
              name="magnifying-glass"
              family="entypo"
            /> */}
          </Block>
        );
      case 'Search':
        return <SearchBar />;
      case 'Posting':
      // tagList.forEach((item, index) => {
      //   if (index === 0) return;
      //   communityOptions.push(item[1]);
      // });
      // return (
      //   <Block row space="around">
      //     <Text style={{top: 13}}>Posting to</Text>
      //     <DropdownModal
      //       key={communityOptions[tagIndex]}
      //       defaultText={defaultCommunityText || communityOptions[tagIndex]}
      //       dropdownButtonStyle={styles.dropdownButtonStyle}
      //       selectedOptionIndex={tagIndex}
      //       rowTextStyle={styles.rowTextStyle}
      //       style={styles.dropdown}
      //       dropdownStyle={styles.dropdownStyle}
      //       textStyle={styles.dropdownText}
      //       options={communityOptions}
      //       onSelect={_handleOnTagChangeForPosting}
      //     />
      //     <Block style={{left: 107, top: 2}}>
      //       <Avatar />
      //     </Block>
      //   </Block>
      // );
      case 'Profile':
      case 'Author':
      case 'Notification':
      case 'Wallet':
      case 'Settings':
        return (
          <Block style={{left: 140, top: 10}}>
            <Avatar />
          </Block>
        );

      default:
        break;
    }
  };

  const {back, title, white, transparent, navigation} = props;
  const headerStyles = [
    styles.shadow,
    transparent ? {backgroundColor: 'rgba(0,0,0,0)'} : null,
  ];

  return (
    <Block style={headerStyles}>
      <NavBar
        back={back}
        title={title}
        style={styles.navbar}
        transparent={transparent}
        right={_renderRight()}
        rightStyle={{
          alignItems: 'flex-end',
          flex: 3,
          marginRight: 0,
          left: -70,
        }}
        leftStyle={{paddingTop: 3, flex: 0.3}}
        leftIconName={back ? null : 'navicon'}
        // leftIconFamily="font-awesome"
        leftIconColor={white ? theme.COLORS.WHITE : theme.COLORS.ICON}
        titleStyle={[
          styles.title,
          {color: theme.COLORS[white ? 'WHITE' : 'ICON']},
        ]}
        onLeftPress={_handleLeftPress}
      />
    </Block>
  );
};

export {Header};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    position: 'relative',
  },
  title: {
    width: '100%',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navbar: {
    paddingVertical: 0,
    paddingBottom: theme.SIZES.BASE * 1.5,
    paddingTop: iPhoneX() ? theme.SIZES.BASE * 4 : theme.SIZES.BASE,
    zIndex: 5,
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  notify: {
    backgroundColor: materialTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  searchContainer: {
    height: 38,
    width: width * 0.6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.5,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300',
  },
  // dropdown
  avatarButton: {
    borderColor: '#f5f5f5',
    borderWidth: 1,
    height: 44,
    width: 120,
    borderRadius: 8,
    marginRight: 0,
  },
  text: {
    color: '#788187',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 16,
    paddingHorizontal: 14,
    color: '#788187',
  },
  rowTextStyle: {
    fontSize: 12,
    color: '#788187',
    padding: 5,
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 150,
    width: 200,
    backgroundColor: argonTheme.COLORS.DEFAULT,
  },
  dropdownButtonStyle: {
    borderColor: '#f5f5f5',
    borderWidth: 1,
    height: 44,
    width: 120,
    borderRadius: 8,
    marginRight: 20,
  },
  dropdown: {
    flexGrow: 1,
    width: 120,
  },
  textStyle: {
    color: '#357ce6',
  },
  textButton: {
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 62,
    borderWidth: 0,
  },
});

/*


      */
