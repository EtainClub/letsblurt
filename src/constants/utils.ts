import {Platform, StatusBar, Dimensions} from 'react-native';
import {theme} from 'galio-framework';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const StatusHeight = StatusBar.currentHeight;
//export const HeaderHeight = (theme.SIZES.BASE * 4 + StatusHeight);
const HeaderHeight = theme.SIZES.BASE * 3.5 + (StatusHeight || 0);
const iPhoneX = () =>
  Platform.OS === 'ios' && (height === 812 || width === 812);

export {StatusHeight, HeaderHeight, iPhoneX};

export const POST_TITLE_LENGTH = 45;
export const LIST_TITLE_LENGTH = 35;
