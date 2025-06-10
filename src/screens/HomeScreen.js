import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';


import { db } from '../lib/firebase';
import { decorMap } from '../lib/svgMap';
import AvatarStack from '../components/AvatarStack';
import global from '../styles/global';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        const userDocRef = doc(db, 'user', 'VuoNhIFyleph42rgqis5');
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.log('No user found!');
          return;
        }

        const userData = userSnapshot.data();

        const roomCollection = collection(db, 'user', 'VuoNhIFyleph42rgqis5', 'rooms');
        const roomSnapshot = await getDocs(roomCollection);

        if (roomSnapshot.empty) {
          console.log('No rooms found!');
          return;
        }

        const firstRoomDoc = roomSnapshot.docs[0];
        const roomData = firstRoomDoc.data();

        setRoomData({
          ...roomData,
          user: {
            avatar: userData.avatar
          }
        });

      } catch (error) {
        console.error('Error fetching user or rooms:', error);
      }
    };

    fetchUserAndRooms();
  }, []);


  if (!roomData) {
    return <ActivityIndicator size="large" />;
  }

  const Background = decorMap[roomData.decor.background];
  const House = decorMap[roomData.decor.home];
  const Bike = decorMap[roomData.decor.bike];
  const Sun = decorMap[roomData.decor.sun];
  const houseSize = Math.min(width * 0.8, 600); // scale based on screen size


  return (
    <View style={[global.container]}>
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
            bottom: 120,
            left: (width - houseSize) / 2,
            width: houseSize,
            height: houseSize,
          }}
        >
          <House width={houseSize} height={houseSize} />
        </TouchableOpacity>
      )}
      {Bike && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Shop')}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
          }}
        >
          <Bike width={100} height={100} />
        </TouchableOpacity>
      )}
      {Sun && (
        <Sun
          style={{
            position: 'absolute',
            top: 20,
            right: 30,
            width: 150,
            height: 150,
          }}
        />
      )}

      {roomData.user?.avatar && <AvatarStack avatar={roomData.user.avatar} size={150} />}
    </View>
    

  );
}
