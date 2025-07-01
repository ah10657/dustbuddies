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
import { getHouseRoom, getAllRooms } from '../models/roomsModel';
import AvatarStack from '../components/AvatarStack';
import AnimatedSun from '../components/AnimatedSun';
import global from '../styles/global';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Animated from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const { user, userData } = useUser();
  const [roomData, setRoomData] = useState(null);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roomsWithTasks, setRoomsWithTasks] = useState([]);

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

        // Fetch all rooms and their tasks
        const allRooms = await getAllRooms(user.uid);
        // Group tasks by room
        const roomMap = {};
        taskData.tasks.forEach(task => {
          if (!roomMap[task.roomId]) roomMap[task.roomId] = [];
          roomMap[task.roomId].push(task);
        });
        const roomsWithTasks = allRooms.map(room => ({
          id: room.id,
          name: room.display_name,
          tasks: roomMap[room.id] || [],
        }));
        setRoomsWithTasks(roomsWithTasks);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, [user, userData]);

  const handleLogout = async () => {
    console.log('Logout button pressed!');
    try {
      await signOut(auth);
      console.log('Sign out successful');
      // UserContext will handle redirect
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 12,
          borderRadius: 20,
          zIndex: 1000,
          minWidth: 60,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: '#333', fontSize: 14, fontWeight: 'bold' }}>Logout</Text>
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
      <TouchableOpacity
        onPress={() => setDropdownOpen(!dropdownOpen)}
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          top: height * 0.05,
          right: width * 0.2,
          width: 100,
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <AnimatedSun progress={completionPercent} size={200} />
      </TouchableOpacity>

      {/* Dropdown Task List (All Rooms) as Full-Screen Overlay */}
      {dropdownOpen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: width,
            height: height,
            backgroundColor: '#E7A120', // semi-transparent overlay
            zIndex: 100,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            paddingBottom: 32,
            paddingTop: 0,
            justifyContent: 'flex-start',
          }}
        >
          {/* Progress Bar at the top */}
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 16 }}>
            <View style={{ position: 'absolute', width: 195, height: 195, borderRadius: 100, backgroundColor: '#fff', zIndex: 0 }} />
            <AnimatedCircularProgress
              size={200}
              width={25}
              fill={completionPercent}
              tintColor="#F7BD50"
              backgroundColor="#f7e6b0"
              rotation={0}
              style={{ zIndex: 1 }}
            >
              {() => (
                <Text style={{ fontSize: 50, color: '#F7BD50', fontWeight: 'bold' }}>{completionPercent}%</Text>
              )}
            </AnimatedCircularProgress>
            <Text style={{ color: '#F7BD50', fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>All Tasks</Text>
          </View>
          {/* Scrollable list of rooms and tasks */}
          <View style={{ flex: 1, width: '100%' }}>
            <Animated.ScrollView
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {roomsWithTasks.map((room) => (
                <View key={room.id} style={{ marginBottom: 18 }}>
                  <View style={{
                    backgroundColor: '#F7BD50',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    padding: 10,
                    alignSelf: 'flex-start',
                    marginBottom: -10,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>{room.name}</Text>
                    
                  </View>
                  <View style={{ backgroundColor: '#F7BD50', borderRadius: 12, padding: 8 }}>
                    {room.tasks.length === 0 ? (
                      <Text style={{ color: '#E7A120', fontStyle: 'italic' }}>No tasks</Text>
                    ) : (
                      room.tasks.map((task) => (
                        <TouchableOpacity
                          key={task.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: task.completed ? '#F2F0EF' : '#fff',
                            borderRadius: 8,
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            marginBottom: 6,
                            borderWidth: 1,
                            borderColor: task.completed ? '#f7bd50' : '#eee',
                            shadowColor: '#E7A120',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.18,
                            shadowRadius: 8,
                            elevation: 8,
                          }}
                          onPress={() => {
                            setDropdownOpen(false);
                            navigation.navigate('Timer', {
                              taskName: task.name,
                              roomId: room.id,
                            });
                          }}
                        >
                          <Text style={{ color: task.completed ? '#949392' : '#E7A120', fontWeight: task.completed ? 'bold' : 'bold', fontSize: 15 }}>
                            {task.name}
                          </Text>
                          {task.completed ? (
                            <View style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: '#E7A120',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Feather name="check" size={18} color="#fff" />
                            </View>
                          ) : (
                            <View style={{ width: 24, height: 24 }} />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
          </View>
          {/* Close area at the bottom for overlay effect */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: width,
              height: 40,
              backgroundColor: 'transparent',
              zIndex: 101,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
            onPress={() => setDropdownOpen(false)}
            activeOpacity={0.7}
          >
            <Feather name="chevron-up" size={32} color="#fff" style={{ textAlign: 'center' }} />
          </TouchableOpacity>
        </View>
      )}

      {roomData.user?.avatar && <AvatarStack avatar={roomData.user.avatar} size={150} />}
    </View>
  );
}
