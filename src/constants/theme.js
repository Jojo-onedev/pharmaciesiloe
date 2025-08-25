import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // Vert foncé pour la pharmacie
    accent: '#4CAF50',  // Vert plus clair pour les accents
    background: '#F5F5F5', // Fond gris clair
    surface: '#FFFFFF',  // Fond des cartes et surfaces
    text: '#212121',    // Texte principal
    error: '#D32F2F',   // Rouge pour les erreurs
  },
  roundness: 8, // Coins arrondis pour les composants
};

export const screenOptions = {
  headerStyle: {
    backgroundColor: '#2E7D32',
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};
