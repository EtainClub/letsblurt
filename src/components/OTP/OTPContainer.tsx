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
}
const OTPContainer = (props: Props): JSX.Element => {
  //// props
  //// states
  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);

  const _validatePhoneNumber = (phoneNumber: string): boolean => {
    let regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(phoneNumber);
  };

  const _signinPhoneNumber = async (phoneNumber: string) => {
    console.log('phone number', phoneNumber);

    const valid = _validatePhoneNumber(phoneNumber);
    if (!valid) {
      console.log('[signinPhoneNumber] phone number is not valid', phoneNumber);
      return;
    }
    // setup language
    //    auth().languageCode = 'en';

    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    console.log('[_signinPhoneNumber] confirmation', confirmation);
    // set confirmation
    setConfirmation(confirmation);
  };

  const _confirmOTP = async (smsCode: string) => {
    // @test
    smsCode = Config.SMS_TEST_CODE;
    console.log('sms code', smsCode);
    let user = null;
    try {
      user = await confirmation.confirm(smsCode);
      console.log('[_confirmOTP] user', user);
      return true;
    } catch (error) {
      console.log('invalid code', error);
      return false;
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
