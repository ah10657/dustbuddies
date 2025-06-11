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
import global from '../styles/global';

const GRID_UNIT = 60; // base room size (adjust as needed)

export default function RoomSelectionScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, 'user', 'VuoNhIFyleph42rgqis5', 'rooms')
        );
        const roomList = snapshot.docs.map((doc) => ({
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

  return (
    <View style={[global.container, global.roomSelectionWrapper]}>
      <Text style={global.headerText}>Pick a room!</Text>

      <View style={[global.roomGrid, {
        width: Math.max(...rooms.map(r => (r.layout?.x || 0) + (r.layout?.width || 1))) * GRID_UNIT,
        height: Math.max(...rooms.map(r => (r.layout?.y || 0) + (r.layout?.height || 1))) * GRID_UNIT,
      }]}>
        {rooms.map((room) => {
          const layout = room.layout || {};
          const x = layout.x || 0;
          const y = layout.y || 0;
          const w = layout.width || 1;
          const h = layout.height || 1;

          const isHome = room.room_type === 'house';

          return (
            <TouchableOpacity
              key={room.id}
              onPress={() =>
                isHome
                  ? navigation.navigate('Home')
                  : navigation.navigate('Room', { roomId: room.id })
              }
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
    </View>
  );
}
