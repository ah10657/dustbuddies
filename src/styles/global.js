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
  timerButtons: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 20, 
  },

  time: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    marginTop: 15 
  },

  pulseContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  focusText: {
    position: 'absolute',
    color: '#3f3f3f',
    top: '50%',
    fontSize: 24,
    fontWeight: 'normal',
    textAlign: 'center',
  },

  pulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#104e5440', 
    shadowColor: '#104e54',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 20, 
    marginTop: 30,
  },


  completeBtn: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
  },

  completeBtnText: { 
    fontSize: 30, 
    color: '#FFFFFF',
    fontWeight: '500',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
   },

  startBtn: {
    backgroundColor: '#f7bd50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 30,
  },

  startBtnText: { 
    fontSize: 30, 
    color: '#535353',
    fontWeight: '500',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
   },

  timerButtons: {
    marginVertical: 0,
    flexDirection: 'row',    
  },

  timerBtn: {
    backgroundColor: '#178591',  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  timerBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },

  completeBtn: {
    backgroundColor: '#178591',  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  completeText: {
    color: '#FFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  noTimerBtn: {
    backgroundColor: '#178591',  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },

  noTimerBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
    timerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#5eb1cc'
  },

  timerLabel: { 
    fontSize: 22, 
    marginBottom: 20 
  },

});

export default styles;