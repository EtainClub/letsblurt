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
import AsyncStorage from '@react-native-community/async-storage';
//// contexts
import {AuthContext} from '~/contexts';
//// times
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Props {
  showStartClock: boolean;
  startTime: number;
  showEndClock: boolean;
  endTime: number;
  onConfirmTime: (date: Date, isStart: boolean) => void;
  onCancelTime: (isStart: boolean) => void;
}
const DNDTimesView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();

  // render a clock
  const renderClock = (isStart: boolean) => {
    return (
      <DateTimePickerModal
        headerTextIOS={
          isStart
            ? intl.formatMessage({id: 'Settings.start_clock_header'})
            : intl.formatMessage({id: 'Settings.end_clock_header'})
        }
        isVisible={isStart ? props.showStartClock : props.showEndClock}
        mode="time"
        onConfirm={(date: Date) => props.onConfirmTime(date, isStart)}
        onCancel={() => props.onCancelTime(isStart)}
        cancelTextIOS={intl.formatMessage({id: 'cancel'})}
        confirmTextIOS={intl.formatMessage({id: 'confirm'})}
      />
    );
  };

  return (
    <Block>
      {renderClock(true)}
      {renderClock(false)}
    </Block>
  );
};

export {DNDTimesView};
