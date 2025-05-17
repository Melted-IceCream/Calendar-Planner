import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { getTask, deleteTask } from '../backend/database'; // Import deleteTask from your database
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import icon library

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  end_time: string;
  location?: string;
}

const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    const tasksFromDb = await getTask() as Task[];
    setTasks(tasksFromDb);
  };

  const handleDeleteTask = (taskId: number, title: String) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete the task "${title}"?`,      
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
            fetchTasks(); // Refresh the task list after deletion
          },
        },
      ],
      { cancelable: true }
    );
  };

  const isToday = (date: string) => date === today;
  const isPastDue = (endDate: string) => new Date(endDate) < new Date(today);

  const renderItem = ({ item }: { item: Task }) => {
    const backgroundColor = isPastDue(item.end_date)
      ? '#f8d7da' // Red for past due
      : isToday(item.end_date) || isToday(item.start_date)
      ? '#fff3cd' // Yellow for today
      : '#ffffff'; // Default for upcoming

    return (
      <View style={[styles.taskItemContainer, { backgroundColor: backgroundColor }]}>
        <TouchableOpacity 
          style={[styles.taskContent, { backgroundColor: backgroundColor }]}
          onPress={() => router.push({
            pathname: '/hiddenScreens/editTask' as any,
            params: { id: item.id.toString() }
          })}>
          <View>
            <Text style={[styles.taskTitle, { backgroundColor: backgroundColor }]}>{item.title}</Text>
            <Text style={[styles.taskDescription, { backgroundColor: backgroundColor }]}>Details: {item.description}</Text>
            {/* <Text style={[styles.taskDate, { backgroundColor: backgroundColor }]}>Start Date: {item.start_date}</Text> */}
            <Text style={[styles.taskDate, { backgroundColor: backgroundColor }]}>End Date: {item.end_date}</Text>
            <Text style={[styles.taskDate, { backgroundColor: backgroundColor }]}>End Time: {item.end_time}</Text>
            {item.location && <Text style={styles.taskLocation}>Location: {item.location}</Text>}
          </View>
        </TouchableOpacity>

        {/* Delete Icon */}
        <TouchableOpacity onPress={() => handleDeleteTask(item.id, item.title)} style={styles.deleteIcon}>
          <Ionicons name="trash" size={24} color="#DC3545" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyList}>No tasks available.</Text>}
      />

      <Button 
        title="Add Task" 
        onPress={() => router.push({
          pathname: '/hiddenScreens/addTask' as any,
          params: {date: today}
        })} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
    width: '100%', // Ensure it takes the full width of the screen
  },
  taskContent: {
    flex: 1, // Make sure content takes up all available space
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
  },
  taskLocation: {
    fontSize: 12,
    color: '#999',
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  deleteIcon: {
    marginLeft: 10, // Add space between task content and delete icon
  },
});
