import React, {useState, useEffect, useContext} from 'react';
import Config from 'react-native-config';
import SplashScreen from 'react-native-splash-screen';
import {SignupScreen} from '../screen/Signup';
import {PhoneAuthScreen} from '../screen/PhoneAuth';
import {AccountScreen} from '../screen/Account';

import {OTP} from '~/components';

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

  const _createAccount = async () => {
    console.log('userState global props', userState.globalProps);
    // now create an account
    const _password = await createAccount(
      username,
      Config.CREATOR_ACCOUNT,
      Config.CREATOR_ACTIVE_WIF,
      userState.globalProps.chainProps.account_creation_fee,
    );
    // check sanity
    if (_password) {
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

  const _handleOTPResult = (result: boolean) => {
    console.log('opt result', result);
    // TODO: creat account after user clicks the 'finish' since it takes money
    // generated password first, then display the password
    /// then, user clicks confirm or submit
    // then finally create an account
    if (result) {
      setShowAccountScreen(true);
    }
  };

  return showAccountScreen ? (
    <AccountScreen account={username} password={password} />
  ) : showSignupScreen ? (
    <SignupScreen
      onCreateAccount={_onStartSignup}
      checkUsernameAvailable={_checkUsernameAvailable}
    />
  ) : (
    <OTP usePhoneNumber={true} handleOTPResult={_handleOTPResult} />
  );

  // return showAccountScreen ? (
  //   <AccountScreen account={username} password={password} />
  // ) : showSignupScreen ? (
  //   <SignupScreen
  //     onCreateAccount={_onStartSignup}
  //     checkUsernameAvailable={_checkUsernameAvailable}
  //   />
  // ) : (
  //   <PhoneAuthScreen
  //     onCreateAccount={_onCreateAccount}
  //     signinPhoneNumber={_signinPhoneNumber}
  //   />
  // );
};

export {Signup};
