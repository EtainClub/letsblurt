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

//// props
interface Props {
  languages: string[];
  renderItem: (item) => JSX.Element;
}
const SettingScreen = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  //// effects
  const blockchainItems = [
    {
      title: intl.formatMessage({id: 'Settings.blockchain'}),
      id: 'blockchain',
      type: 'dropdown',
      options: ['Blurt', 'Steemit'],
    },
  ];

  const securityItems = [
    {
      title: intl.formatMessage({id: 'Settings.auto_login'}),
      id: 'autoLogin',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.use_otp'}),
      id: 'useOTP',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.logout'}),
      id: 'logout',
      type: 'switch',
    },
  ];
  const notificationItems = [
    {
      title: intl.formatMessage({id: 'Settings.dnd'}),
      id: 'dnd',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_beneficiary'}),
      id: 'beneficiary',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_reply'}),
      id: 'reply',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_mention'}),
      id: 'mention',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_follow'}),
      id: 'follow',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_transfer'}),
      id: 'transfer',
      type: 'switch',
    },
    {
      title: intl.formatMessage({id: 'Settings.notify_vote'}),
      id: 'vote',
      type: 'switch',
    },
  ];

  const generalItems = [
    {
      title: intl.formatMessage({id: 'Settings.language'}),
      id: 'language',
      type: 'dropdown',
      options: props.languages,
    },
    {
      title: intl.formatMessage({id: 'Settings.notice'}),
      id: 'notice',
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.rate_app'}),
      id: 'rateApp',
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.app_version'}),
      id: 'appVersion',
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.terms'}),
      id: 'terms',
      type: 'button',
    },
    {
      title: intl.formatMessage({id: 'Settings.privacy'}),
      id: 'privacy',
      type: 'button',
    },
  ];

  return (
    <ScrollView>
      {/* <FlatList
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
      /> */}
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
