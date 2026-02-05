import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="album"
        options={{
          title: 'Colección',
          tabBarIcon: ({ color }) => <Ionicons name="albums-outline" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="jugar"
        options={{
          title: 'Partidas',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="gamepad-variant-outline" size={24} color={color}/>,
        }}
      />
       <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) =><MaterialCommunityIcons name="account-settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
