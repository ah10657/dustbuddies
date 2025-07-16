import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { decorMap } from '../lib/svgMap';
import { getGlobalTaskCompletion } from '../models/tasksModel';
import { getHouseRoom, getAllRooms } from '../models/roomsModel';
import AvatarStack from '../components/AvatarStack';
import AnimatedSun from '../components/AnimatedSun';
import global from '../styles/global';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Animated from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const { user, userData } = useUser();
  const [roomData, setRoomData] = useState(null);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roomsWithTasks, setRoomsWithTasks] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState({ roomId: null, taskId: null });
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingTaskRecurrence, setEditingTaskRecurrence] = useState('daily');
  const [addingTaskRoomId, setAddingTaskRoomId] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [localRoomsWithTasks, setLocalRoomsWithTasks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalRoomsRef = useRef([]);

  const fetchRooms = async () => {
    try {
      if (!user) return;

      // Use the new getHouseRoom function to find the correct house room
      const houseRoomData = await getHouseRoom(user.uid);

      if (!houseRoomData) {
        return;
      }

      setRoomData({
        ...houseRoomData,
        user: {
          avatar: userData?.avatar,
        },
      });

      // Use the new tasksModel function for better task management with auto-reset
      const taskData = await getGlobalTaskCompletion(user.uid);
      setCompletionPercent(taskData.completionPercent);

      // Fetch all rooms and their tasks
      const allRooms = await getAllRooms(user.uid);
      // Group tasks by room
      const roomMap = {};
      taskData.tasks.forEach(task => {
        if (!roomMap[task.roomId]) roomMap[task.roomId] = [];
        roomMap[task.roomId].push(task);
      });
      const roomsWithTasks = allRooms.map(room => ({
        id: room.id,
        name: room.display_name,
        tasks: roomMap[room.id] || [],
      }));
      setRoomsWithTasks(roomsWithTasks);
    } catch (error) {
      console.error('[fetchRooms] Error fetching rooms:', error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchRooms();
  }, [user, userData]);

  // Refresh data when screen comes into focus (e.g., after completing a task)
  useFocusEffect(
    React.useCallback(() => {
      fetchRooms();
    }, [user, userData])
  );

  const handleLogout = async () => {
    console.log('Logout button pressed!');
    try {
      await signOut(auth);
      console.log('Sign out successful');
      // UserContext will handle redirect
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Enter/exit edit mode
  const enterEditMode = () => {
    setLocalRoomsWithTasks(roomsWithTasks.map(room => ({
      ...room,
      tasks: room.tasks.map(task => ({ ...task }))
    })));
    originalRoomsRef.current = roomsWithTasks.map(room => ({
      ...room,
      tasks: room.tasks.map(task => ({ ...task }))
    }));
    setIsEditMode(true);
    setHasUnsavedChanges(false);
  };
  const exitEditMode = () => {
    setIsEditMode(false);
    setLocalRoomsWithTasks([]);
    setEditingTask({ roomId: null, taskId: null });
    setEditingTaskName('');
    setEditingTaskRecurrence('daily');
    setAddingTaskRoomId(null);
    setNewTaskName('');
    setHasUnsavedChanges(false);
  };
  // Prevent closing dropdown in edit mode
  const handleDropdownClose = () => {
    if (isEditMode && hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You are closing without saving your changes. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard Changes', style: 'destructive', onPress: exitEditMode },
        ]
      );
    } else if (isEditMode) {
      Alert.alert(
        'Exit Edit Mode',
        'You are closing edit mode without making changes.',
        [
          { text: 'OK', onPress: exitEditMode },
        ]
      );
    } else {
      setDropdownOpen(false);
    }
  };
  // Save all changes to Firebase for all rooms
  const saveAllEdits = async () => {
    setIsSaving(true);
    const userId = user.uid;
    const orig = originalRoomsRef.current;
    for (let r = 0; r < localRoomsWithTasks.length; r++) {
      const room = localRoomsWithTasks[r];
      const origRoom = orig.find(or => or.id === room.id) || { tasks: [] };
      // Deleted
      const deleted = origRoom.tasks.filter(ot => !room.tasks.some(lt => lt.id === ot.id));
      // Added
      const added = room.tasks.filter(lt => !lt.id);
      // Updated
      const updated = room.tasks.filter(lt => {
        const origTask = origRoom.tasks.find(ot => ot.id === lt.id);
        return origTask && (lt.name !== origTask.name || lt.recurrence !== origTask.recurrence);
      });
      for (const task of deleted) {
        await deleteDoc(doc(db, 'user', userId, 'rooms', room.id, 'room_tasks', task.id));
      }
      for (const task of added) {
        await addDoc(collection(db, 'user', userId, 'rooms', room.id, 'room_tasks'), {
          task_name: task.name,
          recurrence: task.recurrence,
          task_complete: false,
          last_completed_at: '',
        });
      }
      for (const task of updated) {
        await updateDoc(doc(db, 'user', userId, 'rooms', room.id, 'room_tasks', task.id), {
          task_name: task.name,
          recurrence: task.recurrence,
        });
      }
    }
    await fetchRooms();
    setIsSaving(false);
    exitEditMode();
  };

  if (!roomData) {
    return <ActivityIndicator size="large" />;
  }

  const Sky = decorMap[roomData.decor.sky] || decorMap[roomData.decor.background];
  const Ground = decorMap[roomData.decor.ground] || decorMap['yardGround'];
  const House = decorMap[roomData.decor.home];
  const Bike = decorMap[roomData.decor.bike];
  const houseSize = Math.min(width * 0.8, 600);

  return (
    <SafeAreaView style={[global.container, { position: 'relative', flex: 1 }]} edges={['top', 'bottom']}>
      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          position: 'absolute',
          top: 50,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 12,
          borderRadius: 20,
          zIndex: 1000,
          minWidth: 60,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: '#333', fontSize: 14, fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>

      {Sky && (
        <Sky
          width={width}
          height={height}
          preserveAspectRatio="xMidYMax slice"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
      )}
      {Ground && (
        <Ground
        preserveAspectRatio="none"
        width={width}
        height={height}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 1,
        }}
      />
      )}
      {House && (
        <TouchableOpacity
          onPress={() => navigation.navigate('RoomSelection')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: height / 4,
            left: (width - houseSize) / 2,
            width: houseSize,
            height: houseSize,
            zIndex: 2,
          }}
        >
          <House width={houseSize} height={houseSize} />
        </TouchableOpacity>
      )}
      {Bike && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Shop')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: height / 4,
            left: 20,
            zIndex: 2,
          }}
        >
          <Bike width={100} height={100} />
        </TouchableOpacity>
      )}
      {/* Sun with progress overlay replaced by ProgressRing */}
      <TouchableOpacity
        onPress={() => setDropdownOpen(!dropdownOpen)}
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          top: height * 0.05,
          right: width * 0.2,
          width: 100,
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <AnimatedSun progress={completionPercent} size={200} />
      </TouchableOpacity>

      {/* Dropdown Task List (All Rooms) as Full-Screen Overlay */}
      {dropdownOpen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: width,
            height: height,
            backgroundColor: '#E7A120', // semi-transparent overlay
            zIndex: 100,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            paddingBottom: 32,
            paddingTop: 0,
            justifyContent: 'flex-start',
          }}
        >
          {/* Progress Bar at the top */}
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 16 }}>
            <View style={{ position: 'absolute', width: 195, height: 195, borderRadius: 100, backgroundColor: '#fff', zIndex: 0 }} />
            <AnimatedCircularProgress
              size={200}
              width={25}
              fill={completionPercent}
              tintColor="#F7BD50"
              backgroundColor="#f7e6b0"
              rotation={0}
              style={{ zIndex: 1 }}
            >
              {() => (
                <Text style={{ fontSize: 50, color: '#F7BD50', fontWeight: 'bold' }}>{completionPercent}%</Text>
              )}
            </AnimatedCircularProgress>
          </View>
          {/* Edit Tasks Button */}
          {isEditMode ? (
            <TouchableOpacity
              style={global.orangeButton}
              onPress={saveAllEdits}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Text style={global.orangeButtonText}>{isSaving ? 'Saving...' : 'Done Editing'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={global.orangeButton}
              onPress={enterEditMode}
            >
              <Text style={global.orangeButtonText}>Edit Tasks</Text>
            </TouchableOpacity>
          )}
          {/* Scrollable list of rooms and tasks */}
          <View style={{ flex: 1, width: '100%' }}>
            <Animated.ScrollView
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {(isEditMode ? localRoomsWithTasks : roomsWithTasks).map((room) => (
                <View key={room.id} style={{ marginBottom: 18 }}>
                  <View style={{
                    backgroundColor: '#F7BD50',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    padding: 10,
                    alignSelf: 'flex-start',
                    marginBottom: -10,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{room.name}</Text>
                  </View>
                  <View style={{ backgroundColor: '#F7BD50', borderRadius: 12, padding: 8 }}>
                    {room.tasks.length === 0 ? (
                      <Text style={{ color: '#E7A120', fontStyle: 'italic' }}>No tasks</Text>
                    ) : (
                      room.tasks.map((task, idx) => (
                        isEditMode ? (
                          <TouchableOpacity
                            key={task.id || `new-${idx}`}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#fff',
                              borderRadius: 8,
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              marginBottom: 6,
                              borderWidth: 1,
                              borderColor: '#eee',
                              shadowColor: '#E7A120',
                              shadowOffset: { width: 0, height: 6 },
                              shadowOpacity: 0.18,
                              shadowRadius: 8,
                              elevation: 8,
                            }}
                            activeOpacity={1}
                            onPress={() => {}}
                          >
                            {editingTask.roomId === room.id && editingTask.taskId === task.id ? (
                              <>
                                <TextInput
                                  value={editingTaskName}
                                  onChangeText={text => {
                                    setEditingTaskName(text);
                                    setHasUnsavedChanges(true);
                                  }}
                                  style={[global.buttonText, { backgroundColor: '#fff', flex: 1, borderRadius: 6, paddingHorizontal: 8 }]}
                                  returnKeyType="done"
                                  onSubmitEditing={() => {
                                    if (editingTaskName.trim()) {
                                      setLocalRoomsWithTasks(prev => prev.map(r => r.id === room.id ? {
                                        ...r,
                                        tasks: r.tasks.map(t => t.id === task.id ? { ...t, name: editingTaskName } : t)
                                      } : r));
                                      setEditingTask({ roomId: null, taskId: null });
                                      setEditingTaskName('');
                                      setEditingTaskRecurrence('daily');
                                      setHasUnsavedChanges(true);
                                    }
                                  }}
                                  onBlur={() => {
                                    setEditingTask({ roomId: null, taskId: null });
                                    setEditingTaskName('');
                                    setEditingTaskRecurrence('daily');
                                  }}
                                />
                                <Picker
                                  selectedValue={editingTaskRecurrence}
                                  style={{ flex: 1, marginVertical: 4 }}
                                  onValueChange={itemValue => {
                                    setEditingTaskRecurrence(itemValue);
                                    setLocalRoomsWithTasks(prev => prev.map(r => r.id === room.id ? {
                                      ...r,
                                      tasks: r.tasks.map(t => t.id === task.id ? { ...t, recurrence: itemValue } : t)
                                    } : r));
                                    setHasUnsavedChanges(true);
                                  }}
                                >
                                  <Picker.Item label="Daily" value="daily" />
                                  <Picker.Item label="Every Other Day" value="every_2_days" />
                                  <Picker.Item label="Weekly" value="weekly" />
                                  <Picker.Item label="Monthly" value="monthly" />
                                </Picker>
                                <TouchableOpacity onPress={() => {
                                  if (editingTaskName.trim()) {
                                    setLocalRoomsWithTasks(prev => prev.map(r => r.id === room.id ? {
                                      ...r,
                                      tasks: r.tasks.map(t => t.id === task.id ? { ...t, name: editingTaskName, recurrence: editingTaskRecurrence } : t)
                                    } : r));
                                    setEditingTask({ roomId: null, taskId: null });
                                    setEditingTaskName('');
                                    setEditingTaskRecurrence('daily');
                                    setHasUnsavedChanges(true);
                                  }
                                }} style={{ marginLeft: 8 }}>
                                  <Feather name="check" size={20} color="#178591" />
                                </TouchableOpacity>
                              </>
                            ) : (
                              <>
                                <Text style={global.buttonText}>{task.name}</Text>
                                <Text style={[global.buttonText, { marginLeft: 8, fontSize: 12 }]}> {
                                  task.recurrence === 'daily' ? 'Daily' :
                                  task.recurrence === 'every_2_days' ? 'Every Other Day' :
                                  task.recurrence === 'weekly' ? 'Weekly' :
                                  task.recurrence === 'monthly' ? 'Monthly' : ''
                                }</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <TouchableOpacity onPress={() => {
                                    setEditingTask({ roomId: room.id, taskId: task.id });
                                    setEditingTaskName(task.name);
                                    setEditingTaskRecurrence(task.recurrence || 'daily');
                                  }} style={{ marginHorizontal: 6 }}>
                                    <Feather name="edit-2" size={18} color="#178591" />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => {
                                    Alert.alert(
                                      'Delete Task',
                                      'Are you sure you want to delete this task?',
                                      [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Delete', style: 'destructive', onPress: () => {
                                          setLocalRoomsWithTasks(prev => prev.map(r => r.id === room.id ? {
                                            ...r,
                                            tasks: r.tasks.filter((_, tIdx) => tIdx !== idx)
                                          } : r));
                                          setHasUnsavedChanges(true);
                                        }},
                                      ]
                                    );
                                  }} style={{ marginHorizontal: 6 }}>
                                    <Feather name="trash-2" size={18} color="#e53935" />
                                  </TouchableOpacity>
                                </View>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            key={task.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: task.completed ? '#F2F0EF' : '#fff',
                              borderRadius: 8,
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              marginBottom: 6,
                              borderWidth: 1,
                              borderColor: task.completed ? '#f7bd50' : '#eee',
                              shadowColor: '#E7A120',
                              shadowOffset: { width: 0, height: 6 },
                              shadowOpacity: 0.18,
                              shadowRadius: 8,
                              elevation: 8,
                            }}
                            onPress={() => {
                              setDropdownOpen(false);
                              navigation.navigate('Timer', {
                                taskName: task.name,
                                roomId: room.id,
                              });
                            }}
                          >
                            <Text style={task.completed ? global.buttonTextCompleted : global.buttonText}>
                              {task.name}
                            </Text>
                            {task.completed ? (
                              <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: '#E7A120',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Feather name="check" size={18} color="#fff" />
                              </View>
                            ) : (
                              <View style={{ width: 24, height: 24 }} />
                            )}
                          </TouchableOpacity>
                        )
                      ))
                    )}
                    {/* Add Task Button */}
                    {isEditMode && (
                      <View style={{ marginTop: 8 }}>
                        {addingTaskRoomId === room.id ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                              value={newTaskName}
                              onChangeText={setNewTaskName}
                              style={[global.buttonText, { backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 8, flex: 1 }]}
                              placeholder="New task name"
                              returnKeyType="done"
                              onSubmitEditing={() => {
                                if (newTaskName.trim()) {
                                  setLocalRoomsWithTasks(prev => prev.map(r => r.id === room.id ? {
                                    ...r,
                                    tasks: [...r.tasks, { name: newTaskName, recurrence: 'daily' }]
                                  } : r));
                                  setAddingTaskRoomId(null);
                                  setNewTaskName('');
                                  setHasUnsavedChanges(true);
                                }
                              }}
                              onBlur={() => { setAddingTaskRoomId(null); setNewTaskName(''); }}
                            />
                            <TouchableOpacity onPress={() => {
                              if (newTaskName.trim()) {
                                setLocalRoomsWithTasks(prev => prev.map(r => r.id === room.id ? {
                                  ...r,
                                  tasks: [...r.tasks, { name: newTaskName, recurrence: 'daily' }]
                                } : r));
                                setAddingTaskRoomId(null);
                                setNewTaskName('');
                                setHasUnsavedChanges(true);
                              }
                            }} style={{ marginLeft: 8 }}>
                              <Feather name="check" size={20} color="#178591" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={() => setAddingTaskRoomId(room.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="plus-circle" size={22} color="#178591" />
                            <Text style={[global.orangeButtonText, { marginLeft: 6 }]}>Add Task</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          </View>
          {/* Close area at the bottom for overlay effect */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: width,
              height: 40,
              backgroundColor: 'transparent',
              zIndex: 101,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
            onPress={handleDropdownClose}
            activeOpacity={0.7}
          >
            <Feather name="chevron-up" size={32} color="#fff" style={{ textAlign: 'center' }} />
          </TouchableOpacity>
        </View>
      )}

      {roomData.user?.avatar && (
        <AvatarStack
          avatar={roomData.user.avatar}
          size={height / 5}
          style={{
            right: width / 10, // Center horizontally for size 150
            bottom: height / 10,           // Place above ground, adjust as needed
            zIndex: 10,
          }}
        />
      )}
    </SafeAreaView>
  );
}
