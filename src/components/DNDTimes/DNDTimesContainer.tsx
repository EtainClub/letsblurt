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
//// UIs
import {Button, Icon, Block, Input, Text, theme} from 'galio-framework';
import {materialTheme} from '~/constants/materialTheme';
const {height, width} = Dimensions.get('window');
import {argonTheme} from '~/constants';
import {DropdownModal} from '~/components';
import ModalDropdown from 'react-native-modal-dropdown';
//// storage
import AsyncStorage from '@react-native-community/async-storage';
//// contexts
import {AuthContext} from '~/contexts';
//// viewes
import {DNDTimesView} from './DNDTimesView';
//// times
import moment from 'moment';
// start date and time: 1AM
// const DATE1 = new Date(2020, 12, 12, 1, 0, 0);
// // end date and time: 8AM
// const DATE2 = new Date(2020, 12, 12, 8, 0, 0);
// // local time offset in hours from UTC+0
// const UTC_OFFSET_IN_MINUTES = DATE1.getTimezoneOffset();
// // get timestamp of the date1
// const START_TIME = DATE1.getTime();
// // get timestamp of the date2
// const END_TIME = DATE2.getTime();

const UTC_OFFSET_IN_MINUTES = new Date().getTimezoneOffset();

interface Props {
  showStartClock: boolean;
  showEndClock: boolean;
  startTime: number;
  endTime: number;
  confirmTime: (isStart: boolean, time: number) => void;
  cancelTime: (isStart: boolean) => void;
}
const DNDTimesContainer = (props: Props): JSX.Element => {
  //// props
  //// contexts
  //// states
  const [showDND, setShowDND] = useState(false);
  const [showStartClock, setShowStartClock] = useState(props.showStartClock);
  const [startTime, setStartTime] = useState(props.startTime);
  const [showEndClock, setShowEndClock] = useState(props.showEndClock);
  const [endTime, setEndTime] = useState(props.endTime);

  //// effects
  // event: mount
  useEffect(() => {
    _initDNDTimes();
  }, []);

  //// initialize DND times
  const _initDNDTimes = async () => {
    // try to get start time from storage
    const start = await AsyncStorage.getItem('dnd_start_time');
    console.log('[_initDNDTimes] start', start);
    // if exists, then set states
    if (start) {
      // set the state
      setShowDND(true);
      // get end time
      const end = await AsyncStorage.getItem('dnd_end_time');
      console.log('[initSettings] start', JSON.parse(start));
      console.log('[initSettings] end', JSON.parse(end));
      // set the time
      setStartTime(JSON.parse(start));
      setEndTime(JSON.parse(end));
    }
  };

  // convert the timestamp to time
  const convertTime = (timestamp) => {
    return moment(timestamp).format('hh:mm A');
  };

  // convert the timestamp to time in minutes based on UTC+0
  const convertTimeToUTC0 = (timestamp) => {
    // time in 2h hour format
    const date = moment(timestamp);
    const hour = date.hour();
    const minutes = date.minutes();
    const time = hour * 60 + minutes + UTC_OFFSET_IN_MINUTES;
    return time;
  };

  // when a user clicks ok or cancel button on clock
  const _onConfirmTime = async (date: Date, isStart: boolean) => {
    console.log('[__onConfirmTime] date', date);
    // convert the date to timestamp
    const timestamp = date.getTime();
    // set current time
    if (isStart) {
      // hide
      setShowStartClock(false);
      // set time
      setStartTime(timestamp);
    } else {
      // hide
      setShowEndClock(false);
      // set time
      setEndTime(timestamp);
    }
    //// return the resulting times
    console.log('[_onConfirmTime]');
    props.confirmTime(isStart, timestamp);
  };

  //// cancel time setting
  const _onCancelTime = (isStart: boolean) => {
    if (isStart) {
      // hide clock
      setShowStartClock(false);
    } else {
      setShowEndClock(false);
    }
    // return
    props.cancelTime(isStart);
  };

  return (
    <DNDTimesView
      showStartClock={showStartClock}
      startTime={startTime}
      showEndClock={showEndClock}
      endTime={endTime}
      onConfirmTime={_onConfirmTime}
      onCancelTime={_onCancelTime}
    />
  );
};

export {DNDTimesContainer};
