import React from 'react';
import {NotificationScreen} from '../screen/Notification';

interface Props {
  username: string;
}

const Notification = (props: Props): JSX.Element => {
  const {username} = props;
  return <NotificationScreen username={username} />;
};

export {Notification};
