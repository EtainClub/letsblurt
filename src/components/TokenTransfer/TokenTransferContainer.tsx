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
import {SecureKey} from '~/components';
import {TokenTransferView} from './TokenTransferView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  username: string;
  title: string;
  followings: string[];
  balance: string;
}
const TokenTransferContainer = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  const [showSecureKey, setShowSecureKey] = useState(false);
  const [params, setParams] = useState(null);
  const [transferring, setTransferring] = useState(false);
  //// effect

  ////
  const _hanldeTokenTransfer = async (
    recipient: string,
    amount: number,
    memo?: string,
  ) => {
    const {username, password, type} = authState.currentCredentials;
    // check sanity
    if (!authState.loggedIn || type < 0) return;
    // build transfer params
    const _amount = amount.toFixed(3);
    const _params = {
      to: recipient,
      amount: _amount + ' BLURT',
      memo: memo,
    };
    // update state
    setParams(_params);
    // check the key level
    if (type < KeyTypes.ACTIVE) {
      // show key input modal
      setShowSecureKey(true);
      return;
    }
    //// good to go
    // transfer
    const resultCode = await transferToken(username, password, _params);
    console.log('_hanldeTokenTransfer. resultCode', resultCode);
    // TODO: handle the result
  };

  ////
  const _handleSecureKeyResult = (result: boolean, _password: string) => {
    console.log('_handleSecureKeyResult. result', result);
    if (result) {
      // execute the transfer
      _transferToken(_password);
    }
    // hide the secure key
    setShowSecureKey(false);
  };

  ////
  const _transferToken = async (_password: string) => {
    const {username} = authState.currentCredentials;
    // transfer
    const resultCode = await transferToken(username, _password, params);
    console.log('_hanldeTokenTransfer. resultCode', resultCode);
  };

  return showSecureKey ? (
    <SecureKey
      username={props.username}
      requiredKeyType={KeyTypes.ACTIVE}
      handleResult={_handleSecureKeyResult}
    />
  ) : (
    <TokenTransferView
      username={props.username}
      title={props.title}
      followings={props.followings}
      balance={props.balance}
      transferToken={_hanldeTokenTransfer}
    />
  );
};

export {TokenTransferContainer};
