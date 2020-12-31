//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  Switch,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
//// language
import {useIntl} from 'react-intl';
////
import {navigate} from '~/navigation/service';
//// UIs
import {Button, Icon, Block, Input, Text, theme} from 'galio-framework';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
const {height, width} = Dimensions.get('window');
import {BLURT_MAINNETS} from '~/constants/blockchain';
import {SettingUITypes} from '../container/Settings';

//// props
interface Props {
  locales: string[];
  translationLanguages: string[];
  renderItem: (item) => JSX.Element;
}
const SettingScreen = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  //// effects

  // blockchains
  const blockchainItems = [
    {
      title: intl.formatMessage({id: 'Settings.server'}),
      id: SettingUITypes.RPC_SERVER,
      type: 'dropdown',
      defaultText: BLURT_MAINNETS[0],
      options: BLURT_MAINNETS,
    },
  ];
  // securities
  const securityItems = [
    {
      title: intl.formatMessage({id: 'Settings.auto_login'}),
      id: SettingUITypes.USE_AUTO_LOGIN,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.use_otp'}),
      id: SettingUITypes.USE_OTP,
      type: 'switch',
    },
  ];
  // push notifications
  const notificationItems = [
    {
      title: intl.formatMessage({id: 'Settings.dnd'}),
      id: SettingUITypes.DND_TIMES,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_beneficiary'}),
      id: SettingUITypes.BENEFICIARY,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_reply'}),
      id: SettingUITypes.REPLY,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_mention'}),
      id: SettingUITypes.MENTION,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_follow'}),
      id: SettingUITypes.FOLLOW,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_transfer'}),
      id: SettingUITypes.TRANSFER,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_vote'}),
      id: SettingUITypes.REBLOG,
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_vote'}),
      id: SettingUITypes.VOTE,
      type: 'switch',
    },
  ];

  const generalItems = [
    {
      title: intl.formatMessage({id: 'Settings.locale'}),
      id: SettingUITypes.LOCALE,
      type: 'dropdown',
      defaultText: 'en-US',
      options: props.locales,
    },
    {
      title: intl.formatMessage({id: 'Settings.locale'}),
      id: SettingUITypes.TRANSLATION,
      type: 'dropdown',
      defaultText: 'EN',
      options: props.translationLanguages,
    },
    {
      title: intl.formatMessage({id: 'Settings.notice'}),
      id: SettingUITypes.NOTICE,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.rate_app'}),
      id: SettingUITypes.RATE_APP,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.app_version'}),
      id: SettingUITypes.APP_VERSION,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.terms'}),
      id: SettingUITypes.TERMS,
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.privacy'}),
      id: SettingUITypes.PRIVACY,
      type: 'button',
    },
  ];

  return (
    <ScrollView>
      <FlatList
        data={blockchainItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.blockchain_settings'})}
            </Text>
          </Block>
        }
      />
      <FlatList
        data={securityItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.security'})}
            </Text>
          </Block>
        }
      />
      <FlatList
        data={notificationItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.notification'})}
            </Text>
          </Block>
        }
      />
      <FlatList
        data={generalItems}
        keyExtractor={(item, index) => item.id}
        renderItem={props.renderItem}
        ListHeaderComponent={
          <Block center style={styles.title}>
            <Text bold size={theme.SIZES.BASE} style={{paddingBottom: 5}}>
              {intl.formatMessage({id: 'Settings.general'})}
            </Text>
          </Block>
        }
      />
    </ScrollView>
  );
};

export {SettingScreen};

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
});
