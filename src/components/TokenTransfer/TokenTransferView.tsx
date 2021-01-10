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
import {SettingsContext, UIContext} from '~/contexts';
//// coponents
import {AuthorList} from '~/components';
import {TokenTransfer} from '.';

const WEIGHT_OPTIONS = ['100', '75', '50', '25', '10', '0'];
const BACKGROUND_COLORS = [
  argonTheme.COLORS.BORDER,
  argonTheme.COLORS.SECONDARY,
];
interface Props {
  title: string;
  username: string;
  followings: string[];
  balance: string;
  loading: boolean;
  transferToken: (recipient: string, amount: number, memo?: string) => void;
  cancelModal: () => void;
}
const TokenTransferView = (props: Props): JSX.Element => {
  //// props
  const {followings} = props;
  //// language
  const intl = useIntl();
  //// contexts
  const {setToastMessage} = useContext(UIContext);
  const {settingsState} = useContext(SettingsContext);
  //// states
  const [title, setTitle] = useState(props.title);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [query, setQuery] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [hideResult, setHideResult] = useState(false);
  const [amount, setAmount] = useState(0);
  const [refresh, setRefresh] = useState(true);
  const [showAuthorsModal, setShowAuthorsModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [recipientAvatar, setRecipientAvatar] = useState('');
  const [recipientMessage, setRecipientMessage] = useState('');
  const [amountMessage, setAmountMessage] = useState('');
  const [memo, setMemo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  //// effect
  useEffect(() => {}, []);

  ///
  const _handleChangeRecipient = (_recipient: string) => {
    // clear the field to use the searched text
    setRecipient('');
    setShowAuthorsModal(true);
  };

  ////
  const _handleChangeAmount = (_amount: string) => {
    ////
    if (!showConfirm) {
      if (_amount) setAmount(parseFloat(_amount));
    }
  };

  const _handleCancelModal = () => {
    // hide modal
    setShowModal(false);
    // callback
    props.cancelModal();
  };

  ////
  const _handleRecipientFocused = () => {
    setRecipientMessage(null);
    setErrorMessage(null);
    setShowAuthorsModal(true);
  };
  //// check recipient account
  const _checkRecipientValid = (_account: string) => {
    console.log('_checkRecipientValid', _account);
    if (!_account) {
      setRecipientMessage(
        intl.formatMessage({id: 'TokenTransfer.empty_recipient'}),
      );
      return false;
    }
    if (_account.length < 3) {
      console.log('username must be longer than 3.', _account);
      setRecipientMessage(intl.formatMessage({id: 'Signup.msg_too_short'}));
      return false;
    }
    // long length
    if (_account.length > 16) {
      console.log('username must be shorter than 16.', _account);
      setRecipientMessage(intl.formatMessage({id: 'Signup.msg_too_long'}));
      return false;
    }
    // start with number
    if (_account.match(/^\d/)) {
      console.log('username must not start with a number.', _account);
      setRecipientMessage(intl.formatMessage({id: 'Signup.msg_number'}));
      return false;
    }
    return true;
  };

  //// check amount
  const _checkAmountValid = (_amount: number) => {
    // check amount
    if (
      parseFloat(props.balance) <= 0 ||
      _amount <= 0 ||
      _amount >= parseFloat(props.balance)
    ) {
      setAmountMessage(
        intl.formatMessage({id: 'TokenTransfer.amount_message'}),
      );
      return false;
    }
    console.log(
      '_checkSanity. balance, amount',
      parseFloat(props.balance),
      _amount,
    );
    return true;
  };

  //// check sanity
  const _checkSanity = () => {
    // check recipient
    if (!_checkRecipientValid(recipient)) return false;
    // check validty of amount
    if (!_checkAmountValid(amount)) return false;
    return true;
  };

  //// handle press next button, transfer button
  const _handlePressNext = () => {
    if (!showConfirm) {
      // check saity of recipient and amount
      const valid = _checkSanity();
      if (valid) {
        console.log('everything is valid. showConfirm', showConfirm);
        setTitle(intl.formatMessage({id: 'TokenTransfer.confirm_title'}));
        setShowConfirm(true);
      } else {
        setErrorMessage(intl.formatMessage({id: 'TokenTransfer.error'}));
      }
    } else {
      props.transferToken(recipient, amount, memo);
    }
  };

  ////
  const _handlePressRecipient = (_recipient: string) => {
    console.log('_handlePressRecipient', _recipient);
    setRecipient(_recipient);
    setRecipientAvatar(
      `${settingsState.blockchains.image}/u/${_recipient}/avatar`,
    );
    //
    setShowAuthorsModal(false);
  };

  const _renderForms = () => {
    const userAvatar = `${settingsState.blockchains.image}/u/${props.username}/avatar`;
    return (
      <Block center card>
        <Block center style={{margin: 10}}>
          <Block row center space="between">
            <Text style={styles.text}>
              {intl.formatMessage({id: 'Wallet.from'})}
            </Text>
            <Input
              style={styles.input}
              editable={false}
              defaultValue={props.username}
              autoCapitalize="none"
              left
              icon="at"
              family="font-awesome"
            />
            <Image
              source={{
                uri: userAvatar || null,
              }}
              style={styles.avatar}
            />
          </Block>
          <Block row center space="between">
            <Text style={styles.text}>
              {intl.formatMessage({id: 'Wallet.to'})}
            </Text>
            <Input
              style={styles.input}
              editable={!showConfirm}
              left
              onFocus={_handleRecipientFocused}
              onBlur={() => setShowAuthorsModal(false)}
              defaultValue={recipient}
              autoCapitalize="none"
              icon="at"
              family="font-awesome"
              placeholder={intl.formatMessage({
                id: 'TokenTransfer.recipient_placeholder',
              })}
              onChangeText={_handleChangeRecipient}
            />
            <Image
              source={{
                uri: recipientAvatar || null,
              }}
              style={styles.avatar}
            />
          </Block>
          <Text color="red">{recipientMessage}</Text>
          <Block>
            <Block row center space="between">
              <Text style={styles.text}>
                {intl.formatMessage({id: 'TokenTransfer.amount'})}
              </Text>
              <Block>
                <Input
                  editable={!showConfirm}
                  right
                  type="number-pad"
                  style={[styles.input, {marginRight: 30}]}
                  defaultValue={amount.toString()}
                  placeholder={intl.formatMessage({
                    id: 'TokenTransfer.amount_placeholder',
                  })}
                  onFocus={() => setAmountMessage(null)}
                  onChangeText={_handleChangeAmount}
                />
              </Block>
            </Block>
            <TouchableOpacity
              onPress={() => _handleChangeAmount(props.balance)}>
              <Text color={argonTheme.COLORS.FACEBOOK} style={{left: 80}}>
                {intl.formatMessage(
                  {id: 'TokenTransfer.balance'},
                  {what: props.balance},
                )}
              </Text>
            </TouchableOpacity>
            <Text color="red">{amountMessage}</Text>
          </Block>
          <Block>
            <Block row center>
              <Text style={styles.text}>
                {intl.formatMessage({id: 'TokenTransfer.memo'})}
              </Text>
              <Input
                style={[styles.input, {marginRight: 30}]}
                editable={!showConfirm}
                onChangeText={(text: string) => setMemo(text)}
                placeholder={intl.formatMessage({
                  id: 'TokenTransfer.memo_placeholder',
                })}
              />
            </Block>
            <Text style={{left: 80}} size={14}>
              {intl.formatMessage({id: 'TokenTransfer.memo_message'})}
            </Text>
          </Block>
        </Block>
      </Block>
    );
  };

  const _renderFooter = () => (
    <Block>
      {showAuthorsModal && (
        <AuthorList
          authors={props.followings}
          handlePressAuthor={_handlePressRecipient}
          cancelModal={() => setShowAuthorsModal(false)}
        />
      )}
      <Block row center>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.ERROR}
          onPress={_handlePressNext}
          loading={props.loading}>
          {showConfirm || props.loading
            ? intl.formatMessage({id: 'TokenTransfer.transfer_button'})
            : intl.formatMessage({id: 'TokenTransfer.next_button'})}
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
      onBackdropPress={_handleCancelModal}>
      <Block style={styles.listContainer}>
        <Block center>
          <Text
            h5
            style={{
              borderBottomColor: 'red',
              borderBottomWidth: 5,
              marginBottom: 10,
            }}>
            {title}
          </Text>
        </Block>
        {_renderForms()}
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
  text: {
    width: 70,
    textAlign: 'left',
    marginRight: 10,
  },
  input: {
    width: width * 0.5,
    marginRight: 10,
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
