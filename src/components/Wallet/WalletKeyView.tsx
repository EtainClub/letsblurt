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
//// language
import {useIntl} from 'react-intl';
//// ui
import {Block, Icon, Button, Input, Text, theme} from 'galio-framework';
import {argonTheme} from '~/constants';
const {width, height} = Dimensions.get('window');

const HIDE_PASSWORD = '****************************************';
interface Props {
  type: string;
  handlePressShowPassword: () => void;
}
const WalletKeyView = (props: Props): JSX.Element => {
  //// props
  //// language
  const intl = useIntl();
  //// contexts
  //// states
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(HIDE_PASSWORD);

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
    <TouchableWithoutFeedback onPress={props.handlePressShowPassword}>
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
      <Input
        editable={false}
        password
        color="black"
        right
        iconContent={iconLock}
        defaultValue={password}
        placeholderTextColor={argonTheme.COLORS.PLACEHOLDER}
        style={styles.input}
      />
    </Block>
  );
};

export {WalletKeyView};

const styles = StyleSheet.create({
  input: {
    width: width * 0.9,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: argonTheme.COLORS.PLACEHOLDER,
  },
});
