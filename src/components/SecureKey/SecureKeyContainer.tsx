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
import {AuthContext} from '~/contexts';
//// views
import {SecureKeyView} from './SecureKeyView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  username: string;
}
const SecureKeyContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  //// effect

  return <SecureKeyView username={props.username} useOTP={true} />;
};

export {SecureKeyContainer};
