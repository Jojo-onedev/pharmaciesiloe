// Déclaration de types pour @react-navigation/native
declare module '@react-navigation/native' {
  import * as React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
      [key: string]: any; // Pour les propriétés personnalisées
    };
  }

  export const DarkTheme: Theme;
  export const DefaultTheme: Theme;
  
  export interface ThemeProviderProps {
    value: Theme;
    children?: React.ReactNode;
  }
  
  export const ThemeProvider: React.ComponentType<ThemeProviderProps>;
  
  export function useTheme(): Theme;
  
  // Déclaration de la fonction adaptNavigationTheme
  export function adaptNavigationTheme(params: {
    reactNavigationLight: any;
    reactNavigationDark: any;
  }): {
    LightTheme: Theme;
    DarkTheme: Theme;
  };

  // Autres exports courants
  export * from '@react-navigation/core';
}
