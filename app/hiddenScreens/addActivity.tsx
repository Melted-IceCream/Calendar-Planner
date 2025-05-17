import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, FlatList, TouchableOpacity, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addActivity, getActivityByDate } from '../backend/database'; // Import getActivityByDate to fetch activities
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  weather?: string;
}

interface WeatherData {
  date: string;
  summary_forecast: string;
  min_temp: number;
  max_temp: number;
}

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
};

const translateWeatherDescription = (description: string) => {
  return weatherTranslations[description] || description;
};

const ARLIAI_API_KEY = '3f6d7fb3-c844-43bf-b02a-74e03d6f609f';

export default function AddActivity() {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [loading, setLoading] = useState(true);
  const [llmLoading, setLLMLoading] = useState(false);
  const [suggestions, setSuggestions] = useState("No suggestions yet. Press 'Get Suggestions' to receive ideas.");

  // Create time string from selected hour and minute
  const time = `${hour}:${minute}`;

  useEffect(() => {
    const selectedDate = Array.isArray(date) ? date[0] : date;
    fetchWeatherData(selectedDate);
    fetchActivities();
  }, [date]);

  const fetchWeatherData = async (date: string) => {
    try {
      const response = await fetch('https://api.data.gov.my/weather/forecast?contains=Cheras@location__location_name');
      const data = await response.json();
      const parsedData = parseWeatherData(data);
      
      // Check if the weather data contains the specified date
      const weatherForDate = parsedData.find((day) => day.date === date);
      
      if (weatherForDate) {
        setWeather(weatherForDate.summary_forecast || 'Unknown');
      } else {
        setWeather('Unknown, too far into the future');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const parseWeatherData = (data: any): WeatherData[] => {
    return data.map((day: any) => ({
      date: day.date,
      summary_forecast: translateWeatherDescription(day.summary_forecast),
      min_temp: day.min_temp,
      max_temp: day.max_temp,
    }));
  };
  

  const fetchActivities = async () => {
    try {
      const activitiesForDate = await getActivityByDate(date as string) as Activity[];
      setActivities(activitiesForDate);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAddActivity = async () => {
    try {
      const success = await addActivity(title, description, date as string, time, location, weather);
      if (success) {
        console.log('Activity added successfully');
        router.back();
      } else {
        console.log('Failed to add activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const fetchLLMSuggestions = async (title: string, description: string, time: string, weather: string) => {
    if (!title) {
      setSuggestions("There is no activity yet. Please set an activity first.");
      return;
    }
    
    setLLMLoading(true);
    setSuggestions('');

    try {
      const response = await fetch("https://api.arliai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ARLIAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `I am planning an activity with the title: "${title}". 
                                      The description is: "${description}". 
                                      The weather is: "${weather}". 
                                      The time is: "${time}".
                                      Does the activity make sense and is there any suggestions?` }
          ],
          repetition_penalty: 1.1,
          temperature: 0.5,
          top_p: 0.9,
          top_k: 40,
          max_tokens: 100,
          stop: ["."]
        })
      });

      const result = await response.json();
      const suggestionsText = result.choices[0].message.content;
      setSuggestions(suggestionsText);
    } catch (error) {
      console.error("Error fetching LLM suggestions:", error);
      setSuggestions("An error occurred while fetching suggestions.");
    } finally {
      setLLMLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20C997" />
      </View>
    );
  }
  const renderItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.activityItem}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activityDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Activities for {date}</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.activityDescription}>No activities for this date.</Text>}
        contentContainerStyle={styles.activitiesList}
      />

      <View style={styles.bottomContainer}>
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

        <View style={styles.timePickerContainer}>
          <Text style={styles.label}>Select Time</Text>
          <Picker
            selectedValue={hour}
            style={styles.picker}
            onValueChange={(itemValue) => setHour(itemValue)}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i.toString().padStart(2, '0')} />
            ))}
          </Picker>
          <Text>:</Text>
          <Picker
            selectedValue={minute}
            style={styles.picker}
            onValueChange={(itemValue) => setMinute(itemValue)}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i.toString().padStart(2, '0')} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Location (Optional)"
          value={location}
          onChangeText={setLocation}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Weather (Optional)"
          value={weather}
          onChangeText={setWeather}
          editable={false}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleAddActivity}>
        <Text style={styles.buttonText}>Add Activity</Text>
        </TouchableOpacity>
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions:</Text>
          <Text>{llmLoading ? 'Getting Suggestions...' : suggestions}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => fetchLLMSuggestions(title, description, time, weather)}>
        <Text style={styles.buttonText}>Suggest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setSuggestions('Suggestions Cleared')}>
        <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    overflow: 'scroll'
  },
  listContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  activitiesList: {
    flexGrow: 1,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#6C757D',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: 'auto',
    paddingHorizontal: 10,
    marginBottom: 10,
    fontWeight: "bold",
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    width: 100,
    height: 40,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  activityItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    elevation: 3,
  },
  suggestionsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#20C997',
    padding: 15,
    borderRadius: 15,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    alignSelf: "center"
  },
});
