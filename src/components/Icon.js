import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../utils/theme';

// Single icon entry point so screens don't reach into font sets directly.
// set="mci" for MaterialCommunityIcons, otherwise Ionicons.
export default function Icon({name, size = 22, color = COLORS.text, set = 'ion', style}) {
  const Family = set === 'mci' ? MaterialCommunityIcons : Ionicons;
  return <Family name={name} size={size} color={color} style={style} />;
}
