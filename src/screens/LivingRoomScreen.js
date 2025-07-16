import React, { useState, useCallback, useRef } from 'react';
import { Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc, deleteDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { decorMap } from '../lib/svgMap';
import { getRoomTasks } from '../models/tasksModel';
import AvatarStack from '../components/AvatarStack';
import BackButtonIcon from '../assets/images/house/doorIcon.svg';
import global from '../styles/global';

export default function LivingRoomScreen({ route }) {
  const navigation = useNavigation();
  const { roomId } = route.params;

  const [roomData, setRoomData] = useState(null);
  const [roomTasks, setRoomTasks] = useState([]);
  const [remainingTasks, setRemainingTasks] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const progressCircleSize = width * 0.4;
  const progressCircleStroke = progressCircleSize * 0.12;
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

  const Wall = decorMap['livingRoomWall'];
  const Floor = decorMap[roomData.decor?.pref_floor];
  const Couch = decorMap[roomData.decor?.pref_couch];
  const WallDecor = decorMap[roomData.decor?.pref_wall_decor];
  const Side = decorMap[roomData.decor?.pref_side];
  const Window = decorMap[roomData.decor?.pref_window];
  const floorSvgAspect = 122.67 / 142.42; // Use the same as BedroomScreen or update to match living room floor SVG viewBox
  const floorHeight = width * floorSvgAspect;

  const enterEditMode = () => {
    setLocalTasks(roomTasks.map(task => ({ ...task })));
    originalTasksRef.current = roomTasks.map(task => ({ ...task }));
    setIsEditMode(true);
    setHasUnsavedChanges(false);
  };
  const exitEditMode = () => {
    setIsEditMode(false);
    setLocalTasks([]);
    setEditingTaskId(null);
    setEditingTaskName('');
    setEditingTaskRecurrence('daily');
    setHasUnsavedChanges(false);
  };
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
  const saveAllEdits = async () => {
    setIsSaving(true);
    const userId = getUserId();
    const orig = originalTasksRef.current;
    const deleted = orig.filter(ot => !localTasks.some(lt => lt.id === ot.id));
    const added = localTasks.filter(lt => !lt.id);
    const updated = localTasks.filter(lt => {
      const origTask = orig.find(ot => ot.id === lt.id);
      return origTask && (lt.name !== origTask.name || lt.recurrence !== origTask.recurrence);
    });
    for (const task of deleted) {
      await deleteDoc(doc(db, 'user', userId, 'rooms', roomId, 'room_tasks', task.id));
    }
    for (const task of added) {
      await addDoc(collection(db, 'user', userId, 'rooms', roomId, 'room_tasks'), {
        task_name: task.name,
        recurrence: task.recurrence,
        task_complete: false,
        last_completed_at: '',
      });
    }
    for (const task of updated) {
      await updateDoc(doc(db, 'user', userId, 'rooms', roomId, 'room_tasks', task.id), {
        task_name: task.name,
        recurrence: task.recurrence,
      });
    }
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
      {Wall && (
        <Wall
          width={width}
          height={height}
          preserveAspectRatio="xMidYMax slice"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        />
      )}
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
      {Couch && (
        <Couch
          style={{
            position: 'absolute',
            bottom: floorHeight / 2,
            left: width * 0.1,
            width: width * 0.8,
            height: width * 0.8,
            zIndex: 3,
          }}
        />
      )}
      {WallDecor && (
        <WallDecor
          style={{
            position: 'absolute',
            top: 80,
            left: width * 0.5 - 60,
            width: 120,
            height: 60,
          }}
        />
      )}
      {Side && (
        <Side
          style={{
            position: 'absolute',
            bottom: floorHeight / 2,
            left: 0,
            width: width * 0.3,
            height: width * 0.3,
            zIndex: 4,
          }}
        />
      )}
      {Window && (
        <Window
          style={{
            position: 'absolute',
            top: 80,
            right: width * 0.1,
            width: 80,
            height: 80,
          }}
        />
      )}
      {roomData.user?.avatar && (
        <AvatarStack
          avatar={roomData.user.avatar}
          size={height * .3}
          style={[global.avatar, { left: width / 2 - 75, bottom: floorHeight / 2 }]}
        />
      )}

      {/* Bottom Filler for Safe Area */}
      <View style={[global.bottomFiller, { height: insets.bottom }]} />

      {/* Bottom Room Name Tab */}
      <View style={[global.bottomRoomBar, { bottom: insets.bottom }]}>
        <Text style={global.bottomRoomBarText}>
          {roomData.display_name || 'Living Room'}
        </Text>
      </View>

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

      {/* Dropdown Task List */}
      {dropdownOpen && (
        <View
          style={[
            global.taskDropdownContainer,
            { height: height * 0.66 },
          ]}
        >
          {/* Progress Bar and Room Header */}
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
            <View style={{ position: 'absolute', width: progressCircleSize, height: progressCircleSize, borderRadius: progressCircleSize / 2, backgroundColor: '#fff', zIndex: 0 }} />
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
                <Text style={{ fontSize: progressCircleSize * 0.28, color: '#F7BD50', fontWeight: 'bold' }}>{progressPercent}%</Text>
              )}
            </AnimatedCircularProgress>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>{roomData.name}</Text>
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
                      <Text style={[global.buttonText, { marginLeft: 8, fontSize: 12 }]}> {
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
    </SafeAreaView>
  );
} 