import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';

const ROOM_TYPES = [
  'Kitchen', 'Living Room', 'Bathroom', 'Closet',
  'Laundry Room', 'Bedroom'
];

export default function BlueprintSetupScreen({ navigation }) {
  const [roomCounts, setRoomCounts] = useState(
    ROOM_TYPES.reduce((acc, type) => ({ ...acc, [type]: 1 }), {})
  );

  const increment = (type) => setRoomCounts({ ...roomCounts, [type]: roomCounts[type] + 1 });
  const decrement = (type) => setRoomCounts({ ...roomCounts, [type]: Math.max(0, roomCounts[type] - 1) });

  const handleDone = () => {
    // Generate room objects
    const rooms = [];
    Object.entries(roomCounts).forEach(([type, count]) => {
      if (count > 0) {
        for (let i = 1; i <= count; i++) {
          rooms.push({
            display_name: type + (count > 1 ? ` ${i}` : ''),
            room_name: type.replace(/\s/g, '').toLowerCase() + (count > 1 ? i : ''),
            room_type: type.replace(/\s/g, '').toLowerCase(),
            layout: { x: 0, y: 0, width: 1, height: 1 }, // default, will be set in next screen
          });
        }
      }
    });
    navigation.navigate('BlueprintGrid', { rooms });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create your home!</Text>
      <View style={styles.form}>
        {ROOM_TYPES.map(type => (
          <View key={type} style={styles.row}>
            <Text style={styles.label}>{type}</Text>
            <TouchableOpacity onPress={() => decrement(type)} style={styles.button}><Text>-</Text></TouchableOpacity>
            <Text style={styles.count}>{roomCounts[type]}</Text>
            <TouchableOpacity onPress={() => increment(type)} style={styles.button}><Text>+</Text></TouchableOpacity>
          </View>
        ))}
      </View>
      <Button title="I'm done!" onPress={handleDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#6EC1E4' },
  header: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 24 },
  form: { backgroundColor: '#A7D8F5', borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { flex: 1, color: '#333' },
  button: { backgroundColor: '#fff', padding: 8, borderRadius: 8, marginHorizontal: 8 },
  count: { width: 24, textAlign: 'center' },
});
