import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { FontAwesome, MaterialCommunityIcons} from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav/>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="hiddenScreens/addActivity" 
                      options={{ title: 'Add Activity',
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
                      }}/>
        <Stack.Screen name="hiddenScreens/editActivity" 
                      options={{ title: 'Edit Activity',
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
                      }}/>
        <Stack.Screen name="hiddenScreens/addTask" 
                      options={{ title: 'Add Task',
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
                      }}/>
        <Stack.Screen name="hiddenScreens/editTask" 
                      options={{ title: 'Edit Task',
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
                      }}/>
        <Stack.Screen name="hiddenScreens/changeLocation" 
                      options={{ title: 'Change Location',
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
                      }}/>
      </Stack>
    </ThemeProvider>
  );
}
