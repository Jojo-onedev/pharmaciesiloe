import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <NavigationContainer theme={{
            colors: {
              background: theme.colors.background,
              primary: theme.colors.primary,
              card: theme.colors.primary,
              text: '#FFFFFF',
              border: 'transparent',
              notification: theme.colors.accent,
            },
          }}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
