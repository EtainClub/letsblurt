import React from 'react';
import {SettingScreen} from '../screen/Settings';

interface Props {
  username: string;
}

const Settings = (props: Props): JSX.Element => {
  const {username} = props;
  return <SettingScreen username={username} />;
};

export {Settings};
