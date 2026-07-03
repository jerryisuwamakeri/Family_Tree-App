import React from 'react';
import {StatusBar, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import RootNavigator from './src/navigation';
import {COLORS} from './src/utils/theme';

function AppInner() {
  const {resetTimer} = useAuth();
  return (
    <View
      style={{flex: 1}}
      onStartShouldSetResponder={() => { resetTimer(); return false; }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
