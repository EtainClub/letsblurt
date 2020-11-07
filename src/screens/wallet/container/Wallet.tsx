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
  const {userState, getWalletData} = useContext(UserContext);
  //// states
  const [walletData, setWalletData] = useState<WalletData>(
    userState.walletData,
  );
  const [tabIndex, setTabIndex] = useState(0);
  //// effect
  useEffect(() => {
    if (authState.loggedIn) {
      // fetch user data
      getWalletData(authState.currentCredentials.username);
    }
  }, []);
  useEffect(() => {
    if (userState.walletData) {
      setWalletData(userState.walletData);
    }
  }, [userState.walletData]);

  ////
  const _handleTabIndexChanged = (index: number) => {
    console.log('tab index changed', index);
    setTabIndex(index);
  };
  return <WalletScreen walletData={walletData} />;
};

export {Wallet};
