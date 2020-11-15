//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {FlatList, Animated, StyleSheet, View} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {TabView, SceneMap} from 'react-native-tab-view';
import {argonTheme} from '~/constants';

import {Tabs} from '~/components';
import moment from 'moment';
//import {WalletStatsView} from './WalletStats';
import {WalletStatsView} from '~/components';
import {WalletKeysView} from './WalletKeys';
import {WalletData} from '~/contexts/types';

interface Props {
  walletData: WalletData;
  //  tabIndex: number;
  //  handleTabIndexChanged: (index: number) => void;
}
const WalletScreen = (props: Props): JSX.Element => {
  //// contexts
  //// states
  const [tabIndex, setTabIndex] = useState(0);
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'stats', title: 'Balances'},
    {key: 'keys', title: 'Keys'},
  ]);

  const WalletStats = () => (
    <WalletStatsView walletData={props.walletData} isUser />
  );

  const WalletKeys = () => <WalletKeysView />;

  const renderScene = SceneMap({
    stats: WalletStats,
    keys: WalletKeys,
  });

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      tabBarPosition="top"
    />
  );
};

export {WalletScreen};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'green',
  },
  notification: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE / 2,
    paddingBottom: theme.SIZES.BASE * 1.5,
  },
  rows: {
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE * 1.25,
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
