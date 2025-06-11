import { View, ImageBackground, Text, TouchableOpacity, StyleSheet, FlatList, Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 40,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 50,
    color: '#ffffff',
  },
    roomSelectionWrapper: {
      backgroundColor: '#6ec1e4',
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },

  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  roomGrid: {
    position: 'relative',
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    padding: 10,
    minWidth: 300,
    minHeight: 300,
    maxWidth: 600,
    maxHeight: 600,
    alignSelf: 'center',
  },

  roomBoxMap: {
    position: 'absolute',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    borderColor: '#999',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    elevation: 2,
  },
  roomBoxMapText: {
    textAlign: 'center',
    fontWeight: '500',
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
    center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopMessage: {
    fontSize: 24,
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
  },

});

export default styles;