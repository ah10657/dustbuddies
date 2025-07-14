import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Feather } from '@expo/vector-icons';

import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { decorMap } from '../lib/svgMap';
import { getRoomTasks } from '../models/tasksModel';
import AvatarStack from '../components/AvatarStack';
import BackButtonIcon from '../assets/images/house/house_thumbnail.svg';
import global from '../styles/global';

export default function StorageRoomScreen({ route }) {
  const navigation = useNavigation();
  const { roomId } = route.params;

  const [roomData, setRoomData] = useState(null);
  const [roomTasks, setRoomTasks] = useState([]);
  const [remainingTasks, setRemainingTasks] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { width, height } = Dimensions.get('window');

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

  const Wall = decorMap[roomData.decor?.pref_wall];
  const Floor = decorMap[roomData.decor?.pref_floor];
  const floorHeight = height * 0.2;

  return (
    <View style={[global.container, { position: 'relative' }]}> 
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
            height: floorHeight,
            zIndex: 1,
          }}
        />
      )}
      {roomData.user?.avatar && <AvatarStack avatar={roomData.user.avatar} size={150} />}

      {BackButtonIcon && (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: -5, left: -5 }}
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

        <View style={dropdownOpen ? global.expandedHeader : global.previewRow}>
          {!dropdownOpen && (
            <FlatList
              data={remainingTasks}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    global.button,
                    item.completed && global.buttonCompleted,
                    { backgroundColor: '#fff', minWidth: 90, marginRight: 8 },
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
              )}
              contentContainerStyle={global.taskChipContainer}
            />
          )}

          <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: 65, height: 65, borderRadius: 35, backgroundColor: '#fff', zIndex: 0 }} />
            <AnimatedCircularProgress
              size={70}
              width={7}
              fill={progressPercent}
              tintColor="#f7bd50"
              backgroundColor="#ffffff"
              style={{ zIndex: 1 }}
              rotation={0}
            >
              {
                () => (
                  <Text style={global.progressText}>{progressPercent}%</Text>
                )
              }
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
            {
              width: width,
              height: height * 0.66,
              backgroundColor: '#5EB1CC',
              position: 'absolute',
              bottom: 0,
              left: 0,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              zIndex: 100,
              paddingBottom: 0,
              justifyContent: 'flex-start',
            },
          ]}
        >
          {/* Progress Bar and Room Header */}
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
            <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', zIndex: 0 }} />
            <AnimatedCircularProgress
              size={90}
              width={10}
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
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>{roomData.name}</Text>
          </View>
          {/* Task List */}
          <FlatList
            data={roomTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={[global.taskRoomBox, { backgroundColor: '#5EB1CC' }]}> {/* blue group box */}
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
              </View>
            )}
          />
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
            onPress={() => setDropdownOpen(false)}
            activeOpacity={0.7}
          >
            <Feather name="chevron-up" size={32} color="#fff" style={{ textAlign: 'center' }} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 