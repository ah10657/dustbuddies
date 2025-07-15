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
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Feather from 'react-native-vector-icons/Feather';

import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { decorMap } from '../lib/svgMap';
import AvatarStack from '../components/AvatarStack';
import BackButtonIcon from '../assets/images/house/house_thumbnail.svg';
import global from '../styles/global';

export default function BedroomScreen({ route }) {
  const navigation = useNavigation();
  const { roomId } = route.params;

  const [roomData, setRoomData] = useState(null);
  const [roomTasks, setRoomTasks] = useState([]);
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

            const taskSnap = await getDocs(collection(roomRef, 'room_tasks'));
            const tasks = taskSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));

            setRoomData({
              ...roomData,
              user: {
                avatar: userData.avatar,
              },
            });
            setRoomTasks(tasks);
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
  const bedSize = Math.min(width * 0.6, 600);
  const floorHeight = height * 0.2;

  const remainingTasks = roomTasks.filter(task => !task.task_complete);
  const totalTasks = roomTasks.length;
  const completedCount = roomTasks.filter(task => task.task_complete).length;
  const progressPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

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
            height: height,
          }}
        />
      )}
      {Tub && (
        <Tub
          style={{
            position: 'absolute',
            bottom: height * 0.2 + 120,
            left: width * 0.1,
            width: width * 0.5,
            height: 120,
            zIndex: 2,
          }}
        />
      )}
      {Toilet && (
        <Toilet
          style={{
            position: 'absolute',
            bottom: height * 0.2 + 120,
            right: width * 0.1,
            width: 60,
            height: 60,
            zIndex: 3,
          }}
        />
      )}
      {ToiletPaper && (
        <ToiletPaper
          style={{
            position: 'absolute',
            bottom: height * 0.2 + 120,
            right: width * 0.1 + 70,
            width: 30,
            height: 30,
            zIndex: 4,
          }}
        />
      )}
      {Trashcan && (
        <Trashcan
          style={{
            position: 'absolute',
            bottom: height * 0.2 + 120,
            right: width * 0.1 + 110,
            width: 30,
            height: 30,
            zIndex: 4,
          }}
        />
      )}
      {WallMirror && (
        <WallMirror
          style={{
            position: 'absolute',
            top: 80,
            left: width / 2 - 60,
            width: 120,
            height: 60,
            zIndex: 5,
          }}
        />
      )}
      {roomData.user?.avatar && (
        <AvatarStack
          avatar={roomData.user.avatar}
          size={150}
          style={{
            left: width / 2 - 75,
            bottom: height * 0.2 + 10,
            zIndex: 10,
          }}
        />
      )}

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
                <View style={global.taskChip}>
                  <Text style={global.taskChipText}>{item.task_name}</Text>
                </View>
              )}
              contentContainerStyle={global.taskChipContainer}
            />
          )}

          <AnimatedCircularProgress
            size={70}
            width={7}
            fill={progressPercent}
            tintColor="#f7bd50"
            backgroundColor="#ffffff"
            style={{ marginTop: 10 }}
          >
            {
              () => (
                <Text style={global.progressText}>{progressPercent}%</Text>
              )
            }
          </AnimatedCircularProgress>
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
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>{roomData.display_name || 'Bathroom'}</Text>
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
                    item.task_complete && global.buttonCompleted,
                  ]}
                  onPress={() =>
                    navigation.navigate('Timer', {
                      taskName: item.task_name,
                      roomId: roomId,
                    })
                  }
                >
                  <Text style={item.task_complete ? global.buttonTextCompleted : global.buttonText}>
                    {item.task_name}
                  </Text>
                  {item.task_complete ? (
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
