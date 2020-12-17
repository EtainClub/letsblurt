import React, {useContext, useEffect} from 'react';

import {Platform, BackHandler, Alert, Linking, AppState} from 'react-native';
// notification
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
// navigation
import {navigate} from '~/navigation/service';

//import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {AuthContext, UIContext, UserContext} from '~/contexts';

import {ApplicationScreen} from '../screen/Application';

// firebase messaging types
type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

// push notification message listener
type FBRemoteMsgListner = (message: RemoteMessage) => any;
//let fbMessageListener: FBRemoteMsgListner;
//let fbMessageOpenedListener: FBRemoteMsgListner;
// message open handler in foreground

interface Props {}

export const AppContainer = (props: Props): JSX.Element => {
  // get auth
  const {authState} = useContext(AuthContext)!;
  const {uiState, setToastMessage} = useContext(UIContext);

  useEffect(() => {
    // setup push notification listener
    //    _setupNotificationListeners();
    console.log('_setupNotificationListeners');
    // request permission
    (async () => await messaging().requestPermission())();
    console.log('_setupNotificationListeners, got permission');
    // clear app badge number
    PushNotification.setApplicationIconBadgeNumber(0);
    // cancel all local notifications
    PushNotification.cancelAllLocalNotifications();
    // set foreground notification listener
    const fgMsgListener = messaging().onMessage((message: RemoteMessage) => {
      console.log('fgMsgListener, message', message);
      _handleRemoteMessages(message);
    });
    // set notification open listener
    messaging().setBackgroundMessageHandler(async (message: RemoteMessage) => {
      console.log('bgMsgListener, message', message);
      // handle message
      _handleRemoteMessages(message);
    });
    return () => {
      if (__DEV__) console.log('unsubscribe notification listener');
      fgMsgListener();
    };
  }, []);

  // handle push notification messages
  const _handleRemoteMessages = (message: RemoteMessage): void => {
    console.log('_handleRemoteMessages. message', message);

    // get notification data
    const msgData = message.notification;
    // sanity check
    if (!msgData) {
      console.log('remote messgage data is undefined');
      return;
    }
    // get message tyep
    //    const msgType = msgData.type;
    // @test
    console.log('remote message data', msgData);
  };

  // clear toast message
  const _clearMessage = () => {
    setToastMessage('');
  };

  return (
    <ApplicationScreen
      toastMessage={uiState.toastMessage}
      clearMessage={_clearMessage}
    />
  );
};
