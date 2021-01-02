//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {WalletScreen} from '../screen/Wallet';
//// language
import {useIntl} from 'react-intl';
////
import {AuthContext, UIContext, UserContext} from '~/contexts';
import {WalletData, KeyTypes} from '~/contexts/types';
//// blockchain
import {
  claimRewardBalance,
  transferToken,
  TransactionReturnCodes,
} from '~/providers/blurt/dblurtApi';

//// props
interface Props {
  navigation: any;
  username: string;
}
const Wallet = (props: Props): JSX.Element => {
  //// props
  console.log('[WalletContainer] props', props);
  const {navigation} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState, getWalletData, getPrice} = useContext(UserContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [walletData, setWalletData] = useState<WalletData>(
    userState.walletData,
  );
  const [claiming, setClaiming] = useState(false);
  const [price, setPrice] = useState(0);
  //////// events
  //// event: mount
  useEffect(() => {
    if (authState.loggedIn) {
      console.log('[wallet] crendentials', authState.currentCredentials);
      // fetch user data
      getWalletData(authState.currentCredentials.username);
      // fetch price
      getPrice();
    }
  }, []);
  //// on focus event:
  //// when the WalletStatView is used before, then author's wallet data show
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[Wallet] focus event');
      if (authState.loggedIn) {
        // fetch user data
        getWalletData(authState.currentCredentials.username);
      }
    });
    return unsubscribe;
  }, [navigation]);

  //// event: wallet fetched
  useEffect(() => {
    if (userState.walletData) {
      setWalletData(userState.walletData);
    }
  }, [userState.walletData]);
  //// event: price fetched
  useEffect(() => {
    setPrice(userState.price);
    console.log('[Wallet] set price', userState.price);
  }, [userState.price]);

  //// claim reward balance
  const _handlePressClaim = async () => {
    setClaiming(true);
    // claim balance reward
    const {username, password} = authState.currentCredentials;
    const result = await claimRewardBalance(username, password);
    if (result) {
      console.log('[_handlePressClaim] result', result);
      // update the wallet data
      getWalletData(username);
      // stop loading
      setClaiming(false);
      // set toast message
      setToastMessage(intl.formatMessage({id: 'Wallet.claim_ok'}));
    }
  };

  //// transfer token
  const _transferToken = async (index: number) => {
    // handle not supported options
    if (index > 0) {
      setToastMessage(intl.formatMessage({id: 'not_supported'}));
      return;
    }
    // get username and password
    const {username, password} = authState.currentCredentials;
    // build params
    const params = {
      to: 'letsblurt',
      amount: '1 Blurt',
      memo: "Let's Blurt",
    };
    // TODO: check using opt setting

    const returnCode = await transferToken(username, password, params);
    // handle return code
    switch (returnCode) {
      case TransactionReturnCodes.NO_ACCOUNT:
        setToastMessage(intl.formatMessage({id: 'Transaction.no_account'}));
        break;
      case TransactionReturnCodes.INVALID_PASSWORD:
        setToastMessage(
          intl.formatMessage({id: 'Transaction.invalid_password'}),
        );
        break;
      case TransactionReturnCodes.NEED_HIGHER_PASSWORD:
        setToastMessage(
          intl.formatMessage({id: 'Transaction.need_higher_password'}),
        );
        // TODO:show password input modal
        break;
      case TransactionReturnCodes.TRANSACTION_ERROR:
        setToastMessage(intl.formatMessage({id: 'Transaction.error'}));
        break;
      case TransactionReturnCodes.TRANSACTION_SUCCESS:
        setToastMessage(intl.formatMessage({id: 'Transaction.success'}));
        break;
      default:
        setToastMessage(intl.formatMessage({id: 'something_wrong'}));
        break;
    }
  };

  return (
    <WalletScreen
      walletData={walletData}
      handlePressClaim={_handlePressClaim}
      claiming={claiming}
      price={price}
      handlePressTransfer={_transferToken}
    />
  );
};

export {Wallet};
