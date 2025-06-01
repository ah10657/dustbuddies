import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../lib/firebase';
import global from '../styles/global';

export default function RoomSelectionScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'user', 'VuoNhIFyleph42rgqis5', 'rooms'));

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
    <View style={global.container}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Select a Room</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={global.roomBox}
            onPress={() => navigation.navigate('Room', { roomId: item.id })}
          >
            <Text style={global.roomText}>{item.room_name || 'Unnamed Room'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
