//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';
import Modal from 'react-native-modal';
import Autocomplete from 'react-native-autocomplete-input';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
import {BeneficiaryItem} from './BeneficiaryContainer';
import {UIContext} from '~/contexts';

const WEIGHT_OPTIONS = ['100', '75', '50', '25', '10', '0'];
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
interface Props {
  sourceList: string[];
  beneficiaries: BeneficiaryItem[];
  imageServer: string;
  handlePressRemove: (beneficiary: BeneficiaryItem) => void;
  addBeneficiary: (beneficiary: BeneficiaryItem) => boolean;
  handlePressSave: () => boolean;
}
const BeneficiaryView = (props: Props): JSX.Element => {
  //// props
  const {beneficiaries} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [showModal, setShowModal] = useState(true);
  const [hideResult, setHideResult] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [weight, setWeight] = useState(WEIGHT_OPTIONS[0]);
  const [hideWeightResult, setHideWeightResult] = useState(true);
  const [appended, setAppended] = useState(false);
  const [refresh, setRefresh] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  //// effect
  useEffect(() => {
    if (appended) {
      setAppended(false);
      setRefresh(true);
    }
  }, [appended]);

  const _handleChangeAccount = (text) => {
    setQuery(text);
    // filter
    const _filtered = props.sourceList.filter((item) => item.includes(text));
    setFilteredList(_filtered);
    // clear hide
    setHideResult(false);
  };

  ////
  const _renderItem = (item: string, index: number) => {
    const avatar = `${props.imageServer}/u/${item}/avatar`;
    return (
      <TouchableWithoutFeedback
        key={item}
        onPress={() => _handlePressItem(item)}>
        <Block
          flex
          card
          row
          space="between"
          style={{
            marginBottom: 5,
            padding: 5,
            backgroundColor:
              BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          }}>
          <Block row middle>
            <Image
              source={{
                uri: avatar || null,
              }}
              style={styles.avatar}
            />
            <Text size={14} style={{marginHorizontal: 5}}>
              {item}
            </Text>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  ////
  const _handlePressItem = (item) => {
    // set query
    setQuery(item);
    // hide result
    setHideResult(true);
  };

  ///
  const _handleChangeWeight = (text) => {
    setWeight(text);
    setHideWeightResult(false);
  };

  ////
  const _handlePressWeightItem = (item) => {
    // filter
    setWeight(item);
    // hide result
    setHideWeightResult(true);
  };

  ////
  const _handlePressAdd = () => {
    //
    if (query === '' || weight === '') return;
    // hide results
    setHideResult(true);
    setHideWeightResult(true);
    // check uniqueness
    const duplicated = beneficiaries.some((item) => item.account === query);
    if (duplicated) return;
    // append
    const _appended = props.addBeneficiary({
      account: query,
      weight: parseInt(weight) * 100,
    });
    if (_appended) {
      setAppended(true);
      // clear inputs
      setQuery('');
      setWeight('');
    } else {
      setErrorMessage(intl.formatMessage({id: 'Beneficiary.error_total'}));
    }
  };

  ////
  const _handlePressSave = () => {
    // send back the beneficiary list
    const valid = props.handlePressSave();
    if (!valid) {
      setErrorMessage(intl.formatMessage({id: 'Beneficiary.error_total'}));
      return;
    }
    // close modal
    setShowModal(false);
    // clear inputs
    setQuery('');
    setWeight('');
  };

  ////
  const _renderBeneficiaries = () => {
    console.log('bene list', beneficiaries);
    return beneficiaries.map((item, index) => {
      const {account, weight} = item;
      console.log('weight', weight);
      const avatar = `${props.imageServer}/u/${account}/avatar`;
      return (
        <Block
          key={account}
          row
          space="between"
          style={{
            marginBottom: 5,
            marginHorizontal: 10,
            padding: 5,
            height: 50,
            backgroundColor:
              BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          }}>
          <Block row middle>
            <Image
              source={{
                uri: avatar || null,
              }}
              style={styles.avatar}
            />
            <Text size={14} style={{marginHorizontal: 5}}>
              {account}
            </Text>
          </Block>
          <Block row right style={{width: '50%', top: -0}}>
            <Block center>
              <Input
                editable={index === 0 ? false : true}
                placeholder={intl.formatMessage({
                  id: 'Beneficiary.weight_placeholder',
                })}
                type="number-pad"
                value={(weight / 100).toString()}
                onChangeText={() => {}}
              />
            </Block>
            <Block row center style={{marginLeft: 10}}>
              <Text>%</Text>
              <Button
                disabled={index < 2 ? true : false}
                onPress={() => props.handlePressRemove(item)}
                onlyIcon
                icon="trash"
                iconFamily="font-awesome"
                iconSize={14}
                color={
                  index < 2 ? argonTheme.COLORS.MUTED : argonTheme.COLORS.ERROR
                }
              />
            </Block>
          </Block>
        </Block>
      );
    });
  };

  const _renderHeader = () => (
    <Block center>
      <Block>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.FACEBOOK}
          onPress={_handlePressAdd}>
          {intl.formatMessage({id: 'Beneficiary.add_button'})}
        </Button>
      </Block>
      <Block card row space="between" style={{marginHorizontal: 10}}>
        <Autocomplete
          placeholder={intl.formatMessage({
            id: 'Beneficiary.account_placeholder',
          })}
          style={{width: width * 0.5}}
          data={hideResult ? [] : filteredList}
          value={query}
          onChangeText={_handleChangeAccount}
          renderItem={({item, index}) => _renderItem(item, index)}
          keyExtractor={(item, index) => String(index)}
        />
        <Autocomplete
          placeholder={intl.formatMessage({
            id: 'Beneficiary.weight_placeholder',
          })}
          style={{width: width * 0.3}}
          data={hideWeightResult ? [] : WEIGHT_OPTIONS}
          value={weight}
          onChangeText={_handleChangeWeight}
          renderItem={({item, index}) => (
            <TouchableOpacity
              key={item}
              onPress={() => _handlePressWeightItem(item)}>
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => String(index)}
        />
      </Block>
    </Block>
  );

  const _renderFooter = () => (
    <Block>
      <Block row center>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.ERROR}
          onPress={_handlePressSave}>
          {intl.formatMessage({id: 'Beneficiary.save_button'})}
        </Button>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.MUTED}
          onPress={() => setShowModal(false)}>
          {intl.formatMessage({id: 'Beneficiary.cancel_button'})}
        </Button>
      </Block>
      <Block center>
        <Text size={16} color="red">
          {errorMessage}
        </Text>
      </Block>
    </Block>
  );

  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={() => setShowModal(false)}>
      <Block style={styles.listContainer}>
        <Block center>
          <Text
            style={{
              borderBottomColor: 'red',
              borderBottomWidth: 5,
              marginBottom: 10,
            }}>
            {intl.formatMessage({id: 'Beneficiary.list_header'})}
          </Text>
        </Block>
        {refresh && _renderBeneficiaries()}
        {_renderHeader()}
        {_renderFooter()}
      </Block>
    </Modal>
  );
};

export {BeneficiaryView};

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: 'auto',
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  listContainer: {
    marginHorizontal: 10,
    backgroundColor: theme.COLORS.WHITE,
    paddingVertical: 10,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  list: {
    width: '100%',
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: theme.SIZES.BASE * 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 24 / 2,
  },
});
