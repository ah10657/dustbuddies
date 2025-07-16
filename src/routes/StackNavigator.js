import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import BedroomScreen from '../screens/BedroomScreen';
import RoomSelectionScreen from '../screens/RoomSelectionScreen';
import TimerScreen from '../screens/TimerScreen';
import ShopScreen from '../screens/ShopScreen';
import BathroomScreen from '../screens/BathroomScreen';
import LivingRoomScreen from '../screens/LivingRoomScreen';
import KitchenScreen from '../screens/KitchenScreen';
import LaundryRoomScreen from '../screens/LaundryRoomScreen';
import StorageRoomScreen from '../screens/StorageRoomScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import BlueprintSetupScreen from '../screens/BlueprintSetupScreen';
import BlueprintGridScreen from '../screens/BlueprintGridScreen';
import CharacterCreatorScreen from '../screens/CharacterCreatorScreen';
import ProfileScreen from '../screens/ProfileScreen';
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
      initialRouteName={user ? "Home" : "Welcome"} 
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        // Authenticated user screens
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="BedroomScreen" component={BedroomScreen} />
          <Stack.Screen name="BathroomScreen" component={BathroomScreen} />
          <Stack.Screen name="KitchenScreen" component={KitchenScreen} />
          <Stack.Screen name="LivingRoomScreen" component={LivingRoomScreen} />
          <Stack.Screen name="LaundryRoomScreen" component={LaundryRoomScreen} />
          <Stack.Screen name="StorageRoomScreen" component={StorageRoomScreen} />
          <Stack.Screen name="RoomSelection" component={RoomSelectionScreen} />
          <Stack.Screen name="Timer" component={TimerScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="CharacterCreator" component={CharacterCreatorScreen} />
        </>
      ) : (
        // Non-authenticated user screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="BlueprintSetup" component={BlueprintSetupScreen} />
          <Stack.Screen name="BlueprintGrid" component={BlueprintGridScreen} />
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
