import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // adjust path if needed

import global from '../styles/global';
import HomeScreenYard from '../assets/homeScreen/homeScreenYard.svg';
import House from '../assets/homeScreen/houses/basicHouse.svg';

export default function HomeScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const testFirestore = async () => {
      console.log('testing firestore')
      console.log('db is', db)
      const querySnapshot = await getDocs(collection(db, 'user', 'VuoNhIFyleph42rgqis5','rooms'));
      querySnapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
      });
    };
    testFirestore();
  }, []);

  return (
    
    <View style={global.container}>
      <HomeScreenYard
        width={width}
        height={height}
        preserveAspectRatio="xMidYMax slice" />
      <House
        width={300} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Room')}
      >
      </TouchableOpacity>
    </View>
  );
}
