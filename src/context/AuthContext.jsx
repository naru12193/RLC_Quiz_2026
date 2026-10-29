import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  ADMIN_EMAIL,
  db,
  doc,
  getDoc
} from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [allowAnyEmailForTesting, setAllowAnyEmailForTesting] = useState(false);

  // Check test mode flag from config once
  useEffect(() => {
    async function checkTestMode() {
      try {
        const configSnap = await getDoc(doc(db, 'config', 'quiz_settings'));
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data.allowAnyEmailForTesting !== undefined) {
            setAllowAnyEmailForTesting(Boolean(data.allowAnyEmailForTesting));
          }
        }
      } catch (err) {
        console.warn('Could not fetch quiz_settings for test mode flag:', err.message);
      }
    }
    checkTestMode();
  }, []);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const isEmailAllowed = (email, allowTestMode = allowAnyEmailForTesting) => {
    if (!email) return false;
    const lower = email.toLowerCase();
    // Admin is always allowed
    if (lower === ADMIN_EMAIL.toLowerCase()) return true;
    // Participants with @gmail.com
    if (lower.endsWith('@gmail.com')) return true;
    // If Admin enabled test mode
    if (allowTestMode) return true;
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const email = currentUser.email || '';
        // Re-check test mode config from db in case it was toggled
        let testMode = allowAnyEmailForTesting;
        try {
          const configSnap = await getDoc(doc(db, 'config', 'quiz_settings'));
          if (configSnap.exists()) {
            testMode = Boolean(configSnap.data().allowAnyEmailForTesting);
            setAllowAnyEmailForTesting(testMode);
          }
        } catch {
          // ignore
        }

        if (isEmailAllowed(email, testMode)) {
          setUser(currentUser);
          setAuthError(null);
        } else {
          // Strictly block non-@gmail.com accounts
          await firebaseSignOut(auth);
          setUser(null);
          setAuthError('Access restricted to @gmail.com domain accounts. Please sign in with your Gmail account.');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [allowAnyEmailForTesting]);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';

      // Check test mode flag
      let testMode = allowAnyEmailForTesting;
      try {
        const configSnap = await getDoc(doc(db, 'config', 'quiz_settings'));
        if (configSnap.exists()) {
          testMode = Boolean(configSnap.data().allowAnyEmailForTesting);
          setAllowAnyEmailForTesting(testMode);
        }
      } catch {
        // ignore
      }

      if (!isEmailAllowed(email, testMode)) {
        await firebaseSignOut(auth);
        setUser(null);
        setAuthError('Access restricted to @gmail.com domain accounts.');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'Failed to sign in with Google');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAuthError(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        clearAuthError,
        loginWithGoogle,
        logout,
        allowAnyEmailForTesting,
        setAllowAnyEmailForTesting
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
