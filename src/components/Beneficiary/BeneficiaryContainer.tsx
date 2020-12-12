//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
//// config
import Config from 'react-native-config';
//// language

import {BeneficiaryView} from './BeneficiaryView';

export interface BeneficiaryItem {
  account: string;
  weight: number;
}

interface Props {
  username: string;
  beneficiaries: BeneficiaryItem[];
  sourceList: string[];
  getBeneficiaries: (beneficiaries: any[]) => void;
}
const BeneficiaryContainer = (props: Props): JSX.Element => {
  //// states
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>(
    props.beneficiaries,
  );
  //// effect
  ////
  const _addBeneficiary = (beneficiary: BeneficiaryItem) => {
    //
    console.log('beneficiaries', beneficiaries);
    const {account, weight} = beneficiary;
    // update user's weight
    let _list = beneficiaries;
    const _weight = _list[1].weight - weight;
    let valid = _weight < 0 || _weight > 10000 ? false : true;
    if (!valid) return false;
    // append the new
    _list[1].weight -= weight;
    _list.push(beneficiary);
    // update list
    setBeneficiaries(_list);
    return true;
    // // check sum of weights
    // let sum = 0;
    // beneficiaries.forEach((item) => (sum += item.weight));
    // sum += weight;
    // sum = 0;
    // console.log('sum of weights', sum);
    // if (sum <= 10000) {
    //   // append the item
    //   beneficiaries.push(beneficary);
    //   return true;
    // }
    // return false;
  };

  ////
  const _removeBeneficiary = (beneficiary: BeneficiaryItem) => {
    const {account, weight} = beneficiary;
    // remove the account
    const _list = beneficiaries.filter((item) => item.account != account);
    // update user's weight
    _list[1].weight += weight;
    console.log('[remove account] list', _list);
    setBeneficiaries(_list);
  };

  ////
  const _handlePressSave = () => {
    let valid = true;
    // check sum of weights
    let sum = 0;
    beneficiaries.forEach((item) => {
      if (item.weight < 0) valid = false;
      sum += item.weight;
    });
    if (!valid) return false;
    if (sum < 0 || sum > 10000) return false;
    // return the resulting beneficiaries
    props.getBeneficiaries(beneficiaries);
    return true;
  };

  return (
    <BeneficiaryView
      sourceList={props.sourceList}
      beneficiaries={beneficiaries}
      handlePressRemove={_removeBeneficiary}
      addBeneficiary={_addBeneficiary}
      handlePressSave={_handlePressSave}
    />
  );
};

export {BeneficiaryContainer};
