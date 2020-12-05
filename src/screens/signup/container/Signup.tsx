import React, {useState, useEffect, useContext} from 'react';
import Config from 'react-native-config';
import SplashScreen from 'react-native-splash-screen';
import {SignupScreen} from '../screen/Signup';
import {PhoneAuthScreen} from '../screen/PhoneAuth';
import {AccountScreen} from '../screen/Account';

import auth, {FirebaseAuthTypes, firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import {
  checkUsernameAvailable,
  createAccount,
  getDynamicGlobalProperties,
} from '~/providers/blurt/dblurtApi';

import {navigate} from '~/navigation/service';

// clipboard
import Clipboard from '@react-native-community/clipboard';

import {useIntl} from 'react-intl';
import {UIContext, UserContext} from '~/contexts';

interface Props {}

const Signup = (props: Props): JSX.Element => {
  //// props
  //// contexts
  const {userState} = useContext(UserContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [showSignupScreen, setShowSignupScreen] = useState(true);
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [confirmation, setConfirmation] = useState<
    FirebaseAuthTypes.ConfirmationResult
  >(null);
  const intl = useIntl();

  useEffect(() => {
    SplashScreen.hide();
    setShowSignupScreen(true);
  }, []);

  const _onStartSignup = async (username: string) => {
    setShowSignupScreen(false);
  };

  const _checkUsernameAvailable = async (username: string) => {
    const available = await checkUsernameAvailable(username);
    console.log('account available?', available);
    // set username
    setUsername(username);
    return available;
  };

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

  const _checkNewUser = async () => {
    const user = auth().currentUser;

    console.log('[checkNewUser] user', user);
    const userDoc = await firestore().collection('phones').doc(user.uid).get();
    if (userDoc.exists) {
      console.log('the phone number exists. try another phonenumber');
      return false;
    }
    return true;
  };

  const _onCreateAccount = async (phoneNumber: string, smsCode: string) => {
    // @test
    smsCode = Config.SMS_TEST_CODE;
    console.log('sms code', smsCode);
    let user = null;
    try {
      user = await confirmation.confirm(smsCode);
    } catch (error) {
      console.log('invalid code', error);
      return;
    }
    // check if the user is new
    const newUser = await _checkNewUser();
    if (!newUser) {
      // @todo handle this message
      setToastMessage(intl.formatMessage({id: 'Signup.msg_exists'}));
      return;
    }
    console.log('new user!');

    // //// generate steemit id
    // // check the ACT exists
    // const ACTavailable = await checkClaimedToken(Config.CREATOR_ACCOUNT);
    // console.log('ACT available', ACTavailable);
    // // create ACT in case of no ACT
    // if (!ACTavailable) {
    //   const success = await claimAccountCreationToken(
    //     Config.CREATOR_ACCOUNT,
    //     Config.CREATOR__WIF,
    //   );
    //   console.log('succeeded to create an ACT?', success);
    // }

    console.log('userState global props', userState.globalProps);

    // now create an account
    const password = await createAccount(
      username,
      Config.CREATOR_ACCOUNT,
      Config.CREATOR_ACTIVE_WIF,
      userState.globalProps.chainProps.account_creation_fee,
    );
    // check sanity
    if (password) {
      setPassword(password);
      setShowAccountScreen(true);
      // update phone db
      await addPhonenumberToDB(username, phoneNumber);
    }
  };

  const addPhonenumberToDB = async (username: string, phoneNumber: string) => {
    // get the current user
    const user = auth().currentUser;
    // get user document from phones collection
    const phoneRef = firestore().collection('phones').doc(user.uid);
    const phoneDoc = await phoneRef.get();
    // check user exists
    if (phoneDoc.exists) {
      console.log('phone number exists', phoneDoc);
      return;
    }
    // set phone data
    await phoneRef.set({
      username,
      phoneNumber,
    });
  };

  return showAccountScreen ? (
    <AccountScreen account={username} password={password} />
  ) : showSignupScreen ? (
    <SignupScreen
      onCreateAccount={_onStartSignup}
      checkUsernameAvailable={_checkUsernameAvailable}
    />
  ) : (
    <PhoneAuthScreen
      onCreateAccount={_onCreateAccount}
      signinPhoneNumber={_signinPhoneNumber}
    />
  );
};

export {Signup};
