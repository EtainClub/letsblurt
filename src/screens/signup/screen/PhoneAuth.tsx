import React, {useState, useEffect} from 'react';

import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';

import {FirebaseAuthTypes} from '@react-native-firebase/auth';

// country code
import * as RNLocalize from 'react-native-localize';
import CountryPicker, {DARK_THEME} from 'react-native-country-picker-modal';
import {Country, CountryCode} from './types';

import LinearGradient from 'react-native-linear-gradient';
import {materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';

import {useIntl} from 'react-intl';

const {width, height} = Dimensions.get('window');

const countryData = require('react-native-country-picker-modal/lib/assets/data/countries-emoji.json');

interface Props {
  signinPhoneNumber(phoneNumber: string): Promise<void>;
  onCreateAccount(phoneNumber: string, smsCode: string);
}

const PhoneAuthScreen = (props: Props): JSX.Element => {
  const intl = useIntl();

  const [loading, setLoading] = useState(false);
  const [smsCode, setSMSCode] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('KR');
  const [withFlag, setWithFlag] = useState<boolean>(true);
  const [country, setCountry] = useState<Country>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsRequested, setSMSRequested] = useState(false);
  const [message, setMessage] = useState('');
  const [authConfirm, setAuthConfirm] = useState(null);

  useEffect(() => {
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
    setMessage(intl.formatMessage({id: 'Signup.phonenumber-guide'}));
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
      <Block flex middle>
        <Block style={{marginBottom: height * 0.05}}></Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 0.625,
            paddingHorizontal: 50,
          }}>
          <Text color="#fff" center size={theme.SIZES.FONT * 1.475}>
            {intl.formatMessage({id: 'Signup.header'})}
          </Text>
          <Text color="orange" center size={theme.SIZES.FONT * 0.875}>
            {intl.formatMessage({id: 'Signup.phone-guide'})}
          </Text>
        </Block>
        <Block flex={1} center space="around">
          <Block center row>
            <Block flex={2} style={{marginLeft: 25, marginBottom: 15}}>
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
            </Block>
            <Block flex={8}>
              <Input
                bgColor="transparent"
                placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                borderless
                family="antdesign"
                color="white"
                placeholder={intl.formatMessage({id: 'Signup.phone-number'})}
                value={phoneNumber.replace(/\-/g, '')}
                autoCapitalize="none"
                help={<Text>{message}</Text>}
                bottomHelp
                style={styles.inputPhone}
                type="number-pad"
                onChangeText={(text) => _handlePhoneNumberChange(text)}
              />
            </Block>
          </Block>
          <Block flex style={{marginTop: 20}}>
            <Button
              shadowless
              style={styles.button}
              color={materialTheme.COLORS.BUTTON_COLOR}
              onPress={() => _onSendSMS()}>
              {intl.formatMessage({id: 'Signup.phone-button'})}
            </Button>
          </Block>
        </Block>
      </Block>
    );
  };

  // handle creation of a new account
  const _onSendSMS = async () => {
    setSMSRequested(true);
    setMessage('');
    // const phone = '+' + country.callingCode[0] + phoneNumber;
    // @test test phone number
    const phone = '+16505559898';
    // process sign in
    props.signinPhoneNumber(phone);
  };

  const _renderSMSInput = () => {
    // urls
    let termsUrl = 'https://etain.club/terms-ko';
    let privacyUrl = 'https://etain.club/privacy-ko';
    if (intl.locale == 'en') {
      termsUrl = 'https://etain.club/terms-en';
      privacyUrl = 'https://etain.club/privacy-en';
    }

    return (
      <Block flex middle>
        <Block style={{marginBottom: height * 0.05}}></Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 0.625,
            paddingHorizontal: 50,
          }}>
          <Text color="#fff" center size={theme.SIZES.FONT * 1.475}>
            {intl.formatMessage({id: 'Signup.header'})}
          </Text>
          <Text color="orange" center size={theme.SIZES.FONT * 0.875}>
            {intl.formatMessage({id: 'Signup.sms-guide'})}
          </Text>
        </Block>

        <Block flex center space="between">
          <Block center>
            <Input
              bgColor="transparent"
              placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
              borderless
              family="antdesign"
              color="white"
              placeholder={intl.formatMessage({id: 'Signup.SMS-code'})}
              value={smsCode}
              help={<Text style={{color: 'red'}}>{message}</Text>}
              bottomHelp
              autoCapitalize="none"
              style={styles.input}
              type="number-pad"
              onChangeText={(text) => _handleSMSCodeChange(text)}
            />
          </Block>
          <Block row center>
            <TouchableOpacity onPress={() => Linking.openURL(termsUrl)}>
              <Text style={{fontSize: 18, color: 'blue'}}>
                {intl.formatMessage({id: 'Signup.terms'})}
              </Text>
            </TouchableOpacity>
            <Text style={{fontSize: 16, marginHorizontal: 10}}>
              {intl.formatMessage({id: 'and'})}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(privacyUrl)}>
              <Text style={{fontSize: 18, color: 'blue'}}>
                {intl.formatMessage({id: 'Signup.privacyPolicy'})}
              </Text>
            </TouchableOpacity>
          </Block>
          <Block flex center style={{marginTop: 20}}>
            <Button
              shadowless
              loading={loading}
              style={styles.button}
              color={materialTheme.COLORS.BUTTON_COLOR}
              onPress={() => props.onCreateAccount(phoneNumber, smsCode)}>
              {intl.formatMessage({id: 'Signup.button'})}
            </Button>
          </Block>
        </Block>
      </Block>
    );
  };

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signup, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      {smsRequested ? _renderSMSInput() : _renderPhoneInput()}
    </LinearGradient>
  );
};

export {PhoneAuthScreen};

const styles = StyleSheet.create({
  signup: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight + 70 : 0,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
  },
  inputPhone: {
    width: width * 0.6,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
  input: {
    width: width * 0.6,
    alignSelf: 'center',
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
  inputActive: {
    borderBottomColor: 'white',
  },
});
