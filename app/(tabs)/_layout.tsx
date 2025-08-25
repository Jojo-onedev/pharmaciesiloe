import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#FFFFFF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2E7D32',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          margin: 5,
          marginTop: 3,
          marginBottom: 3,
          paddingVertical: 1,
          height: 'auto',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarLabelStyle: {
          fontSize: 12,
          margin: 0,
          padding: 0,
        },
      }}>
     
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Produits',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="medical-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="order/index"
        options={{
          title: 'Commander',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="cart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="export/index"
        options={{
          title: 'Exporter',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="document-text" size={24} color={color} />,
        }}
      />
       <Tabs.Screen
        name="index"
        options={{
          title: 'À propos',
          tabBarIcon: ({ color }: { color: string }) => <Ionicons name="information-circle-outline" size={24} color={color} />,
        }}
      />
      {/* Écrans masqués de la barre d'onglets */}
      <Tabs.Screen
        name="export/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
