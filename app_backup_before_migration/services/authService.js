'use client';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function loginUser(email, password) {
  try {
    // Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get JWT token from Firebase user
    const idToken = await user.getIdToken();
    
    // Send the token to your backend to verify and get session
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: idToken,
        uid: user.uid,
        email: user.email
      }),
    });
    
    if (!response.ok) {
      throw new Error('Backend authentication failed');
    }
    
    // Get the session data which includes your JWT
    const session = await response.json();
    
    // Store the JWT in localStorage or a secure cookie
    localStorage.setItem('jwt', session.token);
    
    return { user, session };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(email, password, name, role) {
  try {
    // Firebase registration
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Register with backend
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        uid: user.uid,
        name,
        email,
        role 
      }),
    });
    
    if (!response.ok) {
      // If backend registration fails, delete the Firebase user
      await user.delete();
      throw new Error('Backend registration failed');
    }
    
    const session = await response.json();
    localStorage.setItem('jwt', session.token);
    
    return { user, session };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    // Firebase logout
    await firebaseSignOut(auth);
    
    // Backend logout
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    
    // Clear stored JWT
    localStorage.removeItem('jwt');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export function useAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      callback(user);
    } else {
      // User is signed out
      callback(null);
    }
  });
}
