//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// blockchain
import {
  verifyPassoword,
  transferToken,
  TransactionReturnCodes,
} from '~/providers/blurt/dblurtApi';
//// context
import {AuthContext, UserContext, SettingsContext} from '~/contexts';
//// views
import {SecureKeyView} from './SecureKeyView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  username: string;
  requiredKeyType: KeyTypes;
  handleResult: (result: boolean, password: string) => void;
}
const SecureKeyContainer = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  //// effect
  ////
  const _handlePressConfirm = async (_password: string) => {
    const {username} = authState.currentCredentials;
    // check password
    const {keyType} = await verifyPassoword(username, _password);
    // check key type
    if (keyType && keyType >= props.requiredKeyType) {
      // update the password
      setPassword(_password);
      // TODO: handle OTP here
      if (settingsState.securities.useOTP) {
        setShowOTP(true);
        return;
      }
      // clear message
      setMessage('');
      // send back the result
      props.handleResult(true, _password);
    } else {
      // show message
      setMessage(intl.formatMessage({id: 'Transaction.need_higher_password'}));
    }
  };
  ////
  const _handleOTPResult = (result: boolean) => {
    console.log('_handleOTPResult. result', result);
    if (result) {
      // send back the result
      props.handleResult(true, password);
    }
    if (!result) {
      // show error
      setMessage(intl.formatMessage({id: 'Transaction.need_higher_password'}));
    }
  };

  return (
    <SecureKeyView
      username={props.username}
      showOTP={showOTP}
      phoneNumber={userState.phoneNumber}
      message={message}
      handlePressConfirm={_handlePressConfirm}
      handleOTPResult={_handleOTPResult}
    />
  );
};

export {SecureKeyContainer};
