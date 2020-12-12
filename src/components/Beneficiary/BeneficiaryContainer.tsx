//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language

import {BeneficiaryView} from './BeneficiaryView';

interface Props {
  sourceList: string[];
  getBeneficiaries: (beneficiaries: any[]) => void;
}
const BeneficiaryContainer = (props: Props): JSX.Element => {
  return (
    <BeneficiaryView
      getBeneficiaries={props.getBeneficiaries}
      sourceList={props.sourceList}
    />
  );
};

export {BeneficiaryContainer};
