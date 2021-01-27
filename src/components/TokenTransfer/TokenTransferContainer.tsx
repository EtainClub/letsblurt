//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {View} from 'react-native';
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
import {AuthContext, UIContext, SettingsContext} from '~/contexts';
import {AuthorList} from '~/components';

//// views
import {SecureKey} from '~/components';
import {TokenTransferView} from './TokenTransferView';
import {KeyTypes} from '~/contexts/types';

interface Props {
  title: string;
  followings: string[];
  balance: string;
  handleResult: (result: boolean) => void;
}
const TokenTransferContainer = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {settingsState} = useContext(SettingsContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [showSecureKey, setShowSecureKey] = useState(false);
  const [params, setParams] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [title, setTitle] = useState(props.title);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [amount, setAmount] = useState(0);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [recipientAvatar, setRecipientAvatar] = useState('');
  const [recipientMessage, setRecipientMessage] = useState('');
  const [amountMessage, setAmountMessage] = useState('');
  const [memo, setMemo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  //////// effects

  //// handle recipient change
  const _handleRecipientChange = (_recipient: string) => {
    // clear the field to use the searched text
    setRecipient('');
    // show authors modal
    setShowAuthorsModal(true);
  };

  //// handle event that recipient filed is focused
  const _handleRecipientFocus = () => {
    // clear error messages
    setRecipientMessage(null);
    setErrorMessage(null);
    // show authors modal
    setShowAuthorsModal(true);
  };

  const _handleRecipientBlur = () => {
    // hide authors modal
    setShowAuthorsModal(false);
  };

  //// handle amount change to transfer
  const _handleAmountChange = (_amount: string) => {
    ////
    if (!showConfirm) {
      if (_amount) setAmount(parseFloat(_amount));
    }
  };

  //// handle the amoutn field focused
  const _handleAmountFocus = () => {
    setAmountMessage('');
  };

  //// handle memo text change
  const _handleMemoChange = (_memo: string) => {
    setMemo(_memo);
  };

  //// check if recipient is valid
  const _checkRecipientValid = () => {
    if (!recipient) {
      setRecipientMessage(
        intl.formatMessage({id: 'TokenTransfer.empty_recipient'}),
      );
      return false;
    }
    if (recipient.length < 3) {
      console.log('username must be longer than 3.', recipient);
      setRecipientMessage(intl.formatMessage({id: 'Signup.msg_too_short'}));
      return false;
    }
    // long length
    if (recipient.length > 16) {
      console.log('username must be shorter than 16.', recipient);
      setRecipientMessage(intl.formatMessage({id: 'Signup.msg_too_long'}));
      return false;
    }
    // starting with number
    if (recipient.match(/^\d/)) {
      console.log('username must not start with a number.', recipient);
      setRecipientMessage(intl.formatMessage({id: 'Signup.msg_number'}));
      return false;
    }
    return true;
  };

  //// check amount
  const _checkAmountValid = () => {
    // check amount
    if (
      parseFloat(props.balance) <= 0 ||
      amount <= 0 ||
      amount >= parseFloat(props.balance)
    ) {
      setAmountMessage(
        intl.formatMessage({id: 'TokenTransfer.amount_message'}),
      );
      return false;
    }
    console.log(
      '_checkSanity. balance, amount',
      parseFloat(props.balance),
      amount,
    );
    return true;
  };

  //// check sanity
  const _checkSanity = () => {
    // check recipient
    if (!_checkRecipientValid()) return false;
    // check validty of amount
    if (!_checkAmountValid()) return false;
    return true;
  };

  //// handle press next button, transfer button
  const _onPressProceedButton = () => {
    // in case of before confirming
    if (!showConfirm) {
      // check saity of recipient and amount
      const valid = _checkSanity();
      if (valid) {
        console.log('everything is valid. showConfirm', showConfirm);
        setTitle(intl.formatMessage({id: 'TokenTransfer.confirm_title'}));
        // move on to the confirm view
        setShowConfirm(true);
      } else {
        setErrorMessage(intl.formatMessage({id: 'TokenTransfer.error'}));
      }
    } else {
      // in case of confirming the transfer
      _hanldeTokenTransfer(recipient, amount, memo);
    }
  };

  //// handle press recipient in the modal
  const _handlePressRecipient = (_recipient: string) => {
    console.log('_handlePressRecipient', _recipient);
    setRecipient(_recipient);
    setRecipientAvatar(
      `${settingsState.blockchains.image}/u/${_recipient}/avatar`,
    );
    //
    setShowAuthorsModal(false);
  };

  ////
  const _hanldeTokenTransfer = (
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
    props.handleResult(true);
  };

  const _handleCancelModal = () => {
    // hide modal
    setShowModal(false);
    props.handleResult(false);
  };

  const _cancelSecureKey = () => {
    setShowSecureKey(false);
    // cancel transfer modal, too
    props.handleResult(false);
  };

  return (
    <View>
      <TokenTransferView
        showModal={showModal}
        username={authState.currentCredentials.username}
        title={props.title}
        balance={props.balance}
        loading={transferring}
        userAvatar={`${settingsState.blockchains.image}/u/${authState.currentCredentials.username}/avatar`}
        recipient={recipient}
        recipientAvatar={`${settingsState.blockchains.image}/u/${recipient}/avatar`}
        recipientMessage={recipientMessage}
        amount={amount}
        amountMessage={amountMessage}
        errorMessage={errorMessage}
        handleRecipientFocus={_handleRecipientFocus}
        handleRecipientBlur={_handleRecipientBlur}
        handleRecipientChange={_handleRecipientChange}
        handleAmountChange={_handleAmountChange}
        handleAmountFocus={_handleAmountFocus}
        handleMemoChange={_handleMemoChange}
        onPressProceedButton={_onPressProceedButton}
        hanldeTokenTransfer={_hanldeTokenTransfer}
        showConfirm={showConfirm}
        cancelModal={_handleCancelModal}
      />
      {showAuthorsModal && (
        <AuthorList
          authors={props.followings}
          handlePressAuthor={_handlePressRecipient}
          cancelModal={() => setShowAuthorsModal(false)}
        />
      )}
      {showSecureKey && (
        <SecureKey
          username={authState.currentCredentials.username}
          requiredKeyType={KeyTypes.ACTIVE}
          handleResult={_handleSecureKeyResult}
          cancelProcess={_cancelSecureKey}
        />
      )}
    </View>
  );
};

export {TokenTransferContainer};
