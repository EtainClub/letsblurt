import React from 'react';
import {
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ListView,
} from 'react-native';
import {Block, Text, theme, Icon} from 'galio-framework';
import {useSafeArea} from 'react-native-safe-area-context';
import {Drawer as DrawerCustomItem} from '../components/';
import {argonTheme, Images, materialTheme} from '../constants/';
import {navigate} from '../navigation/service';

const {width} = Dimensions.get('screen');

function CustomDrawerContent({
  drawerPosition,
  profile,
  focused,
  state,
  ...rest
}) {
  const insets = useSafeArea();
  const screens = ['Feed', 'Settings'];
  return (
    <Block
      style={styles.container}
      forceInset={{top: 'always', horizontal: 'never'}}>
      <Block flex={0.5} style={styles.header}>
        <TouchableWithoutFeedback onPress={() => navigate({name: 'Profile'})}>
          <Block style={styles.profile}>
            <Image
              source={{uri: profile.avatar || null}}
              style={styles.avatar}
            />
            <Text h5 color={'white'}>
              {profile.name}
            </Text>
          </Block>
        </TouchableWithoutFeedback>
        <Block row>
          <Text size={16} muted style={styles.seller}>
            {profile.type}
          </Text>
          <Text size={16} color={materialTheme.COLORS.WARNING}>
            {profile.rating}
            <Icon name="star" family="font-awesome" size={14} />
          </Text>
        </Block>
      </Block>
      <Block flex style={{paddingLeft: 7, paddingRight: 14}}>
        <ScrollView
          contentContainerStyle={[
            {
              paddingTop: insets.top * 0.4,
              paddingLeft: drawerPosition === 'left' ? insets.left : 0,
              paddingRight: drawerPosition === 'right' ? insets.right : 0,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          {screens.map((item, index) => {
            return (
              <DrawerCustomItem
                title={item}
                key={index}
                focused={state.index === index ? true : false}
              />
            );
          })}
        </ScrollView>
      </Block>
      <Block flex={0.5} style={{paddingLeft: 7, paddingRight: 14}}>
        <DrawerCustomItem
          title="Login"
          focused={state.index === 8 ? true : false}
        />
        <DrawerCustomItem
          title="SignUp"
          focused={state.index === 9 ? true : false}
        />
      </Block>
    </Block>
  );
}

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: argonTheme.COLORS.FACEBOOK,
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
  },
  profile: {
    marginBottom: theme.SIZES.BASE / 2,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginBottom: theme.SIZES.BASE,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
    height: 19,
    width: 42,
  },
  seller: {
    marginRight: 16,
  },
});
