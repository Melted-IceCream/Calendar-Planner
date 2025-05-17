import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeatherData {
  date: string;
  location_name: string;
  morning_forecast: string;
  afternoon_forecast: string;
  night_forecast: string;
  summary_forecast: string;
  summary_when: string;
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

export default function WeatherScreen() {
  const router = useRouter();
  
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('https://api.data.gov.my/weather/forecast?contains=Cheras@location__location_name');
      const data = await response.json();
      const parsedData = parseWeatherData(data);
      const sortedData = sortWeatherDataByDate(parsedData);
      setWeatherData(sortedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseWeatherData = (data: any): WeatherData[] => {
    return data.map((day: any) => ({
      date: day.date,
      location_name: day.location.location_name,
      morning_forecast: translateWeatherDescription(day.morning_forecast),
      afternoon_forecast: translateWeatherDescription(day.afternoon_forecast),
      night_forecast: translateWeatherDescription(day.night_forecast),
      summary_forecast: translateWeatherDescription(day.summary_forecast),
      summary_when: translateWeatherDescription(day.summary_when),
      min_temp: day.min_temp,
      max_temp: day.max_temp,
    }));
  };

  const sortWeatherDataByDate = (data: WeatherData[]): WeatherData[] => {
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getWeatherIcon = (summary: string) => {
    switch (summary) {
      case 'Hazy':
        return <MaterialCommunityIcons name="weather-hazy" size={50} color="gray" />;
  
      case 'No rain':
        return <MaterialCommunityIcons name="weather-sunny" size={50} color="yellow" />;
  
      case 'Rain':
      case 'Scattered rain':
      case 'Isolated Rain':
      case 'Isolated rain over coastal areas':
      case 'Isolated rain over inland areas':
        return <MaterialCommunityIcons name="weather-rainy" size={50} color="light-blue" />;
  
      case 'Thunderstorms':
      case 'Scattered thunderstorms':
      case 'Scattered thunderstorms over inland areas':
      case 'Isolated thunderstorms':
      case 'Isolated thunderstorms over coastal areas':
      case 'Isolated thunderstorms over inland areas':
        return <MaterialCommunityIcons name="weather-lightning-rainy" size={50} color="blue" />;
  
      default:
        return <MaterialCommunityIcons name="weather-sunny" size={50} color="yellow" />;
    }
  };
  

  const getBackgroundColor = (temp: number) => {
    const color = temp < 26 ? '#ADD8E6' : temp < 32 ? '#FFDDC1' : '#FFB6C1'; // Light blue, peach, or pink based on temp
    return { backgroundColor: color };
  };

  const renderTodayWeather = () => {
    const todayWeather = weatherData[0];

    if (!todayWeather) {
      return <Text style={styles.noData}>No weather data available for today.</Text>;
    }

    // Ensure data is present or provide fallback values
    const minTemp = todayWeather.min_temp ?? 0;
    const maxTemp = todayWeather.max_temp ?? 'N/A';
    const summaryForecast = todayWeather.summary_forecast ?? 'N/A';
    const date = todayWeather.date ?? 'N/A';

    return (
      <View style={[styles.todayWeather, getBackgroundColor(minTemp)]}>
        <Text style={styles.todayTitle}>Today's Weather</Text>
        <Text style={styles.todayDate}>{date}</Text>
        <Text style={styles.todayTemperature}>{minTemp}°C - {maxTemp}°C</Text>
        <Text style={styles.todayForecast}>Summary: {summaryForecast}</Text>
        {getWeatherIcon(summaryForecast)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20C997" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>7-Day Weather Forecast</Text>
      {renderTodayWeather()}
      <FlatList
        data={weatherData.slice(1)} // Exclude today's weather from the list
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.weatherItem}>
            <Text style={styles.date}>{item.date} : {item.min_temp}°C - {item.max_temp}°C</Text>
            {/* <Text style={styles.temperature}>{item.min_temp}°C - {item.max_temp}°C</Text> */}
            <Text style={styles.forecast}>Morning: {item.morning_forecast}</Text>
            <Text style={styles.forecast}>Afternoon: {item.afternoon_forecast}</Text>
            <Text style={styles.forecast}>Night: {item.night_forecast}</Text>
            <Text style={styles.summary}>Summary ({item.summary_when}): {item.summary_forecast}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      {/* <TouchableOpacity onPress={() => fetchWeatherData()}>
        <Text>Load Weather</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push({
        pathname: '/hiddenScreens/changeLocation' as any})}>
        <Text>Change Location</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  todayWeather: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  todayDate: {
    fontSize: 18,
    marginBottom: 5,
  },
  todayTemperature: {
    fontSize: 18,
    marginBottom: 10,
  },
  todayForecast: {
    fontSize: 18,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  temperature: {
    fontSize: 16,
    marginTop: 5,
  },
  forecast: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  summary: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  noData: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
});