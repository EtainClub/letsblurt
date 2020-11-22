//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {FlatList, Animated, StyleSheet, ScrollView, View} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {TabView, SceneMap} from 'react-native-tab-view';
import {argonTheme} from '~/constants';
import {WalletStatsView, WalletKeyView} from '~/components';
import {WalletData} from '~/contexts/types';

interface Props {
  walletData: WalletData;
  price: number;
  handlePressClaim: () => void;
  claiming: boolean;
  handlePressShowPassword: (type: string) => void;
  //  tabIndex: number;
  //  handleTabIndexChanged: (index: number) => void;
}
const WalletScreen = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'stats', title: 'Balances'},
    {key: 'keys', title: 'Keys'},
  ]);

  const WalletStats = () => (
    <WalletStatsView
      walletData={props.walletData}
      isUser
      handlePressClaim={props.handlePressClaim}
      claiming={props.claiming}
      price={props.price}
    />
  );

  const WalletKeys = () => {
    return (
      <ScrollView>
        <Text h6>{intl.formatMessage({id: 'Wallet.keys_header'})}</Text>
        <Text>{intl.formatMessage({id: 'Wallet.keys_guide'})}</Text>

        <WalletKeyView
          type="posting"
          handlePressShowPassword={() =>
            props.handlePressShowPassword('posting')
          }
        />
        <WalletKeyView
          type="active"
          handlePressShowPassword={() =>
            props.handlePressShowPassword('active')
          }
        />
        <WalletKeyView
          type="owner"
          handlePressShowPassword={() => props.handlePressShowPassword('owner')}
        />
        <WalletKeyView
          type="memo"
          handlePressShowPassword={() => props.handlePressShowPassword('memo')}
        />
      </ScrollView>
    );
  };

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
