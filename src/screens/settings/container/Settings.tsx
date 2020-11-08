import React, {useContext} from 'react';
import {AuthContext} from '~/contexts';
import {SettingScreen} from '../screen/Settings';

interface Props {
  username: string;
}

const Settings = (props: Props): JSX.Element => {
  const {username} = props;
  //// contexts
  const {authState, processLogout} = useContext(AuthContext);
  const _handleLogout = async () => {
    console.log('[Settings] handle logout');
    await processLogout();
  };

  return <SettingScreen handleLogout={_handleLogout} />;
};

export {Settings};
