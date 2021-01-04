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
  //// effect

  ////
  const _hanldeTokenTransfer = async (
    recipient: string,
    amount: string,
    memo?: string,
  ) => {
    // return if not logged in
    if (!authState.loggedIn) return;
    const {username, password, type} = authState.currentCredentials;
    // check the key level
    if (type < KeyTypes.ACTIVE) {
      // show key input modal
      setShowSecureKey(true);
      return;
    }
    //// good to go
    // build params
    const _params = {
      to: recipient,
      amount: amount,
      memo: memo,
    };
    // transfer
    const resultCode = await transferToken(username, password, _params);
    console.log('_hanldeTokenTransfer. resultCode', resultCode);
    // TODO: handle the result
  };

  return showSecureKey ? (
    <SecureKey username={props.username} />
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
