import { useColorScheme as _useColorScheme } from 'react-native';

// This hook is a wrapper around the built-in useColorScheme hook
// to provide a default value of 'light' when the color scheme is not available
export function useColorScheme() {
  const colorScheme = _useColorScheme();
  return colorScheme || 'light';
}
