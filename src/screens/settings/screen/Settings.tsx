import React from 'react';

import {View, TouchableHighlight} from 'react-native';
import {navigate} from '~/navigation/service';
import {Button, Icon, Block, NavBar, Input, Text, theme} from 'galio-framework';

interface Props {
  handleLogout: () => void;
}

const SettingScreen = (props: Props): JSX.Element => {
  console.log('[ProfileSceeen] props', props);
  return (
    <View>
      <TouchableHighlight onPress={() => navigate({name: 'Posting'})}>
        <Text>Setting Screen </Text>
      </TouchableHighlight>
      <Button onPress={props.handleLogout}>Logout</Button>
    </View>
  );
};

export {SettingScreen};
