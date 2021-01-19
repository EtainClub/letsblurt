//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// firebase
import {firebase} from '@react-native-firebase/functions';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
//// navigation
import {useFocusEffect} from '@react-navigation/native';

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
import {acc} from 'react-native-reanimated';

interface Props {}
const Signup = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {userState} = useContext(UserContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [username, setUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [showSignupScreen, setShowSignupScreen] = useState(true);
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);

  useEffect(() => {
    SplashScreen.hide();
    setShowSignupScreen(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // clear modal
      setShowAccountScreen(false);
      setUsernameMsg('');
      setAccountAvailable(false);
      setShowSignupScreen(true);
    }, []),
  );

  // start sign up process
  const _onStartSignup = async () => {
    // check if username is avaliable
    const available = await checkUsernameAvailable(username);
    console.log('username avail?', available);
    setAccountAvailable(available);
    if (available) {
      setUsernameMsg(intl.formatMessage({id: 'Signup.username_available'}));
      // now the username is avaliable, generate masster password
      const _password = generateMasterPassword();
      setPassword(_password);
      setShowSignupScreen(false);
    } else {
      setUsernameMsg(intl.formatMessage({id: 'Signup.username_exists'}));
    }
  };

  const _checkUsernameValid = (_username: string) => {
    if (_username.length < 3) {
      console.log('username must be longer than 3.', _username);
      setUsernameMsg(intl.formatMessage({id: 'Signup.msg_too_short'}));
      return false;
    }
    // long length
    if (_username.length > 16) {
      console.log('username must be shorter than 16.', _username);
      setUsernameMsg(intl.formatMessage({id: 'Signup.msg_too_long'}));
      return false;
    }
    // start with number
    if (_username.match(/^\d/)) {
      console.log('username must not start with a number.', _username);
      setUsernameMsg(intl.formatMessage({id: 'Signup.msg_number'}));
      return false;
    }
    return true;
  };

  const _handleUsernameChange = (text: string) => {
    // set username
    setUsername(text);
    // check username valid
    const valid = _checkUsernameValid(text);
    if (valid) {
      setAccountAvailable(true);
      setUsernameMsg('');
    } else {
      setAccountAvailable(false);
    }
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
      // create a new doc in phones collection (firestore)
      firestore().collection('phones').add({
        username: username,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
      });
    }
  };

  //// check if the given phone number exists in db
  const _checkDuplicatedPhone = async (_phone: string) => {
    // reference to phones collection
    const phonesRef = firestore().collection('phones');
    // query
    let duplicated = false;
    phonesRef
      .where('phoneNumber', '==', _phone)
      .get()
      .then(() => {
        duplicated = true;
      });

    console.log('phone duplicated?', duplicated);
    return duplicated;
  };

  const _handleOTPResult = async (result: boolean, _phoneNumber?: string) => {
    if (_phoneNumber != '') {
      console.log('phoneNumber', _phoneNumber);
      setPhoneNumber(_phoneNumber);
    }
    console.log('opt result', result);

    if (__DEV__ || result) {
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
      username={username}
      usernameMessage={usernameMsg}
      accountAvailable={accountAvailable}
      handleUsernameChange={_handleUsernameChange}
      onContinue={_onStartSignup}
    />
  ) : (
    <OTP
      checkDuplicatedPhone={_checkDuplicatedPhone}
      handleOTPResult={_handleOTPResult}
    />
  );
};

export {Signup};
