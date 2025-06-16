import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { db } from '../lib/firebase';
import { getUserId } from '../lib/getUserId';
import { decorMap } from '../lib/svgMap';
import AvatarStack from '../components/AvatarStack';
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
        const roomCollection = collection(db, 'user', userId, 'rooms');
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
            avatar: userData.avatar,
          },
        });

        // Calculate global task completion
        let totalTasks = 0;
        let completedTasks = 0;

        for (const roomDoc of roomSnapshot.docs) {
          const tasksSnap = await getDocs(collection(roomDoc.ref, 'room_tasks'));
          totalTasks += tasksSnap.size;
          completedTasks += tasksSnap.docs.filter(doc => doc.data().task_complete).length;
        }

        const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        setCompletionPercent(percent);
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

      {/* Sun with progress overlay */}
     {Sun && (
      <View
        style={{
          position: 'absolute',
          top: height * 0.05, // 5% from top
          right: width * 0.08, // 8% from right
          width: 100,
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sun width={100} height={100} />

        <View
          style={{
            position: 'absolute',
            width: 76,
            height: 76,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatedCircularProgress
            size={76}
            width={8}
            fill={completionPercent}
            tintColor="#f7bd50"
            backgroundColor="#ffffff"
            rotation={0}
          >
            {() => (
              <Text style={{ color: '#f7bd50', fontWeight: 'bold', fontSize: 14 }}>
                {completionPercent}%
              </Text>
            )}
          </AnimatedCircularProgress>
        </View>
      </View>
    )}


      {roomData.user?.avatar && <AvatarStack avatar={roomData.user.avatar} size={150} />}
    </View>
  );
}
