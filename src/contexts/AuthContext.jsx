// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
// 1. IMPORT BOTH auth AND db
import { auth, db } from '../services/firebase'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // 2. 'db' IS NOW DEFINED AND WILL WORK
          const adminRef = doc(db, "admins", currentUser.uid); 
          const adminSnap = await getDoc(adminRef);
          setIsAdmin(adminSnap.exists() && adminSnap.data()?.role === 'admin');
        } catch (err) {
          console.error("Admin check failed:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []); // Empty dependency array is correct

  const handleSignOut = async () => {
    try { 
      await signOut(auth);
      window.location.href = '/';
    } catch (error) { 
      console.error("Sign out error:", error);
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthReady,
    handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}