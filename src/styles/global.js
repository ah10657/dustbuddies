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
  subHeaderText: {
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: '24', 
    margin: 4,
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
    minWidth: 200,
    minHeight: 200,
    maxWidth: 800,
    maxHeight: 800,
    alignSelf: 'center',
  },

  roomBoxMap: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderColor: '#999',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
  },
  roomBoxMapText: {
    color: '#f9a825',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15
  },
  roomBox: {
    backgroundColor: '#4caf50',
    padding: 30,
    borderRadius: 10,
    borderColor: '#f9a825',
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
    zIndex: 100,
  },
  remainingLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    fontWeight: 'bold',
  },
  taskChip: {
    backgroundColor: '#147883',
    alignSelf: 'center',
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
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ff9c33',
    fontWeight: 'bold',
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

  // Task Dropdown Overlay/Container
  taskDropdownContainer: {
    position: 'absolute',
    width: '100%',
    left: 0,
    top: 0,
    backgroundColor: '#5EB1CC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 2000, // Increased to ensure dropdown is above top bar
    paddingBottom: 0,
    justifyContent: 'flex-start',
    // height should be set inline per screen for responsiveness
  },
  // Room header (inside dropdown)
  taskRoomHeader: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 10,
    alignSelf: 'flex-start',
    marginBottom: -10,
  },
  // Room group box (background for tasks)
  taskRoomBox: {
    borderRadius: 12,
    padding: 8,
  },
  // Individual button (was taskButton)
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderWidth: 1,
    width: '100%',
    borderColor: '#eee',
  },
  buttonCompleted: {
    backgroundColor: '#F2F0EF',
  },
  buttonText: {
    color: '#E7A120',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonTextCompleted: {
    color: '#949392',
    fontWeight: 'bold',
    fontSize: 15,
  },
  taskCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E7A120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#6EC1E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    position: 'relative',
    backgroundColor: '#A7D8F5',
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
    // width and height should be set inline for dynamic sizing
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    borderWidth: 0.5,
    borderColor: '#fff',
    // width and height should be set inline for dynamic sizing
  },
  resizeHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomRightRadius: 8,
    zIndex: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  verticalTaskList: {
    height: 56, // enough for 1 task + a hint of the next
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-start',
  },
  verticalTaskFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    zIndex: 10,
  },
  verticalTaskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomFiller: {
    backgroundColor: '#147883',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  bottomRoomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#147883',
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomRoomBarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    zIndex: 20,
  },
  avatar: {
    position: 'absolute',
    zIndex: 10,
  },
  topFiller: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  progressCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 12,
    flexShrink: 0,
  },
  progressCircleBg: {
    position: 'absolute',
    backgroundColor: '#fff',
    zIndex: 0,
  },
  orangeButton: {
    alignSelf: 'center',
    width: '60%', // portion of the dropdown width
    marginVertical: 10,
    // Inherit from button
    backgroundColor: '#E7A120',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orangeButtonText: {
    // Inherit from buttonText
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default styles;