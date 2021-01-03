//// react
import React, {useState, useEffect, useContext} from 'react';
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
import {UIContext} from '~/contexts';

const WEIGHT_OPTIONS = ['100', '75', '50', '25', '10', '0'];
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
interface Props {
  title: string;
  username: string;
  followings: string[];
}
const TokenTransferView = (props: Props): JSX.Element => {
  //// props
  const {followings} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [showModal, setShowModal] = useState(true);
  const [query, setQuery] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [hideResult, setHideResult] = useState(false);
  const [amount, setAmount] = useState(0);
  const [refresh, setRefresh] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  //// effect
  useEffect(() => {}, []);

  const _handleChangeAccount = (text) => {
    setQuery(text);
    // filter
    //    const _filtered = props.sourceList.filter((item) => item.includes(text));
    //    setFilteredList(_filtered);
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
  const _handleChangeAmount = (text) => {
    setAmount(text);
  };

  ////
  const _handlePressNext = () => {};

  const _renderHeader = () => (
    <Block center card>
      <Block center style={{margin: 10}}>
        <Block row center space="between">
          <Text style={{marginRight: 10}}>From</Text>
          <Input
            disabled
            left
            icon="at"
            family="font-awesome"
            placeholder="regular"
          />
        </Block>
        <Block row center space="between">
          <Text style={{marginRight: 10}}>To</Text>
          <Input left icon="at" family="font-awesome" placeholder="regular" />
        </Block>
        <Block>
          <Block row center space="between">
            <Text style={{marginRight: 10}}>Amount</Text>
            <Input right placeholder="regular" />
          </Block>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Text>Balance: 1.23 BLURT</Text>
          </TouchableWithoutFeedback>
        </Block>
        <Block>
          <Text size={10}>This memo is public</Text>
          <Block row center>
            <Text style={{marginRight: 10}}>Memo</Text>
            <Input left icon="at" family="font-awesome" placeholder="regular" />
          </Block>
        </Block>
      </Block>
    </Block>
  );

  const _renderFooter = () => (
    <Block>
      <Block row center>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.MUTED}
          onPress={() => setShowModal(false)}>
          {intl.formatMessage({id: 'TokenTransfer.next_button'})}
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
            h5
            style={{
              borderBottomColor: 'red',
              borderBottomWidth: 5,
              marginBottom: 10,
            }}>
            {props.title}
          </Text>
        </Block>
        {_renderHeader()}
        {_renderFooter()}
      </Block>
    </Modal>
  );
};

export {TokenTransferView};

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
