//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language

//// views
import {TokenTransferView} from './TokenTransferView';

interface Props {
  username: string;
  title: string;
  followings: string[];
}
const TokenTransferContainer = (props: Props): JSX.Element => {
  //// states
  //// effect

  return (
    <TokenTransferView
      username={props.username}
      title={props.title}
      followings={props.followings}
    />
  );
};

export {TokenTransferContainer};
