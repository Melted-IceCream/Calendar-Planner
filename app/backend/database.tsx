import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase('CalendarPlanner.db')

export const createTable = () => {
  console.log('Creating tables');
  
  db.transaction(tx => {
    // Function to check if a table exists
    const checkTableExists = (tableName: string, callback: (exists: boolean) => void) => {
      tx.executeSql(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
        [],
        (_tx, result) => callback(result.rows.length > 0),
        (_tx, error) => {
          console.log(`Error checking if ${tableName} exists:`, error);
          callback(false);
          return true;
        }
      );
    };

    // Function to create a table
    const createTableIfNotExists = (tableName: string, createTableSQL: string) => {
      checkTableExists(tableName, (exists) => {
        if (!exists) {
          tx.executeSql(
            createTableSQL,
            [],
            () => console.log(`${tableName} table created successfully`),
            (_tx, error) => {
              console.log(`Error creating ${tableName} table:`, error);
              return true;
            }
          );
        } else {
          console.log(`${tableName} table already exists`);
        }
      });
    };

    // Check and create activities table
    createTableIfNotExists(
      'activities',
      `
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          time TEXT,
          location TEXT,
          weather TEXT
        );
      `
    );

    // Check and create weather table
    createTableIfNotExists(
      'weather',
      `
        CREATE TABLE IF NOT EXISTS weather (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id TEXT NOT NULL,
          location_name TEXT NOT NULL,
          date TEXT NOT NULL,
          morning_forecast TEXT,
          afternoon_forecast TEXT,
          night_forecast TEXT,
          summary_forecast TEXT,
          summary_when TEXT,
          min_temp INTEGER,
          max_temp INTEGER
        );
      `
    );

    // Check and create task table
    createTableIfNotExists(
      'task',
      `
        CREATE TABLE IF NOT EXISTS task (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          end_time TEXT NOT NULL,
          location TEXT
        );
      `
    );
  });
};


export const addActivity = (title: string, description: string, date: string, time: string, location: string, weather: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO activities (title, description, date, time, location, weather) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [title, description, date, time, location, weather],
        () => {
          console.log('Activity added successfully');
          resolve(true);
        },
        (_tx, error) => {
          console.error('Error adding activity:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getActivity = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM activities',
        [],
        (_tx, resultSet) => resolve(resultSet.rows._array),
        (_tx, error) => {
          console.error('Error fetching activities:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getActivityByDate = (date: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM activities WHERE date = ?',
        [date],
        (_tx, resultSet) => {
          resolve(resultSet.rows._array)
        },
        (_tx, error) => {
          console.error('Error fetching activities by date:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getActivityById = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM activities WHERE id = ?',
        [id],
        (_tx, resultSet) => {
          resolve(resultSet.rows._array)
        },
        (_tx, error) => {
          console.error('Error fetching activities by id:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const updateActivity = (id: number, title: string, description: string, date: string, time: string, location: string, weather: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE activities SET title = ?, description = ?, date = ?, time = ?, location = ?, weather = ? WHERE id = ?',
        [title, description, date, time, location, weather, id],
        (_tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Activity updated successfully');
            resolve(true);
          } else {
            console.log('No activity found to update');
            resolve(false);
          }
        },
        (_tx, error) => {
          console.error('Error updating activity:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const deleteActivity = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM activities WHERE id = ?',
        [id],
        (_tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Activity deleted successfully');
            resolve(true);
          } else {
            console.log('No activity found to delete');
            resolve(false);
          }
        },
        (_tx, error) => {
          console.error('Error deleting activity:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const addTask = (title: string, description: string, startDate: string, endDate: string, endTime: string, location: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO task (title, description, start_date, end_date, end_time, location) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, startDate, endDate, endTime, location],
        (_tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Task added successfully');
            resolve(true);
          } else {
            console.log('Failed to add task');
            resolve(false);
          }
        },
        (_tx, error) => {
          console.error('Error adding task:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getTask = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM task',
        [],
        (_tx, resultSet) => resolve(resultSet.rows._array),
        (_tx, error) => {
          console.error('Error fetching tasks:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getTaskByDate = (date: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM task WHERE start_date = ? OR end_date = ?',
        [date, date],
        (_tx, resultSet) => resolve(resultSet.rows._array),
        (_tx, error) => {
          console.error('Error fetching tasks by date:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const getTaskById = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM task WHERE id = ?',
        [id],
        (_tx, resultSet) => resolve(resultSet.rows._array),
        (_tx, error) => {
          console.error('Error fetching tasks by id:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const updateTask = (id: number, title: string, description: string, startDate: string, endDate: string, endTime: string, location: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE task SET title = ?, description = ?, start_date = ?, end_date = ?, end_time = ?, location = ? WHERE id = ?',
        [title, description, startDate, endDate, endTime, location, id],
        (_tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Task updated successfully');
            resolve(true);
          } else {
            console.log('No task found to update');
            resolve(false);
          }
        },
        (_tx, error) => {
          console.error('Error updating task:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const deleteTask = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM task WHERE id = ?',
        [id],
        (_tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Task deleted successfully');
            resolve(true);
          } else {
            console.log('No task found to delete');
            resolve(false);
          }
        },
        (_tx, error) => {
          console.error('Error deleting task:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};
