import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import BasicBedroom from '../assets/decor/basicBedroom';

// Room screen with dropdown and tasks
export default function RoomScreen() {
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
      <BasicBedroom width={300} height={300} />
    </View>
  );
}