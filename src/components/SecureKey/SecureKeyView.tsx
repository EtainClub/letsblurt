//// react
import React, {useState, useContext, useEffect} from 'react';
//// react native
import {View, StyleSheet, Dimensions} from 'react-native';
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
import {AuthContext, UserContext} from '~/contexts';
import {verifyPassoword} from '~/providers/blurt';
//// views

interface Props {
  username: string;
  showOTP: boolean;
  phoneNumber: string;
  message: string;
  handlePressConfirm: (password: string) => void;
  handleOTPResult?: (result: boolean) => void;
}
const SecureKeyView = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  //// states
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [errorMessage, setErrorMessage] = useState(props.message);
  const [showOTPModal, setShowOTPModal] = useState(false);
  //////// effect
  ////
  useEffect(() => {
    setErrorMessage(props.message);
  }, [props.message]);
  //// otp
  useEffect(() => {
    console.log('[securekeyview. useeffect. show otp modal', props.showOTP);
    setShowOTPModal(props.showOTP);
  }, [props.showOTP]);

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
            />
          </Block>
          <Block row center space="between">
            <Input
              style={styles.input}
              left
              password
              viewPass
              autoCapitalize="none"
              placeholder={intl.formatMessage({
                id: 'SecureKey.password_placeholder',
              })}
              onChangeText={(text: string) => {
                setPassword(text);
                setErrorMessage('');
              }}
            />
          </Block>
          <Text color="red">
            {intl.formatMessage({id: 'SecureKey.password_guide'})}
          </Text>
        </Block>
      </Block>
    );
  };

  const _renderFooter = () =>
    showOTPModal ? (
      <OTP
        phoneNumber={props.phoneNumber}
        handleOTPResult={props.handleOTPResult}
      />
    ) : (
      <Block>
        <Block row center>
          <Button
            size="small"
            shadowless
            color={argonTheme.COLORS.ERROR}
            onPress={() => props.handlePressConfirm(password)}>
            {intl.formatMessage({id: 'SecureKey.confirm_button'})}
          </Button>
        </Block>
        <Block center>
          <Text size={20} color="red">
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
            {intl.formatMessage({id: 'SecureKey.title'})}
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
