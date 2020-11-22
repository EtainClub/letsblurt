//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {FlatList, StyleSheet} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants';
import moment from 'moment';
import {WalletData} from '~/contexts/types';
//// utils
import {get} from 'lodash';
import {putComma} from '~/utils/stats';
import {getTimeFromNow} from '~/utils/time';

const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];

interface Props {
  walletData: WalletData;
  isUser?: boolean;
  handlePressClaim?: () => void;
  claiming?: boolean;
  showTransactions?: boolean;
  price?: number;
}
const WalletStatsView = (props: Props): JSX.Element => {
  //// props
  let {
    blurt,
    power,
    savings,
    rewardBlurt,
    transactions,
    votePower,
  } = props.walletData;
  blurt = putComma(parseFloat(blurt).toFixed(3));
  power = putComma(parseFloat(power).toFixed(3));
  savings = putComma(savings);
  const needToClaim = parseFloat(rewardBlurt) > 0 ? true : false;
  rewardBlurt = putComma(rewardBlurt);
  //// language
  const intl = useIntl();

  const _renderItem = ({item, index}) => {
    const value = parseFloat(get(item, 'value', '')).toFixed(2);
    const op = get(item, 'textKey', '');
    const hideOp = op === 'transfer' ? true : false;
    const description =
      op === 'transfer' ? ' from ' + get(item, 'details', '') : '';
    return (
      <Block
        row
        middle
        space="between"
        style={[
          styles.rows,
          {
            backgroundColor:
              BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          },
        ]}>
        <Icon
          size={20}
          color={argonTheme.COLORS.ERROR}
          name={item.icon}
          family={item.iconType}
        />
        <Text
          style={{textAlign: 'left', fontFamily: 'open-sans-regular'}}
          color="#525F7F"
          size={12}>
          {!hideOp &&
            intl.formatMessage({id: `Wallet.${get(item, 'textKey')}`})}{' '}
          {value} BLURT
          {description}
        </Text>
        <Text>{getTimeFromNow(get(item, 'created'))}</Text>
      </Block>
    );
  };

  return (
    props.walletData && (
      <Block>
        <Block
          card
          style={{
            shadowColor: argonTheme.COLORS.FACEBOOK,
            marginHorizontal: 70,
            marginVertical: 10,
            padding: 20,
          }}>
          <Block row space="between">
            <Text>Blurt Power:</Text>
            <Text> {power} BLURT</Text>
          </Block>
          <Block row space="between">
            <Text>Blurt:</Text>
            <Text>{blurt} BLURT</Text>
          </Block>
          <Block row space="between">
            <Text>Savings:</Text>
            <Text>{savings} BLURT</Text>
          </Block>
          <Block row space="between">
            <Text>Voting Power:</Text>
            <Text>{parseInt(votePower) / 100}%</Text>
          </Block>
          <Block row space="between">
            <Text>Blurt Price:</Text>
            {props.price ? <Text>${props.price.toFixed(3)}</Text> : null}
          </Block>
        </Block>
        {props.isUser && needToClaim ? (
          <Block center>
            <Text>Reward: {rewardBlurt}</Text>
            <Button onPress={props.handlePressClaim} loading={props.claiming}>
              Claim Reward
            </Button>
          </Block>
        ) : null}
        <Block style={styles.notification}>
          <FlatList
            data={transactions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={_renderItem}
            ListHeaderComponent={
              <Block style={styles.title}>
                <Text
                  style={{fontFamily: 'open-sans-bold', paddingBottom: 5}}
                  center
                  size={16}
                  color={argonTheme.COLORS.TEXT}>
                  {intl.formatMessage({id: 'Wallet.transaction_header'})}
                </Text>
                <Text
                  style={{fontFamily: 'open-sans-regular'}}
                  center
                  size={12}
                  color={argonTheme.COLORS.TEXT}>
                  {intl.formatMessage({id: 'Wallet.transaction_desc'})}
                </Text>
              </Block>
            }
          />
        </Block>
      </Block>
    )
  );
};

export {WalletStatsView};

const styles = StyleSheet.create({
  notification: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE / 2,
    paddingBottom: theme.SIZES.BASE * 1.5,
  },
  rows: {
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE * 0.3,
  },
});
