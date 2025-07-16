import React from 'react';
import { signOut, updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { View, Text, TouchableOpacity, Alert, Dimensions, Modal, TextInput } from 'react-native';
import { useUser } from '../contexts/UserContext';
import AvatarStack from '../components/AvatarStack';
import global from '../styles/global';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { deleteUserAccount, getUserData } from '../models/userModel';

export default function ProfileScreen() {
  const { width, height } = Dimensions.get('window');
  const { user, userData, setUserData } = useUser();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changeError, setChangeError] = React.useState('');
  const [changeLoading, setChangeLoading] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        getUserData(user.uid).then(setUserData);
      }
    }, [user])
  );

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

  const handleDeleteAccount = async () => {
    try {
      const userId = user.uid;
      await deleteUserAccount(userId, user);
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangeProfileInfo = async () => {
    setChangeError('');
    setChangeLoading(true);
    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setChangeError('Passwords do not match.');
          setChangeLoading(false);
          return;
        }
        await updatePassword(user, newPassword);
      }
      setModalVisible(false);
      setChangeLoading(false);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password updated!');
    } catch (error) {
      setChangeError(error.message);
      setChangeLoading(false);
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
      <TouchableOpacity onPress={() => navigation.goBack()} style={[global.orangeButton,{ position: 'absolute', width: '30%',top: 40, left: 20, zIndex: 100 }]}>
        <Text style={global.orangeButtonText}>{'< Back'}</Text>
      </TouchableOpacity>
    <View style={[{backgroundColor: '#fff', borderRadius: 50, width: '80%', height: '90%', position: 'relative', alignItems: 'center'}]}>
      {/* Avatar at top center */}
      <AvatarStack avatar={userData.avatar} size={height / 3} style={{ alignSelf: 'center', marginTop: 50, marginBottom: 25 }} />
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
      <TouchableOpacity style={global.orangeButton} onPress={() => {
        setNewEmail(user.email);
        setNewPassword('');
        setConfirmPassword('');
        setChangeError('');
        setModalVisible(true);
      }}>
        <Text style={global.orangeButtonText}>Change Profile Info</Text>
      </TouchableOpacity>
      {/* Modal for changing profile info */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#178591', textAlign: 'center' }}>Edit Profile</Text>
            <TextInput
              value={user.email}
              editable={false}
              placeholder="Email"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#eee' }}
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password (optional)"
              secureTextEntry
              editable={false}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#eee' }}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry
              editable={false}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#eee' }}
            />
            <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 12 }}>Profile changes coming post development!</Text>
            {changeError ? <Text style={{ color: 'red', marginBottom: 8, textAlign: 'center' }}>{changeError}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <TouchableOpacity
                style={[global.orangeButton, { flex: 1, marginRight: 8 }]}
                onPress={handleChangeProfileInfo}
                disabled={true}
              >
                <Text style={global.orangeButtonText}>{'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[global.orangeButton, { flex: 1, backgroundColor: '#ccc', marginLeft: 8 }]}
                onPress={() => setModalVisible(false)}
                disabled={false}
              >
                <Text style={[global.orangeButtonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Logout */}
      <TouchableOpacity style={[global.orangeButton, { marginTop: 24 }]} onPress={handleLogout}>
      <Text style={global.orangeButtonText}>Logout</Text>
      </TouchableOpacity>
      {/* Delete Account */}
      <TouchableOpacity style={[global.orangeButton, { backgroundColor: '#e53935', marginTop: 8 }]} onPress={() =>
        Alert.alert(
          'Delete Account',
          'Are you sure? This cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount },
          ]
        )
      }>
        <Text style={[global.orangeButtonText, { color: '#fff' }]}>Delete Account</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
} 