//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// blockchain
import {
  transferToken,
  TransactionReturnCodes,
} from '~/providers/blurt/dblurtApi';
//// context
import {AuthContext, UIContext} from '~/contexts';
//// views
import {SecureKey} from '~/components';
import {TokenTransferView} from './TokenTransferView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  title: string;
  followings: string[];
  balance: string;
  callback: () => void;
}
const TokenTransferContainer = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {setToastMessage} = useContext(UIContext);
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
    _transferToken(password, _params);
  };

  ////
  const _handleSecureKeyResult = (result: boolean, _password: string) => {
    console.log('_handleSecureKeyResult. result', result);
    if (result) {
      // execute the transfer
      _transferToken(_password, params);
      // hide the secure key
      setShowSecureKey(false);
      return;
    }
    // show message
    setToastMessage(intl.formatMessage({id: 'TokenTransfer.need_higher_key'}));
  };

  ////
  const _transferToken = async (_password: string, _param: any) => {
    // set loading
    setTransferring(true);
    const {username} = authState.currentCredentials;
    // transfer
    const resultCode = await transferToken(username, _password, params);
    //// show toast message
    // toast message
    let message = '';
    switch (resultCode) {
      case TransactionReturnCodes.INVALID_PASSWORD:
        message = intl.formatMessage({id: 'TokenTransfer.invalid_pass'});
        break;
      case TransactionReturnCodes.NEED_HIGHER_PASSWORD:
        message = intl.formatMessage({id: 'TokenTransfer.need_higher_key'});
        break;
      case TransactionReturnCodes.TRANSACTION_ERROR:
        message = intl.formatMessage({id: 'TokenTransfer.fail'});
        break;
      case TransactionReturnCodes.TRANSACTION_SUCCESS:
        message = intl.formatMessage({id: 'TokenTransfer.success'});
        break;
      default:
        message = intl.formatMessage({id: 'TokenTransfer.error'});
        break;
    }
    // show the message
    setToastMessage(message);

    // clear loading
    setTransferring(false);
    console.log('_hanldeTokenTransfer. resultCode', resultCode);

    // close the token modal
    props.callback();
  };

  return showSecureKey ? (
    <SecureKey
      username={authState.currentCredentials.username}
      requiredKeyType={KeyTypes.ACTIVE}
      handleResult={_handleSecureKeyResult}
    />
  ) : (
    <TokenTransferView
      username={authState.currentCredentials.username}
      title={props.title}
      followings={props.followings}
      balance={props.balance}
      loading={transferring}
      transferToken={_hanldeTokenTransfer}
      cancelModal={props.callback}
    />
  );
};

export {TokenTransferContainer};
