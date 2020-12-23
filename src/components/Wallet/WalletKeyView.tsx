//// react
import React, {useState, useEffect, useContext} from 'react';
//// react native
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
//// config
import Config from 'react-native-config';
//// language
import {useIntl} from 'react-intl';
//// blockchain
import {getRequestedPassword} from '~/providers/blurt/dblurtApi';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');
import {AuthContext, UIContext} from '~/contexts';
import {KeyTypes} from '~/contexts/types';
const HIDE_PASSWORD = '****************************************';
interface Props {
  type: string;
  keyType: KeyTypes;
  handlePressShowPassword: () => void;
}
const WalletKeyView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  const {authState} = useContext(AuthContext);
  const {setToastMessage} = useContext(UIContext);
  //// states
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(HIDE_PASSWORD);

  //// handle show password
  const _handlePressShowPassword = () => {
    const {username, password, type} = authState.currentCredentials;
    const _type = KeyTypes[props.type.toUpperCase()];
    console.log(
      '_handlePressShowPassword, props.keyType, _type',
      props.keyType,
      _type,
    );
    // only master key can retrieve the lower keys
    if (props.keyType === KeyTypes.MASTER) {
      console.log('show password');
      const _password = getRequestedPassword(username, password, props.type);
      //      console.log('_handlePressShowPassword. _password', _password);
      setPassword(_password);
      setShowPassword(!showPassword);
    } else {
      setToastMessage('Please login with a master key.');
    }
  };
  ////
  const _hidePassword = () => {
    setShowPassword(false);
    setPassword(HIDE_PASSWORD);
  };
  const iconLock = showPassword ? (
    <TouchableWithoutFeedback onPress={_hidePassword}>
      <Icon
        size={16}
        color={theme.COLORS.BLACK}
        name="unlock"
        family="font-awesome"
      />
    </TouchableWithoutFeedback>
  ) : (
    <TouchableWithoutFeedback onPress={_handlePressShowPassword}>
      <Icon
        size={16}
        color={theme.COLORS.BLACK}
        name="lock"
        family="font-awesome"
      />
    </TouchableWithoutFeedback>
  );

  return (
    <Block
      card
      style={{
        shadowColor: argonTheme.COLORS.FACEBOOK,
        marginHorizontal: 5,
        marginVertical: 10,
        padding: 20,
      }}>
      <Text size={20}>{`Private ${props.type.toUpperCase()} Keys`}</Text>
      <Text>Descriptions</Text>
      <Block center row style={{margin: 0}}>
        <Input
          editable={false}
          color="black"
          right
          iconContent={iconLock}
          value={password}
          placeholderTextColor={argonTheme.COLORS.PLACEHOLDER}
          style={styles.input}
        />
        <Icon
          onPress={() => console.log('copy the key')}
          size={16}
          color={theme.COLORS.BLACK}
          name="pencil"
          family="font-awesome"
        />
      </Block>
    </Block>
  );
};

export {WalletKeyView};

const styles = StyleSheet.create({
  input: {
    width: width * 0.8,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: argonTheme.COLORS.PLACEHOLDER,
    marginRight: 10,
  },
});
