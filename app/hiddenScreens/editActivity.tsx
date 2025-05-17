import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getActivityById, updateActivity } from '../backend/database';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  weather?: string;
}

export default function EditActivityScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity []>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const activityData = await getActivityById(Number(id)) as Activity[];
        if (activityData) {
            const activity = activityData[0];
            setActivity(activityData);
            setTitle(activity.title);
            setDescription(activity.description);
            setDate(activity.date);
            setTime(activity.time || '');
            setLocation(activity.location || '');
            setWeather(activity.weather || '');
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchActivity();
  }, [id]);

  const handleSave = async () => {
    if (activity) {
      try {
        await updateActivity(
          Number(id),
          title,
          description,
          date,
          time,
          location,
          weather
        );
        router.back();
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  };

  if (!activity) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Activity</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Weather"
        value={weather}
        onChangeText={setWeather}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#20C997',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
