import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import {Block, Button, Input, Text, theme} from 'galio-framework';

import LinearGradient from 'react-native-linear-gradient';
import {argonTheme, materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';
import {navigate} from '~/navigation/service';

import {useIntl} from 'react-intl';

const {width, height} = Dimensions.get('window');

interface Props {
  processLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginScreen = (props: Props): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPasword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [active, setActive] = useState({username: false, password: false});
  // temp
  //  const [passwordEditable, setPasswordEditable] = useState(false);
  const intl = useIntl();

  // useEffect(() => {
  //   setTimeout(() => setPasswordEditable(true), 100);
  // }, []);

  const _handleUsernameChange = (value: string): void => {
    // set username
    setUsername(value);
    // clear message
    setMessage('');
  };

  const _handlePasswordChange = (value: string): void => {
    // set password
    setPasword(value);
    // clear message
    setMessage('');
  };

  const _processLogin = async () => {
    setLoading(true);
    const success = await props.processLogin(username, password);
    setLoading(false);
    // clean up
    if (success) {
      setUsername('');
      setPasword('');
      setMessage('');
    }
  };

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signin, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      <Block flex middle>
        <Block middle>
          <Block
            row
            center
            space="between"
            style={{marginVertical: theme.SIZES.BASE * 1.875}}></Block>
        </Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 2.625,
            paddingHorizontal: 50,
          }}>
          <Text center color="white" size={24}>
            {intl.formatMessage({id: 'Login.header'})}
          </Text>
          <Text center color="white" size={14}>
            {intl.formatMessage({id: 'Login.header_desc'})}
          </Text>
        </Block>
        <Block flex={1} center space="between">
          <Block center>
            <Input
              borderless
              color="white"
              placeholder="Username"
              type="email-address"
              autoCapitalize="none"
              bgColor="transparent"
              onBlur={() => console.log('onBlur username')}
              onFocus={() => console.log('onFocus username')}
              placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
              onChangeText={(text: string) => _handleUsernameChange(text)}
              style={[
                styles.input,
                active.username ? styles.inputActive : null,
              ]}
            />
            <Input
              password
              viewPass
              borderless
              color="white"
              iconColor="white"
              placeholder="Password"
              bgColor="transparent"
              onBlur={() => console.log('onBlur password')}
              onFocus={() => console.log('onFocus password')}
              placeholderTextColor={materialTheme.COLORS.PLACEHOLDER}
              onChangeText={(text: string) => _handlePasswordChange(text)}
              style={[
                styles.input,
                active.password ? styles.inputActive : null,
              ]}
            />
            <Text style={{color: 'red'}}>{message}</Text>
          </Block>
          <Block flex top style={{marginTop: 20}}>
            <Button
              shadowless
              color={argonTheme.COLORS.ERROR}
              style={styles.button}
              loading={loading}
              onPress={_processLogin}>
              {intl.formatMessage({id: 'Login.button'})}
            </Button>
            <Button
              color="transparent"
              shadowless
              style={styles.button}
              onPress={() => navigate({name: 'SignUp'})}>
              <Text
                center
                color={theme.COLORS.WHITE}
                size={theme.SIZES.FONT * 0.9}
                style={{marginTop: 20}}>
                {intl.formatMessage({id: 'Login.signup_guide'})}
              </Text>
            </Button>
          </Block>
        </Block>
      </Block>
    </LinearGradient>
  );
};

export {LoginScreen};

const styles = StyleSheet.create({
  signin: {
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
