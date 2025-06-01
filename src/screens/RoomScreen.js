import React, { useState, useEffect } from 'react';
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
import { db } from '../lib/firebase';
import { decorMap } from '../lib/svgMap';
import global from '../styles/global';

export default function RoomScreen({ route }) {
  const { roomId } = route.params;
  const [roomData, setRoomData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, 'user', 'VuoNhIFyleph42rgqis5', 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
          setRoomData(roomSnap.data());
          console.log('Loaded room:', roomId, roomSnap.data());
        } else {
          console.log('Room not found!');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    if (roomId) fetchRoom();
  }, [roomId]);

  if (!roomData) {
    return <ActivityIndicator size="large" />;
  }

  const Background = decorMap[roomData.decor.pref_wall]; // replace into sections such as wall, floor, bed, etc
  const tasks = roomData.room_tasks || [
    'Vacuum the carpet',
    'Dust the shelves',
    'Clean the windows',
  ];

  const toggleTask = (task) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [task]: !prev[task],
    }));
  };

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

      <Pressable
        style={global.dropdownHeader}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={global.dropdownHeaderText}>
          {dropdownOpen ? 'Hide Tasks ▲' : 'Show Tasks ▼'}
        </Text>
      </Pressable>

      {dropdownOpen && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                global.taskItem,
                completedTasks[item] && global.taskCompleted,
              ]}
              onPress={() => toggleTask(item)}
            >
              <Text
                style={[
                  global.taskText,
                  completedTasks[item] && global.taskTextCompleted,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
