import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import {COLORS} from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: COLORS.primary},
        headerShadowVisible: false,
        headerTintColor: COLORS.white,
        headerTitleAlign: 'center',
        headerTitleStyle: {fontWeight: '800'},
      }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'Create Account'}} />
    </Stack.Navigator>
  );
}
