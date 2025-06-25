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

const GRID_UNIT = 60; // base room size (adjust as needed)

export default function RoomSelectionScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // Hardcode layout for demonstration (remove in production)
        roomList = roomList.map((room) => {
          if (room.room_type === 'main_bedroom') {
            return { ...room, layout: { x: 0, y: 0, width: 1, height: 1 } };
          } else if (room.room_type === 'bathroom') {
            return { ...room, layout: { x: 1, y: 0, width: 1, height: 1 } };
          } else if (room.room_type === 'kitchen') {
            return { ...room, layout: { x: 0, y: 1, width: 2, height: 1 } };
          }
          return room;
        });

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
  const gridRooms = rooms.filter(r => r.room_type !== 'house');

  return (
    <View style={[global.container, global.roomSelectionWrapper]}>
      <Text style={global.headerText}>Pick a room!</Text>

      <View style={[global.roomGrid, {
        width: Math.max(...gridRooms.map(r => (r.layout?.x || 0) + (r.layout?.width || 1))) * GRID_UNIT,
        height: Math.max(...gridRooms.map(r => (r.layout?.y || 0) + (r.layout?.height || 1))) * GRID_UNIT,
      }]}>
        {gridRooms.map((room) => {
          const layout = room.layout || {};
          const x = layout.x || 0;
          const y = layout.y || 0;
          const w = layout.width || 1;
          const h = layout.height || 1;

          return (
            <TouchableOpacity
              key={room.id}
              onPress={() => navigation.navigate('Room', { roomId: room.id })}
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
