import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/routes/StackNavigator';
import { UserProvider, useUser } from './src/contexts/UserContext';
import { Alert } from 'react-native';

function AppWithErrorHandler() {
  const { error } = useUser();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      // Optionally, you could reset the error here if you add a setError function to context
    }
  }, [error]);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppWithErrorHandler />
    </UserProvider>
  );
}

