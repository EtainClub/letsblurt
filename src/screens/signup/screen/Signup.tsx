import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import {Block, Button, Input, Text, theme, Icon} from 'galio-framework';

import LinearGradient from 'react-native-linear-gradient';
import {materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';

import {navigate} from '~/navigation/service';

import {useIntl} from 'react-intl';

const {width, height} = Dimensions.get('window');

interface Props {
  onCreateAccount(username: string): void;
  checkUsernameAvailable(username: string): Promise<boolean>;
}

const SignupScreen = (props: Props): JSX.Element => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [accountAvailable, setAccountAvailable] = useState(false);
  const [active, setActive] = useState({username: false, password: false});

  const intl = useIntl();

  const _checkUsernameValid = (username: string) => {
    if (username.length < 3) {
      console.log('username must be longer than 3.', username);
      setMessage(intl.formatMessage({id: 'Signup.msg_too_short'}));
      return false;
    }
    // long length
    if (username.length > 16) {
      console.log('username must be shorter than 16.', username);
      setMessage(intl.formatMessage({id: 'Singup.msg_too_long'}));
      return false;
    }
    // start with number
    if (username.match(/^\d/)) {
      console.log('username must not start with a number.', username);
      setMessage(intl.formatMessage({id: 'Signup.msg_number'}));
      return false;
    }
    return true;
  };

  const _handleUsernameChange = async (value: string) => {
    // set username
    setUsername(value);
    // check username valid
    const valid = _checkUsernameValid(value);
    if (valid) {
      setAccountAvailable(true);
      setMessage('');
    } else {
      setAccountAvailable(false);
    }
  };

  const _onCreateAccount = async () => {
    const available = await props.checkUsernameAvailable(username);
    console.log('username avail?', available);
    setAccountAvailable(available);
    if (available) {
      setMessage('The username is avaliable.');
      props.onCreateAccount(username);
    } else {
      setMessage('The username is already in use.');
    }
  };

  const iconContent = (
    <Icon
      size={16}
      color={theme.COLORS.MUTED}
      name="person"
      family="material"
    />
  );

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signup, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      <Block flex middle>
        <KeyboardAvoidingView behavior="height" enabled>
          <Block style={{marginVertical: height * 0.05}}>
            <Block
              row
              center
              space="between"
              style={{marginVertical: theme.SIZES.BASE * 1.875}}></Block>
          </Block>
          <Block
            middle
            style={{
              paddingVertical: theme.SIZES.BASE * 0.625,
              paddingHorizontal: 50,
            }}>
            <Text color="#fff" center size={theme.SIZES.FONT * 1.475}>
              {intl.formatMessage({id: 'Signup.header'})}
            </Text>
            <Text color="orange" center size={theme.SIZES.FONT * 0.875}>
              {intl.formatMessage({id: 'Signup.header_desc'})}
            </Text>
          </Block>

          <Block flex={1} center space="between">
            <Block center>
              <Input
                bgColor="transparent"
                placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
                borderless
                color="white"
                placeholder="Username"
                autoCapitalize="none"
                iconContent={iconContent}
                help={
                  accountAvailable ? (
                    <Text style={{color: 'orange'}}>{message}</Text>
                  ) : (
                    <Text style={{color: 'red'}}>{message}</Text>
                  )
                }
                bottomHelp
                style={[styles.input, active.user ? styles.inputActive : null]}
                onChangeText={(text: string) => _handleUsernameChange(text)}
              />
            </Block>
            <Block flex style={{marginTop: 20}}>
              <Button
                shadowless
                disabled={!accountAvailable}
                color={
                  accountAvailable
                    ? materialTheme.COLORS.BUTTON_COLOR
                    : materialTheme.COLORS.MUTED
                }
                style={styles.button}
                onPress={_onCreateAccount}>
                {intl.formatMessage({id: 'Signup.button'})}
              </Button>
              <Button
                color="transparent"
                shadowless
                style={styles.button}
                onPress={() => navigate({name: 'Login'})}>
                <Text
                  center
                  color={theme.COLORS.WHITE}
                  size={theme.SIZES.FONT * 0.75}>
                  {intl.formatMessage({id: 'Signup.signin_guide'})}
                </Text>
              </Button>
            </Block>
          </Block>
        </KeyboardAvoidingView>
      </Block>
    </LinearGradient>
  );
};

export {SignupScreen};

const styles = StyleSheet.create({
  signup: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
  },
  input: {
    width: width * 0.9,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
  },
  inputActive: {
    borderBottomColor: 'white',
  },
});
