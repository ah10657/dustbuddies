import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import RoomSelectionScreen from '../screens/RoomSelectionScreen';
import TimerScreen from '../screens/TimerScreen';
import ShopScreen from '../screens/ShopScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import global from '../styles/global';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <View style={global.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={user ? "Home" : "Login"} 
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        // Authenticated user screens
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Room" component={RoomScreen} />
          <Stack.Screen name="RoomSelection" component={RoomSelectionScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
        </>
      ) : (
        // Non-authenticated user screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export function BackButton({ style, label = "Back" }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={[global.button, style]} onPress={() => navigation.goBack()}>
      <Text style={global.text}>{label}</Text>
    </TouchableOpacity>
  );
}
