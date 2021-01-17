//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {Platform} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';

//// firebase
import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
////
import {Country, CountryCode} from '~/screens/signup/screen/types';
////
import {OTPView} from './OTPView';
import {UIContext} from '~/contexts';
//// constants
const countryData = require('react-native-country-picker-modal/lib/assets/data/countries-emoji.json');

interface Props {
  handleOTPResult: (confirm: boolean, phoneNumber?: string) => void;
}
const OTPContainer = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSMSCode] = useState('');
  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('KR');
  const [withFlag, setWithFlag] = useState<boolean>(true);
  const [country, setCountry] = useState<Country>(null);
  const [smsRequested, setSMSRequested] = useState(false);
  const [guideMessage, setGuideMessage] = useState('');

  //////// events
  //// event: mount
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
    setGuideMessage(intl.formatMessage({id: 'Signup.phonenumber_guide'}));
  }, []);

  //// handle phone number change
  const _handlePhoneNumberChange = (_phoneNumber: string) => {
    setPhoneNumber(_phoneNumber);
  };

  //// handle sms code change
  const _handleSMSCodeChange = (_code: string) => {
    setSMSCode(_code);
  };

  //// handle country change
  const _handleCountryChange = (country: Country) => {
    console.log('country', country);
    setCountry(country);
    setCountryCode(country.cca2);
  };

  //// send sms code
  const _sendSMSCode = async (_phoneNumber: string) => {
    // set code requested flag
    setSMSRequested(true);
    // clear guide message
    setGuideMessage('');
    // build phone number including the country code
    const phone = '+' + country.callingCode[0] + phoneNumber;
    // check sanity of the phone number
    const valid = _validatePhoneNumber(_phoneNumber);
    if (!valid) {
      setToastMessage(intl.formatMessage({id: 'Signup.invalid_phonenumber'}));
      return;
    }
    // set phone number
    setPhoneNumber(_phoneNumber);
    // verify phone auth of firebase and send sms code
    auth()
      .verifyPhoneNumber(_phoneNumber)
      .on(
        'state_changed',
        (phoneAuthSnapshot) => {
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT:
              console.log('[_verifyPhoneNumber] code sent');
              setToastMessage(intl.formatMessage({id: 'Signup.code_sent'}));
              break;
            case firebase.auth.PhoneAuthState.ERROR: // or 'error'
              console.log('verification error');
              setToastMessage(
                intl.formatMessage({id: 'Signup.verification_error'}),
              );
              console.log(phoneAuthSnapshot.error);
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
              // auto verified means the code has also been automatically confirmed as correct/received
              // phoneAuthSnapshot.code will contain the auto verified sms code - no need to ask the user for input.
              console.log('auto verified on android');
              console.log(phoneAuthSnapshot);
              // set sms code
              setSMSCode(phoneAuthSnapshot.code);
          }
        },
        (error) => {
          console.log('failed to verify phone number', error);
          setToastMessage(
            intl.formatMessage({id: 'Signup.verification_error'}),
          );
        },
      );
  };

  //// check sanity of the phone number
  const _validatePhoneNumber = (_phoneNumber: string): boolean => {
    let regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(_phoneNumber);
  };

  //// verify SMS Code
  const _verifySMSCode = async () => {
    // @test
    //    smsCode = Config.SMS_TEST_CODE;
    console.log('sms code', smsCode);
    // handle android auto login
    if (Platform.OS === 'android') {
      const valid = smsCode === smsCode ? true : false;
      props.handleOTPResult(valid, phoneNumber);
      return true;
    }
    let user = null;
    try {
      user = await confirmation.confirm(smsCode);
      console.log('[_confirmOTP] user', user);
      // send back the result
      props.handleOTPResult(true, phoneNumber);
      return true;
    } catch (error) {
      console.log('invalid code', error);
      // send back the result
      props.handleOTPResult(false, phoneNumber);
      return false;
    }
  };

  ///// cancle the modal
  const _handleCancelModal = () => {
    setShowModal(false);
  };

  return (
    <OTPView
      showModal={showModal}
      phoneNumber={phoneNumber}
      smsCode={smsCode}
      countryCode={countryCode}
      guideMessage={guideMessage}
      loading={loading}
      smsRequested={smsRequested}
      handlePhoneNumberChange={_handlePhoneNumberChange}
      handleSMSCodeChange={_handleSMSCodeChange}
      onCountrySelect={_handleCountryChange}
      sendSMSCode={_sendSMSCode}
      verifySMSCode={_verifySMSCode}
      handleCancelModal={_handleCancelModal}
    />
  );
};

export {OTPContainer};
