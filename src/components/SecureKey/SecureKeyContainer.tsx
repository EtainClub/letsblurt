//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
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
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  //// effect
  ////
  const _handlePressConfirm = async (_password: string) => {
    const {username} = authState.currentCredentials;
    // check password
    const {keyType} = await verifyPassoword(username, _password);
    // check key type
    let result = false;
    if (keyType >= props.requiredKeyType) {
      result = true;
    }
    // send back the result
    props.handleResult(result, _password);
  };
  ////
  const _handleOTPResult = (result: boolean) => {
    console.log('_handleOTPResult. result', result);
  };

  return (
    <SecureKeyView
      username={props.username}
      useOTP={settingsState.securities.useOTP}
      phoneNumber={userState.phoneNumber}
      handlePressConfirm={_handlePressConfirm}
      handleOTPResult={_handleOTPResult}
    />
  );
};

export {SecureKeyContainer};
