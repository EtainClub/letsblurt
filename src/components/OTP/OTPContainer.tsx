//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {Platform} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';

import {OTPView} from './OTPView';

interface Props {
  phoneNumber: string;
  handleOTPResult: (confirm: boolean, phoneNumber?: string) => void;
}
const OTPContainer = (props: Props): JSX.Element => {
  //// props
  //// states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSMSCode] = useState('');
  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);
  //// effect
  useEffect(() => {
    // if the phone number is given
    if (props.phoneNumber) {
      // phone auth
      _verifyPhoneNumber(props.phoneNumber);
    }
  }, []);

  const _verifyPhoneNumber = async (_phoneNumber: string) => {
    const valid = _validatePhoneNumber(_phoneNumber);
    if (!valid) return null;
    // set phone number
    setPhoneNumber(_phoneNumber);
    // process phone auth
    auth()
      .verifyPhoneNumber(_phoneNumber)
      .on(
        'state_changed',
        (phoneAuthSnapshot) => {
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT:
              console.log('[_verifyPhoneNumber] code sent');
              break;
            case firebase.auth.PhoneAuthState.ERROR: // or 'error'
              console.log('verification error');
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
        },
      );
  };

  const _validatePhoneNumber = (_phoneNumber: string): boolean => {
    let regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(_phoneNumber);
  };

  const _signinPhoneNumber = async (_phoneNumber: string) => {
    console.log('phone number', _phoneNumber);

    const valid = _validatePhoneNumber(_phoneNumber);
    if (!valid) {
      console.log(
        '[signinPhoneNumber] phone number is not valid',
        _phoneNumber,
      );
      return;
    }
    // setup language
    //    auth().languageCode = 'en';

    const confirmation = await auth().signInWithPhoneNumber(_phoneNumber);
    console.log('[_signinPhoneNumber] confirmation', confirmation);
    // set confirmation
    setConfirmation(confirmation);
    // set phone number
    setPhoneNumber(_phoneNumber);
  };

  const _confirmOTP = async (_smsCode: string) => {
    // @test
    //    smsCode = Config.SMS_TEST_CODE;
    console.log('sms code', _smsCode);
    // handle android auto login
    if (Platform.OS === 'android') {
      const valid = smsCode === _smsCode ? true : false;
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

  return (
    <OTPView
      usePhoneNumberForm={props.phoneNumber ? false : true}
      smsCode={smsCode}
      verifyPhoneNumber={_verifyPhoneNumber}
      confirmOTP={_confirmOTP}
    />
  );
};

export {OTPContainer};
