import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OpeningScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello...</Text>

      <TouchableOpacity
        style={[styles.button, styles.firstTimeButton]}
        onPress={() => navigation.navigate('BlueprintSetup')}
      >
        <Text style={styles.firstTimeText}>First time?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.returningButton]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.returningText}>I'm back!</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OpeningScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5AB4C5', // Matches the teal-blue from your screenshot
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 40,
  },
  button: {
    width: 200,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  firstTimeButton: {
    backgroundColor: '#4B4B4B',
  },
  returningButton: {
    backgroundColor: '#fff',
  },
  firstTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  returningText: {
    color: '#5AB4C5',
    fontWeight: 'bold',
  },
});
