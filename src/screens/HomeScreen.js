import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { decorMap } from '../lib/svgMap';
import { getGlobalTaskCompletion } from '../models/tasksModel';
import { getHouseRoom } from '../models/roomsModel';
import AvatarStack from '../components/AvatarStack';
import AnimatedSun from '../components/AnimatedSun';
import global from '../styles/global';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const { user, userData } = useUser();
  const [roomData, setRoomData] = useState(null);
  const [completionPercent, setCompletionPercent] = useState(0);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (!user) return;

        // Use the new getHouseRoom function to find the correct house room
        const houseRoomData = await getHouseRoom(user.uid);

        if (!houseRoomData) {
          console.log('No house room found!');
          return;
        }

        setRoomData({
          ...houseRoomData,
          user: {
            avatar: userData?.avatar,
          },
        });

        // Use the new tasksModel function for better task management with auto-reset
        const taskData = await getGlobalTaskCompletion(user.uid);
        setCompletionPercent(taskData.completionPercent);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, [user, userData]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation will be handled automatically by UserContext
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (!roomData) {
    return <ActivityIndicator size="large" />;
  }

  const Background = decorMap[roomData.decor.background];
  const House = decorMap[roomData.decor.home];
  const Bike = decorMap[roomData.decor.bike];
  const houseSize = Math.min(width * 0.8, 600);

  return (
    <View style={[global.container]}>
      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          position: 'absolute',
          top: 50,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 10,
          borderRadius: 20,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: '#333', fontSize: 14 }}>Logout</Text>
      </TouchableOpacity>

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
