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
const GRID_UNIT = 60;

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

  useEffect(() => {
    const fetchRooms = async () => {
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
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  // Separate house room and grid rooms
  const houseRoom = rooms.find(r => r.room_type === 'house');
  const gridRooms = rooms.filter(r => r.room_type !== 'house' && ((r.floor ?? 0) === currentFloor));

  return (
    <View style={[global.container, global.roomSelectionWrapper]}>
      <Text style={global.headerText}>Pick a room!</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
        {[...Array(rooms.reduce((max, r) => Math.max(max, (r.floor ?? 0) + 1), 1))].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setCurrentFloor(i)} style={{ margin: 4, padding: 8, backgroundColor: currentFloor === i ? '#2196f3' : '#eee', borderRadius: 8 }}>
            <Text style={{ color: currentFloor === i ? '#fff' : '#333' }}>Floor {i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[global.grid, {
        width: GRID_WIDTH * GRID_UNIT,
        height: GRID_HEIGHT * GRID_UNIT,
      }]}>
        {/* Render grid background cells for visual consistency */}
        {[...Array(GRID_HEIGHT)].map((_, row) => (
          <View key={row} style={global.gridRow}>
            {[...Array(GRID_WIDTH)].map((_, col) => (
              <View key={col} style={[global.gridCell, { width: GRID_UNIT, height: GRID_UNIT }]} />
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
                {
                  left: x * GRID_UNIT,
                  top: y * GRID_UNIT,
                  width: w * GRID_UNIT,
                  height: h * GRID_UNIT,
                },
              ]}
            >
              <Text style={global.roomBoxMapText}>{room.display_name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {houseRoom && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: 30, padding: 16, backgroundColor: '#E0F7FA', borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, color: '#00796B', fontWeight: 'bold' }}>Now go outside and play!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
