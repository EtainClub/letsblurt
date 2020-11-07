import React from 'react';

import {View, Text, TouchableHighlight} from 'react-native';
import {navigate} from '../../../navigation/service';

interface Props {
  username: string;
}

const NotificationScreen = (props: Props): JSX.Element => {
  console.log('[NotificationScreen] props', props);
  return (
    <View>
      <TouchableHighlight onPress={() => navigate({name: 'Profile'})}>
        <Text>Notification Screen</Text>
      </TouchableHighlight>
    </View>
  );
};

export {NotificationScreen};
