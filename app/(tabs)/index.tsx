import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, FlatList, Button, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { createTable, getActivity, getTask } from '../backend/database';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  end_time: string;
  location?: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
}

interface WeatherData {
  date: string;
  summary_forecast: string;
  min_temp: number;
  max_temp: number;
}

const today = new Date().toISOString().split('T')[0];

export default function TabOneScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayForecast, setTodayForecast] = useState<string | null>(null);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
  useEffect(() => {
    createTable();
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          alert('Permission for notifications was denied');
        }
      }
      // Create a notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Channel',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
      fetchWeather();
    }, [])
  );
  
  const fetchAllData = async () => {
    const allTasks = await getTask() as Task[];
    const allActivities = await getActivity() as Activity[];

    // Filter tasks and activities starting from today
    const filteredTasks = allTasks.filter(task => task.start_date >= today);
    const filteredActivities = allActivities.filter(activity => activity.date >= today);

    setTasks(filteredTasks);
    setActivities(filteredActivities);
  };

  const weatherTranslations: { [key: string]: string } = {
    'Berjerebu': 'Hazy',
    'Tiada hujan': 'No rain',
    'Hujan': 'Rain',
    'Hujan di beberapa tempat': 'Scattered rain',
    'Hujan di satu dua tempat': 'Isolated Rain',
    'Hujan di satu dua tempat di kawasan pantai': 'Isolated rain over coastal areas',
    'Hujan di satu dua tempat di kawasan pedalaman': 'Isolated rain over inland areas',
    'Ribut petir': 'Thunderstorms',
    'Ribut petir di beberapa tempat': 'Scattered thunderstorms',
    'Ribut petir di beberapa tempat di kawasan pedalaman': 'Scattered thunderstorms over inland areas',
    'Ribut petir di satu dua tempat': 'Isolated thunderstorms',
    'Ribut petir di satu dua tempat di kawasan pantai': 'Isolated thunderstorms over coastal areas',
    'Ribut petir di satu dua tempat di kawasan pedalaman': 'Isolated thunderstorms over inland areas',
    'Pagi': 'Morning',
    'Malam': 'Night',
    'Petang': 'Afternoon',
    'Pagi dan Petang': 'Morning and Afternoon',
    'Pagi dan Malam': 'Morning and Night',
    'Petang dan Malam': 'Afternoon and Night',
    'Sepanjang Hari': 'Throughout the Day'
  };
  
  const translateWeatherDescription = (description: string) => {
    return weatherTranslations[description] || description; // Fallback to original if not found
  };
  
  const parseWeatherData = (data: any): WeatherData[] => {
    return data.map((day: any) => ({
      date: day.date,
      summary_forecast: translateWeatherDescription(day.summary_forecast),
      min_temp: day.min_temp,
      max_temp: day.max_temp,
    }));
  };

  const fetchWeather = async () => {
    try {
      const response = await fetch('https://api.data.gov.my/weather/forecast?contains=Cheras@location__location_name');
      const data = await response.json();
      const parsedData = parseWeatherData(data);
      const todayWeather = parsedData.find((day: { date: string; }) => day.date === today);
      if (todayWeather) {
        setTodayForecast(todayWeather.summary_forecast);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
  };
  }
  const isToday = (date: string) => date === today;

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[styles.item, isToday(item.start_date) && styles.todayItem]}>
      <Text style={styles.itemTitle}>Task: {item.title}</Text>
      <Text>{item.description}</Text>
      <Text>Start Date: {item.start_date}</Text>
      <Text>End Date: {item.end_date}</Text>
      <Text>Dateline: {item.end_time}</Text>
    </View>
  );

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={[styles.item, isToday(item.date) && styles.todayItem]}>
      <Text style={styles.itemTitle}>Activity: {item.title}</Text>
      <Text>Details: {item.description}</Text>
      <Text>Date: {item.date}</Text>
      <Text>Time: {item.time}</Text>
    </View>
  );
  const sendNotification = async () => {
    console.log("cat")
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming task: Buy Groceries',
        body: 'Buy milk, bread and eggs.',
      },
      trigger: null, // triggers immediately
    });
  };

  return (
    <View style={styles.container}>
      {todayForecast && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>Today's Weather:</Text>
          <Text>{todayForecast}</Text>
        </View>
      )}
      <Text style={styles.title}>Today's Overview</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Text style={styles.subtitle}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTaskItem}
        ListEmptyComponent={<Text>No tasks starting from today.</Text>}
        contentContainerStyle={styles.listContainer}
      />

      <Text style={styles.subtitle}>Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderActivityItem}
        ListEmptyComponent={<Text>No activities starting from today.</Text>}
        contentContainerStyle={styles.listContainer}
      />
    <Button title="Send Notification" onPress={sendNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  forecastContainer: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'left',
    width: '100%',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    width: '100%',  // Take up full horizontal space
    elevation: 2,
  },
  todayItem: {
    backgroundColor: '#ffccbc',  // Highlight color for today
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  listContainer: {
    width: '100%',  // Ensure FlatList takes up full width
    elevation: 2,
  },
});
