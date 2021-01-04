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
import {AuthContext, UserContext} from '~/contexts';
//// views

interface Props {
  username: string;
  useOTP: boolean;
  handleOTPResult?: (result: boolean) => void;
}
const SecureKeyView = (props: Props): JSX.Element => {
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {userState} = useContext(UserContext);
  //// states
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  //// effect

  ////
  const _handlePressConfirm = () => {
    // check password

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
            />
          </Block>
          <Block row center space="between">
            <Input
              style={styles.input}
              left
              password
              autoCapitalize="none"
              placeholder={intl.formatMessage({
                id: 'SecureKey.password_placeholder',
              })}
              onChangeText={(text) => {
                setPassword;
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
        phoneNumber={userState.phoneNumber}
        handleOTPResult={props.handleOTPResult}
      />
    ) : (
      <Block>
        <Block row center>
          <Button
            size="small"
            shadowless
            color={argonTheme.COLORS.ERROR}
            onPress={_handlePressConfirm}>
            {intl.formatMessage({id: 'SecureKey.confirm_button'})}
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
