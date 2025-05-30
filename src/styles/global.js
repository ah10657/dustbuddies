import { View, ImageBackground, Text, TouchableOpacity, StyleSheet, FlatList, Pressable } from 'react-native';

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