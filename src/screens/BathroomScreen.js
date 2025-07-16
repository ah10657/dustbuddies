import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Picker } from '@react-native-picker/picker';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { decorMap } from '../lib/svgMap';
import AvatarStack from '../components/AvatarStack';
import BackButtonIcon from '../assets/images/house/doorIcon.svg';
import global from '../styles/global';
import { getRoomTasks } from '../models/tasksModel';

export default function BathroomScreen({ route }) {
  const navigation = useNavigation();
  const { roomId } = route.params;

  const [roomData, setRoomData] = useState(null);
  const [roomTasks, setRoomTasks] = useState([]);
  const [remainingTasks, setRemainingTasks] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [editingTaskRecurrence, setEditingTaskRecurrence] = useState('daily');
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [localTasks, setLocalTasks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalTasksRef = useRef([]);
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const fetchRoomAndTasks = async () => {
        try {
          const userId = getUserId();
          const roomRef = doc(db, 'user', userId, 'rooms', roomId);
          const roomSnap = await getDoc(roomRef);
          const userDocRef = doc(db, 'user', userId);
          const userSnap = await getDoc(userDocRef);

          if (roomSnap.exists()) {
            const roomData = roomSnap.data();
            const userData = userSnap.data();

            const taskData = await getRoomTasks(userId, roomId);

            setRoomData({
              ...roomData,
              user: {
                avatar: userData.avatar,
              },
            });
            setRoomTasks(taskData.tasks);
            setRemainingTasks(taskData.remainingTasks);
            setProgressPercent(taskData.progressPercent);
          } else {
            console.log('Room not found!');
          }
        } catch (error) {
          console.error('Error fetching room or tasks:', error);
        }
      };

      fetchRoomAndTasks();
    }, [roomId])
  );

  if (!roomData) return <ActivityIndicator size="large" />;

  const Wall = decorMap['bathroomWall'];
  const Floor = decorMap['bathroomFloor'];
  const Toilet = decorMap[roomData.decor?.pref_toilet];
  const ToiletPaper = decorMap[roomData.decor?.pref_toilet_paper];
  const Trashcan = decorMap[roomData.decor?.pref_trashcan];
  const Tub = decorMap[roomData.decor?.pref_tub];
  const WallMirror = decorMap[roomData.decor?.pref_wall_mirror];

  const floorSvgAspect = 122.67 / 142.42; // Use the same as BedroomScreen or update to match bathroom floor SVG viewBox
  const floorHeight = width * floorSvgAspect;

  const progressCircleSize = width * 0.4; // 40% of screen width
  const progressCircleStroke = progressCircleSize * 0.12; // 12% of the circle size

  // When entering edit mode, copy tasks to localTasks
  const enterEditMode = () => {
    setLocalTasks(roomTasks.map(task => ({ ...task })));
    originalTasksRef.current = roomTasks.map(task => ({ ...task }));
    setIsEditMode(true);
    setHasUnsavedChanges(false);
  };
  // When exiting edit mode, clear localTasks
  const exitEditMode = () => {
    setIsEditMode(false);
    setLocalTasks([]);
    setEditingTaskId(null);
    setEditingTaskName('');
    setEditingTaskRecurrence('daily');
    setHasUnsavedChanges(false);
  };
  // Helper: compare tasks for changes
  const tasksChanged = () => {
    const orig = originalTasksRef.current;
    if (localTasks.length !== orig.length) return true;
    for (let i = 0; i < localTasks.length; i++) {
      if (
        localTasks[i].id !== orig[i].id ||
        localTasks[i].name !== orig[i].name ||
        localTasks[i].recurrence !== orig[i].recurrence
      ) {
        return true;
      }
    }
    return false;
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
  // Save all changes to Firebase
  const saveAllEdits = async () => {
    setIsSaving(true);
    const userId = getUserId();
    const orig = originalTasksRef.current;
    // Find deleted tasks
    const deleted = orig.filter(ot => !localTasks.some(lt => lt.id === ot.id));
    // Find added tasks (no id)
    const added = localTasks.filter(lt => !lt.id);
    // Find updated tasks
    const updated = localTasks.filter(lt => {
      const origTask = orig.find(ot => ot.id === lt.id);
      return origTask && (lt.name !== origTask.name || lt.recurrence !== origTask.recurrence);
    });
    // Delete
    for (const task of deleted) {
      await deleteDoc(doc(db, 'user', userId, 'rooms', roomId, 'room_tasks', task.id));
    }
    // Add
    for (const task of added) {
      await addDoc(collection(db, 'user', userId, 'rooms', roomId, 'room_tasks'), {
        task_name: task.name,
        recurrence: task.recurrence,
        task_complete: false,
        last_completed_at: '',
      });
    }
    // Update
    for (const task of updated) {
      await updateDoc(doc(db, 'user', userId, 'rooms', roomId, 'room_tasks', task.id), {
        task_name: task.name,
        recurrence: task.recurrence,
      });
    }
    // Refresh
    const taskData = await getRoomTasks(userId, roomId);
    setRoomTasks(taskData.tasks);
    setRemainingTasks(taskData.remainingTasks);
    setProgressPercent(taskData.progressPercent);
    setIsSaving(false);
    exitEditMode();
  };

  return (
    <SafeAreaView style={[global.container, { position: 'relative', flex: 1 }]} edges={['top', 'bottom']}>
      {/* Top Filler for Safe Area */}
      <View style={[global.topFiller, { height: insets.top, backgroundColor: '#5EB1CC' }]} />
      {/* Wall Layer */}
      {Wall && (
        <Wall
          width={width}
          height={height}
          preserveAspectRatio="xMidYMax slice"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
      )}

      {/* Floor Layer */}
      {Floor && (
        <Floor
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: width,
            zIndex: 2,
          }}
          preserveAspectRatio="xMidYMax slice"
        />
      )}

      {/* Bottom Decor Layer */}
      <View
        style={{
          position: 'absolute',
          bottom: floorHeight,
          left: 0,
          width: width,
          height: height * 0.4,
          zIndex: 4,
        }}
      >
        {Tub && (
          <Tub
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: width * 0.6,
              height: width * 0.6,
              transform: [{ scaleX: -1 }],
            }}
          />
        )}
        {Toilet && (
          <Toilet
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: width * 0.3,
              height: width * 0.3,
            }}
          />
        )}
        {ToiletPaper && (
          <ToiletPaper
            style={{
              position: 'absolute',
              bottom: (width * 0.3) / 2,
              right: width * 0.2,
              width: width * 0.1, // 6% of screen width
              height: width * 0.1, // 4% of screen height
            }}
          />
        )}
        {Trashcan && (
          <Trashcan
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: width * 0.1, // 7% of screen width
              height: width * 0.1, // 6% of screen height
            }}
          />
        )}
      </View>

      {/* Wall-mounted decor */}
      {WallMirror && (
        <WallMirror
          style={{
            position: 'absolute',
            top: height * 0.3,
            right: width / 2 - width * 0.25,
            width: width * 0.5,
            height: width * 0.5,
            zIndex: 3,
          }}
        />
      )}

      {/* Avatar */}
      {roomData.user?.avatar && (
        <AvatarStack
          avatar={roomData.user.avatar}
          size={height * .3}
          style={[global.avatar, { left: width / 2 - 75, bottom: floorHeight / 2 }]}
        />
      )}

      {/* Back Button */}
      {BackButtonIcon && (
        <TouchableOpacity
          style={[global.backButton, { bottom: 10 + insets.bottom }]}
          onPress={() => navigation.navigate('RoomSelection')}
        >
          <BackButtonIcon width={80} height={80} />
        </TouchableOpacity>
      )}

      {/* Top Bar */}
      <Pressable style={global.topBar} onPress={() => setDropdownOpen(!dropdownOpen)}>
        {!dropdownOpen && (
          <Text style={global.remainingLabel}>Remaining Tasks:</Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: progressCircleSize, width: '100%' }}>
          {/* Vertical Task List */}
          <View style={[global.verticalTaskList, { width: '50%', height: progressCircleSize }]}>
            <FlatList
              data={remainingTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={global.verticalTaskItem}
                  onPress={() =>
                    navigation.navigate('Timer', {
                      taskName: item.name,
                      roomId: roomId,
                    })
                  }
                >
                  <Text style={item.completed ? global.buttonTextCompleted : global.buttonText}>
                    {item.name}
                  </Text>
                  {item.completed ? (
                    <View style={global.taskCheckCircle}>
                      <Feather name="check" size={18} color="#fff" />
                    </View>
                  ) : (
                    <View style={{ width: 24, height: 24 }} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
            {/* Fade overlay at the bottom */}
            <LinearGradient
              colors={["rgba(94,177,204,0)", "#5EB1CC"]}
              style={[global.verticalTaskFade, { height: 32 }]}
              pointerEvents="none"
            />
          </View>
          {/* Progress Circle with White Background */}
          <View style={[global.progressCircleContainer, { width: progressCircleSize, height: progressCircleSize }]}>
            <View style={[global.progressCircleBg, { width: progressCircleSize, height: progressCircleSize, borderRadius: progressCircleSize / 2 }]} />
            <AnimatedCircularProgress
              size={progressCircleSize}
              width={progressCircleStroke}
              fill={progressPercent}
              tintColor="#f7bd50"
              backgroundColor="#ffffff"
              style={{ zIndex: 1 }}
              rotation={0}
            >
              {() => (
                <Text style={[global.progressText, { fontSize: progressCircleSize * 0.28 }]}>{progressPercent}%</Text>
              )}
            </AnimatedCircularProgress>
          </View>
        </View>
        <Text style={global.dropdownToggle}>{dropdownOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Dropdown Task List - moved after top bar for correct stacking */}
      {dropdownOpen && (
        <View
          style={[
            global.taskDropdownContainer,
            { width: width, height: height * 0.66 },
          ]}
        >
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
            <View style={{ position: 'absolute', width: progressCircleSize, height: progressCircleSize, borderRadius: '100%', backgroundColor: '#fff', zIndex: 0 }} />
            <AnimatedCircularProgress
              size={progressCircleSize}
              width={progressCircleStroke}
              fill={progressPercent}
              tintColor="#f7bd50"
              backgroundColor="#ffffff"
              style={{ zIndex: 1 }}
              rotation={0}
            >
              {() => (
                <Text style={{ fontSize: 28, color: '#F7BD50', fontWeight: 'bold' }}>{progressPercent}%</Text>
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

          <FlatList
            data={isEditMode ? localTasks : roomTasks}
            keyExtractor={(item, idx) => item.id || `new-${idx}`}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
            renderItem={({ item, index }) => (
              isEditMode ? (
                <TouchableOpacity
                  style={global.button}
                  activeOpacity={1}
                  onPress={() => {}}
                >
                  {editingTaskId === item.id ? (
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
                            setLocalTasks(prev => prev.map((t, idx2) => idx2 === index ? { ...t, name: editingTaskName } : t));
                            setEditingTaskId(null);
                            setEditingTaskName('');
                            setEditingTaskRecurrence('daily');
                            setHasUnsavedChanges(true);
                          }
                        }}
                        onBlur={() => {
                          setEditingTaskId(null);
                          setEditingTaskName('');
                          setEditingTaskRecurrence('daily');
                        }}
                      />
                      <Picker
                        selectedValue={editingTaskRecurrence}
                        style={{ flex: 1, marginVertical: 4 }}
                        onValueChange={itemValue => {
                          setEditingTaskRecurrence(itemValue);
                          setLocalTasks(prev => prev.map((t, idx2) => idx2 === index ? { ...t, recurrence: itemValue } : t));
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
                          setLocalTasks(prev => prev.map((t, idx2) => idx2 === index ? { ...t, name: editingTaskName, recurrence: editingTaskRecurrence } : t));
                          setEditingTaskId(null);
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
                      <Text style={global.buttonText}>{item.name}</Text>
                      <Text style={[global.buttonText, { marginLeft: 8, fontSize: 12 }]}>{
                        item.recurrence === 'daily' ? 'Daily' :
                        item.recurrence === 'every_2_days' ? 'Every Other Day' :
                        item.recurrence === 'weekly' ? 'Weekly' :
                        item.recurrence === 'monthly' ? 'Monthly' : ''
                      }</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => {
                          setEditingTaskId(item.id);
                          setEditingTaskName(item.name);
                          setEditingTaskRecurrence(item.recurrence || 'daily');
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
                                setLocalTasks(prev => prev.filter((_, idx2) => idx2 !== index));
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
                  style={[
                    global.button,
                    item.completed && global.buttonCompleted,
                  ]}
                  onPress={() =>
                    navigation.navigate('Timer', {
                      taskName: item.name,
                      roomId: roomId,
                    })
                  }
                >
                  <Text style={item.completed ? global.buttonTextCompleted : global.buttonText}>
                    {item.name}
                  </Text>
                  {item.completed ? (
                    <View style={global.taskCheckCircle}>
                      <Feather name="check" size={18} color="#fff" />
                    </View>
                  ) : (
                    <View style={{ width: 24, height: 24 }} />
                  )}
                </TouchableOpacity>
              )
            )}
            ListFooterComponent={isEditMode ? (
              <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {addingTask ? (
                  <>
                    <TextInput
                      value={newTaskName}
                      onChangeText={setNewTaskName}
                      style={[global.buttonText, { backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 8, flex: 1 }]}
                      placeholder="New task name"
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (newTaskName.trim()) {
                          setLocalTasks(prev => [...prev, { name: newTaskName, recurrence: 'daily' }]);
                          setAddingTask(false);
                          setNewTaskName('');
                          setHasUnsavedChanges(true);
                        }
                      }}
                      onBlur={() => { setAddingTask(false); setNewTaskName(''); }}
                    />
                    <TouchableOpacity onPress={() => {
                      if (newTaskName.trim()) {
                        setLocalTasks(prev => [...prev, { name: newTaskName, recurrence: 'daily' }]);
                        setAddingTask(false);
                        setNewTaskName('');
                        setHasUnsavedChanges(true);
                      }
                    }} style={{ marginLeft: 8 }}>
                      <Feather name="check" size={20} color="#178591" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={() => setAddingTask(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="plus-circle" size={22} color="#178591" />
                    <Text style={[global.orangeButtonText, { marginLeft: 6 }]}>Add Task</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          />

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

      {/* Bottom Filler for Safe Area */}
      <View style={[global.bottomFiller, { height: insets.bottom }]} />

      {/* Bottom Room Name Tab */}
      <View style={[global.bottomRoomBar, { bottom: insets.bottom }]}>
        <Text style={global.bottomRoomBarText}>
          {roomData.display_name || 'Bathroom'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
