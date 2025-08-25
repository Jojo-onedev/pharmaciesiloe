import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans
import ProductsScreen from '../screens/ProductsScreen/ProductsScreen';
import OrderScreen from '../screens/OrderScreen/OrderScreen';
import PdfScreen from '../screens/PdfScreen/PdfScreen';
import { theme } from '../constants/theme';

// Création des navigateurs
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de navigation pour l'onglet Commande
const OrderStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrderMain" component={OrderScreen} />
    <Stack.Screen 
      name="Pdf" 
      component={PdfScreen} 
      options={{
        headerShown: true,
        title: 'Commande générée',
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// Composant principal de navigation avec onglets
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Produits') {
            iconName = focused ? 'medkit' : 'medkit-outline';
          } else if (route.name === 'Commande') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Exporter') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Produits" 
        component={ProductsScreen} 
        options={{ 
          title: 'Produits',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Commande" 
        component={OrderStack} 
        options={{ 
          title: 'Commander',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Exporter" 
        component={PdfScreen} 
        options={{ 
          title: 'Exporter',
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
