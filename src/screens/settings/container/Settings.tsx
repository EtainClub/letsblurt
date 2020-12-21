//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
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
//// language
import {useIntl} from 'react-intl';
//// UIs
import {Button, Icon, Block, Input, Text, theme} from 'galio-framework';
import {materialTheme} from '~/constants/materialTheme';
const {height, width} = Dimensions.get('window');
import {argonTheme} from '~/constants';
import {DropdownModal} from '~/components';
import ModalDropdown from 'react-native-modal-dropdown';
//// storage
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-community/async-storage';
//// contexts
import {AuthContext, SettingsContext, UIContext} from '~/contexts';
//// screens
import {SettingScreen} from '../screen/Settings';
import {DNDTimes} from '~/components';
//// times
import moment, {locale} from 'moment';
// start date and time: 1AM
const DATE1 = new Date(2020, 12, 12, 1, 0, 0);
// end date and time: 8AM
const DATE2 = new Date(2020, 12, 12, 8, 0, 0);
// local time offset in hours from UTC+0
const UTC_OFFSET_IN_MINUTES = DATE1.getTimezoneOffset();
// get timestamp of the date1
const START_TIME = DATE1.getTime();
// get timestamp of the date2
const END_TIME = DATE2.getTime();

interface Props {}
const Settings = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {authState, processLogout} = useContext(AuthContext);
  const {setLocale} = useContext(SettingsContext);
  const {uiState, setLanguageParam, setToastMessage} = useContext(UIContext);
  //// states
  const [username, setUsername] = useState(null);
  const [switchStates, setSwitchStates] = useState({});
  const [showDND, setShowDND] = useState(false);
  const [showStartClock, setShowStartClock] = useState(false);
  const [showEndClock, setShowEndClock] = useState(false);
  const [startDNDTime, setStartDNDTime] = useState(START_TIME);
  const [endDNDTime, setEndDNDTime] = useState(END_TIME);
  const [language, setLanguage] = useState('en');

  //// effects
  // event: mount
  useEffect(() => {
    _getInitialSettings();
  }, []);

  //// get initial settings
  const _getInitialSettings = async () => {
    if (authState.loggedIn) {
      // TODO: get auto login, use otp settings
      // states should be handled in settings Context

      // switch states
      let _switchStates = switchStates;
      // get username
      const _username = authState.currentCredentials.username;
      setUsername(_username);
      // get dnd times from storage
      const _startDND = await AsyncStorage.getItem('dnd_start_time');
      const _endDND = await AsyncStorage.getItem('dnd_end_time');
      // set times
      setStartDNDTime(JSON.parse(_startDND));
      setEndDNDTime(JSON.parse(_endDND));
      // set switch if time is set
      if (_startDND) {
        //        setSwitchStates({..._switchStates, ['dnd']: true});
        _switchStates = {..._switchStates, ['dnd']: true};
      }
      // TODO: get push notification and language settings from firestore
      const userRef = firestore().doc(`users/${_username}`);
      console.log('[Settings] userRer', userRef);
      await userRef
        .get()
        .then(async (doc) => {
          if (doc.exists) {
            const userDoc = doc.data();
            // set notifications states
            userDoc.pushNotifications.forEach((item: string) => {
              _switchStates = {..._switchStates, [item]: true};
            });
            // set switch states
            setSwitchStates(_switchStates);
            // set language (locale)
            setLanguage(userDoc.language);
            // store the locale in the storage
            await AsyncStorage.setItem('locale', userDoc.language);
            // set locale in the context
            setLocale(userDoc.language);
          }
        })
        .catch((error) => console.log('failed to get user doc', error));

      console.log('switch states', _switchStates);
    }
  };

  //// get notifications state
  const _buildNotificationsStates = (itemId: string, value: boolean) => {
    const beneficiary = switchStates['beneficiary'];
    const reply = switchStates['reply'];
    const mention = switchStates['mention'];
    const follow = switchStates['follow'];
    const transfer = switchStates['transfer'];
    const vote = switchStates['vote'];
    // reblog
    // delegate
    let notifications = [];
    if (beneficiary) notifications.push('beneficiary');
    if (reply) notifications.push('reply');
    if (mention) notifications.push('mention');
    if (follow) notifications.push('follow');
    if (transfer) notifications.push('transfer');
    if (vote) notifications.push('vote');
    // handle the event item
    if (value) {
      // update the value of the event item
      notifications = [...notifications, itemId];
    } else {
      // remove the event item
      notifications = notifications.filter(
        (notification) => notification !== itemId,
      );
    }
    console.log('[_buildNotificationsStates] notifications', notifications);
    return notifications;
  };

  //// process logout
  const _handleLogout = async () => {
    console.log('[Settings] handle logout');
    await processLogout();
  };
  ////
  const _handleToggleSwitch = async (key: string, value: boolean) => {
    setSwitchStates({...switchStates, [key]: value});
    // firebase user doc ref
    const userRef = firestore().doc(`users/${username}`);

    // actions
    switch (key) {
      case 'dnd':
        // clear dnd times in db if dnd is not set
        if (!value) {
          userRef.update({
            dndTimes: null,
          });
        } else {
          const times = [
            _convertTimeToUTC0(startDNDTime),
            _convertTimeToUTC0(endDNDTime),
          ];
          // update
          userRef.update({
            dndTimes: times,
          });
        }
        break;
      case 'beneficiary':
      case 'reply':
      case 'mention':
      case 'follow':
      case 'transfer':
      case 'vote':
        const notifications = _buildNotificationsStates(key, value);
        if (userRef) {
          // update
          userRef.update({
            pushNotifications: notifications,
          });
        }
        break;
      case 'logout':
        //        _handleLogout();
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

  const SUPPORTED_LANGUAGES = ['EN', 'KO'];

  const _handleDropdownChange = async (index: number, value: string) => {
    console.log('[_handleDropdownChange] index, value', index, value);
    // check supported language
    // distingush translated language and locale
    // when a language changed,
    // first updated ui's language
    setLanguageParam(value.toLowerCase());
    // then, check if the language is supported,
    let _locale = 'en-US';
    if (SUPPORTED_LANGUAGES.includes(value)) {
      // check it is the same as the current language
      if (language.split('-')[0].toUpperCase() !== value) {
        switch (value) {
          case 'KO':
            _locale = 'ko-KR';
            break;
          default:
            break;
        }
        setToastMessage(intl.formatMessage({id: 'Settings.msg_restart'}));
      }
    } else {
      setToastMessage(intl.formatMessage({id: 'Settings.lang_not_supported'}));
    }
    console.log('[_handleDropdownChange] locale', _locale);
    // set locale
    setLocale(_locale);
    // store the locale
    await AsyncStorage.setItem('locale', _locale);
  };

  // convert the timestamp to time
  const _convertTime = (timestamp) => {
    return moment(timestamp).format('hh:mm A');
  };

  // convert the timestamp to time in minutes based on UTC+0
  const _convertTimeToUTC0 = (timestamp) => {
    // time in 2h hour format
    const date = moment(timestamp);
    const hour = date.hour();
    const minutes = date.minutes();
    const time = hour * 60 + minutes + UTC_OFFSET_IN_MINUTES;
    return time;
  };

  const _handleConfirmDNDTime = async (isStart: boolean, timestamp: number) => {
    console.log('[_handleConfirmDNDTime] isStart, time', isStart, timestamp);
    console.log('convert time', _convertTime(timestamp));
    let time1 = null;
    let time2 = null;
    if (isStart) {
      time1 = _convertTimeToUTC0(timestamp);
      time2 = _convertTimeToUTC0(endDNDTime);
      setShowStartClock(false);
      // set time
      setStartDNDTime(timestamp);
      // save the time in storage
      await AsyncStorage.setItem('dnd_start_time', JSON.stringify(timestamp));
    } else {
      time1 = _convertTimeToUTC0(startDNDTime);
      time2 = _convertTimeToUTC0(timestamp);
      setShowEndClock(false);
      // set time
      setEndDNDTime(timestamp);
      // save the time in storage
      await AsyncStorage.setItem('dnd_end_time', JSON.stringify(timestamp));
    }
    //// update db
    // firebase user doc ref
    const userRef = firestore().doc(`users/${username}`);
    console.log('[_handleConfirmDNDTime] usernmae, userRef', username, userRef);
    // check sanity
    if (!userRef) return;
    // convert the timestamp to minutes based on UTC+0
    // concatenate the times
    const times = [time1, time2];
    // update
    userRef.update({
      dndTimes: times,
    });
  };

  const _handleCancelDNDTime = (isStart: boolean) => {
    if (isStart) {
      setShowStartClock(false);
    } else {
      setShowEndClock(false);
    }
  };

  const _renderClockButton = (text: string, handlePressButton: () => void) => {
    return (
      <Block style={styles.rows}>
        <TouchableOpacity onPress={handlePressButton}>
          <Block row middle space="between" style={{paddingTop: 7}}>
            <Text size={14}>{text}</Text>
            <Icon
              name="angle-right"
              family="font-awesome"
              style={{paddingRight: 5}}
            />
          </Block>
        </TouchableOpacity>
      </Block>
    );
  };

  ////
  const _renderItem = ({item}) => {
    //    console.log('[Settings] renderItem. item', item);
    switch (item.type) {
      case 'switch':
        return (
          <Block>
            <Block row middle space="between" style={styles.rows}>
              <Text size={14}>{item.title}</Text>
              <Switch
                onValueChange={(value) => _handleToggleSwitch(item.id, value)}
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
                value={switchStates[item.id]}
              />
            </Block>
            {switchStates['dnd'] && (
              <Block>
                {item.id === 'dnd' ? (
                  <Block card>
                    {_renderClockButton(
                      intl.formatMessage({id: 'Settings.start_clock_header'}) +
                        _convertTime(startDNDTime),
                      () => setShowStartClock(true),
                    )}
                    {_renderClockButton(
                      intl.formatMessage({id: 'Settings.end_clock_header'}) +
                        _convertTime(endDNDTime),
                      () => setShowEndClock(true),
                    )}
                  </Block>
                ) : null}
              </Block>
            )}
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
              defaultText={language.split('-')[0].toUpperCase()}
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

  return showStartClock || showEndClock ? (
    <DNDTimes
      showStartClock={showStartClock}
      showEndClock={showEndClock}
      startTime={startDNDTime}
      endTime={endDNDTime}
      confirmTime={_handleConfirmDNDTime}
      cancelTime={_handleCancelDNDTime}
    />
  ) : (
    <SettingScreen
      languages={uiState.translateLanguages}
      renderItem={_renderItem}
    />
  );
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
