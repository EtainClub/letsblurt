//// react
import React, {useState, useEffect} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
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
import {Country, CountryCode} from './types';

import LinearGradient from 'react-native-linear-gradient';
import {materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';

const {width, height} = Dimensions.get('window');

const countryData = require('react-native-country-picker-modal/lib/assets/data/countries-emoji.json');

interface Props {
  usePhoneNumberForm: boolean;
  signinPhoneNumber(phoneNumber: string): Promise<void>;
  confirmOTP(smsCode: string): Promise<boolean>;
}
const OTPView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [smsCode, setSMSCode] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('KR');
  const [withFlag, setWithFlag] = useState<boolean>(true);
  const [country, setCountry] = useState<Country>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsRequested, setSMSRequested] = useState(false);
  const [message, setMessage] = useState('');

  //// events
  useEffect(() => {
    if (props.usePhoneNumberForm) {
      console.log('countryData', countryData);

      // get device country based on language setting not based on timezone
      console.log('locale', intl.locale);
      const code = intl.locale.split('-')[1];
      console.log('code', code);

      console.log('country', countryData[code]);
      setCountry(countryData[code]);
      // set country code
      setCountryCode(code);
      console.log('country code', code);

      // message
      setMessage(intl.formatMessage({id: 'Signup.phonenumber_guide'}));
    } else {
      // login process stated with the given number
      // so otp code is requested
      setSMSRequested(true);
    }
  }, []);

  const _handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
  };

  const _handleSMSCodeChange = (value: string) => {
    setSMSCode(value);
  };

  const _onCountrySelect = (country: Country) => {
    console.log('country', country);
    setCountry(country);
    setCountryCode(country.cca2);
  };

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
            onSelect={(country) => {
              _onCountrySelect(country);
            }}
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
              help={<Text>{message}</Text>}
              bottomHelp
              style={styles.input}
              type="number-pad"
              onChangeText={(text) => _handlePhoneNumberChange(text)}
            />
          </Block>
        </Block>
        <Block style={{marginTop: 20}}>
          <Button
            size="small"
            shadowless
            color={materialTheme.COLORS.BUTTON_COLOR}
            onPress={() => _onSendSMS()}>
            {intl.formatMessage({id: 'OTP.phone_button'})}
          </Button>
        </Block>
      </Block>
    );
  };

  // handle creation of a new account
  const _onSendSMS = async () => {
    setSMSRequested(true);
    setMessage('');
    const phone = '+' + country.callingCode[0] + phoneNumber;
    // @test test phone number
    //    const phone = Config.TEST_PHONE_NUMBER;
    // process sign in
    props.signinPhoneNumber(phone);
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
            onChangeText={(text) => _handleSMSCodeChange(text)}
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
            onPress={() => props.confirmOTP(smsCode)}>
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
      onBackdropPress={() => setShowModal(false)}>
      <Block card center style={styles.modalContainer}>
        <Text
          style={{
            borderBottomColor: 'red',
            borderBottomWidth: 5,
          }}>
          {intl.formatMessage({id: 'OTP.header'})}
        </Text>
        {props.usePhoneNumberForm ? _renderPhoneInput() : null}
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
