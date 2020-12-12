//// react
import React, {useState, useEffect} from 'react';
//// react native
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Linking,
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

const WEIGHT_OPTIONS = ['100', '75', '50', '25', '10', '0'];
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
interface Props {
  sourceList: string[];
  getBeneficiaries: (list: any[]) => void;
}
const BeneficiaryView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  const [showModal, setShowModal] = useState(true);
  const [hideResult, setHideResult] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [beneficiaryList, setBeneficiaryList] = useState([]);
  const [weight, setWeight] = useState(WEIGHT_OPTIONS[0]);
  const [weightFocused, setWeightFocused] = useState(false);
  const [hideWeightResult, setHideWeightResult] = useState(false);
  const [appended, setAppended] = useState(false);
  const [refreshList, setRefresList] = useState(false);
  //// effect
  useEffect(() => {
    if (appended) {
      setAppended(false);
      setRefresList(true);
    }
  }, [appended]);

  const _handleChangeText = (text) => {
    setQuery(text);
    // filter
    const _filtered = props.sourceList.filter((item) => item.includes(text));
    setFilteredList(_filtered);
    // clear hide
    setHideResult(false);
  };

  ////
  const _renderItem = (item: string, index: number) => {
    const avatar = `${Config.IMAGE_SERVER}/u/${item}/avatar`;
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
    // hide results
    setHideResult(true);
    setHideWeightResult(true);
    // check uniqueness
    const duplicated = beneficiaryList.some((item) => item[0] === query);
    if (duplicated) return;
    // check sum of weight
    let sum = 0;
    beneficiaryList.forEach((item) => (sum += parseInt(item[1])));
    sum += parseInt(weight);
    console.log('sum of weights', sum);
    // append the item
    beneficiaryList.push([query, weight]);
    setAppended(true);
  };

  ////
  const _handlePressSave = () => {
    // close modal
    setShowModal(false);
    // send back the beneficiary list
    props.getBeneficiaries(beneficiaryList);
  };

  ////
  const _renderBeneficiaries = () => {
    console.log('bene list', beneficiaryList);
    return beneficiaryList.map((item, index) => {
      const avatar = `${Config.IMAGE_SERVER}/u/${item[0]}/avatar`;
      return (
        <Block
          key={item[0]}
          row
          space="between"
          style={{
            marginBottom: 5,
            marginHorizontal: 10,
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
              {item[0]}
            </Text>
          </Block>
          <Text size={14} style={{marginHorizontal: 5, marginRight: 5}}>
            {item[1]}%
          </Text>
        </Block>
      );
    });
  };

  const _renderHeader = () => (
    <Block center>
      <Text
        style={{
          borderBottomColor: 'red',
          borderBottomWidth: 5,
          marginBottom: 10,
        }}>
        {intl.formatMessage({id: 'Beneficiary.header'})}
      </Text>
      <Block card row space="between" style={{marginHorizontal: 10}}>
        <Autocomplete
          placeholder={intl.formatMessage({
            id: 'Beneficiary.account_placeholder',
          })}
          style={{width: width * 0.5}}
          data={hideResult ? [] : filteredList}
          defaultValue={query}
          onChangeText={_handleChangeText}
          renderItem={({item, index}) => _renderItem(item, index)}
          keyExtractor={(item, index) => String(index)}
        />
        <Autocomplete
          placeholder={intl.formatMessage({
            id: 'Beneficiary.weight_placeholder',
          })}
          style={{width: width * 0.3}}
          data={hideWeightResult ? [] : WEIGHT_OPTIONS}
          defaultValue={weight}
          onFocus={() => setWeightFocused(true)}
          onBlur={() => setWeightFocused(false)}
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
      <Block>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.FACEBOOK}
          onPress={_handlePressAdd}>
          {intl.formatMessage({id: 'Beneficiary.add_button'})}
        </Button>
      </Block>
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
    </Block>
  );

  const _renderFooter = () => (
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
  );

  return (
    <Modal
      isVisible={showModal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={() => setShowModal(false)}>
      <Block style={styles.listContainer}>
        {_renderHeader()}
        {refreshList && _renderBeneficiaries()}
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

/*
      <Block card center style={styles.modalContainer}>
        <Text
          style={{
            borderBottomColor: 'red',
            borderBottomWidth: 5,
            marginBottom: 10,
          }}>
          {intl.formatMessage({id: 'Beneficiary.header'})}
        </Text>
        <Block card row space="between" style={{marginHorizontal: 10}}>
          <Autocomplete
            placeholder={intl.formatMessage({
              id: 'Beneficiary.account_placeholder',
            })}
            style={{width: width * 0.5}}
            data={hideResult ? [] : filteredList}
            defaultValue={query}
            onChangeText={_handleChangeText}
            renderItem={({item, index}) => _renderItem(item, index)}
          />
          <Autocomplete
            placeholder={intl.formatMessage({
              id: 'Beneficiary.weight_placeholder',
            })}
            style={{width: width * 0.3}}
            data={weightFocused ? WEIGHT_OPTIONS : []}
            defaultValue={weight}
            onFocus={() => setWeightFocused(true)}
            onBlur={() => setWeightFocused(false)}
            onChangeText={_handleChangeWeight}
            renderItem={({item, index}) => (
              <TouchableOpacity
                key={item}
                onPress={() => _handlePressWeightItem(item)}>
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </Block>
        <Block>
          <Button
            size="small"
            shadowless
            color={argonTheme.COLORS.FACEBOOK}
            onPress={() => console.log('bene saved')}>
            {intl.formatMessage({id: 'Beneficiary.add_button'})}
          </Button>
        </Block>
        <Block center>
          <Text
            style={{
              borderBottomColor: 'red',
              borderBottomWidth: 5,
            }}>
            {intl.formatMessage({id: 'Beneficiary.list_header'})}
          </Text>
          {_renderBeneficiaries()}
          <Button
            size="small"
            shadowless
            color={argonTheme.COLORS.ERROR}
            onPress={() => console.log('bene saved')}>
            {intl.formatMessage({id: 'Beneficiary.save_button'})}
          </Button>
        </Block>
      </Block>
*/

/*
      <FlatList
        data={beneficiaryList}
        ListHeaderComponent={_renderHeader}
        ListFooterComponent={_renderFooter}
        renderItem={({item, index}) => _renderBeneficiaryItem(item, index)}
        keyExtractor={(item, index) => String(index)}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
      />
*/
