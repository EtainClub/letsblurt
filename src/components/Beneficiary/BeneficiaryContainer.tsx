//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {View} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// contexts
import {SettingsContext} from '~/contexts';
//// components
import {AuthorList} from '~/components';
//// views
import {BeneficiaryView} from './BeneficiaryView';
//// constants
export const WEIGHT_OPTIONS = ['100', '75', '50', '25', '10', '0'];

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
  //// language
  const intl = useIntl();
  //// contexts
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>(
    props.beneficiaries,
  );
  const [showModal, setShowModal] = useState(true);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [author, setAuthor] = useState('');
  const [weight, setWeight] = useState('0');
  const [appended, setAppended] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  //////// events
  //// event: beneficiary appended
  useEffect(() => {
    if (appended) {
      setAppended(false);
      setRefresh(true);
    }
  }, [appended]);

  //////// functions

  //// handle change account name
  const _handleChangeAccount = () => {
    // show authors list
    setShowAuthorsModal(true);
  };

  //// handle press author
  const _handlePressAuthor = (_author: string) => {
    // set selected author
    setAuthor(_author);
    // close modal
    setShowAuthorsModal(false);
  };
  //// add beneficiary
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

  /// handle weight change
  const _handleChangeWeight = (_weight: string) => {
    // set weight
    setWeight(_weight);
  };

  //// handle press add a new beneficiary
  const _handlePressAdd = () => {
    //
    if (author === '' || weight === '') return;
    // check uniqueness
    const duplicated = beneficiaries.some((item) => item.account === author);
    if (duplicated) return;
    // append
    const _appended = _addBeneficiary({
      account: author,
      weight: parseInt(weight) * 100,
    });
    if (_appended) {
      setAppended(true);
      // clear inputs
      setAuthor('');
      setWeight('');
    } else {
      setErrorMessage(intl.formatMessage({id: 'Beneficiary.error_total'}));
    }
  };

  ////
  const _handlePressSave = () => {
    // send back the beneficiary list
    let valid = true;
    // check sum of weights
    let sum = 0;
    beneficiaries.forEach((item) => {
      if (item.weight < 0) valid = false;
      sum += item.weight;
    });
    if (sum < 0 || sum > 10000) valid = false;

    // handle error
    if (!valid) {
      setErrorMessage(intl.formatMessage({id: 'Beneficiary.error_total'}));
      return;
    }

    //// handle success
    // return the resulting beneficiaries to the parent
    props.getBeneficiaries(beneficiaries);
    // clear inputs
    setAuthor('');
    setWeight('');
    // close modal
    setShowModal(false);
  };

  //// remove beneficiary from the list
  const _removeBeneficiary = (beneficiary: BeneficiaryItem) => {
    const {account, weight} = beneficiary;
    // remove the account
    const _list = beneficiaries.filter((item) => item.account != account);
    // update user's weight
    _list[1].weight += weight;
    console.log('[remove account] list', _list);
    setBeneficiaries(_list);
  };

  return (
    <View>
      <BeneficiaryView
        author={author}
        weight={weight}
        beneficiaries={beneficiaries}
        showModal={showModal}
        refresh={refresh}
        errorMessage={errorMessage}
        imageServer={settingsState.blockchains.image}
        handleChangeAccount={_handleChangeAccount}
        handleChangeWeight={_handleChangeWeight}
        handlePressAdd={_handlePressAdd}
        handlePressRemove={_removeBeneficiary}
        handlePressSave={_handlePressSave}
        handleCancelModal={() => setShowModal(false)}
      />
      {showAuthorsModal && (
        <AuthorList
          authors={props.sourceList}
          handlePressAuthor={_handlePressAuthor}
          cancelModal={() => setShowAuthorsModal(false)}
        />
      )}
    </View>
  );
};

export {BeneficiaryContainer};
