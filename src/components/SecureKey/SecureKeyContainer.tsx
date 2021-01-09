//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
//// blockchain
import {
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
}
const SecureKeyContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  //// effect
  ////
  const _handleOTPResult = (result: boolean) => {
    console.log('_handleOTPResult. result', result);
  };
  return (
    <SecureKeyView
      username={props.username}
      useOTP={settingsState.securities.useOTP}
      phoneNumber={userState.phoneNumber}
      handleOTPResult={_handleOTPResult}
    />
  );
};

export {SecureKeyContainer};
