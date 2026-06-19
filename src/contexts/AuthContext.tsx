import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  }, []);

  /** Call this after saving profile changes to sync context with Firestore. */
  const refreshProfile = useCallback(async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  }, [currentUser, fetchProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch custom user profile from Firestore in the background
        fetchProfile(user);
      } else {
        setUserProfile(null);
      }

      // Immediately stop the loading spinner so the user can enter the app
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
