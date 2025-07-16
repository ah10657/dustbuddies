import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { View, Text, TouchableOpacity, Alert, Dimensions, } from 'react-native';
import { useUser } from '../contexts/UserContext';
import AvatarStack from '../components/AvatarStack';
import global from '../styles/global';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { width, height } = Dimensions.get('window');
  const { user, userData } = useUser();
  const navigation = useNavigation();
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

  if (!user || !userData) {
    return (
      <View style={global.container}>
        <Text style={{ color: '#333', marginTop: 40 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={[global.container, { alignItems: 'center', paddingTop: 40, backgroundColor: '#5EB1CC' }]}> 
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 40, left: 20, zIndex: 100 }}>
        <Text style={{ fontSize: 18, color: '#178591', fontWeight: 'bold' }}>{'< Back'}</Text>
      </TouchableOpacity>
    <View style={[{backgroundColor: '#fff', borderRadius: 50, width: '80%', height: '80%', position: 'relative', alignItems: 'center'}]}>
      {/* Avatar at top center */}
      <AvatarStack avatar={userData.avatar} size={height / 4} style={{ alignSelf: 'center', marginBottom: 16 }} />
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#178591', textAlign: 'center' }}>{userData.display_name || user.email}</Text>
      {/* Coins */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 18, color: '#f7bd50', fontWeight: 'bold', marginRight: 8, textAlign: 'center' }}>Coins:</Text>
        <Text style={{ fontSize: 18, color: '#f7bd50', fontWeight: 'bold', textAlign: 'center' }}>{userData.coins ?? 0}</Text>
      </View>
      {/* Character Creation */}
      <TouchableOpacity style={global.orangeButton} onPress={() => navigation.navigate('CharacterCreator')}>
        <Text style={global.orangeButtonText}>Edit Character</Text>
      </TouchableOpacity>
      {/* Change Profile Info */}
      <TouchableOpacity style={global.orangeButton} onPress={() => Alert.alert('Coming Soon', 'Profile editing coming soon!')}>
        <Text style={global.orangeButtonText}>Change Profile Info</Text>
      </TouchableOpacity>
      {/* Logout */}
      <TouchableOpacity style={[global.orangeButton, { marginTop: 24 }]} onPress={handleLogout}>
      <Text style={global.orangeButtonText}>Logout</Text>
      </TouchableOpacity>
      {/* Delete Account */}
      <TouchableOpacity style={[global.orangeButton, { backgroundColor: '#e53935', marginTop: 8 }]} onPress={() => Alert.alert('Delete Account', 'Account deletion coming soon!')}>
        <Text style={[global.orangeButtonText, { color: '#fff' }]}>Delete Account</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
} 