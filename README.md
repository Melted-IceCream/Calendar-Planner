# CalendarPlanner

![image](https://github.com/user-attachments/assets/d007fd6c-7221-4ea1-8515-3c4d14810186)


A user-centric calendar planning application with integrated weather forecasts, task management, and AI-powered activity suggestions.
# Disclaimer
Due to recent package conflicts, this application is currently not working

## Features

### Calendar Module
- Interactive calendar with date selection
- Displays activities & tasks for selected dates
- Prevents adding events to past dates

### Weather Integration
- 7-day weather forecast from [Malaysian Government API](https://api.data.gov.my/weather/forecast)
- Automatic weather data for activity planning
- Temperature-based color coding

### Activities & To-Do Management
- Add/edit/delete activities and tasks
- Automatic weather data integration when scheduling
- Task sorting by deadline proximity

### Database Backend
- SQLite database for persistent storage
- CRUD operations for activities and tasks
- Offline weather data caching

### AI Suggestions
- Meta-Llama-3.1 8B-Instruct model integration
- Context-aware activity suggestions
- Suggestions based on weather and schedule

## Technology Stack
- **Frontend**: React Native (Expo)
- **Backend**: SQLite
- **AI**: Meta-Llama-3.1 8B-Instruct (via ArliAI)
- **Weather API**: [data.gov.my](https://api.data.gov.my)

## Installation

1. Clone the repository.
   ```
   git clone https://github.com/yourusername/CalendarPlanner.git
   ```
2. Install Dependencies.
   ```
   cd CalendarPlanner
   ```
   ```
   npm install
   ```
3. Install Android Studio
4. Setup an android device..
5. Start the project.
   ```
   expo start
   ```
