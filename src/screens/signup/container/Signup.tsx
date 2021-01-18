//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// firebase
import {firebase} from '@react-native-firebase/functions';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import SplashScreen from 'react-native-splash-screen';
import {SignupScreen} from '../screen/Signup';
import {PhoneAuthScreen} from '../screen/PhoneAuth';
import {AccountScreen} from '../screen/Account';

import {OTP} from '~/components';

import {
  checkUsernameAvailable,
  createAccount,
  generateMasterPassword,
  getDynamicGlobalProperties,
} from '~/providers/blurt/dblurtApi';

//// contexts
import {UIContext, UserContext} from '~/contexts';

interface Props {}
const Signup = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {userState} = useContext(UserContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [showSignupScreen, setShowSignupScreen] = useState(true);
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);

  useEffect(() => {
    SplashScreen.hide();
    setShowSignupScreen(true);
  }, []);

  const _onStartSignup = async (username: string) => {
    // generate masster password
    const _password = generateMasterPassword();
    setPassword(_password);
    setShowSignupScreen(false);
  };

  const _checkUsernameAvailable = async (username: string) => {
    const available = await checkUsernameAvailable(username);
    console.log('account available?', available);
    // set username
    setUsername(username);
    return available;
  };

  const _createAccount = async () => {
    console.log('userState global props', userState.globalProps);
    const options = {
      username,
      password,
      creationFee: userState.globalProps.chainProps.account_creation_fee,
    };
    const result = await firebase
      .functions()
      .httpsCallable('createAccountRequest')(options);

    console.log('_createAccount. result', result);
    // check sanity
    if (result) {
      // update phone db
      await addPhonenumberToDB(username, phoneNumber);
    }
  };

  // TODO: make the phone number as doc.id
  const addPhonenumberToDB = async (username: string, phoneNumber: string) => {
    // // get the current user
    // const user = auth().currentUser;
    // // get user document from phones collection
    // const phoneRef = firestore().collection('phones').doc(user.uid);
    // const phoneDoc = await phoneRef.get();
    // // check user exists
    // if (phoneDoc.exists) {
    //   console.log('phone number exists', phoneDoc);
    //   return;
    // }
    // // set phone data
    // await phoneRef.set({
    //   username,
    //   phoneNumber,
    // });
  };

  const _handleOTPResult = async (result: boolean, _phoneNumber?: string) => {
    if (_phoneNumber != '') {
      console.log('phoneNumber', _phoneNumber);
      setPhoneNumber(_phoneNumber);
    }
    console.log('opt result', result);

    if (__DEV__ || result) {
      // TODO: check duplicated phone number in firebase phones db
      // if not duplicated, then create an account
      // setToastMessage(intl.formatMessage({id: 'Signup.duplicated_phone'}));

      setShowAccountScreen(true);
    } else {
      setToastMessage(intl.formatMessage({id: 'Signup.otp_error'}));
    }
  };

  return showAccountScreen ? (
    <AccountScreen
      account={username}
      password={password}
      createAccount={_createAccount}
    />
  ) : showSignupScreen ? (
    <SignupScreen
      onCreateAccount={_onStartSignup}
      checkUsernameAvailable={_checkUsernameAvailable}
    />
  ) : (
    <OTP handleOTPResult={_handleOTPResult} />
  );
};

export {Signup};
