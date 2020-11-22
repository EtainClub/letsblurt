import React, {useContext} from 'react';
import {
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Switch,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import {Button, Icon, Block, Input, Text, theme} from 'galio-framework';
import {materialTheme} from '~/constants/materialTheme';
const {height, width} = Dimensions.get('window');
import ModalDropdown from 'react-native-modal-dropdown';
import {AuthContext} from '~/contexts';
import {SettingScreen} from '../screen/Settings';
import {argonTheme} from '~/constants';
import {DropdownModal} from '~/components';

interface Props {
  username: string;
}

const Settings = (props: Props): JSX.Element => {
  const {username} = props;
  //// contexts
  const {authState, processLogout} = useContext(AuthContext);

  //// process logout
  const _handleLogout = async () => {
    console.log('[Settings] handle logout');
    await processLogout();
  };
  ////
  const _handleToggleSwitch = async (key: string) => {
    switch (key) {
      case 'logout':
        _handleLogout();
        break;
      default:
        break;
    }
  };

  const _handlePressButton = async (key: string) => {
    switch (key) {
      case 'logout':
        _handleLogout();
        break;
      default:
        break;
    }
  };

  const _handleDropdownChange = (index: number, value: string) => {};

  ////
  const _renderItem = ({item}) => {
    console.log('[Settings] renderItem. item', item);
    switch (item.type) {
      case 'switch':
        return (
          <Block row middle space="between" style={styles.rows}>
            <Text size={14}>{item.title}</Text>
            <Switch
              onValueChange={() => _handleToggleSwitch(item.id)}
              ios_backgroundColor={materialTheme.COLORS.SWITCH_OFF}
              thumbColor={
                Platform.OS === 'android'
                  ? materialTheme.COLORS.SWITCH_OFF
                  : null
              }
              trackColor={{
                false: materialTheme.COLORS.SWITCH_OFF,
                true: argonTheme.COLORS.ERROR,
              }}
              value={true}
            />
          </Block>
        );
      case 'button':
        return (
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => _handlePressButton(item.id)}>
              <Block row middle space="between" style={{paddingTop: 7}}>
                <Text size={14}>{item.title}</Text>
                <Icon
                  name="angle-right"
                  family="font-awesome"
                  style={{paddingRight: 5}}
                />
              </Block>
            </TouchableOpacity>
          </Block>
        );
      case 'dropdown':
        return (
          <Block row middle space="between" style={styles.rows}>
            <Text size={14} style={{top: 7}}>
              {item.title}
            </Text>
            <DropdownModal
              key={item.options[0]}
              defaultText={item.options[0]}
              dropdownButtonStyle={styles.dropdownButtonStyle}
              selectedOptionIndex={0}
              rowTextStyle={styles.rowTextStyle}
              style={styles.dropdown}
              dropdownStyle={styles.dropdownStyle}
              textStyle={styles.dropdownText}
              options={item.options}
              onSelect={_handleDropdownChange}
            />
          </Block>
        );

      default:
        break;
    }
  };

  return <SettingScreen renderItem={_renderItem} />;
};

export {Settings};

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2,
  },
  wrapper: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});
