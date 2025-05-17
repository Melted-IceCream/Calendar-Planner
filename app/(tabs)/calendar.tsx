import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View as RNView, ScrollView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Calendar } from 'react-native-calendars';
import { getActivityByDate, getTaskByDate, deleteTask, deleteActivity } from '../backend/database';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  weather?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  end_time: string;
  location?: string;
}

export default function CalendarScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState({ [today]: { selected: true, selectedColor: '#20C997' } });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDateInPast, setIsDateInPast] = useState(false);

  useEffect(() => {
    const selectedDay = Object.keys(selectedDate)[0];
    const currentDay = new Date(today);
    if (selectedDay) {
      setIsDateInPast(new Date(selectedDay) < currentDay);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      const selectedDay = Object.keys(selectedDate)[0];
      fetchActivitiesandTasks(selectedDay);
    }, [selectedDate])
  );

  const fetchActivitiesandTasks = async (date: string) => {
    try {
      const activitiesForDate = await getActivityByDate(date) as Activity[];
      setActivities(activitiesForDate);
      const tasksForDate = await getTaskByDate(date) as Task[];
      setTasks(tasksForDate);
    } catch (error) {
      console.error('Error fetching activities and tasks:', error);
    }
  };

  const handleDayPress = (day: { dateString: string }) => {
    const selectedDay = day.dateString;
    const currentDay = new Date(today);
    let selectedColor = '#20C997';

    if (new Date(selectedDay) > currentDay) {
      selectedColor = '#28A745';
    } else if (new Date(selectedDay) < currentDay) {
      selectedColor = '#6C757D';
    }

    setSelectedDate({ [selectedDay]: { selected: true, selectedColor: selectedColor } });
    fetchActivitiesandTasks(selectedDay);
  };

  const handleDeleteActivity = (id: number, title: string) => {
    Alert.alert(
      'Delete Activity', // Title of the alert
      `Are you sure you want to delete the activity "${title}"?`, // Message showing the activity title
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteActivity(id);
              setActivities(activities.filter(activity => activity.id !== id));
            } catch (error) {
              console.error('Error deleting activity:', error);
            }
          },
          style: 'destructive', // Makes the "Delete" button red on iOS
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteTask = (id: number, title: string) => {
    Alert.alert(
      'Delete Task', // Title of the alert
      `Are you sure you want to delete the task "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteTask(id);
              setTasks(tasks.filter(task => task.id !== id));
            } catch (error) {
              console.error('Error deleting task:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            backgroundColor: '#F5F5F5',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#333333',
            dayTextColor: '#000000',
            selectedDayBackgroundColor: '#B3E5FC',
            selectedDayTextColor: '#FFFFFF',
          }}
          current={today}
          monthFormat={'MMM yyyy'}
          markedDates={selectedDate}
          onDayPress={handleDayPress}
        />
      </View>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <ScrollView horizontal contentContainerStyle={styles.contentContainer}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity 
                  style={styles.activityItem} 
                  onPress={() => router.push({
                    pathname: '/hiddenScreens/editActivity',
                    params: { id: item.id }
                  })}
                >
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDescription}>{item.description}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteIcon} 
                  onPress={() => handleDeleteActivity(item.id, item.title)}
                >
                  <Ionicons name="trash" size={24} color="#DC3545" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No activities for this date.</Text>}
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity 
                  style={styles.activityItem} 
                  onPress={() => router.push({
                    pathname: '/hiddenScreens/editTask',
                    params: { id: item.id }
                  })}
                >
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDescription}>{item.description}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteIcon} 
                  onPress={() => handleDeleteTask(item.id, item.title)}
                >
                  <Ionicons name="trash" size={24} color="#DC3545" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No tasks for this date.</Text>}
          />
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.button, isDateInPast && styles.buttonDisabled]} 
        onPress={() => !isDateInPast && router.push({
          pathname: '/hiddenScreens/addActivity' as any,
          params: { date: Object.keys(selectedDate)[0] }
        })}
        disabled={isDateInPast}
        >
        <Text style={styles.buttonText}>Add Activities</Text>
      </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, isDateInPast && styles.buttonDisabled]}
          onPress={() => !isDateInPast && router.push({
            pathname: '/hiddenScreens/addTask' as any,
            params: { date: Object.keys(selectedDate)[0], tasks: JSON.stringify(tasks) }
          })}
          disabled={isDateInPast}
        >
          <Text style={styles.buttonText}>Add Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '85%',
    backgroundColor: '#6C757D',
    alignSelf: 'center'
  },
  calendarContainer: {
    width: '90%',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 185,
    maxWidth: 185,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center'
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  activityItem: {
    flex: 1,
    padding: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
  },
  deleteIcon: {
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#20C997',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  buttonDisabled: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});
