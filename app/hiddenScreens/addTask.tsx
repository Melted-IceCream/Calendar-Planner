import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, FlatList, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask, getTaskByDate } from '../backend/database';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Define the Task type
type Task = {
  id: number;
  title: string;
  description: string;
  end_date: string;
  end_time: string;
  location: string;
};

export default function AddTask() {
  const { date } = useLocalSearchParams(); // Get the date from route parameters
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    start_date: date as string, // Use passed date
    end_date: date as string,   // Default to the passed date
    end_time: '',
    location: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const router = useRouter();

  // Fetch tasks based on date when the component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksForDate= await getTaskByDate(date as string) as Task[];
        setTasks(tasksForDate);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [date]);

  const handleAddTask = async () => {
    if (newTask.title.trim() === '') {
      alert('Task title is required');
      return;
    }

    const { title, description, start_date, end_date, end_time, location } = newTask;
  
    await addTask(title, description, start_date, end_date, end_time, location);
    
    router.back();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTask({ ...newTask, end_date: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNewTask({ ...newTask, end_time: selectedTime.toTimeString().split(' ')[0] });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Task for {date}</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.taskDescription}>No tasks for this date.</Text>}
      />

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={newTask.title}
        onChangeText={(text) => setNewTask({ ...newTask, title: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={newTask.description}
        onChangeText={(text) => setNewTask({ ...newTask, description: text })}
      />

      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={newTask.end_date}
          editable={false} // Date is picked from the calendar
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(newTask.end_date)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>End Time</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <TextInput
          style={styles.input}
          value={newTask.end_time}
          editable={false} // Time is picked from the time picker
        />
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text style={styles.label}>Location (optional)</Text>
      <TextInput
        style={styles.input}
        value={newTask.location}
        onChangeText={(text) => setNewTask({ ...newTask, location: text })}
      />

      <Button title="Add Task" onPress={handleAddTask} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  taskItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 16,
    color: '#666',
  },
});
