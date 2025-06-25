import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserData } from '../models/userModel';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const data = await getUserData(firebaseUser.uid);
          if (!data) {
            setError('User data not found. Please log in again.');
            await signOut(auth);
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }
          setUserData(data);
          setError(null);
        } catch (error) {
          setError('Error loading user data. Please log in again.');
          await signOut(auth);
          setUser(null);
          setUserData(null);
        }
      } else {
        setUserData(null);
        setError(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ user, userData, loading, setUserData, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
