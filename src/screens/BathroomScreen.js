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

  const Background = decorMap[roomData.decor?.pref_wall];
  const Bed = decorMap[roomData.decor?.pref_bed];
  const bedSize = Math.min(width * 0.6, 600);

  const remainingTasks = roomTasks.filter(task => !task.task_complete);
  const totalTasks = roomTasks.length;
  const completedCount = roomTasks.filter(task => task.task_complete).length;
  const progressPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <View style={[global.container, { position: 'relative' }]}>
      {Background && (
        <Background
          width={width}
          height={height}
          preserveAspectRatio="xMidYMax slice"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {Bed && (
        <Bed
          style={{
            position: 'absolute',
            bottom: 120,
            left: (width - bedSize) / 2,
            width: bedSize,
            height: bedSize,
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
        <View style={global.dropdown}>
          <FlatList
            data={roomTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  global.taskItem,
                  item.task_complete && global.taskCompleted,
                ]}
                onPress={() =>
                  navigation.navigate('Timer', {
                    taskName: item.task_name,
                    roomId: roomId,
                  })
                }
              >
                <Text
                  style={[
                    global.taskText,
                    item.task_complete && global.taskTextCompleted,
                  ]}
                >
                  {item.task_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
