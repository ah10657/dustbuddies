import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';


import { db } from '../lib/firebase';
import { decorMap } from '../lib/svgMap';
import global from '../styles/global';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const fetchFirstRoom = async () => {
      try {
        const roomCollection = collection(db, 'user', 'VuoNhIFyleph42rgqis5', 'rooms');
        const snapshot = await getDocs(roomCollection);

        if (snapshot.empty) {
          console.log('No rooms found!');
          return;
        }

        const firstDoc = snapshot.docs[0];
        const data = firstDoc.data();
        setRoomData(data);
        console.log('Loaded first room:', firstDoc.id, data);

      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchFirstRoom();
  }, []);

  if (!roomData) {
    return <ActivityIndicator size="large" />;
  }

  const Background = decorMap[roomData.decor.background];
  const House = decorMap[roomData.decor.home];

  const houseSize = Math.min(width * 0.8, 600); // scale based on screen size

  return (
    <View style={[global.container, { position: 'relative' }]}>
      {/* Background layer */}
      {Background && (
        <Background
          width={width}
          height={height}
          preserveAspectRatio="xMidYMax slice"
        />
      )}
      {House && (
        <TouchableOpacity
          onPress={() => navigation.navigate('RoomSelection')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: 40,
            left: (width - houseSize) / 2,
            width: houseSize,
            height: houseSize,
          }}
        >
          <House width={600} height={600} />
        </TouchableOpacity>
      )}
    </View>

  );
}
