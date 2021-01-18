//// react
import React, {useState, useEffect} from 'react';
//// react native
import {View, StyleSheet, Dimensions} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import Modal from 'react-native-modal';
import {argonTheme} from '~/constants';
// country code
import * as RNLocalize from 'react-native-localize';
import CountryPicker, {DARK_THEME} from 'react-native-country-picker-modal';
import {Country, CountryCode} from '~/screens/signup/screen/types';
import {materialTheme} from '~/constants/';

const {width, height} = Dimensions.get('window');

interface Props {
  showModal: boolean;
  phoneNumber: string;
  countryCode: CountryCode;
  smsCode?: string;
  guideMessage: string;
  loading: boolean;
  smsRequested: boolean;
  handlePhoneNumberChange: (phoneNumber: string) => void;
  handleSMSCodeChange: (code: string) => void;
  onCountrySelect: (country: Country) => void;
  sendSMSCode: () => void;
  verifySMSCode: () => void;
  handleCancelModal: () => void;
}
const OTPView = (props: Props): JSX.Element => {
  //// props
  const {
    showModal,
    phoneNumber,
    smsCode,
    countryCode,
    guideMessage,
    loading,
    smsRequested,
  } = props;
  //// language
  const intl = useIntl();

  //////// functions
  const _renderPhoneInput = () => {
    return (
      <Block card center style={styles.itemContainer}>
        <Block center row>
          <CountryPicker
            theme={DARK_THEME}
            countryCode={countryCode}
            withFlag
            withFilter
            withAlphaFilter
            withCallingCode
            withCallingCodeButton
            onSelect={props.onCountrySelect}
          />
          <Block>
            <Input
              bgColor="transparent"
              placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
              borderless
              family="antdesign"
              color="black"
              placeholder={intl.formatMessage({id: 'OTP.phone_number'})}
              value={phoneNumber.replace(/\-/g, '')}
              autoCapitalize="none"
              help={<Text>{guideMessage}</Text>}
              bottomHelp
              style={styles.input}
              type="number-pad"
              onChangeText={props.handlePhoneNumberChange}
            />
          </Block>
        </Block>
        <Block style={{marginTop: 20}}>
          <Button
            size="small"
            shadowless
            color={materialTheme.COLORS.BUTTON_COLOR}
            onPress={props.sendSMSCode}>
            {intl.formatMessage({id: 'OTP.phone_button'})}
          </Button>
        </Block>
      </Block>
    );
  };

  const _renderSMSInput = () => {
    return (
      <Block card style={styles.itemContainer}>
        <Block>
          <Input
            bgColor="transparent"
            placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
            borderless
            family="antdesign"
            color="black"
            placeholder={intl.formatMessage({id: 'OTP.SMS_code'})}
            value={smsCode}
            bottomHelp
            autoCapitalize="none"
            style={styles.input}
            type="number-pad"
            onChangeText={props.handleSMSCodeChange}
          />
        </Block>
        <Block center style={{marginTop: 20}}>
          <Button
            size="small"
            shadowless
            disabled={!smsRequested}
            loading={loading}
            color={
              smsRequested
                ? materialTheme.COLORS.BUTTON_COLOR
                : materialTheme.COLORS.MUTED
            }
            onPress={props.verifySMSCode}>
            {intl.formatMessage({id: 'OTP.confirm_button'})}
          </Button>
        </Block>
      </Block>
    );
  };

  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={props.handleCancelModal}>
      <Block card center style={styles.modalContainer}>
        <Text
          style={{
            borderBottomColor: 'red',
            borderBottomWidth: 5,
          }}>
          {intl.formatMessage({id: 'OTP.header'})}
        </Text>
        {_renderPhoneInput()}
        {_renderSMSInput()}
      </Block>
    </Modal>
  );
};

export {OTPView};

const styles = StyleSheet.create({
  modalContainer: {
    width: '90%',
    height: 'auto',
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  itemContainer: {
    width: width * 0.6,
    margin: 10,
  },
  input: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
});
