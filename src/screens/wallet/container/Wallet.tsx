//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {WalletScreen} from '../screen/Wallet';
////
import {AuthContext, UserContext} from '~/contexts';
import {WalletData} from '~/contexts/types';
//// props
interface Props {
  username: string;
}
const Wallet = (props: Props): JSX.Element => {
  //// props
  console.log('[WalletContainer] props', props);
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState, getWalletData, getPrice} = useContext(UserContext);
  //// states
  const [walletData, setWalletData] = useState<WalletData>(
    userState.walletData,
  );
  const [price, setPrice] = useState(0);
  //////// events
  //// event: creation
  useEffect(() => {
    if (authState.loggedIn) {
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

  return <WalletScreen walletData={walletData} price={price} />;
};

export {Wallet};
