import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  // Definimos los colores aquí directamente para asegurar el look futbolero
  const THEME_DARK = '#0f172a'; // Azul casi negro
  const THEME_GOLD = '#fbbf24'; // Dorado premium
  const THEME_INACTIVE = '#64748b'; // Gris azulado

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        // Configuración del color activo e inactivo
        tabBarActiveTintColor: THEME_GOLD,
        tabBarInactiveTintColor: THEME_INACTIVE,
        // Estilo de la barra
        tabBarStyle: {
          backgroundColor: THEME_DARK,
          borderTopWidth: 1,
          borderTopColor: '#334155',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 5,
          elevation: 10, // Sombra en Android
          shadowColor: '#000', // Sombra en iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        // Estilo de las etiquetas (Texto)
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '900',
          textTransform: 'uppercase', // Estilo marcador deportivo
          letterSpacing: 0.5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'INICIO',
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="home" size={focused ? 26 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="album"
        options={{
          title: 'ALBUM',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "cards-playing" : "cards-outline"} 
              size={focused ? 26 : 22} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="jugar"
        options={{
          title: 'BATALLA',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name="sword-cross" 
              size={focused ? 30 : 24} // El de jugar es más grande
              color={color}
            />
          ),
        }}
      />
       <Tabs.Screen
        name="perfil"
        options={{
          title: 'CLUB',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account-circle" : "account-circle-outline"} 
              size={focused ? 26 : 22} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}