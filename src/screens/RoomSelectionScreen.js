import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import global from '../styles/global';

const GRID_WIDTH = 4;
const GRID_HEIGHT = 5;
const GRID_SIDE_MARGIN = 8;
const { width: deviceWidth } = Dimensions.get('window');
const CELL_SIZE = Math.floor((deviceWidth - GRID_SIDE_MARGIN * 2) / GRID_WIDTH);

// Map room_type to the corresponding screen name
const ROOM_TYPE_TO_SCREEN = {
  bedroom: 'BedroomScreen',
  bathroom: 'BathroomScreen',
  kitchen: 'KitchenScreen',
  livingroom: 'LivingRoomScreen',
  laundryroom: 'LaundryRoomScreen',
  storageroom: 'StorageRoomScreen'
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);


export default function RoomSelectionScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [roomTasks, setRoomTasks] = useState({}); // { roomId: [task, ...] }

  useEffect(() => {
    const fetchRoomsAndTasks = async () => {
      try {
        const userId = getUserId();
        const snapshot = await getDocs(
          collection(db, 'user', userId, 'rooms')
        );
        let roomList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomList);

        // Fetch tasks for each room
        const tasksByRoom = {};
        for (const room of roomList) {
          const tasksSnap = await getDocs(collection(db, 'user', userId, 'rooms', room.id, 'room_tasks'));
          tasksByRoom[room.id] = tasksSnap.docs.map(doc => doc.data());
        }
        setRoomTasks(tasksByRoom);
      } catch (error) {
        console.error('Error fetching rooms or tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomsAndTasks();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  // Separate house room and grid rooms
  const houseRoom = rooms.find(r => r.room_type === 'house');
  const gridRooms = rooms.filter(r => r.room_type !== 'house' && ((r.floor ?? 0) === currentFloor));
  const numFloors = rooms.reduce((max, r) => Math.max(max, (r.floor ?? 0) + 1), 1);

  return (
    <View style={[global.container, global.roomSelectionWrapper]}>
      <Text style={global.headerText}>Pick a room!</Text>

      <View style={[global.grid, {
        width: GRID_WIDTH * CELL_SIZE,
        height: GRID_HEIGHT * CELL_SIZE,
        marginLeft: GRID_SIDE_MARGIN,
        marginRight: GRID_SIDE_MARGIN,
      }]}>
        {/* Render grid background cells for visual consistency */}
        {[...Array(GRID_HEIGHT)].map((_, row) => (
          <View key={row} style={global.gridRow}>
            {[...Array(GRID_WIDTH)].map((_, col) => (
              <View key={col} style={[global.gridCell, { width: CELL_SIZE, height: CELL_SIZE }]} />
            ))}
          </View>
        ))}
        {gridRooms.map((room) => {
          const layout = room.layout || {};
          const x = layout.x || 0;
          const y = layout.y || 0;
          const w = layout.width || 1;
          const h = layout.height || 1;

          // Get the correct screen name for this room type
          const screenName = ROOM_TYPE_TO_SCREEN[room.room_type];

          // Determine if all tasks are completed for this room
          const tasks = roomTasks[room.id] || [];
          const hasTasks = tasks.length > 0;
          const allTasksCompleted = hasTasks && tasks.every(t => t.task_complete);

          return (
            <TouchableOpacity
              key={room.id}
              onPress={() => {
                if (screenName) {
                  navigation.navigate(screenName, { roomId: room.id });
                } else {
                  alert('Unknown room type: ' + room.room_type);
                }
              }}
              style={[
                global.roomBoxMap,
                allTasksCompleted && { backgroundColor: '#F2F0EF', borderColor: '#ccc' },
                {
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: w * CELL_SIZE,
                  height: h * CELL_SIZE,
                },
              ]}
            >
              <Text style={[
                global.roomBoxMapText,
                allTasksCompleted && { color: '#949392' },
              ]}>{room.display_name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Only show floor selection if more than one floor */}
      {numFloors > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
          {[...Array(numFloors)].map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setCurrentFloor(i)} style={{ margin: 4, padding: 8, backgroundColor: currentFloor === i ? '#2196f3' : '#eee', borderRadius: 8 }}>
              <Text style={{ color: currentFloor === i ? '#fff' : '#333' }}>Floor {i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {houseRoom && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={global.orangeButton}
        >
          <Text style={global.orangeButtonText}>Now go outside and play!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
