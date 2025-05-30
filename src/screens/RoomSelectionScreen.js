import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // adjust path if needed

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    const testFirestore = async () => {
      const querySnapshot = await getDocs(collection(db, 'rooms'));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
      });
    };
    testFirestore();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.roomBox}
        onPress={() => navigation.navigate('Room')}
      >
        <Text style={styles.roomText}>Living Room</Text>
      </TouchableOpacity>
    </View>
  );
}
