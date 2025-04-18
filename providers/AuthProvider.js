'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../src/lib/firebase'; // ✅ Correct path to the initialized Firebase app

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app); // ✅ Properly initialized auth

    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();

          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            setUser(firebaseUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
