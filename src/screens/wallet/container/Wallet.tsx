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
import {claimRewardBalance} from '~/providers/blurt/dblurtApi';

//// props
interface Props {
  username: string;
}
const Wallet = (props: Props): JSX.Element => {
  //// props
  console.log('[WalletContainer] props', props);
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
  //// event: creation
  useEffect(() => {
    if (authState.loggedIn) {
      console.log('[wallet] crendentials', authState.currentCredentials);
      // fetch user data
      getWalletData(authState.currentCredentials.username);
      // fetch price
      getPrice();
    }
  }, []);
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

  return (
    <WalletScreen
      walletData={walletData}
      handlePressClaim={_handlePressClaim}
      claiming={claiming}
      price={price}
    />
  );
};

export {Wallet};
