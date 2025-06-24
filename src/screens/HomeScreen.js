import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { decorMap } from '../lib/svgMap';
import { getGlobalTaskCompletion } from '../models/tasksModel';
import { getHouseRoom } from '../models/roomsModel';
import AvatarStack from '../components/AvatarStack';
import AnimatedSun from '../components/AnimatedSun';
import global from '../styles/global';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const [roomData, setRoomData] = useState(null);
  const [completionPercent, setCompletionPercent] = useState(0);

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        const userId = getUserId();
        const userDocRef = doc(db, 'user', userId);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.log('No user found!');
          return;
        }

        const userData = userSnapshot.data();
        
        // Use the new getHouseRoom function to find the correct house room
        const houseRoomData = await getHouseRoom(userId);

        if (!houseRoomData) {
          console.log('No house room found!');
          return;
        }

        setRoomData({
          ...houseRoomData,
          user: {
            avatar: userData.avatar,
          },
        });

        // Use the new tasksModel function for better task management with auto-reset
        const taskData = await getGlobalTaskCompletion(userId);
        setCompletionPercent(taskData.completionPercent);
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
  const houseSize = Math.min(width * 0.8, 600);

  return (
    <View style={[global.container]}>
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
            bottom: (height - houseSize) / 3,
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
            bottom: width * 0.3,
            left: 20,
          }}
        >
          <Bike width={100} height={100} />
        </TouchableOpacity>
      )}

      {/* Sun with progress overlay replaced by ProgressRing */}
      <View
        style={{
          position: 'absolute',
          top: height * 0.05,
          right: width * 0.2,
          width: 100,
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatedSun progress={completionPercent} size={200} />
      </View>

      {roomData.user?.avatar && <AvatarStack avatar={roomData.user.avatar} size={150} />}
    </View>
  );
}
