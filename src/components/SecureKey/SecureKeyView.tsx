//// react
import React, {useState, useContext, useEffect} from 'react';
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
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
//// blockchain
//// components
import {OTP} from '~/components';
//// context
import {AuthContext} from '~/contexts';
//// views
import {KeyTypes} from '~/contexts/types';

interface Props {
  username: string;
  useOTP: boolean;
}
const SecureKeyView = (props: Props): JSX.Element => {
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  const [showModal, setShowModal] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  //// effect

  ////
  const _handlePressConfirm = () => {
    if (props.useOTP) {
      setShowOTPModal(true);
    }
  };

  const _renderForms = () => {
    return (
      <Block center>
        <Block center style={{margin: 10}}>
          <Block row center space="between">
            <Input
              style={styles.input}
              editable={false}
              defaultValue={props.username}
              autoCapitalize="none"
              left
              icon="at"
              family="font-awesome"
              placeholder="regular"
            />
          </Block>
          <Block row center space="between">
            <Input
              style={styles.input}
              left
              password
              autoCapitalize="none"
              placeholder="password"
              onChangeText={() => {}}
            />
          </Block>
          <Text color="red">
            This operation requires your Active or Owner key or Master password.
          </Text>
        </Block>
      </Block>
    );
  };

  const _renderFooter = () => (
    <Block>
      {showOTPModal && (
        <OTP phoneNumber={'+16505559898'} handleOTPResult={() => {}} />
      )}
      <Block row center>
        <Button
          size="small"
          shadowless
          color={argonTheme.COLORS.ERROR}
          onPress={_handlePressConfirm}>
          Confirm
        </Button>
      </Block>
      <Block center>
        <Text size={16} color="red">
          {errorMessage}
        </Text>
      </Block>
    </Block>
  );

  ////
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
            Secure Password
          </Text>
        </Block>
        {_renderForms()}
        {_renderFooter()}
      </Block>
    </Modal>
  );
};

export {SecureKeyView};

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
    width: 50,
    textAlign: 'left',
    marginRight: 10,
  },
  input: {
    width: width * 0.8,
    marginRight: 10,
  },
});
