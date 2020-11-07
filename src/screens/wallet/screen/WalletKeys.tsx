//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {FlatList, StyleSheet} from 'react-native';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import Swiper from 'react-native-swiper';
import {argonTheme} from '~/constants';

import {Tabs} from '~/components';
import moment from 'moment';

interface Props {}
const WalletKeysView = (props: Props): JSX.Element => {
  return (
    <Block style={{flex: 1}}>
      <Block>
        <Text>Keys</Text>
      </Block>
    </Block>
  );
};

export {WalletKeysView};
