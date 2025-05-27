import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// Home screen with one clickable box (one room)
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.roomBox}
        onPress={() => navigation.navigate('Room')}
      >
        <Text style={styles.roomText}>Living Room</Text>
      </TouchableOpacity>
    </View>
  );
}

// Room screen with dropdown and tasks
function RoomScreen() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  const tasks = [
    'Vacuum the carpet',
    'Dust the shelves',
    'Clean the windows',
  ];

  const toggleTask = (task) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [task]: !prev[task],
    }));
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dropdownHeader}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={styles.dropdownHeaderText}>
          {dropdownOpen ? 'Hide Tasks ▲' : 'Show Tasks ▼'}
        </Text>
      </Pressable>

      {dropdownOpen && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.taskItem,
                completedTasks[item] && styles.taskCompleted,
              ]}
              onPress={() => toggleTask(item)}
            >
              <Text
                style={[
                  styles.taskText,
                  completedTasks[item] && styles.taskTextCompleted,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  roomBox: {
    backgroundColor: '#4caf50',
    padding: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomText: {
    color: 'white',
    fontSize: 22,
  },
  dropdownHeader: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
  },
  dropdownHeaderText: {
    color: 'white',
    fontSize: 18,
  },
  taskItem: {
    padding: 15,
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  taskCompleted: {
    backgroundColor: '#a5d6a7',
  },
  taskText: {
    fontSize: 16,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
});