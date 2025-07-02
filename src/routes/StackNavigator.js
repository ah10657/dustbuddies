import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import BedroomScreen from '../screens/BedroomScreen';
import RoomSelectionScreen from '../screens/RoomSelectionScreen';
import TimerScreen from '../screens/TimerScreen';
import ShopScreen from '../screens/ShopScreen';
import BathroomScreen from '../screens/BathroomScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Bedroom" component={BedroomScreen} />
      <Stack.Screen name="RoomSelection" component={RoomSelectionScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Bathroom" component={BathroomScreen} />
    </Stack.Navigator>
  );
}