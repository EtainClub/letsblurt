//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {View} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// blockchain
import {verifyPassoword} from '~/providers/blurt/dblurtApi';
//// context
import {AuthContext, UserContext, SettingsContext} from '~/contexts';
//// components
import {OTP} from '~/components';
//// views
import {SecureKeyView} from './SecureKeyView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  username: string;
  requiredKeyType: KeyTypes;
  handleResult: (result: boolean, password: string) => void;
  cancelProcess: () => void;
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
  const [showModal, setShowModal] = useState(true);

  //// effect

  //// update password
  const _handlePasswordChange = (_password: string) => {
    setPassword(_password);
  };

  ////
  const _handlePressConfirm = async () => {
    const {username} = authState.currentCredentials;
    // check password
    const {keyType} = await verifyPassoword(username, password);
    // check key type
    if (keyType && keyType >= props.requiredKeyType) {
      if (settingsState.securities.useOTP) {
        setShowOTP(true);
        return;
      }
      // clear message
      setMessage('');
      // send back the result
      props.handleResult(true, password);
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

  const _cancelModal = () => {
    setShowModal(false);
    // cancel process
    props.cancelProcess();
  };

  return (
    <View>
      <SecureKeyView
        username={props.username}
        message={message}
        showModal={showModal}
        handlePasswordChange={_handlePasswordChange}
        handlePressConfirm={_handlePressConfirm}
        cancelModal={_cancelModal}
      />
      {showOTP && <OTP handleOTPResult={_handleOTPResult} />}
    </View>
  );
};

export {SecureKeyContainer};
