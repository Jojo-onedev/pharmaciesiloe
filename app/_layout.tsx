import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { 
  Provider as PaperProvider, 
  adaptNavigationTheme,
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
  type MD3Theme
} from 'react-native-paper';
import { AppProvider } from '@/context/AppContext';
import 'react-native-reanimated';

// @ts-ignore - Ignorer les erreurs de typage pour React Navigation
const ReactNavigation = require('@react-navigation/native');

// Configuration des polices
const fontConfig = {
  labelLarge: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  titleMedium: {
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  headlineMedium: {
    fontFamily: 'sans-serif',
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
};

type CustomTheme = MD3Theme & {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    [key: string]: any;
  };
};
const { DarkTheme: NavigationDarkTheme, DefaultTheme: NavigationDefaultTheme, ThemeProvider } = ReactNavigation;

// Configuration des thèmes avec adaptation pour la navigation
const { LightTheme: AdaptedLightTheme, DarkTheme: AdaptedDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});


const lightTheme: CustomTheme = {
  ...MD3LightTheme,
  ...AdaptedLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...AdaptedLightTheme.colors,
    // Propriétés requises par React Navigation
    primary: '#2E7D32',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#212121',
    border: '#E0E0E0',
    notification: '#2E7D32',
    
    // Propriétés personnalisées
    primaryContainer: '#A5D6A7',
    secondary: '#2E7D32',
    secondaryContainer: '#C8E6C9',
    surface: '#FFFFFF',
    surfaceVariant: '#E8F5E9',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#212121',
    onSurface: '#212121',
    error: '#D32F2F',
    errorContainer: '#FFCDD2',
    onError: '#FFFFFF',
    onErrorContainer: '#B71C1C',
  },
  fonts: configureFonts({ config: fontConfig }),
  version: 3,
};

const darkTheme: CustomTheme = {
  ...MD3DarkTheme,
  ...AdaptedDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...AdaptedDarkTheme.colors,
    // Propriétés requises par React Navigation
    primary: '#4CAF50',
    background: '#121212',
    card: '#1E1E1E',
    text: '#E0E0E0',
    border: '#424242',
    notification: '#4CAF50',
    
    // Propriétés personnalisées
    primaryContainer: '#2E7D32',
    secondary: '#4CAF50',
    secondaryContainer: '#1B5E20',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#E0E0E0',
    onSurface: '#E0E0E0',
    error: '#EF9A9A',
    errorContainer: '#C62828',
    onError: '#000000',
    onErrorContainer: '#FFCDD2',
  },
  fonts: configureFonts({ config: fontConfig }),
  version: 3,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const colorScheme = useColorScheme() || 'light';
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProvider>
      <ThemeProvider value={theme}>
        <PaperProvider theme={theme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme} />
        </PaperProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
