import React from 'react';

import {View, Text, TouchableHighlight} from 'react-native';
import {navigate} from '../../../navigation/service';
import {Icon} from 'galio-framework';

interface Props {
  username: string;
}

const SettingScreen = (props: Props): JSX.Element => {
  console.log('[ProfileSceeen] props', props);
  return (
    <View>
      <TouchableHighlight onPress={() => navigate({name: 'Posting'})}>
        <Text>Setting Screen </Text>
      </TouchableHighlight>
      <Icon size={46} family="font-awesome" name="user" color="red" />
    </View>
  );
};

export {SettingScreen};
