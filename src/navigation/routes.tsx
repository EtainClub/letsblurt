import React, {useContext} from 'react';
import {Platform, Dimensions} from 'react-native';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import {Icon} from 'galio-framework';
import {injectIntl} from 'react-intl';

import {AuthContext} from '~/contexts';

// screens
import {
  Feed,
  PostDetails,
  SearchFeed,
  Profile,
  AuthorProfile,
  AuthorList,
  Posting,
  Wallet,
  Notification,
  Login,
  ResolveAuth,
  WelcomeScreen,
  Settings,
  Signup,
} from '../screens';
import CustomDrawerContent from './Menu';

import {Header} from '../components/';
// themes
import {materialTheme} from '~/constants/';
import {argonTheme} from '~/constants';

const {width} = Dimensions.get('screen');

// navigation
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
// navigation params
import {BottomTabParams, DrawerParams} from './types';

//// create navigators
//
const Stack = createStackNavigator();
// top navigator: Drawer
const Drawer = createDrawerNavigator<DrawerParams>();
// the drawer includes Bottom Tab
//const Tab = createBottomTabNavigator<BottomTabParams>();
const Tab = createMaterialBottomTabNavigator<BottomTabParams>();

//// navigation props

const LandingStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="none">
      <Stack.Screen
        name="ResolveAuth"
        component={ResolveAuth}
        options={{
          headerTransparent: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
};

// use the navigators
const TabFeedStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={{
          header: ({navigation}) => {
            return <Header title="Feed" navigation={navigation} />;
          },
        }}
      />
      {/* <Stack.Screen
        name="PostDetails"
        component={PostDetails}
        options={{
          header: ({navigation}) => {
            return <Header title="Post" navigation={navigation} />;
          },
        }}
      /> */}
      <Stack.Screen
        name="SearchFeed"
        component={SearchFeed}
        options={{
          header: ({navigation}) => {
            return <Header title="Search" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabNotificationStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          header: ({navigation}) => {
            return <Header title="Notification" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabProfileStack = (props): JSX.Element => {
  console.log('TabProfileStack props', props);

  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({navigation}) => {
            return <Header title="Profile" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabPostingStack = (): JSX.Element => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Posting"
        component={Posting}
        options={{
          header: ({navigation}) => {
            return <Header title="Posting" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabWalletStack = (): JSX.Element => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{
          header: ({navigation}) => {
            return <Header title="Wallet" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const TabIconSize: number = 22;
const TabNavigator = (props) => {
  console.log('TabNavigator props', props);
  // get route name
  const {route} = props;
  // check loggedin for profile, wallet, notification, posting
  const {authState} = useContext(AuthContext);
  const {loggedIn} = authState;
  let disable = true;
  // if (route !== 'Feed' && !loggedIn) return?
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      labeled={true}
      barStyle={{
        backgroundColor: argonTheme.COLORS.ERROR,
      }}>
      <Tab.Screen
        name="Feed"
        component={TabFeedStack}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({focused}) => (
            <Icon
              name="feed"
              family="font-awesome"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={TabNotificationStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="notifications"
              family="ionicon"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Posting"
        component={TabPostingStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="pencil"
              family="font-awesome"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={TabProfileStack}
        listeners={({navigation, route}) => ({
          tabPress: (e) => {
            e.preventDefault();
            console.log('tab press, props', props);
            navigation.navigate('Profile');
          },
        })}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="user-alt"
              family="font-awesome-5"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={TabWalletStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="wallet"
              family="entypo"
              size={TabIconSize}
              color={focused ? argonTheme.COLORS.TEXT : 'white'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const profile = {
  username: 'etainclub',
};

const PostDetailsStack = () => (
  <Stack.Navigator mode="card" headerMode="screen">
    <Stack.Screen
      name="PostDetails"
      component={PostDetails}
      options={{
        header: ({navigation}) => {
          return <Header title="Post" navigation={navigation} />;
        },
      }}
    />
  </Stack.Navigator>
);

const AuthorStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="AuthorProfile"
        component={AuthorProfile}
        options={{
          header: ({navigation}) => {
            return <Header title="Author" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const AuthorListStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="AuthorList"
        component={AuthorList}
        options={{
          header: ({navigation}) => {
            return <Header title="Author List" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          header: ({navigation}) => {
            return <Header title="Settings" navigation={navigation} />;
          },
        }}
      />
    </Stack.Navigator>
  );
};

const DrawerNavigator = (props) => {
  console.log('DrawerNavigator props', props);
  const {authState} = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} profile={profile} />
      )}
      drawerStyle={{
        backgroundColor: 'white',
        width: width * 0.6,
      }}
      drawerContentOptions={{
        activeTintColor: 'white',
        inactiveTintColor: '#000',
        activeBackgroundColor: materialTheme.COLORS.ACTIVE,
        inactiveBackgroundColor: 'transparent',
        itemStyle: {
          width: width * 0.74,
          paddingHorizontal: 12,
          // paddingVertical: 4,
          justifyContent: 'center',
          alignContent: 'center',
          // alignItems: 'center',
          overflow: 'hidden',
        },
        labelStyle: {
          fontSize: 18,
          fontWeight: 'normal',
        },
      }}
      initialRouteName="Feed">
      <Drawer.Screen name="Feed" component={TabNavigator} />
      <Drawer.Screen name="Login" component={Login} />
      <Drawer.Screen name="SignUp" component={Signup} />
      <Drawer.Screen name="Add" component={Login} />
      <Drawer.Screen name="AuthorProfile" component={AuthorStack} />
      <Drawer.Screen name="AuthorList" component={AuthorListStack} />
      <Drawer.Screen name="PostDetails" component={PostDetailsStack} />
      {!authState.loggedIn ? (
        <Drawer.Screen name="Logout" component={Login} />
      ) : (
        <>
          {/* <Drawer.Screen name="Login" component={Login} />

          <Drawer.Screen name="SignUp" component={Signup} /> */}
        </>
      )}
      <Drawer.Screen name="Settings" component={SettingsStack} />
    </Drawer.Navigator>
  );
};

const NavigationStack = ({intl}) => {
  const {authState} = useContext(AuthContext);

  return (
    <Stack.Navigator mode="card" headerMode="none">
      {!authState.authResolved && (
        <Stack.Screen
          name="Landing"
          component={LandingStack}
          options={{
            headerTransparent: true,
          }}
        />
      )}
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

export default injectIntl(NavigationStack);

/*
// signup, phone verify, account stack
const DrawerSignupStack = (): JSX.Element => {
  console.log('DrawerSignupStack');
  console.log('SignupStack');
  return (
    <Stack.Navigator initialRouteName="SignUp" mode="card">
      <Stack.Screen
        name="SignUp"
        component={Signup}
        options={{
          header: () => <Header transparent title="SignUp" />,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="PhoneVerify"
        component={Signup}
        options={{
          header: () => <Header back transparent title="SignUp" />,
        }}
      />
      <Stack.Screen
        name="AccountCreation"
        component={Signup}
        options={{
          header: () => <Header back transparent title="SignUp" />,
        }}
      />
    </Stack.Navigator>
  );
};
*/
