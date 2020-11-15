//// react
import React, {useState, useEffect, useContext, useCallback} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
//// react navigation
import {useFocusEffect} from '@react-navigation/native';
import {navigate} from '~/navigation/service';
//// language
import {useIntl} from 'react-intl';
//// ui, styles
import {Block} from 'galio-framework';
//// contexts
import {PostsContext, AuthContext, UIContext, UserContext} from '~/contexts';
import {PostData, PostRef, PostsTypes} from '~/contexts/types';
//// blockchain
import {fetchUserProfile, fetchWalletData} from '~/providers/blurt/dblurtApi';
//// etc
import {get, has} from 'lodash';
import {NotificationScreen} from '../screen/Notification';

interface Props {
  username: string;
}

const Notification = (props: Props): JSX.Element => {
  //// props
  const {username} = props;
  //// contexts
  const {getNotifications} = useContext(UserContext);
  const {authState} = useContext(AuthContext);
  //// states
  const [fetching, setFetching] = useState(false);
  const [notifications, setNotifications] = useState(null);

  //////// effects
  //// focus event
  useFocusEffect(
    useCallback(() => {
      if (authState.loggedIn)
        _fetchNotifications(authState.currentCredentials.username);
    }, []),
  );

  //// fetch notifications
  const _fetchNotifications = async (username) => {
    setFetching(true);
    const _notifications = await getNotifications(username);
    setNotifications(_notifications);
    setFetching(false);
  };

  return (
    <NotificationScreen notifications={notifications} fetching={fetching} />
  );
};

export {Notification};
