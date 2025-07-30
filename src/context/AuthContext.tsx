'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  userData: any
  loading: boolean
  isFirebaseReady: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isFirebaseReady: false,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFirebaseReady] = useState(() => isFirebaseConfigured())

  useEffect(() => {
    // If Firebase is not configured, just set loading to false and return
    if (!isFirebaseReady) {
      console.warn('Firebase not configured - AuthProvider running in mock mode');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser)
        if (currentUser) {
          try {
            const ref = doc(db, 'users', currentUser.uid)
            const snap = await getDoc(ref)
            setUserData(snap.exists() ? snap.data() : null)
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUserData(null);
          }
        } else {
          setUserData(null)
        }
        setLoading(false)
      })

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
    }
  }, [isFirebaseReady])

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
