import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import RoomScreen from '../screens/RoomScreen';
import RoomSelectionScreen from '../screens/RoomSelectionScreen';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Room" component={RoomScreen} />
      <Stack.Screen name="RoomSelection" component={RoomSelectionScreen} />
    </Stack.Navigator>
  );
}
export function BackButton({ style, label = "Back" }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.goBack()}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    alignSelf: 'flex-start',
    margin: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
