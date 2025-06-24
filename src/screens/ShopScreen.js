import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import global from '../styles/global';

export default function ShopScreen({ navigation }) {
  return (
    <View style={[global.container, global.center]}>
      <Text style={global.shopMessage}>Not Open Yet! See you soon! 🛍️</Text>
      <TouchableOpacity
        style={global.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={global.shopButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
