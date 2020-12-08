import React, {useState} from 'react';
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Clipboard,
} from 'react-native';
import {
  Block,
  Button,
  Text,
  theme,
  Toast,
  Checkbox,
  Icon,
} from 'galio-framework';

import LinearGradient from 'react-native-linear-gradient';
import {materialTheme} from '~/constants/';
import {HeaderHeight, iPhoneX} from '~/constants/utils';

import {navigate} from '~/navigation/service';

import {useIntl} from 'react-intl';

const {width, height} = Dimensions.get('window');

interface Props {
  account: string;
  password: string;
}

const AccountScreen = (props: Props): JSX.Element => {
  const intl = useIntl();
  const [copied, setCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const copyPasswordToClipboard = async (password: string) => {
    console.log('Clipboard', Clipboard);
    Clipboard.setString(password);
    // check
    const text = await Clipboard.getString();
    console.log('copied text', text);
    // update state to show toast
    setCopied(true);
  };

  const _renderKey = () => {
    return (
      <Block flex={1} center space="between">
        <Toast
          isShow={copied}
          style={{width: '100%'}}
          round
          positionIndicator="center"
          textStyle={{textAlign: 'center', fontSize: 16}}
          fadeInDuration={300}
          fadeOutDuration={300}
          color="warning">
          {intl.formatMessage({id: 'Signup.msg_copied'})}
        </Toast>
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
            {`${intl.formatMessage({id: 'account'})}: ${props.account}`}
          </Text>
          <Text color="red" center size={theme.SIZES.FONT * 0.875}>
            {intl.formatMessage({id: 'Signup.key_guide'})}
          </Text>
        </Block>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 0.625,
            paddingHorizontal: 50,
          }}>
          <Text color="orange" center size={theme.SIZES.FONT * 0.875}>
            {props.password}
          </Text>
        </Block>
        <Block flex center style={{marginTop: 20}}>
          <Button
            shadowless
            style={styles.button}
            color={materialTheme.COLORS.BUTTON_COLOR}
            onPress={() => copyPasswordToClipboard(props.password)}>
            {intl.formatMessage({id: 'Signup.copy_key'})}
          </Button>
          <Block style={{marginTop: 20}}>
            <Checkbox
              color="primary"
              labelStyle={{color: 'red'}}
              initialValue={false}
              flexDirection="row-reverse"
              label={intl.formatMessage({id: 'Signup.confirm_check'})}
              onChange={async () => {
                setKeyCopied(!keyCopied);
                console.log('key copied', keyCopied);
              }}
            />
          </Block>
          <Button
            shadowless
            disabled={!keyCopied}
            style={styles.button}
            color={
              keyCopied
                ? materialTheme.COLORS.ERROR
                : materialTheme.COLORS.MUTED
            }
            onPress={() => {
              setFinalized(true);
              console.log('finish button, key copied?', keyCopied);
            }}>
            {intl.formatMessage({id: 'Signup.finish_button'})}
          </Button>
        </Block>
      </Block>
    );
  };

  const _renderWelcome = () => {
    return (
      <KeyboardAvoidingView behavior="height" enabled>
        <Block
          middle
          style={{
            paddingVertical: theme.SIZES.BASE * 0.625,
            paddingHorizontal: 50,
          }}>
          <Text color="#fff" center size={theme.SIZES.FONT * 1.475}>
            {intl.formatMessage({id: 'Signup.welcome_header'})}
          </Text>
          <Text color="red" center size={theme.SIZES.FONT * 0.875}>
            {intl.formatMessage({id: 'Signup.welcome_guide'})}
          </Text>
        </Block>
        <Block flex center style={{marginTop: 20}}>
          <Button
            shadowless
            style={styles.button}
            color={materialTheme.COLORS.BUTTON_COLOR}
            onPress={() => navigate({name: 'Login'})}>
            {intl.formatMessage({id: 'Signup.login_button'})}
          </Button>
          <Button
            color="transparent"
            shadowless
            style={styles.button}
            onPress={() => navigate({name: 'Home'})}>
            <Text
              center
              color={theme.COLORS.WHITE}
              size={theme.SIZES.FONT * 0.75}>
              {intl.formatMessage({id: 'Signup.home_button'})}
            </Text>
          </Button>
        </Block>
      </KeyboardAvoidingView>
    );
  };

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0.25, y: 1.1}}
      locations={[0.2, 1]}
      colors={['#6C24AA', '#15002B']}
      style={[styles.signup, {flex: 1, paddingTop: theme.SIZES.BASE * 4}]}>
      {finalized ? _renderWelcome() : _renderKey()}
    </LinearGradient>
  );
};

export {AccountScreen};

const styles = StyleSheet.create({
  signup: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight + 70 : 0,
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    width: width - theme.SIZES.BASE * 2,
  },
});
