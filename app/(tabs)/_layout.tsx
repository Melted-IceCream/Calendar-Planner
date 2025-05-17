import React from 'react';
import { FontAwesome, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Tabs, Link } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Index Page',
          tabBarIcon: () => <FontAwesome name="home" color='#333333' size={30} />, 
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialCommunityIcons
                    name="weather-sunny"
                    size={40}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: () => <FontAwesome name="calendar-o" color='#333333' size={24} />, 
        }}
      />

      <Tabs.Screen
        name="weather"
        options={{
          title: 'Weather',
          tabBarIcon: () => <MaterialCommunityIcons name="weather-sunny" color='#333333' size={24} />,
        }}
      />

    <Tabs.Screen
        name="todo"
        options={{
          title: 'To-Do',
          tabBarIcon: () => <FontAwesome5 name="tasks" color='#333333' size={24} />,
          headerRight: () => (
            <Link href="/(tabs)/weather" asChild>
              <Pressable>
                {({ pressed }) => (
                   <MaterialCommunityIcons
                   name="weather-sunny"
                   size={40}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}