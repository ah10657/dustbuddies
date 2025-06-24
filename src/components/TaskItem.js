import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TaskItem = ({ task, onPress }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(task)}>
      <Text>{task.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
});

export default TaskItem;
