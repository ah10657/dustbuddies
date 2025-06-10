import { View, ImageBackground, Text, TouchableOpacity, StyleSheet, FlatList, Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
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
  topBar: {
    backgroundColor: '#5EB1CC',
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
  },
  taskChip: {
    backgroundColor: '#178591',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  taskChipText: {
    color: 'white',
    fontSize: 14,
  },
  progressCircle: {
    marginTop: 10,
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    color: '#f9a825',
  },
  dropdownToggle: {
    fontSize: 22,
    color: 'white',
    marginTop: 10,
  },
  dropdown: {
    backgroundColor: '#5EB1CC',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  expandedHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  taskChipContainer: {
    flexGrow: 1,
  },
});

export default styles;