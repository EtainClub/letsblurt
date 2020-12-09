//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';

import {OTPView} from './OTPView';

interface Props {
  usePhoneNumber: boolean;
  handleOTPResult: (confirm: boolean, phoneNumber?: string) => void;
}
const OTPContainer = (props: Props): JSX.Element => {
  //// props
  //// states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);

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

  const _confirmOTP = async (smsCode: string) => {
    // @test
    smsCode = Config.SMS_TEST_CODE;
    console.log('sms code', smsCode);
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
      props.handleOTPResult(false);
    }
  };

  return (
    <OTPView
      usePhoneNumber={props.usePhoneNumber}
      signinPhoneNumber={_signinPhoneNumber}
      confirmOTP={_confirmOTP}
    />
  );
};

export {OTPContainer};
